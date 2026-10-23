// Side-effect damage for one action: action side effects, character action triggers, team triggers and tag propagation.
import type { StepContext } from '../../../types/stepContext'
import type { DamageEvent } from '../../../types/events'
import type { SideEffect } from '../../../types/sideEffect'
import { aggregateModification, type AggregatedStatusModifications } from './statusModifications'
import { buildOwnerStepContext } from './ownerStepContext'

// ========== Side Effects Damage =============================================================================================

/**
 * Fires all side-effect damage for this action, in this order:
 *  1. the action's own sideEffects + the active character's matching actionTriggers
 *  2. every character's matching teamActionTriggers (owner-substituted context, may cost owner energy)
 *  3. tag propagation: team firings with propagateTags re-trigger OTHER characters' teamActionTriggers
 * Only events with average > 0 are recorded. Mutates `statusModifications` in step 3.
 */
export function helpSideEffectsDamage(ctx: StepContext, statusModifications: AggregatedStatusModifications): void {
  const sideEffects = ctx.action.sideEffects ?? []

  // Collect character-level action triggers whose required tags all match and condition passes.
  // Each trigger may fire more than once if fireCount is specified (e.g. once per application event).
  const triggeredSideEffects: SideEffect[] = (ctx.character.actionTriggers ?? [])
    .filter(trigger =>
      trigger.requiredTags.every(tag => ctx.action.tags?.includes(tag)) &&
      (!trigger.condition || trigger.condition(ctx))
    )
    .flatMap(trigger => {
      const count = trigger.fireCount ? trigger.fireCount(ctx) : 1
      return Array.from({ length: count }, () => trigger.sideEffect)
    })

  // Collect team-wide triggers from all characters (active + allies).
  // Each fires with an owner-substituted context so ctx.character = trigger owner,
  // ensuring correct dealer attribution and owner stats regardless of who is active.
  type TeamFiring = { sideEffect: SideEffect; ownerCtx: StepContext; propagateTags?: string[] }
  const teamFirings: TeamFiring[] = []
  for (const teamChar of [ctx.character, ...ctx.allies]) {
    if (!teamChar.teamActionTriggers?.length) continue
    const ownerCtx: StepContext = teamChar.name === ctx.character.name ? ctx : buildOwnerStepContext(teamChar, ctx)
    for (const trigger of teamChar.teamActionTriggers) {
      if (!trigger.requiredTags.every(tag => ctx.action.tags?.includes(tag))) continue
      if (trigger.condition && !trigger.condition(ownerCtx)) continue
      const count = trigger.fireCount ? trigger.fireCount(ownerCtx) : 1
      if (trigger.energyCost?.length) {
        const charEnergies = { ...(ctx.current.charactersEnergies?.[teamChar.name] ?? {}) }
        for (const cost of trigger.energyCost) {
          const prev = charEnergies[cost.energyType] ?? 0
          charEnergies[cost.energyType] = Math.max(0, prev - cost.amount)
        }
        ctx.current.charactersEnergies = { ...ctx.current.charactersEnergies, [teamChar.name]: charEnergies }
      }
      for (let i = 0; i < count; i++) {
        teamFirings.push({ sideEffect: trigger.sideEffect, ownerCtx, propagateTags: trigger.propagateTags })
      }
    }
  }

  if (sideEffects.length === 0 && triggeredSideEffects.length === 0 && teamFirings.length === 0) return

  let totalSideEffectDamage = 0
  const damageEvents: DamageEvent[] = []

  for (const sideEffect of [...sideEffects, ...triggeredSideEffects]) {
    const damageEvent = sideEffect.damageDealt(ctx, sideEffect.name, ctx.fromTime)
    if (damageEvent.average > 0) {
      damageEvents.push(damageEvent)
      totalSideEffectDamage += damageEvent.average
    }
  }

  for (const { sideEffect, ownerCtx } of teamFirings) {
    const damageEvent = sideEffect.damageDealt(ownerCtx, sideEffect.name, ctx.fromTime)
    if (damageEvent.average > 0) {
      damageEvents.push(damageEvent)
      totalSideEffectDamage += damageEvent.average
    }
  }

  // Secondary pass: for teamFirings with propagateTags, fire other characters' teamActionTriggers
  // as if an action with those tags was cast — using the side effect's own statusModifications
  // so that fireCount (which reads applicationCount from action.statusModifications) works correctly.
  // The owner of the firing trigger is excluded to prevent reflexive re-triggering.
  // Also merges the side effect's statusModifications into the aggregated mods (e.g. Glacio Chafe stacks
  // from film_roll_proc are included in the negative-status update that runs after this function).
  const dedupSet = new Set<string>()
  for (const { sideEffect, ownerCtx, propagateTags } of teamFirings) {
    if (!propagateTags?.length) continue

    for (const mod of sideEffect.statusModifications ?? []) {
      aggregateModification(statusModifications, mod)
    }

    const syntheticCtx: StepContext = {
      ...ctx,
      action: {
        ...ctx.action,
        tags: propagateTags as any,
        statusModifications: sideEffect.statusModifications ?? [],
      },
    }

    let charTriggerIndex = 0
    for (const teamChar of [ctx.character, ...ctx.allies]) {
      if (teamChar.name === ownerCtx.character.name) continue
      if (!teamChar.teamActionTriggers?.length) continue

      const charOwnerCtx: StepContext = teamChar.name === ctx.character.name
        ? syntheticCtx
        : buildOwnerStepContext(teamChar, syntheticCtx)

      for (const trigger of teamChar.teamActionTriggers) {
        const dedupKey = `${ownerCtx.character.name}->${teamChar.name}[${charTriggerIndex++}]`
        if (dedupSet.has(dedupKey)) continue
        if (!trigger.requiredTags.every(tag => propagateTags.includes(tag))) continue
        if (trigger.condition && !trigger.condition(charOwnerCtx)) continue

        const count = trigger.fireCount ? trigger.fireCount(charOwnerCtx) : 1
        dedupSet.add(dedupKey)

        for (let i = 0; i < count; i++) {
          const damageEvent = trigger.sideEffect.damageDealt(charOwnerCtx, trigger.sideEffect.name, ctx.fromTime)
          if (damageEvent.average > 0) {
            damageEvents.push(damageEvent)
            totalSideEffectDamage += damageEvent.average
          }
        }
      }
    }
  }

  ctx.damageEvents.push(...damageEvents)
  ctx.current.damage += totalSideEffectDamage

  ctx.logs.push({
    resolver: 'resolveSideEffectsDamage',
    message: `Side effects damage resolved: +${totalSideEffectDamage} dmg`,
    details: { sideEffectsCount: sideEffects.length + triggeredSideEffects.length + teamFirings.length, totalDamage: totalSideEffectDamage, damageEvents },
  })
}
