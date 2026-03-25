import { createPortal } from 'react-dom'
import { useState, Fragment } from 'react'
import type { Character } from '../../types/character'
import type { CharacterStats } from '../../types/stats'
import type { Snapshot } from '../../types/snapshot'
import { calculateScalingStat } from '../../utils/calculators/damageCalculator'
import { computeGearStatBreakdown, computeActiveModifierBreakdown, computeFinalStats } from '../../utils/gear/computeStatBreakdown'
import '../../styles/rotation-editor/CharacterStateTracker.css'

// ========== Stat Display Config ==============================================================================================

type StatDisplay = {
  key: string
  label: string
  format: 'flat' | 'percent' | 'integer'
  iconPath?: string
  elementClass?: string
}

const STAT_DISPLAY: StatDisplay[] = [
  { key: 'ATK', label: 'ATK', format: 'flat', iconPath: '/assets/stat-labels/statLabel_ATK.png' },
  { key: 'HP', label: 'HP', format: 'flat', iconPath: '/assets/stat-labels/statLabel_HP.png' },
  { key: 'DEF', label: 'DEF', format: 'flat', iconPath: '/assets/stat-labels/statLabel_DEF.png' },
  { key: 'critRate', label: 'Crit Rate', format: 'percent', iconPath: '/assets/stat-labels/statLabel_critRate.png' },
  { key: 'critDamage', label: 'Crit DMG', format: 'percent', iconPath: '/assets/stat-labels/statLabel_critDamage.png' },
  { key: 'energyPercent', label: 'Energy Regen', format: 'percent', iconPath: '/assets/stat-labels/statLabel_energyPercent.png' },
  { key: 'basicBonusDMG', label: 'Basic Attack DMG Bonus', format: 'percent', iconPath: '/assets/stat-labels/statLabel_basicBonusDMG.png' },
  { key: 'heavyBonusDMG', label: 'Heavy Attack DMG Bonus', format: 'percent', iconPath: '/assets/stat-labels/statLabel_heavyBonusDMG.png' },
  { key: 'skillBonusDMG', label: 'Resonance Skill DMG Bonus', format: 'percent', iconPath: '/assets/stat-labels/statLabel_skillBonusDMG.png' },
  { key: 'liberationBonusDMG', label: 'Resonance Liberation DMG Bonus', format: 'percent', iconPath: '/assets/stat-labels/statLabel_liberationBonusDMG.png' },
  { key: 'glacioBonusDMG', label: 'Glacio DMG Bonus', format: 'percent', iconPath: '/assets/stat-labels/statLabel_glacioBonusDMG.png', elementClass: 'charStatRow--glacio' },
  { key: 'fusionBonusDMG', label: 'Fusion DMG Bonus', format: 'percent', iconPath: '/assets/stat-labels/statLabel_fusionBonusDMG.png', elementClass: 'charStatRow--fusion' },
  { key: 'electroBonusDMG', label: 'Electro DMG Bonus', format: 'percent', iconPath: '/assets/stat-labels/statLabel_electroBonusDMG.png', elementClass: 'charStatRow--electro' },
  { key: 'aeroBonusDMG', label: 'Aero DMG Bonus', format: 'percent', iconPath: '/assets/stat-labels/statLabel_aeroBonusDMG.png', elementClass: 'charStatRow--aero' },
  { key: 'spectroBonusDMG', label: 'Spectro DMG Bonus', format: 'percent', iconPath: '/assets/stat-labels/statLabel_spectroBonusDMG.png', elementClass: 'charStatRow--spectro' },
  { key: 'havocBonusDMG', label: 'Havoc DMG Bonus', format: 'percent', iconPath: '/assets/stat-labels/statLabel_havocBonusDMG.png', elementClass: 'charStatRow--havoc' },
  { key: 'healingBonus', label: 'Healing Bonus', format: 'percent', iconPath: '/assets/stat-labels/statLabel_healingBonus.png' },
  { key: 'tuneBreakBoost', label: 'Tune Break Boost', format: 'integer', iconPath: '/assets/stat-labels/statLabel_tuneBreakBoost.png' },
]

