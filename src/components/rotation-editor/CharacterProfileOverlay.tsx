import { createPortal } from 'react-dom'
import { useState, useRef, useEffect, Fragment } from 'react'
import { motion, useAnimationFrame, AnimatePresence, useMotionValue, animate } from 'framer-motion'
import type { Character } from '../../types/character'
import type { CharacterStats } from '../../types/stats'
import type { Snapshot } from '../../types/snapshot'
import type { Echo, Gear, Weapon, EchoSlots } from '../../types/gear'
import { computeEchoSetCounts, echoSetRegistry } from '../../data/gear/echoSets'
import { EchoPickerModal } from './EchoPickerModal'
import { WeaponPickerModal } from './WeaponPickerModal'
import { calculateScalingStat } from '../../utils/calculators/damageCalculator'
import { computeGearStatBreakdown, computeActiveModifierBreakdown, computeFinalStats } from '../../utils/gear/computeStatBreakdown'
import '../../styles/rotation-editor/CharacterStateTracker.css'
import '../../styles/rotation-editor/DataOverlay.css'
import '../../styles/rotation-editor/CharacterProfileOverlay.css'

// ========== Element Theme ====================================================================================================

type ElementTheme = { primary: string; bg: string; label: string }

const ELEMENT_THEMES: Record<string, ElementTheme> = {
  AERO: { primary: '160 80% 55%', bg: '160 40% 8%', label: 'Aero' },
  SPECTRO: { primary: '45 100% 60%', bg: '45 60% 8%', label: 'Spectro' },
  HAVOC: { primary: '270 80% 60%', bg: '270 40% 8%', label: 'Havoc' },
  ELECTRO: { primary: '280 100% 65%', bg: '280 50% 8%', label: 'Electro' },
  GLACIO: { primary: '200 100% 70%', bg: '200 50% 8%', label: 'Glacio' },
  FUSION: { primary: '15 100% 55%', bg: '15 50% 8%', label: 'Fusion' },
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
  { key: 'tuneBreakBoost', label: 'Tune Break Boost', format: 'percent', iconPath: '/assets/stat-labels/statLabel_tuneBreakBoost.png' },
  { key: 'offtuneBuildupRate', label: 'Off-Tune Buildup Rate', format: 'percent', iconPath: '/assets/stat-labels/statLabel_offtuneBuildupRate.png' },
]

// The three scaling stats need special handling via calculateScalingStat
const SCALING_STAT_KEYS = new Set(['ATK', 'HP', 'DEF'])

// Element name extracted from elementClass, e.g. 'charStatRow--glacio' → 'glacio'
// Used to compose the per-element CSS animation class on the icon img.

// ========== Gear Stat Display ================================================================================================

const GEAR_STAT_LABELS: Record<string, { label: string; format: StatDisplay['format'] }> = {
  bonusATK: { label: 'ATK%', format: 'percent' },
  bonusHP: { label: 'HP%', format: 'percent' },
  bonusDEF: { label: 'DEF%', format: 'percent' },
  flatATK: { label: 'ATK', format: 'flat' },
  flatHP: { label: 'HP', format: 'flat' },
  flatDEF: { label: 'DEF', format: 'flat' },
  baseATK: { label: 'Base ATK', format: 'flat' },
  baseHP: { label: 'Base HP', format: 'flat' },
  baseDEF: { label: 'Base DEF', format: 'flat' },
  critRate: { label: 'Crit Rate', format: 'percent' },
  critDamage: { label: 'Crit DMG', format: 'percent' },
  energyPercent: { label: 'Energy Regen', format: 'percent' },
  healingBonus: { label: 'Healing Bonus', format: 'percent' },
  glacioBonusDMG: { label: 'Glacio DMG', format: 'percent' },
  fusionBonusDMG: { label: 'Fusion DMG', format: 'percent' },
  electroBonusDMG: { label: 'Electro DMG', format: 'percent' },
  aeroBonusDMG: { label: 'Aero DMG', format: 'percent' },
  spectroBonusDMG: { label: 'Spectro DMG', format: 'percent' },
  havocBonusDMG: { label: 'Havoc DMG', format: 'percent' },
  basicBonusDMG: { label: 'Basic ATK DMG', format: 'percent' },
  heavyBonusDMG: { label: 'Heavy ATK DMG', format: 'percent' },
  skillBonusDMG: { label: 'Skill DMG', format: 'percent' },
  liberationBonusDMG: { label: 'Liberation DMG', format: 'percent' },
  tuneBreakBoost: { label: 'Tune Break Boost', format: 'percent' },
  offtuneBuildupRate: { label: 'Off-Tune Buildup Rate', format: 'percent' },
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
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
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

type StatBreakdownData = { variant: 'scaling'; stat: 'ATK' | 'HP' | 'DEF'; finalValue: number; baseValue: number; percentGroups: BreakdownGroup[]; flatGroups: BreakdownGroup[] } | { variant: 'additive'; key: string; label: string; format: StatDisplay['format']; finalValue: number; groups: BreakdownGroup[] }

function buildGroups(extractValue: (stats: Partial<CharacterStats>) => number, gearBreakdown: ReturnType<typeof computeGearStatBreakdown>, activeBreakdown: ReturnType<typeof computeActiveModifierBreakdown>): BreakdownGroup[] {
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

function getBreakdownData(statKey: string, label: string, format: StatDisplay['format'], finalStats: CharacterStats, gearBreakdown: ReturnType<typeof computeGearStatBreakdown>, activeBreakdown: ReturnType<typeof computeActiveModifierBreakdown>, baseStat: CharacterStats): StatBreakdownData {
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
      percentGroups: buildGroups(stats => (stats[bonusKey] as number | undefined) ?? 0, gearBreakdown, activeBreakdown),
      flatGroups: buildGroups(stats => (stats[flatKey] as number | undefined) ?? 0, gearBreakdown, activeBreakdown),
    }
  }

  const k = statKey as keyof CharacterStats
  const getVal = (stats: Partial<CharacterStats>): number => (stats[k] as number | undefined) ?? 0

  // Base = the residual after subtracting all gear/buff contributions from character.stats.
  // This captures the character's own definition + game defaults without double-counting gear.
  // e.g. critRate: 0.05 default + any char-level stat; energyPercent: 1.0 for Cartethyia.
  const resolvedBase = (baseStat[k] as number) ?? 0
  const charBase = resolvedBase - getVal(gearBreakdown.weapon.total) - getVal(gearBreakdown.echoes.total) - (gearBreakdown.setBonus ? getVal(gearBreakdown.setBonus.total) : 0) - getVal(gearBreakdown.passiveMods.total)

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
  const data = getBreakdownData(statDisplay.key, statDisplay.label, statDisplay.format, finalStats, gearBreakdown, activeBreakdown, baseStat)

  function renderGroupsTable(groups: BreakdownGroup[], formatValue: (v: number) => string, formatEquiv?: (v: number) => string) {
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
        <button className="overlayCloseButton" onClick={onClose} aria-label="Close breakdown">
          ✕
        </button>
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
              {renderGroupsTable(data.flatGroups, v => formatFlat(v))}
            </div>
          </>
        )}

        {data.variant === 'additive' && (
          <>
            <div className="charStatBreakdownTotal">
              Total {statDisplay.label}: {formatStatValue(data.key, data.finalValue, data.format)}
            </div>
            <div className="charStatBreakdownSection">{renderGroupsTable(data.groups, v => formatStatValue(data.key, v, data.format))}</div>
          </>
        )}
      </div>
    </div>
  )
}

