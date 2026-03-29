import { createPortal } from 'react-dom'
import { useState, useRef, useEffect, Fragment } from 'react'
import { motion } from 'framer-motion'
import type { Character } from '../../types/character'
import type { CharacterStats } from '../../types/stats'
import type { Snapshot } from '../../types/snapshot'
import type { Echo, Weapon, EchoSlots } from '../../types/gear'
import { calculateScalingStat } from '../../utils/calculators/damageCalculator'
import { computeGearStatBreakdown, computeActiveModifierBreakdown, computeFinalStats } from '../../utils/gear/computeStatBreakdown'
import '../../styles/rotation-editor/CharacterStateTracker.css'
import '../../styles/rotation-editor/DataOverlay.css'
import '../../styles/rotation-editor/CharacterProfileOverlay.css'

// ========== Element Theme ====================================================================================================

type ElementTheme = { primary: string; bg: string; label: string }

const ELEMENT_THEMES: Record<string, ElementTheme> = {
  AERO:    { primary: '160 80% 55%', bg: '160 40% 8%',  label: 'Aero' },
  SPECTRO: { primary: '45 100% 60%', bg: '45 60% 8%',   label: 'Spectro' },
  HAVOC:   { primary: '270 80% 60%', bg: '270 40% 8%',  label: 'Havoc' },
  ELECTRO: { primary: '280 100% 65%', bg: '280 50% 8%', label: 'Electro' },
  GLACIO:  { primary: '200 100% 70%', bg: '200 50% 8%', label: 'Glacio' },
  FUSION:  { primary: '15 100% 55%', bg: '15 50% 8%',   label: 'Fusion' },
}

function getTheme(element: string): ElementTheme {
  return ELEMENT_THEMES[element] ?? { primary: '220 15% 60%', bg: '220 15% 8%', label: element || '—' }
}

// ========== Demo-style constants =============================================================================================

const MUTED = 'hsl(210 15% 50%)'
const FONT_DISPLAY = '"Orbitron", sans-serif'
const FONT_MONO = '"Share Tech Mono", monospace'
const FONT_BODY = '"Rajdhani", "Segoe UI", sans-serif'

// ========== Asset Path Helper ================================================================================================

function assetPath(path: string): string {
  return path.startsWith('/') ? path : '/' + path
}

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

// Element name extracted from elementClass, e.g. 'charStatRow--glacio' → 'glacio'
// Used to compose the per-element CSS animation class on the icon img.

// ========== Gear Stat Display ================================================================================================

const GEAR_STAT_LABELS: Record<string, { label: string; format: StatDisplay['format'] }> = {
  bonusATK:           { label: 'ATK%',              format: 'percent' },
  bonusHP:            { label: 'HP%',               format: 'percent' },
  bonusDEF:           { label: 'DEF%',              format: 'percent' },
  flatATK:            { label: 'ATK',               format: 'flat' },
  flatHP:             { label: 'HP',                format: 'flat' },
  flatDEF:            { label: 'DEF',               format: 'flat' },
  baseATK:            { label: 'Base ATK',          format: 'flat' },
  baseHP:             { label: 'Base HP',           format: 'flat' },
  baseDEF:            { label: 'Base DEF',          format: 'flat' },
  critRate:           { label: 'Crit Rate',         format: 'percent' },
  critDamage:         { label: 'Crit DMG',          format: 'percent' },
  energyPercent:      { label: 'Energy Regen',      format: 'percent' },
  healingBonus:       { label: 'Healing Bonus',     format: 'percent' },
  glacioBonusDMG:     { label: 'Glacio DMG',        format: 'percent' },
  fusionBonusDMG:     { label: 'Fusion DMG',        format: 'percent' },
  electroBonusDMG:    { label: 'Electro DMG',       format: 'percent' },
  aeroBonusDMG:       { label: 'Aero DMG',          format: 'percent' },
  spectroBonusDMG:    { label: 'Spectro DMG',       format: 'percent' },
  havocBonusDMG:      { label: 'Havoc DMG',         format: 'percent' },
  basicBonusDMG:      { label: 'Basic ATK DMG',     format: 'percent' },
  heavyBonusDMG:      { label: 'Heavy ATK DMG',     format: 'percent' },
  skillBonusDMG:      { label: 'Skill DMG',         format: 'percent' },
  liberationBonusDMG: { label: 'Liberation DMG',    format: 'percent' },
  tuneBreakBoost:     { label: 'Tune Break Boost',  format: 'integer' },
}

