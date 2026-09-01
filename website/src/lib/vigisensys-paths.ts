import fs from "fs/promises"
import path from "path"

export const PROGRAM_DATA = process.env.ProgramData || process.env.PROGRAMDATA || "C:\\ProgramData"
export const APP_DATA_DIR = path.join(PROGRAM_DATA, "VigiSensys")
export const LEGACY_APP_DATA_DIR = path.join(PROGRAM_DATA, "Vigitemp")

export function appDataPath(...parts: string[]) {
  return path.join(APP_DATA_DIR, ...parts)
}

export function legacyAppDataPath(...parts: string[]) {
  return path.join(LEGACY_APP_DATA_DIR, ...parts)
}

export async function firstExistingPath(paths: string[], fallback: string) {
  for (const candidate of paths) {
    try {
      await fs.access(candidate)
      return candidate
    } catch {
      // Try the next compatibility path.
    }
  }
  return fallback
}

