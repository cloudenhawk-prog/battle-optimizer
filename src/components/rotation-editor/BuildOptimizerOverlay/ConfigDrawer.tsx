// Echo Configuration drawer: substat roll tier plus per-slot main-stat / substat toggles for the optimizer.
import type { Dispatch, SetStateAction } from 'react'
import type { ResolvedCharacter } from '../../../types/character'
import type { CharacterStats } from '../../../types/stats'
import { SUBSTAT_OPTIONS, MAIN_STAT_OPTIONS } from '../../../data/gear/echoStats'
import { makeDefaultSlotConfig } from '../../../optimizers/buildOptimizer'
import type { EchoOptConfig } from '../../../optimizers/buildOptimizer'
import { BoCog } from './icons'

// ========== Constants ========================================================================================================

/**
 * All substats eligible for echo optimization — the full SUBSTAT_OPTIONS pool.
 * Every entry here contributes to damage: crit, ATK/HP/DEF (flat and %), energy regen,
 * and action-type bonus DMG multipliers.
 */
const OPTIMIZER_SUBSTATS = SUBSTAT_OPTIONS

// ========== Component ========================================================================================================

type Slot = 1 | 2 | 3 | 4 | 5

type ConfigDrawerProps = {
  configOpen: boolean
  setConfigOpen: Dispatch<SetStateAction<boolean>>
  globalTier: number
  handleSetGlobalTier: (t: number) => void
  selectedChar: ResolvedCharacter | undefined
  echoConfig: EchoOptConfig
  toggleMainStat: (slot: Slot, statKey: keyof CharacterStats) => void
  toggleSubstat: (slot: Slot, statKey: keyof CharacterStats) => void
  setSlotGroupSize: (slot: Slot, n: number) => void
}

// Slides in over the main panel from the right, inside the wrapper so it clips to the panel's border-radius.
// Substat chips cycle off → flexible (active) → pinned → off; slots are listed by echo cost, highest first.
export function ConfigDrawer({
  configOpen,
  setConfigOpen,
  globalTier,
  handleSetGlobalTier,
  selectedChar,
  echoConfig,
  toggleMainStat,
  toggleSubstat,
  setSlotGroupSize,
}: ConfigDrawerProps) {
  return (
    <div className={`buildOptDrawer${configOpen ? ' open' : ''}`} onClick={e => e.stopPropagation()}>
      <div className="buildOptDrawerInner">
        <div className="buildOptDrawerHead">
          <div className="buildOptDrawerTitle">
            <BoCog size={14} teeth={8} />
            Echo Configuration
          </div>
          <button
            className="buildOptCloseBtn"
            onClick={() => setConfigOpen(false)}
            aria-label="Close configuration"
          >
            ✕
          </button>
        </div>

        {/* Tier selector */}
        <div className="buildOptConfigSection">
          <div className="buildOptConfigSectionLabel">Substat Roll Quality</div>
          <div className="buildOptTierRow">
            {([1, 2, 3, 4, 5, 6, 7, 8] as const).map(t => (
              <button
                key={t}
                className={`buildOptTierBtn${globalTier === t ? ' active' : ''}`}
                onClick={() => handleSetGlobalTier(t)}
                title={t === 1 ? 'Lowest roll' : t === 8 ? 'Highest roll' : `Tier ${t}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Per-slot substat toggles */}
        <div className="buildOptConfigSection buildOptEchoConfig">
          <div className="buildOptConfigSectionLabel">Substats to Vary per Echo</div>
          {!selectedChar ? (
            <div className="buildOptEmptyNote">Select a character first.</div>
          ) : (
            ([1, 2, 3, 4, 5] as const)
              .slice()
              .sort((a, b) => {
                const ca = selectedChar.gear.echoSlots[a]?.cost ?? -1
                const cb = selectedChar.gear.echoSlots[b]?.cost ?? -1
                return cb - ca
              })
              .map(slot => {
              const echo = selectedChar.gear.echoSlots[slot]
              const slotCfg = (() => {
                const raw = echoConfig[slot] ?? makeDefaultSlotConfig()
                return { ...raw, pinnedSubstats: raw.pinnedSubstats ?? new Set<keyof CharacterStats>() }
              })()
              const mainStatOptions = echo
                ? (MAIN_STAT_OPTIONS[echo.cost as 1 | 3 | 4] ?? [])
                : []
              const pinnedCount   = slotCfg.pinnedSubstats.size
              const flexibleCount = slotCfg.enabledSubstats.size
              const maxGroup = Math.max(1, flexibleCount)
              return (
                <div key={slot} className={`buildOptEchoSlot${echo ? '' : ' empty'}`}>
                  <div className="buildOptEchoSlotHead">
                    <span className="buildOptEchoSlotLabel">
                      {echo
                        ? <span className="buildOptEchoSlotName">{echo.name}</span>
                        : <span>(empty)</span>
                      }
                    </span>
                    {echo && <span className="buildOptEchoSlotCost">Cost {echo.cost}</span>}
                  </div>
                  {echo ? (
                    <>
                      {/* ── Main Stat ── */}
                      <div className="buildOptEchoSubRow">
                        <span className="buildOptEchoSubLabel">Main Stat</span>
                      </div>
                      <div className="buildOptEchoSubstatGrid">
                        {mainStatOptions.map(s => {
                          const active = slotCfg.enabledMainStats.has(s.key)
                          return (
                            <button
                              key={s.key}
                              className={`buildOptSubstatChip${active ? ' active' : ''}`}
                              onClick={() => toggleMainStat(slot, s.key)}
                              title={s.label}
                            >
                              {s.label}
                            </button>
                          )
                        })}
                      </div>

                      {/* ── Substats ── */}
                      <div className="buildOptEchoSubRow">
                        <span className="buildOptEchoSubLabel">Substats</span>
                        <div className="buildOptGroupRow">
                          <span>pick</span>
                          {[1, 2, 3, 4, 5].map(n => (
                            <button
                              key={n}
                              className={`buildOptGroupBtn${slotCfg.substatGroupSize === n ? ' active' : ''}${n > maxGroup ? ' dim' : ''}`}
                              onClick={() => setSlotGroupSize(slot, n)}
                              title={
                                pinnedCount > 0
                                  ? `Pick ${n} from yellow pool + ${pinnedCount} pinned = ${n + pinnedCount} total`
                                  : `Test combinations of ${n} substats at a time`
                              }
                            >
                              {n}
                            </button>
                          ))}
                          <span>from flexible</span>
                          {pinnedCount > 0 && (
                            <span className="buildOptGroupPinHint">+{pinnedCount} always</span>
                          )}
                        </div>
                      </div>
                      <div className="buildOptEchoSubstatGrid">
                        {OPTIMIZER_SUBSTATS.map(s => {
                          const isFlexible = slotCfg.enabledSubstats.has(s.key)
                          const isPinned   = slotCfg.pinnedSubstats.has(s.key)
                          const cls = isPinned ? ' pinned' : isFlexible ? ' active' : ''
                          return (
                            <button
                              key={s.key}
                              className={`buildOptSubstatChip${cls}`}
                              onClick={() => toggleSubstat(slot, s.key)}
                              title={isPinned ? `${s.label} — always included` : s.isPercent ? `${s.label} (%)` : s.label}
                            >
                              {s.label}
                            </button>
                          )
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="buildOptEchoEmpty">No echo equipped in this slot</div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