function formatGearStats(stats: Partial<CharacterStats>): Array<{ label: string; value: string }> {
  return Object.entries(stats)
    .filter(([, v]) => typeof v === 'number' && v !== 0)
    .flatMap(([k, v]) => {
      const entry = GEAR_STAT_LABELS[k]
      if (!entry) return []
      return [{ label: entry.label, value: formatStatValue(k, v as number, entry.format) }]
    })
}

// ========== Formatting =======================================================================================================

// Flat numbers use . as thousands separator (European style)
function formatFlat(value: number): string {
  return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function formatStatValue(_key: string, value: number, format: StatDisplay['format']): string {
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

// ========== Tooltip ==========================================================================================================

type TooltipData = { x: number; y: number; content: React.ReactNode }

function tooltipStyle(x: number, y: number): React.CSSProperties {
  const W = 340
  return {
    position: 'fixed',
    left: Math.min(x + 14, window.innerWidth - W - 8),
    top: Math.max(y - 16, 8),
    zIndex: 300,
    pointerEvents: 'none',
    background: 'hsl(222 28% 9%)',
    border: '1px solid rgba(100, 120, 170, 0.28)',
    borderRadius: 8,
    padding: '10px 12px',
    boxShadow: '0 8px 28px rgba(0, 0, 0, 0.75)',
    color: 'var(--table-text)',
    maxWidth: W,
    fontSize: '0.8rem',
    lineHeight: 1.5,
  }
}

// ========== Sub-component: Section Header ====================================================================================

function SectionHeader({ label, elColor }: { label: string; elColor: string }) {
  return (
    <div className="cpo-section-header">
      <div className="cpo-section-header-line" style={{ background: `linear-gradient(90deg, hsl(${elColor} / 0.3), transparent)` }} />
      <span className="cpo-section-header-label">{label}</span>
      <div className="cpo-section-header-line" style={{ background: `linear-gradient(90deg, transparent, hsl(${elColor} / 0.3))` }} />
    </div>
  )
}

// ========== Sub-component: Corner Accents ====================================================================================

function CornerAccents({ elColor }: { elColor: string }) {
  const b = `1.5px solid hsl(${elColor} / 0.4)`
  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 8, borderTop: b, borderLeft: b, borderTopLeftRadius: 6, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderTop: b, borderRight: b, borderTopRightRadius: 6, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 8, height: 8, borderBottom: b, borderLeft: b, borderBottomLeftRadius: 6, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderBottom: b, borderRight: b, borderBottomRightRadius: 6, pointerEvents: 'none' }} />
    </>
  )
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

// ========== Sub-component: Equipment Orbit ===================================================================================

const ORBIT_POSITIONS = [
  { angle: -90 },  // Weapon — top
  { angle: 90 },   // Echo slot 1 (main) — bottom
  { angle: -30 },  // Echo slot 2 — top-right
  { angle: 30 },   // Echo slot 3 — bottom-right
  { angle: 150 },  // Echo slot 4 — bottom-left
  { angle: 210 },  // Echo slot 5 — top-left
]

