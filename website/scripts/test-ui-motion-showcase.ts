import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function read(relativePath: string) {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function collectLeafPaths(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return [prefix];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    collectLeafPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

const route = read("src/app/[locale]/(admin)/admin/test/ui-motion/page.tsx");
assert(
  route.includes("FEATURE_FLAGS.enableTestPages") && route.includes("notFound()"),
  "The UI motion showcase must remain gated by ENABLE_TEST_PAGES.",
);

const productionFiles = [
  "src/app/[locale]/(dashboard)/loading.tsx",
  "src/app/[locale]/not-found.tsx",
  "src/app/[locale]/error.tsx",
  "src/app/[locale]/(dashboard)/error.tsx",
];

for (const file of productionFiles) {
  const source = read(file);
  assert(
    !source.includes("ui-motion") && !source.includes("loading-concepts") && !source.includes("error-concepts"),
    `${file} must not depend on the isolated UI motion showcase.`,
  );
}

const loadingConcepts = read(
  "src/app/[locale]/(admin)/admin/test/ui-motion/_components/loading-concepts.tsx",
);
for (const id of ["kinetic", "morph", "cards", "graph", "sensors", "stream"]) {
  assert(loadingConcepts.includes(`id: "${id}"`), `Missing loader concept: ${id}`);
}

const errorConcepts = read(
  "src/app/[locale]/(admin)/admin/test/ui-motion/_components/error-concepts.tsx",
);
for (const id of ["404", "500", "maintenance", "network"]) {
  assert(errorConcepts.includes(`id: "${id}"`), `Missing error concept: ${id}`);
}
assert(errorConcepts.includes("navigator.onLine"), "Network diagnostic must check browser connectivity.");
assert(errorConcepts.includes('networkProbe("/api/me")'), "Network diagnostic must probe the VigiSensys API.");
assert(errorConcepts.includes('cache: "no-store"'), "Network probes must bypass browser caching.");

const fr = JSON.parse(read("src/messages/fr.json"));
const en = JSON.parse(read("src/messages/en.json"));
const frPaths = collectLeafPaths(fr.testPages?.uiMotion).sort();
const enPaths = collectLeafPaths(en.testPages?.uiMotion).sort();
assert(frPaths.length > 0, "French UI motion translations are missing.");
assert(
  JSON.stringify(frPaths) === JSON.stringify(enPaths),
  "French and English UI motion translation keys must stay aligned.",
);

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "1.9.0", `Expected Web version 1.9.0, got ${pkg.version ?? "missing"}.`);

console.log(
  `UI motion showcase validation passed: 6 loaders, 4 system pages, ${frPaths.length} localized leaf keys.`,
);
