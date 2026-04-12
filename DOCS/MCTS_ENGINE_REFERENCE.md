# MCTS Engine Reference

This document describes the parts of the codebase relevant to implementing a Monte Carlo Tree Search optimizer over battle rotations. All engine functions referenced here are pure (no React, no side effects outside their return values) and can be called freely inside a search loop.

---

## Overview

The simulation engine advances a battle state one user-selected action at a time. An MCTS implementation will:

1. **Expand** — call `getAvailableActions()` to get the legal moves at the current node.
2. **Select** — choose one action (UCB, random rollout, etc.).
3. **Simulate** — call `engineStep()` to advance the state.
4. **Score** — read `snapshots[last].dps` (or `snapshots[last].damage`) from the result.
5. **Backpropagate** — update node statistics as usual.

All state needed between steps is carried in two objects: `Snapshot[]` and `EngineState`. Neither contains React refs or closures.

---

## Core Types

### `Snapshot` — `src/types/snapshot.ts`

The full game state at a point in time. Each call to `engineStep()` may append one or more rows to the snapshot array. The last row is always a blank "next step" placeholder.

Key fields relevant to MCTS:

| Field | Meaning |
|---|---|
| `damage` | Cumulative damage dealt up to and including this row |
| `dps` | `damage / toTime` — the primary optimization target |
| `toTime` | Absolute time (seconds) at end of this row |
| `fromTime` | Absolute time at start of this row |
| `charactersEnergies` | `Record<charName, Record<EnergyType, number>>` — current energy values |
| `charactersCooldowns` | `Record<charName, Record<cooldownKey, number>>` — seconds remaining per action cooldown |
| `charactersActionStacks` | `Record<charName, Record<cooldownKey, number>>` — remaining stacks for stacked actions |
| `charactersPositions` | `Record<charName, 'GROUND' \| 'AIR'>` |
| `charactersForms` | `Record<charName, string>` — active form name (empty string = default) |
| `charactersAttemptFollowUp` | `Record<charName, { actionName, must }>` — pending must-chain lock (see below) |
| `buffs/debuffs` | Active modifier stacks and their time/swap counters |
| `negativeStatuses` | Active negative status stacks (Frostburn, Glacio Chafe, etc.) |
| `coordinatedAttacks` | Active coordinated attack registrations |

**Reading the score:**
```ts
const last = snapshots[snapshots.length - 2] // last resolved row (not the blank tail)
const score = last.dps
```

> The last element in `snapshots` is always a blank placeholder row appended after each resolved step. When scoring, use `snapshots.length - 2` to reach the most recently resolved row, or walk backwards to the last row with `damage > 0`.

---

### `EngineState` — `src/utils/engine/step.ts`

Holds the cross-step mutable simulation state that lives _outside_ individual snapshots. It must be threaded through every call to `engineStep()`.

```ts
type EngineState = {
  negativeStatusesInAction: NegativeStatusInAction[]
  modifiersInAction: ModifierInAction[]
  coordinatedAttacksInAction: CoordinatedAttackInAction[]
}
```

- **`negativeStatusesInAction`**: Runtime state for every negative status (Frostburn, Chafe, etc.) — tracks application time, stacks, last damage time.
- **`modifiersInAction`**: Active buff/debuff modifier instances currently ticking. Grow and shrink as the simulation progresses.
- **`coordinatedAttacksInAction`**: Active coordinated-attack fields (periodic ticks fired off-turn).

**Initializing:**
```ts
import { initEngineState } from './src/utils/engine/step'

const engineState = initEngineState()
```

Call `initEngineState()` once per rollout. Never reuse an `EngineState` from a parent node — always copy via the returned value from `engineStep()`.

**Threading:**
`engineStep()` does not mutate its input. It returns a new `EngineState` in `result.engineState`. Always use that for the next step.

---

## Engine API

### `engineStep` — `src/utils/engine/step.ts`

```ts
function engineStep(params: EngineStepParams): EngineStepResult
```

**Params:**

| Param | Type | Description |
|---|---|---|
| `snapshots` | `Snapshot[]` | Current snapshot array |
| `snapshotId` | `number` | Index of the row being filled (usually `snapshots.length - 1`) |
| `actionName` | `string` | `action.name` of the chosen action |
| `engineState` | `EngineState` | Current engine state |
| `charactersMap` | `Record<string, ResolvedCharacter>` | Name → resolved character map |
| `characterColumnsMap` | `Record<string, string[]>` | Name → column list (for snapshot table structure) |
| `globalColumns` | `GlobalColumns` | Global column list |
| `enemy` | `Enemy` | The enemy being fought |
| `autocastFollowUps?` | `boolean` | Default `true`. When true, MUST follow-ups are auto-resolved. |

**Returns `EngineStepResult`:**

```ts
type EngineStepResult = {
  snapshots: Snapshot[]       // Updated snapshot array (new rows appended as needed)
  damageEvents: DamageEvent[] // All damage events produced this step (for logging/attribution)
  engineState: EngineState    // Updated engine state — pass to the next call
}
```

