const AGENT_URLS = ["http://127.0.0.1:8000", "http://localhost:8000"] as const;

function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

function createToken(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function tryAgentFetch(path: string, init: RequestInit): Promise<void> {
  for (const baseUrl of AGENT_URLS) {
    try {
      const res = await fetch(`${baseUrl}${path}`, init);
      if (res.ok || res.status === 204) return;
    } catch (err) {
      // try next URL
    }
  }

  throw new Error("Agent request failed");
}

export async function setAgentSession(input: {
  userId: string;
  username: string;
  expiresInDays?: number;
}): Promise<void> {
  const expiresInDays = input.expiresInDays ?? 90;
  const expiresAtUtc = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

  await tryAgentFetch("/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: createToken(),
      userId: input.userId,
      username: input.username,
      expiresAtUtc,
    }),
    signal: createTimeoutSignal(800),
  });
}

export async function clearAgentSession(): Promise<void> {
  await tryAgentFetch("/session", {
    method: "DELETE",
    signal: createTimeoutSignal(800),
  });
}
