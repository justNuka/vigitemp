export const ALARM_AUDIO_MUTED_STORAGE_KEY = "vigitemp:alarm-audio-muted"
export const ALARM_AUDIO_STATE_EVENT = "vigitemp:alarm-audio-state"

function parseMuted(value: string | null) {
  return value === "1" || value === "true"
}

export function getAlarmAudioMuted() {
  if (typeof window === "undefined") return false
  return parseMuted(window.localStorage.getItem(ALARM_AUDIO_MUTED_STORAGE_KEY))
}

export function setAlarmAudioMuted(muted: boolean) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(ALARM_AUDIO_MUTED_STORAGE_KEY, muted ? "1" : "0")
  window.dispatchEvent(new CustomEvent(ALARM_AUDIO_STATE_EVENT, { detail: { muted } }))
}
