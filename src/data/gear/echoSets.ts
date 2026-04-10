import type { EchoSet } from '../../types/gear'
import type { DamageModifier } from '../../types/modifiers'
import { always } from '../../utils/conditions/damageModifierConditions'

// ========== Echo Set Registry ================================================================================================
//
// Each set defines milestone bonuses that are applied automatically based on the number
// of equipped echoes belonging to that set (tracked via Echo.setName).
//
// Character-specific injected modifier effects (e.g. 5-piece action modifiers) are
// defined in the character's gear file under Gear.setBonus.injectedModifiers — not here.
//
// Max 12 total echo cost, 5 slots. Standard milestones: 2-piece and 5-piece.

export const echoSetRegistry: Readonly<Record<string, EchoSet>> = {
  'Windward Pilgrimage': {
    name: 'Windward Pilgrimage',
    icon: 'assets/gear/set-bonuses/windward_pilgrimage.png',
    info: {
      '2': 'Aero DMG + 10%',
      '5': 'Hitting a target with Aero Erosion increases Crit. Rate by 10% and grants 30% Aero DMG Bonus, lasting for 10s.',
    },
    milestones: {
      2: { stats: { aeroBonusDMG: 0.10 } },
      // 5-piece stat effect is applied via character gear file injectedModifiers (Cartethyia / RoverAero)
    },
  },

  'Gusts of Welkin': {
    name: 'Gusts of Welkin',
    icon: 'assets/gear/set-bonuses/gusts_of_welkin.png',
    info: {
      '2': 'Aero DMG + 10%',
      '5': 'Inflicting Aero Erosion upon enemies increases Aero DMG for all Resonators in the team by 15%, and for the Resonator triggering this effect by an additional 15%, lasting for 20s.',
    },
    milestones: {
      2: { stats: { aeroBonusDMG: 0.10 } },
      // 5-piece effects are injected via Ciaccona's gear file (action-specific modifiers)
    },
  },

  'Halo of Starry Radiance': {
    name: 'Halo of Starry Radiance',
    icon: 'assets/gear/set-bonuses/halo_of_starry_radiance.png',
    info: {
      '2': 'Healing Bonus + 10%',
      '5': 'When healing a Resonator in the team, every 1% of Off-Tune Buildup Rate grants a 0.2% ATK increase to all Resonators in the team for 4s, up to 25%.',
    },
    milestones: {
      2: { stats: { healingBonus: 0.10 } },
      5: {
        injectedModifiers: [
          {
            targets: [{ tag: 'HEAL_PROC' }],
            modifiers: [
              {
                source: 'Halo of Starry Radiance: 5pc',
                displayName: 'Halo of Starry Radiance (Active)',
                type: 'buff',
                color: '#82DC8C',
                ownerCharacter: null,
                // characterStats is unused; statsOnActivation provides the frozen value at cast time.
                characterStats: { bonusATK: 0 },
                description: 'When healing a Resonator in the team, every 1% of Off-Tune Buildup Rate grants a 0.2% ATK increase to all Resonators in the team for 4s, up to 25%.',
                showStats: true,
                /**
                 * Computed once at application (and on each refresh). Reads the effective
                 * Off-Tune Buildup Rate at that moment — base stat plus any active modifiers
                 * (e.g. Syntony Field's +50%) — and converts it to a capped bonusATK value.
                 * Formula: clamp(offtuneBuildupRate × 0.2, 0, 0.25)
                 * (every 1% of offtune = +0.2% ATK; cap at 25%)
                 */
                statsOnActivation: (ctx) => {
                  let offtune = ctx.character.stats.offtuneBuildupRate
                  for (const mia of ctx.modifiersInAction) {
                    const contrib = mia.modifier.characterStats?.offtuneBuildupRate
                    if (!contrib || mia.currentStacks === 0) continue
                    const strategy = mia.modifier.targetStrategy
                    if (strategy === 'self' && mia.modifier.ownerCharacter !== ctx.character.name) continue
                    if (strategy === 'activeAlly') continue
                    if (strategy === 'nextSwap' && mia.targetCharacter !== ctx.character.name) continue
                    offtune += contrib * mia.currentStacks * mia.modifier.condition(ctx)
                  }
                  return { bonusATK: Math.min(offtune * 0.2, 0.25) }
                },
                condition: always(),
                targetStrategy: 'all',
                durationStrategy: { type: 'limited', timeDuration: 4 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
              } satisfies DamageModifier,
            ],
          },
        ],
      },
    },
  },

  'Wishes of Quiet Snowfall': {
    name: 'Wishes of Quiet Snowfall',
    icon: 'assets/gear/set-bonuses/wishes_of_quiet_snowfall.png',
    info: {
      '2': 'Glacio DMG + 10%',
      '5': 'Inflicting Glacio Chafe on enemies increases Glacio DMG dealt by 10% for 15s. The Resonator gains the Snowfall effect, which can be triggered once every 25s. While Snowfall is active: Dealing Resonance Liberation DMG removes Snowfall and increases the Resonator\'s Crit. Rate by 25% for 30s. Casting Outro Skill removes Snowfall and grants 25% Glacio DMG Bonus to the incoming Resonator for 30s. When Snowfall is removed, only one of the effects above can be triggered.',
    },
    milestones: {
      2: { stats: { glacioBonusDMG: 0.10 } },
      5: {
        injectedModifiers: [
          // (1) Applying Glacio Chafe → 10% Glacio DMG Bonus for self (15s, refreshes on re-apply)
          {
            targets: [{ tag: 'GLACIO_CHAFE_APPLIER' }],
            modifiers: [
              {
                source: 'Wishes of Quiet Snowfall: Glacio DMG Buff',
                displayName: 'Wishes of Quiet Snowfall: Glacio Buff',
                type: 'buff',
                color: '#6EC1F2',
                description: 'Inflicting Glacio Chafe on enemies increases Glacio DMG dealt by 10% for 15s.',
                ownerCharacter: null,
                characterStats: { glacioBonusDMG: 0.10 },
                condition: always(),
                targetStrategy: 'self',
                durationStrategy: { type: 'limited', timeDuration: 15 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
              },
            ],
          },

          // (2) Applying Glacio Chafe → Snowfall (25s tracker, no stats, can't be refreshed — "once every 25s" cooldown)
          {
            targets: [{ tag: 'GLACIO_CHAFE_APPLIER' }],
            modifiers: [
              {
                source: 'Wishes of Quiet Snowfall: Snowfall',
                displayName: 'Wishes of Quiet Snowfall: Snowfall',
                type: 'buff',
                color: '#6EC1F2',
                ownerCharacter: null,
                characterStats: {},
                condition: always(),
                targetStrategy: 'self',
                durationStrategy: { type: 'limited', timeDuration: 25 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 },
              },
            ],
          },

          // (3) Dealing Liberation DMG (if Snowfall is active) → consumes Snowfall, grants 25% Crit Rate for self (30s)
          {
            targets: [{ tag: 'LIBERATION' }],
            modifiers: [
              {
                source: 'Wishes of Quiet Snowfall: Crit Rate',
                displayName: 'Wishes of Quiet Snowfall: Crit Rate',
                type: 'buff',
                color: '#6EC1F2',
                ownerCharacter: null,
                characterStats: { critRate: 0.25 },
                condition: always(),
                targetStrategy: 'self',
                durationStrategy: { type: 'limited', timeDuration: 30 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
                activationCondition: (ctx) => ctx.modifiersInAction.some(
                  mia => mia.modifier.source === 'Wishes of Quiet Snowfall: Snowfall'
                    && mia.currentStacks > 0
                    && mia.modifier.ownerCharacter === ctx.character.name
                ),
                removesModifierSourceOnActivation: 'Wishes of Quiet Snowfall: Snowfall',
              },
            ],
          },

          // (4) Casting Outro Skill (if Snowfall is active) → consumes Snowfall, grants 25% Glacio DMG Bonus
          //     to the incoming Resonator (30s, nextSwap). Also removes the Crit Rate buff if active
          //     from a prior Liberation cycle, since only one Snowfall effect can be active at a time.
          {
            targets: [{ tag: 'OUTRO_ACTION' }],
            modifiers: [
              // (4a) Apply 25% Glacio DMG Bonus to the incoming resonator; consume Snowfall
              {
                source: 'Wishes of Quiet Snowfall: Incoming Glacio',
                displayName: 'Wishes of Quiet Snowfall: Incoming Glacio Buff',
                type: 'buff',
                color: '#6EC1F2',
                ownerCharacter: null,
                characterStats: { glacioBonusDMG: 0.25 },
                condition: always(),
                targetStrategy: 'nextSwap',
                durationStrategy: { type: 'limited', timeDuration: 30 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
                activationCondition: (ctx) => ctx.modifiersInAction.some(
                  mia => mia.modifier.source === 'Wishes of Quiet Snowfall: Snowfall'
                    && mia.currentStacks > 0
                    && mia.modifier.ownerCharacter === ctx.character.name
                ),
                removesModifierSourceOnActivation: 'Wishes of Quiet Snowfall: Snowfall',
              },
              // (4b) Simultaneously remove the Crit Rate buff (if active from a previous Liberation cycle).
              //      activationCondition mirrors (4a) — both check Snowfall before triggering.
              //      timeDuration: 0 means this modifier is ephemeral — it exists solely for its
              //      removesModifierSourceOnActivation side-effect and expires after the action.
              {
                source: 'Wishes of Quiet Snowfall: Crit Rate Cleanup',
                displayName: 'Wishes of Quiet Snowfall: Crit Rate Cleanup',
                type: 'buff',
                color: '#6EC1F2',
                ownerCharacter: null,
                characterStats: {},
                condition: always(),
                targetStrategy: 'self',
                durationStrategy: { type: 'limited', timeDuration: 0 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
                activationCondition: (ctx) => ctx.modifiersInAction.some(
                  mia => mia.modifier.source === 'Wishes of Quiet Snowfall: Snowfall'
                    && mia.currentStacks > 0
                    && mia.modifier.ownerCharacter === ctx.character.name
                ),
                removesModifierSourceOnActivation: 'Wishes of Quiet Snowfall: Crit Rate',
              },
            ],
          },
        ],
      },
    },
  },
}

// ========== Helper: count echoes per set =====================================================================================

import type { EchoSlots } from '../../types/gear'

/** Returns a map from set name to the number of equipped echoes belonging to that set. */
export function computeEchoSetCounts(slots: EchoSlots): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const slotNum of [1, 2, 3, 4, 5] as const) {
    const echo = slots[slotNum]
    if (!echo?.setName) continue
    counts[echo.setName] = (counts[echo.setName] ?? 0) + 1
  }
  return counts
}
