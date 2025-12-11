Contexte général

Application Vigitemp en 3 parties :

Agent Windows → notifs locales.

Serveur C# → récupère les mesures de sondes, gère les alarmes, communique avec les agents.

Website Next.js → interface d’admin, avec ses propres routes /api/... vers MySQL.

La licence doit être gérée côté serveur C#, le reste (agent, website) consomme juste l’info.

Objectif : empêcher qu’un client ou admin système puisse modifier la licence, débloquer des modules ou augmenter les limites sans passer par MC2.

Choix d’architecture licence

Avec gpt nous avons comparé 3 méthodes :

Stocker la licence chiffrée dans la BDD (table Licence).

Ne rien stocker en BDD et utiliser uniquement un fichier licence.lic sur le serveur.

Stocker uniquement le hash SHA256 du fichier en BDD.

Méthode retenue : n°2 – fichier .lic uniquement

Fichier licence chiffré (AES) + signé (RSA) stocké dans un dossier système sur le serveur :
C:\ProgramData\Vigitemp\licence.lic

Pas de données de licence dans la base de données.

La source de vérité est le fichier .lic côté serveur C#.

Fonctionnement attendu

Côté serveur C# :

Lire le fichier licence.lic au démarrage.

Le déchiffrer (AES) et vérifier la signature (RSA clé publique embarquée).

Parser le contenu (format type INI/JSON, incluant : Edition, MaxSimultaneousUsers, EnabledModules, ValidFrom, ValidTo, etc.).

Construire un LicenceInfo / LicenceContext en mémoire :

public class LicenceInfo
{
    public string Edition { get; set; }
    public int MaxSimultaneousUsers { get; set; }
    public HashSet<string> EnabledModules { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
    public bool IsValidNow => DateTime.UtcNow >= ValidFrom && DateTime.UtcNow <= ValidTo;
}


Fournir un service ILicenceService :

public interface ILicenceService
{
    LicenceInfo? Current { get; }
    void LoadFromFile(string path);
    bool HasModule(string module);
}


Ajouter un endpoint HTTP sur le serveur Vigitemp :

GET /licence/current
→ 200 + JSON { edition, maxSimultaneousUsers, enabledModules[], validFrom, validTo }
→ 404 si licence absente ou invalide


Optionnel : ajouter des attributes/middlewares [RequireModule("X")] pour protéger certaines routes du serveur en fonction de la licence.

Côté Website Next.js :

Ajouter une route API /api/licence qui joue le rôle de proxy vers http://<serveur_vigitemp>/licence/current :

Lit l’URL de base du serveur C# depuis process.env.VIGITEMP_SERVER_URL.

Appelle le serveur C#.

Retourne la réponse JSON au front.

Côté React, créer un LicenceContext :

Appelle /api/licence au chargement.

Stocke licence, loading, error.

Expose une fonction hasModule(module: string).

Utiliser ce contexte dans le dashboard pour :

Afficher l’édition, la date d’expiration, les modules actifs.

Masquer les menus / boutons si hasModule("X") === false.

Sécurité :

Toute la cryptographie (AES + RSA) est côté serveur C#.

Next.js ne manipule que des informations “déjà validées”.

Même si quelqu’un modifie le code du front ou manipule la BDD, il ne peut pas changer la licence : seul le fichier .lic signé est valide.

Ce que je veux que tu fasses (Copilot) :

Côté C# :

Générer/compléter la classe LicenceInfo et l’interface ILicenceService.

Implémenter LicenceService avec :

LoadFromFile(path)

déchiffrement du fichier (AES)

vérification de la signature RSA (clé publique au format PEM dans la config)

parsing du contenu INI ou JSON

Ajouter l’endpoint GET /licence/current dans le projet serveur existant (minimal API ou contrôleur).

(Optionnel) Proposer un attribut [RequireModule] pour protéger des endpoints du serveur.

Côté Next.js :

Créer la route src/app/api/licence/route.ts qui proxy vers le serveur C#.

Créer le LicenceContext React + hook useLicence().

Mettre à jour la sidebar/dashboard pour :

afficher les infos de licence.

masquer certains liens si le module n’est pas présent.

Optionnel plus tard :

Ajouter une route POST /licence/upload côté C# pour remplacer le fichier licence.lic (upgrade licence) pour que le serveur valide que ca a bien été fait avec la clé interne MC2

Ajouter un écran dans le dashboard Next.js pour uploader un nouveau fichier .lic.