// The three scaling stats need special handling via calculateScalingStat
const SCALING_STAT_KEYS = new Set(['ATK', 'HP', 'DEF'])

// ========== Formatting =======================================================================================================

// Flat numbers use . as thousands separator (European style)
function formatFlat(value: number): string {
  return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function formatStatValue(key: string, value: number, format: StatDisplay['format']): string {
  if (format === 'flat') return formatFlat(value)
  if (format === 'integer') return String(Math.round(value))
  // critDamage is stored as a multiplier (1.5 = 150% base, 2.75 = 275% total)
  // display it as value * 100 so 2.75 → 275.0%
  return (value * 100).toFixed(1) + '%'
}

// ========== Breakdown Data Types =============================================================================================

type BreakdownGroup = {
  key: string
  groupName: string
  total: number
  items: Array<{ name: string; value: number }>
}

type StatBreakdownData =
  | { variant: 'scaling'; stat: 'ATK' | 'HP' | 'DEF'; finalValue: number; baseValue: number; percentGroups: BreakdownGroup[]; flatGroups: BreakdownGroup[] }
  | { variant: 'additive'; key: string; label: string; format: StatDisplay['format']; finalValue: number; groups: BreakdownGroup[] }

function buildGroups(
  extractValue: (stats: Partial<CharacterStats>) => number,
  gearBreakdown: ReturnType<typeof computeGearStatBreakdown>,
  activeBreakdown: ReturnType<typeof computeActiveModifierBreakdown>,
): BreakdownGroup[] {
  const weaponVal = extractValue(gearBreakdown.weapon.total)
  const echoesTotal = extractValue(gearBreakdown.echoes.total)
  const echoItems = gearBreakdown.echoes.items.map(e => ({ name: e.name, value: extractValue(e.stats) })).filter(i => i.value !== 0)
  const setBonusVal = gearBreakdown.setBonus ? extractValue(gearBreakdown.setBonus.total) : 0
  const setBonusItems = gearBreakdown.setBonus && setBonusVal !== 0 ? [{ name: gearBreakdown.setBonus.name, value: setBonusVal }] : []
  const passiveTotal = extractValue(gearBreakdown.passiveMods.total)
  const passiveItems = gearBreakdown.passiveMods.items.map(m => ({ name: m.name, value: extractValue(m.stats) })).filter(i => i.value !== 0)
  const selfTotal = extractValue(activeBreakdown.selfBuffs.total)
  const selfItems = activeBreakdown.selfBuffs.items.map(m => ({ name: m.name, value: extractValue(m.stats) })).filter(i => i.value !== 0)
  const teamTotal = extractValue(activeBreakdown.teamBuffs.total)
  const teamItems = activeBreakdown.teamBuffs.items.map(m => ({ name: m.name, value: extractValue(m.stats) })).filter(i => i.value !== 0)

  return [
    { key: 'weapon', groupName: 'Weapon', total: weaponVal, items: weaponVal !== 0 ? [{ name: gearBreakdown.weapon.name, value: weaponVal }] : [] },
    { key: 'echoes', groupName: 'Echoes', total: echoesTotal, items: echoItems },
    { key: 'setBonus', groupName: 'Set Bonus', total: setBonusVal, items: setBonusItems },
    { key: 'passiveMods', groupName: 'Passives', total: passiveTotal, items: passiveItems },
    { key: 'selfBuffs', groupName: 'Self Buffs', total: selfTotal, items: selfItems },
    { key: 'teamBuffs', groupName: 'Team Buffs', total: teamTotal, items: teamItems },
  ]
}

function getBreakdownData(
  statKey: string,
  label: string,
  format: StatDisplay['format'],
  finalStats: CharacterStats,
  gearBreakdown: ReturnType<typeof computeGearStatBreakdown>,
  activeBreakdown: ReturnType<typeof computeActiveModifierBreakdown>,
  baseStat: CharacterStats,
): StatBreakdownData {
  if (SCALING_STAT_KEYS.has(statKey)) {
    const s = statKey as 'ATK' | 'HP' | 'DEF'
    const baseKey = `base${s}` as keyof CharacterStats
    const bonusKey = `bonus${s}` as keyof CharacterStats
    const flatKey = `flat${s}` as keyof CharacterStats

    return {
      variant: 'scaling',
      stat: s,
      finalValue: calculateScalingStat(finalStats, s),
      baseValue: (baseStat[baseKey] as number) ?? 0,
      percentGroups: buildGroups(
        stats => (stats[bonusKey] as number | undefined) ?? 0,
        gearBreakdown,
        activeBreakdown,
      ),
      flatGroups: buildGroups(
        stats => (stats[flatKey] as number | undefined) ?? 0,
        gearBreakdown,
        activeBreakdown,
      ),
    }
  }

  const k = statKey as keyof CharacterStats
  const getVal = (stats: Partial<CharacterStats>): number => (stats[k] as number | undefined) ?? 0

  // Base = the residual after subtracting all gear/buff contributions from character.stats.
  // This captures the character's own definition + game defaults without double-counting gear.
  // e.g. critRate: 0.05 default + any char-level stat; energyPercent: 1.0 for Cartethyia.
  const resolvedBase = (baseStat[k] as number) ?? 0
  const charBase = resolvedBase
    - getVal(gearBreakdown.weapon.total)
    - getVal(gearBreakdown.echoes.total)
    - (gearBreakdown.setBonus ? getVal(gearBreakdown.setBonus.total) : 0)
    - getVal(gearBreakdown.passiveMods.total)

  return {
    variant: 'additive',
    key: statKey,
    label,
    format,
    finalValue: (finalStats[k] as number) ?? 0,
    groups: [{ key: 'base', groupName: 'Base', total: charBase, items: [] }, ...buildGroups(getVal, gearBreakdown, activeBreakdown)],
  }
}

// ========== Sub-component: Breakdown Modal ===================================================================================

type BreakdownModalProps = {
  statDisplay: StatDisplay
  finalStats: CharacterStats
  gearBreakdown: ReturnType<typeof computeGearStatBreakdown>
  activeBreakdown: ReturnType<typeof computeActiveModifierBreakdown>
  baseStat: CharacterStats
  onClose: () => void
}

function BreakdownModal({ statDisplay, finalStats, gearBreakdown, activeBreakdown, baseStat, onClose }: BreakdownModalProps) {
  const data = getBreakdownData(
    statDisplay.key,
    statDisplay.label,
    statDisplay.format,
    finalStats,
    gearBreakdown,
    activeBreakdown,
    baseStat,
  )

  function renderGroupsTable(
    groups: BreakdownGroup[],
    formatValue: (v: number) => string,
    formatEquiv?: (v: number) => string,
  ) {
    const overallTotal = groups.reduce((sum, g) => sum + g.total, 0)

    return (
      <table className="charStatBreakdownTable">
        <tbody>
          {groups.map((group, groupIndex) => {
            const visibleItems = group.items.filter(i => i.value !== 0)
            return (
              <Fragment key={group.key}>
                <tr className={`charStatBreakdownGroupRow${groupIndex > 0 ? ' charStatBreakdownGroupRow--separator' : ''}`}>
                  <td className="charStatBreakdownSource">{group.groupName}</td>
                  <td className="charStatBreakdownValue">
                    {formatEquiv && <span className="charStatBreakdownEquiv">({formatEquiv(group.total)})</span>}
                    {formatValue(group.total)}
                  </td>
                </tr>
                {visibleItems.map(item => (
                  <tr key={item.name} className="charStatBreakdownItemRow">
                    <td className="charStatBreakdownSource">{item.name}</td>
                    <td className="charStatBreakdownValue">
                      {formatEquiv && <span className="charStatBreakdownEquiv">({formatEquiv(item.value)})</span>}
                      {formatValue(item.value)}
                    </td>
                  </tr>
                ))}
              </Fragment>
            )
          })}
          <tr className="charStatBreakdownRow charStatBreakdownRow--total">
            <td className="charStatBreakdownSource">Total</td>
            <td className="charStatBreakdownValue">
              {formatEquiv && <span className="charStatBreakdownEquiv">({formatEquiv(overallTotal)})</span>}
              {formatValue(overallTotal)}
            </td>
          </tr>
        </tbody>
      </table>
    )
  }

  return (
    <div className="charStatBreakdown" role="dialog" aria-modal="true">
      <div className="charStatBreakdownHeader">
        <span className="charStatBreakdownTitle">{statDisplay.label}</span>
        <button className="overlayCloseButton" onClick={onClose} aria-label="Close breakdown">✕</button>
      </div>

      <div className="charStatBreakdownBody">
        {data.variant === 'scaling' && (
          <>
            <div className="charStatBreakdownTotal">
              Total {statDisplay.label}: {formatFlat(data.finalValue)}
            </div>
            <div className="charStatBreakdownTotal">
              Base {statDisplay.label}: {formatFlat(data.baseValue)}
            </div>

            <div className="charStatBreakdownSection">
                <div className="charStatBreakdownSectionTitle">{statDisplay.label}%</div>
                {renderGroupsTable(
                  data.percentGroups,
                  v => `${(v * 100).toFixed(1)}%`,
                  v => formatFlat(data.baseValue * v),
                )}
              </div>

            <div className="charStatBreakdownSection">
                <div className="charStatBreakdownSectionTitle">{statDisplay.label} Flat</div>
                {renderGroupsTable(
                  data.flatGroups,
                  v => formatFlat(v),
                )}
              </div>
          </>
        )}

        {data.variant === 'additive' && (
          <>
            <div className="charStatBreakdownTotal">
              Total {statDisplay.label}: {formatStatValue(data.key, data.finalValue, data.format)}
            </div>
            <div className="charStatBreakdownSection">
              {renderGroupsTable(
                data.groups,
                v => formatStatValue(data.key, v, data.format),
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ========== Component: Character Profile Overlay =============================================================================

type CharacterProfileOverlayProps = {
  characterName: string
  character: Character
  snapshot: Snapshot | null
  allCharacters: Character[]
  onClose: () => void
}

export function CharacterProfileOverlay({ characterName, character, snapshot, allCharacters, onClose }: CharacterProfileOverlayProps) {
  const [selectedStat, setSelectedStat] = useState<string | null>(null)

  const finalStats = computeFinalStats(character, snapshot, allCharacters)
  const gearBreakdown = computeGearStatBreakdown(character)
  const activeBreakdown = computeActiveModifierBreakdown(character, snapshot, allCharacters)
  const baseStat = character.stats as CharacterStats

  function getDisplayValue(stat: StatDisplay): number {
    if (SCALING_STAT_KEYS.has(stat.key)) {
      return calculateScalingStat(finalStats, stat.key as 'ATK' | 'HP' | 'DEF')
    }
    return (finalStats[stat.key as keyof CharacterStats] as number) ?? 0
  }

  const selectedStatDisplay = selectedStat !== null ? STAT_DISPLAY.find(s => s.key === selectedStat) ?? null : null

  return createPortal(
    <div className="charProfileOverlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="charProfileTitle">
      <div className="charProfileContent" onClick={e => e.stopPropagation()}>
        <div className="charProfileHeader">
          <h2 id="charProfileTitle" className="charProfileTitle">{characterName}</h2>
          <button className="overlayCloseButton" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="charProfileBody">
          <div className="charStatList">
            {STAT_DISPLAY.map(stat => (
              <div
                key={stat.key}
                className={`charStatRow${stat.elementClass ? ` ${stat.elementClass}` : ''}${selectedStat === stat.key ? ' charStatRow--active' : ''}`}
              >
                <img
                  src={stat.iconPath}
                  alt={stat.label}
                  className="charStatIcon"
                />
                <span className="charStatLabel">{stat.label}</span>
                <button
                  type="button"
                  className="charStatValue"
                  onClick={() => setSelectedStat(prev => prev === stat.key ? null : stat.key)}
                >
                  {formatStatValue(stat.key, getDisplayValue(stat), stat.format)}
                </button>
              </div>
            ))}
          </div>

          {selectedStatDisplay !== null && (
            <BreakdownModal
              statDisplay={selectedStatDisplay}
              finalStats={finalStats}
              gearBreakdown={gearBreakdown}
              activeBreakdown={activeBreakdown}
              baseStat={baseStat}
              onClose={() => setSelectedStat(null)}
            />
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