**What `engineStep` handles automatically:**

1. **Outro/Intro on swap** — If the previous character had concerto = 100 and the character in `snapshotId` is different, `engineStep` inserts Outro and Intro rows before the user-selected action. `snapshotId` advances by 2 internally. The caller does **not** need to handle this.
2. **MUST follow-up chains** — After the selected action, `autocastFollowUpChain` walks the `attemptFollowUp` chain. Actions with `must: true` are always auto-cast. Actions with `must: false` are cast only if they are valid in the current state.
3. **Full resolver pipeline** — `resolveTime`, `resolveDamageModifiers`, `resolveDamage`, `resolveSideEffectsAndStatuses`, `resolveCoordinatedAttacks`, `resolveResources`, `resolveResourceMilestones`, `resolveOffFieldTriggers`, `resolveModifierState`, `resolveCooldowns`, `resolveCastState` — all run inside.

**Typical usage in a rollout:**

```ts
let { snapshots, engineState } = initRollout(characters, enemy)

for (const actionName of chosenActions) {
  const snapshotId = snapshots.length - 1
  const result = engineStep({ snapshots, snapshotId, actionName, engineState, ...staticArgs })
  snapshots = result.snapshots
  engineState = result.engineState
}

const score = snapshots[snapshots.length - 2].dps
```

---

### `getAvailableActions` — `src/utils/engine/choices.ts`

```ts
function getAvailableActions(snapshot: Snapshot, character: ResolvedCharacter): Action[]
```

Returns the legal actions for `character` given the current `snapshot` state.

**What is filtered out:**

- INTRO and OUTRO actions (auto-triggered by the engine, never a user choice)
- Actions on cooldown (for stacked actions: filtered only when stacks = 0)
- Actions whose energy cost is unaffordable
- Actions whose `startState` (position) does not match the character's current position
- Actions whose `requiredForms` does not include the character's current form

**Must-chain lock:**
If `snapshot.charactersAttemptFollowUp[charName].must === true`, the function returns only that one locked action. All other choices are blocked until the chain resolves.

**What is NOT evaluated:**
`customCanCast` — this field encodes runtime conditions that may depend on UI or other context. If needed, filter the returned array further:

```ts
const actions = getAvailableActions(snapshot, character).filter(a =>
  !a.castConditions.customCanCast || a.castConditions.customCanCast(snapshot, character.name)
)
```

---

### `initEngineState` — `src/utils/engine/step.ts`

```ts
function initEngineState(): EngineState
```

Creates a fresh `EngineState` seeded from the global `negativeStatusesData` definitions. Call once per rollout.

---

### `updateSnapshotsWithAction` — `src/utils/engine/step.ts`

Lower-level function used internally by `engineStep`. Runs the full resolver chain for exactly one action row. Use `engineStep` instead unless you need manual control over Outro/Intro and follow-ups.

---

### `shouldTriggerOutroIntro` / `handleOutroIntroFlow` — `src/utils/engine/step.ts`

Used internally by `engineStep`. Exported for completeness. You do not need to call these directly.

---

## Characters and Enemies

### `ResolvedCharacter` — `src/types/character.ts`

The character type used by all engine functions. Resolution bakes gear contributions (stats, injected modifiers, echo skill) into the character object so no per-step gear math is needed.

**Pre-resolved global characters:**
```ts
// src/data/characters.ts
export const characters: ResolvedCharacter[]
export const baseCharacters: Character[]
```

`characters` is the array to use as `charactersMap` input — they are resolved at module load time. To build `charactersMap`:

```ts
const charactersMap = Object.fromEntries(characters.map(c => [c.name, c]))
```

**Re-resolving after a gear change:**
```ts
import { resolveCharacter } from './src/utils/gear/resolveCharacter'
const updated = resolveCharacter(baseCharacters[i], newGear)
```

Do **not** call `resolveCharacter()` inside the MCTS loop. Resolve characters once before the search starts and reuse the resolved objects for the entire search.

### `Enemy` — `src/data/enemies.ts`

```ts
export const enemies: Enemy[]
```

Pick one enemy and pass it to every `engineStep` call. Enemy stats (resistances, HP, etc.) do not change during a simulation.

---

## `characterColumnsMap` and `globalColumns`

These are structural params required by snapshot creation (they define which columns exist in the simulation table). They do **not** change per step.

For MCTS you need to build these from the character set being simulated. In the rotation editor they come from `tableConfig`. For a standalone MCTS rollout, derive them like this:

```ts
// Build from the same characters you pass to engineStep
const characterColumnsMap: Record<string, string[]> = Object.fromEntries(
  characters.map(c => [c.name, c.actions.map(a => a.name)])
)
const globalColumns: GlobalColumns = { /* see tableDefinitions.ts */ }
```

