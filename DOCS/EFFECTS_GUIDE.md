# Effects Guide — How to Add Every Kind of Kit Mechanic

This is a practical cookbook. Each section answers: *"I need to implement X — where do I put it and what does the code look like?"*

All example code references real data from the codebase. Types are defined in `src/types/`; condition helpers live in `src/utils/conditions/damageModifierConditions.ts`; status-modification helpers live in `src/utils/modifications/statusModificationHelpers.ts`.

---

## Table of Contents

1. [Quick Orientation: Where Things Live](#1-quick-orientation-where-things-live)
2. [Damage Modifiers (Buffs / Debuffs)](#2-damage-modifiers-buffs--debuffs)
   - [Permanent passive — always active](#21-permanent-passive--always-active)
   - [Permanent conditional — active only while condition is true](#22-permanent-conditional--active-only-while-condition-is-true)
   - [Time-limited buff — triggered by an action](#23-time-limited-buff--triggered-by-an-action)
   - [Swap-limited buff](#24-swap-limited-buff)
   - [Multi-stack buff with individual stack timers](#25-multi-stack-buff-with-individual-stack-timers)
   - [Target Strategy Reference](#26-target-strategy-reference)
   - [Buff targeting the next character swapped to](#27-buff-targeting-the-next-character-swapped-to)
   - [Buff that targets allies (not self)](#28-buff-that-targets-allies-not-self)
   - [Team-wide buff](#29-team-wide-buff)
   - [Buff for all allies except self](#210-buff-for-all-allies-except-self)
3. [Condition Functions](#3-condition-functions)
   - [always()](#31-always)
   - [atLeastOneStackOf(name)](#32-atleastoneStackof)
   - [stacksOf(name)](#33-stacksof)
   - [stacksOfCap(name)](#34-stacksofcap)
   - [hasForteGrant(name)](#35-hasfortegrant)
   - [ownerAtLeast(name, minSequence)](#36-owneratleastname-minsequence)
   - [Custom inline condition](#37-custom-inline-condition)
4. [StatusModification — Explicit Stack / Duration Changes](#4-statusmodification--explicit-stack--duration-changes)
   - [Apply stacks of a NegativeStatus](#41-apply-stacks-of-a-negativestatus)
   - [Remove stacks of a NegativeStatus](#42-remove-stacks-of-a-negativestatus)
   - [Refresh / extend NegativeStatus duration](#43-refresh--extend-negativestatus-duration)
   - [Forcibly remove buff or debuff stacks](#44-forcibly-remove-buff-or-debuff-stacks)
5. [Side Effects](#5-side-effects)
   - [Side effect that deals flat NegativeStatus damage](#51-side-effect-that-deals-flat-negativestatus-damage)
   - [Side effect that only modifies stacks (no damage)](#52-side-effect-that-only-modifies-stacks-no-damage)
6. [Negative Statuses (DoT)](#6-negative-statuses-dot)
   - [Defining a new NegativeStatus](#61-defining-a-new-negativestatus)
   - [Modifying a NegativeStatus's frequency or max stacks via a DamageModifier](#62-modifying-a-negativestatuss-frequency-or-max-stacks-via-a-damagemodifier)
7. [Coordinated Attacks](#7-coordinated-attacks)
   - [Standard periodic attack](#71-standard-periodic-attack)
   - [Swap-required attack (ends when owner comes back on-field)](#72-swap-required-attack-ends-when-owner-comes-back-on-field)
   - [Coordinated attack with a linked team buff (aura)](#73-coordinated-attack-with-a-linked-team-buff-aura)
8. [Energy & Resources](#8-energy--resources)
   - [Generate energy on action cast](#81-generate-energy-on-action-cast)
   - [Energy that scales with a stat](#82-energy-that-scales-with-a-stat)
   - [Share energy to allies](#83-share-energy-to-allies)
   - [Consume energy as a cast cost](#84-consume-energy-as-a-cast-cost)
   - [Forte sub-energy (divinity / discord / virtue) and forte grants](#85-forte-sub-energy-and-forte-grants)
   - [Resource milestones — gain modifier stacks when crossing energy thresholds](#86-resource-milestones--gain-modifier-stacks-when-crossing-energy-thresholds)
9. [Cooldown Reductions](#9-cooldown-reductions)
10. [Forms & Form-Specific Intro/Outro](#10-forms--form-specific-introoutro)
11. [Dynamic Variants (resolveVariant)](#11-dynamic-variants-resolvevariant)
    - [Signature and available context](#111-signature-and-available-context)
    - [Sequence-gating any action property](#112-sequence-gating-any-action-property)
    - [Runtime-state variants (forte, cooldowns)](#113-runtime-state-variants-forte-cooldowns)
12. [Combo & Sequencing Mechanics](#12-combo--sequencing-mechanics)
    - [previousActions — must immediately follow another action](#121-previousactions--must-immediately-follow-another-action)
    - [attemptFollowUp — forces the next action](#122-attemptFollowUp--forces-the-next-action)
    - [comboWindow — must be cast within a time window](#123-combowindow--must-be-cast-within-a-time-window)
13. [Gear: Injecting Modifiers and Side Effects](#13-gear-injecting-modifiers-and-side-effects)
    - [Weapon injecting a modifier onto the character](#131-weapon-injecting-a-modifier-onto-the-character)
    - [Weapon injecting a modifier onto a specific action](#132-weapon-injecting-a-modifier-onto-a-specific-action)
    - [Echo set bonus injecting a timed buff onto multiple actions](#133-echo-set-bonus-injecting-a-timed-buff-onto-multiple-actions)
    - [Echo injecting a side effect onto a specific action](#134-echo-injecting-a-side-effect-onto-a-specific-action)
14. [Cast Conditions Reference](#14-cast-conditions-reference)
15. [Adding a Completely New Character — Checklist](#15-adding-a-completely-new-character--checklist)

---

## 1. Quick Orientation: Where Things Live

| What | File(s) |
|------|---------|
| Action definitions | `src/data/actions/<character>.ts` |
| Character definition (damageModifiers, resourceMilestones, maxEnergies, gear, forms) | `src/data/characters/<character>.ts` |
| Gear (weapon, echoes, set bonus with injected modifiers) | `src/data/gear/<character>.ts` |
| Forms | `src/data/forms/<character>.ts` |
| Coordinated attacks | `src/data/coordinatedAttacks/<character>.ts` |
| Side effect implementations | `src/data/sideEffects/sideEffects.ts` |
| Side effect damage calculators | `src/utils/calculators/sideEffectCalculators.ts` |
| Negative status definitions | `src/data/negativeStatuses.ts` |
| Condition helper functions | `src/utils/conditions/damageModifierConditions.ts` |
| StatusModification helper functions | `src/utils/modifications/statusModificationHelpers.ts` |
| Action template | `src/data/actions/blueprint.ts` |
| Character template | `src/data/characters/blueprint.ts` |

---

## 2. Damage Modifiers (Buffs / Debuffs)

A `DamageModifier` can be placed in four locations depending on when it should be active:

| Location | Active scope |
|----------|--------------|

| `Character.damageModifiers` | Always present for this character (passive kit) |
| `Action.damageModifiers` | Activated when this action is cast |
| `CoordinatedAttack.damageModifiers` | Re-activated on every tick of the coordinated attack |
| `CoordinatedAttack.linkedModifiers` | Active for the entire lifetime of the coordinated attack (aura) |
| `NegativeStatus.damageModifiers` | Active while the status has ≥ 1 stack |
| Gear `injectedModifiers` | Injected at startup into a character, action, or coordinated attack |

---

### 2.1 Permanent passive — always active

Use `durationStrategy: { type: 'permanent' }`. The modifier is re-evaluated each step from source (character, action, or negative status). It is **never** added to `modifiersInAction`.

```ts
// src/data/characters/ciaccona.ts
{
  source: 'Gusts of Welkin Team Buff',
  displayName: 'GoW Team Buff',
  type: 'buff',
  ownerCharacter: 'Ciaccona',
  condition: always(),
  characterStats: { aeroBonusDMG: 0.15 },
  targetStrategy: 'all',
  durationStrategy: { type: 'permanent' },
  stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 },
}
```

The `condition: always()` means it contributes its stats unconditionally. Use a different condition function if there are rules (see §3).

---

### 2.2 Permanent conditional — active only while condition is true

Still `type: 'permanent'` but with a condition function that returns `0` when inactive.

```ts
// Cartethyia's inherent skill — bonusDMG scales with Aero Erosion stacks
// src/data/characters/cartethyia.ts
{
  source: 'Inherent Skill',
  displayName: "Wind's Indelible Imprint",
  type: 'buff',
  ownerCharacter: 'Cartethyia',
  condition: stacksOf('Aero Erosion'),   // returns 3/4/5/6 (acts as a multiplier tier)
  characterStats: { bonusDMG: 0.1 },
  targetStrategy: 'self',
  durationStrategy: { type: 'permanent' },
  stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 },
}
```

`stacksOf('Aero Erosion')` returns a numeric tier (3, 4, 5, or 6) based on current stacks — the condition result is used as a multiplier on the stat contribution. If stacks = 0, it returns 0 and the modifier contributes nothing.

---

### 2.3 Time-limited buff — triggered by an action

Put the modifier in `Action.damageModifiers`. The resolver activates it (adds it to `modifiersInAction`) when the action is cast.

```ts
// Cartethyia's outro
// src/data/actions/cartethyia.ts
damageModifiers: [
  {
    source: 'Cartethyia Outro Buff',
    displayName: "Wind's Divine Blessing",
    type: 'buff',
    ownerCharacter: 'Cartethyia',
    color: '#1ae070',
    characterStats: { aeroAmplifyDMG: 0.175 },
    condition: always(),
    targetStrategy: 'activeAlly',
    durationStrategy: { type: 'limited', timeDuration: 20 },
    stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
  },
],
```

`timeDuration: 20` means the buff lasts 20 seconds. `resetTimerOnApplication: true` restarts the 20s clock if the outro is cast again while the buff is active.

---

### 2.4 Swap-limited buff

Set `numberOfSwaps` instead of (or alongside) `timeDuration`:

```ts
// Static Mist weapon — buff expires after 1 swap (only the next character)
// src/data/gear/ciaccona.ts
durationStrategy: { type: 'limited', timeDuration: 14, numberOfSwaps: 1 },
```

Both `timeDuration` and `numberOfSwaps` can be set; whichever expires first removes the modifier.

---

### 2.5 Multi-stack buff with individual stack timers

Set `maxStacks > 1`, `resetTimerOnApplication: false`, and `stacksRemovedEachTime: 1`. Each cast adds one stack. The oldest stack's timer expires and is removed independently.

```ts
// Cartethyia S1 — up to 4 conviction stacks, each lasting 15s, not reset on re-application
// src/data/characters/cartethyia.ts  (inside resourceMilestones)
{
  source: 'Cartethyia S1: Conviction Milestone',
  displayName: "Fleurdelys's Conviction",
  type: 'buff',
  ownerCharacter: 'Cartethyia',
  color: '#87ceeb',
  characterStats: { critDamage: 0.25 },
  condition: always(),
  targetStrategy: 'self',
  durationStrategy: { type: 'limited', timeDuration: 15 },
  stackingStrategy: { maxStacks: 4, resetTimerOnApplication: false, stacksRemovedEachTime: 4 },
}
```

> **Note:** `stacksRemovedEachTime: 4` here means when the timer expires every stack is removed at once. Use `stacksRemovedEachTime: 1` to remove stacks one-by-one as each 15s window expires.

---

### 2.6 Target Strategy Reference

The `targetStrategy` field controls who receives the stat contribution of a modifier. `ownerCharacter` refers to the character whose kit defined the modifier (typically set at gear/action data time).

| Strategy | Who benefits | Notes |
|----------|-------------|-------|
| `self` | Only the `ownerCharacter` | Applies both when on-field and during off-field coordinated attacks. Does **not** apply to other characters. |
| `active` | The currently on-field character | Applies to whoever is the active attacker for a main action. Does **not** apply to off-field coordinated attack hits. |
| `all` | Every character universally | Applies during main actions, all off-field coordinated attack hits, etc. |
| `activeAlly` | The currently on-field character, **excluding** the `ownerCharacter` | If the owner is active, the buff does nothing for those moments. Does not apply to the owner's own off-field coordinated attack hits. |
| `allExceptSelf` | All characters **except** the `ownerCharacter` | Universal during duration, but the owning character is permanently excluded — even during their own coordinated attack hits. |
| `nextSwap` | The character who is swapped in after the buff activates, until `numberOfSwaps` swap-outs or `timeDuration` expires | The caster never receives this buff. On activation, `targetCharacter` is `null` — the first swap "claims" the buff and assigns it to the swap-in. Subsequent swaps decrement `numberOfSwaps`. |

---

### 2.7 Buff targeting the next character swapped to

Use `targetStrategy: 'nextSwap'`. The `targetCharacter` field on `ModifierInAction` starts as `null` when activated; the first swap after activation claims the buff and assigns it to the incoming character without spending a swap count. After that, each swap decrements `numberOfSwaps`.

```ts
// Static Mist weapon outro buff — 15% ATK to the next swap-in only
// src/data/gear/weaponCatalog.ts
{
  targetStrategy: 'nextSwap',
  durationStrategy: { type: 'limited', timeDuration: 14, numberOfSwaps: 1 },
  ...
}
```

`numberOfSwaps: 1` means the buff expires after the claimed character is swapped out once. The caster never receives the buff regardless of `ownerCharacter`.

---

### 2.8 Buff that targets allies (not self)

`targetStrategy: 'activeAlly'` — the modifier applies to whoever is currently on-field, as long as it is **not** the `ownerCharacter`. If the owner swaps in, the buff effectively does nothing until they swap out again.

```ts
// Cartethyia's outro — aero amplify for whoever is on-field after her
// src/data/actions/cartethyia.ts
{
  targetStrategy: 'activeAlly',
  ...
}
```

---

### 2.9 Team-wide buff

`targetStrategy: 'all'` — applies to every character regardless of who is acting, including the owner.

```ts
// Ciaccona's outro — aero erosion amplify for the whole team
// src/data/actions/ciaccona.ts
{
  source: 'Ciaconna Outro Buff',
  displayName: 'Windcalling Tune',
  type: 'buff',
  ownerCharacter: 'Ciaccona',
  condition: always(),
  characterStats: { aeroErosionAmplifyDMG: 1.0 },
  targetStrategy: 'all',
  durationStrategy: { type: 'limited', timeDuration: 30 },
  stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
}
```

---

### 2.10 Buff for all allies except self

`targetStrategy: 'allExceptSelf'` — universal during duration, but the `ownerCharacter` is permanently excluded. Unlike `activeAlly`, this does **not** depend on who is currently on field; every character other than the owner benefits at all times.

```ts
// Hiyuki's outro — Glacio Amplification for everyone but Hiyuki
// src/data/actions/hiyuki.ts
{
  targetStrategy: 'allExceptSelf',
  durationStrategy: { type: 'limited', timeDuration: 20 },
  ...
}
```



All condition functions live in `src/utils/conditions/damageModifierConditions.ts`. A `condition(ctx)` returns a **number** used as a multiplier on the modifier's stat contribution. `0` = inactive, `1` = full value, other values = partial/scaled.

---

### 3.1 `always()`

Returns `1` unconditionally. Use this for any buff that is simply active with no requirements.

```ts
condition: always()
```

---

### 3.2 `atLeastOneStackOf(name)`

Returns `1` if the specified negative status has ≥ 1 stack, `0` otherwise. Use for flat conditional passives.

```ts
// Defier's Thorn: +20% amplifyDMG while Aero Erosion is active
// src/data/gear/cartethyia.ts
condition: atLeastOneStackOf('Aero Erosion')
```

---

### 3.3 `stacksOf(name)`

Returns a tiered integer multiplier based on Aero Erosion stacks: `0` (none), `3` (1–3), `4` (4), `5` (5), `6` (6+). The multiplier is applied to the modifier's stat contribution, so `{ bonusDMG: 0.1 }` with `stacksOf('Aero Erosion') = 3` contributes `0.3` bonusDMG.

```ts
// Cartethyia passive: +10% bonusDMG per Aero Erosion tier
condition: stacksOf('Aero Erosion')
```

> This is intentionally non-linear tier logic. If you need a simple "multiply by stack count", write a custom condition instead.

---

### 3.4 `stacksOfCap(name)`

Returns the raw stack count of the status, capped at 5. `0` = inactive. Use when you need a linear `n × value` scaling.

```ts
condition: stacksOfCap('Aero Erosion')
// at 3 stacks: modifier contributes 3 × stat value
// at 6 stacks: contributes 5 × stat value (cap)
```

---

### 3.5 `hasForteGrant(grantName)`

Returns `1` if `ctx.current.charactersForteGrants[character]` contains `grantName`, `0` otherwise. Used to gate modifiers behind consumed forte sub-energies (see §8.5).

```ts
// Cartethyia: Mandate buff is only active when Mandate of Divinity forte grant is present
// src/data/actions/cartethyia.ts
condition: hasForteGrant('Mandate of Divinity')
```

---

### 3.6 `ownerAtLeast(name, minSequence)`

Returns `1` when the named character's sequence level is ≥ `minSequence`, `0` otherwise. Works whether that character is the active character or an ally. This is the standard way to gate a `DamageModifier` behind a sequence node.

```ts
import { ownerAtLeast } from '../../utils/conditions/damageModifierConditions'

// Active only at S1+
condition: ownerAtLeast('Mornye', 1)

// Active only at S2+
condition: ownerAtLeast('Mornye', 2)
```

Use this whenever a buff or debuff in a character's kit is unlocked by a specific sequence node — in `Action.damageModifiers`, `Character.damageModifiers`, `CoordinatedAttack.damageModifiers`, etc.

---

### 3.7 Custom inline condition

Write a function `(ctx: StepContext) => number` inline for anything not covered by the helpers above.

```ts
// Example: +15% damage only when character has at least 80 energy
condition: (ctx) => (ctx.current.charactersEnergies[ctx.character.name]?.energy ?? 0) >= 80 ? 1 : 0

// Example: +10% damage that scales linearly with conviction up to 120
condition: (ctx) => Math.min((ctx.current.charactersEnergies['Cartethyia']?.conviction ?? 0) / 120, 1) * 0.1
```

Custom conditions can read anything from `ctx` — current snapshot, character stats, energy values, active modifiers, etc.

---

## 4. StatusModification — Explicit Stack / Duration Changes

`StatusModification` is how an action **directly modifies** the stack count or timer of an existing buff, debuff, or negative status. It is declared on `Action.statusModifications` or `SideEffect.statusModifications`.

Use the helpers from `src/utils/modifications/statusModificationHelpers.ts` — they're just typed wrappers around the raw object.

---

### 4.1 Apply stacks of a NegativeStatus

```ts
import { addNegativeStatusStacks } from '../../utils/modifications/statusModificationHelpers'

// Inline (raw):
statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }]

// Helper equivalent:
statusModifications: [addNegativeStatusStacks('Aero Erosion', 1)]
```

Example — Cartethyia's basic attack applies 1 Aero Erosion stack:
```ts
// src/data/actions/cartethyia.ts
statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }]
```

---

### 4.2 Remove stacks of a NegativeStatus

```ts
import { removeNegativeStatusStacks } from '../../utils/modifications/statusModificationHelpers'

statusModifications: [removeNegativeStatusStacks('Aero Erosion', 1)]
// raw: { type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: -1 }
```

Example — `aeroErosionExplosion` side effect removes 1 Aero Erosion stack after detonating:
```ts
// src/data/sideEffects/sideEffects.ts
export const aeroErosionExplosion: SideEffect = {
  name: 'Aero Erosion Explosion',
  damageDealt: calculateAeroErosionSideEffectDamage,
  statusModifications: [removeNegativeStatusStacks('Aero Erosion', 1)],
}
```

---

### 4.3 Refresh / extend NegativeStatus duration

```ts
import { refreshNegativeStatusDuration, extendNegativeStatusDuration } from '../../utils/modifications/statusModificationHelpers'

// Reset duration to base value:
statusModifications: [refreshNegativeStatusDuration('Aero Erosion')]

// Add 5 seconds to current timer:
statusModifications: [extendNegativeStatusDuration('Aero Erosion', 5)]
```

Note: `refreshDuration` and `durationChange` are only supported for `negativeStatus` type. They are silently ignored for `buff`/`debuff` (a warning is logged).

---

### 4.4 Forcibly remove buff or debuff stacks

Used when an action ends a buff early (e.g. Liberation consuming a forte buff).

```ts
import { removeBuffStacks } from '../../utils/modifications/statusModificationHelpers'

// Remove all stacks of "Mandate" when Liberation is cast:
statusModifications: [removeBuffStacks('Mandate', 999)]
// raw: { type: 'buff', targetName: 'Mandate', stackChange: -999 }
```

The `targetName` here matches the modifier's `displayName` (not `source`).

---

## 5. Side Effects

A `SideEffect` fires alongside the main action's hit and consists of:
1. A `damageDealt` function that produces a `DamageEvent`.
2. `statusModifications` applied that same step.

Side effects are attached to `Action.sideEffects` or injected via `InjectedSideEffect` from gear.

---

### 5.1 Side effect that deals flat NegativeStatus damage

Create a calculator function in `src/utils/calculators/sideEffectCalculators.ts` and reference it:

```ts
// src/utils/calculators/sideEffectCalculators.ts
export function calculateAeroErosionSideEffectDamage(
  context: StepContext,
  sideEffectName: string,
  timeStamp: number
): DamageEvent {
  const stacks = context.prev.negativeStatuses['Aero Erosion'] || 0
  if (stacks === 0) return zeroDamageEvent(...)
  return calculateDamageNegativeStatus(stacks, 'AERO', context.enemy, 'Aero Erosion', ...)
}

// src/data/sideEffects/sideEffects.ts
export const aeroErosionExplosion: SideEffect = {
  name: 'Aero Erosion Explosion',
  damageDealt: calculateAeroErosionSideEffectDamage,
  statusModifications: [removeNegativeStatusStacks('Aero Erosion', 1)],
}

// src/data/actions/cartethyia.ts  (on fleurdelys Basic 1-5)
import { aeroErosionExplosion } from '../sideEffects/sideEffects'
sideEffects: [aeroErosionExplosion],
```

The `damageDealt` function can use the full `ctx`: character stats, active modifiers, previous snapshot, etc.

---

### 5.2 Side effect that only modifies stacks (no damage)

Return a zero-damage event and list status modifications:

```ts
export const noopSideEffect: SideEffect = {
  name: 'Apply Extra Stacks',
  damageDealt: (_ctx, sideEffectName, timeStamp) => ({
    snapshotId: _ctx.snapshotId,
    dealer: sideEffectName,
    target: _ctx.enemy.name,
    elements: [],
    dmgTypes: [],
    scaling: 'FLAT',
    actionName: sideEffectName,
    normalStrike: 0,
    criticalStrike: 0,
    average: 0,
    contributions: {},
    timeStamp,
  }),
  statusModifications: [addNegativeStatusStacks('Spectro Frazzle', 2)],
}
```

---

## 6. Negative Statuses (DoT)

### 6.1 Defining a new NegativeStatus

Add an entry to the `negativeStatuses` record in `src/data/negativeStatuses.ts`:

```ts
export const negativeStatuses: Record<string, NegativeStatus> = {
  aeroErosion: {
    name: 'Aero Erosion',     // matches the targetName used in StatusModification
    duration: 15,              // seconds before stacks expire
    maxStacksDefault: 3,       // default cap (can be raised by NegativeStatusEffect on a modifier)
    frequency: 3,              // seconds between damage ticks
    damage: {                  // stack count → flat damage per tick
      1: 1654,
      2: 4134,
      3: 8268,
      // ...
    },
    element: 'AERO',
    reductionStrategy: {
      stackConsumption: 999,       // how many stacks are consumed per reduction trigger (999 = consume all)
      triggerDmgOnReduction: false, // does reduction trigger a damage tick?
      resetTimerOnApplication: true,// does adding stacks reset the duration timer?
    },
    damageModifiers: [],           // modifiers active while ≥ 1 stack (see §2)
    color: '#4db84d',
  },
}
```

The `name` string is what all `StatusModification.targetName` references must match exactly.

**Reduction strategy flavors:**
| Pattern | stackConsumption | triggerDmgOnReduction | resetTimerOnApplication |
|---------|------------------|-----------------------|------------------------|
| Detonate all at once (Aero Erosion) | `999` | `false` | `true` |
| Peel one stack per trigger (Spectro Frazzle) | `1` | `true` | `false` |

---

### 6.2 Modifying a NegativeStatus's frequency or max stacks via a DamageModifier

Put `negativeStatusEffects` on any `DamageModifier`. These are picked up by the negative status tick processor:

```ts
// Cartethyia's Mandate — makes Aero Erosion tick 50% faster and adds 3 max stack cap
// src/data/actions/cartethyia.ts  (on the Transform action)
{
  source: 'Cartethyia: Mandate',
  displayName: 'Mandate',
  type: 'buff',
  ownerCharacter: 'Cartethyia',
  characterStats: { aeroErosionAmplifyDMG: 0.5 },
  negativeStatusEffects: [
    { targetStatus: 'Aero Erosion', property: 'frequency', value: -0.5 },
    // value: -0.5 means the tick interval is multiplied by (1 + -0.5) = 0.5 → ticks are 2× as fast
  ],
  condition: hasForteGrant('Mandate of Divinity'),
  targetStrategy: 'self',
  durationStrategy: { type: 'limited', timeDuration: 12 },
  stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
  clearsForteGrantsOnExpiry: true,  // when Mandate expires, clear all forte grants
}
```

```ts
// Power of Discord — raises Aero Erosion max stack cap by 3
negativeStatusEffects: [
  { targetStatus: 'Aero Erosion', property: 'maxStacks', value: 3 },
  // value: +3 means maxStacks = maxStacksDefault + 3
],
```

**`property: 'frequency'`** — fractional modifier on tick interval. `-0.5` = twice as fast, `+1.0` = half as fast. Clamped to minimum 10% of base frequency.

**`property: 'maxStacks'`** — integer additive modifier to the status's `maxStacksDefault`. Floored to 0.

---

## 7. Coordinated Attacks

Define in `src/data/coordinatedAttacks/<character>.ts`. Attach to an action via `Action.coordinatedAttacks`.

### 7.1 Standard periodic attack

```ts
// src/data/coordinatedAttacks/ciaccona.ts
export const ciaccona_singers_triple_cadenza_coordinated: CoordinatedAttack = {
  name: 'Singers Triple Cadenza (Coordinated)',
  displayName: 'Singers Triple Cadenza (Coordinated)',
  multiplier: 6.12 / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['LIBERATION'],
  frequency: 1.6,       // seconds between ticks
  duration: 20 * 1.6,   // total lifetime
  swapRequired: true,   // ends when the owner (Ciaccona) comes back on-field
  energyGenerated: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  offtune: 0.22,
}

// src/data/actions/ciaccona.ts  (on Liberation)
coordinatedAttacks: [ciaccona_singers_triple_cadenza_coordinated],
```

Damage scales with the **owner character's** stats (Ciaccona's ATK), not the currently active character's.

---

### 7.2 Swap-required attack (ends when owner comes back on-field)

Set `swapRequired: true` and `duration: Infinity` (or any large value — it ends by swap, not time):

```ts
{
  swapRequired: true,
  duration: Infinity,
  frequency: 2,
  ...
}
```

Ticks continue until the owner character becomes the active character again.

---

### 7.3 Coordinated attack with a linked team buff (aura)

`linkedModifiers` are injected as active modifiers for the entire lifetime of the coordinated attack and removed when it expires or is cancelled:

```ts
{
  name: 'Example Coordinated Attack',
  ...
  linkedModifiers: [
    {
      source: 'ExampleAttack: Team Aura',
      displayName: 'Example Aura',
      type: 'buff',
      ownerCharacter: 'MyCharacter',
      condition: always(),
      characterStats: { aeroBonusDMG: 0.20 },
      targetStrategy: 'all',
      durationStrategy: { type: 'permanent' }, // lifetime managed by the attack, not a timer
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    }
  ],
}
```

Use `durationStrategy: { type: 'permanent' }` for linked modifiers — their lifetime is controlled by the attack, not a timer or swap counter.

**Per-tick modifiers** (`damageModifiers`) are different — they are re-activated on every single tick (useful for resetting a short-lived timed buff every tick).

---

## 8. Energy & Resources

### 8.1 Generate energy on action cast

```ts
energyGenerated: [
  { energyType: 'energy', amount: 10, share: 0.5 },
  { energyType: 'concerto', amount: 5, share: 0 },
]
```

`share` is the fraction of `amount` shared to each ally who also has that energy type.

---

### 8.2 Energy that scales with a stat

```ts
{ energyType: 'energy', amount: 5, share: 0.5, scalingStat: 'energyPercent' }
// effective amount = 5 × character.stats.energyPercent
```

`scalingStat` can be any key of `CharacterStats`.

---

### 8.3 Share energy to allies

```ts
{ energyType: 'energy', amount: 10, share: 0.5 }
// owner gets 10, each ally with 'energy' in maxEnergies gets 10 × 0.5 = 5
```

Allies only receive the shared amount if they have the same energy type in their `maxEnergies`.

---

### 8.4 Consume energy as a cast cost

```ts
energyCost: [{ energyType: 'energy', amount: 125 }]
```

The action is blocked in the UI if the character doesn't have enough energy (the `isUnaffordable` flag in `ActionSelect`).

---

### 8.5 Forte sub-energy and forte grants

Forte sub-energies (`forte_divinity`, `forte_discord`, `forte_virtue`) have `maxEnergies` values of `1` (binary — you either have it or you don't). Consuming one with `grantsOnConsume` adds a named grant:

```ts
// Cartethyia plunge — consumes all available sub-energies and grants matching names
energyCost: [
  { energyType: 'forte_divinity', amount: 1, grantsOnConsume: ['Mandate of Divinity'] },
  { energyType: 'forte_discord',  amount: 1, grantsOnConsume: ['Power of Discord'] },
  { energyType: 'forte_virtue',   amount: 1, grantsOnConsume: ['Heart of Virtue'] },
],
```

`grantsOnConsume` is only triggered if the pre-cost value was > 0. Once added, grant names live in `Snapshot.charactersForteGrants[charName]` and are checked by `hasForteGrant()` conditions.

**Clearing forte grants:** use `clearsForteGrantsOnExpiry: true` on the "anchor" modifier (the one that represents the buff powered by those grants). When it expires or is removed, all forte grants for that character are cleared.

---

### 8.6 Resource milestones — gain modifier stacks when crossing energy thresholds

Defined on `Character.resourceMilestones`. Fires one modifier stack per upward threshold crossing per step.

```ts
// Cartethyia S1 — every 30 conviction grants a 25% critDamage stack (up to 4)
// src/data/characters/cartethyia.ts
resourceMilestones: [
  {
    resourceType: 'conviction',
    milestones: [30, 60, 90, 120],   // fires once each time conviction crosses 30, 60, 90, 120
    modifier: {
      source: 'Cartethyia S1: Conviction Milestone',
      displayName: "Fleurdelys's Conviction",
      type: 'buff',
      ownerCharacter: 'Cartethyia',
      color: '#87ceeb',
      characterStats: { critDamage: 0.25 },
      condition: always(),
      targetStrategy: 'self',
      durationStrategy: { type: 'limited', timeDuration: 15 },
      stackingStrategy: { maxStacks: 4, resetTimerOnApplication: false, stacksRemovedEachTime: 4 },
    },
  },
],
```

The modifier receives one stack per milestone crossed in the same step. The character must have `conviction` in their `maxEnergies`.

---

## 9. Cooldown Reductions

Placed in `Action.cooldownReductions`. Reduces a specific cooldown key when the action is cast.

```ts
// Cartethyia plunge — reduces Resonance Skill CD by 1s per consumed sword
cooldownReductions: [
  { targetActionKey: 'Resonance Skill', amount: totalSwords }
]
// or with a function for dynamic amounts:
cooldownReductions: [
  { targetActionKey: 'Resonance Skill', amount: (ctx) => computeReduction(ctx) }
]
```

`targetActionKey` must match the action's `groupName` (or `name` if no `groupName`). This is the same key used for the cooldown tracking in `charactersCooldowns`.

To reset a cooldown entirely, set `amount` to a very large number (e.g. 9999).

---

## 10. Forms & Form-Specific Intro/Outro

1. Define a `Form` in `src/data/forms/<character>.ts`:

```ts
// src/data/forms/cartethyia.ts
export const form_fleurdelys: Form = {
  name: 'Fleurdelys',
  displayName: 'Fleurdelys',
  introAction: fleurdelys_intro_outro_actions.find(a => a.dmgTypes.includes('INTRO')),
  // outroAction is optional — defaults to character's global OUTRO if absent
}
```

2. Register the form on the `Character`:

```ts
// src/data/characters/cartethyia.ts
defaultForm: 'Cartethyia',
forms: [form_cartethyia, form_fleurdelys],
```

3. Trigger the form change in an action:

```ts
// src/data/actions/cartethyia.ts  (Transform action)
formChange: 'Fleurdelys',
```

4. Restrict actions to specific forms with `requiredForms`:

```ts
castConditions: {
  requiredForms: ['Fleurdelys'],   // only available in Fleurdelys form
  ...
}

castConditions: {
  requiredForms: [],               // never castable (used with customCanCast for complex gating)
}
```

When no `requiredForms` is specified, the action is available in all forms.

---

## 11. Dynamic Variants (`resolveVariant`)

Use `resolveVariant` when the actual `Action` to run must be determined at cast time based on runtime state. It is the primary mechanism for **sequence-gating any action property**, and also handles forte/cooldown-based tier selection.

---

### 11.1 Signature and available context

```ts
resolveVariant(
  prevSnapshot: Snapshot | undefined,  // full snapshot before this action executes
  characterName: string,                // name of the owning character
  owner: ResolveVariantOwner,           // { name, sequence, stats } of the owning character
): Action
```

`owner` gives you the character's current `sequence` level and `stats` directly. `prevSnapshot` gives you energies, cooldowns, forms, and anything else tracked at runtime. Existing implementations that declare only the first one or two parameters continue to work — TypeScript allows functions to ignore trailing parameters.

**Rule:** always set `resolveVariant: undefined` on the returned object so the resolved action is never re-resolved.

---

### 11.2 Sequence-gating any action property

Every field of an `Action` can be branched on `owner.sequence`. Spread `this` as the base and override only what changes:

```ts
const myAction: Action = {
  name: 'My Action',
  castTime: 1.0,
  multiplier: 2.0,
  tags: ['HEAVY_ATTACK'],
  elements: ['FUSION'],
  dmgTypes: ['HEAVY'],
  offtune: 0.5,
  energyGenerated: [{ energyType: 'energy', amount: 10, share: 0.5 }],
  energyCost: [{ energyType: 'forte', amount: 50 }],
  statusModifications: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: { startState: 'GROUND', endState: 'AIR' },
  damageModifiers: [...baseModifiers],
  ...

  resolveVariant(_prevSnapshot, _characterName, owner) {
    // S1: different multiplier and damage modifier
    if (owner.sequence >= 1) {
      return {
        ...this,
        multiplier: 3.0,
        damageModifiers: [...this.damageModifiers, s1ExtraModifier],
        resolveVariant: undefined,
      }
    }
    return { ...this, resolveVariant: undefined }
  },
}
```

**Reference — every overridable property:**

| Property | How to override |
|---|---|
| `name` / `displayName` | `name: 'My Action (S3)'` |
| `tags` | `tags: [...this.tags, 'NEW_TAG']` |
| `elements` / `dmgTypes` | `elements: ['FUSION', 'HAVOC']` |
| `castTime` | `castTime: 0.8` |
| `multiplier` | `multiplier: higherMultiplier` |
| `scaling` | `scaling: 'DEF'` |
| `energyGenerated` | `energyGenerated: [...this.energyGenerated, extraEnergy]` |
| `energyCost` | `energyCost: [{ energyType: 'energy', amount: 150 }]` |
| `statusModifications` | `statusModifications: [...this.statusModifications, addStacks]` |
| `sideEffects` | `sideEffects: [...this.sideEffects, s3SideEffect]` |
| `coordinatedAttacks` | `coordinatedAttacks: [...this.coordinatedAttacks, s3Attack]` |
| `damageModifiers` | `damageModifiers: [...this.damageModifiers, s3Modifier]` |
| `castConditions` | `castConditions: { ...this.castConditions, startState: 'ANY' }` |
| `offtune` | `offtune: 1.5` |
| `cooldown` | `cooldown: 20` |
| `formChange` | `formChange: 'New Form'` |

> **Tip:** spread `this` first, then override only the differing fields. This keeps the base definition as the single source of truth and avoids duplicating unchanged values.

**Multi-sequence branching example (Mornye's Mode: Heavy Attack):**

```ts
const mode_mornye_heavy: Action = {
  // Base (no sequence nodes)
  name: 'Mode: Heavy Attack',
  multiplier: 2.5846,
  damageModifiers: [],               // Interfered Marker — only at S1+
  energyCost: [{ energyType: 'relative_momentum', amount: 100 }],
  offtune: 1.04,
  castConditions: { startState: 'AIR', endState: 'AIR', requiredForms: ['Wide Field Observation Mode'] },
  ...

  resolveVariant(_prevSnapshot, _characterName, owner) {
    let overrides: Partial<Action> = {}

    // S1: add Interfered Marker damage bonus modifier
    if (owner.sequence >= 1) {
      overrides.damageModifiers = [
        ...this.damageModifiers,
        interferedMarkerModifier,    // { condition: ownerAtLeast('Mornye', 1), ... }
      ]
    }

    // S2: also add Interfered Marker crit damage modifier
    if (owner.sequence >= 2) {
      overrides.damageModifiers = [
        ...(overrides.damageModifiers ?? this.damageModifiers),
        interferedMarkerS2Modifier,  // { condition: ownerAtLeast('Mornye', 2), ... }
      ]
    }

    return { ...this, ...overrides, resolveVariant: undefined }
  },
}
```

> **Modifier conditions vs. resolveVariant:** for modifiers that are *always present in the action* but only *apply* at a certain sequence level, keep them in `damageModifiers` and gate them with `condition: ownerAtLeast('Mornye', 2)` (see §3.6). Use `resolveVariant` when the modifier should not exist at all below that sequence level, or when other action fields (multiplier, cast time, energy) also change.

---

### 11.3 Runtime-state variants (forte, cooldowns)

`resolveVariant` also handles any runtime state beyond sequence — forte sub-energies, cooldowns, snapshot fields, etc.

```ts
// Cartethyia plunge — picks the correct tier based on how many sub-energies are available
// src/data/actions/cartethyia.ts
const cartethyia_plunge: Action = {
  ...
  resolveVariant(prevSnapshot, characterName) {
    const energies = prevSnapshot?.charactersEnergies[characterName]
    const total = ['forte_divinity', 'forte_discord', 'forte_virtue']
      .filter(k => (energies?.[k as EnergyType] ?? 0) > 0).length

    const base = total >= 3 ? cartethyiaPlunge_3
                : total >= 2 ? cartethyia_plunge_2
                : cartethyia_plunge_1

    const energyCost = []
    if (energies?.forte_divinity) energyCost.push({ energyType: 'forte_divinity', amount: 1, grantsOnConsume: ['Mandate of Divinity'] })
    // ... etc.

    return { ...base, energyCost, name: this.name, groupName: this.groupName, castConditions: this.castConditions }
  },
}

// Ciaccona "Wait Until Next Swap Is Available" — castTime equals remaining swap cooldown
const ciaccona_wait_for_swap: Action = {
  castTime: 0, // placeholder, resolved below
  ...
  resolveVariant(prevSnapshot) {
    const cooldowns = prevSnapshot?.charactersSwapCooldownUntil ?? {}
    const toTime = prevSnapshot?.toTime ?? 0
    const remaining = Object.values(cooldowns).map(u => u - toTime).filter(r => r > 0)
    const castTime = remaining.length > 0 ? Math.min(...remaining) : 0
    return { ...this, castTime, resolveVariant: undefined }
  },
}
```

All three parameters can be combined freely — the same `resolveVariant` can branch on `owner.sequence`, `prevSnapshot` energies, and `characterName` simultaneously.

---

## 12. Combo & Sequencing Mechanics

### 12.1 `previousActions` — must immediately follow another action

```ts
castConditions: {
  previousActions: [cartethyia_skill],  // can only be cast if the previous personal action was Resonance Skill
  ...
}
```

Only the character's **own** last action matters. Other characters acting in between do not break this — only swapping back in outside the persistence window would lose the `lastAction` state.

---

### 12.2 `attemptFollowUp` — forces the next action

```ts
// Action A forces the next cast to be Action B (all others are locked)
const actionA: Action = {
  ...
  attemptFollowUp: { actionName: 'Action B' },
}
```

When Action A is cast, `Snapshot.charactersattemptFollowUp[char] = 'Action B'`. In the next row, only Action B is selectable for that character. Action B must also be off cooldown before Action A completes (validated as `isFollowUpNotReady`).

---

### 12.3 `comboWindow` — must be cast within a time window

```ts
const actionB: Action = {
  ...
  castConditions: {
    comboWindow: {
      previousActions: [actionA],
      maxTimeSincePrevious: 3,       // must be cast within 3 seconds
      timerStartsAt: 'afterCast',    // timer starts when Action A finishes
      crashesOnSwap: true,           // swapping away resets the window
      crashesOnFormChange: false,    // form changes are allowed mid-window
    },
  },
}
```

The window tracks the last cast time of any `previousActions` per character. If the gap exceeds `maxTimeSincePrevious` (or swap/form-change conditions are violated), `isComboWindowExpired` blocks the action.

`timerStartsAt: 'cast'` starts counting from when Action A began; `'afterCast'` starts from when Action A ended.

---

## 13. Gear: Injecting Modifiers and Side Effects

`InjectedModifier` and `InjectedSideEffect` defined on gear are applied at startup by `resolveGear` / `resolveCharacter`. They let gear add effects to specific targets without modifying the action files directly.

### 13.1 Weapon injecting a modifier onto the character

```ts
// Defier's Thorn — always-active defIgnore onto Cartethyia herself
// src/data/gear/cartethyia.ts
const cartethyia_weapon: Weapon = {
  injectedModifiers: [
    {
      targets: ['character'],   // 'character' = inject into Character.damageModifiers
      modifiers: [
        {
          source: "Defier's Thorn",
          displayName: 'A Free Knight\'s Tarantella (1)',
          condition: always(),
          characterStats: { defIgnore: 0.08 },
          targetStrategy: 'self',
          durationStrategy: { type: 'permanent' },
          ...
        }
      ]
    }
  ],
}
```

---

### 13.2 Weapon injecting a modifier onto a specific action

```ts
// Static Mist — injects a nextSwap buff onto Ciaccona's Outro action
// src/data/gear/ciaccona.ts
{
  targets: [ciaccona_outro],   // must be the actual Action object reference
  modifiers: [
    {
      targetStrategy: 'nextSwap',
      durationStrategy: { type: 'limited', timeDuration: 14, numberOfSwaps: 1 },
      ...
    }
  ]
}
```

The `targets` array accepts `'character'`, `Action` objects, or `CoordinatedAttack` objects. When targeting an action, the modifier is added to `action.damageModifiers` at startup.

---

### 13.3 Echo set bonus injecting a timed buff onto multiple actions

```ts
// Ciaccona set bonus — refreshable 20s aero buff activated by multiple actions
// src/data/gear/ciaccona.ts
const ciaccona_set_bonus: EchoSetBonus = {
  injectedModifiers: [
    {
      targets: [
        ciaccona_BA_3_4_cancel_with_skill,
        ciaccona_BA_3_4_cancel_with_swap,
        ciaccona_skill,
        ciaccona_singers_triple_cadenza_coordinated,  // also works on CoordinatedAttack
        // ...
      ],
      modifiers: [
        {
          source: 'Ciaccona',
          displayName: 'Windward Pilgrimage (Team Buff)',
          condition: always(),
          characterStats: { aeroBonusDMG: 0.15 },
          targetStrategy: 'all',
          durationStrategy: { type: 'limited', timeDuration: 20 },
          stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
          ...
        }
      ]
    }
  ]
}
```

Each action in `targets` gets the modifier injected into its `.damageModifiers` array, so casting any of them activates/refreshes the buff.

---

### 13.4 Echo injecting a side effect onto a specific action

```ts
// Nightmare: Kelpie — injects an extra side effect onto Ciaccona's Outro
// src/data/gear/ciaccona.ts
const ciaccona_cost_4_echo_1: Echo = {
  injectedSideEffects: [
    {
      targets: [ciaccona_outro],
      sideEffects: [nightmareKelpieOutroTrigger],
    }
  ]
}
```

The side effect is appended to `ciaccona_outro.sideEffects` at startup (via `resolveGear`), so it fires every time the Outro is cast while this echo is equipped.

---

## 14. Cast Conditions Reference

Complete list of `castConditions` fields and when to use each:

| Field | Type | Use when… |
|-------|------|-----------|
| `startState` | `'GROUND' \| 'AIR' \| 'ANY'` | Action requires a specific position. `ANY` never blocks. |
| `endState` | `'GROUND' \| 'AIR' \| 'PRESERVE'` | Where the character ends up. `PRESERVE` keeps current position. |
| `swapOutState` | `'GROUND' \| 'AIR' \| 'PRESERVE'` | Position after being swapped out mid-action (swap-cancel variants only). |
| `persistenceTime` | `number` | Seconds after swap-out where the character's stored position/lastAction is preserved. Required for swap-cancel variants so the combos work correctly when swapping back. |
| `requiresSwapIn` | `boolean` | Action can only be cast if the character just swapped in (or last action was Intro). Use for "after intro" actions. |
| `requiresSwapOut` | `boolean` | Character must swap out after this action. Blocks if no other character is available. Use for swap-cancel variants. |
| `previousActions` | `Action[]` | Character's immediately prior personal action must be one of these. Use for strict combos (e.g. skill → follow-up). |
| `requiredForms` | `string[]` | Action only available in listed forms. `[]` = never castable. Omit for "any form". |
| `customCanCast` | `(prevSnapshot, charName) => boolean` | Complex blocking logic. Use when none of the declarative fields are enough. |
| `comboWindow` | object | Action must be cast within a time window after a combo starter. |

**Swap-cancel pattern:** every swap-cancel variant needs `requiresSwapOut: true`, a `swapOutState`, and a `persistenceTime`. The `persistenceTime` allows follow-up actions (after swapping back) to read the character's pre-swap position and last action state.

---

## 15. Adding a Completely New Character — Checklist

1. **Stats** — create `src/data/stats/<character>.ts` with `characterStats` and `inherentStats`.

2. **Actions** — create `src/data/actions/<character>.ts`.
   - Start from `src/data/actions/blueprint.ts`.
   - Define Intro (dmgType `INTRO`), Outro (dmgType `OUTRO`), all normal actions.
   - Add swap-cancel variants for any action that benefits from it.
   - Add `resolveVariant` for dynamic tier/variant selection.

3. **Coordinated attacks** (if any) — create `src/data/coordinatedAttacks/<character>.ts`. Reference from action's `coordinatedAttacks` array.

4. **Side effects** (if any) — add to `src/data/sideEffects/sideEffects.ts`. Add calculator to `src/utils/calculators/sideEffectCalculators.ts`.

5. **Forms** (if any) — create `src/data/forms/<character>.ts`.

6. **Gear** — create `src/data/gear/<character>.ts` with weapon, echo slots, and set bonus.

7. **Character** — create `src/data/characters/<character>.ts`.
   - Set `maxEnergies` for every energy type the character uses.
   - Set `Character.damageModifiers` for passive permanent modifiers.
   - Set `resourceMilestones` if energy thresholds unlock buffs.
   - Set `forms` and `defaultForm` if the character has forms.
   - Assign `gear`.

8. **Register** — add to the array in `src/data/characters.ts`.

9. **Verify** — the system calls `verifyData.ts` at startup to validate action cast conditions and energy keys. Any mismatches will surface as console errors.
