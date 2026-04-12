import type { ResolvedCharacter } from '../../types/character'
import type { Snapshot } from '../../types/snapshot'
import { getAvailableActions } from '../engine/choices'
import { isSwapRequiredLocked } from '../hooks/snapshotHelpers'
import { validateMustChain } from '../conditions/mustChainValidator'
import { getActionCooldownKey } from '../hooks/cooldownHelpers'

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
 *
 * Must-chain validation (mirrors ActionSelect.tsx Goals 9):
 *   - Actions with attemptFollowUp.must = true are blocked when the follow-up is still on
 *     cooldown at the time the action would complete (isFollowUpNotReady), OR when the
 *     follow-up chain cannot be satisfied given current position/form/energy (isMustChainUnsatisfiable).
 *   This prevents scheduling actions that instantly produce an unresolvable must-lock.
 *
 * requiresSwapOut proactive +1s (mirrors ActionSelect.tsx Goal 7):
 *   When a character is swapping in, the character being replaced will receive a 1s swap cooldown
 *   that isn't in the snapshot yet. This is accounted for proactively.
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

      // requiresSwapOut: skip if no other character will be available after this action completes.
      // Use resolveVariant castTime so dynamic-wait actions are evaluated against their actual wait.
      // Mirrors ActionSelect.tsx Goal 7, including the proactive +1s swap cooldown for the
      // character being replaced when the current character is swapping in.
      if (action.castConditions.requiresSwapOut) {
        const resolvedCastTime = action.resolveVariant
          ? action.resolveVariant(snapshot, character.name, character).castTime
          : action.castTime
        const actionEndTime = snapshot.toTime + resolvedCastTime
        const prevOnFieldChar = snapshot.character
        const swappingIn = !!prevOnFieldChar && prevOnFieldChar !== character.name
        const hasSwapTarget = team.some(other => {
          if (other.name === character.name) return false
          let cooldownUntil = snapshot.charactersSwapCooldownUntil?.[other.name] ?? 0
          // Proactively account for the 1s swap cooldown that will be applied to the
          // just-departed character during resolution (not yet written to the snapshot).
          if (swappingIn && other.name === prevOnFieldChar) {
            cooldownUntil = Math.max(cooldownUntil, snapshot.toTime + 1)
          }
          return cooldownUntil <= actionEndTime
        })
        if (!hasSwapTarget) continue
      }

      // Must-chain validation: mirrors ActionSelect.tsx Goal 9.
      // If this action sets a must:true follow-up, it is blocked when:
      //   (a) the follow-up is still on cooldown at the time this action completes, OR
      //   (b) the follow-up chain cannot be satisfied (position/form/energy simulation).
      if (action.attemptFollowUp?.must) {
        const followUpName = action.attemptFollowUp.actionName
        const followUpAction = character.actions.find(
          a => a.name === followUpName || a.groupName === followUpName,
        )
        if (!followUpAction) continue

        // (a) Cooldown check: follow-up must be off cooldown when this action ends
        const resolvedCastTime = action.resolveVariant
          ? action.resolveVariant(snapshot, character.name, character).castTime
          : action.castTime
        const cooldownKey = getActionCooldownKey(followUpAction)
        const followUpCooldownRemaining = snapshot.charactersCooldowns?.[character.name]?.[cooldownKey] ?? 0
        if (followUpCooldownRemaining > resolvedCastTime) continue

        // (b) Chain validation: simulate position/form/energy through the entire MUST chain
        if (!validateMustChain(action, snapshot, character, character.actions)) continue
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
