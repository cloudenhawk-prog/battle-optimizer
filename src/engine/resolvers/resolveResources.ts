// R6 resolveResources: pays energy costs, adds generated energy (self + ally share), drains concerto on Outro.
import type { StepContext } from '../../types/stepContext'
import { getCharacterEnergyState, updateEnergyValue } from '../state/energyHelpers'

// ========== Resolver 6: Resources ===========================================================================================

// NOTE: energies are mutated in place on ctx.current.charactersEnergies[name] (the row's own per-character object).
export function resolveResources(ctx: StepContext): void {
  const current = ctx.current
  const character = ctx.character
  const action = ctx.action
  const allies = ctx.allies

  const energiesCurr = getCharacterEnergyState(current, current.character!)
  const maxEnergies = character.maxEnergies

  // Subtract Energy Cost
  for (const cost of action.energyCost) {
    const key = cost.energyType
    const maxValue = maxEnergies?.[key] ?? Infinity
    const prevValue = energiesCurr![key] ?? 0

    energiesCurr![key] = updateEnergyValue(prevValue, -cost.amount, maxValue)

    // If this cost specifies grants and the energy was non-zero, add them to forteGrants
    if (cost.grantsOnConsume && cost.grantsOnConsume.length > 0 && prevValue > 0) {
      const charName = character.name
      if (!current.charactersForteGrants) current.charactersForteGrants = {}
      const existing = current.charactersForteGrants[charName] ?? []
      const newGrants = cost.grantsOnConsume.filter(g => !existing.includes(g))
      if (newGrants.length > 0) {
        current.charactersForteGrants[charName] = [...existing, ...newGrants]
      }
    }
  }

  // Update Character Energy
  for (const generated of action.energyGenerated) {
    // Skip entries that are gated behind a cooldown that hasn't expired yet
    if (generated.cooldownKey) {
      const charName = character.name
      const cooldownRemaining = ctx.prev.charactersCooldowns?.[charName]?.[generated.cooldownKey] ?? 0
      if (cooldownRemaining > 0) continue
      ctx.pendingEnergyCooldowns.push({ charName, cooldownKey: generated.cooldownKey, cooldownDuration: generated.cooldownDuration! })
    }

    const key = generated.energyType
    const maxValue = maxEnergies?.[key] ?? Infinity
    let amount = generated.amount

    if (amount > 0 && generated.scalingStat) {
      const scaling = character.stats?.[generated.scalingStat] ?? 1
      amount *= scaling
    }

    const prevValue = energiesCurr![key] ?? 0
    energiesCurr![key] = updateEnergyValue(prevValue, amount, maxValue)
  }

  // Update Allies Energy
  for (const ally of allies) {
    const allyEnergies = getCharacterEnergyState(current, ally.name)
    const allyMax = ally.maxEnergies

    for (const generated of action.energyGenerated) {
      if (generated.share <= 0) continue
      if (!(generated.energyType in allyMax)) continue

      let allyAmount = generated.amount * generated.share
      if (allyAmount > 0 && generated.scalingStat) {
        const scaling = ally.stats?.[generated.scalingStat] ?? 1
        allyAmount *= scaling
      }

      const prevValue = allyEnergies![generated.energyType] ?? 0
      const maxValue = allyMax[generated.energyType] ?? Infinity
      allyEnergies![generated.energyType] = updateEnergyValue(prevValue, allyAmount, maxValue)
    }
  }

  // Drain concerto to 0 when any OUTRO action is cast (concerto is the universal trigger cost)
  if ((action.dmgTypes as string[]).includes('OUTRO') && energiesCurr?.concerto !== undefined) {
    energiesCurr.concerto = 0
  }
}
