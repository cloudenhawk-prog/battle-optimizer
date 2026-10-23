// Per-character build optimizer config: localStorage load/save and JSON file export.
import type { EchoOptConfig, PersistedCharConfig } from '../../../optimizers/buildOptimizer'
import { serializeEchoConfig, deserializeEchoConfig } from '../../../optimizers/buildOptimizer'

// ========== Echo Config Persistence =========================================================================================

// One localStorage entry holds a { [characterName]: PersistedCharConfig } map
const BO_STORAGE_KEY = 'battle-optimizer-build-optimizer'

export function loadCharConfig(charName: string): { globalTier: number; echoConfig: EchoOptConfig } {
  try {
    const raw = localStorage.getItem(BO_STORAGE_KEY)
    if (!raw) return { globalTier: 8, echoConfig: {} }
    const all = JSON.parse(raw) as Record<string, PersistedCharConfig>
    const saved = all[charName]
    if (!saved) return { globalTier: 8, echoConfig: {} }
    const echoConfig = deserializeEchoConfig(saved.echoConfig)
    return { globalTier: saved.globalTier ?? 8, echoConfig }
  } catch {
    return { globalTier: 8, echoConfig: {} }
  }
}

export function saveCharConfig(charName: string, globalTier: number, echoConfig: EchoOptConfig): void {
  try {
    const raw = localStorage.getItem(BO_STORAGE_KEY)
    const all: Record<string, PersistedCharConfig> = raw ? JSON.parse(raw) : {}
    const persistedEcho = serializeEchoConfig(echoConfig)
    all[charName] = { globalTier, echoConfig: persistedEcho }
    localStorage.setItem(BO_STORAGE_KEY, JSON.stringify(all))
  } catch {
    // ignore write errors
  }
}

// ========== File Export ======================================================================================================

/** Downloads the character's config as bo-config-<name>.json. */
export function exportConfig(charName: string, globalTier: number, echoConfig: EchoOptConfig): void {
  const persistedSlots = serializeEchoConfig(echoConfig)
  const data: PersistedCharConfig = { globalTier, echoConfig: persistedSlots }
  const json = JSON.stringify({ character: charName, config: data }, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bo-config-${charName.replace(/\s+/g, '-').toLowerCase()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
