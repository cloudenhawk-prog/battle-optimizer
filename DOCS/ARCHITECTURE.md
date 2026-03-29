# Battle Optimizer — Architecture Overview

> **LLM context document.** Concise overview of what this project does and how it works.  
> For deeper detail: [ROTATION_FLOW.md](ROTATION_FLOW.md) | [EFFECTS_GUIDE.md](EFFECTS_GUIDE.md)  
> For a file-by-file index: [CODEBASE_MAP.md](CODEBASE_MAP.md)

---

## What This Project Is

A **Wuthering Waves DPS rotation optimizer**. The user assembles a sequence of character actions into a rotation table. As each action is added, the tool calculates damage, tracks buffs/debuffs/energy/cooldowns, and shows running state across the whole team. The output is a table where every row is one action, and columns show cumulative damage, DPS, energies, active statuses, and cooldowns.

---

## Static vs Runtime Data

**Static (startup, never mutates mid-calculation):**
- `Character` definitions in `src/data/characters/` with actions, base stats, gear, modifiers.
- At app start, `resolveCharacter()` merges weapon + echo + set-bonus stats into `character.stats` and injects gear modifiers. This produces `ResolvedCharacter` — the only type used by the runtime.
- `Enemy` in `src/data/enemies.ts`. Currently one enemy at a time.
- `NegativeStatus` definitions in `src/data/negativeStatuses.ts`. All statuses are always tracked; inactive ones simply have 0 stacks.

**Runtime state (updated per action):**
- `Snapshot[]` — the table. One Snapshot per row. Snapshots are immutable once committed; adding/changing an action at row N recalculates from row N onward.
- `modifiersInAction` (ref) — active limited buffs/debuffs.
- `negativeStatusesInAction` (ref) — all negative statuses with current stacks/timers.
- `coordinatedAttacksInAction` (ref) — active coordinated attack windows.

---

## Core Data Types

| Type | File | Purpose |
|---|---|---|
| `Character` / `ResolvedCharacter` | `types/character.ts` | Character definition. `ResolvedCharacter` has fully merged stats. |
| `Action` | `types/action.ts` | One castable action: multiplier, element, dmgType, energyCost, modifiers, sideEffects, castConditions. |
| `Snapshot` | `types/snapshot.ts` | Full battle state at the end of one action row: time, damage, energies, buff stacks, cooldowns, positions, forms. |
| `StepContext` | `types/stepContext.ts` | Scratchpad assembled per action resolve. Holds current+prev Snapshot, active modifier lists, aggregated stats. Discarded after resolving. |
| `DamageModifier` | `types/modifiers.ts` | A buff or debuff. Has `targetStrategy`, `durationStrategy`, `stackingStrategy`, a `condition(ctx)` function, and `characterStats`/`enemyStats` deltas. |
| `ModifierInAction` | `types/modifiers.ts` | Runtime wrapper around a `DamageModifier`: tracks `timeLeft`, `swapsLeft`, `currentStacks`. |
| `NegativeStatus` | `types/negativeStatus.ts` | Enemy status effect (erosion, frazzle, etc.). Fixed damage-per-stack table, element-typed. |
| `CoordinatedAttack` | `types/coordinatedAttack.ts` | Periodic off-field damage that scales with owner stats and benefits from the full modifier pipeline. |
| `SideEffect` | `types/sideEffect.ts` | Extra damage or status changes fired alongside the main action. |
| `CharacterStats` | `types/stats.ts` | Full stat block: ATK/HP/DEF, crit, per-element bonuses, per-dmgType bonuses, amplifications, total multipliers. |
| `DamageEvent` | `types/events.ts` | One resolved damage hit: dealer, target, amounts (normal/crit/average), per-modifier contributions. |
| `Gear` | `types/gear.ts` | Weapon + 5 echo slots + set bonus. Each piece can inject stats, modifiers, sideEffects, and an echo skill action. |
| `Form` | `types/form.ts` | Named character state (e.g. "sword" vs "no sword"). Forms can have custom intro/outro actions. |
| `TableConfig` | `types/tableDefinitions.ts` | Column layout for the UI: basic columns, per-character energy columns, buff/debuff/negativeStatus columns. |

---

## The Resolver Pipeline

When an action is selected on a row, `handleActionSelect` in `useCharacterActions` calls these resolvers in order, each mutating `StepContext`. They're all in `src/utils/hooks/resolvers.ts`.

```
R0  buildStepContext       — Assemble ctx from prev snapshot + character + action + active state
R1  resolveTime            — Set fromTime / toTime on current snapshot
R2  resolveDamageModifiers — Collect, activate, filter, and aggregate all modifier stats
R3  resolveDamage          — Calculate main action damage, emit DamageEvent
R4  resolveSideEffectsAndStatuses — Side effect damage + negative status ticks + buff/debuff stack mutations
R4.5 resolveCoordinatedAttacks   — Tick active coordinated attacks, emit DamageEvents
R5  resolveModifierState   — Advance modifier timers; expire stale modifiers; write stacks to snapshot
R6  resolveResourceMilestones    — Fire modifier stacks when a resource crosses defined thresholds
R7  resolveResources       — Subtract energy costs, add energy generation, propagate concerto to allies
R8  resolveCooldowns       — Set action cooldown; reduce cooldowns on cooldown-reduction actions
R9  resolveCastState       — Write position, persistence, form, swap-out flag, required follow-up to snapshot
```

A special pre-step fires before R0 when a **character swap** is detected: Outro and Intro actions are auto-inserted (2 hidden rows run through the full pipeline).

---

## Damage Formula

