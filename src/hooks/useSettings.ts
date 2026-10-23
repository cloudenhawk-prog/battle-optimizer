// React hook exposing the editor settings and a setter that persists every change.
import { useState } from 'react'
import type { Settings } from '../types/settings'
import { loadSettings, saveSettings } from '../persistence/settingsStorage'

// ========== Hook: useSettings ================================================================================================

// NOTE: state is per hook instance — callers don't see each other's updates until they remount (reload from storage).
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
