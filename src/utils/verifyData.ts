import { characters } from '../data/characters'
import { negativeStatuses } from '../data/negativeStatuses'
import type { Character } from '../types/character'

// ========== Data Verification ================================================================================================
// Blueprint files are intentionally excluded — they are not registered in the characters array.

type CharacterCheckResult = {
  name: string
  checks: { label: string; ok: boolean; error?: string }[]
}

export function verifyData(): void {
  const negativeStatusNames = new Set(Object.values(negativeStatuses).map(ns => ns.name))
  const results: CharacterCheckResult[] = characters.map(c => verifyCharacter(c, negativeStatusNames))

  const allErrors = results.flatMap(r => r.checks.filter(c => !c.ok))
  const totalChecks = results.reduce((sum, r) => sum + r.checks.length, 0)

  const summary = allErrors.length > 0
    ? `%c[Data Check] ✓ ${totalChecks - allErrors.length} passed  %c✗ ${allErrors.length} failed`
    : `%c[Data Check] ✓ ${totalChecks} / ${totalChecks} passed`

  console.groupCollapsed(
    summary,
    'color: #4caf50',
    ...(allErrors.length > 0 ? ['color: #f44336'] : []),
  )

  for (const result of results) {
    const charErrors = result.checks.filter(c => !c.ok)
    const charColor = charErrors.length > 0 ? '#f44336' : '#4caf50'
    const charSummary = charErrors.length > 0
      ? `%c✗ ${result.name} (${charErrors.length} error${charErrors.length > 1 ? 's' : ''})`
      : `%c✓ ${result.name} (${result.checks.length} checks)`

    console.groupCollapsed(charSummary, `color: ${charColor}`)
    for (const check of result.checks) {
      if (check.ok) {
        console.log(`%c  ✓ ${check.label}`, 'color: #4caf50')
      } else {
        console.error(`%c  ✗ ${check.label}: ${check.error}`, 'color: #f44336')
      }
    }
    console.groupEnd()
  }

  console.groupEnd()

  if (allErrors.length > 0) {
    throw new Error(`[Data] ${allErrors.length} data check(s) failed — see console for details`)
  }
}

