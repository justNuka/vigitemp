
type Edition = "pack" | "one" | "standard" | "expert";

type SmokeCase = {
  id: string;
  method: "GET" | "POST" | "PATCH";
  path: string;
  buildBody?: () => BodyInit | undefined;
  contentType?: string;
  expected: Record<Edition, number[]>;
  note?: string;
};

type CliOptions = {
  baseUrl: string;
  username: string;
  password: string;
  machineName: string;
  locale: string;
  timeoutMs: number;
};

function parseArgs(argv: string[]): Partial<CliOptions> {
  const out: Partial<CliOptions> = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    const val = argv[i + 1];
    if (!key.startsWith("--")) continue;
    if (val === undefined || val.startsWith("--")) continue;

    switch (key) {
      case "--base":
      case "--baseUrl":
        out.baseUrl = val;
        i++;
        break;
      case "--user":
      case "--username":
        out.username = val;
        i++;
        break;
      case "--password":
        out.password = val;
        i++;
        break;
      case "--machine":
        out.machineName = val;
        i++;
        break;
      case "--locale":
        out.locale = val;
        i++;
        break;
      case "--timeout":
        out.timeoutMs = Number(val);
        i++;
        break;
      default:
        break;
    }
  }
  return out;
}

function normalizeEdition(input: unknown): Edition {
  const value = String(input ?? "one").trim().toLowerCase();
  if (value === "pack" || value === "one" || value === "standard" || value === "expert") {
    return value;
  }
  return "one";
}

function resolveOptions(): CliOptions {
  const args = parseArgs(process.argv.slice(2));

  const baseUrl = args.baseUrl ?? process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";
  const username = args.username ?? process.env.SMOKE_USERNAME ?? "";
  const password = args.password ?? process.env.SMOKE_PASSWORD ?? "";
  const machineName = args.machineName ?? process.env.SMOKE_MACHINE_NAME ?? "SMOKE-LICENSE";
  const locale = args.locale ?? process.env.SMOKE_LOCALE ?? "fr";
  const timeoutMs = Number(args.timeoutMs ?? process.env.SMOKE_TIMEOUT_MS ?? 15000);

  if (!username || !password) {
    console.error("Usage: tsx scripts/smoke-license-matrix.ts --base http://127.0.0.1:3000 --username USER --password PASS [--locale fr]");
    console.error("Ou variables d'env: SMOKE_BASE_URL, SMOKE_USERNAME, SMOKE_PASSWORD");
    process.exit(1);
  }

  return { baseUrl: baseUrl.replace(/\/$/, ""), username, password, machineName, locale, timeoutMs };
}

function getSetCookie(res: Response): string | null {
  const direct = res.headers.get("set-cookie");
  if (direct) return direct;
  const anyHeaders = res.headers as Headers & { getSetCookie?: () => string[] };
  if (typeof anyHeaders.getSetCookie === "function") {
    const all = anyHeaders.getSetCookie();
    return all.length > 0 ? all[0] : null;
  }
  return null;
}

