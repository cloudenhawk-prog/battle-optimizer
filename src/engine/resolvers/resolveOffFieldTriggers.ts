// R8 resolveOffFieldTriggers: restores energy/charges once a character has been off-field for a declared duration.
import type { StepContext } from '../../types/stepContext'

// ========== Resolver 8: Off-Field Triggers ==================================================================================

/**
 * Fires once-per-off-field-stretch when a character's continuous off-field duration crosses
 * the threshold declared on `Character.offFieldTriggers`.
 *
 * Detection mirrors `resolveResourceMilestones`: the trigger fires exactly when
 *   prevOffFieldDuration < threshold ≤ currOffFieldDuration
 * so it fires at most once per continuous off-field stretch regardless of step length.
 *
 * Must run AFTER `resolveResources` (so energies are already written to `ctx.current`)
 * and BEFORE `resolveCastState` (which updates `charactersOffFieldSince` for the NEXT step).
 * The off-field-since timestamps used here come from `ctx.prev`.
 *
 * NOTE: resolveCooldowns runs after this resolver and rebuilds charactersActionStacks /
 * charactersCooldowns from `ctx.prev`, so the `chargesRestore` writes below are currently overwritten.
 *
 * `null` in `charactersOffFieldSince` means the character is currently on-field or was never
 * swapped out — NOT "went off-field at t=0". Use null as the sentinel, not 0.
 */
export function resolveOffFieldTriggers(ctx: StepContext): void {
  const allCharacters = [ctx.character, ...ctx.allies]

  for (const char of allCharacters) {
    if (!char.offFieldTriggers || char.offFieldTriggers.length === 0) continue

    const offFieldSinceRaw = ctx.prev.charactersOffFieldSince?.[char.name]
    // null  = explicitly on-field (resolveCastState writes null when a character swaps in)
    // absent + active character = always been on-field, never swapped out → skip
    // absent + ally = never came on-field → treat as off-field since t=0
    if (offFieldSinceRaw === null || (offFieldSinceRaw === undefined && char.name === ctx.character.name)) {
      continue
    }
    const offFieldSince = offFieldSinceRaw ?? 0

    const prevOffFieldDuration = ctx.fromTime - offFieldSince
    const currOffFieldDuration = ctx.toTime - offFieldSince

    for (const trigger of char.offFieldTriggers) {
      const threshold = trigger.minOffFieldDuration
      // Fire once: the first step whose window crosses the threshold
      if (prevOffFieldDuration >= threshold) {
        continue
      }
      if (currOffFieldDuration < threshold) {
        continue
      }

      if (trigger.condition && !trigger.condition(ctx.current, char.name, char)) {
        continue
      }

      const charEnergies = { ...(ctx.current.charactersEnergies?.[char.name] ?? {}) }
      const maxEnergies = char.maxEnergies

      const restoredParts: string[] = []
      for (const [energyType, amount] of Object.entries(trigger.energyRestore) as [keyof typeof trigger.energyRestore, number][]) {
        const maxValue = maxEnergies[energyType] ?? Infinity
        const prev = charEnergies[energyType] ?? 0
        const next = Math.min(prev + amount, maxValue)
        charEnergies[energyType] = next
        if (next > prev) {
          restoredParts.push(`${energyType} +${next - prev}`)
        }
      }

      ctx.current.charactersEnergies = {
        ...ctx.current.charactersEnergies,
        [char.name]: charEnergies,
      }

      // Restore a specific number of charges for specified action group names
      if (trigger.chargesRestore && trigger.chargesRestore.length > 0) {
        const charStacks = { ...(ctx.current.charactersActionStacks?.[char.name] ?? {}) }
        const charCooldowns = { ...(ctx.current.charactersCooldowns?.[char.name] ?? {}) }
        const stacksConfig = ctx.current.charactersActionStacksConfig?.[char.name] ?? {}
        for (const { groupName, amount } of trigger.chargesRestore) {
          const maxStacks = stacksConfig[groupName]?.max ?? Infinity
          // Absent entry means already at max; treat as maxStacks for the addition
          const current = charStacks[groupName] ?? maxStacks
          const restored = Math.min(current + amount, maxStacks)
          if (restored >= maxStacks) {
            // At max: absent entry is the canonical representation; also clear the timer
            delete charStacks[groupName]
            delete charCooldowns[groupName]
          } else {
            charStacks[groupName] = restored
          }
          restoredParts.push(`${groupName} charges +${restored - current}`)
        }
        ctx.current.charactersActionStacks = {
          ...ctx.current.charactersActionStacks,
          [char.name]: charStacks,
        }
        ctx.current.charactersCooldowns = {
          ...ctx.current.charactersCooldowns,
          [char.name]: charCooldowns,
        }
      }

      // Record the event so DataOverlay and other readers can surface it with a source label
      const description = trigger.description ?? `Off-field ≥${threshold}s: ${restoredParts.join(', ')}`
      if (!ctx.current.offFieldTriggerEvents) ctx.current.offFieldTriggerEvents = {}
      ctx.current.offFieldTriggerEvents[char.name] = [
        ...(ctx.current.offFieldTriggerEvents[char.name] ?? []),
        description,
      ]

      ctx.logs.push({
        resolver: 'resolveOffFieldTriggers',
        message: `[${char.name}] Off-field trigger fired: off-field for ${currOffFieldDuration.toFixed(2)}s >= ${threshold}s`,
        details: { description, energyRestore: trigger.energyRestore, offFieldSince, fromTime: ctx.fromTime, toTime: ctx.toTime, restoredParts },
      })
    }
  }
}