// ========== Sub-component: Equipment Orbit ===================================================================================

const ORBIT_POSITIONS = [
  { angle: -90 }, // Weapon — top
  { angle: 90 }, // Echo slot 1 (main) — bottom
  { angle: -30 }, // Echo slot 2 — top-right
  { angle: 30 }, // Echo slot 3 — bottom-right
  { angle: 150 }, // Echo slot 4 — bottom-left
  { angle: 210 }, // Echo slot 5 — top-left
]

// Rotation-space angle for each orbit item: 0° = rightmost point of the ring, increasing clockwise.
// Derived from ORBIT_POSITIONS: mathematical angle → CSS rotate degrees (same axis for clockwise motion).
const ITEM_ROTATION_ANGLES = ORBIT_POSITIONS.map(p => ((p.angle % 360) + 360) % 360)
// = [270, 90, 330, 30, 150, 210]
const ORBIT_SCAN_THRESHOLD = 16 // degrees — half-window; items are 60° apart so no overlap

type OrbitalScanItem = { type: 'weapon'; data: Weapon } | { type: 'echo'; data: Echo; slot: 1 | 2 | 3 | 4 | 5 }

function EquipmentOrbit({ weapon, echoSlots, elColor, characterName, onItemHighlight, onEchoSlotClick, onWeaponSlotClick }: { weapon: Weapon; echoSlots: EchoSlots; elColor: string; characterName: string; onItemHighlight?: (item: OrbitalScanItem | null) => void; onEchoSlotClick?: (slot: 1 | 2 | 3 | 4 | 5) => void; onWeaponSlotClick?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState(0)
  const lastPassedIndexRef = useRef<number>(-1)
  // Single MotionValue drives both the visual particle and the detection logic —
  // the two can never drift apart because they read from identical values.
  const rotation = useMotionValue(0)
  const [scannedIndex, setScannedIndex] = useState(-1)
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1)
  const hoveredIndexRef = useRef<number>(-1)

  useEffect(() => {
    const controls = animate(rotation, [0, 360], { duration: 36, repeat: Infinity, ease: 'linear' })
    return () => controls.stop()
  }, [rotation])

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
  const baseSlot = Math.max(62, Math.min(98, Math.round(radius * 0.4)))
  const largeSlot = Math.round(baseSlot * 1.25)

  const items: Array<{ type: 'weapon'; data: Weapon } | { type: 'echo'; data: Echo | null; slot: 1 | 2 | 3 | 4 | 5 }> = [
    { type: 'weapon', data: weapon },
    { type: 'echo', data: echoSlots[1], slot: 1 },
    { type: 'echo', data: echoSlots[2], slot: 2 },
    { type: 'echo', data: echoSlots[3], slot: 3 },
    { type: 'echo', data: echoSlots[4], slot: 4 },
    { type: 'echo', data: echoSlots[5], slot: 5 },
  ]

  function handleSlotHover(index: number) {
    hoveredIndexRef.current = index
    setHoveredIndex(index)
    setScannedIndex(index)
    if (onItemHighlight) {
      const item = items[index]
      if (item.type === 'weapon') {
        onItemHighlight({ type: 'weapon', data: item.data })
      } else if (item.type === 'echo' && item.data !== null) {
        onItemHighlight({ type: 'echo', data: item.data, slot: item.slot })
      } else {
        // Empty echo slot — reset the scan panel to its idle state.
        onItemHighlight(null)
      }
    }
  }

  function handleSlotLeave() {
    hoveredIndexRef.current = -1
    setHoveredIndex(-1)
  }

  useAnimationFrame(() => {
    // Suppress orbital scan updates while a slot is being hovered.
    if (hoveredIndexRef.current >= 0) return
    // rotation.get() is the exact same value used to render the particle — perfect sync.
    const currentAngle = rotation.get() % 360
    let closestIndex = -1
    ITEM_ROTATION_ANGLES.forEach((angle, i) => {
      // Fire when ball is within 8° before to ORBIT_SCAN_THRESHOLD degrees after the slot.
      const past = (currentAngle - angle + 8 + 360) % 360
      if (past < ORBIT_SCAN_THRESHOLD) {
        closestIndex = i
      }
    })
    if (closestIndex !== lastPassedIndexRef.current) {
      lastPassedIndexRef.current = closestIndex
      // Only advance when a real slot is hit — never reset to -1 so the frame persists.
      if (closestIndex >= 0) {
        setScannedIndex(closestIndex)
      }
      if (closestIndex >= 0 && onItemHighlight) {
        const item = items[closestIndex]
        if (item.type === 'weapon') {
          onItemHighlight({ type: 'weapon', data: item.data })
        } else if (item.type === 'echo' && item.data !== null) {
          onItemHighlight({ type: 'echo', data: item.data, slot: item.slot })
        } else {
          // Empty echo slot — reset the scan panel to its idle state.
          onItemHighlight(null)
        }
      }
    }
  })

  return (
    <div ref={containerRef} className="cpo-orbit-container">
      {size > 0 && (
        <div style={{ position: 'relative', width: size, height: size }}>
          {/* Orbit ring + concentric ripple circles */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <circle cx={center} cy={center} r={radius} fill="none" stroke={`hsl(${elColor} / 0.22)`} strokeWidth="1" strokeDasharray="4 6" />
            <circle cx={center} cy={center} r={radius + 22} fill="none" stroke={`hsl(${elColor} / 0.18)`} strokeWidth="0.75" />
            <circle cx={center} cy={center} r={radius + 52} fill="none" stroke={`hsl(${elColor} / 0.11)`} strokeWidth="0.65" />
            <circle cx={center} cy={center} r={radius + 94} fill="none" stroke={`hsl(${elColor} / 0.06)`} strokeWidth="0.5" />
            <circle cx={center} cy={center} r={radius + 152} fill="none" stroke={`hsl(${elColor} / 0.03)`} strokeWidth="0.4" />
          </svg>

          {/* Orbiting energy particle */}
          <motion.div style={{ position: 'absolute', width: size, height: size, pointerEvents: 'none', rotate: rotation }}>
            <div
              style={{
                position: 'absolute',
                width: 6,
                height: 6,
                borderRadius: '50%',
                left: center + radius - 3,
                top: center - 3,
                background: `hsl(${elColor} / 0.6)`,
                boxShadow: `0 0 8px hsl(${elColor} / 0.4), 0 0 16px hsl(${elColor} / 0.2)`,
              }}
            />
          </motion.div>

          {/* Character shadow — centered inside orbit ring */}
          <div
            style={{
              position: 'absolute',
              left: center,
              top: center,
              width: radius * 1.55,
              height: radius * 1.55,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}>
            <img
              src={`/assets/characters/${characterName.toLowerCase()}_shadow.png`}
              alt=""
              aria-hidden="true"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'brightness(0) opacity(0.28)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 50%, rgba(0,0,0,0.55) 70%, transparent 90%)',
                maskImage: 'radial-gradient(circle at center, black 50%, rgba(0,0,0,0.55) 70%, transparent 90%)',
              }}
              onError={e => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>

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
              return <line key={i} x1={center + Math.cos(rad) * inner} y1={center + Math.sin(rad) * inner} x2={center + Math.cos(rad) * outer} y2={center + Math.sin(rad) * outer} stroke={`hsl(${elColor} / ${isSlot ? 0.4 : 0.15})`} strokeWidth={isSlot ? 1.5 : 1} />
            })}
          </svg>

          {/* Slots */}
          {items.map((item, i) => {
            const rad = (ORBIT_POSITIONS[i].angle * Math.PI) / 180
            const x = center + Math.cos(rad) * radius
            const y = center + Math.sin(rad) * radius
            const isLarge = item.type === 'weapon' || (item.type === 'echo' && item.slot === 1)
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
                    typeTag="Weapon"
                    isScanned={i === (hoveredIndex >= 0 ? hoveredIndex : scannedIndex)}
                    onHoverEnter={() => handleSlotHover(i)}
                    onHoverLeave={handleSlotLeave}
                    onClick={() => onWeaponSlotClick?.()}
                  />
                ) : (
                  <GearSlot
                    icon={item.data ? assetPath(item.data.icon) : undefined}
                    primaryLabel={item.data ? `${item.data.cost} Cost` : undefined}
                    secondaryLabel={item.data ? item.data.name : undefined}
                    elColor={elColor}
                    size={slotSize}
                    delay={0.35 + i * 0.08}
                    typeTag={item.slot === 1 ? 'Main Echo' : item.data ? 'Echo' : undefined}
                    isScanned={i === (hoveredIndex >= 0 ? hoveredIndex : scannedIndex)}
                    onHoverEnter={() => handleSlotHover(i)}
                    onHoverLeave={handleSlotLeave}
                    onClick={() => onEchoSlotClick?.(item.slot)}
                    alwaysClickable
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

function GearSlot({ icon, primaryLabel, secondaryLabel, elColor, size, delay, typeTag, isScanned, onClick, alwaysClickable, onHoverEnter, onHoverLeave }: { icon?: string; primaryLabel?: string; secondaryLabel?: string; elColor: string; size: number; delay: number; typeTag?: string; isScanned?: boolean; onClick?: () => void; alwaysClickable?: boolean; onHoverEnter?: () => void; onHoverLeave?: () => void }) {
  const hasItem = icon !== undefined || primaryLabel !== undefined
  const isClickable = hasItem || alwaysClickable

  return (
    <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay, duration: 0.35, type: 'spring', stiffness: 200 }} style={{ position: 'relative', width: size, height: size, cursor: isClickable ? 'pointer' : 'default' }} onMouseEnter={isClickable ? () => onHoverEnter?.() : undefined} onMouseLeave={isClickable ? () => onHoverLeave?.() : undefined} onClick={isClickable ? onClick : undefined}>
      {/* Background — solid occluder so orbiting particle stays hidden underneath */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 8, background: 'hsl(220 20% 9%)' }} />
      {/* Background — semi-transparent gradient overlay on top of occluder */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 8,
          background: hasItem ? `linear-gradient(135deg, hsl(${elColor} / ${typeTag ? 0.13 : 0.08}), rgba(30, 33, 55, 0.6))` : 'rgba(30, 33, 42, 0.3)',
          border: `1px solid ${hasItem ? `hsl(${elColor} / ${typeTag ? 0.4 : 0.25})` : 'rgba(80, 85, 100, 0.2)'}`,
          transition: 'border-color 0.2s',
        }}
      />

      {/* Hover glow */}
      {isClickable && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 8,
            opacity: 0,
            boxShadow: `inset 0 0 20px hsl(${elColor} / 0.1), 0 0 12px hsl(${elColor} / 0.15)`,
            transition: 'opacity 0.3s',
          }}
        />
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2px' }}>
        {icon ? (
          <img
            src={icon}
            alt={primaryLabel}
            style={{ width: '92%', height: '92%', objectFit: 'contain' }}
            onError={e => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : hasItem ? (
          <>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: '0.7rem', fontWeight: 700, color: `hsl(${elColor} / 0.9)`, lineHeight: 1 }}>{primaryLabel}</span>
            {secondaryLabel && <span style={{ fontFamily: FONT_BODY, fontSize: '0.55rem', color: MUTED, marginTop: 2, maxWidth: '90%', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>{secondaryLabel}</span>}
          </>
        ) : (
          <span style={{ color: 'rgba(100, 110, 130, 0.3)', fontSize: '1.1rem', lineHeight: 1 }}>+</span>
        )}
      </div>

      {/* Corner accents */}
      {isClickable && <CornerAccents elColor={elColor} />}

      {/* Scan frame — targeting brackets animate in when the orbital particle passes this slot */}
      <AnimatePresence>
        {isScanned && (
          <motion.div key="scan-frame" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            {/* TL */}
            <motion.div style={{ position: 'absolute', top: -8, left: -8, width: 12, height: 12 }} initial={{ x: -14, y: -14 }} animate={{ x: 0, y: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 12, height: 1.5, background: `hsl(${elColor})`, borderRadius: 1 }} />
              <div style={{ position: 'absolute', top: 0, left: 0, width: 1.5, height: 12, background: `hsl(${elColor})`, borderRadius: 1 }} />
            </motion.div>
            {/* TR */}
            <motion.div style={{ position: 'absolute', top: -8, right: -8, width: 12, height: 12 }} initial={{ x: 14, y: -14 }} animate={{ x: 0, y: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 12, height: 1.5, background: `hsl(${elColor})`, borderRadius: 1 }} />
              <div style={{ position: 'absolute', top: 0, right: 0, width: 1.5, height: 12, background: `hsl(${elColor})`, borderRadius: 1 }} />
            </motion.div>
            {/* BR */}
            <motion.div style={{ position: 'absolute', bottom: -8, right: -8, width: 12, height: 12 }} initial={{ x: 14, y: 14 }} animate={{ x: 0, y: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 1.5, background: `hsl(${elColor})`, borderRadius: 1 }} />
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 1.5, height: 12, background: `hsl(${elColor})`, borderRadius: 1 }} />
            </motion.div>
            {/* BL */}
            <motion.div style={{ position: 'absolute', bottom: -8, left: -8, width: 12, height: 12 }} initial={{ x: -14, y: 14 }} animate={{ x: 0, y: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: 12, height: 1.5, background: `hsl(${elColor})`, borderRadius: 1 }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: 1.5, height: 12, background: `hsl(${elColor})`, borderRadius: 1 }} />
            </motion.div>
            {/* Border glow pulse */}
            <motion.div style={{ position: 'absolute', inset: 0, borderRadius: 8, border: `1px solid hsl(${elColor})` }} initial={{ opacity: 0 }} animate={{ opacity: [0, 0.85, 0.35] }} transition={{ duration: 0.5, ease: 'easeOut' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slot type label */}
      {typeTag && (
        <div
          style={{
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

// ========== Sub-component: Portrait Sequence Display ========================================================================

function seqArcPath(r: number, startDeg: number, endDeg: number): string {
  const toRad = (d: number) => (d * Math.PI) / 180
  const x1 = r * Math.cos(toRad(startDeg)),
    y1 = r * Math.sin(toRad(startDeg))
  const x2 = r * Math.cos(toRad(endDeg)),
    y2 = r * Math.sin(toRad(endDeg))
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
}

function arcLenPx(r: number, startDeg: number, endDeg: number): number {
  return (r * Math.abs(endDeg - startDeg) * Math.PI) / 180
}

// Nodes arc along the right side of the portrait. 0° = rightward, negative = up, positive = down.
// Radius is larger than the portrait radius (125px) to leave a clear gap between portrait edge and nodes.
const PORTRAIT_ARC_ANGLES = [-75, -45, -15, 15, 45, 75]
const PORTRAIT_ARC_RADIUS = 160

function PortraitSequenceDisplay({ sequence, prevSequence, sequenceNodes, sequenceNodeIcons, elColor, onTooltip, onSequenceChange }: { sequence: 0 | 1 | 2 | 3 | 4 | 5 | 6; prevSequence: 0 | 1 | 2 | 3 | 4 | 5 | 6; sequenceNodes: string[]; sequenceNodeIcons: string[]; elColor: string; onTooltip: (t: TooltipData | null) => void; onSequenceChange: (seq: 0 | 1 | 2 | 3 | 4 | 5 | 6) => void }) {
  const nodes = sequenceNodes.slice(0, 6)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const NODE_SIZE = 34
  const R = PORTRAIT_ARC_RADIUS
  // Arc geometry
  const trackPath = seqArcPath(R, -75, 75)
  const clampedSeq = Math.min(sequence, nodes.length)
  const activeEndDeg = clampedSeq > 0 ? PORTRAIT_ARC_ANGLES[clampedSeq - 1] : -75

  // Static arc: the already-drawn portion (up to the lower of prev/current), shown instantly
  const staticSeq = Math.min(prevSequence, sequence)
  const staticHasArc = staticSeq >= 2
  const staticEndDeg = staticSeq > 0 ? PORTRAIT_ARC_ANGLES[Math.min(staticSeq, nodes.length) - 1] : -75
  const staticPath = staticHasArc ? seqArcPath(R, -75, staticEndDeg) : ''

  // Animated segment: only the newly added portion, drawn in when sequence increases
  const shouldAnimate = sequence >= 2 && sequence > prevSequence
  const animStartDeg = staticSeq >= 2 ? PORTRAIT_ARC_ANGLES[Math.min(staticSeq, nodes.length) - 1] : -75
  const animPath = shouldAnimate ? seqArcPath(R, animStartDeg, activeEndDeg) : ''
  const animLen = shouldAnimate ? arcLenPx(R, animStartDeg, activeEndDeg) : 0

  // SVG: 190 × 360 with viewBox "0 -180 190 360" so (0,0) = portrait center.
  // placed at left:50% top:50% translateY(-50%) → left edge at portrait center x, vertically centered.
  // Paths drawn with x going rightward match the node calc(50% + offsetX) coordinate system.

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
                width: 36,
                height: 36,
                objectFit: 'contain',
                flexShrink: 0,
                filter: active ? undefined : 'grayscale(1) opacity(0.4)',
                borderRadius: 4,
              }}
              onError={e => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: active ? `hsl(${elColor})` : 'hsl(195 100% 90%)' }}>Sequence {i + 1}</span>
            <span style={{ fontSize: '0.68rem', color: MUTED }}>{active ? 'Unlocked' : 'Locked'}</span>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '0.76rem', color: 'rgba(175, 185, 210, 0.9)', lineHeight: 1.55 }}>{desc}</p>
      </div>
    )
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
      {/* SVG arc layer — actual dimensions so paths are measurable and drop-shadows render correctly */}
      <svg
        width="190"
        height="360"
        viewBox="0 -180 190 360"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translateY(-50%)',
          overflow: 'visible',
          pointerEvents: 'none',
        }}>
        {/* Track — clean solid grey rail, full span */}
        <path d={trackPath} fill="none" stroke="rgba(120, 128, 145, 0.22)" strokeWidth="1" strokeLinecap="round" />

        {/* Static arc: the already-drawn portion, shown instantly with no animation */}
        {staticHasArc && <path d={staticPath} fill="none" stroke={`hsl(${elColor})`} strokeWidth="1.5" strokeLinecap="round" opacity="0.75" style={{ filter: `drop-shadow(0 0 2.5px hsl(${elColor} / 0.7))` }} />}

        {/* Animated arc — draws in only the new segment each time sequence increases */}
        {shouldAnimate && <motion.path key={`${prevSequence}-${sequence}`} d={animPath} fill="none" stroke={`hsl(${elColor})`} strokeWidth="1.5" strokeLinecap="round" strokeDasharray={animLen} style={{ filter: `drop-shadow(0 0 2.5px hsl(${elColor} / 0.7))` }} initial={{ strokeDashoffset: animLen, opacity: 0 }} animate={{ strokeDashoffset: 0, opacity: 0.75 }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.35 }} />}
      </svg>

      {/* Nodes */}
      {nodes.map((desc, i) => {
        const active = i < sequence
        const hovered = hoveredIndex === i
        const rad = (PORTRAIT_ARC_ANGLES[i] * Math.PI) / 180
        const offsetX = R * Math.cos(rad)
        const offsetY = R * Math.sin(rad)

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `calc(50% + ${offsetX}px)`,
              top: `calc(50% + ${offsetY}px)`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'auto',
              cursor: 'pointer',
            }}
            onClick={() => {
              // todo: this only updates local visual state for the resonance chain.
              // Later, onSequenceChange should persist to character data so sequence-gated
              // modifiers (skills, passives, injected effects, etc.) are applied correctly.
              const nextSeq = sequence === i + 1 ? i : i + 1
              onSequenceChange(nextSeq as 0 | 1 | 2 | 3 | 4 | 5 | 6)
            }}
            onMouseEnter={e => {
              setHoveredIndex(i)
              onTooltip({ x: e.clientX, y: e.clientY, content: makeTooltip(i, desc, active) })
            }}
            onMouseMove={e => onTooltip({ x: e.clientX, y: e.clientY, content: makeTooltip(i, desc, active) })}
            onMouseLeave={() => {
              setHoveredIndex(null)
              onTooltip(null)
            }}>
            <motion.div style={{ position: 'relative', width: NODE_SIZE, height: NODE_SIZE }} animate={{ scale: hovered ? 1.22 : 1 }} transition={{ duration: 0.13, ease: 'easeOut' }}>
              {/* Circle */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1.5px solid ${hovered ? `hsl(${elColor})` : active ? `hsl(${elColor} / 0.72)` : 'rgba(120, 130, 150, 0.28)'}`,
                  background: active ? `radial-gradient(circle, hsl(${elColor} / ${hovered ? 0.4 : 0.2}), hsl(${elColor} / 0.04)), rgb(12, 15, 22)` : hovered ? 'rgb(42, 47, 65)' : 'rgb(18, 21, 30)',
                  boxShadow: hovered ? `0 0 14px hsl(${elColor} / ${active ? 0.6 : 0.28}), inset 0 0 8px hsl(${elColor} / 0.14)` : active ? `0 0 5px hsl(${elColor} / 0.3)` : 'none',
                  transition: 'border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease',
                  overflow: 'hidden',
                }}>
                {sequenceNodeIcons[i] ? (
                  <img
                    src={assetPath(sequenceNodeIcons[i])}
                    alt={`S${i + 1}`}
                    style={{
                      width: '90%',
                      height: '90%',
                      objectFit: 'contain',
                      filter: active ? undefined : `grayscale(1) opacity(${hovered ? 0.55 : 0.28})`,
                      transition: 'filter 0.15s ease',
                    }}
                    onError={e => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontSize: '0.6rem',
                      fontWeight: 900,
                      color: active ? `hsl(${elColor})` : `rgba(100, 110, 130, ${hovered ? 0.75 : 0.45})`,
                    }}>
                    {i + 1}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}

// ========== Sub-component: Portrait Left Arc (level + element) =============================================================

function PortraitLeftArc({ level, element, elColor }: { level: number | undefined; element: string; elColor: string }) {
  const R = PORTRAIT_ARC_RADIUS
  const trackPath = seqArcPath(R, 100, 265)

  // Tightly grouped near 180° (pure left): Element at upper-left (138°), Level at lower-left (115°)
  const items = [
    { angle: 138, label: element, isElement: true },
    { angle: 115, label: level !== undefined ? `Lv.${level}` : '—', isElement: false },
  ]

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
      {/* SVG arc track — mirrors the right-side track, anchored to portrait center */}
      <svg
        width="190"
        height="360"
        viewBox="-190 -180 190 360"
        style={{
          position: 'absolute',
          right: '50%',
          top: '50%',
          transform: 'translateY(-50%)',
          overflow: 'visible',
          pointerEvents: 'none',
        }}>
        <path d={trackPath} fill="none" stroke="rgba(120, 128, 145, 0.22)" strokeWidth="1" strokeLinecap="round" />
      </svg>

      {/* Badges */}
      {items.map(({ angle, label, isElement }) => {
        const rad = (angle * Math.PI) / 180
        const offsetX = R * Math.cos(rad)
        const offsetY = R * Math.sin(rad)
        return (
          <div
            key={angle}
            style={{
              position: 'absolute',
              left: `calc(50% + ${offsetX}px)`,
              top: `calc(50% + ${offsetY}px)`,
              transform: 'translate(-50%, -50%)',
            }}>
            <span
              style={{
                display: 'block',
                fontFamily: isElement ? FONT_DISPLAY : FONT_MONO,
                fontSize: '0.65rem',
                fontWeight: isElement ? 700 : undefined,
                color: isElement ? `hsl(${elColor})` : MUTED,
                background: isElement ? `hsl(${elColor} / 0.12)` : 'rgba(30, 40, 60, 0.7)',
                border: `1px solid ${isElement ? `hsl(${elColor} / 0.35)` : 'rgba(80, 90, 110, 0.3)'}`,
                borderRadius: 99,
                padding: '1px 8px',
                textTransform: isElement ? ('uppercase' as const) : undefined,
                letterSpacing: isElement ? '0.1em' : '0.04em',
                whiteSpace: 'nowrap',
              }}>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ========== Sub-components: Gear Info Display (Orbital Scan) ===============================================================

/**
 * Wraps numbers, %, and / in colored spans for inline description text.
 * Decimal separators (. or ,) are only colored when part of a number (e.g. 12.00 → whole thing colored).
 */
function colorizeText(text: string, elColor: string) {
  const pattern = /(\d+(?:[.,]\d+)*|[%/])/g
  const parts: Array<string | ReturnType<typeof Fragment>> = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
    parts.push(
      <span key={match.index} style={{ color: `hsl(${elColor})`, fontWeight: 600 }}>
        {match[0]}
      </span>,
    )
    lastIndex = pattern.lastIndex
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return <>{parts}</>
}

function WeaponInfo({ weapon, elColor }: { weapon: Weapon; elColor: string }) {
  const stats = formatGearStats(weapon.stats)
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img
          src={assetPath(weapon.icon)}
          alt={weapon.name}
          style={{ width: 44, height: 44, objectFit: 'contain', flexShrink: 0 }}
          onError={e => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--table-text)' }}>{weapon.name}</div>
          <div style={{ fontSize: '0.7rem', color: `hsl(${elColor})`, fontWeight: 600 }}>
            R{weapon.rank} · {weapon.weaponType}
          </div>
        </div>
      </div>
      {stats.length > 0 && (
        <>
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, hsl(${elColor} / 0.25), transparent)` }} />
          {stats.map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: '0.73rem' }}>
              <span style={{ color: 'rgba(150, 165, 195, 0.8)' }}>{label}</span>
              <span style={{ color: `hsl(${elColor} / 0.9)`, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
            </div>
          ))}
        </>
      )}
      {weapon.info && (
        <>
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, hsl(${elColor} / 0.25), transparent)` }} />
          <p style={{ margin: 0, fontSize: '0.74rem', color: 'rgba(175, 185, 210, 0.85)', lineHeight: 1.55 }}>{colorizeText(weapon.info, elColor)}</p>
        </>
      )}
    </>
  )
}

function EchoInfo({ echo, slot, elColor }: { echo: Echo; slot: number; elColor: string }) {
  const mainStats = formatGearStats(echo.baseStats)
  const subStats = formatGearStats(echo.subStats)
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {echo.info_icon && (
          <img
            src={assetPath(echo.info_icon)}
            alt={echo.name}
            style={{ width: 44, height: 44, objectFit: 'contain', flexShrink: 0 }}
            onError={e => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        )}
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--table-text)' }}>{echo.name}</div>
          <div style={{ fontSize: '0.7rem', color: `hsl(${elColor})`, fontWeight: 600 }}>
            {echo.cost} Cost{slot === 1 ? ' · Main Echo' : ''} · {echo.setName}
          </div>
        </div>
      </div>
      {mainStats.length > 0 && (
        <>
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, hsl(${elColor} / 0.25), transparent)` }} />
          <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(130, 145, 175, 0.6)', marginBottom: 2 }}>Main</div>
          {mainStats.map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: '0.73rem' }}>
              <span style={{ color: 'rgba(150, 165, 195, 0.8)' }}>{label}</span>
              <span style={{ color: `hsl(${elColor} / 0.9)`, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
            </div>
          ))}
        </>
      )}
      {subStats.length > 0 && (
        <>
          <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(130, 145, 175, 0.6)', marginTop: 4, marginBottom: 2 }}>Sub</div>
          {subStats.map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: '0.73rem' }}>
              <span style={{ color: 'rgba(150, 165, 195, 0.8)' }}>{label}</span>
              <span style={{ color: 'rgba(165, 178, 205, 0.85)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
            </div>
          ))}
        </>
      )}
      <>
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, hsl(${elColor} / 0.25), transparent)` }} />
        <p style={{ margin: 0, fontSize: '0.74rem', color: 'rgba(175, 185, 210, 0.85)', lineHeight: 1.55 }}>{echo.info ? colorizeText(echo.info, elColor) : 'No additional information available.'}</p>
      </>
    </>
  )
}

function OrbitalScanPanel({ item, elColor }: { item: OrbitalScanItem | null; elColor: string }) {
  return (
    <div>
      <SectionHeader label="Orbital Scan" elColor={elColor} />
      <AnimatePresence mode="wait">
        {item === null ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px 8px',
              color: MUTED,
              fontSize: '0.72rem',
              fontFamily: FONT_MONO,
              letterSpacing: '0.1em',
            }}>
            SCANNING...
          </motion.div>
        ) : (
          <motion.div
            key={item.type === 'weapon' ? 'weapon' : `echo-${item.slot}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            style={{
              background: `hsl(${elColor} / 0.04)`,
              border: `1px solid hsl(${elColor} / 0.12)`,
              borderRadius: 8,
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
            {item.type === 'weapon' ? <WeaponInfo weapon={item.data} elColor={elColor} /> : <EchoInfo echo={item.data} slot={item.slot} elColor={elColor} />}
          </motion.div>
        )}
      </AnimatePresence>
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
  onGearChange?: (characterName: string, newGear: Gear) => void
}

