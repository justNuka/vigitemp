import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const MESSAGES_DIR = path.join(ROOT, "src", "messages");
const SOURCE_DIRS = [path.join(ROOT, "src", "app"), path.join(ROOT, "src", "components")];
const EXCLUDED_PATH_PARTS = [
  "/src/app/[locale]/(admin)/admin/test/",
  "/src/components/react-grid-layout/",
];

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return prefix ? [prefix] : [];

  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => {
    const next = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object" && !Array.isArray(child)) {
      return flattenKeys(child, next);
    }
    return [next];
  });
}

async function collectSourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      const normalized = fullPath.replaceAll("\\", "/");
      if (EXCLUDED_PATH_PARTS.some((part) => normalized.includes(part))) return [];
      if (entry.isDirectory()) return collectSourceFiles(fullPath);
      return /\.(tsx|jsx)$/.test(entry.name) ? [fullPath] : [];
    }),
  );
  return files.flat();
}

const ALLOWED_LITERAL_PATTERNS = [
  /^[-–—+*/#%°.:,()\[\]{}<>|]+$/,
  /^\d+(?:[.,]\d+)?(?:\s?(?:ms|s|min|h|px|rem|vh|vw|%|V|°C))?$/i,
  /^(?:Vigi|Sensys|VigiSensys|VigiTemp|VigiServ|VigiTel|MC2)(?:\s+Lab|\s+logo)?$/i,
  /^(?:GSO|GSP|RSSI|CFR21|XML|PDF|CSV|Excel|MySQL|MSSQL|COM\w*|TX|RX)$/i,
  /^(?:TEMP|FTEM|DD-H|DCON|MEMO|ED-H|ECON|CHAN)$/i,
  /^(?:None|Odd|Even|Mark|Space|One|Two|OnePointFive)$/,
  /^(?:AC|SK|AK|AS|CK)[x.]+$/i,
  /^(?:https?:\/\/|127\.0\.0\.1|\+?\d)[^\s]*$/,
];

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function isAllowedLiteral(text: string) {
  const normalized = normalizeText(text);
  if (!normalized) return true;
  return ALLOWED_LITERAL_PATTERNS.some((pattern) => pattern.test(normalized));
}

function findHardcodedUiStrings(source: string, fileName: string) {
  const findings: Array<{ line: number; text: string }> = [];
  const scriptKind = fileName.endsWith(".jsx") ? ts.ScriptKind.JSX : ts.ScriptKind.TSX;
  const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, scriptKind);

  const addFinding = (node: ts.Node, rawText: string) => {
    const text = normalizeText(rawText);
    if (!text || isAllowedLiteral(text)) return;
    const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    findings.push({ line: line + 1, text });
  };

  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node)) {
      addFinding(node, node.getText(sourceFile));
    }

    if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer)) {
      const propName = node.name.getText(sourceFile);
      if (["title", "placeholder", "aria-label", "aria-description", "alt"].includes(propName)) {
        addFinding(node.initializer, node.initializer.text);
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return findings;
}

async function main() {
  const [frRaw, enRaw] = await Promise.all([
    readFile(path.join(MESSAGES_DIR, "fr.json"), "utf8"),
    readFile(path.join(MESSAGES_DIR, "en.json"), "utf8"),
  ]);

  const fr = JSON.parse(frRaw);
  const en = JSON.parse(enRaw);
  const frKeys = new Set(flattenKeys(fr));
  const enKeys = new Set(flattenKeys(en));

  const missingInEn = [...frKeys].filter((key) => !enKeys.has(key)).sort();
  const missingInFr = [...enKeys].filter((key) => !frKeys.has(key)).sort();

  const files = (await Promise.all(SOURCE_DIRS.map(collectSourceFiles))).flat();
  const hardcoded: Array<{ file: string; line: number; text: string }> = [];

  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const finding of findHardcodedUiStrings(source, file)) {
      hardcoded.push({
        file: path.relative(ROOT, file).replaceAll("\\", "/"),
        ...finding,
      });
    }
  }

  if (missingInEn.length > 0) {
    console.error("\nKeys present in fr.json but missing in en.json:");
    missingInEn.forEach((key) => console.error(`  - ${key}`));
  }

  if (missingInFr.length > 0) {
    console.error("\nKeys present in en.json but missing in fr.json:");
    missingInFr.forEach((key) => console.error(`  - ${key}`));
  }

  if (hardcoded.length > 0) {
    console.error("\nPotential hard-coded user-facing strings:");
    hardcoded.forEach(({ file, line, text }) => console.error(`  - ${file}:${line} -> ${JSON.stringify(text)}`));
  }

  if (missingInEn.length || missingInFr.length || hardcoded.length) {
    process.exitCode = 1;
    return;
  }

  console.log(`i18n check passed: ${frKeys.size} message keys are mirrored and no hard-coded UI strings were detected.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
