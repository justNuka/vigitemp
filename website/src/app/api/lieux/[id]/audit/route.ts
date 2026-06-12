import { NextRequest } from "next/server"
import { prismaMesure } from "@/lib/prisma"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"
import { parseDbDateTime, serializeDbDateTime } from "@/lib/date-display"

const FALLBACK_CODE_LABELS: Record<string, string> = {
	AACT: "Association d'un module d'alarme %1",
	ACQ: "Test d'acquittement d'alarme, Vigi106",
	ACT: "Activer la surveillance",
	ACTU: "Reactivation de l'utilisateur %1",
	AJE: "Ajoute evenement manuel",
	ARC: "Archivage des données %1 %2",
	AS: "Arret de la surveillance",
	AT: "Activation de la surveillance telephonique %1",
	CA: "Demarrage d'un ajustage pour la sonde",
	CC: "Changement sur un element %1",
	CDA: "Changement d'etat du datalogger %1",
	CF: "Changement de frequence %1",
	CONNEXION: "Connexion de l'utilisateur %1",
	CR: "Changement de retard d'alarme %1",
	CS: "Changement de sonde %1",
	DECONNEXION: "Deconnexion de l'utilisateur %1",
	DES: "Desactiver la surveillance",
	DS: "Demarrage de la surveillance",
	DT: "Desactivation de la surveillance telephonique %1",
	ET: "Demarrage d'un etalonnage pour la sonde",
	FERMSURV: "Fermeture de la fenètre de surveillance",
	MDP: "Changement fiche utilisateur %1",
	PS: "Le gestionnaire de port serie virtuel relancé",
	SACT: "Suppression du module d'alarme associée %1",
	TC: "Test de connexion de la sonde",
	TEL: "Systeme",
	UT: "",
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

			const logs = await prismaMesure.tm_journal.findMany({
				where: {
					OR: [
						{ Id_Lieu: lieuId },
						{ Code_Journal: "ACQ", Commentaire: { contains: `#${lieuId}` } },
					],
					...(Object.keys(dateFilter).length > 0 ? { Date_Heure_Journal: dateFilter } : {}),
				},
				take: limit,
				orderBy: { Date_Heure_Journal: "desc" },
				select: {
					Id_Journal: true,
					Date_Heure_Journal: true,
					Code_Journal: true,
					Commentaire: true,
					Commentaire_Utilisateur: true,
					Nom_Utilisateur: true,
					Profil_Utilisateur: true,
				},
			})

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

				return {
					id: log.Id_Journal,
					timestamp: serializeDbDateTime(log.Date_Heure_Journal) ?? null,
					code,
					label,
					commentaire: log.Commentaire ?? null,
					commentaireUtilisateur: log.Commentaire_Utilisateur ?? null,
					user: log.Nom_Utilisateur ?? null,
					profile: log.Profil_Utilisateur ?? null,
					detailsSummary: [log.Commentaire_Utilisateur, log.Commentaire].filter(Boolean).join(" | ") || null,
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
