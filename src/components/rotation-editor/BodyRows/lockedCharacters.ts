// Pure rule: which characters can't be picked in the next row (swap locks, swap cooldowns, follow-up/restrict locks).
import type { Character } from '../../../types/character'
import type { Snapshot } from '../../../types/snapshot'
import { isSwapRequiredLocked } from '../../../engine/state/snapshotHelpers'
import { isFollowUpCastableNow, validateMustChain } from '../../../engine/castRules/mustChainValidator'

// ========== Locked Characters ================================================================================================

/** Character names disabled in the row's character dropdown, judged from the previous row's snapshot. */
export function getLockedCharacters(previousSnapshot: Snapshot | null, charactersInBattle: Character[], sandboxMode: boolean): Set<string> {
  const lockedCharacters = new Set<string>()
  if (!sandboxMode && previousSnapshot) {
    // The on-field character must stay when its state requires it (isSwapRequiredLocked)
    const prevChar = previousSnapshot.character ?? ''
    if (prevChar && isSwapRequiredLocked(previousSnapshot, prevChar)) {
      lockedCharacters.add(prevChar)
    }
    // Lock characters that are still within their 1-second swap cooldown
    const swapCooldowns = previousSnapshot.charactersSwapCooldownUntil ?? {}
    const prevToTime = previousSnapshot.toTime
    for (const [charName, cooldownUntil] of Object.entries(swapCooldowns)) {
      if (cooldownUntil - prevToTime > 0) {
        lockedCharacters.add(charName)
      }
    }
    // Lock all characters except the one with a follow-up (combo system)
    const attemptFollowUps = previousSnapshot.charactersAttemptFollowUp ?? {}
    const charactersWithFollowUp = Object.keys(attemptFollowUps).filter(char => {
      const entry = attemptFollowUps[char]
      if (!entry) return false
      if (entry.must) return true
      // "if possible": only lock the character when the follow-up is castable AND its own MUST chain can be satisfied
      const charObj = charactersInBattle.find(c => c.name === char)
      if (!charObj) return false
      const followUpAction = charObj.actions.find(a => a.name === entry.actionName || a.groupName === entry.actionName)
      return !!followUpAction && isFollowUpCastableNow(followUpAction, previousSnapshot, charObj) && validateMustChain(followUpAction, previousSnapshot, charObj, charObj.actions)
    })
    if (charactersWithFollowUp.length > 0) {
      // Lock all characters that don't have a required follow-up
      for (const char of charactersInBattle) {
        if (!charactersWithFollowUp.includes(char.name)) {
          lockedCharacters.add(char.name)
        }
      }
    }

    // Lock all characters except the one with a restrictNextTo (same semantics as must:true follow-up)
    const restrictNextToMap = previousSnapshot.charactersRestrictNextTo ?? {}
    const charactersWithRestriction = Object.keys(restrictNextToMap).filter(char => (restrictNextToMap[char]?.length ?? 0) > 0)
    if (charactersWithRestriction.length > 0) {
      for (const char of charactersInBattle) {
        if (!charactersWithRestriction.includes(char.name)) {
          lockedCharacters.add(char.name)
        }
      }
    }
  }
  return lockedCharacters
}
