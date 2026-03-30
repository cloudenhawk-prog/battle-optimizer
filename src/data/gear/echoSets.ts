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
            // Injected into all HEAL_PROC-tagged actions and into heal-proc modifier procModifiers,
            // so the buff fires on every timed heal tick (e.g. Syntony Field's 3s proc).
            targets: [{ tag: 'HEAL_PROC' }],
            modifiers: [
              {
                source: 'Halo of Starry Radiance: 5pc',
                displayName: 'Radiant ATK',
                type: 'buff',
                ownerCharacter: null,
                // characterStats is unused; statsOnActivation provides the frozen value at cast time.
                characterStats: { bonusATK: 0 },
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