function verifyCharacter(character: Character, negativeStatusNames: Set<string>): CharacterCheckResult {
  const { name, actions, maxEnergies, stats } = character
  const checks: CharacterCheckResult['checks'] = []

  const check = (label: string, fn: () => void) => {
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

  // --- Required action types (convention: names contain "Intro" / "Outro" / "Echo Skill") ---
  check('Required actions (Intro / Outro / Echo Skill)', () => {
    const missing: string[] = []
    if (!actions.some(a => a.name.includes('Intro'))) missing.push('Intro')
    if (!actions.some(a => a.name.includes('Outro'))) missing.push('Outro')
    if (!actions.some(a => a.name.includes('Echo Skill'))) missing.push('Echo Skill')
    if (missing.length) throw new Error(`missing: ${missing.join(', ')}`)
  })

  // --- One check per action covering all logical validations (including coordinated attacks) ---
  for (const action of actions) {
    check(`Action: ${action.name}`, () => {
      const errors: string[] = []
      if (action.castTime < 0) errors.push(`castTime ${action.castTime}`)
      if (action.multiplier < 0) errors.push(`multiplier ${action.multiplier}`)
      if (action.cooldown < 0) errors.push(`cooldown ${action.cooldown}`)
      if (action.offtune < 0) errors.push(`offtune ${action.offtune}`)
      for (const eg of action.energyGenerated)
        if (eg.amount < 0) errors.push(`energyGenerated "${eg.energyType}" ${eg.amount}`)
      for (const ec of action.energyCost)
        if (ec.amount < 0) errors.push(`energyCost "${ec.energyType}" ${ec.amount}`)
      for (const mod of action.statusModifications)
        if (mod.type === 'negativeStatus' && !negativeStatusNames.has(mod.targetName))
          errors.push(`unknown negative status "${mod.targetName}"`)
      for (const ca of action.coordinatedAttacks ?? []) {
        if (ca.multiplier < 0) errors.push(`[CA "${ca.name}"] multiplier ${ca.multiplier}`)
        if (ca.frequency <= 0) errors.push(`[CA "${ca.name}"] frequency ${ca.frequency}`)
        if (ca.duration <= 0) errors.push(`[CA "${ca.name}"] duration ${ca.duration}`)
        for (const eg of ca.energyGenerated)
          if (eg.amount < 0) errors.push(`[CA "${ca.name}"] energyGenerated "${eg.energyType}" ${eg.amount}`)
        for (const mod of ca.statusModifications)
          if (mod.type === 'negativeStatus' && !negativeStatusNames.has(mod.targetName))
            errors.push(`[CA "${ca.name}"] unknown negative status "${mod.targetName}"`)
      }
      // variantName drives the intent; requiresSwapOut is the runtime flag.
      // Cross-validating both catches: (a) forgetting requiresSwapOut on a swap variant,
      // and (b) setting swapOutState/persistenceTime without the runtime flag being set.
      const isSwapCancelByName = action.variantName?.startsWith('Cancel With Swap') ?? false
      const isSwapCancelByFlag = action.castConditions.requiresSwapOut === true
      // variantName declares swap-cancel intent → requiresSwapOut must be set
      if (isSwapCancelByName && !isSwapCancelByFlag)
        errors.push('Cancel With Swap variant missing castConditions.requiresSwapOut: true')
      // requiresSwapOut set → must also declare swapOutState and persistenceTime
      if (isSwapCancelByFlag) {
        const cc = action.castConditions
        if (cc.persistenceTime == null) errors.push('swap-cancel action missing castConditions.persistenceTime')
        if (cc.swapOutState == null) errors.push('swap-cancel action missing castConditions.swapOutState')
      }
      // Neither flag nor name → must NOT define persistenceTime or swapOutState
      if (!isSwapCancelByFlag && !isSwapCancelByName) {
        const cc = action.castConditions
        if (cc.persistenceTime != null) errors.push('non-swap-cancel action must not define castConditions.persistenceTime')
        if (cc.swapOutState != null) errors.push('non-swap-cancel action must not define castConditions.swapOutState')
      }
      // castConditions state constraints
      const cc = action.castConditions
      if (cc.startState === 'PRESERVE') errors.push('castConditions.startState must not be "PRESERVE"')
      if (cc.endState === 'ANY') errors.push('castConditions.endState must not be "ANY"')
      if (cc.swapOutState === 'ANY') errors.push('castConditions.swapOutState must not be "ANY"')
      if (cc.persistenceTime != null && cc.persistenceTime < action.castTime)
        errors.push(`castConditions.persistenceTime (${cc.persistenceTime}) must be >= castTime (${action.castTime})`)
      if (cc.previousActions != null && cc.previousActions.length === 0)
        errors.push('castConditions.previousActions must not be an empty array')
      if (errors.length) throw new Error(errors.join('; '))
    })
  }

  // --- maxEnergies ---
  check('Max energies (required: energy / concerto / forte; all values non-null and non-negative)', () => {
    const errors: string[] = []
    for (const key of ['energy', 'concerto', 'forte'] as const)
      if (!(key in maxEnergies)) errors.push(`missing required key "${key}"`)
    for (const [key, value] of Object.entries(maxEnergies)) {
      if (value == null) errors.push(`"${key}" is null/undefined`)
      else if (value < 0) errors.push(`"${key}" is ${value}`)
    }
    if (errors.length) throw new Error(errors.join('; '))
  })

  // --- Stats ---
  check('Stats (non-null, baseATK/HP/DEF > 0, no negatives)', () => {
    if (!stats) throw new Error('null or undefined')
    const errors: string[] = []
    for (const key of ['baseATK', 'baseHP', 'baseDEF'] as const)
      if (stats[key] <= 0) errors.push(`${key} must be > 0 (got ${stats[key]})`)
    for (const [key, value] of Object.entries(stats))
      if (typeof value === 'number' && value < 0) errors.push(`${key} is ${value}`)
    if (errors.length) throw new Error(errors.join('; '))
  })

  return { name, checks }
}

// ========== Asset Checking ===================================================================================================
// Collects every asset path that data files and table builders will reference at runtime,
// then sends a HEAD request for each. Missing or broken paths are logged as warnings.
// This never throws — it is purely informational.

export async function checkAssets(): Promise<void> {
  const paths = collectAssetPaths()

  const results = await Promise.all(
    paths.map(async path => {
      const url = new URL(path, window.location.href).href
      try {
        const res = await fetch(url, { method: 'HEAD' })
        const contentType = res.headers.get('content-type') ?? ''
        return { path: url, ok: res.ok && !contentType.startsWith('text/html') }
      } catch {
        return { path: url, ok: false }
      }
    }),
  )

  const found = results.filter(r => r.ok)
  const missing = results.filter(r => !r.ok)

  if (missing.length > 0) {
    console.groupCollapsed(`%c[Asset Check] ✓ ${found.length} resolved  %c✗ ${missing.length} missing`, 'color: #4caf50', 'color: #f44336')
  } else {
    console.groupCollapsed(`%c[Asset Check] ✓ ${results.length} / ${results.length} resolved`, 'color: #4caf50')
  }

  for (const r of found) console.log(`%c✓ ${r.path}`, 'color: #4caf50')
  for (const r of missing) console.log(`%c✗ ${r.path}`, 'color: #f44336')

  console.groupEnd()
}

function collectAssetPaths(): string[] {
  const paths = new Set<string>()

  // Fixed icons used directly by table builder files (buildBasicColumns, buildOtherColumns, etc.)
  // and rotation-editor components (HeaderRow).
  const fixedAssets = [
    'assets/basic.png',
    'assets/fromTime.png',
    'assets/toTime.png',
    'assets/damage.png',
    'assets/dps.png',
    'assets/other.png',
    'assets/negativeStatuses.png',
    'assets/buffs.png',
    'assets/debuffs.png',
    'assets/statuses.png',        // buildStatusEffectsColumns — Status Effects group icon
    'assets/coordinated_attack.png',
    'assets/action.png',          // HeaderRow
    'assets/character.png',       // HeaderRow
    'assets/selector.png',        // HeaderRow
  ]
  for (const p of fixedAssets) paths.add(p)

  for (const character of characters) {
    // Character portrait and nametag (buildCharacterGroupedColumns)
    paths.add(`/assets/character_${character.name.toLowerCase()}.png`)
    paths.add(`/assets/nametag_${character.name.toLowerCase()}.png`)

    // Energy type icons (buildCharacterGroupedColumns)
    for (const key of Object.keys(character.maxEnergies)) {
      paths.add(`/assets/${key}.png`)
    }

    // Character-level damage modifier icons (buildStatusEffectsColumns / buildBuffColumns)
    for (const mod of character.damageModifiers) {
      paths.add(`/assets/${mod.displayName.toLowerCase().replace(/\s+/g, '_')}.png`)
    }

    for (const action of character.actions) {
      // Action-level damage modifier icons
      for (const mod of action.damageModifiers) {
        paths.add(`/assets/${mod.displayName.toLowerCase().replace(/\s+/g, '_')}.png`)
      }

      // Buff/debuff statusModification target icons (buildStatusEffectsColumns)
      for (const mod of action.statusModifications) {
        if (mod.type === 'buff' || mod.type === 'debuff') {
          paths.add(`/assets/${mod.targetName.toLowerCase().replace(/\s+/g, '_')}.png`)
        }
      }

      // Coordinated attack icons (buildCoordinatedAttackColumns)
      for (const ca of action.coordinatedAttacks ?? []) {
        paths.add(ca.icon ?? `/assets/${ca.name.toLowerCase().replace(/\s+/g, '_')}.png`)
      }
    }
  }

  // Negative status icons and their modifier icons (buildStatusEffectsColumns)
  for (const ns of Object.values(negativeStatuses)) {
    paths.add(`/assets/${ns.name.toLowerCase().replace(/\s+/g, '_')}.png`)
    for (const mod of ns.damageModifiers ?? []) {
      paths.add(`/assets/${mod.displayName.toLowerCase().replace(/\s+/g, '_')}.png`)
    }
  }

  return Array.from(paths)
}
