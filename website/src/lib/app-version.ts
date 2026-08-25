import packageJson from "../../package.json"

function formatProductVersion(version: string): string {
  const [major = "0", minor = "0", patch = "0"] = version.split(".")
  return `${major}.${minor.padStart(2, "0")}.${patch.padStart(3, "0")}`
}

export const WEB_APP_VERSION = formatProductVersion(packageJson.version || "0.0.0")
