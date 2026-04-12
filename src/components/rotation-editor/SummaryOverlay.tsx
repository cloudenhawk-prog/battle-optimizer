import { createPortal } from 'react-dom'
import { useState, useId } from 'react'
import { motion } from 'framer-motion'
import '../../styles/rotation-editor/SummaryOverlay.css'
import { negativeStatuses } from '../../data/negativeStatuses'
import type { Snapshot } from '../../types/snapshot'
import type { DamageEvent } from '../../types/events'
import type { Character } from '../../types/character'
import type { ElementType } from '../../types/baseTypes'
import type { CharacterStats } from '../../types/stats'
import type { DamageModifier } from '../../types/modifiers'
import { splitEventByCharacter } from '../../utils/calculators/contributionAttribution'

// ========== Element Themes ==================================================================================================

const ELEMENT_COLORS: Record<string, { primary: string; glow: string; bg: string; label: string }> = {
  AERO:     { primary: 'hsl(160 80% 55%)',  glow: 'hsl(160 80% 55% / 0.35)', bg: 'hsl(160 40% 8%)',  label: 'Aero'    },
  SPECTRO:  { primary: 'hsl(45 90% 62%)',   glow: 'hsl(45 90% 62% / 0.35)',  bg: 'hsl(45 50% 8%)',   label: 'Spectro' },
  HAVOC:    { primary: 'hsl(270 80% 65%)',  glow: 'hsl(270 80% 65% / 0.35)', bg: 'hsl(270 40% 8%)',  label: 'Havoc'   },
  ELECTRO:  { primary: 'hsl(292 82% 70%)',  glow: 'hsl(292 82% 70% / 0.35)', bg: 'hsl(292 50% 8%)',  label: 'Electro' },
  GLACIO:   { primary: 'hsl(200 80% 67%)',  glow: 'hsl(200 80% 67% / 0.35)', bg: 'hsl(200 50% 8%)',  label: 'Glacio'  },
  FUSION:   { primary: 'hsl(15 90% 62%)',   glow: 'hsl(15 90% 62% / 0.35)',  bg: 'hsl(15 50% 8%)',   label: 'Fusion'  },
  '':       { primary: 'hsl(220 15% 60%)',  glow: 'hsl(220 15% 60% / 0.3)',  bg: 'hsl(220 15% 8%)',  label: '—'       },
}

function getElementColor(element: string) {
  return ELEMENT_COLORS[element] ?? ELEMENT_COLORS['']
}

type CharColor = { primary: string; glow: string; bg: string; label: string }

const ELEMENT_HSL: Record<string, { h: number; s: number; l: number }> = {
  AERO:     { h: 160, s: 80, l: 55 },
  SPECTRO:  { h: 45,  s: 90, l: 62 },
  HAVOC:    { h: 270, s: 80, l: 65 },
  ELECTRO:  { h: 292, s: 82, l: 70 },
  GLACIO:   { h: 200, s: 80, l: 67 },
  FUSION:   { h: 15,  s: 90, l: 62 },
  '':       { h: 220, s: 15, l: 60 },
}

/** Lightness & saturation offsets for each character slot sharing an element (up to 3). */
const CHAR_VARIANTS = [
  { lOff: 0,   sOff: 0   },  // first: base color
  { lOff: +22, sOff: -18 },  // second: noticeably lighter, less saturated (pastel-ish)
  { lOff: -20, sOff: +12 },  // third: noticeably darker, more vivid
]

/**
 * Builds a per-character color map so characters sharing an element get
 * visually distinct but hue-consistent colors across every panel.
 */
function buildCharacterColorMap(characters: Character[]): Map<string, CharColor> {
  const map = new Map<string, CharColor>()
  const elementGroups = new Map<string, string[]>()
  for (const char of characters) {
    const el = char.element ?? ''
    if (!elementGroups.has(el)) elementGroups.set(el, [])
    elementGroups.get(el)!.push(char.name)
  }
  for (const [element, names] of elementGroups) {
    const base = ELEMENT_HSL[element] ?? ELEMENT_HSL['']
    names.forEach((name, i) => {
      const v = CHAR_VARIANTS[i] ?? CHAR_VARIANTS[i % CHAR_VARIANTS.length]
      const l = Math.min(84, Math.max(30, base.l + v.lOff))
      const s = Math.min(95, Math.max(10, base.s + v.sOff))
      const primary = `hsl(${base.h} ${s}% ${l}%)`
      const glow    = `hsl(${base.h} ${s}% ${l}% / 0.35)`
      const bg      = `hsl(${base.h} ${Math.round(s * 0.5)}% 8%)`
      const label   = ELEMENT_COLORS[element]?.label ?? '—'
      map.set(name, { primary, glow, bg, label })
    })
  }
  return map
}

const DMG_TYPE_LABELS: Record<string, string> = {
  BASIC:           'Basic',
  HEAVY:           'Heavy',
  SKILL:           'Skill',
  LIBERATION:      'Liberation',
  COORDINATED:     'Coordinated',
  ECHO:            'Echo',
  INTRO:           'Intro',
  OUTRO:           'Outro',
  NEGATIVE_STATUS: 'Negative Status',
  '':              'Other',
}

const DMG_TYPE_THEMES: Record<string, { color: string; glow: string }> = {
  BASIC:        { color: 'hsl(210 75% 65%)',  glow: 'hsl(210 75% 65% / 0.35)'  },
  HEAVY:        { color: 'hsl(230 70% 65%)',  glow: 'hsl(230 70% 65% / 0.35)'  },
  SKILL:        { color: 'hsl(280 75% 68%)',  glow: 'hsl(280 75% 68% / 0.35)'  },
  LIBERATION:   { color: 'hsl(35 92% 62%)',   glow: 'hsl(35 92% 62% / 0.35)'   },
  COORDINATED:  { color: 'hsl(160 70% 55%)',  glow: 'hsl(160 70% 55% / 0.35)'  },
  ECHO:         { color: 'hsl(50 88% 60%)',   glow: 'hsl(50 88% 60% / 0.35)'   },
  INTRO:        { color: 'hsl(180 70% 58%)',  glow: 'hsl(180 70% 58% / 0.35)'  },
  OUTRO:        { color: 'hsl(330 70% 65%)',  glow: 'hsl(330 70% 65% / 0.35)'  },
  '':           { color: 'hsl(220 15% 55%)',  glow: 'hsl(220 15% 55% / 0.3)'   },
}

function getDmgTypeTheme(type: string) {
  return DMG_TYPE_THEMES[type] ?? DMG_TYPE_THEMES['']
}

/** Maps element → the name of the negative status associated with that element. */
const ELEMENT_TO_NEGATIVE_STATUS_LABEL: Record<string, string> = Object.fromEntries(
  Object.values(negativeStatuses).map(s => [s.element, s.name])
)

// ========== Data Computation ================================================================================================

type CharacterSummary = {
  name: string
  element: ElementType
  image?: string
  directDamage: number
  caDamage: number
  passiveDamage: number
  /** Direct + CA only (no passive). Used for Pie 1 per-character slice. */
  totalCharacterDamage: number
  damageByType: { type: string; damage: number }[]
  fieldTime: number
  libCount: number
  sequence: 0 | 1 | 2 | 3 | 4 | 5 | 6
  weaponRank: 1 | 2 | 3 | 4 | 5
  weaponName: string
}

type GlobalDamageEntry = { name: string; damage: number; element: string }

/** Entry for the contribution-attribution pie (Pie 2). */
type ContributionEntry = {
  name: string
  element: ElementType | ''
  image?: string
  attributedDamage: number
}

