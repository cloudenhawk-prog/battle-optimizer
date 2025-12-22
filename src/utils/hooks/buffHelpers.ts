import type { BuffInAction } from "../../types/buff"
import type { Character } from "../../types/character"

// ========== Buff Helpers =====================================================================================================

export function collectAllBuffsInAction(charactersMap: Record<string, Character>): BuffInAction[] {
  return Object.values(charactersMap).flatMap(character =>
    character.actions.flatMap(action =>
      action.buffsApplied.map(buff => ({
        buff,
        applicationTime: -1,
        timeleft: 0
      }))
    )
  )
}
