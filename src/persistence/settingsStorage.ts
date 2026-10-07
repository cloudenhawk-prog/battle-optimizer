// Settings persistence: defaults plus load/save to localStorage (safe to call outside React and in Node).
import type { Settings } from '../types/settings'

const SETTINGS_KEY = 'battle-optimizer-settings'

export function getDefaultSettings(): Settings {
  return {
    autocastFollowUps: false,
    startWithFullEnergy: false,
    sandboxMode: false,
    rowDeletionMode: false,
    useFixedStacks: false,
    triggerOutroIntroOnCharacterSelect: false,
  }
}

/** Stored values are merged over defaults so settings added later get sane values for old users. */
export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return { ...getDefaultSettings(), ...JSON.parse(raw) }
  } catch {
    // ignore parse errors (and missing localStorage in Node/tests)
  }
  return getDefaultSettings()
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // ignore write errors
  }
}
