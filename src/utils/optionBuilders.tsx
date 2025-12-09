
import type { Action, Character } from "../types/character"

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

    let isUnaffordable = false
    if (character && currentEnergies) {
      for (const [energyType, energyChange] of Object.entries(a.energyGenerated)) {
        if (energyChange < 0 && (currentEnergies[energyType] ?? 0) < Math.abs(energyChange)) {
          isUnaffordable = true
          break
        }
      }
    }

    if (isSpecial && !isCurrent) {
      return (
        <option key={a.name} value={a.name} hidden disabled>
          {a.name}
        </option>
      )
    }

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
