import type { ResolvedCharacter } from '../../types/character'
import type { Snapshot } from '../../types/snapshot'
import { getAvailableActions } from '../engine/choices'

// ========== Type: Choice =====================================================================================================

export type Choice = {
  character: string
  actionName: string
}

// ========== Get MCTS Choices =================================================================================================

/**
 * Returns all legal (character, action) choices for the current simulation state.
 *
 * Must-chain priority: if ANY character has a must:true follow-up lock,
 * only that one choice is returned — all other characters are blocked until
 * the chain resolves.
 *
 * INTRO and OUTRO are excluded (auto-triggered by the engine on swap).
 * Optional must:false follow-ups surface as regular choices alongside all others.
 */
export function getMCTSChoices(snapshot: Snapshot, team: ResolvedCharacter[]): Choice[] {
  // Global must-chain lock: any must:true follow-up locks out all other choices
  for (const character of team) {
    const followUp = snapshot.charactersAttemptFollowUp?.[character.name]
    if (followUp?.must) {
      return [{ character: character.name, actionName: followUp.actionName }]
    }
  }

  const choices: Choice[] = []
  for (const character of team) {
    const actions = getAvailableActions(snapshot, character)
    for (const action of actions) {
      choices.push({ character: character.name, actionName: action.name })
    }
  }
  return choices
}