export function CharacterProfileOverlay({ characterName, character, snapshot, allCharacters, onClose, onGearChange }: CharacterProfileOverlayProps) {
  const [selectedStat, setSelectedStat] = useState<string | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [pickerSlot, setPickerSlot] = useState<1 | 2 | 3 | 4 | 5 | null>(null)
  const [weaponPickerOpen, setWeaponPickerOpen] = useState(false)
  // todo: localSequence tracks visual-only resonance chain state.
  // Later this should persist to character data so sequence-gated modifiers are applied.
  const [localSequence, setLocalSequence] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(character.sequence)
  // prevLocalSequence is initialised to -1 so the full arc animates on first open for any sequence level
  const [prevLocalSequence, setPrevLocalSequence] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(-1 as 0 | 1 | 2 | 3 | 4 | 5 | 6) // initially -1 casted to satisfy TS
  const [orbitalItem, setOrbitalItem] = useState<OrbitalScanItem | null>(null)

  function handleSequenceChange(seq: 0 | 1 | 2 | 3 | 4 | 5 | 6) {
    setPrevLocalSequence(localSequence)
    setLocalSequence(seq)
  }

  const finalStats = computeFinalStats(character, snapshot, allCharacters)
  const gearBreakdown = computeGearStatBreakdown(character)
  const activeBreakdown = computeActiveModifierBreakdown(character, snapshot, allCharacters)
  const baseStat = character.stats as CharacterStats
  const elTheme = getTheme(character.element)
  const activeSets = Object.entries(computeEchoSetCounts(character.gear.echoSlots))
    .flatMap(([setName, count]) => {
      const registry = echoSetRegistry[setName]
      return registry ? [{ setName, count, registry }] : []
    })
    .sort((a, b) => b.count - a.count)

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

  const selectedStatDisplay = selectedStat !== null ? (STAT_DISPLAY.find(s => s.key === selectedStat) ?? null) : null

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
          position: 'fixed',
          inset: 0,
          zIndex: 200,
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
        onAnimationComplete={() => {
          if (isClosing) onClose()
        }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="charProfileTitle"
        style={{
          boxShadow: `var(--table-shadow-inner), var(--table-shadow-main), var(--table-shadow-glow), 0 0 60px hsl(${elTheme.primary} / 0.1)`,
          border: `1px solid hsl(${elTheme.primary} / 0.2)`,
        }}>
        {/* Top accent line */}
        <div style={{ height: 1, flexShrink: 0, background: `linear-gradient(90deg, transparent, hsl(${elTheme.primary} / 0.6), transparent)` }} />

        {/* Close strip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '6px 14px',
            flexShrink: 0,
            background: `linear-gradient(90deg, transparent, hsl(${elTheme.primary} / 0.04))`,
          }}>
          <button className="cpo-close-btn" onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="cpo-content">
          <div className="cpo-body">
            {/* ── LEFT COL: Portrait + Stats ── */}
            <div className="cpo-left-col" style={{ borderRight: `1px solid hsl(${elTheme.primary} / 0.1)` }}>
              {/* Identity */}
              <div className="cpo-identity-block">
                <h2
                  id="charProfileTitle"
                  style={{
                    margin: 0,
                    fontFamily: FONT_DISPLAY,
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: `hsl(${elTheme.primary})`,
                    textShadow: `0 0 22px hsl(${elTheme.primary} / 0.35)`,
                  }}>
                  {character.name}
                </h2>
              </div>

              {character.image && (
                <div className="cpo-portrait-wrap">
                  <img
                    src={assetPath(character.image)}
                    alt={character.name}
                    className="cpo-portrait"
                    style={{ borderColor: `hsl(${elTheme.primary} / 0.35)`, boxShadow: `0 0 20px hsl(${elTheme.primary} / 0.2)` }}
                    onError={e => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  <PortraitSequenceDisplay sequence={localSequence} prevSequence={prevLocalSequence} sequenceNodes={character.sequence_nodes} sequenceNodeIcons={character.sequence_nodes_icons} elColor={elTheme.primary} onTooltip={setTooltip} onSequenceChange={handleSequenceChange} />
                  <PortraitLeftArc level={(character.stats as Partial<CharacterStats>).level} element={elTheme.label} elColor={elTheme.primary} />
                </div>
              )}

              <SectionHeader label="Total Stats" elColor={elTheme.primary} />

              {STAT_DISPLAY.map((stat, i) => (
                <motion.div key={stat.key} className="cpo-stat-row" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.025, duration: 0.25 }}>
                  <div className="cpo-stat-label-group">
                    {stat.iconPath && (
                      <img
                        src={stat.iconPath}
                        alt=""
                        className={`cpo-stat-icon${stat.elementClass ? ` cpo-stat-icon--element cpo-stat-icon--${stat.elementClass.replace('charStatRow--', '')}` : ''}`}
                        onError={e => {
                          ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    )}
                    <span className="cpo-stat-label">{stat.label}</span>
                  </div>
                  <button
                    type="button"
                    className="cpo-stat-value-btn"
                    onClick={() => setSelectedStat(prev => (prev === stat.key ? null : stat.key))}
                    style={{
                      color: selectedStat === stat.key ? `hsl(${elTheme.primary})` : `hsl(${elTheme.primary} / 0.9)`,
                    }}>
                    {formatStatValue(stat.key, getDisplayValue(stat), stat.format)}
                  </button>
                </motion.div>
              ))}
            </div>

            {/* ── CENTER COL: Equipment Orbit + Resonance Chain ── */}
            <div className="cpo-center-col">
              <div className="cpo-orbit-wrap">
                <EquipmentOrbit weapon={character.gear.weapon} echoSlots={character.gear.echoSlots} elColor={elTheme.primary} characterName={characterName} onItemHighlight={setOrbitalItem} onEchoSlotClick={setPickerSlot} onWeaponSlotClick={() => setWeaponPickerOpen(true)} />
              </div>

            </div>

            {/* ── RIGHT COL: Set Bonus (top half) + Orbital Scan (bottom half) ── */}
            <div className="cpo-right-col" style={{ borderLeft: `1px solid hsl(${elTheme.primary} / 0.1)` }}>
              {/* Top half — Set Bonus */}
              <div style={{ flex: 1, minHeight: 0, overflow: 'hidden auto', display: 'flex', flexDirection: 'column', paddingBottom: 0 }}>
                {activeSets.length > 0 ? (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <SectionHeader label="Set Bonus" elColor={elTheme.primary} />

                    {activeSets.map(({ setName, count, registry }) => (
                      <div key={setName} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div className="cpo-set-bonus-name-row">
                          <img
                            src={assetPath(registry.icon)}
                            alt={setName}
                            style={{ width: 26, height: 26, objectFit: 'contain' }}
                            onError={e => {
                              ;(e.target as HTMLImageElement).style.opacity = '0'
                            }}
                          />
                          <span className="cpo-set-bonus-name-text" style={{ color: `hsl(${elTheme.primary})` }}>
                            {setName}
                          </span>
                          <span style={{ marginLeft: 'auto', fontSize: '0.62rem', fontFamily: FONT_MONO, color: `hsl(${elTheme.primary} / 0.55)` }}>
                            {count}/5
                          </span>
                        </div>

                        {Object.entries(registry.info).map(([milestoneKey, desc]) => {
                          const required = Number(milestoneKey)
                          const isActive = count >= required
                          return (
                            <div
                              key={milestoneKey}
                              className="cpo-set-bonus-entry"
                              style={{
                                background: isActive ? `hsl(${elTheme.primary} / 0.07)` : 'rgba(20, 24, 36, 0.4)',
                                border: `1px solid ${isActive ? `hsl(${elTheme.primary} / 0.18)` : 'rgba(60, 70, 90, 0.3)'}`,
                                opacity: isActive ? 1 : 0.45,
                              }}>
                              <div className="cpo-set-bonus-entry-key" style={{ color: isActive ? `hsl(${elTheme.primary})` : MUTED }}>
                                {required}-pc
                              </div>
                              <p className="cpo-set-bonus-entry-desc">{isActive ? colorizeText(desc, elTheme.primary) : desc}</p>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED, fontSize: '0.75rem', opacity: 0.4 }}>No echoes equipped</div>
                )}
              </div>

              {/* Divider */}
              <div style={{ height: 1, flexShrink: 0, background: `linear-gradient(90deg, transparent, hsl(${elTheme.primary} / 0.15), transparent)` }} />

              {/* Bottom half — Orbital Scan */}
              <div style={{ flex: 1, minHeight: 0, overflow: 'hidden auto', display: 'flex', flexDirection: 'column', paddingTop: 12 }}>
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}>
                  <OrbitalScanPanel item={orbitalItem} elColor={elTheme.primary} />
                </motion.div>
              </div>
            </div>

            {/* Breakdown modal — covers entire body */}
            {selectedStatDisplay !== null && (
              <div className="cpo-breakdown-overlay">
                <BreakdownModal statDisplay={selectedStatDisplay} finalStats={finalStats} gearBreakdown={gearBreakdown} activeBreakdown={activeBreakdown} baseStat={baseStat} onClose={() => setSelectedStat(null)} />
              </div>
            )}
          </div>
        </div>

        {/* Bottom accent line */}
        <div style={{ height: 1, flexShrink: 0, background: `linear-gradient(90deg, transparent, hsl(${elTheme.primary} / 0.3), transparent)` }} />
      </motion.div>

      {/* Floating tooltip */}
      {tooltip && <div style={tooltipStyle(tooltip.x, tooltip.y)}>{tooltip.content}</div>}

      {/* Weapon picker */}
      {weaponPickerOpen && (
        <WeaponPickerModal
          weaponType={character.weaponType}
          characterName={characterName}
          elColor={elTheme.primary}
          onConfirm={newWeapon => {
            const newGear = { ...character.gear, weapon: newWeapon }
            onGearChange?.(characterName, newGear)
            setWeaponPickerOpen(false)
          }}
          onCancel={() => setWeaponPickerOpen(false)}
        />
      )}

      {/* Echo picker */}
      {pickerSlot !== null && (
        <EchoPickerModal
          slot={pickerSlot}
          currentGear={character.gear}
          characterName={characterName}
          elColor={elTheme.primary}
          onConfirm={newEcho => {
            const newEchoSlots = { ...character.gear.echoSlots, [pickerSlot]: newEcho }
            const newGear: Gear = { ...character.gear, echoSlots: newEchoSlots }
            onGearChange?.(characterName, newGear)
            setPickerSlot(null)
          }}
          onCancel={() => setPickerSlot(null)}
        />
      )}
    </>,
    document.body,
  )
}
