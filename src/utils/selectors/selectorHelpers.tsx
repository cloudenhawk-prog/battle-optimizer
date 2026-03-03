import type { EnergyType } from '../../types/baseTypes'
import type { Action } from '../../types/action'
import type { Character } from '../../types/character'
import type { Snapshot } from '../../types/snapshot'

// ========== Build Action Options =============================================================================================

export function buildActionOptions(actions: Action[], currentAction: string, character?: Character, currentEnergies?: Partial<Record<EnergyType, number>>, snapshot?: Snapshot) {
  return actions.map(a => {
    const isSpecial = a.name === 'Intro' || a.name === 'Outro'
    const isCurrent = a.name === currentAction

    let isUnaffordable = false
    let isOnCooldown = false

    if (character && currentEnergies) {
      for (const cost of a.energyCost) {
        const { energyType, amount } = cost
        if ((currentEnergies[energyType] ?? 0) < amount) {
          isUnaffordable = true
          break
        }
      }
    }

    // Check if action is on cooldown
    if (character && snapshot && snapshot.charactersCooldowns) {
      const characterCooldowns = snapshot.charactersCooldowns[character.name] ?? {}
      const cooldownRemaining = characterCooldowns[a.name] ?? 0
      if (cooldownRemaining > 0) {
        isOnCooldown = true
      }
    }

    if (isSpecial && !isCurrent) {
      return (
        <option key={a.name} value={a.name} hidden disabled>
          {a.name}
        </option>
      )
    }

    if ((isUnaffordable || isOnCooldown) && !isCurrent) {
      return (
        <option key={a.name} value={a.name} disabled>
          {a.name}
        </option>
      )
    }

    return (
      <option key={a.name} value={a.name}>
        {a.name}
      </option>
    )
  })
}
