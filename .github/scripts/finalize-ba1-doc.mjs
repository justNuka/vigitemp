import fs from "node:fs"

const path = "docs/architecture/better-auth-migration.md"
let text = fs.readFileSync(path, "utf8")

const heading = "#### État BA-1 — 03/09/2026"
if (text.includes(heading)) {
  console.log("BA-1 status already documented")
  process.exit(0)
}

text = text.replace(
  "> **Statut : plan d'architecture — non implémenté.**",
  "> **Statut : migration en cours — BA-1 validé techniquement, bascule production non engagée.**",
)

const criterion = "Critère Go/No-Go : Better Auth doit fonctionner de façon identique sur les deux providers et permettre le mapping d'un utilisateur existant."
const ba2Heading = "### Lot BA-2 — schéma versionné + provisioning/migration"
const marker = `${criterion}\n\n${ba2Heading}`

if (!text.includes(marker)) {
  throw new Error("BA-1 documentation marker not found")
}

const status = `#### État BA-1 — 03/09/2026

Statut : **Go technique validé — PR #88 en revue**.

Branche : \`feature/better-auth-foundation-poc\`.

Implémentation réalisée :

- Better Auth \`1.7.2\`, version stable \`latest\` revérifiée au démarrage effectif du PoC ;
- handler temporaire \`/api/auth-v2/[...all]\`, désactivé par défaut avec \`BETTER_AUTH_POC_ENABLED\` ;
- tables isolées \`t_auth_poc_user\`, \`t_auth_poc_session\`, \`t_auth_poc_account\` et \`t_auth_poc_verification\` ;
- plugin Username sans normalisation afin de préserver les logins historiques ;
- bcrypt pour le provider credentials ;
- mapping explicite \`vigisensysUserId\` vers un \`t_utilisateur\` existant et non archivé ;
- session serveur d'une durée absolue de 24 h, sans sliding refresh ni cookie cache ;
- révocation serveur validée au logout ;
- couche DB PoC compatible MySQL via \`mysql2\` et MSSQL via Kysely \`MssqlDialect\` / \`tedious\` / \`tarn\` ;
- test d'intégration destructif protégé par un garde-fou imposant une base jetable PoC/test/CI.

Un défaut latent de l'initialisation Prisma 7 MySQL a également été mis en évidence pendant le PoC : \`PrismaMariaDb\` recevait directement l'URL de connexion. Le helper central construit désormais explicitement la configuration de l'adapter depuis l'URL VigiSensys et respecte \`allowPublicKeyRetrieval\`, déjà présent dans les URLs générées par l'installeur Web.

Validation automatisée finale, avec lockfile figé :

- MySQL \`8.0.44\` : \`pnpm install --frozen-lockfile\`, génération Prisma MySQL, \`pnpm test:better-auth-poc\`, \`tsc --noEmit\`, ESLint — **OK** ;
- SQL Server \`2022\` : \`pnpm install --frozen-lockfile\`, génération Prisma MSSQL, \`pnpm test:better-auth-poc\`, \`tsc --noEmit\`, ESLint — **OK** ;
- run GitHub Actions de référence : \`33763894690\`.

Principaux fichiers :

- \`website/src/lib/better-auth/poc/auth.ts\` ;
- \`website/src/lib/better-auth/poc/database.ts\` ;
- \`website/src/lib/better-auth/poc/vigisensys-identity.ts\` ;
- \`website/src/app/api/auth-v2/[...all]/route.ts\` ;
- \`website/scripts/test-better-auth-poc.ts\` ;
- \`website/src/lib/mysql-connection.ts\` ;
- \`website/src/lib/prisma.ts\` ;
- \`website/package.json\` / \`website/pnpm-lock.yaml\`.

Non-régression / limites volontaires du lot :

- aucun remplacement du login de production ;
- aucun changement des cookies/JWT legacy ;
- aucun schéma final Better Auth dans les seeds ou migrations client ;
- aucune modification des règles CFR21, licence, permissions, profils ou groupes ;
- aucun plugin 2FA, Magic Link, Email OTP, Microsoft ou SSO activé à ce stade.

Après merge de la PR #88, le prochain lot est BA-2. Il devra repartir du nouveau HEAD réel de \`dev\` et versionner le schéma final ainsi que le provisioning/migration des comptes historiques.`

text = text.replace(marker, `${criterion}\n\n${status}\n\n${ba2Heading}`)
fs.writeFileSync(path, text, "utf8")
console.log("BA-1 status recorded")
