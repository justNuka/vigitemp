import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

import { enSupplements, frSupplements, mergeMessages, type MessageCatalog } from "../src/messages/supplements";
import {
  enMetrologyCalibrationSupplements,
  frMetrologyCalibrationSupplements,
} from "../src/messages/metrology-calibration-supplements";
import {
  enAdminSettingsSupplements,
  frAdminSettingsSupplements,
} from "../src/messages/admin-settings-supplements";
import { enToolsSupplements, frToolsSupplements } from "../src/messages/tools-supplements";

const ROOT = process.cwd();
const MESSAGES_DIR = path.join(ROOT, "src", "messages");
const SOURCE_DIRS = [path.join(ROOT, "src", "app"), path.join(ROOT, "src", "components")];
const EXCLUDED_PATH_PARTS = [
  "/src/app/[locale]/(admin)/admin/test/",
  "/src/components/react-grid-layout/",
  // Animated loaders are illustrative mockups, not application copy.
  "/src/components/animated-loaders/",
  // Historical duplicate kept for now; the active Hotline tool lives under the route dashboard.
  "/src/components/hotline/hotline-sensor-test-tool.tsx",
  // Generic/demo UI primitives containing upstream placeholder copy.
  "/src/components/ui/compare.tsx",
  "/src/components/ui/dock.tsx",
  "/src/components/ui/hero-parallax.tsx",
  "/src/components/ui/resizable-navbar.tsx",
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
  /^[-–—+*/#%°.:,()\[\]{}<>|@·•]+$/,
  /^(?:&gt;|&nbsp;|\\u2014)$/i,
  /^(?:min|ms|s|h|px|rem|vh|vw|V|°C|%)$/i,
  /^(?:vs\.)$/i,
  /^\/2\)$/,
  /^[A-Z]$/,
  /^\d+(?:[.,]\d+)?(?:\s?(?:ms|s|min|h|px|rem|vh|vw|%|V|°C))?$/i,
  /^-?\s*(?:Vigi|Sensys|VigiSensys|VigiTemp|VigiServ|VigiTel|MC2)(?:\s+Lab|\s+logo)?$/i,
  /^(?:GSO|GSP|RSSI|CFR21|XML|PDF|CSV|Excel|MySQL|MSSQL|COM\w*|TX|RX)$/i,
  /^(?:TEMP|FTEM|DD-H|DCON|MEMO|ED-H|ECON|CHAN)$/i,
  /^(?:(?:TEMP|FTEM|DD-H|DCON|MEMO|ED-H|ECON|CHAN)(?:,\s*)?)+$/i,
  /^(?:None|Odd|Even|Mark|Space|One|Two|OnePointFive)$/,
  /^(?:AC|SK|AK|AS|CK)[x.]+$/i,
  /^(?:ovh-(?:eu|us|ca)|client_id|client_secret|ari-user)$/i,
  /^(?:SPPS-\d+|GSO-E\w+|TEMPSPNB-\d+)$/i,
  /^(?:https?:\/\/|127\.0\.0\.1|\+?\d)[^\s]*$/,
  /^(?:Standard)$/,
];

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function isFormulaLiteral(text: string) {
  const normalized = normalizeText(text);
  if (!normalized) return true;
  if (/^(?:I|mes|et|etalonnage|P)$/i.test(normalized)) return true;
  if (!/[=+*/|()]/.test(normalized)) return false;
  return /^[\s\dA-Za-z_+=+*/|().,-]+$/.test(normalized) &&
    /(?:I|mes|et|etalonnage|Derive|sqrt|EJ)/i.test(normalized);
}

function isAllowedLiteral(text: string) {
  const normalized = normalizeText(text);
  if (!normalized) return true;
  return isFormulaLiteral(normalized) || ALLOWED_LITERAL_PATTERNS.some((pattern) => pattern.test(normalized));
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

  const fr = mergeMessages(
    mergeMessages(
      mergeMessages(JSON.parse(frRaw) as MessageCatalog, frSupplements),
      frAdminSettingsSupplements,
    ),
    frMetrologyCalibrationSupplements,
  );
  const en = mergeMessages(
    mergeMessages(
      mergeMessages(JSON.parse(enRaw) as MessageCatalog, enSupplements),
      enAdminSettingsSupplements,
    ),
    enMetrologyCalibrationSupplements,
  );
  const frKeys = new Set(flattenKeys(mergeMessages(fr, frToolsSupplements)));
  const enKeys = new Set(flattenKeys(mergeMessages(en, enToolsSupplements)));

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
    console.error("\nKeys present in the effective FR catalog but missing in EN:");
    missingInEn.forEach((key) => console.error(`  - ${key}`));
  }

  if (missingInFr.length > 0) {
    console.error("\nKeys present in the effective EN catalog but missing in FR:");
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

  console.log(`i18n check passed: ${frKeys.size} effective message keys are mirrored and no hard-coded UI strings were detected.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});