function computeSummaryData(
  characters: Character[],
  snapshots: Snapshot[],
  damageEvents: DamageEvent[],
) {
  const firstActionSnap = snapshots.find(s => s.action)
  const lastActionSnap = [...snapshots].reverse().find(s => s.action)
  const totalDuration = firstActionSnap && lastActionSnap
    ? lastActionSnap.toTime - firstActionSnap.fromTime
    : 0

  const fieldTimeMap: Record<string, number> = {}
  for (const s of snapshots) {
    if (!s.character || !s.action) continue
    fieldTimeMap[s.character] = (fieldTimeMap[s.character] ?? 0) + (s.toTime - s.fromTime)
  }

  const libCountMap: Record<string, number> = {}
  for (let i = 1; i < snapshots.length; i++) {
    for (const char of characters) {
      const maxE = char.maxEnergies.energy ?? 0
      if (maxE === 0) continue
      const cur = snapshots[i].charactersEnergies[char.name]?.energy ?? 0
      const prv = snapshots[i - 1].charactersEnergies[char.name]?.energy ?? 0
      if (prv - cur >= maxE * 0.5) libCountMap[char.name] = (libCountMap[char.name] ?? 0) + 1
    }
  }

  const passiveEvents = damageEvents.filter(e =>
    !characters.some(char => e.dealer === char.name || e.dealer.startsWith(char.name + ': '))
  )

  const characterSummaries: CharacterSummary[] = characters.map(char => {
    const directEvents = damageEvents.filter(
      e => e.dealer === char.name,
    )
    const caEvents = damageEvents.filter(
      e =>
        e.dealer !== char.name &&
        e.dealer.startsWith(char.name + ': '),
    )

    const directDamage = directEvents.reduce((s, e) => s + e.average, 0)
    const caDamage = caEvents.reduce((s, e) => s + e.average, 0)
    const passiveDamage = 0
    // totalCharacterDamage excludes passive so Pie 1 slices + "Field Effects" sum to grandTotal
    const totalCharacterDamage = directDamage + caDamage

    const typeMap = new Map<string, number>()
    for (const e of [...directEvents, ...caEvents]) {
      for (const t of e.dmgTypes) {
        typeMap.set(t, (typeMap.get(t) ?? 0) + e.average)
      }
    }
    const damageByType = Array.from(typeMap.entries())
      .map(([type, damage]) => ({ type, damage }))
      .sort((a, b) => b.damage - a.damage)

    return {
      name: char.name,
      element: char.element,
      image: char.image,
      directDamage,
      caDamage,
      passiveDamage,
      totalCharacterDamage,
      damageByType,
      fieldTime: fieldTimeMap[char.name] ?? 0,
      libCount: libCountMap[char.name] ?? 0,
      sequence: char.sequence,
      weaponRank: char.gear.weapon.rank,
      weaponName: char.gear.weapon.name,
    }
  })

  // Only include passive events not attributed to any specific character
  const globalStatusMap = new Map<string, { damage: number; element: string }>()
  for (const e of passiveEvents) {
    if (characters.some(c => e.dealer.startsWith(c.name + ': '))) continue
    const statusName = e.actionName
    const existing = globalStatusMap.get(statusName)
    if (existing) {
      existing.damage += e.average
    } else {
      globalStatusMap.set(statusName, { damage: e.average, element: e.elements[0] ?? '' })
    }
  }
  const globalDamage: GlobalDamageEntry[] = Array.from(globalStatusMap.entries())
    .map(([name, { damage, element }]) => ({ name, damage, element }))
    .sort((a, b) => b.damage - a.damage)

  const totalPassiveDamage = globalDamage.reduce((s, g) => s + g.damage, 0)

  const grandTotal = damageEvents.reduce((s, e) => s + e.average, 0)

  return { characterSummaries, globalDamage, totalPassiveDamage, grandTotal, totalDuration }
}

// ========== Action Breakdown Data ==========================================================================================

type ActionBreakdownEntry = { actionName: string; damage: number; count: number }

/** Per-character: action name → total damage (direct + CA, no passives). */
function computeActionBreakdowns(
  characters: Character[],
  damageEvents: DamageEvent[],
): Map<string, ActionBreakdownEntry[]> {
  const result = new Map<string, ActionBreakdownEntry[]>()
  for (const char of characters) {
    const byAction = new Map<string, number>()
    const byActionSnapshots = new Map<string, Set<number>>()
    for (const e of damageEvents) {
      const attributedToChar = e.dealer === char.name || e.dealer.startsWith(char.name + ': ')
      if (!attributedToChar) continue
      // Skip pure negative-status events dealt directly by the character (e.g. DoT ticks attributed
      // to the caster). Actions like Plunge Attack carry both BASIC and NEGATIVE_STATUS, so we only
      // skip events where NEGATIVE_STATUS is the sole dmgType.
      if (e.dmgTypes.every(t => t === 'NEGATIVE_STATUS') && e.dealer === char.name) continue
      byAction.set(e.actionName, (byAction.get(e.actionName) ?? 0) + e.average)
      if (!byActionSnapshots.has(e.actionName)) byActionSnapshots.set(e.actionName, new Set())
      byActionSnapshots.get(e.actionName)!.add(e.snapshotId)
    }
    result.set(
      char.name,
      Array.from(byAction.entries())
        .map(([actionName, damage]) => ({ actionName, damage, count: byActionSnapshots.get(actionName)?.size ?? 0 }))
        .sort((a, b) => b.damage - a.damage),
    )
  }
  return result
}

// ========== Modifier Description Map =======================================================================================

type ModifierDisplayInfo = {
  description?: string
  color?: string
  stats?: Partial<CharacterStats>
  showStats?: boolean
  targetStrategy?: string
}

function buildModifierInfoMap(characters: Character[]): Map<string, ModifierDisplayInfo> {
  const map = new Map<string, ModifierDisplayInfo>()
  const addMod = (mod: DamageModifier) => {
    const info: ModifierDisplayInfo = {
      description: mod.description,
      color: mod.color,
      stats: mod.characterStats,
      showStats: mod.showStats,
      targetStrategy: mod.targetStrategy,
    }
    // Index by original name AND stripped name so lookup works regardless of
    // whether entry.displayName came from contributions (original) or fell
    // back to the snapshot buff key (stripped, no spaces).
    if (!map.has(mod.displayName)) map.set(mod.displayName, info)
    const stripped = mod.displayName.replace(/\s+/g, '')
    if (stripped !== mod.displayName && !map.has(stripped)) map.set(stripped, info)
  }
  for (const char of characters) {
    for (const mod of char.damageModifiers) addMod(mod)
    for (const action of char.actions) {
      for (const mod of action.damageModifiers) addMod(mod)
    }
  }
  return map
}

/**
 * Computes per-character attributed damage for the Contribution pie (Pie 2).
 * See splitEventByCharacter (contributionAttribution.ts) for the Shapley algorithm details.
 * Efficiency: Σ attributedDamage = grandTotal exactly.
 */
function computeContributionData(
  characters: Character[],
  damageEvents: DamageEvent[],
): ContributionEntry[] {
  const charMap = new Map(characters.map(c => [c.name, c]))

  const getBaseChar = (dealer: string): string => {
    const colonIdx = dealer.indexOf(': ')
    return colonIdx >= 0 ? dealer.slice(0, colonIdx) : dealer
  }

  const attribution: Record<string, number> = {}

  for (const event of damageEvents) {
    const casterBase = getBaseChar(event.dealer)
    const { casterShare, externalByOwner } = splitEventByCharacter(event, casterBase)
    attribution[casterBase] = (attribution[casterBase] ?? 0) + casterShare
    for (const [owner, phi] of externalByOwner) {
      attribution[owner] = (attribution[owner] ?? 0) + phi
    }
  }

  // Consolidate all non-character keys (e.g. passive negative status dealers) into a
  // single '__OTHER__' player so it appears as a first-class Pie 2 slice.
  const charNames = new Set(characters.map(c => c.name))
  let otherTotal = 0
  for (const key of Object.keys(attribution)) {
    if (!charNames.has(key)) {
      otherTotal += attribution[key]
      delete attribution[key]
    }
  }
  if (otherTotal > 0) attribution['__OTHER__'] = otherTotal

  return Object.entries(attribution)
    .filter(([, v]) => v > 0)
    .map(([name, attributedDamage]) => {
      const char = charMap.get(name)
      return {
        name,
        element: (char?.element ?? '') as ElementType | '',
        image: char?.image,
        attributedDamage,
      }
    })
    .sort((a, b) => b.attributedDamage - a.attributedDamage)
}