Look at how `useTableConfig` (in the rotation editor hooks) builds these for reference — the shape is a flat list of action name strings per character plus a global column set for shared columns (buffs, debuffs, coordinated attacks, etc.).

---

## Key Mechanics to Keep in Mind

### Character Swap and Outro/Intro

When the MCTS picks an action for a different character than the last one, and the previous character had concerto = 100, the engine automatically inserts an Outro + Intro row pair. This costs time and can produce buff side effects. The engine handles this entirely — from the MCTS perspective, just picking a different character triggers it.

The snapshotId advances by 2 internally when this happens, so the snapshot array grows by 2 extra rows for that step.

### Must-Chain Follow-Ups (`attemptFollowUp`)

Some actions declare a follow-up:

```ts
attemptFollowUp?: {
  actionName: string
  must?: boolean
}
```

- `must: true` — The parent action is only castable when the entire chain can be satisfied. After casting, the follow-up is auto-resolved in the same `engineStep` call (the engine appends extra rows). `getAvailableActions` returns only the locked follow-up action in this state.
- `must: false` (or omitted) — The engine _attempts_ the follow-up only if it is currently castable. If not, simulation continues normally without it.

`autocastFollowUps: false` skips the chain entirely. Leave it `true` for normal simulation.

### Stacked Actions (Charges)

Actions with `maxStacks > 1` use a charge system. The cooldown tracks stack regeneration, not a use-block. An action is castable as long as `stacks > 0`. `getAvailableActions` already handles this correctly.

### Forms

Characters can have multiple forms (e.g. different combat stances). The active form is tracked in `snapshot.charactersForms[charName]`. Actions with `requiredForms` can only be cast in those forms. `getAvailableActions` respects this.

### `customCanCast`

Some actions have a `customCanCast: (prevSnapshot, characterName) => boolean` function. These encode conditions too complex for the type system (e.g. checking if a specific buff is active). `getAvailableActions` does **not** evaluate this. Post-filter if needed (see above).

---

## Resolver Pipeline (for reference)

All defined in `src/utils/hooks/resolvers.ts`. Called inside `updateSnapshotsWithAction` in this order:

| Resolver | What it does |
|---|---|
| `buildStepContext` | Creates the per-step scratch pad (`StepContext`) from current state |
| `resolveTime` | Sets `fromTime` / `toTime` for the row |
| `resolveDamageModifiers` | Aggregates active buff/debuff stat contributions |
| `resolveDamage` | Calls `calculateDamage()` and records damage events |
| `resolveSideEffectsAndStatuses` | Applies buffs, debuffs, negative statuses, heals |
| `resolveCoordinatedAttacks` | Fires periodic coordinated attack ticks |
| `resolveResources` | Updates energy values |
| `resolveResourceMilestones` | Fires milestone effects (e.g. energy overflow triggers) |
| `resolveOffFieldTriggers` | Fires duration-threshold off-field effects |
| `resolveModifierState` | Ticks modifier durations, removes expired modifiers |
| `resolveCooldowns` | Ticks cooldown timers, regenerates stacks |
| `resolveCastState` | Updates positions, forms, swap state, follow-up registration |

---

## Scoring

The primary optimization target is `snapshot.dps`:

```ts
dps = snapshot.damage / snapshot.toTime
```

`snapshot.damage` is cumulative across all rows up to and including that snapshot. It includes all damage from basic attacks, skills, liberations, echo skills, coordinated attacks, negative status ticks, and side effect procs.

For a fixed-time budget rollout (e.g. simulate N seconds), you may prefer to maximize `snapshots[last].damage` directly.

---

## File Index

| File | Purpose |
|---|---|
| `src/utils/engine/step.ts` | `EngineState`, `initEngineState`, `engineStep`, `updateSnapshotsWithAction`, `shouldTriggerOutroIntro`, `handleOutroIntroFlow`, `autocastFollowUpChain` |
| `src/utils/engine/choices.ts` | `getAvailableActions` |
| `src/types/snapshot.ts` | `Snapshot` type — full game state |
| `src/types/stepContext.ts` | `StepContext` — per-step scratch pad used by all resolvers |
| `src/utils/hooks/resolvers.ts` | All resolver functions |
| `src/utils/conditions/mustChainValidator.ts` | `isActionCastableInState`, `isFollowUpCastableNow`, `validateMustChain` |
| `src/utils/calculators/damageCalculator.ts` | `calculateDamage`, `evaluateDamageWithGroups` |
| `src/utils/gear/resolveCharacter.ts` | `resolveCharacter` — bakes gear into a character once |
| `src/data/characters.ts` | `characters` (pre-resolved), `baseCharacters` (raw) |
| `src/data/enemies.ts` | Enemy definitions |
| `src/data/negativeStatuses.ts` | Negative status definitions (used by `initEngineState`) |
| `src/types/action.ts` | `Action`, `CastConditions`, `ActionTag` — action blueprint type |
| `src/types/character.ts` | `ResolvedCharacter`, `ActionTrigger`, `TeamActionTrigger` |
