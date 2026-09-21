import { NextRequest } from "next/server"
import { prisma, prismaMesure } from "@/lib/prisma"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { formatMonitoringAuditSummary } from "@/lib/audit/monitoring-audit"
import { log } from "@/lib/logger"
import { parseDbDateTime, serializeDbDateTime } from "@/lib/date-display"

function extractAlarmId(comment: string | null | undefined): number | null {
	if (!comment) return null

	for (const chunk of comment.split("|")) {
		const trimmed = chunk.trim()
		if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) continue

		try {
			const parsed = JSON.parse(trimmed) as { alarmId?: unknown }
			const value = typeof parsed.alarmId === "number" ? parsed.alarmId : Number(parsed.alarmId)
			if (Number.isFinite(value) && value > 0) {
				return value
			}
		} catch {
			// Ignore malformed fragments.
		}
	}

	return null
}

const FALLBACK_CODE_LABELS: Record<string, string> = {
	AACT: "Association d'un module d'alarme",
	ACQ: "Acquittement d'alarme",
	ACT: "Activation de la surveillance",
	ACTU: "Réactivation de l'utilisateur",
	AIM: "Analyse d'impact des mesures",
	AJE: "Ajout d'un événement manuel",
	ARC: "Archivage des données",
	AS: "Arrêt de la surveillance",
	AT: "Activation de la surveillance téléphonique",
	CA: "Démarrage d'un ajustage pour la sonde",
	CC: "Modification",
	CDA: "Changement d'état du datalogger",
	CF: "Changement de fréquence",
	CONNEXION: "Connexion de l'utilisateur",
	CR: "Changement de retard d'alarme",
	CS: "Changement de sonde",
	DECONNEXION: "Déconnexion de l'utilisateur",
	DES: "Désactivation de la surveillance",
	DS: "Démarrage de la surveillance",
	DT: "Désactivation de la surveillance téléphonique",
	ET: "Démarrage d'un étalonnage pour la sonde",
	ETAP: "Étalonnage appliqué",
	FERMSURV: "Fermeture de la surveillance",
	GRPH: "Ouverture d'un graphique",
	IMP: "Import de données",
	MAIL: "Email d'alarme envoyé",
	MDP: "Modification du mot de passe",
	PLAN: "Modification du planning",
	PS: "Redémarrage du gestionnaire de port série virtuel",
	SACT: "Suppression du module d'alarme associé",
	TC: "Test de connexion de la sonde",
	TEL: "Système",
	UT: "Événement système",
	VLOG: "Action VigiLog",
	ALARM_RESOLVED: "Fin d'alarme",
}

export const GET = withAuthLogging(
	async (req: NextRequest, { user }, { params }: { params: Promise<{ id: string }> }) => {
		try {
			const { id: idParam } = await params
			const lieuId = Number.parseInt(idParam, 10)

			if (!Number.isFinite(lieuId) || lieuId <= 0) {
				return apiError(400, "invalid_id", "ID lieu requis")
			}

			const searchParams = req.nextUrl.searchParams
			const limitParam = Number.parseInt(searchParams.get("limit") || "150", 10)
			const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 500) : 150
			const dateFromParam = searchParams.get("dateFrom")
			const dateToParam = searchParams.get("dateTo")
			const parsedFrom = dateFromParam ? parseDbDateTime(dateFromParam) : null
			const parsedTo = dateToParam ? parseDbDateTime(dateToParam) : null
			const hasValidFrom = parsedFrom !== null && !Number.isNaN(parsedFrom.getTime())
			const hasValidTo = parsedTo !== null && !Number.isNaN(parsedTo.getTime())

			const dateFilter: { gte?: Date; lte?: Date } = {}
			if (hasValidFrom && parsedFrom) dateFilter.gte = parsedFrom
			if (hasValidTo && parsedTo) dateFilter.lte = parsedTo

			const rawLogs = await prismaMesure.tm_journal.findMany({
				where: {
					OR: [
						{ Id_Lieu: lieuId },
						{ Code_Journal: "ACQ" },
					],
					...(Object.keys(dateFilter).length > 0 ? { Date_Heure_Journal: dateFilter } : {}),
				},
				orderBy: { Date_Heure_Journal: "desc" },
				select: {
					Id_Journal: true,
					Id_Lieu: true,
					Date_Heure_Journal: true,
					Code_Journal: true,
					Commentaire: true,
					Commentaire_Utilisateur: true,
					Nom_Utilisateur: true,
					Profil_Utilisateur: true,
				},
			})

			const alarmIds = Array.from(
				new Set(
					rawLogs
						.map((entry) => extractAlarmId(entry.Commentaire))
						.filter((value): value is number => typeof value === "number" && value > 0),
				),
			)

			const histoLieuByAlarmId = new Map<number, number>()
			if (alarmIds.length > 0) {
				const histos = await prisma.t_alarme_histo.findMany({
					where: { Id_Alarme: { in: alarmIds } },
					select: { Id_Alarme: true, Id_Lieu: true },
				})

				for (const histo of histos) {
					if (
						typeof histo.Id_Lieu === "number" &&
						histo.Id_Lieu > 0 &&
						!histoLieuByAlarmId.has(histo.Id_Alarme)
					) {
						histoLieuByAlarmId.set(histo.Id_Alarme, histo.Id_Lieu)
					}
				}
			}

			const logs = rawLogs
				.filter((entry) => {
					if (entry.Id_Lieu === lieuId) return true
					if ((entry.Code_Journal || "").trim() !== "ACQ") return false

					const alarmId = extractAlarmId(entry.Commentaire)
					if (!alarmId) return false

					return histoLieuByAlarmId.get(alarmId) === lieuId
				})
				.slice(0, limit)

			const codes = Array.from(
				new Set(
					logs
						.map((log) => log.Code_Journal || "")
						.map((code) => code.trim())
						.filter((code) => code.length > 0),
				),
			)

			const codeRows = codes.length
				? await prismaMesure.tm_journal_code.findMany({
						where: { Code_Journal: { in: codes } },
						select: { Code_Journal: true, Commentaire: true },
					})
				: []

			const codeMap = new Map<string, string>()
			for (const row of codeRows) {
				if (row.Code_Journal) {
					codeMap.set(row.Code_Journal, row.Commentaire ?? "")
				}
			}

			const formatted = logs.map((log) => {
				const code = log.Code_Journal?.trim() || ""
				const label = codeMap.get(code) ?? FALLBACK_CODE_LABELS[code] ?? ""
				const summarizedDetails = formatMonitoringAuditSummary(log.Commentaire)

				return {
					id: log.Id_Journal,
					timestamp: serializeDbDateTime(log.Date_Heure_Journal) ?? null,
					code,
					label,
					commentaire: log.Commentaire ?? null,
					commentaireUtilisateur: log.Commentaire_Utilisateur ?? null,
					user: log.Nom_Utilisateur ?? null,
					profile: log.Profil_Utilisateur ?? null,
					detailsSummary:
						summarizedDetails !== "-"
							? summarizedDetails
							: log.Commentaire_Utilisateur ?? null,
					lieuId,
				}
			})

			return apiOk({
				user: {
					id: user.userId,
					username: user.username,
					profile: user.profile,
				},
				logs: formatted,
			})
		} catch (error) {
			log.error("lieux/audit", "audit_fetch_error", { error: error });
			return apiError(500, "audit_fetch_failed", "Erreur lors du chargement de l'audit")
		}
	},
)