// ========== Buff Uptime Data ================================================================================================

type BuffUptimeEntry = {
  key: string
  displayName: string
  ownerCharacter: string | null
  ownerElement: ElementType | ''
  coveredDamage: number
  coveragePct: number
  timeUptimePct: number
  firstAppliedAt: number
}

function computeBuffUptime(
  snapshots: Snapshot[],
  damageEvents: DamageEvent[],
  characters: Character[],
  grandTotal: number,
): BuffUptimeEntry[] {
  if (grandTotal === 0 || damageEvents.length === 0) return []

  const charElementMap = new Map(characters.map(c => [c.name, c.element]))

  // Use the last snapshot that has a resolved action for duration — the final row is always empty
  const firstActionSnap = snapshots.find(s => s.action)
  const lastActionSnap = [...snapshots].reverse().find(s => s.action)
  const rotationDuration = firstActionSnap && lastActionSnap
    ? lastActionSnap.toTime - firstActionSnap.fromTime
    : 0

  // Build display-name lookup from contributions: stripped key → original name + owner
  const displayNameMap = new Map<string, { displayName: string; ownerCharacter: string | null }>()
  for (const event of damageEvents) {
    for (const contrib of Object.values(event.contributions)) {
      if (!contrib.displayName) continue
      const stripped = contrib.displayName.replace(/\s+/g, '')
      if (!displayNameMap.has(stripped)) {
        displayNameMap.set(stripped, {
          displayName: contrib.displayName,
          ownerCharacter: contrib.ownerCharacter ?? null,
        })
      }
    }
  }

  // Identify limited-duration buff keys (those that were ever timed, not permanent)
  const limitedBuffKeys = new Set<string>()
  for (const snap of snapshots) {
    for (const [key, timeLeft] of Object.entries(snap.buffsTimeLeft)) {
      if (timeLeft < Infinity && timeLeft > 0) limitedBuffKeys.add(key)
    }
  }

  // Build snapshotId→snapshot map (snap.id is string, event.snapshotId is number)
  const snapshotMap = new Map<string, Snapshot>()
  for (const snap of snapshots) snapshotMap.set(snap.id, snap)

  // Accumulate damage covered per limited buff key
  const coverageMap = new Map<string, number>()
  for (const event of damageEvents) {
    const snap = snapshotMap.get(String(event.snapshotId))
    if (!snap) continue
    for (const [key, stacks] of Object.entries(snap.buffs)) {
      if (stacks > 0 && limitedBuffKeys.has(key)) {
        coverageMap.set(key, (coverageMap.get(key) ?? 0) + event.average)
      }
    }
  }

  // Accumulate active time per limited buff key
  const timeMap = new Map<string, number>()
  for (const snap of snapshots) {
    if (!snap.action) continue
    const duration = snap.toTime - snap.fromTime
    if (duration <= 0) continue
    for (const [key, stacks] of Object.entries(snap.buffs)) {
      if (stacks > 0 && limitedBuffKeys.has(key)) {
        timeMap.set(key, (timeMap.get(key) ?? 0) + duration)
      }
    }
  }

  // Find the first snapshot where each buff transitions from absent/0 → active
  const firstAppliedAtMap = new Map<string, number>()
  for (let i = 0; i < snapshots.length; i++) {
    const snap = snapshots[i]
    const prev = snapshots[i - 1]
    for (const key of limitedBuffKeys) {
      if (firstAppliedAtMap.has(key)) continue
      const cur = snap.buffs[key] ?? 0
      const prv = prev ? (prev.buffs[key] ?? 0) : 0
      if (cur > 0 && prv === 0) {
        firstAppliedAtMap.set(key, snap.fromTime)
      }
    }
  }

  return Array.from(coverageMap.entries())
    .map(([key, coveredDamage]) => {
      const info = displayNameMap.get(key)
      const ownerCharacter = info?.ownerCharacter ?? null
      const activeTime = timeMap.get(key) ?? 0
      return {
        key,
        displayName: info?.displayName ?? key,
        ownerCharacter,
        ownerElement: (ownerCharacter ? (charElementMap.get(ownerCharacter) ?? '') : '') as ElementType | '',
        coveredDamage,
        coveragePct: (coveredDamage / grandTotal) * 100,
        timeUptimePct: rotationDuration > 0 ? (activeTime / rotationDuration) * 100 : 0,
        firstAppliedAt: firstAppliedAtMap.get(key) ?? 0,
      }
    })
    .filter(e => e.coveragePct >= 1)
    .sort((a, b) => b.coveredDamage - a.coveredDamage)
}

// ========== Contribution Origin Data ========================================================================================

type ContributionOriginEntry = {
  charName: string
  element: ElementType
  selfPct: number
  buffedBy: { charName: string; element: ElementType; pct: number }[]
}

function computeContributionOrigin(
  characters: Character[],
  damageEvents: DamageEvent[],
): ContributionOriginEntry[] {
  const charMap = new Map(characters.map(c => [c.name, c]))

  const getBaseChar = (dealer: string): string => {
    const colonIdx = dealer.indexOf(': ')
    return colonIdx >= 0 ? dealer.slice(0, colonIdx) : dealer
  }

  const charTotals = new Map<string, { self: number; external: Map<string, number> }>()

  for (const event of damageEvents) {
    const casterBase = getBaseChar(event.dealer)
    if (!charTotals.has(casterBase)) charTotals.set(casterBase, { self: 0, external: new Map() })
    const entry = charTotals.get(casterBase)!

    const { casterShare, externalByOwner } = splitEventByCharacter(event, casterBase)
    entry.self += casterShare
    for (const [owner, phi] of externalByOwner) {
      entry.external.set(owner, (entry.external.get(owner) ?? 0) + phi)
    }
  }

  return Array.from(charTotals.entries())
    .filter(([name]) => charMap.has(name))
    .map(([charName, { self, external }]) => {
      const char = charMap.get(charName)!
      const total = self + Array.from(external.values()).reduce((s, v) => s + v, 0)
      if (total <= 0) return null
      const buffedBy = Array.from(external.entries())
        .filter(([, amt]) => amt / total >= 0.02)
        .map(([ownerName, amount]) => ({
          charName: ownerName,
          element: (charMap.get(ownerName)?.element ?? '') as ElementType,
          pct: (amount / total) * 100,
        }))
        .sort((a, b) => b.pct - a.pct)
      return { charName, element: char.element, selfPct: (self / total) * 100, buffedBy }
    })
    .filter(Boolean) as ContributionOriginEntry[]
}

// ========== Energy Flow Data ================================================================================================

type EnergyFlowEntry = {
  name: string
  element: ElementType
  libCount: number
  fieldTime: number
  energyGenerated: number
  energyGenPerSecond: number
}

function computeEnergyFlow(
  characters: Character[],
  snapshots: Snapshot[],
): EnergyFlowEntry[] {
  if (snapshots.length === 0) return []

  const fieldTimeMap: Record<string, number> = {}
  for (const s of snapshots) {
    if (!s.character || !s.action) continue
    fieldTimeMap[s.character] = (fieldTimeMap[s.character] ?? 0) + (s.toTime - s.fromTime)
  }

  // Count liberation casts (resonance energy drops >= 50% of max)
  const libCounts = new Map<string, number>()
  for (let i = 1; i < snapshots.length; i++) {
    for (const char of characters) {
      const maxE = char.maxEnergies.energy ?? 0
      if (maxE === 0) continue
      const cur = snapshots[i].charactersEnergies[char.name]?.energy ?? 0
      const prv = snapshots[i - 1].charactersEnergies[char.name]?.energy ?? 0
      if (prv - cur >= maxE * 0.5) {
        libCounts.set(char.name, (libCounts.get(char.name) ?? 0) + 1)
      }
    }
  }

  // Sum raw energy generated per character directly from action definitions (ignoring scaling/share/caps)
  const actionMapByChar = new Map<string, Map<string, (typeof characters)[number]['actions'][number]>>()
  for (const char of characters) {
    const m = new Map<string, (typeof characters)[number]['actions'][number]>()
    for (const action of char.actions) m.set(action.name, action)
    actionMapByChar.set(char.name, m)
  }
  const energyGainMap = new Map<string, number>()
  for (const snap of snapshots) {
    if (!snap.character || !snap.action) continue
    const action = actionMapByChar.get(snap.character)?.get(snap.action)
    if (!action) continue
    const generated = action.energyGenerated
      .filter(e => e.energyType === 'energy')
      .reduce((sum, e) => sum + e.amount, 0)
    if (generated > 0)
      energyGainMap.set(snap.character, (energyGainMap.get(snap.character) ?? 0) + generated)
  }

  return characters.map(char => {
    const generated = energyGainMap.get(char.name) ?? 0
    const fieldTime = fieldTimeMap[char.name] ?? 0
    return {
      name: char.name,
      element: char.element,
      libCount: libCounts.get(char.name) ?? 0,
      fieldTime,
      energyGenerated: generated,
      energyGenPerSecond: fieldTime > 0 ? generated / fieldTime : 0,
    }
  }).filter(e => e.energyGenerated > 0 || e.libCount > 0)
}

