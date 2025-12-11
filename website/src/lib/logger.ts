import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import fs from "fs";
import { writeAuditToDatabase } from "./audit-db";

// Créer le dossier logs s'il n'existe pas
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Créer le dossier du mois courant
const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
const monthDir = path.join(logsDir, currentMonth);
if (!fs.existsSync(monthDir)) {
  fs.mkdirSync(monthDir, { recursive: true });
}

// Format personnalisé pour les logs
const customFormat = winston.format.printf(({ timestamp, level, label, message, ...metadata }) => {
  let msg = `[${timestamp}] [${level.toUpperCase()}] [${label || "APP"}] ${message}`;
  
  // Ajouter les métadonnées si présentes
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  return msg;
});

// Configuration du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss.SSS",
    }),
    winston.format.errors({ stack: true }),
    customFormat
  ),
  transports: [
    // Un seul fichier par jour, organisé par mois (logs/YYYY-MM/vigitemp-YYYY-MM-DD.log)
    new DailyRotateFile({
      filename: path.join(monthDir, "vigitemp-%DATE%.log"),
      datePattern: "YYYY-MM-DD", // Format du %DATE%: 2025-12-10
      maxSize: "10m", // Rotation à 10MB
      maxFiles: "365d", // Garder 1 an
      zippedArchive: true, // Compresser les anciens logs
      createSymlink: false,
    }),
  ],
});

// Ajouter console en développement
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
          format: "HH:mm:ss.SSS",
        }),
        customFormat
      ),
    })
  );
}

// Définir le niveau "audit" personnalisé
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    audit: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    error: "red",
    warn: "yellow",
    audit: "magenta",
    info: "green",
    http: "cyan",
    debug: "blue",
  },
};

winston.addColors(customLevels.colors);
logger.levels = customLevels.levels;

