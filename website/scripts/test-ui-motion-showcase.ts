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
    return prefix ? [prefix] : [];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    collectLeafPaths(child, prefix ? prefix + "." + key : key),
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

for (const filePath of productionFiles) {
  const source = read(filePath);
  assert(
    !source.includes("ui-motion") &&
      !source.includes("loading-concepts") &&
      !source.includes("error-concepts"),
    filePath + " must not depend on the isolated UI motion showcase.",
  );
}

const showcaseClient = read(
  "src/app/[locale]/(admin)/admin/test/ui-motion/_components/ui-motion-showcase-client.tsx",
);
assert(
  showcaseClient.includes('reducedMotion="never"'),
  "The isolated showcase must force motion so the demo does not become static when the OS requests reduced motion.",
);

const loadingConcepts = read(
  "src/app/[locale]/(admin)/admin/test/ui-motion/_components/loading-concepts.tsx",
);
for (const id of ["kinetic", "morph", "cards", "graph", "sensors", "stream"]) {
  assert(loadingConcepts.includes('id: "' + id + '"'), "Missing loader concept: " + id);
}
assert(
  !loadingConcepts.includes("useReducedMotion"),
  "Loader demos must not silently disable their animations inside the forced-motion lab.",
);
assert(
  loadingConcepts.includes("repeat: Infinity"),
  "Loader concepts must contain continuous motion, not only static layouts.",
);

const errorConcepts = read(
  "src/app/[locale]/(admin)/admin/test/ui-motion/_components/error-concepts.tsx",
);
for (const id of ["404", "500", "maintenance", "network"]) {
  assert(errorConcepts.includes('id: "' + id + '"'), "Missing error concept: " + id);
}
assert(
  !errorConcepts.includes("useReducedMotion"),
  "Error-page demos must not silently disable their animations inside the forced-motion lab.",
);
assert(
  errorConcepts.includes("VigiBot"),
  "The illustrated error concepts must keep the custom VigiSensys robot scene.",
);
assert(
  errorConcepts.includes("navigator.onLine"),
  "Network diagnostic must check browser connectivity.",
);
assert(
  errorConcepts.includes('networkProbe("/api/me")'),
  "Network diagnostic must probe the VigiSensys API.",
);
assert(
  errorConcepts.includes('cache: "no-store"'),
  "Network probes must bypass browser caching.",
);

const fr = JSON.parse(read("src/messages/fr.json"));
const en = JSON.parse(read("src/messages/en.json"));

function assertLocalizedScopeParity(
  frScope: unknown,
  enScope: unknown,
  label: string,
) {
  const frPaths = collectLeafPaths(frScope).sort();
  const enPaths = collectLeafPaths(enScope).sort();

  assert(frPaths.length > 0, "French translations are missing for " + label + ".");
  assert(
    JSON.stringify(frPaths) === JSON.stringify(enPaths),
    "French and English translation keys must stay aligned for " + label + ".",
  );

  return frPaths.length;
}

const uiMotionKeyCount = assertLocalizedScopeParity(
  fr.testPages?.uiMotion,
  en.testPages?.uiMotion,
  "testPages.uiMotion",
);
assertLocalizedScopeParity(
  fr.testPages?.index?.design,
  en.testPages?.index?.design,
  "testPages.index.design",
);

const pkg = JSON.parse(read("package.json"));
assert(
  pkg.version === "1.9.0",
  "Expected Web version 1.9.0, got " + String(pkg.version ?? "missing") + ".",
);

console.log(
  "UI motion showcase validation passed: 6 animated loaders, 4 illustrated system pages, " +
    String(uiMotionKeyCount) +
    " localized UI-motion leaf keys.",
);
