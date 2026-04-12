import type { ResolvedCharacter } from '../../types/character'
import type { Snapshot } from '../../types/snapshot'
import { getAvailableActions } from '../engine/choices'
import { isSwapRequiredLocked } from '../hooks/snapshotHelpers'

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
 * 'Testing' category actions are always excluded — they are test helpers only.
 *
 * preventsSwapOut: if the last cast action has castConditions.preventsSwapOut = true,
 * only choices from the same character are returned. A swap is only valid when the
 * (swap cancel) variant of that action is used instead.
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
    // Skip characters that are swap-required-locked (just cast a requiresSwapOut action)
    if (isSwapRequiredLocked(snapshot, character.name)) continue

    const actions = getAvailableActions(snapshot, character)
    for (const action of actions) {
      if (action.category === 'Testing') continue

      // requiresSwapIn: only castable if this character was just swapped in or last used an Intro
      if (action.castConditions.requiresSwapIn) {
        const justSwappedIn = snapshot.character !== character.name
        const lastActionName = snapshot.charactersLastAction?.[character.name]
        const lastActionWasIntro =
          lastActionName !== undefined &&
          character.actions.some(a => a.name === lastActionName && a.tags?.includes('INTRO_ACTION'))
        if (!justSwappedIn && !lastActionWasIntro) continue
      }

      // requiresSwapOut: skip if no other character will be available after this action completes
      if (action.castConditions.requiresSwapOut) {
        const actionEndTime = snapshot.toTime + action.castTime
        const hasSwapTarget = team.some(other => {
          if (other.name === character.name) return false
          const cooldownUntil = snapshot.charactersSwapCooldownUntil?.[other.name] ?? 0
          return cooldownUntil <= actionEndTime
        })
        if (!hasSwapTarget) continue
      }

      choices.push({ character: character.name, actionName: action.name })
    }
  }

  // preventsSwapOut: if the last action blocks swapping, restrict to the same character
  if (snapshot.character && snapshot.action) {
    const lastChar = team.find(c => c.name === snapshot.character)
    if (lastChar) {
      const lastAction = lastChar.actions.find(a => a.name === snapshot.action)
      if (lastAction?.castConditions.preventsSwapOut) {
        const locked = choices.filter(c => c.character === snapshot.character)
        if (locked.length > 0) return locked
      }
    }
  }

  return choices
}