```
finalATK = (baseATK + flatATK) * (1 + bonusATK) * amplifyATK * totalMultiplierATK
baseDmg  = actionMultiplier * finalATK        (or HP/DEF depending on scaling)

bonusMultiplier  = 1 + bonusDMG + dmgType_bonus + element_bonus   (additive)
amplifyMultiplier = 1 + amplifyDMG + dmgType_amplify + ...        (additive)
totalMultiplier   = totalMultiplierDMG * dmgType_total * ...      (multiplicative)
resistMult        = (1 - elementalRes) * (1 + resistancePEN) * (1 - defIgnore_factor)
critMultiplier    = 1 + critRate * (critDamage - 1)               (average)

average = baseDmg * bonusMultiplier * amplifyMultiplier * totalMultiplier * resistMult * critMultiplier
```

Implemented in `src/utils/calculators/damageCalculator.ts`.

---

## Systems Overview

### Modifier System
Every buff and debuff is a `DamageModifier`. There are two lifetimes:
- **Permanent** — always active while the character is the caster or the condition returns > 0.
- **Limited** — tracked as `ModifierInAction` with `timeLeft` (seconds) and/or `swapsLeft`.

`targetStrategy` controls who the modifier applies to: `'self'` | `'active'` | `'all'` | `'nextSwap'` | `'activeAlly'`.  
`condition(ctx)` is a multiplier — return `0` to suppress, `1` for full, any value to scale.  
`stackingStrategy` defines max stacks, whether to reset timer on re-application, and stacks removed per consumption.

See `src/utils/hooks/modifierHelpers.ts` for collect / activate / filter / aggregate logic.

### Negative Status System
Statuses (e.g. Aero Erosion, Spectro Frazzle) are applied via `statusModifications` on actions. They tick between `fromTime` and `toTime` at their `frequency` interval. Damage per tick comes from a stack-indexed table. They have a `ReductionStrategy` controlling how many stacks are removed per tick and whether damage fires on reduction.  
All statuses are initialized at launch (0 stacks) in `useCharacterActions` from `src/data/negativeStatuses.ts`.

### Coordinated Attack System
Triggered by an action that declares a `CoordinatedAttack`. Two modes:
- **Duration-based** — ticks every `frequency` seconds for `duration` seconds.
- **Swap-required** — persists until the owner character becomes the active character again.

Each tick runs through the damage calculator using the owner's stats + current modifier context. Coordinated attacks can also carry `linkedModifiers` that live exactly as long as the attack itself.

### Energy & Resource System
Every character has `maxEnergies` keyed by `EnergyType` (`energy`, `forte`, `concerto`, `conviction`, etc.).  
Actions declare `energyGenerated` (with a `share` amount shared to allies) and `energyCost`.  
`concerto` is team-global — tracked per-character but shared from the field character to allies proportionally.  
`ResourceMilestoneDef` on a character fires modifier stacks each time a resource crosses a threshold.

### Forms
A character can have named forms (e.g. Cartethyia's sword/no-sword states). `formChange` on an action switches the current form. Forms can override the intro/outro action used on swap.

### Gear Resolution (Startup)
`resolveCharacter()` in `src/utils/gear/resolveCharacter.ts`:
1. Merges base + inherent + weapon + echo + set-bonus stats.
2. Replaces the placeholder `ECHO` dmgType action with the slot-1 echo skill.
3. Injects weapon/echo/set-bonus `injectedModifiers` and `injectedSideEffects`.
4. Flattens permanent self/always modifiers directly into `character.stats` (stored in `flattenedPassiveModifiers` for breakdown reference).

### Cast Conditions
`Action.castConditions` defines when an action is available:
- `startState` / `endState` — required GROUND/AIR position.
- `requiresSwapIn` — action only available if character just swapped in.
- `requiresSwapOut` — character must swap out after casting.
- `requiredForms` — forms in which the action is available (empty = never).
- `persistenceTime` — how long a position is preserved after swap-out (for combo chaining).
- `customCanCast(ctx)` — arbitrary function for complex conditions.
- `resolveVariant(prevSnapshot)` — picks the correct action variant at runtime (e.g. plunge tier).

---

## UI Layer Overview

```
RotationEditorPage
├── Topbar                     — Column visibility toggles
├── RotationEditor             — Root editor component
│   ├── RotationTable          — The main table, row-per-action
│   │   ├── HeaderRow          — Column headers
│   │   ├── BodyRows           — All snapshot rows
│   │   │   ├── CurrentStateRow   — Active (blank) row for next input
│   │   │   └── CharacterStateTracker — Per-character state badges
│   │   ├── CharacterSelect    — Character picker per row
│   │   └── ActionSelect       — Action picker per row (filtered by cast conditions)
│   └── DataOverlay            — Click a row → per-modifier damage contribution breakdown
└── DamageTimeline             — Chart of damage events over time
```

`useRotationEditor` (hook) → `useSnapshots` (state) + `useCharacterActions` (event handlers).  
`useCharacterActions` owns the refs (`modifiersInAction`, `negativeStatusesInAction`, `coordinatedAttacksInAction`) and runs the resolver pipeline on every `handleActionSelect` call.

---

## Adding a New Character

1. Copy `src/data/characters/blueprint.ts` → e.g. `src/data/characters/myChar.ts`.
2. Define `stats`, `inherentStats`, `actions`, `damageModifiers`, and `gear`.
3. Add the character to the `characters` array in `src/data/characters.ts`.
4. Add gear files under `src/data/gear/myChar.ts` if needed.
5. Add stat column definition in `src/data/stats/myChar.ts`.

See `EFFECTS_GUIDE.md` for implementation patterns for every system.
