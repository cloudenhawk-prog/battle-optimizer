// R10 resolveCooldowns: ticks every cooldown, regenerates/consumes action charges, sets this action's cooldown.
import type { StepContext } from '../../types/stepContext'
import { updateAllCharactersCooldowns, setActionOnCooldown, reduceCooldown, getActionCooldownKey } from '../state/cooldownHelpers'

// ========== Resolver 10: Cooldowns ==========================================================================================

// Charges model: charactersActionStacksConfig[char][key] = { max, cooldown }; charactersActionStacks[char][key] = current
// count, where an ABSENT entry means "at max". The shared cooldown timer under the same key is the recharge timer.
export function resolveCooldowns(ctx: StepContext): void {
  const current = ctx.current
  const character = ctx.character
  const action = ctx.action
  const allies = ctx.allies
  const elapsedTime = ctx.toTime - ctx.fromTime

  // Update all characters' cooldowns for the elapsed time
  const allCharacters = [character, ...allies]
  current.charactersCooldowns = updateAllCharactersCooldowns(ctx.prev, allCharacters, elapsedTime)

  // Carry forward stacks data from previous snapshot
  current.charactersActionStacksConfig = {}
  current.charactersActionStacks = {}
  for (const char of allCharacters) {
    const prevConfig = ctx.prev.charactersActionStacksConfig?.[char.name]
    if (prevConfig) {
      current.charactersActionStacksConfig[char.name] = { ...prevConfig }
    }
    const prevStacks = ctx.prev.charactersActionStacks?.[char.name]
    if (prevStacks) {
      current.charactersActionStacks[char.name] = { ...prevStacks }
    }
  }

  // Regenerate stacks for any stacked actions whose timers expired this step
  for (const char of allCharacters) {
    const config = current.charactersActionStacksConfig?.[char.name]
    if (!config) continue
    for (const [key, stackConfig] of Object.entries(config)) {
      const wasOnCooldown = (ctx.prev.charactersCooldowns?.[char.name]?.[key] ?? 0) > 0
      const isNowOnCooldown = (current.charactersCooldowns[char.name]?.[key] ?? 0) > 0
      if (!wasOnCooldown || isNowOnCooldown) continue // Didn't expire this step

      const prevStackCount = ctx.prev.charactersActionStacks?.[char.name]?.[key] ?? stackConfig.max
      const newStackCount = Math.min(stackConfig.max, prevStackCount + 1)

      if (newStackCount >= stackConfig.max) {
        // Reached max stacks: stop the timer, remove tracking entry (absent = max)
        if (current.charactersActionStacks[char.name]) {
          delete current.charactersActionStacks[char.name][key]
        }
      } else {
        // Still below max: restart the timer and store the incremented count
        current.charactersCooldowns[char.name] ??= {}
        current.charactersCooldowns[char.name][key] = stackConfig.cooldown
        current.charactersActionStacks[char.name] ??= {}
        current.charactersActionStacks[char.name][key] = newStackCount
      }
    }
  }

  // If the cast action uses stacks: store its config and consume one stack
  if (action.maxStacks && action.maxStacks > 1) {
    const cooldownKey = getActionCooldownKey(action)
    const charName = character.name

    current.charactersActionStacksConfig[charName] ??= {}
    current.charactersActionStacksConfig[charName][cooldownKey] = {
      max: action.maxStacks,
      cooldown: action.cooldown,
    }

    // Read stacks from post-regeneration state (current may have been updated above)
    const stacksAfterRegen = current.charactersActionStacks?.[charName]?.[cooldownKey]
      ?? ctx.prev.charactersActionStacks?.[charName]?.[cooldownKey]
      ?? action.maxStacks // absent entry = at max stacks
    const newStackCount = Math.max(0, stacksAfterRegen - 1)

    current.charactersActionStacks[charName] ??= {}
    current.charactersActionStacks[charName][cooldownKey] = newStackCount
  }

  // Set the used action on cooldown
  current.charactersCooldowns[character.name] = setActionOnCooldown(current, character.name, action)

  // Apply cooldown reductions granted by this action
  if (action.cooldownReductions) {
    for (const reduction of action.cooldownReductions) {
      const amount = typeof reduction.amount === 'function' ? reduction.amount(ctx) : reduction.amount
      if (amount > 0) {
        current.charactersCooldowns[character.name] = reduceCooldown(current, character.name, reduction.targetActionKey, amount)
      }
    }
  }

  // Apply energy cooldowns queued by resolveResources (must run after updateAllCharactersCooldowns
  // so these entries are not overwritten by the rebuild from prev)
  for (const pending of ctx.pendingEnergyCooldowns) {
    current.charactersCooldowns[pending.charName] ??= {}
    current.charactersCooldowns[pending.charName][pending.cooldownKey] = pending.cooldownDuration
  }

  ctx.logs.push({
    resolver: 'resolveCooldowns',
    message: `Cooldowns updated: ${action.name} set on ${action.cooldown}s cooldown`,
    details: {
      elapsedTime,
      actionCooldown: action.cooldown,
      characterCooldowns: current.charactersCooldowns[character.name],
    },
  })
}
