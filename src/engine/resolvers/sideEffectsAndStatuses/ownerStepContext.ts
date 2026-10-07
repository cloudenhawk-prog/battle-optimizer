// Builds a StepContext re-centred on an off-field trigger owner, so their own self-targeted modifiers apply.
import type { StepContext } from '../../../types/stepContext'
import type { ResolvedCharacter } from '../../../types/character'
import { collectAllModifiers, filterApplicableModifiers } from '../../modifiers/modifierHelpers'
import { initializeEmptyCharacterStats, initializeEmptyEnemyStats, aggregateModifierStats } from '../statHelpers'

// ========== Owner Step Context ==============================================================================================

/**
 * Builds a StepContext for an off-field character firing a teamActionTrigger.
 * Re-collects and re-aggregates modifiers with ownerChar as the "active" character so that
 * self-targeting modifiers (e.g. Hiyuki's Snow Rust crit DMG) are correctly included instead
 * of being dropped when the spread context carries the active character's aggregated stats.
 */
export function buildOwnerStepContext(ownerChar: ResolvedCharacter, ctx: StepContext): StepContext {
  const otherChars = [ctx.character, ...ctx.allies].filter(c => c.name !== ownerChar.name)

  const ownerAllMods = collectAllModifiers(ownerChar, ctx.action, ctx.negativeStatusesInAction, otherChars)
  const ownerPermanentMods = ownerAllMods.filter(m => !m.durationStrategy || m.durationStrategy.type === 'permanent')

  const baseOwnerCtx: StepContext = { ...ctx, character: ownerChar }
  const ownerApplicableMods = filterApplicableModifiers(ctx.modifiersInAction, ownerPermanentMods, baseOwnerCtx)

  const characterModifiers = initializeEmptyCharacterStats()
  const enemyModifiers = initializeEmptyEnemyStats()
  aggregateModifierStats(ownerApplicableMods, ctx.modifiersInAction, baseOwnerCtx, characterModifiers, enemyModifiers)

  return {
    ...ctx,
    character: ownerChar,
    damageModifiers: ownerApplicableMods,
    aggregatedCharacterModifiers: characterModifiers,
    aggregatedEnemyModifiers: enemyModifiers,
  }
}
