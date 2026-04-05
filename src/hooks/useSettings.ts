import { useState } from 'react'

// ========== Types ============================================================================================================

export type Settings = {
  autocastFollowUps: boolean
  startWithFullEnergy: boolean
}

// ========== Defaults & Persistence ===========================================================================================

const SETTINGS_KEY = 'battle-optimizer-settings'

function getDefaultSettings(): Settings {
  return {
    autocastFollowUps: false,
    startWithFullEnergy: false,
  }
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return { ...getDefaultSettings(), ...JSON.parse(raw) }
  } catch {
    // ignore parse errors
  }
  return getDefaultSettings()
}

function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // ignore write errors
  }
}

// ========== Hook: useSettings ================================================================================================

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings(prev => {
      const next = { ...prev, [key]: value }
      saveSettings(next)
      return next
    })
  }

  return { settings, updateSetting }
}
