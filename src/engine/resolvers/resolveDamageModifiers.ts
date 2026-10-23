// R2 resolveDamageModifiers: activates this action's limited modifiers and aggregates every applicable buff/debuff into stats.
import type { StepContext } from '../../types/stepContext'
import { collectAllModifiers, activateModifiers, filterApplicableModifiers } from '../modifiers/modifierHelpers'
import { initializeEmptyCharacterStats, initializeEmptyEnemyStats, aggregateModifierStats } from './statHelpers'

// ========== Resolver 2: Damage Modifiers ====================================================================================

export function resolveDamageModifiers(ctx: StepContext) {
  const characterModifiers = initializeEmptyCharacterStats()
  const enemyModifiers = initializeEmptyEnemyStats()

  // Step 1: Collect all modifier blueprints from various sources
  const allModifiers = collectAllModifiers(ctx.character, ctx.action, ctx.negativeStatusesInAction, ctx.allies)

  // Step 2: Activate new modifiers (convert limited ones to ModifierInAction, handle stacking)
  // Pass the cast duration as an offset so that limited modifier timers start from end-of-cast (ctx.toTime)
  // rather than start-of-cast (ctx.fromTime). resolveModifierState will subtract this same duration,
  // so the net effect is that timeLeft equals timeDuration at the moment the action finishes casting.
  const castTimeOffset = ctx.toTime - ctx.fromTime
  ctx.modifiersInAction = activateModifiers(allModifiers, ctx.modifiersInAction, ctx, castTimeOffset)

  // Step 3: Filter modifiers that apply to current context
  // This includes both permanent modifiers and active limited modifiers
  const permanentModifiers = allModifiers.filter(mod => !mod.durationStrategy || mod.durationStrategy.type === 'permanent')
  ctx.permanentModifiers = permanentModifiers // Store for later use in resolveModifierState
  const applicableModifiers = filterApplicableModifiers(ctx.modifiersInAction, permanentModifiers, ctx)

  // Store all applicable modifiers in context for damage calculator to use
  ctx.damageModifiers = applicableModifiers

  // Step 4: Aggregate stats from applicable modifiers (limited ones scaled by their stack count)
  aggregateModifierStats(applicableModifiers, ctx.modifiersInAction, ctx, characterModifiers, enemyModifiers)

  ctx.aggregatedCharacterModifiers = characterModifiers
  ctx.aggregatedEnemyModifiers = enemyModifiers

  ctx.logs.push({
    resolver: 'resolveDamageModifiers',
    message: 'Final aggregated modifiers collected',
    details: {
      totalModifiers: allModifiers.length,
      applicableModifiers: applicableModifiers.length,
      activeModifiersInAction: ctx.modifiersInAction.length,
      characterModifiers: ctx.aggregatedCharacterModifiers,
      enemyModifiers: ctx.aggregatedEnemyModifiers,
    },
  })
}
