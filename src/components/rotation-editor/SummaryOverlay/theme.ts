// Summary overlay colour themes: element colours, per-character colour variants and damage-type palettes
import { negativeStatuses } from '../../../data/negativeStatuses'
import type { Character } from '../../../types/character'
import { buildTeamAccents } from '../../shared/elementColors'

/** `raw` is the bare HSL triplet, for `--ui-accent-raw`. */
export type CharColor = { primary: string; glow: string; bg: string; label: string; raw: string }

// ========== Element Themes ==================================================================================================

const ELEMENT_COLORS: Record<string, CharColor> = {
  AERO:     { primary: 'hsl(160 80% 55%)',  glow: 'hsl(160 80% 55% / 0.35)', bg: 'hsl(160 40% 8%)',  label: 'Aero', raw: '160 80% 55%'    },
  SPECTRO:  { primary: 'hsl(45 90% 62%)',   glow: 'hsl(45 90% 62% / 0.35)',  bg: 'hsl(45 50% 8%)',   label: 'Spectro', raw: '45 90% 62%' },
  HAVOC:    { primary: 'hsl(270 80% 65%)',  glow: 'hsl(270 80% 65% / 0.35)', bg: 'hsl(270 40% 8%)',  label: 'Havoc', raw: '270 80% 65%'   },
  ELECTRO:  { primary: 'hsl(292 82% 70%)',  glow: 'hsl(292 82% 70% / 0.35)', bg: 'hsl(292 50% 8%)',  label: 'Electro', raw: '292 82% 70%' },
  GLACIO:   { primary: 'hsl(200 80% 67%)',  glow: 'hsl(200 80% 67% / 0.35)', bg: 'hsl(200 50% 8%)',  label: 'Glacio', raw: '200 80% 67%'  },
  FUSION:   { primary: 'hsl(15 90% 62%)',   glow: 'hsl(15 90% 62% / 0.35)',  bg: 'hsl(15 50% 8%)',   label: 'Fusion', raw: '15 90% 62%'  },
  '':       { primary: 'hsl(220 15% 60%)',  glow: 'hsl(220 15% 60% / 0.3)',  bg: 'hsl(220 15% 8%)',  label: '—', raw: '220 15% 60%'       },
}

export function getElementColor(element: string) {
  return ELEMENT_COLORS[element] ?? ELEMENT_COLORS['']
}

/**
 * Per-character colour map built from the shared team accents, so a character has the same colour here as in
 * the table, tracker and row detail (same-element teammates get distinct variants).
 */
export function buildCharacterColorMap(characters: Character[]): Map<string, CharColor> {
  const map = new Map<string, CharColor>()
  for (const [name, raw] of buildTeamAccents(characters)) {
    const element = characters.find(c => c.name === name)?.element ?? ''
    const hue = raw.split(' ')[0]
    map.set(name, { primary: `hsl(${raw})`, glow: `hsl(${raw} / 0.35)`, bg: `hsl(${hue} 40% 8%)`, label: ELEMENT_COLORS[element]?.label ?? '—', raw })
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