// ========== Helpers =========================================================================================================

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function annularArcPath(cx: number, cy: number, r1: number, r2: number, startDeg: number, endDeg: number) {
  const large = endDeg - startDeg > 180 ? 1 : 0
  const s1 = polarToCartesian(cx, cy, r2, startDeg)
  const e1 = polarToCartesian(cx, cy, r2, endDeg)
  const s2 = polarToCartesian(cx, cy, r1, endDeg)
  const e2 = polarToCartesian(cx, cy, r1, startDeg)
  return `M ${s1.x} ${s1.y} A ${r2} ${r2} 0 ${large} 1 ${e1.x} ${e1.y} L ${s2.x} ${s2.y} A ${r1} ${r1} 0 ${large} 0 ${e2.x} ${e2.y} Z`
}

function formatDamage(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return value.toFixed(0)
}

function formatTime(seconds: number): string {
  if (seconds < 0.01) return '0s'
  return `${seconds.toFixed(2)}s`
}

// ========== Panel Section Header ============================================================================================

function PanelHeader({ label, accent = 'cyan' }: { label: string; accent?: 'cyan' | 'purple' | 'amber' }) {
  return (
    <div className={`summaryPanelHeader ${accent}`}>
      <div className={`summaryPanelHeaderDot ${accent}`} />
      <span className="summaryPanelHeaderLabel">{label}</span>
      <div className="summaryPanelHeaderLine" />
    </div>
  )
}

// ========== Left Panel — efficiency DpFS + field time ======================================================================

type LeftPanelProps = {
  characterSummaries: CharacterSummary[]
  charColorMap: Map<string, CharColor>
  energyFlow: EnergyFlowEntry[]
}

