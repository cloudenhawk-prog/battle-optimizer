import { createPortal } from 'react-dom'
import { useState, useCallback } from 'react'
import '../../styles/rotation-editor/BuildOptimizerOverlay.css'
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { TableConfig } from '../../types/tableDefinitions'
import type { Snapshot } from '../../types/snapshot'
import type { Settings } from '../../hooks/useSettings'
import { extractSteps } from '../../utils/importExport'
import { resolveCharacter } from '../../utils/gear/resolveCharacter'
import { replaySteps } from '../../utils/engine/replaySteps'
import { createEmptySnapshot } from '../../hooks/rotation-editor/useSnapshots'
import { weaponCatalog } from '../../data/gear/weaponCatalog'
import { buildWeapon } from '../../data/gear/weaponCatalog'
import { baseCharacters } from '../../data/characters'
import { negativeStatuses as negativeStatusesData } from '../../data/negativeStatuses'
import type { EngineState } from '../../utils/engine/step'

// ========== Types ============================================================================================================

export type BuildResult = {
  label: string
  weaponName: string
  weaponRank: number
  dps: number
  delta: number    // absolute DPS difference vs the current build
  deltaPct: number // percentage difference vs the current build
  isCurrent: boolean
}

// ========== Helpers ==========================================================================================================

function buildGlobalColumns(tableConfig: TableConfig) {
  const statusEffectsColumns = tableConfig.statusEffects?.columns ?? []
  const buffsCol = statusEffectsColumns.find(col => col.key === 'buffs')
  const debuffsCol = statusEffectsColumns.find(col => col.key === 'debuffs')
  const negativeStatusesCol = statusEffectsColumns.find(col => col.key === 'negativeStatuses')
  return {
    basic: tableConfig.basic.columns.map(col => col.key),
    buffs: buffsCol?.statusMetadata?.map(meta => meta.key) ?? [],
    debuffs: debuffsCol?.statusMetadata?.map(meta => meta.key) ?? [],
    negativeStatuses: negativeStatusesCol?.statusMetadata?.map(meta => meta.key) ?? [],
  }
}

function freshEngineState(): EngineState {
  return {
    negativeStatusesInAction: Object.values(negativeStatusesData).map(status => ({
      negativeStatus: status,
      applicationTime: -1,
      timeLeft: 0,
      currentStacks: 0,
      lastDamageTime: 0,
    })),
    modifiersInAction: [],
    coordinatedAttacksInAction: [],
  }
}

/**
 * Returns the best available rank for a weapon (highest defined rank, preferring 5).
 */
function bestRank(entry: { ranks: Partial<Record<1 | 2 | 3 | 4 | 5, unknown>> }): 1 | 2 | 3 | 4 | 5 | null {
  for (const r of [5, 4, 3, 2, 1] as const) {
    if (entry.ranks[r] !== undefined) return r
  }
  return null
}

// ========== Optimizer Logic ==================================================================================================

/**
 * Scores the current rotation with a given characters map by replaying all steps from a
 * fresh initial snapshot. Returns the final DPS, or 0 if replay fails.
 */
function scoreRotation(params: {
  steps: ReturnType<typeof extractSteps>
  charactersMap: Record<string, ResolvedCharacter>
  characterColumnsMap: Record<string, string[]>
  globalColumns: ReturnType<typeof buildGlobalColumns>
  enemy: Enemy
  tableConfig: TableConfig
  settings: Settings
  autocastFollowUps: boolean
}): number {
  const { steps, charactersMap, characterColumnsMap, globalColumns, enemy, tableConfig, settings, autocastFollowUps } = params
  if (steps.length === 0) return 0

  const startingSnapshot = createEmptySnapshot(
    charactersMap,
    characterColumnsMap,
    globalColumns,
    tableConfig,
    settings.startWithFullEnergy,
  )

  const result = replaySteps({
    steps,
    startingSnapshots: [startingSnapshot],
    startingEngineState: freshEngineState(),
    charactersMap,
    characterColumnsMap,
    globalColumns,
    enemy,
    autocastFollowUps,
  })

  if (!result.valid) return 0
  // The last resolved snapshot is at index length - 2 (last index is always a blank row)
  const lastResolved = result.snapshots[result.snapshots.length - 2]
  return lastResolved?.dps ?? 0
}

