import "dotenv/config";

import fs from "node:fs";
import path from "node:path";

type Provider = "mysql" | "mssql";

const root = process.cwd();

const schemas = [
  {
    name: "db-main",
    output: "../../../src/generated/@prisma-db-main",
  },
  {
    name: "db-mesures",
    output: "../../../src/generated/@prisma-db-mesures",
  },
  {
    name: "vigi-chat",
    output: "../../../src/generated/@prisma-vigi-chat",
  },
] as const;

function parseProviderArg(): Provider | null {
  const rawArgs = process.argv.slice(2);

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index]?.trim().toLowerCase();
    if (!arg) continue;

    if (arg === "mysql") return "mysql";
    if (arg === "mssql" || arg === "sqlserver") return "mssql";

    if (arg.startsWith("--provider=")) {
      const value = arg.split("=", 2)[1];
      if (value === "mysql") return "mysql";
      if (value === "mssql" || value === "sqlserver") return "mssql";
    }

    if (arg === "--provider") {
      const value = rawArgs[index + 1]?.trim().toLowerCase();
      if (value === "mysql") return "mysql";
      if (value === "mssql" || value === "sqlserver") return "mssql";
    }
  }

  return null;
}

function detectProvider(): Provider {
  const cliProvider = parseProviderArg();
  if (cliProvider) return cliProvider;

  const configured = process.env.DATABASE_PROVIDER?.trim().toLowerCase();
  if (configured === "mssql" || configured === "sqlserver") return "mssql";

  const urls = [
    process.env.DATABASE_URL,
    process.env.DATABASE_MESURES_URL,
    process.env.DATABASE_CHAT_URL,
  ];

  return urls.some((url) => url?.trim().toLowerCase().startsWith("sqlserver://"))
    ? "mssql"
    : "mysql";
}

function toSqlServerSchema(schema: string): string {
  let next = schema;

  next = next.replace(
    /provider\s*=\s*"mysql"/,
    'provider = "sqlserver"\n  relationMode = "prisma"',
  );

  next = next.replace(/@db\.DateTime\(0\)/g, "@db.DateTime");
  next = next.replace(/@db\.Time\(0\)/g, "@db.Time");
  next = next.replace(/@db\.Timestamp\(0\)/g, "@db.DateTime");
  next = next.replace(/@db\.LongText/g, "@db.Text");
  next = next.replace(/@db\.TinyText/g, "@db.Text");

  // SQL Server connector does not support Prisma enums. The DB stores these as textual columns.
  next = next.replace(
    /Type\s+t_lieu_planning_audit_Type/,
    "Type                             String                           @db.VarChar(32)",
  );
  next = next.replace(
    /Mode_Transmission\s+t_commande_materiel_Mode_Transmission/,
    "Mode_Transmission    String                              @db.VarChar(16)",
  );
  next = next.replace(
    /Statut_Commande\s+t_commande_materiel_Statut_Commande\s+@default\(BROUILLON\)/,
    'Statut_Commande      String                              @default("BROUILLON") @db.VarChar(16)',
  );

  next = next.replace(/^enum t_lieu_planning_audit_Type \{[\s\S]*?^\}\r?\n?/gm, "");
  next = next.replace(/^enum t_commande_materiel_Mode_Transmission \{[\s\S]*?^\}\r?\n?/gm, "");
  next = next.replace(/^enum t_commande_materiel_Statut_Commande \{[\s\S]*?^\}\r?\n?/gm, "");

  return next;
}

function rewriteGeneratorOutput(schema: string, output: string): string {
  return schema.replace(/output\s*=\s*"[^"]+"/, `output   = "${output}"`);
}

const provider = detectProvider();
const generatedRoot = path.join(root, "prisma", ".generated");

fs.mkdirSync(generatedRoot, { recursive: true });

for (const schema of schemas) {
  const sourcePath = path.join(root, "prisma", schema.name, "schema.prisma");
  const targetDir = path.join(generatedRoot, schema.name);
  const targetPath = path.join(targetDir, "schema.prisma");

  let content = fs.readFileSync(sourcePath, "utf8");
  if (provider === "mssql") {
    content = toSqlServerSchema(content);
  }
  content = rewriteGeneratorOutput(content, schema.output);

  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(targetPath, content, { encoding: "utf8" });
}

console.log(`[prisma] Prepared ${provider === "mssql" ? "SQL Server" : "MySQL"} schemas in prisma/.generated`);
