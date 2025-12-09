
import type { Action, Character } from "../types/characters"

// TODO - would be nice if we toggle on/off an "insufficient energy" tooltip on the option (dont change its name though)
export function buildActionOptions(
  actions: Action[],
  currentAction: string,
  character?: Character,
  currentEnergies?: Record<string, number>
) {
  return actions.map((a) => {
    const isSpecial = a.name === "Intro" || a.name === "Outro"
    const isCurrent = a.name === currentAction

    // Check if action is unaffordable
    let isUnaffordable = false
    if (character && currentEnergies) {
      // Check each energy type in the action's energyGenerated
      for (const [energyType, energyChange] of Object.entries(a.energyGenerated)) {
        // If the energy change is negative (a cost) and we don't have enough current energy
        if (energyChange < 0 && (currentEnergies[energyType] ?? 0) < Math.abs(energyChange)) {
          isUnaffordable = true
          break
        }
      }
    }

    // Hide Intro/Outro unless they're current
    if (isSpecial && !isCurrent) {
      return (
        <option key={a.name} value={a.name} hidden disabled>
          {a.name}
        </option>
      )
    }

    // Disable unaffordable actions (but keep them visible and greyed out)
    if (isUnaffordable && !isCurrent) {
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