// ========== Component ========================================================================================================

type BuildOptimizerOverlayProps = {
  open: boolean
  onClose: () => void
  snapshots: Snapshot[]
  charactersInBattle: ResolvedCharacter[]
  enemy: Enemy
  tableConfig: TableConfig
  settings: Settings
}

export default function BuildOptimizerOverlay({
  open,
  onClose,
  snapshots,
  charactersInBattle,
  enemy,
  tableConfig,
  settings,
}: BuildOptimizerOverlayProps) {
  const [selectedCharName, setSelectedCharName] = useState<string>(() => charactersInBattle[0]?.name ?? '')
  const [results, setResults] = useState<BuildResult[]>([])
  const [running, setRunning] = useState(false)
  const [ran, setRan] = useState(false)

  const steps = extractSteps(snapshots)
  const hasRotation = steps.length > 0

  const selectedChar = charactersInBattle.find(c => c.name === selectedCharName)

  // Switch character tab resets previous results
  function handleSelectChar(name: string) {
    setSelectedCharName(name)
    setResults([])
    setRan(false)
  }

  const runOptimizer = useCallback(() => {
    if (!selectedChar || steps.length === 0) return

    setRunning(true)
    setRan(false)

    // Build shared derived state
    const globalColumns = buildGlobalColumns(tableConfig)
    const characterColumnsMap = Object.fromEntries(
      charactersInBattle.map(c => [c.name, Object.keys(c.maxEnergies)]),
    )
    const baseCharMap = Object.fromEntries(baseCharacters.map(c => [c.name, c]))
    const baseChar = baseCharMap[selectedChar.name]

    if (!baseChar) {
      setRunning(false)
      return
    }

    // Score the current build as the baseline
    const currentCharactersMap = Object.fromEntries(charactersInBattle.map(c => [c.name, c]))
    const currentDPS = scoreRotation({
      steps,
      charactersMap: currentCharactersMap,
      characterColumnsMap,
      globalColumns,
      enemy,
      tableConfig,
      settings,
      autocastFollowUps: true,
    })

    const currentWeaponName = selectedChar.gear.weapon?.name ?? '(no weapon)'
    const currentWeaponRank = selectedChar.gear.weapon?.rank ?? 1

    const candidateResults: BuildResult[] = [
      {
        label: `${currentWeaponName} ★${currentWeaponRank} (current)`,
        weaponName: currentWeaponName,
        weaponRank: currentWeaponRank,
        dps: currentDPS,
        delta: 0,
        deltaPct: 0,
        isCurrent: true,
      },
    ]

    // Try every catalog weapon matching this character's weapon type
    const matchingWeapons = weaponCatalog.filter(w => w.weaponType === selectedChar.weaponType)

    for (const entry of matchingWeapons) {
      const rank = bestRank(entry)
      if (rank === null) continue

      // Skip re-testing the exact current weapon at the same rank to avoid a duplicate
      if (entry.name === currentWeaponName && rank === currentWeaponRank) continue

      const newWeapon = buildWeapon(entry, rank, selectedChar.name)
      if (!newWeapon) continue

      const newGear = { ...baseChar.gear, weapon: newWeapon }
      const candidate = resolveCharacter(baseChar, newGear)

      const candidateCharactersMap = { ...currentCharactersMap, [selectedChar.name]: candidate }
      // Rebuild characterColumnsMap with candidate's energies (may differ if the weapon changes energy types)
      const candidateColumnsMap = {
        ...characterColumnsMap,
        [selectedChar.name]: Object.keys(candidate.maxEnergies),
      }

      const dps = scoreRotation({
        steps,
        charactersMap: candidateCharactersMap,
        characterColumnsMap: candidateColumnsMap,
        globalColumns,
        enemy,
        tableConfig,
        settings,
        autocastFollowUps: true,
      })

      candidateResults.push({
        label: `${entry.name} ★${rank}`,
        weaponName: entry.name,
        weaponRank: rank,
        dps,
        delta: 0,
        deltaPct: 0,
        isCurrent: false,
      })
    }

    // Sort descending by DPS, then compute deltas vs the current build
    candidateResults.sort((a, b) => b.dps - a.dps)

    const currentResult = candidateResults.find(r => r.isCurrent)
    const baseline = currentResult?.dps ?? currentDPS

    const withDeltas = candidateResults.map(r => ({
      ...r,
      delta: r.dps - baseline,
      deltaPct: baseline > 0 ? ((r.dps - baseline) / baseline) * 100 : 0,
    }))

    setResults(withDeltas)
    setRunning(false)
    setRan(true)
  }, [selectedChar, steps, charactersInBattle, enemy, tableConfig, settings])

  if (!open) return null

  return createPortal(
    <div className="buildOptOverlay" onClick={onClose}>
      <div className="buildOptPanel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="buildOptHeader">
          <span className="buildOptTitle">Build Optimizer</span>
          <button className="buildOptClose" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="buildOptBody">
          {/* Rotation status */}
          {!hasRotation && (
            <div className="buildOptEmptyNote">
              No rotation steps yet. Add actions to the rotation table first.
            </div>
          )}

          {hasRotation && (
            <>
              <div className="buildOptSectionLabel">Rotation</div>
              <div className="buildOptRotationChips">
                {steps.map((s, i) => (
                  <span key={i} className="buildOptStepChip">
                    <span className="buildOptStepChar">{s.character}</span>
                    <span className="buildOptStepAction">{s.action}</span>
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Character selector */}
          <div className="buildOptSectionLabel">Optimize for</div>
          <div className="buildOptCharTabs">
            {charactersInBattle.map(c => (
              <button
                key={c.name}
                className={`buildOptCharTab ${c.name === selectedCharName ? 'active' : ''}`}
                onClick={() => handleSelectChar(c.name)}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Current weapon info */}
          {selectedChar && (
            <div className="buildOptCurrentGear">
              <span className="buildOptGearKey">Current weapon</span>
              <span className="buildOptGearVal">
                {selectedChar.gear.weapon
                  ? `${selectedChar.gear.weapon.name} ★${selectedChar.gear.weapon.rank}`
                  : '—'}
              </span>
            </div>
          )}

          {/* Scope note */}
          <div className="buildOptScopeNote">
            Tries all catalog weapons of this character's type. Echoes stay fixed.
          </div>

          {/* Run button */}
          <button
            className="buildOptRunBtn"
            onClick={runOptimizer}
            disabled={!hasRotation || running}
          >
            {running ? 'Running…' : 'Run Optimizer'}
          </button>

          {/* Results */}
          {ran && results.length > 0 && (
            <>
              <div className="buildOptSectionLabel">
                Results — {results.length} builds ranked
              </div>
              <div className="buildOptResults">
                <div className="buildOptResultHeader">
                  <span className="buildOptColRank">#</span>
                  <span className="buildOptColName">Weapon</span>
                  <span className="buildOptColDps">DPS</span>
                  <span className="buildOptColDelta">vs current</span>
                </div>
                {results.map((r, i) => (
                  <div
                    key={r.label}
                    className={`buildOptResultRow ${r.isCurrent ? 'current' : ''} ${i === 0 ? 'best' : ''}`}
                  >
                    <span className="buildOptColRank">{i + 1}</span>
                    <span className="buildOptColName">
                      {r.weaponName}
                      <span className="buildOptWeaponRank"> ★{r.weaponRank}</span>
                      {r.isCurrent && <span className="buildOptCurrentTag"> current</span>}
                    </span>
                    <span className="buildOptColDps">{r.dps.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    <span className={`buildOptColDelta ${r.deltaPct > 0 ? 'positive' : r.deltaPct < 0 ? 'negative' : 'neutral'}`}>
                      {r.deltaPct === 0 ? '—' : `${r.deltaPct > 0 ? '+' : ''}${r.deltaPct.toFixed(1)}%`}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {ran && results.length === 0 && (
            <div className="buildOptEmptyNote">No results — check that the rotation can be replayed.</div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
