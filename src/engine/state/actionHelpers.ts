import type { Character } from '../../types/character'
import type { DamageType } from '../../types/baseTypes'
import type { Action, ActionVariantIntent } from '../../types/action'
import type { Snapshot } from '../../types/snapshot'
import { getCharacter } from './characterHelpers'

// ========== Action Helpers ===================================================================================================

export function getActionFromCharacter(charactersMap: Record<string, Character>, characterName: string, actionName: string, prevSnapshot?: Snapshot) {
  const character = getCharacter(charactersMap, characterName)
  if (!character) return undefined

  // Exact action names (manual variant picks) always win.
  const exactAction = character.actions.find(a => a.name === actionName)
  if (exactAction) {
    if (exactAction.resolveVariant) {
      return exactAction.resolveVariant(prevSnapshot, characterName, character)
    }
    return exactAction
  }

  // Group-level picks (groupName) are auto-resolved to the fastest default-like variant.
  const groupCandidates = character.actions.filter(a => a.groupName === actionName)
  const action = pickBestDefaultLikeVariant(groupCandidates)
  if (!action) return undefined
  if (action.resolveVariant) {
    return action.resolveVariant(prevSnapshot, characterName, character)
  }
  return action
}

export function inferActionNameForStep(charactersMap: Record<string, Character>, characterName: string, requestedActionName: string, nextCharacterName?: string): string {
  const character = getCharacter(charactersMap, characterName)
  if (!character) return requestedActionName

  // Keep explicit variant picks stable.
  const exactAction = character.actions.find(a => a.name === requestedActionName)
  if (exactAction) {
    const groupCandidates = exactAction.groupName
      ? character.actions.filter(a => a.groupName === exactAction.groupName)
      : [exactAction]
    return pickAutoVariantName(groupCandidates, characterName, nextCharacterName, exactAction.name)
  }

  const groupCandidates = character.actions.filter(a => a.groupName === requestedActionName)
  if (groupCandidates.length === 0) return requestedActionName
  return pickAutoVariantName(groupCandidates, characterName, nextCharacterName)
}

function pickAutoVariantName(candidates: Action[], characterName: string, nextCharacterName?: string, fallbackActionName?: string): string {
  const isSwapToNextCharacter = !!nextCharacterName && nextCharacterName !== characterName

  if (isSwapToNextCharacter) {
    const swapCandidates = candidates.filter(a => inferVariantIntent(a) === 'SWAP_CANCEL')
    const bestSwap = pickFastest(swapCandidates)
    if (bestSwap) return bestSwap.name
  }

  // In default-like contexts, prefer fast non-limited variants (e.g. dash cancel).
  const defaultLike = candidates.filter(a => {
    const intent = inferVariantIntent(a)
    const limited = isAutoVariantLimited(a)
    return !limited && (intent === 'DEFAULT' || intent === 'DASH_CANCEL')
  })
  const bestDefaultLike = pickFastest(defaultLike)
  if (bestDefaultLike) return bestDefaultLike.name

  const bestNonLimited = pickFastest(candidates.filter(a => !isAutoVariantLimited(a)))
  if (bestNonLimited) return bestNonLimited.name

  return fallbackActionName ?? pickFastest(candidates)?.name ?? candidates[0].name
}

function pickBestDefaultLikeVariant(candidates: Action[]): Action | undefined {
  if (candidates.length === 0) return undefined
  const best = pickFastest(candidates.filter(a => !isAutoVariantLimited(a) && (inferVariantIntent(a) === 'DEFAULT' || inferVariantIntent(a) === 'DASH_CANCEL')))
  if (best) return best
  return pickFastest(candidates.filter(a => !isAutoVariantLimited(a))) ?? candidates[0]
}

function pickFastest(actions: Action[]): Action | undefined {
  if (actions.length === 0) return undefined
  return actions.reduce((best, current) => (current.castTime < best.castTime ? current : best), actions[0])
}

function isAutoVariantLimited(action: Action): boolean {
  if (action.autoVariantLimited !== undefined) return action.autoVariantLimited
  return inferVariantIntent(action) === 'SWAP_CANCEL'
}

function inferVariantIntent(action: Action): ActionVariantIntent {
  if (action.variantIntent) return action.variantIntent
  if (action.castConditions.requiresSwapOut || action.castConditions.swapOutState) return 'SWAP_CANCEL'

  const v = (action.variantName ?? '').toLowerCase()
  if (!v || v === 'default') return 'DEFAULT'
  if (v.includes('dash')) return 'DASH_CANCEL'
  if (v.includes('swap')) return 'SWAP_CANCEL'
  if (v.includes('skill')) return 'SKILL_CANCEL'
  if (v.includes('heavy')) return 'HEAVY_CANCEL'
  if (v.includes('jump')) return 'JUMP_CANCEL'
  return 'OTHER'
}

/**
 * Finds the name of the first action that includes the given dmgType.
 * Used to look up outro/intro actions without relying on hardcoded names.
 * If a formName is provided, checks if that form has a custom intro/outro action.
 */
export function getActionNameByDmgType(character: Character, dmgType: DamageType, formName?: string): string | undefined {
  // If a form name is specified and the character has forms, check for form-specific intro/outro
  if (formName && character.forms) {
    const form = character.forms.find(f => f.name === formName)
    if (form) {
      if (dmgType === 'INTRO' && form.introAction) {
        return form.introAction.name
      }
      if (dmgType === 'OUTRO' && form.outroAction) {
        return form.outroAction.name
      }
    }
  }

  // Find by tag
  const tag = dmgType === 'INTRO' ? 'INTRO_ACTION' : dmgType === 'OUTRO' ? 'OUTRO_ACTION' : undefined
  if (tag) return character.actions.find(a => a.tags?.includes(tag))?.name

  return character.actions.find(a => (a.dmgTypes as string[]).includes(dmgType))?.name
}