function LeftPanel({ characterSummaries, charColorMap, energyFlow }: LeftPanelProps) {
  const activeChars = characterSummaries.filter(c => c.fieldTime > 0)
  const totalFieldTime = activeChars.reduce((s, c) => s + c.fieldTime, 0)
  const maxOnFieldDps = Math.max(...activeChars.map(c => (c.directDamage + c.caDamage) / c.fieldTime), 1)
  const maxEnergyPerSec = Math.max(...energyFlow.map(e => e.energyGenPerSecond), 1)

  return (
    <div className="summaryLeftPanel">

      {/* ── Field Time & Field DPS ── */}
      <div className="summaryLeftHalf">
        <PanelHeader label="FIELD TIME & DPS" accent="purple" />
        <div className="summaryStatCards">
          {activeChars.map(c => {
            const pct = totalFieldTime > 0 ? (c.fieldTime / totalFieldTime) * 100 : 0
            const onFieldDps = (c.directDamage + c.caDamage) / c.fieldTime
            const dpsPct = (onFieldDps / maxOnFieldDps) * 100
            const theme = charColorMap.get(c.name) ?? getElementColor(c.element)
            return (
              <div
                key={c.name}
                className="summaryStatCard"
                style={{ '--card-color': theme.primary, '--card-glow': theme.glow } as React.CSSProperties}
              >
                <div className="summaryStatCardTop">
                  <span className="summaryStatCardName">{c.name}</span>
                  <span className="summaryStatCardPrimary">{formatDamage(onFieldDps)}/s</span>
                </div>
                <div className="summaryStatCardBars">
                  <div className="summaryStatCardBar">
                    <div className="summaryStatCardBarFill" style={{ width: `${dpsPct}%` }} />
                  </div>
                  <div className="summaryStatCardBar summaryStatCardBarAlt">
                    <div className="summaryStatCardBarFill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="summaryStatCardSecondary">{pct.toFixed(0)}% field · {formatTime(c.fieldTime)}</span>
              </div>
            )
          })}
          {totalFieldTime > 0 && (
            <div className="summaryStatCardTotalRow">
              <span className="summaryStatCardTotalLabel">Total rotation</span>
              <span className="summaryStatCardTotalValue">{formatTime(totalFieldTime)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="summaryLeftHalfDivider" />

      {/* ── Energy Generation ── */}
      <div className="summaryLeftHalf">
        <PanelHeader label="ENERGY GENERATION" accent="amber" />
        {energyFlow.length === 0 ? (
          <div className="summaryRightEmpty">No energy data available</div>
        ) : (
          <div className="summaryStatCards">
            {energyFlow.map(entry => {
              const theme = charColorMap.get(entry.name) ?? getElementColor(entry.element)
              const perSecPct = (entry.energyGenPerSecond / maxEnergyPerSec) * 100
              return (
                <div
                  key={entry.name}
                  className="summaryStatCard"
                  style={{ '--card-color': theme.primary, '--card-glow': theme.glow } as React.CSSProperties}
                >
                  <div className="summaryStatCardTop">
                    <span className="summaryStatCardName">{entry.name}</span>
                    <span className="summaryStatCardPrimary">{entry.energyGenPerSecond.toFixed(1)}/s</span>
                  </div>
                  <div className="summaryStatCardBar">
                    <div className="summaryStatCardBarFill" style={{ width: `${perSecPct}%` }} />
                  </div>
                  <span className="summaryStatCardSecondary">{entry.energyGenerated.toFixed(1)} total</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

// ========== Reusable Pie Chart Component ====================================================================================

type PieItem = { name: string; value: number; color: string; glow: string }

type PieSectionProps = {
  title: string
  accent: 'cyan' | 'purple' | 'amber'
  items: PieItem[]
  total: number
  centerLabel?: string
  subtitle?: string
}

function PieSection({ title, accent, items, total, centerLabel = 'Total', subtitle }: PieSectionProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const uid = useId()

  const CX = 200, CY = 200
  const INNER_R = 80, OUTER_R = 128
  const TICK_R = 136, RING2_INNER = 145, RING2_OUTER = 153
  const GAP = items.length > 1 ? 2.0 : 0
  // Single-item arcs would produce a degenerate 360° path; use 359.99 to keep it drawable
  const usableDeg = items.length > 1 ? (360 - GAP * items.length) : 359.99
  let cursor = 0
  const arcs = total > 0 ? items.map((item, i) => {
    const sweep = (item.value / total) * usableDeg
    const start = cursor
    const end = cursor + sweep
    cursor = end + GAP
    return { ...item, start, end, mid: (start + end) / 2, index: i }
  }) : []

  const ticks = Array.from({ length: 60 }, (_, i) => {
    const angle = i * 6
    const isMajor = i % 5 === 0
    const p1 = polarToCartesian(CX, CY, TICK_R, angle)
    const p2 = polarToCartesian(CX, CY, TICK_R + (isMajor ? 6 : 3), angle)
    return { p1, p2, isMajor }
  })

  const hoveredItem = hoveredIdx !== null ? items[hoveredIdx] : null
  const glowId = `spie-glow-${uid}`
  const gradId = (i: number) => `spie-grad-${uid}-${i}`

  return (
    <div className="summaryPieSection">
      <PanelHeader label={title} accent={accent} />
      {subtitle && <div className="summaryPieSubtitle">{subtitle}</div>}

      <div className="summaryPieWrap">
        <svg viewBox="34 34 332 332" className="summaryPieSvg" style={{ overflow: 'visible' }}>
          <defs>
            {arcs.map((a, i) => (
              <radialGradient key={gradId(i)} id={gradId(i)} cx="50%" cy="50%" r="50%">
                <stop offset="30%" stopColor={a.color} stopOpacity="0.9" />
                <stop offset="100%" stopColor={a.color} stopOpacity="0.55" />
              </radialGradient>
            ))}
            <filter id={glowId}>
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background rings — idle: slow desynchronised opacity breathing */}
          <motion.circle
            cx={CX} cy={CY} r={OUTER_R + 20}
            fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5"
            animate={{ opacity: [0.2, 0.55, 0.2] }}
            transition={{ duration: 5.5, ease: 'easeInOut', repeat: Infinity }}
          />
          <motion.circle
            cx={CX} cy={CY} r={INNER_R - 8}
            fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5"
            animate={{ opacity: [0.12, 0.38, 0.12] }}
            transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity, delay: 1.8 }}
          />

          {/* Tick marks */}
          {ticks.map((t, i) => (
            <motion.line
              key={`${uid}-tick-${i}`}
              x1={t.p1.x} y1={t.p1.y} x2={t.p2.x} y2={t.p2.y}
              stroke="rgba(255,255,255,0.25)"
              strokeWidth={t.isMajor ? 1 : 0.5}
              initial={{ opacity: 0 }}
              animate={{ opacity: t.isMajor ? 0.5 : 0.2 }}
              transition={{ delay: 0.6 + i * 0.008, duration: 0.3 }}
            />
          ))}

          {/* Outer thin ring (secondary data layer) */}
          {arcs.map((a) => {
            const sweep2 = (a.end - a.start) * 0.7
            return (
              <motion.path
                key={`${uid}-ring2-${a.index}`}
                d={annularArcPath(CX, CY, RING2_INNER, RING2_OUTER, a.start, a.start + sweep2)}
                fill={a.color}
                fillOpacity="0.22"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + a.index * 0.06, duration: 0.4 }}
              />
            )
          })}



          {/* Main donut segments */}
          {arcs.map((a) => {
            const isHovered = hoveredIdx === a.index
            return (
              <motion.path
                key={`${uid}-seg-${a.index}`}
                d={annularArcPath(CX, CY, INNER_R, OUTER_R + (isHovered ? 6 : 0), a.start, a.end)}
                fill={`url(#${gradId(a.index)})`}
                stroke="rgba(8,10,18,0.9)"
                strokeWidth={1.5}
                filter={isHovered ? `url(#${glowId})` : undefined}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{
                  opacity: isHovered ? 1 : (hoveredIdx !== null ? 0.55 : 0.88),
                  scale: 1,
                }}
                transition={{
                  // opacity uses a fast tween — works for both entrance fade-in and hover dimming
                  opacity: { duration: 0.15 },
                  // scale uses a staggered spring — only meaningful on mount (entrance)
                  scale: { delay: 0.15 + a.index * 0.07, type: 'spring', stiffness: 120, damping: 14 },
                }}
                style={{ transformOrigin: `${CX}px ${CY}px`, cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIdx(a.index)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            )
          })}

          {/* Idle: center glow pulse — soft halo at the inner edge of the donut */}
          <motion.circle
            cx={CX} cy={CY} r={INNER_R + 5}
            fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={4}
            animate={{ opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity, delay: 0.8 }}
          />

          {/* Center circle */}
          <motion.circle
            cx={CX} cy={CY} r={INNER_R - 2}
            fill="rgba(8,10,18,0.97)"
            stroke="rgba(255,255,255,0.06)" strokeWidth={1}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 150, damping: 16 }}
          />


        </svg>

        <div className="summaryPieCenter">
          {hoveredItem ? (
            <>
              <div className="summaryPieCenterName">{hoveredItem.name}</div>
              <div
                className="summaryPieCenterBig"
                style={{ color: hoveredItem.color, textShadow: `0 0 16px ${hoveredItem.glow}` }}
              >
                {formatDamage(hoveredItem.value)}
              </div>
              <div className="summaryPieCenterPct">
                {((hoveredItem.value / total) * 100).toFixed(1)}%
              </div>
            </>
          ) : (
            <>
              <div className="summaryPieCenterLabel">{centerLabel}</div>
              <div className="summaryPieCenterBig">{formatDamage(total)}</div>
            </>
          )}
        </div>
      </div>

      <div className="summaryPieLegend">
        {items.map((item, i) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0
          return (
            <div
              key={i}
              className={`summaryPieLegendRow${hoveredIdx === i ? ' active' : ''}`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div
                className="summaryPieLegendDot"
                style={{ background: item.color, boxShadow: `0 0 6px ${item.glow}` }}
              />
              <span className="summaryPieLegendName">{item.name}</span>
              <span className="summaryPieLegendValue">{formatDamage(item.value)}</span>
              <span className="summaryPieLegendPct" style={{ color: item.color }}>
                {pct.toFixed(1)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ========== Center Panel — two pie charts + per-character breakdown =========================================================

type CenterPanelProps = {
  characterSummaries: CharacterSummary[]
  globalDamage: GlobalDamageEntry[]
  totalPassiveDamage: number
  grandTotal: number
  totalDuration: number
  contributionEntries: ContributionEntry[]
  contributionOrigin: ContributionOriginEntry[]
  actionBreakdowns: Map<string, ActionBreakdownEntry[]>
  passiveDamageEvents: DamageEvent[]
  charColorMap: Map<string, CharColor>
}

function CenterPanel({ characterSummaries, globalDamage, totalPassiveDamage, grandTotal, totalDuration, contributionEntries, contributionOrigin, actionBreakdowns, passiveDamageEvents, charColorMap }: CenterPanelProps) {
  const [pieMode, setPieMode] = useState<'damage' | 'dps'>('damage')
  const isDps = pieMode === 'dps' && totalDuration > 0
  const dpsScale = isDps ? 1 / totalDuration : 1

  const originByChar = new Map(contributionOrigin.map(e => [e.charName, e]))
  // Pie 1: damage share — per character (direct+CA) + pooled field effects
  const pie1Items: PieItem[] = [
    ...characterSummaries
      .filter(c => c.totalCharacterDamage > 0)
      .map(c => {
        const cc = charColorMap.get(c.name) ?? getElementColor(c.element)
        return { name: c.name, value: c.totalCharacterDamage * dpsScale, color: cc.primary, glow: cc.glow }
      }),
    ...(totalPassiveDamage > 0
      ? [{ name: 'Other Sources', value: totalPassiveDamage * dpsScale, color: 'hsl(220 15% 60%)', glow: 'hsl(220 15% 60% / 0.3)' }]
      : []),
  ].filter(item => item.value > 0)

  // Pie 2: contribution attribution — damage attributed to each enabler
  const characterNames = new Set(characterSummaries.map(c => c.name))
  const pie2CharEntries = contributionEntries.filter(c => c.attributedDamage > 0 && characterNames.has(c.name))
  const pie2OtherEntry = contributionEntries.find(c => c.name === '__OTHER__')
  const pie2Total = contributionEntries.reduce((s, c) => s + c.attributedDamage, 0)

  // Compute role tags
  const activeCharsForRole = characterSummaries.filter(c => c.totalCharacterDamage > 0 || c.fieldTime > 0)
  const charDamages = activeCharsForRole.map(c => c.totalCharacterDamage)
  const maxDamage = charDamages.length > 0 ? Math.max(...charDamages) : 0
  const minDamage = charDamages.length > 0 ? Math.min(...charDamages) : 0
  const totalCharDamage = charDamages.reduce((s, v) => s + v, 0)
  const contribMap = new Map(contributionEntries.map(c => [c.name, c.attributedDamage]))
  const roleMap = new Map<string, 'Main Carry' | 'Sub DPS' | 'Buffer'>()
  for (const c of activeCharsForRole) {
    const contribPct = pie2Total > 0 ? ((contribMap.get(c.name) ?? 0) / pie2Total) * 100 : 0
    if (c.totalCharacterDamage === maxDamage && totalCharDamage > 0 && c.totalCharacterDamage / totalCharDamage > 0.5) {
      roleMap.set(c.name, 'Main Carry')
    } else if (c.totalCharacterDamage === minDamage && contribPct > 15) {
      roleMap.set(c.name, 'Buffer')
    } else if (c.totalCharacterDamage !== maxDamage && c.totalCharacterDamage !== minDamage) {
      roleMap.set(c.name, 'Sub DPS')
    }
  }

  const pie2Items: PieItem[] = [
    ...pie2CharEntries.map(c => {
      const cc = charColorMap.get(c.name) ?? getElementColor(c.element)
      return { name: c.name, value: c.attributedDamage * dpsScale, color: cc.primary, glow: cc.glow }
    }),
    ...(pie2OtherEntry && pie2OtherEntry.attributedDamage > 0
      ? [{ name: 'Other', value: pie2OtherEntry.attributedDamage * dpsScale, color: 'hsl(220 15% 60%)', glow: 'hsl(220 15% 60% / 0.3)' }]
      : []),
  ]

  const pieCenterLabel = isDps ? 'Team DPS' : 'Total'
  const pie1Total = isDps ? grandTotal / totalDuration : grandTotal
  const pie2TotalScaled = isDps ? pie2Total / totalDuration : pie2Total

  return (
    <div className="summaryCenterPanel">
      {/* Pie mode toggle */}
      <div className="summaryPiesToggleRow">
        <button
          className={`summaryBuffViewBtn${pieMode === 'damage' ? ' active' : ''}`}
          onClick={() => setPieMode('damage')}
        >Damage</button>
        <button
          className={`summaryBuffViewBtn${pieMode === 'dps' ? ' active' : ''}`}
          onClick={() => setPieMode('dps')}
        >DPS</button>
      </div>
      {/* Dual pie row */}
      <div className="summaryPiesRow">
        <PieSection
          title="DAMAGE SHARE"
          accent="cyan"
          items={pie1Items}
          total={pie1Total}
          centerLabel={pieCenterLabel}
          subtitle={isDps ? 'Rotation DPS by character' : 'Damage done by each character'}
        />
        <div className="summaryPiesDivider" />
        <PieSection
          title="CONTRIBUTION"
          accent="purple"
          items={pie2Items}
          total={pie2TotalScaled}
          centerLabel={pieCenterLabel}
          subtitle={isDps ? 'Attributed DPS per resonator (buffs credited to buffer)' : 'Damage contribution per Resonator (Shapley-based attribution)'}
        />
      </div>

      {/* Per-character type breakdown cards */}
      <PanelHeader label="RESONATOR BREAKDOWN" accent="cyan" />
      <div className="summaryCharCards">
        {characterSummaries.filter(char => char.totalCharacterDamage > 0 || char.passiveDamage > 0).map(char => (
          <CharTypeCard
            key={char.name}
            summary={char}
            originEntry={originByChar.get(char.name)}
            actionBreakdown={actionBreakdowns.get(char.name)}
            role={roleMap.get(char.name)}
            charColorMap={charColorMap}
          />
        ))}
        {globalDamage.length > 0 && (
          <NegativeStatusesCard globalDamage={globalDamage} grandTotal={grandTotal} passiveDamageEvents={passiveDamageEvents} />
        )}
      </div>
    </div>
  )
}

function CharTypeCard({ summary, originEntry, actionBreakdown, role, charColorMap }: { summary: CharacterSummary; originEntry?: ContributionOriginEntry; actionBreakdown?: ActionBreakdownEntry[]; role?: 'Main Carry' | 'Sub DPS' | 'Buffer'; charColorMap: Map<string, CharColor> }) {
  const [expanded, setExpanded] = useState(false)
  const theme = charColorMap.get(summary.name) ?? getElementColor(summary.element)
  const allCharDamage = summary.directDamage + summary.caDamage + summary.passiveDamage
  const maxActionDmg = actionBreakdown && actionBreakdown.length > 0 ? actionBreakdown[0].damage : 1

  return (
    <div
      className="summaryCharCard"
      style={{ '--char-color': theme.primary, '--char-glow': theme.glow } as React.CSSProperties}
    >
      <div className="summaryCharCardAccent" />

      {/* Header */}
      <div className="summaryCharCardHeader">
        <div className="summaryCharCardPortrait">
          {summary.image ? (
            <img src={summary.image} alt={summary.name} className="summaryCharCardPortraitImg" />
          ) : (
            <div className="summaryCharCardPortraitFallback">{summary.name.slice(0, 2).toUpperCase()}</div>
          )}
          <div className="summaryCharCardPortraitGlow" />
        </div>
        <div className="summaryCharCardInfo">
          <div className="summaryCharCardName">{summary.name}</div>
          <div className="summaryCharCardGearTags">
            <span className="summaryCharCardGearTag">S{summary.sequence}</span>
            <span className="summaryCharCardGearTag">R{summary.weaponRank} {summary.weaponName}</span>
          </div>
        </div>
        <div className="summaryCharCardChips">
          {role && (
            <span
              className="summaryCharCardChip"
              style={{ color: theme.primary, borderColor: `color-mix(in srgb, ${theme.primary} 30%, transparent)`, background: `color-mix(in srgb, ${theme.primary} 8%, transparent)` }}
            >
              {role}
            </span>
          )}
          {summary.libCount > 0 && (
            <span
              className="summaryCharCardChip"
              style={{ color: theme.primary, borderColor: `color-mix(in srgb, ${theme.primary} 30%, transparent)`, background: `color-mix(in srgb, ${theme.primary} 8%, transparent)` }}
            >
              ×{summary.libCount} Liberation{summary.libCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Contribution origin strip — always shown to show where this character's damage comes from */}
      {originEntry && (
        <div className="summaryCharOriginStrip">
          <span
            className="summaryCharOriginChip"
            style={{ color: theme.primary, borderColor: `color-mix(in srgb, ${theme.primary} 40%, transparent)` }}
          >
            Self {originEntry.selfPct.toFixed(0)}%
          </span>
          {originEntry.buffedBy.map(b => {
            const bTheme = charColorMap.get(b.charName) ?? getElementColor(b.element)
            return (
              <span
                key={b.charName}
                className="summaryCharOriginChip"
                style={{ color: bTheme.primary, borderColor: `color-mix(in srgb, ${bTheme.primary} 40%, transparent)` }}
              >
                {b.pct.toFixed(0)}% from {b.charName}
              </span>
            )
          })}
        </div>
      )}

      {/* Damage-type bars — primary content. Click to toggle action breakdown */}
      {/* Each type receives the full damage of any action that carries it, so bars may sum beyond the card total. */}
      {summary.damageByType.length > 0 && (
        <div
          className="summaryCharTypeDisclaimer"
          style={{ color: `color-mix(in srgb, ${theme.primary} 70%, rgba(255,255,255,0.4))` }}
        >
          Damage Type Distribution
        </div>
      )}
      <div className="summaryCharTypeRowsGrid">
        {summary.damageByType.length === 0 ? (
          <div className="summaryCharTypeEmpty">No direct damage recorded</div>
        ) : (
          summary.damageByType.filter(({ damage }) => damage > 0).map(({ type, damage }) => {
            const teamPct = allCharDamage > 0 ? (damage / allCharDamage) * 100 : 0
            const typeTheme = getDmgTypeTheme(type)
            const typeLabel = type === 'NEGATIVE_STATUS'
              ? (ELEMENT_TO_NEGATIVE_STATUS_LABEL[summary.element] ?? DMG_TYPE_LABELS[type])
              : (DMG_TYPE_LABELS[type] ?? type)
            return (
              <div key={type} className="summaryCharTypeRow">
                <span className="summaryCharTypeLabel">{typeLabel}</span>
                <div className="summaryCharTypeBar">
                  <div
                    className="summaryCharTypeBarFill"
                    style={{
                      width: `${teamPct}%`,
                      background: typeTheme.color,
                      boxShadow: `0 0 8px ${typeTheme.glow}`,
                    }}
                  />
                </div>
                <span className="summaryCharTypePct">{teamPct.toFixed(1)}%</span>
              </div>
            )
          })
        )}
      </div>

      {/* Action breakdown — collapsed by default. Toggle via expand button. */}
      {actionBreakdown && actionBreakdown.length > 0 && (
        <>
          <button
            className="summaryCharExpandBtn"
            style={{ color: theme.primary }}
            onClick={() => setExpanded(v => !v)}
          >
            {expanded ? '▲ Hide action detail' : '▼ Show action breakdown'}
          </button>
          {expanded && (
            <div className="summaryActionBreakdown">
              <div className="summaryActionBreakdownHeader">
                <span className="summaryActionCount summaryActionHeaderLabel">Casts</span>
                <span className="summaryActionName summaryActionHeaderLabel">Action</span>
                <div className="summaryActionBar summaryActionBarSpacer" />
                <span className="summaryActionValue summaryActionHeaderLabel">Total DMG</span>
                <span className="summaryActionPct summaryActionHeaderLabel">Share</span>
              </div>
              {actionBreakdown.map(entry => {
                const barPct = maxActionDmg > 0 ? (entry.damage / maxActionDmg) * 100 : 0
                const teamPct = allCharDamage > 0 ? (entry.damage / allCharDamage) * 100 : 0
                return (
                  <div key={entry.actionName} className="summaryActionRow">
                    <span className="summaryActionCount">×{entry.count}</span>
                    <span className="summaryActionName">{entry.actionName}</span>
                    <div className="summaryActionBar">
                      <div
                        className="summaryActionBarFill"
                        style={{ width: `${barPct}%`, background: theme.primary, boxShadow: `0 0 4px ${theme.glow}` }}
                      />
                    </div>
                    <span className="summaryActionValue">{formatDamage(entry.damage)}</span>
                    <span className="summaryActionPct">{teamPct.toFixed(1)}%</span>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ========== Negative Statuses Card =========================================================================================

function NegativeStatusesCard({ globalDamage, grandTotal, passiveDamageEvents }: { globalDamage: GlobalDamageEntry[]; grandTotal: number; passiveDamageEvents: DamageEvent[] }) {
  const [expanded, setExpanded] = useState(false)
  const sortedEvents = [...passiveDamageEvents].sort((a, b) => a.timeStamp - b.timeStamp)
  const total = globalDamage.reduce((s, g) => s + g.damage, 0)
  const shareOfTotal = grandTotal > 0 ? (total / grandTotal) * 100 : 0
  const maxDmg = globalDamage.length > 0 ? globalDamage[0].damage : 1
  const fieldColor = 'hsl(215 20% 62%)'
  const fieldGlow = 'hsl(215 20% 62% / 0.3)'
  const statusCount = globalDamage.length
  const statusChipLabel = statusCount === 1
    ? globalDamage[0].name
    : statusCount === 2
      ? 'Dual Status'
      : `${statusCount} Statuses`

  return (
    <div
      className="summaryCharCard summaryNegativeStatusCard"
      style={{ '--char-color': fieldColor, '--char-glow': fieldGlow } as React.CSSProperties}
    >
      <div className="summaryCharCardAccent" />

      <div className="summaryCharCardHeader">
        <div className="summaryCharCardPortrait">
          <div className="summaryCharCardPortraitFallback" style={{ fontSize: '20px', letterSpacing: 0 }}>◈</div>
          <div className="summaryCharCardPortraitGlow" />
        </div>
        <div className="summaryCharCardInfo">
          <div className="summaryCharCardName">Other Sources</div>
          <div className="summaryCharCardMeta">
            <span className="summaryCharCardTotal">{formatDamage(total)}</span>
            <span className="summaryCharCardShare" style={{ color: fieldColor }}>
              {shareOfTotal.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="summaryCharCardChips">
          <span
            className="summaryCharCardChip"
            style={{ color: fieldColor, borderColor: `color-mix(in srgb, ${fieldColor} 30%, transparent)`, background: `color-mix(in srgb, ${fieldColor} 8%, transparent)` }}
          >
            {statusChipLabel}
          </span>
        </div>
      </div>

      <div className="summaryCharTypeRows">
        {globalDamage.map(entry => {
          const barPct = (entry.damage / maxDmg) * 100
          const teamPct = total > 0 ? (entry.damage / total) * 100 : 0
          const elTheme = getElementColor(entry.element)
          return (
            <div key={entry.name} className="summaryCharTypeRow">
              <span className="summaryCharTypeLabel">{entry.name}</span>
              <div className="summaryCharTypeBar">
                <div
                  className="summaryCharTypeBarFill"
                  style={{ width: `${barPct}%`, background: elTheme.primary, boxShadow: `0 0 8px ${elTheme.glow}` }}
                />
              </div>
              <span className="summaryCharTypeValue">{formatDamage(entry.damage)}</span>
              <span className="summaryCharTypePct">{teamPct.toFixed(1)}%</span>
            </div>
          )
        })}
      </div>

      <button
        className="summaryCharExpandBtn"
        style={{ color: fieldColor }}
        onClick={() => setExpanded(v => !v)}
      >
        {expanded ? '▲ Hide per-action detail' : '▼ Show per-action breakdown'}
      </button>
      {expanded && (
        <div className="summaryActionBreakdown summaryNsEventList">
          {sortedEvents.map((e, i) => (
            <div key={i} className="summaryNsEventRow">
              <span className="summaryNsEventTime">{formatTime(e.timeStamp)}</span>
              <span className="summaryNsEventName">{e.actionName}</span>
              <span className="summaryNsEventDmg">{formatDamage(e.average)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ========== Right Panel — buff uptime + contribution origin + energy overview =============================================

function RightPanel({ buffUptime, modifierInfoMap, charColorMap }: { buffUptime: BuffUptimeEntry[]; modifierInfoMap: Map<string, ModifierDisplayInfo>; charColorMap: Map<string, CharColor> }) {
  const [buffView, setBuffView] = useState<'coverage' | 'uptime'>('coverage')
  const [activeTooltip, setActiveTooltip] = useState<{ entry: BuffUptimeEntry; rect: DOMRect } | null>(null)

  const STRATEGY_LABELS: Record<string, string> = {
    self: 'Self',
    active: 'Active Character',
    all: 'All Resonators',
    nextSwap: 'Swap In Character',
    activeAlly: 'Active Ally',
  }

  const tooltipPortal = (() => {
    if (!activeTooltip) return null
    const { entry, rect } = activeTooltip
    const ownerTheme = (entry.ownerCharacter ? charColorMap.get(entry.ownerCharacter) : null) ?? getElementColor(entry.ownerElement)
    const iconPath = `/assets/modifiers/${entry.displayName.toLowerCase().replace(/:/g, '').replace(/\s+/g, '_')}.png`
    const info = modifierInfoMap.get(entry.displayName)
    const accentColor = ownerTheme.primary

    // Open upward when the row is in the bottom 40% of the viewport to stay visible
    const openUpward = rect.bottom > window.innerHeight * 0.6
    const posStyle: React.CSSProperties = openUpward
      ? { bottom: `${window.innerHeight - rect.top + 6}px`, top: 'auto' }
      : { top: `${rect.bottom + 6}px`, bottom: 'auto' }

    return createPortal(
      <div
        className="summaryBuffRowTooltip"
        style={{
          position: 'fixed',
          right: `${window.innerWidth - rect.right}px`,
          opacity: 1,
          visibility: 'visible',
          transform: 'none',
          zIndex: 9999,
          '--buff-tooltip-accent': accentColor,
          ...posStyle,
        } as React.CSSProperties}
      >
        <div className="summaryBuffRowTooltipHeader">
          <img key={entry.key} src={iconPath} alt="" className="summaryBuffRowTooltipIcon" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
          <span className="summaryBuffRowTooltipLabel" style={{ color: accentColor }}>{entry.displayName}</span>
        </div>
        <div className="summaryBuffRowTooltipCoverage">
          {entry.ownerCharacter && (
            <div className="summaryBuffRowTooltipStat">
              <span className="summaryBuffRowTooltipStatKey">Source</span>
              <span className="summaryBuffRowTooltipStatVal" style={{ color: ownerTheme.primary }}>{entry.ownerCharacter}</span>
            </div>
          )}
          {info?.targetStrategy && (
            <div className="summaryBuffRowTooltipStat">
              <span className="summaryBuffRowTooltipStatKey">Targets</span>
              <span className="summaryBuffRowTooltipStatVal" style={{ color: accentColor }}>{STRATEGY_LABELS[info.targetStrategy] ?? info.targetStrategy}</span>
            </div>
          )}
          <div className="summaryBuffRowTooltipStat">
            <span className="summaryBuffRowTooltipStatKey">Damage covered</span>
            <span className="summaryBuffRowTooltipStatVal" style={{ color: accentColor }}>{formatDamage(entry.coveredDamage)}</span>
          </div>
          <div className="summaryBuffRowTooltipStat">
            <span className="summaryBuffRowTooltipStatKey">First applied</span>
            <span className="summaryBuffRowTooltipStatVal" style={{ color: accentColor }}>{formatTime(entry.firstAppliedAt)}</span>
          </div>
        </div>
        <div className="summaryBuffRowTooltipDivider" />
        <div className="summaryBuffRowTooltipStats">
          <div className="summaryBuffRowTooltipStat">
            <span className="summaryBuffRowTooltipStatKey">Coverage</span>
            <span className="summaryBuffRowTooltipStatVal" style={{ color: accentColor }}>{entry.coveragePct.toFixed(1)}%</span>
          </div>
          <div className="summaryBuffRowTooltipStat">
            <span className="summaryBuffRowTooltipStatKey">Uptime</span>
            <span className="summaryBuffRowTooltipStatVal" style={{ color: accentColor }}>{entry.timeUptimePct.toFixed(1)}%</span>
          </div>
        </div>
      </div>,
      document.body,
    )
  })()

  return (
    <div className="summaryRightPanel">

      {/* ── Section 1: Buff Coverage ── */}
      <div className="summarySectionGroup">
        <div className="summaryBuffViewHeader">
          <PanelHeader label="BUFF COVERAGE" accent="cyan" />
          <div className="summaryBuffViewToggle">
            <button
              className={`summaryBuffViewBtn${buffView === 'coverage' ? ' active' : ''}`}
              onClick={() => setBuffView('coverage')}
            >Coverage</button>
            <button
              className={`summaryBuffViewBtn${buffView === 'uptime' ? ' active' : ''}`}
              onClick={() => setBuffView('uptime')}
            >Uptime</button>
          </div>
        </div>
        <div className="summarySectionHint">
          {buffView === 'coverage'
            ? '% of total team damage dealt while buff was active'
            : '% of total rotation time buff was active'}
        </div>
        {buffUptime.length === 0 ? (
          <div className="summaryRightEmpty">No limited-duration buffs detected</div>
        ) : (
          <div className="summaryBuffUptimeRows">
            {buffUptime.map(entry => {
              const ownerTheme = (entry.ownerCharacter ? charColorMap.get(entry.ownerCharacter) : null) ?? getElementColor(entry.ownerElement)
              const iconPath = `/assets/modifiers/${entry.displayName.toLowerCase().replace(/:/g, '').replace(/\s+/g, '_')}.png`
              return (
                <div
                  key={entry.key}
                  className="summaryBuffUptimeRow summaryBuffUptimeRow--hasTooltip"
                  onMouseEnter={(e) => setActiveTooltip({ entry, rect: e.currentTarget.getBoundingClientRect() })}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <div className="summaryBuffIconBox" style={{ borderColor: `color-mix(in srgb, ${ownerTheme.primary} 55%, transparent)` }}>
                    <img
                      src={iconPath}
                      alt=""
                      className="summaryBuffIconImg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const dot = e.currentTarget.nextElementSibling as HTMLElement
                        if (dot) dot.style.display = 'block'
                      }}
                    />
                    <div
                      className="summaryBuffOwnerDot"
                      style={{ background: ownerTheme.primary, display: 'none' }}
                    />
                  </div>
                  <span className="summaryBuffName">{entry.displayName}</span>
                  <div className="summaryBuffBar">
                    <div
                      className="summaryBuffBarFill"
                      style={{
                        width: `${Math.min(buffView === 'coverage' ? entry.coveragePct : entry.timeUptimePct, 100)}%`,
                        background: ownerTheme.primary,
                        boxShadow: `0 0 4px ${ownerTheme.glow}`,
                      }}
                    />
                  </div>
                  <span className="summaryBuffPct">
                    {buffView === 'coverage' ? entry.coveragePct.toFixed(0) : entry.timeUptimePct.toFixed(0)}%
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {tooltipPortal}
    </div>
  )
}

// ========== Main Component ==================================================================================================

type SummaryOverlayProps = {
  open: boolean
  onClose: () => void
  snapshots: Snapshot[]
  damageEvents: DamageEvent[]
  characters: Character[]
}

export default function SummaryOverlay({ open, onClose, snapshots, damageEvents, characters }: SummaryOverlayProps) {
  if (!open) return null

  const activeChars = characters.filter(c => snapshots.some(s => s.character === c.name && s.action))
  const charColorMap = buildCharacterColorMap(activeChars)

  const { characterSummaries, globalDamage, totalPassiveDamage, grandTotal, totalDuration } =
    computeSummaryData(activeChars, snapshots, damageEvents)

  const contributionEntries = computeContributionData(activeChars, damageEvents)
  const passiveDamageEvents = damageEvents.filter(e =>
    !activeChars.some(c => e.dealer === c.name || e.dealer.startsWith(c.name + ': '))
  )
  const buffUptime = computeBuffUptime(snapshots, damageEvents, activeChars, grandTotal)
  const contributionOrigin = computeContributionOrigin(activeChars, damageEvents)
  const energyFlow = computeEnergyFlow(activeChars, snapshots)
  const actionBreakdowns = computeActionBreakdowns(activeChars, damageEvents)
  const modifierInfoMap = buildModifierInfoMap(activeChars)

  const hasData = grandTotal > 0

  return createPortal(
    <div className="summaryOverlay" role="dialog" aria-modal="true">
      <div className="summaryPanel">
        {/* Header */}
        <div className="summaryHeader">
          <div className="summaryHeaderLeft">
            <h2 className="summaryTitle">ROTATION SUMMARY</h2>
            <div className="summarySubtitle">
              {hasData ? (
                <>
                  <span className="summaryStatChip accent">{activeChars.length} Resonators</span>
                  <span className="summaryStatChip accent">{formatTime(totalDuration)} Combat</span>
                  {totalDuration > 0 && (
                    <span className="summaryStatChip accent">{formatDamage(grandTotal / totalDuration)} dps</span>
                  )}
                  <span className="summaryStatChip accent">{formatDamage(grandTotal)} Total</span>
                </>
              ) : (
                <span className="summaryNoData">No data — build a rotation first</span>
              )}
            </div>
          </div>
          <button className="summaryClose" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        {!hasData ? (
          <div className="summaryEmptyOuter">
            <div className="summaryEmptyState">
              <div className="summaryEmptyIcon">◉</div>
              <div className="summaryEmptyText">Awaiting combat data</div>
              <div className="summaryEmptyHint">Add actions to the rotation to generate a field report</div>
            </div>
          </div>
        ) : (
          <div className="summaryColumns">
            <LeftPanel
              characterSummaries={characterSummaries}
              charColorMap={charColorMap}
              energyFlow={energyFlow}
            />
            <div className="summaryColDivider" />
            <CenterPanel
              characterSummaries={characterSummaries}
              globalDamage={globalDamage}
              totalPassiveDamage={totalPassiveDamage}
              grandTotal={grandTotal}
              totalDuration={totalDuration}
              contributionEntries={contributionEntries}
              contributionOrigin={contributionOrigin}
              actionBreakdowns={actionBreakdowns}
              passiveDamageEvents={passiveDamageEvents}
              charColorMap={charColorMap}
            />
            <div className="summaryColDivider" />
            <RightPanel
              buffUptime={buffUptime}
              modifierInfoMap={modifierInfoMap}
              charColorMap={charColorMap}
            />
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}


