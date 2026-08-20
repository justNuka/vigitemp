import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const MESSAGES_DIR = path.join(ROOT, "src", "messages");
const SOURCE_DIRS = [path.join(ROOT, "src", "app"), path.join(ROOT, "src", "components")];

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
      if (entry.isDirectory()) return collectSourceFiles(fullPath);
      return /\.(tsx|jsx)$/.test(entry.name) ? [fullPath] : [];
    }),
  );
  return files.flat();
}

const ALLOWED_LITERAL_PATTERNS = [
  /^[-–—+*/#%°.:,()\[\]{}<>|]+$/,
  /^\d+(?:[.,]\d+)?(?:\s?(?:ms|s|min|h|px|rem|vh|vw|%|V|°C))?$/i,
  /^(?:VigiSensys|MC2)(?:\s+logo)?$/i,
  /^(?:GSO|GSP|RSSI|CFR21|XML|PDF|CSV|Excel|MySQL|MSSQL|COM\d*)$/i,
];

function isAllowedLiteral(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return true;
  return ALLOWED_LITERAL_PATTERNS.some((pattern) => pattern.test(normalized));
}

function lineNumber(source: string, index: number) {
  return source.slice(0, index).split("\n").length;
}

function findHardcodedUiStrings(source: string) {
  const findings: Array<{ line: number; text: string }> = [];

  const jsxText = />\s*([^<{][^<{]*?)\s*</g;
  for (const match of source.matchAll(jsxText)) {
    const text = match[1]?.replace(/\s+/g, " ").trim() ?? "";
    if (!text || isAllowedLiteral(text)) continue;
    findings.push({ line: lineNumber(source, match.index ?? 0), text });
  }

  const userFacingProps = /\b(?:title|placeholder|aria-label|aria-description|alt)=(["'])(.*?)\1/g;
  for (const match of source.matchAll(userFacingProps)) {
    const text = match[2]?.trim() ?? "";
    if (!text || isAllowedLiteral(text)) continue;
    findings.push({ line: lineNumber(source, match.index ?? 0), text });
  }

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
    for (const finding of findHardcodedUiStrings(source)) {
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
