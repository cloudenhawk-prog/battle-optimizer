// Per-character data checks (action names, intro/outro, every action, max energies, stats), run in a fixed order.
import type { Character } from '../../../types/character'
import { collectActionErrors } from './actionChecks'

export type CharacterCheckResult = {
  name: string
  checks: { label: string; ok: boolean; error?: string }[]
}

/** A check passes unless it throws; the thrown message becomes the reported error. */
type Check = (label: string, fn: () => void) => void

export function verifyCharacter(character: Character, negativeStatusNames: Set<string>): CharacterCheckResult {
  const { name, actions } = character
  const checks: CharacterCheckResult['checks'] = []

  const check: Check = (label, fn) => {
    try {
      fn()
      checks.push({ label, ok: true })
    } catch (e) {
      checks.push({ label, ok: false, error: (e as Error).message })
    }
  }

  // --- Action name uniqueness ---
  check('Action names unique', () => {
    const seenNames = new Set<string>()
    for (const action of actions) {
      if (seenNames.has(action.name)) throw new Error(`duplicate "${action.name}"`)
      seenNames.add(action.name)
    }
  })

  // --- Echo Skill presence (warning only, not a hard error) ---
  if (!actions.some(a => (a.dmgTypes as string[]).includes('ECHO'))) {
    console.warn(`[Data] ${name}: no Echo Skill action found (dmgTypes includes 'ECHO')`)
  }

  checkIntroOutro(character, check)

  // --- One check per action covering all logical validations (including coordinated attacks) ---
  for (const action of actions) {
    check(`Action: ${action.name}`, () => {
      const errors = collectActionErrors(action, negativeStatusNames)
      if (errors.length) throw new Error(errors.join('; '))
    })
  }

  checkMaxEnergies(character, check)
  checkStats(character, check)

  return { name, checks }
}

// ========== Intro / Outro ====================================================================================================

/** Base form must have exactly one Intro and one Outro; without forms, the action list must. */
function checkIntroOutro(character: Character, check: Check): void {
  const { actions, forms, defaultForm } = character

  if (forms && forms.length > 0) {
    const baseFormName = defaultForm ?? forms[0].name
    const baseForm = forms.find(f => f.name === baseFormName)
    check(`Base form "${baseFormName}": exactly 1 Intro and 1 Outro (correct tags, present in character.actions)`, () => {
      const errors: string[] = []
      if (!baseForm) {
        errors.push(`form "${baseFormName}" not found in forms array`)
      } else {
        const actionNames = new Set(actions.map(a => a.name))
        const intro = baseForm.introAction
        const outro = baseForm.outroAction

        if (!intro) {
          errors.push('missing introAction')
        } else {
          if (!intro.tags?.includes('INTRO_ACTION')) errors.push(`introAction "${intro.name}" missing tag INTRO_ACTION (got [${(intro.tags ?? []).join(', ')}])`)
          if (!actionNames.has(intro.name)) errors.push(`introAction "${intro.name}" not found in character.actions`)
        }

        if (!outro) {
          errors.push('missing outroAction')
        } else {
          if (!outro.tags?.includes('OUTRO_ACTION')) errors.push(`outroAction "${outro.name}" missing tag OUTRO_ACTION (got [${(outro.tags ?? []).join(', ')}])`)
          if (!actionNames.has(outro.name)) errors.push(`outroAction "${outro.name}" not found in character.actions`)
        }

        if (intro && outro && intro.name === outro.name) errors.push(`introAction and outroAction must be distinct (both are "${intro.name}")`)
      }
      if (errors.length) throw new Error(errors.join('; '))
    })
  } else {
    // No forms — check character.actions for exactly 1 INTRO_ACTION and 1 OUTRO_ACTION by tag.
    check('Required actions (Intro / Outro)', () => {
      const errors: string[] = []
      const introCount = actions.filter(a => a.tags?.includes('INTRO_ACTION')).length
      const outroCount = actions.filter(a => a.tags?.includes('OUTRO_ACTION')).length
      if (introCount !== 1) errors.push(`expected exactly 1 action with tag INTRO_ACTION, found ${introCount}`)
      if (outroCount !== 1) errors.push(`expected exactly 1 action with tag OUTRO_ACTION, found ${outroCount}`)
      if (errors.length) throw new Error(errors.join('; '))
    })
  }
}

// ========== Energies / Stats =================================================================================================

function checkMaxEnergies(character: Character, check: Check): void {
  const { maxEnergies } = character
  check('Max energies (required: energy / concerto / at least one custom gauge; all values non-null and non-negative)', () => {
    const errors: string[] = []
    for (const key of ['energy', 'concerto'] as const) if (!(key in maxEnergies)) errors.push(`missing required key "${key}"`)
    const hasForteLike = Object.keys(maxEnergies).some(k => k !== 'energy' && k !== 'concerto')
    if (!hasForteLike) errors.push('missing forte energy (requires at least one energy type besides "energy" and "concerto")')
    for (const [key, value] of Object.entries(maxEnergies)) {
      if (value == null) errors.push(`"${key}" is null/undefined`)
      else if (value < 0) errors.push(`"${key}" is ${value}`)
    }
    if (errors.length) throw new Error(errors.join('; '))
  })
}

function checkStats(character: Character, check: Check): void {
  const { stats } = character
  check('Stats (non-null, baseATK/HP/DEF > 0, no negatives)', () => {
    if (!stats) throw new Error('null or undefined')
    const errors: string[] = []
    for (const key of ['baseATK', 'baseHP', 'baseDEF'] as const) if (stats[key] <= 0) errors.push(`${key} must be > 0 (got ${stats[key]})`)
    for (const [key, value] of Object.entries(stats)) if (typeof value === 'number' && value < 0) errors.push(`${key} is ${value}`)
    if (errors.length) throw new Error(errors.join('; '))
  })
}