function toCookieHeader(setCookieHeader: string | null): string {
  if (!setCookieHeader) return "";
  const first = setCookieHeader.split(",")[0]?.trim();
  const token = first?.split(";")[0]?.trim();
  return token ?? "";
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

const CASES: SmokeCase[] = [
  {
    id: "license",
    method: "GET",
    path: "/api/license",
    expected: { pack: [200], one: [200], standard: [200], expert: [200] },
    note: "Lecture licence",
  },
  {
    id: "etalons-types",
    method: "GET",
    path: "/api/etalons/types",
    expected: { pack: [403], one: [403], standard: [200], expert: [200] },
  },
  {
    id: "etalons-list",
    method: "GET",
    path: "/api/etalons",
    expected: { pack: [403], one: [403], standard: [200], expert: [200] },
  },
  {
    id: "etalonnages-list",
    method: "GET",
    path: "/api/sondes/etalonnages?serie=SMOKE-SERIE",
    expected: { pack: [403], one: [403], standard: [200], expert: [200] },
  },
  {
    id: "etalonnage-preview",
    method: "POST",
    path: "/api/sondes/etalonnages/preview",
    buildBody: () => {
      const fd = new FormData();
      return fd;
    },
    expected: { pack: [403], one: [403], standard: [400], expert: [400] },
    note: "Standard/Expert: 400 attendu car aucun fichier fourni",
  },
  {
    id: "etalonnage-bulk",
    method: "POST",
    path: "/api/sondes/etalonnages/bulk",
    buildBody: () => JSON.stringify({ rows: [] }),
    contentType: "application/json",
    expected: { pack: [403], one: [403], standard: [400], expert: [400] },
    note: "Standard/Expert: 400 attendu car payload volontairement invalide",
  },
  {
    id: "ajustage-bulk-open",
    method: "POST",
    path: "/api/sondes/ajustages/bulk",
    buildBody: () => JSON.stringify({ rows: [] }),
    contentType: "application/json",
    expected: { pack: [400], one: [400], standard: [400], expert: [400] },
    note: "Doit rester accessible a toutes licences (pas 403)",
  },
  {
    id: "lieux-post-emt",
    method: "POST",
    path: "/api/lieux",
    buildBody: () => JSON.stringify({ EMT_Mode: "quart" }),
    contentType: "application/json",
    expected: { pack: [403], one: [403], standard: [400], expert: [400] },
    note: "Standard/Expert: 400 attendu car payload incomplet",
  },
  {
    id: "lieux-patch-emt",
    method: "PATCH",
    path: "/api/lieux/1",
    buildBody: () => JSON.stringify({ EMT_Mode: "quart", Nom_Lieu: "" }),
    contentType: "application/json",
    expected: { pack: [403], one: [403], standard: [400], expert: [400] },
    note: "Standard/Expert: 400 attendu (validation), pas 403",
  },
  {
    id: "admin-page",
    method: "GET",
    path: "/fr/admin",
    expected: { pack: [200], one: [200], standard: [200], expert: [200] },
  },
];

async function main() {
  const options = resolveOptions();

  console.log("\n=== Smoke licence matrix ===");
  console.log(`Base URL: ${options.baseUrl}`);
  console.log(`User: ${options.username}`);

  const loginResponse = await fetchWithTimeout(
    `${options.baseUrl}/api/auth/login`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        username: options.username,
        password: options.password,
        machineName: options.machineName,
      }),
    },
    options.timeoutMs,
  );

  if (!loginResponse.ok) {
    const body = await loginResponse.text();
    throw new Error(`Login failed (${loginResponse.status}): ${body}`);
  }

  const cookie = toCookieHeader(getSetCookie(loginResponse));
  if (!cookie) {
    throw new Error("Login succeeded but no auth cookie received");
  }

  const licenseResponse = await fetchWithTimeout(
    `${options.baseUrl}/api/license`,
    { method: "GET", headers: { cookie } },
    options.timeoutMs,
  );
  const licenseJson = (await licenseResponse.json()) as { ok?: boolean; edition?: string; reason?: string };
  const edition = normalizeEdition(licenseJson.edition);

  console.log(`Edition detectee: ${edition}`);
  if (!licenseJson.ok) {
    console.log(`Warning licence: ${licenseJson.reason ?? "unknown"}`);
  }

  let passed = 0;
  let failed = 0;

  for (const testCase of CASES) {
    const headers: Record<string, string> = { cookie };
    const body = testCase.buildBody?.();
    if (testCase.contentType) {
      headers["content-type"] = testCase.contentType;
    }

    const res = await fetchWithTimeout(
      `${options.baseUrl}${testCase.path}`,
      {
        method: testCase.method,
        headers,
        body,
      },
      options.timeoutMs,
    );

    const expected = testCase.expected[edition];
    const ok = expected.includes(res.status);

    if (ok) {
      passed++;
      console.log(`PASS ${testCase.id.padEnd(20)} status=${res.status} expected=${expected.join("|")}`);
    } else {
      failed++;
      const sample = (await res.text()).slice(0, 240).replace(/\s+/g, " ");
      console.log(`FAIL ${testCase.id.padEnd(20)} status=${res.status} expected=${expected.join("|")} body="${sample}"`);
    }

    if (testCase.note) {
      console.log(`  note: ${testCase.note}`);
    }
  }

  console.log("\n--- Resultat ---");
  console.log(`Edition: ${edition}`);
  console.log(`PASS: ${passed}`);
  console.log(`FAIL: ${failed}`);

  if (failed > 0) {
    process.exit(2);
  }
}

main().catch((error) => {
  console.error("Smoke matrix error:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
