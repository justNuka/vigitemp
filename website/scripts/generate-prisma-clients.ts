import { spawnSync } from "node:child_process";

const schemas = [
  "./prisma/.generated/db-main/schema.prisma",
  "./prisma/.generated/db-mesures/schema.prisma",
  "./prisma/.generated/vigi-chat/schema.prisma",
] as const;

const maxAttempts = 3;
const retryDelayMs = 1500;
const pnpmCliPath = process.env.npm_execpath;

function wait(milliseconds: number) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

for (const schema of schemas) {
  let generated = false;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const pnpmCliIsScript = Boolean(pnpmCliPath && /\.(?:c|m)?js$/i.test(pnpmCliPath));
    const command = pnpmCliIsScript ? process.execPath : (pnpmCliPath ?? "pnpm");
    const commandArguments = pnpmCliIsScript
      ? [pnpmCliPath!, "exec", "prisma", "generate", `--schema=${schema}`]
      : ["exec", "prisma", "generate", `--schema=${schema}`];
    const result = spawnSync(command, commandArguments, {
      cwd: process.cwd(),
      encoding: "utf8",
      shell: !pnpmCliPath && process.platform === "win32",
    });

    if (result.status === 0) {
      if (result.stdout) process.stdout.write(result.stdout);
      generated = true;
      break;
    }

    if (attempt < maxAttempts) {
      console.warn(
        `[prisma] Generation failed for ${schema} (attempt ${attempt}/${maxAttempts}); retrying in ${retryDelayMs} ms.`,
      );
      wait(retryDelayMs);
      continue;
    }

    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.error) console.error(result.error);
  }

  if (!generated) {
    process.exitCode = 1;
    break;
  }
}