// Fonctions utilitaires avec contexte
export const log = {
  // Logs généraux
  info: (label: string, message: string, meta?: Record<string, any>) =>
    logger.info(message, { label, ...meta }),
  
  warn: (label: string, message: string, meta?: Record<string, any>) =>
    logger.warn(message, { label, ...meta }),
  
  error: (label: string, message: string, meta?: Record<string, any>) =>
    logger.error(message, { label, ...meta }),
  
  debug: (label: string, message: string, meta?: Record<string, any>) =>
    logger.debug(message, { label, ...meta }),

  // Logs d'audit (actions critiques)
  audit: (action: string, details: {
    user?: string;
    userId?: number;
    ip?: string;
    resource?: string;
    resourceId?: number | string;
    changes?: Record<string, any>;
    success?: boolean;
    reason?: string;
    userProfile?: string;
    lieuId?: number;
  }) => {
    const message = `${action} - ${details.success !== false ? "SUCCESS" : "FAILED"}`;
    logger.log("audit", message, { label: "AUDIT", ...details });
    
    // Écrire aussi dans la base de données mesure (ts_journal)
    const commentaire = [
      details.resource,
      details.resourceId ? `#${details.resourceId}` : null,
      details.changes ? JSON.stringify(details.changes) : null,
      details.ip ? `IP: ${details.ip}` : null,
    ].filter(Boolean).join(" | ");

    writeAuditToDatabase({
      codeJournal: action,
      username: details.user,
      userProfile: details.userProfile,
      lieuId: details.lieuId,
      commentaire,
      commentaireUtilisateur: details.reason,
    }).catch(err => {
      // Log silencieux en cas d'erreur BDD
      console.error("[AUDIT DB] Failed to write:", err.message);
    });
  },

  // Logs de requêtes HTTP
  http: (method: string, path: string, details: {
    user?: string;
    userId?: number;
    ip?: string;
    duration?: number;
    statusCode?: number;
    error?: string;
  }) => {
    const message = `${method} ${path} - ${details.statusCode || "pending"}`;
    logger.log("http", message, { label: "HTTP", ...details });
  },

  // Logs d'authentification
  auth: {
    // CONNEXION/DECONNEXION sont définis dans connection
    // On garde login/logout pour compatibilité mais redirige vers les bons codes
    login: (username: string, ip: string, success: boolean, reason?: string) => {
      if (success) {
        log.audit("CONNEXION", { user: username, ip, success: true });
      } else {
        log.audit("CONNEXION", { user: username, ip, success: false, reason });
      }
    },
    
    logout: (username: string, userId: number, ip: string, reason?: string) =>
      log.audit("DECONNEXION", {
        user: username,
        userId,
        ip,
        reason,
      }),
    
    // MDP - Changement de mot de passe
    passwordChange: (username: string, userId: number, ip: string, forced = false) =>
      log.audit("MDP", {
        user: username,
        userId,
        ip,
        changes: { forced },
      }),
  },

  // Logs d'alarmes et surveillance (basé sur les codes audit de la table)
  alarm: {
    // ACQ - Acquitter les alarmes
    acknowledge: (lieuName: string, lieuId: number, user: string, userId: number, ip: string, comment?: string) =>
      log.audit("ACQ", {
        user,
        userId,
        ip,
        resource: `Lieu: ${lieuName}`,
        resourceId: lieuId,
        reason: comment,
      }),
    
    // DES - Désactiver la surveillance
    disable: (lieuName: string, lieuId: number, user: string, userId: number, ip: string, reason?: string) =>
      log.audit("DES", {
        user,
        userId,
        ip,
        resource: `Lieu: ${lieuName}`,
        resourceId: lieuId,
        reason,
      }),
    
    // ACT - Activer la surveillance
    enable: (lieuName: string, lieuId: number, user: string, userId: number, ip: string) =>
      log.audit("ACT", {
        user,
        userId,
        ip,
        resource: `Lieu: ${lieuName}`,
        resourceId: lieuId,
      }),
    
    // AS - Arrêt de la surveillance
    stop: (lieuName: string, lieuId: number, user: string, userId: number, ip: string, reason?: string) =>
      log.audit("AS", {
        user,
        userId,
        ip,
        resource: `Lieu: ${lieuName}`,
        resourceId: lieuId,
        reason,
      }),
    
    // DS - Démarrage de la surveillance
    start: (lieuName: string, lieuId: number, user: string, userId: number, ip: string) =>
      log.audit("DS", {
        user,
        userId,
        ip,
        resource: `Lieu: ${lieuName}`,
        resourceId: lieuId,
      }),
  },

  // Logs de données (utilisation de codes génériques pour CRUD)
  data: {
    // CC - Changement sur un élément (création)
    create: (resource: string, resourceId: number | string, user: string, userId: number, ip: string, data?: Record<string, any>) =>
      log.audit("CC", {
        user,
        userId,
        ip,
        resource: `${resource} (Création)`,
        resourceId,
        changes: { action: "create", ...data },
      }),
    
    // CC - Changement sur un élément (modification)
    update: (resource: string, resourceId: number | string, user: string, userId: number, ip: string, changes?: Record<string, any>) =>
      log.audit("CC", {
        user,
        userId,
        ip,
        resource: `${resource} (Modification)`,
        resourceId,
        changes: { action: "update", ...changes },
      }),
    
    // CC - Changement sur un élément (suppression/archive)
    delete: (resource: string, resourceId: number | string, user: string, userId: number, ip: string, reason?: string) =>
      log.audit("CC", {
        user,
        userId,
        ip,
        resource: `${resource} (Suppression)`,
        resourceId,
        changes: { action: "delete" },
        reason,
      }),
    
    // ARC - Export de données
    export: (resource: string, user: string, userId: number, ip: string, format?: string, filters?: Record<string, any>) =>
      log.audit("ARC", {
        user,
        userId,
        ip,
        resource: `${resource} (Export)`,
        changes: { format, filters },
      }),
  },

  // Logs de configuration
  config: {
    // CC - Changement sur un élément (générique)
    change: (setting: string, user: string, userId: number, ip: string, oldValue: any, newValue: any) =>
      log.audit("CC", {
        user,
        userId,
        ip,
        resource: setting,
        changes: { from: oldValue, to: newValue },
      }),
    
    // CF - Changement de fréquence
    changeFrequency: (resource: string, resourceId: number, user: string, userId: number, ip: string, oldFreq: any, newFreq: any) =>
      log.audit("CF", {
        user,
        userId,
        ip,
        resource,
        resourceId,
        changes: { from: oldFreq, to: newFreq },
      }),
    
    // CR - Changement de retard d'alarme
    changeAlarmDelay: (resource: string, resourceId: number, user: string, userId: number, ip: string, oldDelay: any, newDelay: any) =>
      log.audit("CR", {
        user,
        userId,
        ip,
        resource,
        resourceId,
        changes: { from: oldDelay, to: newDelay },
      }),
    
    // CS - Changement de sonde
    changeSensor: (lieuName: string, lieuId: number, user: string, userId: number, ip: string, oldSensor: string, newSensor: string) =>
      log.audit("CS", {
        user,
        userId,
        ip,
        resource: `Lieu: ${lieuName}`,
        resourceId: lieuId,
        changes: { from: oldSensor, to: newSensor },
      }),
  },

  // Logs de connexion utilisateur
  connection: {
    // CONNEXION - Connexion de l'utilisateur
    userConnected: (username: string, userId: number, ip: string) =>
      log.audit("CONNEXION", {
        user: username,
        userId,
        ip,
        success: true,
      }),
    
    // DECONNEXION - Déconnexion de l'utilisateur
    userDisconnected: (username: string, userId: number, ip: string, reason?: string) =>
      log.audit("DECONNEXION", {
        user: username,
        userId,
        ip,
        reason,
      }),
  },

  // Logs d'événements et calibrage
  events: {
    // AJE - Ajoute événement manuel
    addManualEvent: (description: string, user: string, userId: number, ip: string, eventData?: Record<string, any>) =>
      log.audit("AJE", {
        user,
        userId,
        ip,
        resource: "Événement manuel",
        changes: { description, ...eventData },
      }),
    
    // CA - Démarrage d'un calibrage pour la sonde
    startCalibration: (sensorName: string, sensorId: number, user: string, userId: number, ip: string) =>
      log.audit("CA", {
        user,
        userId,
        ip,
        resource: `Sonde: ${sensorName}`,
        resourceId: sensorId,
      }),
    
    // ET - Démarrage d'un étalonnage pour la sonde
    startCalibrationCheck: (sensorName: string, sensorId: number, user: string, userId: number, ip: string) =>
      log.audit("ET", {
        user,
        userId,
        ip,
        resource: `Sonde: ${sensorName}`,
        resourceId: sensorId,
      }),
    
    // TC - Test de connexion de la sonde
    testConnection: (sensorName: string, sensorId: number, user: string, userId: number, ip: string, success: boolean) =>
      log.audit("TC", {
        user,
        userId,
        ip,
        resource: `Sonde: ${sensorName}`,
        resourceId: sensorId,
        success,
      }),
  },

  // Logs de modifications diverses
  modifications: {
    // MDP - Changement fiche utilisateur (mot de passe)
    changeUserPassword: (targetUsername: string, targetUserId: number, user: string, userId: number, ip: string) =>
      log.audit("MDP", {
        user,
        userId,
        ip,
        resource: `Utilisateur: ${targetUsername}`,
        resourceId: targetUserId,
      }),
    
    // ARC - Archivage des données
    archiveData: (resource: string, user: string, userId: number, ip: string, dateRange?: string) =>
      log.audit("ARC", {
        user,
        userId,
        ip,
        resource,
        changes: { dateRange },
      }),
  },
};

export default logger;
