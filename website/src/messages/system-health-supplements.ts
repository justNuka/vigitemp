import type { MessageCatalog } from "./supplements"

export const frSystemHealthSupplements: MessageCatalog = {
  adminDashboard: {
    health: {
      title: "Santé système",
      description: "Disponibilité du Web, du serveur et des bases VigiSensys.",
      helper: "{ok}/{total} service(s) disponible(s)",
      helper_unavailable: "État détaillé indisponible pour le moment.",
      open: "Ouvrir la santé système",
      status: {
        loading: "Vérification…",
        ok: "Opérationnel",
        degraded: "Dégradé",
        error: "Incident",
        unknown: "À vérifier",
      },
    },
  },
  systemHealth: {
    title: "Santé du système",
    description: "État des composants VigiSensys, versions, sauvegardes et informations système utiles au diagnostic.",
    actions: {
      refresh: "Actualiser",
    },
    status: {
      loading: "Vérification…",
      ok: "Opérationnel",
      degraded: "Dégradé",
      error: "Incident",
      unknown: "À vérifier",
    },
    service_status: {
      ok: "OK",
      error: "Erreur",
      unknown: "Inconnu",
    },
    summary: {
      title: "État global",
      available: "{ok}/{total} service(s) contrôlé(s) répondent correctement.",
      unavailable: "Le détail de santé n'est pas disponible pour le moment.",
      checked_at: "Dernière vérification",
    },
    services: {
      title: "Services et bases",
      description: "Les contrôles sont effectués côté serveur sans exposer les identifiants, mots de passe ou chaînes de connexion.",
      web: {
        title: "Application Web",
        description: "Processus Next.js qui sert l'interface et les API.",
      },
      server: {
        title: "Serveur d'interrogation",
        description: "Disponibilité TCP du service Windows et version exposée par son API locale.",
      },
      db_main: {
        title: "Base principale",
        description: "Connexion à la base de configuration et de données applicatives.",
      },
      db_measure: {
        title: "Base mesures",
        description: "Connexion à la base utilisée pour les mesures et historiques.",
      },
      db_chat: {
        title: "Base conversation",
        description: "Base optionnelle du module de conversation lorsqu'elle est configurée.",
      },
    },
    labels: {
      version: "Version",
      provider: "Moteur",
      configuration: "Configuration",
      configured: "Configuré",
      not_configured: "Non configuré",
    },
    runtime: {
      title: "Informations système",
      description: "Informations non sensibles du serveur Web utiles au diagnostic.",
      hostname: "Nom de machine",
      os: "Système",
      architecture: "Architecture",
      node: "Node.js",
      web_uptime: "Uptime Web",
      system_uptime: "Uptime système",
      duration: {
        days: "{days} j {hours} h",
        hours: "{hours} h {minutes} min",
        minutes: "{minutes} min",
        seconds: "{seconds} s",
      },
      provider: {
        mysql: "MySQL",
        sqlserver: "SQL Server",
      },
    },
    backup: {
      title: "Sauvegardes",
      description: "Dernière exécution connue et état de la rotation locale.",
      last_run: "Dernière exécution",
      archives: "Archives détectées",
      archive_count: "{count} archive(s) dans {slots} emplacement(s)",
      storage_path: "Dossier de sauvegarde",
      log_path: "Journal de sauvegarde",
      status: {
        success: "Réussie",
        in_progress: "En cours",
        failed: "Échec",
        none: "Aucune exécution détectée",
        unavailable: "Indisponible",
      },
    },
  },
}

export const enSystemHealthSupplements: MessageCatalog = {
  adminDashboard: {
    health: {
      title: "System health",
      description: "Availability of the VigiSensys Web app, server and databases.",
      helper: "{ok}/{total} service(s) available",
      helper_unavailable: "Detailed status is currently unavailable.",
      open: "Open system health",
      status: {
        loading: "Checking…",
        ok: "Operational",
        degraded: "Degraded",
        error: "Incident",
        unknown: "Needs checking",
      },
    },
  },
  systemHealth: {
    title: "System health",
    description: "Status of VigiSensys components, versions, backups and useful diagnostic system information.",
    actions: {
      refresh: "Refresh",
    },
    status: {
      loading: "Checking…",
      ok: "Operational",
      degraded: "Degraded",
      error: "Incident",
      unknown: "Needs checking",
    },
    service_status: {
      ok: "OK",
      error: "Error",
      unknown: "Unknown",
    },
    summary: {
      title: "Overall status",
      available: "{ok}/{total} checked service(s) are responding correctly.",
      unavailable: "Detailed health information is currently unavailable.",
      checked_at: "Last check",
    },
    services: {
      title: "Services and databases",
      description: "Checks run server-side without exposing credentials, passwords or connection strings.",
      web: {
        title: "Web application",
        description: "Next.js process serving the UI and APIs.",
      },
      server: {
        title: "Interrogation server",
        description: "TCP availability of the Windows service and version exposed by its local API.",
      },
      db_main: {
        title: "Main database",
        description: "Connection to the configuration and application data database.",
      },
      db_measure: {
        title: "Measurements database",
        description: "Connection to the database used for measurements and history.",
      },
      db_chat: {
        title: "Conversation database",
        description: "Optional conversation module database when configured.",
      },
    },
    labels: {
      version: "Version",
      provider: "Provider",
      configuration: "Configuration",
      configured: "Configured",
      not_configured: "Not configured",
    },
    runtime: {
      title: "System information",
      description: "Non-sensitive Web server information useful for diagnostics.",
      hostname: "Machine name",
      os: "System",
      architecture: "Architecture",
      node: "Node.js",
      web_uptime: "Web uptime",
      system_uptime: "System uptime",
      duration: {
        days: "{days} d {hours} h",
        hours: "{hours} h {minutes} min",
        minutes: "{minutes} min",
        seconds: "{seconds} s",
      },
      provider: {
        mysql: "MySQL",
        sqlserver: "SQL Server",
      },
    },
    backup: {
      title: "Backups",
      description: "Latest known run and local rotation status.",
      last_run: "Latest run",
      archives: "Detected archives",
      archive_count: "{count} archive(s) across {slots} slot(s)",
      storage_path: "Backup folder",
      log_path: "Backup log",
      status: {
        success: "Successful",
        in_progress: "In progress",
        failed: "Failed",
        none: "No run detected",
        unavailable: "Unavailable",
      },
    },
  },
}

export function systemHealthSupplementForLocale(locale: string): MessageCatalog {
  return locale === "fr" ? frSystemHealthSupplements : enSystemHealthSupplements
}