function EquipmentOrbit({ weapon, echoSlots, elColor, onTooltip }: {
  weapon: Weapon
  echoSlots: EchoSlots
  elColor: string
  onTooltip: (t: TooltipData | null) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setContainerSize(Math.min(width, height))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const radius = Math.max(60, containerSize / 2 - 120)
  const size = containerSize
  const center = size / 2
  const largeSlot = Math.max(60, Math.min(92, Math.round(radius * 0.36)))
  const baseSlot = Math.max(52, Math.min(80, Math.round(radius * 0.32)))

  const items: Array<{ type: 'weapon'; data: Weapon } | { type: 'echo'; data: Echo | null; slot: 1 | 2 | 3 | 4 | 5 }> = [
    { type: 'weapon', data: weapon },
    { type: 'echo', data: echoSlots[1], slot: 1 },
    { type: 'echo', data: echoSlots[2], slot: 2 },
    { type: 'echo', data: echoSlots[3], slot: 3 },
    { type: 'echo', data: echoSlots[4], slot: 4 },
    { type: 'echo', data: echoSlots[5], slot: 5 },
  ]

  return (
    <div ref={containerRef} className="cpo-orbit-container">
      {size > 0 && (
      <div style={{ position: 'relative', width: size, height: size }}>
      {/* Orbit ring + concentric ripple circles */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke={`hsl(${elColor} / 0.1)`} strokeWidth="1" strokeDasharray="4 6" />
        <circle cx={center} cy={center} r={radius + 22} fill="none" stroke={`hsl(${elColor} / 0.09)`} strokeWidth="0.75" />
        <circle cx={center} cy={center} r={radius + 52} fill="none" stroke={`hsl(${elColor} / 0.055)`} strokeWidth="0.65" />
        <circle cx={center} cy={center} r={radius + 94} fill="none" stroke={`hsl(${elColor} / 0.03)`} strokeWidth="0.5" />
        <circle cx={center} cy={center} r={radius + 152} fill="none" stroke={`hsl(${elColor} / 0.015)`} strokeWidth="0.4" />
      </svg>

      {/* Orbiting energy particle */}
      <motion.div
        style={{ position: 'absolute', width: size, height: size, pointerEvents: 'none' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <div style={{
          position: 'absolute',
          width: 6, height: 6, borderRadius: '50%',
          left: center + radius - 3,
          top: center - 3,
          background: `hsl(${elColor} / 0.6)`,
          boxShadow: `0 0 8px hsl(${elColor} / 0.4), 0 0 16px hsl(${elColor} / 0.2)`,
        }} />
      </motion.div>

      {/* SVG: orbit tick marks */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {Array.from({ length: 24 }).map((_, i) => {
          const angleDeg = i * 15 - 90
          const rad = (angleDeg * Math.PI) / 180
          // every 4th tick lands on a slot angle (60° spacing)
          const isSlot = i % 4 === 0
          const tickLen = isSlot ? 10 : 5
          const inner = radius - tickLen / 2
          const outer = radius + tickLen / 2
          return (
            <line
              key={i}
              x1={center + Math.cos(rad) * inner}
              y1={center + Math.sin(rad) * inner}
              x2={center + Math.cos(rad) * outer}
              y2={center + Math.sin(rad) * outer}
              stroke={`hsl(${elColor} / ${isSlot ? 0.4 : 0.15})`}
              strokeWidth={isSlot ? 1.5 : 1}
            />
          )
        })}
      </svg>

      {/* Slots */}
      {items.map((item, i) => {
        const rad = (ORBIT_POSITIONS[i].angle * Math.PI) / 180
        const x = center + Math.cos(rad) * radius
        const y = center + Math.sin(rad) * radius
        const isLarge = item.type === 'weapon' || (item.type === 'echo' && (item.data?.cost ?? 0) >= 4)
        const slotSize = isLarge ? largeSlot : baseSlot

        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)' }}>
            {item.type === 'weapon' ? (
              <GearSlot
                icon={assetPath(item.data.icon)}
                primaryLabel={`R${item.data.rank}`}
                secondaryLabel={item.data.name}
                elColor={elColor}
                size={slotSize}
                delay={0.35 + i * 0.08}
                tooltipContent={
                  (() => {
                    const weaponStats = formatGearStats(item.data.stats)
                    return (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.data.name}</span>
                          <span style={{ fontSize: '0.72rem', color: `hsl(${elColor})`, fontWeight: 600 }}>R{item.data.rank}</span>
                        </div>
                        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, hsl(${elColor} / 0.3), transparent)`, marginBottom: 8 }} />
                        {weaponStats.length > 0 && (
                          <div style={{ marginBottom: 8 }}>
                            {weaponStats.map(({ label, value }) => (
                              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: '0.75rem', padding: '2px 0' }}>
                                <span style={{ color: 'rgba(150, 165, 195, 0.8)' }}>{label}</span>
                                <span style={{ color: `hsl(${elColor} / 0.9)`, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
                              </div>
                            ))}
                            <div style={{ height: 1, background: `linear-gradient(90deg, transparent, hsl(${elColor} / 0.3), transparent)`, margin: '8px 0' }} />
                          </div>
                        )}
                        <p style={{ margin: 0, fontSize: '0.76rem', color: 'rgba(180, 190, 214, 0.88)', lineHeight: 1.55 }}>{item.data.info || 'No additional information available.'}</p>
                      </div>
                    )
                  })()
                }
                typeTag="Weapon"
                onTooltip={onTooltip}
              />
            ) : (
              <GearSlot
                icon={item.data ? assetPath(item.data.icon) : undefined}
                primaryLabel={item.data ? `${item.data.cost}C` : undefined}
                secondaryLabel={item.data ? item.data.name : undefined}
                elColor={elColor}
                size={slotSize}
                delay={0.35 + i * 0.08}
                tooltipContent={item.data ? (
                  (() => {
                    const mainStats = formatGearStats(item.data.baseStats)
                    const subStats = formatGearStats(item.data.subStats)
                    return (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          {item.data.info_icon && (
                            <img src={assetPath(item.data.info_icon)} alt={item.data.name} style={{ width: 44, height: 44, objectFit: 'contain', flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          )}
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.data.name}</div>
                            <div style={{ fontSize: '0.72rem', color: `hsl(${elColor})`, fontWeight: 600 }}>{item.data.cost} Cost</div>
                          </div>
                        </div>
                        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, hsl(${elColor} / 0.3), transparent)`, marginBottom: 8 }} />
                        {mainStats.length > 0 && (
                          <div style={{ marginBottom: 6 }}>
                            <div style={{ fontSize: '0.62rem', fontFamily: FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(140, 155, 185, 0.7)', marginBottom: 4 }}>Main Stat</div>
                            {mainStats.map(({ label, value }) => (
                              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: '0.75rem', padding: '2px 0' }}>
                                <span style={{ color: 'rgba(150, 165, 195, 0.8)' }}>{label}</span>
                                <span style={{ color: `hsl(${elColor} / 0.9)`, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {subStats.length > 0 && (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: '0.62rem', fontFamily: FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(140, 155, 185, 0.7)', marginBottom: 4 }}>Sub Stats</div>
                            {subStats.map(({ label, value }) => (
                              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: '0.75rem', padding: '2px 0' }}>
                                <span style={{ color: 'rgba(150, 165, 195, 0.8)' }}>{label}</span>
                                <span style={{ color: 'rgba(170, 185, 215, 0.85)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {(mainStats.length > 0 || subStats.length > 0) && (
                          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, hsl(${elColor} / 0.3), transparent)`, marginBottom: 8 }} />
                        )}
                        <p style={{ margin: 0, fontSize: '0.76rem', color: 'rgba(180, 190, 214, 0.88)', lineHeight: 1.55 }}>{item.data.info || 'No additional information available.'}</p>
                      </div>
                    )
                  })()
                ) : null}
                typeTag={item.slot === 1 ? 'Main Echo' : item.data ? 'Echo' : undefined}
                onTooltip={onTooltip}
              />
            )}
          </div>
        )
      })}
      </div>
      )}
    </div>
  )
}

// ========== Sub-component: Gear Slot (shared for weapon & echo) ==============================================================

function GearSlot({ icon, primaryLabel, secondaryLabel, elColor, size, delay, tooltipContent, onTooltip, typeTag }: {
  icon?: string
  primaryLabel?: string
  secondaryLabel?: string
  elColor: string
  size: number
  delay: number
  tooltipContent: React.ReactNode
  onTooltip: (t: TooltipData | null) => void
  typeTag?: string
}) {
  const hasItem = icon !== undefined || primaryLabel !== undefined

  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.35, type: 'spring', stiffness: 200 }}
      style={{ position: 'relative', width: size, height: size, cursor: hasItem ? 'pointer' : 'default' }}
      onMouseEnter={hasItem ? (e) => onTooltip({ x: e.clientX, y: e.clientY, content: tooltipContent }) : undefined}
      onMouseMove={hasItem ? (e) => onTooltip({ x: e.clientX, y: e.clientY, content: tooltipContent }) : undefined}
      onMouseLeave={hasItem ? () => onTooltip(null) : undefined}
    >
      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 8,
        background: hasItem
          ? `linear-gradient(135deg, hsl(${elColor} / ${typeTag ? 0.13 : 0.08}), rgba(30, 33, 55, 0.6))`
          : 'rgba(30, 33, 42, 0.3)',
        border: `1px solid ${hasItem ? `hsl(${elColor} / ${typeTag ? 0.4 : 0.25})` : 'rgba(80, 85, 100, 0.2)'}`,
        transition: 'border-color 0.2s',
      }} />

      {/* Hover glow */}
      {hasItem && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 8, opacity: 0,
          boxShadow: `inset 0 0 20px hsl(${elColor} / 0.1), 0 0 12px hsl(${elColor} / 0.15)`,
          transition: 'opacity 0.3s',
        }} />
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2px' }}>
        {icon ? (
          <img src={icon} alt={primaryLabel} style={{ width: '92%', height: '92%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        ) : hasItem ? (
          <>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: '0.7rem', fontWeight: 700, color: `hsl(${elColor} / 0.9)`, lineHeight: 1 }}>
              {primaryLabel}
            </span>
            {secondaryLabel && (
              <span style={{ fontFamily: FONT_BODY, fontSize: '0.55rem', color: MUTED, marginTop: 2, maxWidth: '90%', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                {secondaryLabel}
              </span>
            )}
          </>
        ) : (
          <span style={{ color: 'rgba(100, 110, 130, 0.3)', fontSize: '1.1rem', lineHeight: 1 }}>+</span>
        )}
      </div>

      {/* Corner accents */}
      {hasItem && <CornerAccents elColor={elColor} />}

      {/* Slot type label */}
      {typeTag && (
        <div style={{
          position: 'absolute',
          top: size + 4,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '0.65rem',
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: `hsl(${elColor} / 0.6)`,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          textShadow: `0 0 8px hsl(${elColor} / 0.35)`,
        }}>
          {typeTag}
        </div>
      )}
    </motion.div>
  )
}

// ========== Sub-component: Horizontal Sequence Chain =========================================================================

function HorizontalSequenceChain({ sequence, sequenceNodes, sequenceNodeIcons, elColor, onTooltip }: {
  sequence: number
  sequenceNodes: string[]
  sequenceNodeIcons: string[]
  elColor: string
  onTooltip: (t: TooltipData | null) => void
}) {
  const nodes = sequenceNodes.slice(0, 6)

  function makeTooltip(i: number, desc: string, active: boolean) {
    const iconPath = sequenceNodeIcons[i] ? assetPath(sequenceNodeIcons[i]) : null
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          {iconPath && (
            <img
              src={iconPath}
              alt={`S${i + 1}`}
              style={{
                width: 36, height: 36, objectFit: 'contain', flexShrink: 0,
                filter: active ? undefined : 'grayscale(1) opacity(0.4)',
                borderRadius: 4,
              }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: active ? `hsl(${elColor})` : 'hsl(195 100% 90%)' }}>
              Sequence {i + 1}
            </span>
            <span style={{ fontSize: '0.68rem', color: MUTED }}>{active ? 'Unlocked' : 'Locked'}</span>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '0.76rem', color: 'rgba(175, 185, 210, 0.9)', lineHeight: 1.55 }}>{desc}</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
      {nodes.map((desc, i) => {
        const active = i < sequence
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.06, duration: 0.3, type: 'spring', stiffness: 300 }}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              onMouseEnter={e => onTooltip({ x: e.clientX, y: e.clientY, content: makeTooltip(i, desc, active) })}
              onMouseMove={e => onTooltip({ x: e.clientX, y: e.clientY, content: makeTooltip(i, desc, i < sequence) })}
              onMouseLeave={() => onTooltip(null)}
            >
              {/* Circle node */}
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1.5px solid ${active ? `hsl(${elColor})` : 'rgba(120, 130, 150, 0.4)'}`,
                background: active
                  ? `radial-gradient(circle, hsl(${elColor} / 0.25), hsl(${elColor} / 0.05))`
                  : 'rgba(30, 35, 45, 0.5)',
                boxShadow: active ? `0 0 10px hsl(${elColor} / 0.45), inset 0 0 5px hsl(${elColor} / 0.15)` : 'none',
                transition: 'all 0.3s',
                overflow: 'hidden',
              }}>
                {sequenceNodeIcons[i] ? (
                  <img
                    src={assetPath(sequenceNodeIcons[i])}
                    alt={`S${i + 1}`}
                    style={{
                      width: '90%', height: '90%', objectFit: 'contain',
                      filter: active ? undefined : 'grayscale(1) opacity(0.35)',
                    }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <span style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: '0.6rem', fontWeight: 900,
                    color: active ? `hsl(${elColor})` : 'rgba(120, 130, 150, 0.5)',
                  }}>
                    {i + 1}
                  </span>
                )}
              </div>

              {/* Ping ring for active nodes */}
              {active && (
                <motion.div
                  style={{
                    position: 'absolute', width: 32, height: 32, borderRadius: '50%',
                    border: `1px solid hsl(${elColor} / 0.3)`,
                    pointerEvents: 'none',
                  }}
                  animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: i * 0.3 }}
                />
              )}
            </motion.div>

            {/* Connector line */}
            {i < nodes.length - 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5 + i * 0.06, duration: 0.3 }}
                style={{
                  width: 24, height: 2,
                  transformOrigin: 'left',
                  borderRadius: 99,
                  background: i < sequence - 1
                    ? `hsl(${elColor} / 0.6)`
                    : i < sequence
                      ? `linear-gradient(90deg, hsl(${elColor} / 0.4), rgba(80, 90, 100, 0.25))`
                      : 'rgba(80, 90, 100, 0.15)',
                  boxShadow: i < sequence - 1 ? `0 0 4px hsl(${elColor} / 0.3)` : 'none',
                }}
              />
            )}
          </div>
        )
      })}
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

export function CharacterProfileOverlay({ characterName: _characterName, character, snapshot, allCharacters, onClose }: CharacterProfileOverlayProps) {
  console.log("Character name not used yet:", _characterName)
  const [selectedStat, setSelectedStat] = useState<string | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)

  const finalStats = computeFinalStats(character, snapshot, allCharacters)
  const gearBreakdown = computeGearStatBreakdown(character)
  const activeBreakdown = computeActiveModifierBreakdown(character, snapshot, allCharacters)
  const baseStat = character.stats as CharacterStats
  const elTheme = getTheme(character.element)

  function handleClose() {
    setTooltip(null)
    setIsClosing(true)
  }

  function getDisplayValue(stat: StatDisplay): number {
    if (SCALING_STAT_KEYS.has(stat.key)) {
      return calculateScalingStat(finalStats, stat.key as 'ATK' | 'HP' | 'DEF')
    }
    return (finalStats[stat.key as keyof CharacterStats] as number) ?? 0
  }

  const selectedStatDisplay = selectedStat !== null ? STAT_DISPLAY.find(s => s.key === selectedStat) ?? null : null

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isClosing ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        onClick={handleClose}
        role="presentation"
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(25, 25, 30, 0.75)',
          backdropFilter: 'blur(12px)',
        }}
      />

      {/* Panel */}
      <motion.div
        className="charProfilePanel"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: isClosing ? 0 : 1, scale: isClosing ? 0.96 : 1, y: isClosing ? 16 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onAnimationComplete={() => { if (isClosing) onClose() }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="charProfileTitle"
        style={{
          boxShadow: `var(--table-shadow-inner), var(--table-shadow-main), var(--table-shadow-glow), 0 0 60px hsl(${elTheme.primary} / 0.1)`,
          border: `1px solid hsl(${elTheme.primary} / 0.2)`,
        }}
      >
        {/* Top accent line */}
        <div style={{ height: 1, flexShrink: 0, background: `linear-gradient(90deg, transparent, hsl(${elTheme.primary} / 0.6), transparent)` }} />

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 20px 10px 20px',
          borderBottom: '1px solid var(--table-border)',
          flexShrink: 0,
          background: `linear-gradient(90deg, hsl(${elTheme.primary} / 0.06) 0%, transparent 40%), var(--table-header-bg)`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Left color accent bar */}
            <div style={{
              width: 3, alignSelf: 'stretch',
              borderRadius: 99,
              background: `linear-gradient(180deg, hsl(${elTheme.primary}), hsl(${elTheme.primary} / 0.25))`,
              boxShadow: `0 0 8px hsl(${elTheme.primary} / 0.5)`,
              flexShrink: 0,
            }} />
            <div>
              <h2 id="charProfileTitle" style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--table-text)' }}>
                {character.name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                {/* Level badge */}
                <span style={{
                  fontFamily: FONT_MONO, fontSize: '0.65rem',
                  color: MUTED,
                  background: 'rgba(30, 40, 60, 0.7)',
                  border: '1px solid rgba(80, 90, 110, 0.3)',
                  borderRadius: 99, padding: '1px 7px',
                  letterSpacing: '0.04em',
                }}>
                  Lv.{(character.stats as Partial<CharacterStats>).level ?? '—'}
                </span>
                {/* Element badge */}
                <span style={{
                  fontFamily: FONT_DISPLAY, fontSize: '0.58rem', fontWeight: 700,
                  color: `hsl(${elTheme.primary})`,
                  background: `hsl(${elTheme.primary} / 0.12)`,
                  border: `1px solid hsl(${elTheme.primary} / 0.35)`,
                  borderRadius: 99, padding: '1px 8px',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                  {elTheme.label}
                </span>
              </div>
            </div>
          </div>

          <button
            className="cpo-close-btn"
            onClick={handleClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="cpo-content">
          <div className="cpo-body">

            {/* ── LEFT COL: Portrait + Stats ── */}
            <div className="cpo-left-col" style={{ borderRight: `1px solid hsl(${elTheme.primary} / 0.1)` }}>
              {character.image && (
                <div className="cpo-portrait-wrap">
                  <img
                    src={assetPath(character.image)}
                    alt={character.name}
                    className="cpo-portrait"
                    style={{ borderColor: `hsl(${elTheme.primary} / 0.35)`, boxShadow: `0 0 20px hsl(${elTheme.primary} / 0.2)` }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
              )}

              <SectionHeader label="Attributes" elColor={elTheme.primary} />

              {STAT_DISPLAY.map((stat, i) => (
                <motion.div
                  key={stat.key}
                  className="cpo-stat-row"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.025, duration: 0.25 }}
                >
                  <div className="cpo-stat-label-group">
                    {stat.iconPath && (
                      <img
                        src={stat.iconPath}
                        alt=""
                        className={`cpo-stat-icon${stat.elementClass ? ` cpo-stat-icon--element cpo-stat-icon--${stat.elementClass.replace('charStatRow--', '')}` : ''}`}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    )}
                    <span className="cpo-stat-label">{stat.label}</span>
                  </div>
                  <button
                    type="button"
                    className="cpo-stat-value-btn"
                    onClick={() => setSelectedStat(prev => prev === stat.key ? null : stat.key)}
                    style={{
                      color: selectedStat === stat.key
                        ? `hsl(${elTheme.primary})`
                        : `hsl(${elTheme.primary} / 0.9)`,
                    }}
                  >
                    {formatStatValue(stat.key, getDisplayValue(stat), stat.format)}
                  </button>
                </motion.div>
              ))}
            </div>

            {/* ── CENTER COL: Equipment Orbit + Resonance Chain ── */}
            <div className="cpo-center-col">
              <div className="cpo-orbit-wrap">
                <EquipmentOrbit
                  weapon={character.gear.weapon}
                  echoSlots={character.gear.echoSlots}
                  elColor={elTheme.primary}
                  onTooltip={setTooltip}
                />
              </div>

              {/* Resonance chain strip */}
              <div className="cpo-chain-strip" style={{ borderTop: `1px solid hsl(${elTheme.primary} / 0.1)` }}>
                <HorizontalSequenceChain
                  sequence={character.sequence}
                  sequenceNodes={character.sequence_nodes}
                  sequenceNodeIcons={character.sequence_nodes_icons}
                  elColor={elTheme.primary}
                  onTooltip={setTooltip}
                />
              </div>
            </div>

            {/* ── RIGHT COL: Set Bonus ── */}
            <div className="cpo-right-col" style={{ borderLeft: `1px solid hsl(${elTheme.primary} / 0.1)` }}>
              {character.gear.setBonus ? (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  <SectionHeader label="Set Bonus" elColor={elTheme.primary} />

                  <div className="cpo-set-bonus-name-row">
                    <img
                      src={assetPath(character.gear.setBonus.icon)}
                      alt={character.gear.setBonus.name}
                      style={{ width: 26, height: 26, objectFit: 'contain' }}
                      onError={e => { (e.target as HTMLImageElement).style.opacity = '0' }}
                    />
                    <span className="cpo-set-bonus-name-text" style={{ color: `hsl(${elTheme.primary})` }}>
                      {character.gear.setBonus.name}
                    </span>
                  </div>

                  {Object.entries(character.gear.setBonus.info).map(([key, desc]) => (
                    <div
                      key={key}
                      className="cpo-set-bonus-entry"
                      style={{
                        background: `hsl(${elTheme.primary} / 0.04)`,
                        border: `1px solid hsl(${elTheme.primary} / 0.12)`,
                      }}
                    >
                      <div className="cpo-set-bonus-entry-key" style={{ color: `hsl(${elTheme.primary})` }}>
                        {key}
                      </div>
                      <p className="cpo-set-bonus-entry-desc">{desc}</p>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED, fontSize: '0.75rem', opacity: 0.4 }}>
                  No set bonus
                </div>
              )}
            </div>

            {/* Breakdown modal — covers entire body */}
            {selectedStatDisplay !== null && (
              <div className="cpo-breakdown-overlay">
                <BreakdownModal
                  statDisplay={selectedStatDisplay}
                  finalStats={finalStats}
                  gearBreakdown={gearBreakdown}
                  activeBreakdown={activeBreakdown}
                  baseStat={baseStat}
                  onClose={() => setSelectedStat(null)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom accent line */}
        <div style={{ height: 1, flexShrink: 0, background: `linear-gradient(90deg, transparent, hsl(${elTheme.primary} / 0.3), transparent)` }} />
      </motion.div>

      {/* Floating tooltip */}
      {tooltip && (
        <div style={tooltipStyle(tooltip.x, tooltip.y)}>
          {tooltip.content}
        </div>
      )}
    </>,
    document.body,
  )
}
