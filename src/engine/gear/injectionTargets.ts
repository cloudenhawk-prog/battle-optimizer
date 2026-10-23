// Gear injection target matching: type guards and tag / dmgType / procTag matchers used by resolveGear.
import type { Action, ActionTag } from '../../types/action'
import type { DamageType } from '../../types/baseTypes'
import type { CoordinatedAttack } from '../../types/coordinatedAttack'
import type { InjectedTarget } from '../../types/gear'

// ========== Target Matching ==================================================================================================

/** Returns true if procTag matches a tag-based injection target. */
export function matchesProcTag(procTag: string, target: { tag: ActionTag } | { tags: ActionTag[]; match: 'any' | 'all' }): boolean {
  if ('tag' in target) return procTag === target.tag
  return target.match === 'any'
    ? target.tags.some(t => t === procTag)
    : target.tags.every(t => t === procTag)
}

/** Returns true when a target is a tag-based descriptor `{ tag }` or `{ tags }`. */
export function isTagTarget(target: InjectedTarget | Action): target is { tag: ActionTag } | { tags: ActionTag[]; match: 'any' | 'all' } {
  if (typeof target !== 'object' || target === null) return false
  return 'tag' in target || ('tags' in target && !('dmgType' in target) && !('dmgTypes' in target))
}

/** Returns true when a target is a dmgType-based descriptor `{ dmgType }` or `{ dmgTypes }`. */
export function isDmgTypeTarget(target: InjectedTarget | Action): target is { dmgType: DamageType } | { dmgTypes: DamageType[]; match: 'any' | 'all' } {
  if (typeof target !== 'object' || target === null) return false
  return 'dmgType' in target || 'dmgTypes' in target
}

/** Returns true when an action or coordinated attack carries all/any of the requested tags. */
export function hasMatchingTags(
  subject: { tags?: ActionTag[] },
  target: { tag: ActionTag } | { tags: ActionTag[]; match: 'any' | 'all' },
): boolean {
  const subjectTags = subject.tags ?? []
  if ('tag' in target) {
    return subjectTags.includes(target.tag)
  }
  return target.match === 'any'
    ? target.tags.some(t => subjectTags.includes(t))
    : target.tags.every(t => subjectTags.includes(t))
}

/** Returns true when an action or coordinated attack's dmgTypes includes all/any of the requested types. */
export function hasMatchingDmgTypes(
  subject: { dmgTypes?: DamageType[] },
  target: { dmgType: DamageType } | { dmgTypes: DamageType[]; match: 'any' | 'all' },
): boolean {
  const subjectTypes = subject.dmgTypes ?? []
  if ('dmgType' in target) {
    return subjectTypes.includes(target.dmgType)
  }
  return target.match === 'any'
    ? target.dmgTypes.some(t => subjectTypes.includes(t))
    : target.dmgTypes.every(t => subjectTypes.includes(t))
}

/** Type guard distinguishing a CoordinatedAttack from an Action (by presence of `frequency`). */
export function isCoordinatedAttack(target: Action | CoordinatedAttack): target is CoordinatedAttack {
  return 'frequency' in target
}
