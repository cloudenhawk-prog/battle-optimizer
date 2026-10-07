// Summary overlay colour themes: element colours, per-character colour variants and damage-type palettes
import { negativeStatuses } from '../../../data/negativeStatuses'
import type { Character } from '../../../types/character'

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

export function getElementColor(element: string) {
  return ELEMENT_COLORS[element] ?? ELEMENT_COLORS['']
}

export type CharColor = { primary: string; glow: string; bg: string; label: string }

// Same hues as ELEMENT_COLORS, as numbers so per-character variants can shift saturation/lightness
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
export function buildCharacterColorMap(characters: Character[]): Map<string, CharColor> {
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
      // 4th+ character of the same element wraps around the variant list
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

// ========== Damage Type Themes ==============================================================================================

export const DMG_TYPE_LABELS: Record<string, string> = {
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

export function getDmgTypeTheme(type: string) {
  return DMG_TYPE_THEMES[type] ?? DMG_TYPE_THEMES['']
}

/** Maps element → the name of the negative status associated with that element. */
export const ELEMENT_TO_NEGATIVE_STATUS_LABEL: Record<string, string> = Object.fromEntries(
  Object.values(negativeStatuses).map(s => [s.element, s.name])
)
