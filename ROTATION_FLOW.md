# Rotation Table — Complete Flow & Conventions

This document is the single authoritative reference for everything that happens on the Rotation Editor page: data models, orchestration hooks, the full resolver pipeline, and every type of thing that lives inside a snapshot or step context.

> **Also see:** [EFFECTS_GUIDE.md](EFFECTS_GUIDE.md) — practical cookbook for adding every kind of effect, with real examples from the codebase.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Core Types Reference](#2-core-types-reference)
   - [BaseTypes](#21-basetypes)
   - [Character & ResolvedCharacter](#22-character--resolvedcharacter)
   - [CharacterStats & EnemyStats](#23-characterstats--enemystats)
   - [Action](#24-action)
   - [CastConditions](#25-castconditions)
   - [Snapshot](#26-snapshot)
   - [StepContext](#27-stepcontext)
   - [DamageModifier & ModifierInAction](#28-damagemodifier--modifierinaction)
   - [SideEffect & StatusModification](#29-sideeffect--statusmodification)
   - [NegativeStatus & NegativeStatusInAction](#210-negativestatus--negativestatusinaction)
   - [CoordinatedAttack & CoordinatedAttackInAction](#211-coordinatedattack--coordinatedattackinaction)
   - [Energy](#212-energy)
   - [DamageEvent & Contribution](#213-damageevent--contribution)
   - [Gear](#214-gear)
   - [Form](#215-form)
   - [TableConfig & ColumnDef](#216-tableconfig--columndef)
   - [Enemy](#217-enemy)
3. [Character Resolution (Startup)](#3-character-resolution-startup)
4. [Table Config Construction](#4-table-config-construction)
5. [UI Entry Points](#5-ui-entry-points)
6. [Rotation Flow: Character Select](#6-rotation-flow-character-select)
7. [Rotation Flow: Action Select](#7-rotation-flow-action-select)
   - [Outro / Intro Auto-Trigger](#71-outro--intro-auto-trigger)
   - [Resolver Pipeline](#72-resolver-pipeline)
8. [Action Filtering (Cast Conditions)](#8-action-filtering-cast-conditions)
9. [Resolver Deep-Dives](#9-resolver-deep-dives)
   - [R0 — buildStepContext](#r0--buildstepcontext)
   - [R1 — resolveTime](#r1--resolvetime)
   - [R2 — resolveDamageModifiers](#r2--resolvedamagemodifiers)
   - [R3 — resolveDamage](#r3--resolvedamage)
   - [R4 — resolveSideEffectsAndStatuses](#r4--resolvesideeffectsandstatuses)
   - [R4.5 — resolveCoordinatedAttacks](#r45--resolvecoordinatedattacks)
   - [R5 — resolveModifierState](#r5--resolvemodifierstate)
   - [R6 — resolveResourceMilestones](#r6--resolveresourcemilestones)
   - [R7 — resolveResources](#r7--resolveresources)
   - [R8 — resolveCooldowns](#r8--resolvecooldowns)
   - [R9 — resolveCastState](#r9--resolvecaststate)
10. [Damage Formula](#10-damage-formula)
11. [Modifier System In Detail](#11-modifier-system-in-detail)
    - [TargetStrategy](#111-targetstrategy)
    - [DurationStrategy](#112-durationstrategy)
    - [StackingStrategy](#113-stackingstrategy)
    - [Modifier Lifecycle](#114-modifier-lifecycle)
12. [Negative Status System](#12-negative-status-system)
13. [Coordinated Attack System](#13-coordinated-attack-system)
14. [Side Effect System](#14-side-effect-system)
15. [Energy & Resource System](#15-energy--resource-system)
16. [Cooldown System](#16-cooldown-system)
17. [Form System](#17-form-system)
18. [Combo Systems](#18-combo-systems)
    - [previousActions (immediate follow-up)](#181-previousactions-immediate-follow-up)
    - [requiredFollowUp (forced next action)](#182-requiredfollowup-forced-next-action)
    - [comboWindow (time-based window)](#183-combowindow-time-based-window)
19. [Snapshot Lifecycle](#19-snapshot-lifecycle)
20. [Persistent Refs vs. Snapshot State](#20-persistent-refs-vs-snapshot-state)

---

## 1. Architecture Overview

```
RotationEditorPage
  ├── buildTableConfig(characters)       → column layout: what each cell renders, energy types tracked, buff/status metadata per character
  ├── RotationEditor
  │     ├── useRotationEditor            → connects snapshot state to user interaction handlers
  │     │     ├── useSnapshots           → Snapshot[] in React state; append, update, prune
  │     │     └── useCharacterActions    → character/action selection handlers; owns the resolver pipeline and the three runtime refs
  │     │           └── resolver pipeline (buildStepContext → … → resolveCastState)
  │     ├── RotationTable                → one row per snapshot: character slot, action slot, stat/energy cells
  │     │     ├── CharacterSelect        → pick which character owns this row
  │     │     └── ActionSelect           → pick an action; cast conditions evaluated live to filter/disable entries
  │     └── DataOverlay                  → per-hit damage contribution breakdown for the selected row
  └── DamageTimeline                     → all DamageEvents plotted as a chart by timestamp
```

**Data flow in summary:**
1. Characters are resolved at startup (gear/echo stats merged into `character.stats`).
2. `buildTableConfig` reads each character's energy types and tracked effects to build the column layout — defining what each cell renders.
3. The editor starts with one blank `Snapshot` row.
4. Picking a character assigns it to a row and prunes any rows after it.
5. Picking an action triggers the full resolver pipeline which produces an updated `Snapshot` for that row and appends a new blank row.
6. Every resolved row is immutable in `Snapshot[]`; the mutable runtime state lives in three `useRef` arrays.

---

## 2. Core Types Reference

### 2.1 BaseTypes

```ts
type ScalingType = 'ATK' | 'HP' | 'DEF' | 'FLAT' | ''

type ElementType =
  | 'AERO' | 'SPECTRO' | 'HAVOC' | 'GLACIO' | 'FUSION' | 'ELECTRO' | ''

type DamageType =
  | 'BASIC' | 'HEAVY' | 'SKILL' | 'LIBERATION'
  | 'COORDINATED' | 'ECHO'
  | 'INTRO' | 'OUTRO'
  | 'NEGATIVE_STATUS' | ''

type EnergyType =
  | 'energy' | 'forte'
  | 'forte_divinity' | 'forte_discord' | 'forte_virtue'
  | 'concerto' | 'conviction'

type Position = 'GROUND' | 'AIR' | 'PRESERVE' | 'ANY'
// PRESERVE/ANY are only valid in CastConditions; resolved positions are always GROUND or AIR
```

---

### 2.2 Character & ResolvedCharacter

```ts
type Character = {
  name: string
  maxEnergies: Partial<Record<EnergyType, number>>
  actions: Action[]
  damageModifiers: DamageModifier[]    // character-level permanent modifiers
  stats: Partial<CharacterStats>       // raw stats before gear resolution
  inherentStats: Partial<CharacterStats>
  gear: Gear
  defaultForm?: string
  forms?: Form[]
  sequence: 0 | 1 | 2 | 3 | 4 | 5 | 6
  resourceMilestones?: ResourceMilestoneDef[]
}

// After resolveCharacter() runs, stats is guaranteed to be a full CharacterStats.
type ResolvedCharacter = Omit<Character, 'stats'> & { stats: CharacterStats }
```

`ResourceMilestoneDef` fires one modifier stack each time a watched energy resource crosses a threshold (prev < threshold ≤ curr).

```ts
type ResourceMilestoneDef = {
  resourceType: EnergyType
  milestones: number[]        // each fires once per upward crossing
  modifier: DamageModifier
}
```

---

### 2.3 CharacterStats & EnemyStats

`CharacterStats` is the fully merged stat object used in all calculations. Fields follow a layered pattern:

| Layer | Fields | Aggregation |
|-------|--------|-------------|
| Base scaling stat | `baseATK`, `baseHP`, `baseDEF` | additive |
| Flat additions | `flatATK`, `flatHP`, `flatDEF` | additive |
| Percentage bonus | `bonusATK`, `bonusHP`, `bonusDEF` | additive |
| Amplification | `amplifyATK`, `amplifyHP`, `amplifyDEF` | additive |
| Final multiplier | `totalMultiplierATK/HP/DEF` | multiplicative |
| Crit | `critRate`, `critDamage` | additive |
| Global damage | `bonusDMG`, `amplifyDMG`, `totalMultiplierDMG` | (see formula) |
| Penetration | `defIgnore`, `elementalResPEN`, `resistancePEN` | additive |
| Per damage-type | `basicBonusDMG`, …`liberationBonusDMG`, … | additive |
| Per element | `spectroBonusDMG`, `fusionBonusDMG`, … | additive |
| Negative status specific | `aeroErosionBonusDMG`, `spectroFrazzleBonusDMG`, … | additive |
| Resource modifier | `energyPercent` | additive |

**Aggregation rule for `totalMultiplier*` fields:** multiplicative (multiply existing by new value). All other fields are additive.

`EnemyStats` carries resistances:
```ts
type EnemyStats = {
  level: number
  baseDefense: number
  aeroRes: number   // and all other elements
  // ...
}
```

---

### 2.4 Action

```ts
type Action = {
  name: string
  displayName: string
  category: ActionCategory          // 'Basics' | 'Skills' | 'Echo Skill' | 'Other' | 'Testing'
  castTime: number                  // seconds
  multiplier: number                // damage multiplier applied to scaling stat
  scaling: ScalingType
  elements: ElementType[]
  dmgTypes: DamageType[]

  cooldown: number                  // 0 = no cooldown

  energyGenerated: EnergyGeneration[]
  energyCost: EnergyCost[]

  statusModifications: StatusModification[]   // explicit stack/timer changes to buffs/debuffs/negativeStatuses
  damageModifiers: DamageModifier[]           // modifiers THIS action activates when cast
  sideEffects: SideEffect[]
  coordinatedAttacks?: CoordinatedAttack[]
  cooldownReductions?: CooldownReduction[]

  castConditions: CastConditions

  offtune: number                   // toughness damage (display only)
  toolTip?: string

  groupName?: string                // variant group key; variants share cooldowns
  variantName?: string              // display label for this variant

  formChange?: string               // form to transition to when cast
  resolveVariant?: (prevSnapshot, characterName) => Action   // dynamic variant picker
  requiredFollowUp?: { actionName: string }   // locks all other actions in next row
}
```

**Intro/Outro identification:** actions with `dmgTypes.includes('INTRO')` or `dmgTypes.includes('OUTRO')` are treated specially — they are never shown in `ActionSelect` and are triggered automatically.

**Echo Skill:** the placeholder action in character.actions that has `dmgTypes.includes('ECHO')` is replaced at startup by `gear.echoSlots[1].echoSkill` when present.

**Variant resolution:** if `action.resolveVariant` is set, it is called with `(prevSnapshot, characterName)` and the returned `Action` is used for all resolvers. This allows picking the right plunge tier, combo variant, etc. at runtime.

---

### 2.5 CastConditions

```ts
type CastConditions = {
  previousActions?: Action[]       // must be the character's immediately previous personal action
  startState: Position             // required position to cast (GROUND/AIR/ANY)
  swapOutState?: Position          // character's position after being swapped out mid-action
  endState: Position               // character's resulting position after cast
  persistenceTime?: number         // seconds after swap-out where stored position/state is preserved
  requiresSwapIn?: boolean         // must have just swapped in OR last personal action was Intro
  requiresSwapOut?: boolean        // character must swap out after this action
  requiredForms?: string[]         // empty array = never castable; undefined = any form
  customCanCast?: (prevSnapshot, characterName) => boolean
  comboWindow?: {
    previousActions: Action[]      // actions that can start this combo window
    maxTimeSincePrevious: number   // seconds
    timerStartsAt: 'cast' | 'afterCast'
    crashesOnSwap: boolean
    crashesOnFormChange: boolean
  }
}
```

---

### 2.6 Snapshot

A `Snapshot` is the immutable state record produced after resolving one action row. It captures the world state at the END of that row (time, damage, resources, buffs, cooldowns, etc.).

```ts
interface Snapshot {
  id: string                        // numeric index as string; used for O(1) lookup
  character?: string                // character who acted in this row
  action?: string                   // action name (raw; see resolvedDisplayName for display)
  fromTime: number                  // absolute start time of this row's action
  toTime: number                    // fromTime + action.castTime

  // ---- Cumulative damage output ----
  damage: number                    // total cumulative damage up to and including this row
  dps: number                       // damage / toTime

  // ---- Character energies ----
  // key: character name → { energyType: currentValue }
  charactersEnergies: Record<string, Partial<Record<EnergyType, number>>>

  // ---- Active buffs (team/character-owned beneficial modifiers) ----
  buffs: Record<string, number>               // source key → current stack count
  buffsTimeLeft: Record<string, number>       // source key → seconds remaining
  buffsSwapsLeft: Record<string, number>      // source key → swaps remaining
  buffsMaxStacks: Record<string, number>      // source key → max stacks (from TableConfig metadata)

  // ---- Active debuffs (enemy-targeting modifiers) ----
  debuffs: Record<string, number>
  debuffsTimeLeft: Record<string, number>
  debuffsSwapsLeft: Record<string, number>
  debuffsMaxStacks: Record<string, number>

  // ---- Active negative statuses (DoT/debuffs on enemy with their own tick system) ----
  negativeStatuses: Record<string, number>           // status key → current stacks
  negativeStatusesTimeLeft: Record<string, number>   // status key → seconds of duration left

  // ---- Active coordinated attacks ----
  coordinatedAttacks: Record<string, number>             // attack key → ticks remaining (or time)
  coordinatedAttacksTimeLeft: Record<string, number>
  coordinatedAttacksSwapRequired: Record<string, boolean>

  // ---- Per-character cooldowns ----
  // charactersCooldowns[charName][cooldownKey] = seconds remaining
  charactersCooldowns: Record<string, Record<string, number>>

  // ---- Per-character cast state ----
  charactersPositions: Record<string, 'GROUND' | 'AIR'>
  charactersPersistentUntil: Record<string, number>  // absolute time persistence expires (0 = none)
  charactersLastAction: Record<string, string>
  charactersRequiresSwapOut: Record<string, boolean>
  charactersForms: Record<string, string>            // '' = default form
  charactersSwapCooldownUntil: Record<string, number> // absolute time swap-in cooldown expires
  charactersRequiredFollowUp: Record<string, string>  // charName → required next action name
  charactersComboWindows: Record<string, {
    actionName: string    // last action that could start a combo
    startTime: number     // fromTime of that action
    wasSwapped: boolean   // character was swapped out after the combo action
    formChanged: boolean  // character changed form after the combo action
  }>
  charactersForteGrants: Record<string, string[]>   // accumulated forte-based grant names

  // ---- Display helpers ----
  resolvedDisplayName?: string   // display name of the resolved variant (if different from action.displayName)
}
```

**The blank row:** after every successfully resolved row, a new `Snapshot` is appended with `id` = last id + 1, inheriting only structural metadata (not time/damage). It becomes the pending row the user interacts with next.

---

### 2.7 StepContext

`StepContext` is the temporary runtime object built for a single resolver pass. It is never stored — it lives only during one call to `updateSnapshotsWithAction`.

```ts
type StepContext = {
  snapshotId: number

  current: Snapshot    // the snapshot being built/mutated for this row
  prev: Snapshot       // the snapshot immediately before this row (immutable, read-only)

  character: ResolvedCharacter
  allies: ResolvedCharacter[]
  enemy: Enemy

  action: Action       // the resolved action (after resolveVariant, if present)

  fromTime: number     // = prev.toTime
  toTime: number       // = fromTime + action.castTime

  // ---- Runtime modifier tracking (also live in useRef) ----
  modifiersInAction: ModifierInAction[]
  negativeStatusesInAction: NegativeStatusInAction[]
  coordinatedAttacksInAction: CoordinatedAttackInAction[]

  // ---- Populated by resolveDamageModifiers ----
  permanentModifiers: DamageModifier[]
  damageModifiers: DamageModifier[]                // applicable modifiers for this step
  aggregatedCharacterModifiers: Partial<CharacterStats>
  aggregatedEnemyModifiers: Partial<EnemyStats>

  lastSwappedToCharacter?: string  // used for 'nextSwap' target strategy

  logs: StepLog[]      // resolver debug log entries
}
```

---

### 2.8 DamageModifier & ModifierInAction

`DamageModifier` is a **blueprint** — a static description of what a modifier does and when it applies.

```ts
type DamageModifier = {
  source: string            // unique identifier (e.g. 'Cartethyia_Sword_Mandate')
  displayName: string       // human-readable label shown in the table
  type: 'buff' | 'debuff'
  ownerCharacter: string | null   // whose name it belongs to; null = global

  characterStats?: Partial<CharacterStats>   // stat bonuses applied when modifier is active
  enemyStats?: Partial<EnemyStats>           // enemy stat modifications

  condition: (ctx: StepContext) => number    // multiplier (0 = not active, 1 = full, can be fractional)
  targetStrategy: TargetStrategy
  durationStrategy: DurationStrategy
  stackingStrategy: StackingStrategy

  negativeStatusEffects?: NegativeStatusEffect[]  // modifies frequency/maxStacks of a NegativeStatus
  color?: string
  clearsForteGrantsOnExpiry?: boolean  // clears ownerCharacter's forteGrants when this modifier removes
}
```

`ModifierInAction` is the **live tracked instance** of a limited modifier (permanent modifiers are never tracked as `ModifierInAction`).

```ts
type ModifierInAction = {
  modifier: DamageModifier
  applicationTime: number    // fromTime when first activated
  timeLeft: number           // seconds remaining (Infinity for permanent)
  swapsLeft: number          // swaps remaining (Infinity for permanent)
  currentStacks: number      // 1..maxStacks
  targetCharacter: string | null  // resolved target (for 'nextSwap' strategy)
}
```

---

### 2.9 SideEffect & StatusModification

A `SideEffect` is an extra damage hit and/or status change that happens alongside the main action. Side effects are attached to an `Action` and resolved in R4.

```ts
type SideEffect = {
  name: string
  damageDealt: (ctx: StepContext, sideEffectName: string, timeStamp: number) => DamageEvent
  statusModifications: StatusModification[]
}
```

`StatusModification` is a declarative delta applied to an existing buff, debuff, or negative status:

```ts
type StatusModification = {
  type: 'buff' | 'debuff' | 'negativeStatus'
  targetName: string           // key matching the status's displayName (buffs/debuffs) or name (negativeStatuses)
  stackChange?: number         // positive = add stacks, negative = remove stacks
  durationChange?: number      // (negativeStatus only) add/subtract seconds
  refreshDuration?: boolean    // (negativeStatus only) reset timer to base duration
}
```

> **Note:** `durationChange` and `refreshDuration` are only supported for `negativeStatus`. They are explicitly ignored for `buff`/`debuff` types (logged as a warning).

`CooldownReduction` reduces a specific action's cooldown when cast:

```ts
type CooldownReduction = {
  targetActionKey: string     // cooldown key to reduce (usually action.groupName)
  amount: number | ((ctx: StepContext) => number)
}
```

---

### 2.10 NegativeStatus & NegativeStatusInAction

A `NegativeStatus` is a persistent DoT effect on the enemy with its own tick system, stack management, and reduction strategy.

```ts
type NegativeStatus = {
  name: string
  duration: number             // base duration in seconds
  maxStacksDefault: number
  frequency: number            // seconds between damage ticks
  damage: Record<number, number>  // stack count → damage per tick
  element: ElementType
  reductionStrategy: ReductionStrategy
  damageModifiers: DamageModifier[]  // modifiers active while this status has stacks
  color?: string
}

type ReductionStrategy = {
  stackConsumption: number      // stacks removed per reduction event
  triggerDmgOnReduction: boolean
  resetTimerOnApplication: boolean
}
```

The **runtime instance** tracked per resolver pass:

```ts
type NegativeStatusInAction = {
  negativeStatus: NegativeStatus
  applicationTime: number        // absolute time when first stacked
  timeLeft: number               // seconds until duration resets/expires
  currentStacks: number
  lastDamageTime: number         // absolute time of last tick
}
```

All `NegativeStatus` data is initialized from `negativeStatuses.ts` at hook creation. Every negative status always has an entry in `negativeStatusesInAction` — inactive ones simply have `currentStacks = 0`.

**Effective frequency and maxStacks** can be modified by `DamageModifier.negativeStatusEffects`:

```ts
type NegativeStatusEffect = {
  targetStatus: string
  property: 'frequency' | 'maxStacks'
  value: number   // percentage modifier: -0.5 = -50% frequency (faster ticks)
}
```

---

### 2.11 CoordinatedAttack & CoordinatedAttackInAction

A `CoordinatedAttack` is a persistent periodic damage effect triggered by an action, scaling with the owner character's stats and going through the full modifier pipeline.

```ts
type CoordinatedAttack = {
  name: string
  displayName?: string
  multiplier: number
  scaling: ScalingType     // ATK, HP, or DEF (FLAT not supported)
  elements: ElementType[]
  dmgTypes: DamageType[]   // should include 'COORDINATED'

  frequency: number        // seconds between ticks
  duration: number         // total active duration (Infinity for swap-required attacks)
  swapRequired: boolean    // ends when owner becomes active again

  energyGenerated: EnergyGeneration[]   // energy per tick for owner (+ shared to allies)
  statusModifications: StatusModification[]  // applied per tick (negativeStatus only)

  condition?: (ctx: StepContext) => number   // per-tick damage multiplier (default 1)
  damageModifiers?: DamageModifier[]         // modifiers refreshed on each tick
  linkedModifiers?: DamageModifier[]         // modifiers active for the lifetime of this attack

  offtune?: number
  icon?: string
  color?: string
}
```

The **runtime instance**:

```ts
type CoordinatedAttackInAction = {
  coordinatedAttack: CoordinatedAttack
  ownerCharacter: string
  applicationTime: number     // toTime of the cast that activated/refreshed it
  timeLeft: number
  lastDamageTime: number      // toTime of last tick
}
```

**`linkedModifiers`** are special — they are injected into `modifiersInAction` as permanent entries (infinite duration/swaps) when the coordinated attack activates and removed when it expires or is swap-cancelled. They make the attack behave as a "team-wide aura" during its lifetime.

---

### 2.12 Energy

```ts
type EnergyGeneration = {
  energyType: EnergyType
  amount: number
  share: number           // fraction shared to allies (0–1)
  scalingStat?: string    // optional: multiply amount by character's stat with this key
}

type EnergyCost = {
  energyType: EnergyType
  amount: number
  grantsOnConsume?: string[]  // forte grant names to add to charactersForteGrants when spent
}
```

All energies are capped at their respective `character.maxEnergies[type]`. The `concerto` energy is always drained to 0 when an OUTRO action is cast.

---

### 2.13 DamageEvent & Contribution

`DamageEvent` is produced by the damage calculator and accumulated in the `damageEvents` state for use in the timeline.

```ts
type DamageEvent = {
  snapshotId: number
  dealer: string          // character name
  target: string          // enemy name
  elements: ElementType[]
  dmgTypes: DamageType[]
  scaling: ScalingType
  actionName: string
  normalStrike: number    // non-crit damage
  criticalStrike: number  // full-crit damage
  average: number         // expectedValue = normalStrike * (1 + critRate * (critDamage - 1))
  contributions: Record<string, Contribution>  // per-modifier damage contribution breakdown
  timeStamp: number       // fromTime of the action
}
```

`Contribution` breaks down how much each active modifier contributed:

```ts
type Contribution = {
  source: string
  displayName?: string
  crit_damage_contributed: number
  crit_percent_damage_contributed: number
  normal_damage_contributed: number
  normal_percent_damage_contributed: number
  average_damage_contributed: number
  average_percent_damage_contributed: number
}
```

---

### 2.14 Gear

```ts
type Gear = {
  weapon: Weapon
  echoSlots: EchoSlots        // slots 1–5
  setBonus?: EchoSetBonus
}

type Weapon = {
  name: string
  stats: Partial<CharacterStats>
  injectedModifiers?: InjectedModifier[]
  rank: 1 | 2 | 3 | 4 | 5
}

type Echo = {
  name: string
  cost: number
  baseStats: Partial<CharacterStats>
  subStats: Partial<CharacterStats>
  firstSlotStats?: Partial<CharacterStats>   // only applied when in slot 1
  conditionalStats?: EchoConditionalStats    // applied when condition(characterName) is true
  echoSkill?: Action                         // replaces the ECHO placeholder action
  injectedModifiers?: InjectedModifier[]
  injectedSideEffects?: InjectedSideEffect[]
}

// InjectedModifier: attaches modifiers to one or more specific targets
type InjectedModifier = {
  targets: Array<'character' | Action | CoordinatedAttack>
  modifiers: DamageModifier[]
}

// InjectedSideEffect: attaches side effects to specific actions
type InjectedSideEffect = {
  targets: Action[]
  sideEffects: SideEffect[]
}
```

---

### 2.15 Form

```ts
type Form = {
  name: string
  displayName?: string
  introAction?: Action     // custom intro when entering this form
  outroAction?: Action     // custom outro when leaving this form
  icon: string
}
```

Forms live in `Character.forms`. The active form for each character is tracked in `Snapshot.charactersForms[charName]`. An empty string means the default form (or no forms).

---

### 2.16 TableConfig & ColumnDef

```ts
type TableConfig = {
  basic: ColumnGroup           // time, damage, DPS columns
  characters: ColumnGroup[]    // one group per character (energy bars, cooldowns)
  statusEffects: ColumnGroup | null   // buffs, debuffs, negativeStatuses
  other: ColumnGroup | null    // coordinated attacks, misc
}

type ColumnGroup = {
  label: string
  icon: string
  nametag?: string
  columns: ColumnDef[]
}

type ColumnDef = {
  key: string                   // globally unique column key
  label: string
  icon: string
  render: (snapshot: Snapshot) => React.ReactNode
  statusMetadata?: StatusMetadata[]   // for grouped status columns
  energyMetadata?: EnergyMetadata[]   // for grouped energy columns
}

type StatusMetadata = {
  key: string      // matches the key used in Snapshot.buffs/debuffs/negativeStatuses
  label: string
  icon: string
  maxStacks?: number
  color?: string
}
```

`GlobalColumns` is a flattened view used internally by hooks:

```ts
type GlobalColumns = {
  basic: string[]
  buffs: string[]
  debuffs: string[]
  negativeStatuses: string[]
}
```

---

### 2.17 Enemy

```ts
type Enemy = {
  name: string
  stats: EnemyStats
}
```

`EnemyStats` holds defense, level, and per-element resistance values used in the damage formula.

---

## 3. Character Resolution (Startup)

`resolveCharacter(character: Character): ResolvedCharacter` runs once per character at module load time in `characters.ts`.

**Resolution order:**
1. Start from `getDefaultCharacterStats()` (zeros for additive, ones for multipliers, `critRate=0.05`, `critDamage=1.5`).
2. Merge `character.stats`.
3. Merge `character.inherentStats`.
4. Merge `gear.weapon.stats`.
5. For each echo slot 1–5:
   - Merge `echo.baseStats` + `echo.subStats`.
   - If slot 1: also merge `echo.firstSlotStats`.
   - If `echo.conditionalStats.condition(characterName)` is true: merge `echo.conditionalStats.stats`.
6. If all 5 slots are filled: merge `gear.setBonus.stats`.
7. Overwrite `character.stats` with the resolved total.
8. Replace the ECHO placeholder action with `echoSlots[1].echoSkill` (if present).
9. Run `resolveGear`: inject `InjectedModifier` and `InjectedSideEffect` from slot-1 echo and set bonus into their respective targets.

After this, `character.stats` is a complete `CharacterStats` and the character is safe to use as `ResolvedCharacter` throughout all runtime calculations.

---

## 4. Table Config Construction

`buildTableConfig(characters)` assembles the `TableConfig` used for all column rendering and global column tracking:

- **`basic`** — `buildBasicColumns()`: time, damage, DPS.
- **`characters`** — `buildCharacterGroupsColumns(characters)`: one `ColumnGroup` per character containing energy bars and cooldown columns derived from `character.maxEnergies`.
- **`statusEffects`** — `buildStatusEffectsColumns(characters)`: three special columns — `buffs`, `debuffs`, `negativeStatuses` — each with `statusMetadata[]` listing every known status/debuff/NegativeStatus across all characters.
- **`other`** — `buildOtherColumns(characters)`: coordinated attack columns.

The `characterColumnsMap` (derived in `useCharacterActions`) maps each character name to an array of energy type keys for use when building next-row snapshots.

---

## 5. UI Entry Points

**`RotationEditorPage`**
- Calls `buildTableConfig(characters)` to get column definitions.
- Manages `columnVisibility` state (all columns visible by default).
- Passes `characters` (resolved), `enemies[0]`, and `tableConfig` down to `RotationEditor`.

**`RotationEditor`**
- Calls `useRotationEditor` to get `snapshots`, `damageEvents`, `handleCharacterSelect`, `handleActionSelect`.
- Renders `RotationTable` and opens `DataOverlay` when a row is clicked.

**`useRotationEditor`**
- Thin orchestration layer: delegates snapshot management to `useSnapshots` and interaction handlers to `useCharacterActions`.
- Exposes `onSnapshotsChange` callback to bubble `snapshots` + `damageEvents` up for the timeline.

---

## 6. Rotation Flow: Character Select

`handleCharacterSelect(snapshotId, characterName)` is called when the user picks a character for a given row.

```
handleCharacterSelect(snapshotId, characterName)
  1. Set snapshot[snapshotId].character = characterName
  2. Clear snapshot[snapshotId].action = ''
  3. Prune: keep only snapshots up to and including snapshotId + 1
     (the blank row immediately after the current one is kept; anything beyond is discarded)
```

Pruning ensures that any previously resolved rows following the edited row are invalidated — the user must re-select actions from that point forward.

**Locked characters:** `ActionSelect` receives a `lockedCharacters` set. A character is locked from being selected if it is the character who cast an action required as a follow-up (from `charactersRequiredFollowUp`).

---

## 7. Rotation Flow: Action Select

`handleActionSelect(snapshotId, actionName)` is the main entry point for all calculation logic.

```
handleActionSelect(snapshotId, actionName)
  1. copySnapshots(prev) — create mutable copy of the entire snapshot array
  2. Check shouldTriggerOutroIntro:
       - snapshotId > 0
       - previous character ≠ current character
       - previous character has concerto = 100
     If true → run handleOutroIntroFlow (inserts 2 rows; shifts snapshotId by 2)
  3. Run updateSnapshotsWithAction for the target row
  4. Return updated snapshots
```

### 7.1 Outro / Intro Auto-Trigger

When `shouldTriggerOutroIntro` is true:

1. **Outro row:** force the previous character into the current row; look up their OUTRO action (or form-specific outro from `getActionNameByDmgType`); run `updateSnapshotsWithAction`.
2. **Intro row:** insert a new row for the incoming character; look up their INTRO action (or form-specific intro); run `updateSnapshotsWithAction`.
3. **Advance:** prepare the next blank row assigned to the incoming character; the original `snapshotId` now becomes `snapshotId + 2`.

The form checked for form-specific intro/outro is `prevSnapshot.charactersForms[charName]` — the form the character was in before the swap.

### 7.2 Resolver Pipeline

```
updateSnapshotsWithAction
  └─ validateActionInputs              guards: snapshot exists, character set, action found; runs resolveVariant
  └─ buildStepContext       (R0)       initializes StepContext from prevSnapshot + runtime refs; detects swap, runs updateModifiersForSwap
  └─ resolveTime            (R1)       writes fromTime / toTime
  └─ resolveDamageModifiers (R2)       activates new limited buffs, filters which modifiers apply, aggregates stat deltas
  └─ resolveDamage          (R3)       runs the damage formula → DamageEvent; updates cumulative damage + DPS
  └─ resolveSideEffectsAndStatuses (R4)   side-effect hits, DoT tick simulation, stack/timer changes to all statuses
  └─ resolveCoordinatedAttacks (R4.5)  coordinated attack ticks; inject/remove linkedModifiers
  └─ resolveResources       (R7)       energy costs (+ forte grants on consume), self generation, ally sharing, concerto drain
  └─ resolveResourceMilestones (R6)    checks energy thresholds now that R7 has run; fires modifier stacks per crossing
  └─ resolveModifierState   (R5)       advances buff timers; removes expired stacks; clears forte grants on expiry
  └─ resolveCooldowns       (R8)       decays all CDs by castTime; sets this action's CD; applies CD reductions
  └─ resolveCastState       (R9)       position, form, lastAction, swapCooldown, requiredFollowUp, comboWindow
  └─ commit refs:     modifiersInAction.current = ctx.modifiersInAction
  └─ commit snapshot: updatedSnapshots[index] = { ...ctx.current }
  └─ append blank row if this was the last
```

---

## 8. Action Filtering (Cast Conditions)

`ActionSelect.getActionState(action)` evaluates every cast condition and returns an `ActionState` with boolean flags for each failure mode. An action is greyed out / un-selectable if any flag is true.

| Flag | Condition Checked |
|------|-------------------|
| `isSpecial` | action is Intro or Outro (never selectable; auto-triggered only) |
| `isUnaffordable` | any `energyCost` not met by `currentEnergies` |
| `isOnCooldown` | `charactersCooldowns[char][cooldownKey] > 0` in `previousSnapshot` |
| `isWrongPosition` | `startState !== 'ANY'` and stored position ≠ `startState` |
| `isPreviousActionMismatch` | `previousActions` is set and charLastAction is not in that list |
| `isRequiresSwapIn` | `requiresSwapIn` is true and neither just-swapped-in nor last action was Intro |
| `isWrongForm` | `requiredForms` is set and current form is not in the list (empty array = always blocked) |
| `isCustomCanCastFailed` | `customCanCast(prevSnapshot, charName)` returns false |
| `isOnSwapCooldown` | `charactersSwapCooldownUntil[char] > prevSnapshot.toTime` |
| `isNoSwapTarget` | `requiresSwapOut` is true but no other character will be available after the action completes |
| `isNotRequiredFollowUp` | `charactersRequiredFollowUp[char]` is set and this action is not that action |
| `isFollowUpNotReady` | action has `requiredFollowUp` and the follow-up action is still on cooldown when this action would complete |
| `isComboWindowExpired` | `comboWindow` is set and the window has expired, the swap flag broke it, or the form change flag broke it |

**Position resolution for filtering:**
- If `previousSnapshot.character === charName` (same character as previous row): use stored position/lastAction directly.
- If different character (swapping back): use stored position/lastAction only when within the persistence window (`toTime ≤ charactersPersistentUntil[char]`).
- If neither: position resets to GROUND, lastAction is undefined.

**Grouping / Variants:**
Actions with the same `groupName` are grouped into an `ActionGroup` in the dropdown. A group is rendered as an expandable row; clicking it opens a variant popup. The group itself is not selectable — individual variants inside it are. A group is disabled if all its variants are unselectable.

**Category ordering:**
`['Basics', 'Skills', 'Echo Skill', 'Other', 'Testing']` — categories are derived dynamically from the character's actions and sorted alphabetically within each. Any category not in the preferred list is appended at the end.

---

## 9. Resolver Deep-Dives

### R0 — buildStepContext

Initializes the `StepContext` for a single resolver pass:

- Computes `fromTime = prev.toTime`, `toTime = fromTime + action.castTime`.
- Separates `allies` (all characters except the active one).
- Detects if this is a **swap** (`prev.character !== character.name`).
- If swap: calls `updateModifiersForSwap` to decrement swap counts on limited modifiers and handle `nextSwap` target resolution (before any other resolver runs).
- Sets `lastSwappedToCharacter` used by `activateModifiers` when assigning `targetCharacter` to newly created `ModifierInAction` entries.

---

### R1 — resolveTime

Validates and writes `current.fromTime` and `current.toTime`. Throws if timing is inconsistent.

---

### R2 — resolveDamageModifiers

Builds the full set of applicable modifiers for this step. Pipeline:

1. **`collectAllModifiers`** — gathers blueprints from three sources:
   - `character.damageModifiers` (passive/permanent character modifiers)
   - `action.damageModifiers` (modifiers this action activates)
   - `negativeStatusesInAction` where `currentStacks > 0` → their `.damageModifiers`
2. **`activateModifiers`** — for every **limited** modifier blueprint, either creates a new `ModifierInAction` or increments stacks on an existing one. Permanent blueprints are skipped (they are handled separately).
3. **`filterApplicableModifiers`** — from the union of permanent blueprints + active `ModifierInAction` entries, returns only those where `targetStrategy` resolves to the current active character (see §11.1).
4. **Aggregate stats** — for each applicable modifier, evaluates `condition(ctx)` → multiplier, then adds `modifier.characterStats` and `modifier.enemyStats` to running aggregates. For limited modifiers, the per-stack value is `condition(ctx) × statValue`.

Outputs:
- `ctx.damageModifiers` — all applicable modifiers (used downstream by R3, R4, coordinated attack damage)
- `ctx.aggregatedCharacterModifiers` — merged stat deltas for character
- `ctx.aggregatedEnemyModifiers` — merged stat deltas for enemy

---

### R3 — resolveDamage

Calls `calculateDamage` and appends a `DamageEvent`:

```
calculateDamage:
  1. mergeStats(character.stats, aggregatedCharacterModifiers)     → finalStats
  2. mergeEnemyStats(enemy.stats, aggregatedEnemyModifiers)        → finalEnemyStats
  3. calculateScalingStat(finalStats, action.scaling)              → baseStat
  4. calculateBonusMultiplier(finalStats, elements, dmgTypes)      → bonusM
  5. calculateAmplifyMultiplier(finalStats, elements, dmgTypes)    → amplifyM
  6. calculateTotalMultiplier(finalStats, elements, dmgTypes)      → totalM
  7. calculateResistanceMultiplier(finalStats, finalEnemyStats, elements) → resistM
  8. critMultiplier = 1 + critRate × (critDamage − 1)
  9. damageMultiplier = bonusM × amplifyM × totalM × resistM
  10. normalStrike   = multiplier × baseStat × damageMultiplier
  11. criticalStrike = normalStrike × critDamage
  12. average        = normalStrike × critMultiplier
```

Updates `current.damage` (cumulative) and `current.dps`.

---

### R4 — resolveSideEffectsAndStatuses

Three sub-steps:

**a) `aggregateStatusModifications`** — collects all `StatusModification` entries from:
- `action.statusModifications`
- Each `action.sideEffects[i].statusModifications`

Aggregates them by type + targetName (summing `stackChange`, `durationChange`; ORing `refreshDuration`).

**b) `helpSideEffectsDamage`** — for each `action.sideEffects[i]`, calls `sideEffect.damageDealt(ctx, name, fromTime)` and adds the result to `current.damage`.

**c) `helpNegativeStatuses`** — processes DoT ticks in the `[fromTime, toTime]` window:
- Calls `processNegativeStatusStacks` which simulates all tick events for every active `NegativeStatusInAction`.
- Each tick: computes effective frequency (modified by `negativeStatusEffects`), fires `calculateDamageNegativeStatus`, generates `DamageEvent`.
- Calls `updateNegativeStatusStacks` which applies the aggregated `stackChange/durationChange/refreshDuration` from step (a) and writes results back to `current.negativeStatuses`, `negativeStatusesTimeLeft`.

**d) `helpModifierStatusModifications`** — applies `stackChange` from the aggregated modifications to active `ModifierInAction` entries for buffs/debuffs. Handles `resetTimerOnApplication` if stacks are being added. Modifiers reduced to 0 stacks are removed. If a removed modifier has `clearsForteGrantsOnExpiry`, clears `current.charactersForteGrants[ownerCharacter]`.

---

### R4.5 — resolveCoordinatedAttacks

Three sub-steps:

1. **`activateCoordinatedAttacks`** — for each `action.coordinatedAttacks[i]`:
   - If already active (same name + ownerCharacter): refresh `applicationTime`, `timeLeft`, `lastDamageTime`.
   - If new: push a new `CoordinatedAttackInAction`.
   - In both cases: call `ensureLinkedModifiersActive` to inject `linkedModifiers` into `modifiersInAction`.

2. **`processCoordinatedAttacks`** — for each active `CoordinatedAttackInAction`:
   - Fire all ticks in `[lastDamageTime, toTime]` spaced by `frequency` (or effective frequency if modified).
   - Each tick: call `calculateDamage` with the **owner character's stats** (not the active character's, unless they're the same).
   - Apply per-tick `statusModifications` and `damageModifiers`.
   - Apply per-tick energy generation via `applyEnergyPerHit`.
   - For `swapRequired`: if the owner character is now active (swap back), end the attack.
   - Decrement `timeLeft`; remove expired attacks and their `linkedModifiers`.

3. **`updateCoordinatedAttackSnapshot`** — writes current state of alive attacks to `current.coordinatedAttacks`, `coordinatedAttacksTimeLeft`, `coordinatedAttacksSwapRequired`.

---

### R5 — resolveModifierState

Runs *after* R4.5 (and resources/milestones are already handled). Updates time-based expiry:

- `updateModifiersForTime(modifiersInAction, fromTime, toTime)` — subtracts elapsed time from `timeLeft`. When `timeLeft ≤ 0`:
  - Remove `stacksRemovedEachTime` stacks.
  - If stacks remain: reset `timeLeft` to `timeDuration`.
  - If stacks reach 0: remove the `ModifierInAction` entirely.
- If a removed modifier has `clearsForteGrantsOnExpiry`, clears `current.charactersForteGrants[ownerCharacter]`.
- Calls `updateModifierStacks` to sync current stack counts and timer values into `current.buffs`, `buffsTimeLeft`, `buffsSwapsLeft`, `debuffs`, etc.

---

### R6 — resolveResourceMilestones

For each `ResourceMilestoneDef` on the active character:
- Compare `prev.charactersEnergies[char][resourceType]` (before) vs `current` (after R7).
- Count how many thresholds were crossed upward (`prev < milestone ≤ curr`).
- Add that many stacks to the corresponding modifier.

> **Order note:** This runs *after* `resolveResources` so that energy changes from the current action are already applied when checking thresholds.

---

### R7 — resolveResources

Handles all energy changes:

1. **Energy costs** — subtract each `action.energyCost[i].amount` from `current.charactersEnergies[char][type]`, clamped to [0, max]. If `cost.grantsOnConsume` is set and the pre-cost value was > 0, append those grant names to `current.charactersForteGrants[char]` (deduplicated).

2. **Self energy generation** — add each `action.energyGenerated[i].amount` (scaled by `scalingStat` if set) to `current.charactersEnergies[char][type]`, clamped to max.

3. **Ally energy sharing** — for each ally, for each `energyGenerated` entry with `share > 0` and where the ally has that energy type in their `maxEnergies`: add `amount × share` (scaled, clamped).

4. **Concerto drain** — if `action.dmgTypes` includes `'OUTRO'`, drain `concerto` to 0.

---

### R8 — resolveCooldowns

1. **`updateAllCharactersCooldowns`** — for all characters (active + allies), subtract elapsed time (`toTime − fromTime`) from all active cooldowns. Expired cooldowns (≤ 0) are removed.

2. **`setActionOnCooldown`** — if `action.cooldown > 0`, set `current.charactersCooldowns[char][cooldownKey] = action.cooldown`.

3. **`reduceCooldown`** — for each `action.cooldownReductions[i]`, reduce the target cooldown by the specified amount (function or constant).

The `cooldownKey` is `action.groupName ?? action.name` — variants in the same group share a single cooldown entry.

---

### R9 — resolveCastState

Updates all per-character state tracking fields in `current`:

**Position:**
- `endState` (or `swapOutState` for swap-cancel variants) is resolved to `GROUND`/`AIR`.
- `PRESERVE`/`ANY` keep the character's previous position.

**Persistence:**
- `charactersPersistentUntil[char]` = `fromTime + persistenceTime` (0 if no persistence).

**Last action:**
- `charactersLastAction[char]` = `action.name`.

**Swap cooldown:**
- When a swap occurs (different character from previous row): `charactersSwapCooldownUntil[prevChar]` = `fromTime + 1s`.

**RequiresSwapOut:**
- `charactersRequiresSwapOut[char]` = `action.castConditions.requiresSwapOut ?? false`.

**Required follow-up:**
- If `action.requiredFollowUp` is set: `charactersRequiredFollowUp[char]` = `action.requiredFollowUp.actionName`.
- Otherwise: `charactersRequiredFollowUp` is cleared.

**Form:**
- If `action.formChange` is set: `charactersForms[char]` = `action.formChange`. Otherwise the previous form is preserved.

**Combo windows:**
- On swap: mark `wasSwapped = true` for the previous character's window.
- On form change: mark `formChanged = true` for the current character's window.
- Always write a new window entry for the current character with `actionName`, `startTime = fromTime`, `wasSwapped = false`, `formChanged = false`.

---

## 10. Damage Formula

```
finalStat = baseStat × (1 + bonusStat) × (1 + amplifyStat) × totalMultiplierStat + flatStat

bonusMultiplier  = 1 + bonusDMG + Σ(elementBonuses) + Σ(dmgTypeBonuses) + Σ(statusBonuses if NEGATIVE_STATUS in dmgTypes)
amplifyMultiplier = 1 + amplifyDMG + Σ(elementAmplifies) + Σ(dmgTypeAmplifies) + Σ(statusAmplifies)
totalMultiplier  = totalMultiplierDMG × Π(elementTotalMultipliers) × Π(dmgTypeTotalMultipliers)

defMultiplier    = attackerLevel / (attackerLevel + defenderDef × (1 − defIgnore))
resistMult       = 1 − Σ(elementRes − elementalResPEN − resistancePEN)

damageMultiplier = bonusMultiplier × amplifyMultiplier × totalMultiplier × defMultiplier × resistMult

normalStrike     = action.multiplier × finalStat × damageMultiplier
criticalStrike   = normalStrike × critDamage
average          = normalStrike × (1 + critRate × (critDamage − 1))
```

**Key rules:**
- `NEGATIVE_STATUS` in `dmgTypes` adds per-element status specific categories (e.g. `aeroErosionBonusDMG` for AERO).
- `totalMultiplier*` stats are multiplicative with each other.
- All `bonus*` and `amplify*` stats are additive within their category.
- Stat aggregation across modifiers: additive for bonuses/amplify, multiplicative for `totalMultiplier*`.

---

## 11. Modifier System In Detail

### 11.1 TargetStrategy

Controls which active character(s) a modifier applies to during `filterApplicableModifiers`.

| Value | Effect |
|-------|--------|
| `'self'` | Only applies when the active character is `ownerCharacter` |
| `'active'` | Applies to whichever character is currently acting |
| `'all'` | Always applies (team-wide buff or debuff) |
| `'nextSwap'` | Applies to `targetCharacter` (the character who was most recently swapped to). Updated on each swap via `updateModifiersForSwap`. |
| `'activeAlly'` | Applies when the active character is NOT the `ownerCharacter` (i.e., when an ally is on-field) |

### 11.2 DurationStrategy

```ts
type DurationStrategy =
  | { type: 'permanent' }
  | { type: 'limited'; timeDuration?: number; numberOfSwaps?: number }
```

- **`permanent`**: never tracked in `modifiersInAction`; always re-evaluated at filter time.
- **`limited`**: creates/updates a `ModifierInAction`; expires when `timeLeft ≤ 0` or `swapsLeft ≤ 0`.
- A modifier can have both `timeDuration` and `numberOfSwaps`; whichever expires first wins.

### 11.3 StackingStrategy

```ts
type StackingStrategy = {
  maxStacks: number
  resetTimerOnApplication: boolean   // reset timeLeft/swapsLeft each time a new stack is added
  stacksRemovedEachTime: number      // how many stacks are removed per expiry event
}
```

When the timer expires, `stacksRemovedEachTime` stacks are consumed. If stacks remain, the timer resets to the full duration. This models "each stack has its own individual timer" behavior when `stacksRemovedEachTime = 1` and `resetTimerOnApplication = false`.

### 11.4 Modifier Lifecycle

```
Action is cast
  → collectAllModifiers (character + action + active negativeStatus modifiers)
  → activateModifiers:
      for each LIMITED modifier:
        if exists in modifiersInAction → add 1 stack (capped), optionally reset timer
        else → create new ModifierInAction (timeLeft = timeDuration, swapsLeft = numberOfSwaps, stacks = 1)
  → filterApplicableModifiers → damageModifiers[]
  → aggregated stats computed
  → [damage calculated]
  → [swap occurs in next row] → updateModifiersForSwap → decrement swapsLeft
  → [time passes] → resolveModifierState → decrement timeLeft → remove expired
  → updateModifierStacks → write stacks/time into Snapshot.buffs / .debuffs
```

**Permanent modifiers** bypass the `ModifierInAction` system entirely — they are collected fresh every step from `character.damageModifiers`, `action.damageModifiers`, and active `negativeStatus.damageModifiers`, then filtered by target strategy. They never expire.

---

## 12. Negative Status System

Negative statuses are global DoT effects tracked in the `negativeStatusesInAction` ref (initialized once for all defined statuses, always present).

**Application:** an action (or side effect) applies stacks via `StatusModification` with `type: 'negativeStatus'`.

**Tick processing** (per step, in R4):
1. For each status with `currentStacks > 0`:
   - Compute effective frequency: `baseFrequency × max(0.1, 1 + totalModifier)` — frequency modifiers from `negativeStatusEffects` scale how fast ticks fire.
   - Simulate all ticks in `[lastDamageTime, toTime]`.
   - Each tick: look up `damage[stacks]` (the stack-count-indexed damage table), call `calculateDamageNegativeStatus`.
   - Apply `reductionStrategy.stackConsumption` after specified ticks.
   - `triggerDmgOnReduction`: whether the reduction tick also does damage.
2. Write updated stacks and timeLeft to `current.negativeStatuses`, `negativeStatusesTimeLeft`.

**Duration tracking:** `negativeStatus.duration` is the base timer. `resetTimerOnApplication` resets it each time new stacks are applied. `durationChange` / `refreshDuration` in `StatusModification` adjust the timer.

**`damageModifiers` on a NegativeStatus** — active while `currentStacks > 0`. Collected in R2 via `negativeStatusesInAction`. These often increase the damage of the status itself via `negativeStatusEffects` (frequency/maxStacks modifiers).

---

## 13. Coordinated Attack System

Coordinated attacks run in parallel with the main rotation, firing periodic damage ticks regardless of who is on-field (unless `swapRequired = true`).

**Activation:** triggered by `action.coordinatedAttacks`. If the same attack (same name + ownerCharacter) is already active, it is **refreshed** — `applicationTime`, `timeLeft`, and `lastDamageTime` are reset.

**`linkedModifiers`:** injected into `modifiersInAction` as permanent-duration entries when the attack activates. Removed when the attack expires or is swap-cancelled. This pattern is used for aura-style buffs that should be active exactly while the attack is alive.

**Damage calculation:** uses the **owner character's resolved stats** (not the currently active character's), but still benefits from the full `damageModifiers` pipeline (aggregated from all active modifiers at the time of the tick).

**`swapRequired = true`:** attack ends the moment the owner character becomes the active character again. All pending ticks up to that moment still fire.

**Key in Snapshot:** coordinated attacks are keyed by `makeCoordinatedAttackKey(attack, ownerCharacter)` — typically `attackName_ownerName`.

---

## 14. Side Effect System

A `SideEffect` fires alongside its parent action in R4b. It:
1. Calls `sideEffect.damageDealt(ctx, name, fromTime)` to produce a `DamageEvent` (can be 0 damage to use only the status modifications).
2. Its `statusModifications` are aggregated in R4a and applied in R4c/R4d along with the action's own status modifications.

Side effects are declared statically on actions or injected via `InjectedSideEffect` from gear (`Echo.injectedSideEffects`).

---

## 15. Energy & Resource System

**MaxEnergies:** defined per-character in `character.maxEnergies`. A character only tracks energy types that appear in its `maxEnergies` map — `updateEnergyValue` never creates a new key.

**Forte sub-energies** (`forte_divinity`, `forte_discord`, `forte_virtue`): specialized forte resources that accumulate independently. When consumed via `EnergyCost.grantsOnConsume`, they add named strings to `current.charactersForteGrants[char]` (deduplicated). These grant names are later checked by `DamageModifier.condition` or `customCanCast` to gate effects.

**Forte grants** are cleared when the associated "anchor" modifier (with `clearsForteGrantsOnExpiry = true`) expires or is explicitly removed to 0 stacks.

**Concerto** is the universal OUTRO trigger: it is automatically drained to 0 when any OUTRO action fires. The OUTRO check in `shouldTriggerOutroIntro` looks at `concerto === 100` (the max value) on the previous character to decide whether to auto-trigger.

**`resolveResources` order:**
1. Costs first (so grants from cost consumption are available for milestone checking).
2. Self generation.
3. Ally sharing.
4. Concerto drain on OUTRO.

---

## 16. Cooldown System

**Cooldown key:** `action.groupName ?? action.name`. All variants in a group share a single cooldown entry in `charactersCooldowns[char]`.

**Storage:** `charactersCooldowns` in `Snapshot` is `Record<charName, Record<cooldownKey, secondsRemaining>>`. Entries at 0 are removed (absent = off cooldown).

**Time decay:** at the start of every step, all existing cooldowns for all characters are decremented by `elapsedTime = action.castTime`.

**Setting cooldown:** after the action is cast, the cooldown key is set to `action.cooldown` (overwriting any previous value).

**Cooldown reductions:** `action.cooldownReductions` can reduce specific cooldowns after the action is cast. The amount can be a constant or a function of `ctx`.

**Display in ActionSelect:** `cooldownRemaining` (before action end time) is computed from `previousSnapshot.charactersCooldowns[char][cooldownKey]` and shown as a label on greyed-out action buttons.

---

## 17. Form System

**Data:** `Character.forms` is an optional array of `Form` objects. `Character.defaultForm` (or the first form if not set) is used when `charactersForms[char]` is `''`.

**Transition:** an action with `formChange` set will write the new form name to `current.charactersForms[char]` in R9.

**Form-specific Intro/Outro:** `getActionNameByDmgType` first checks if the character's current form (from `prevSnapshot.charactersForms`) has a custom `introAction` or `outroAction`; falls back to the default INTRO/OUTRO action if not.

**Cast condition:** `action.castConditions.requiredForms`:
- `undefined` → castable in all forms.
- `[]` → never castable (used with `customCanCast` for complex conditions).
- `['FormA', 'FormB']` → only castable when `currentForm` is in the list.

**Display:** `CharacterStateTracker` shows the active form badge (using `displayForm.icon` and `displayName`).

---

## 18. Combo Systems

### 18.1 previousActions (immediate follow-up)

```ts
castConditions.previousActions?: Action[]
```

The action can only be cast if the character's most recent personal action (`charactersLastAction[char]`) is one of the listed actions. There is no time window — it must be the immediately previous entry, accounting for persistence windows.

### 18.2 requiredFollowUp (forced next action)

```ts
action.requiredFollowUp?: { actionName: string }
```

When cast, sets `current.charactersRequiredFollowUp[char] = actionName`. In the next row, all actions except the specified one are blocked (`isNotRequiredFollowUp = true` for all others). The required action must also be validated as off-cooldown when the current action completes (`isFollowUpNotReady` check in `getActionState`).

### 18.3 comboWindow (time-based window)

```ts
castConditions.comboWindow?: {
  previousActions: Action[]
  maxTimeSincePrevious: number
  timerStartsAt: 'cast' | 'afterCast'
  crashesOnSwap: boolean
  crashesOnFormChange: boolean
}
```

The action can only be cast within `maxTimeSincePrevious` seconds after one of the `previousActions`. Tracking:

- `previousSnapshot.charactersComboWindows[char].actionName` — name of the last action cast by this character.
- `startTime` — `fromTime` of that action (cast start; ActionSelect adjusts for `timerStartsAt = 'afterCast'` by adding `matchingAction.castTime`).
- `wasSwapped` — set to `true` when the character is swapped out (in R9).
- `formChanged` — set to `true` when the character changes form (in R9).

The window is expired if:
- `currentTime − windowStartTime > maxTimeSincePrevious`, OR
- `crashesOnSwap && wasSwapped`, OR
- `crashesOnFormChange && formChanged`.

---

## 19. Snapshot Lifecycle

```
Initial state:
  snapshots = [emptySnapshot]
  emptySnapshot: all zeros, empty maps, id='0'

Character selected for row N:
  snapshots[N].character = name, .action = ''
  snapshots = snapshots.slice(0, N + 2)   (keep row N + one blank after)

Action selected for row N (no outro/intro):
  [resolver pipeline runs]
  snapshots[N] = { ...resolvedSnapshot }
  if N was the last row:
    snapshots.push(createSnapshot(snapshots[last]))

Outro/Intro auto-trigger:
  snapshots[N]   = outroSnapshot (previousCharacter)
  snapshots[N+1] = introSnapshot (currentCharacter)
  snapshots[N+2] = blank row (currentCharacter)
  [resolver pipeline then runs for N+2]
```

`createSnapshot(prev, ...)` builds the next blank row by copying structural state (forms, positions, energies, etc.) from the previous snapshot while zeroing out action-specific data (damage, action name, etc.).

---

## 20. Persistent Refs vs. Snapshot State

Three `useRef` arrays in `useCharacterActions` persist across rows **independently of React state**:

| Ref | Type | Purpose |
|-----|------|---------|
| `modifiersInAction` | `ModifierInAction[]` | Tracks all active limited modifiers with their timer/stack state. Updated at the end of every resolver pass. |
| `negativeStatusesInAction` | `NegativeStatusInAction[]` | One entry per defined negative status (always present). Tracks live stack counts, timers, and last tick time. |
| `coordinatedAttacksInAction` | `CoordinatedAttackInAction[]` | Tracks all currently active coordinated attacks. Entries are added on activation and removed on expiry. |

These refs are the source-of-truth for runtime effect state. Their current values are passed into `buildStepContext` at the start of each resolver pass, mutated throughout, and written back to `modifiersInAction.current` after each pass.

The `Snapshot` stores a **projection** of this state (stacks, timers, cooldowns) for display purposes — but the refs are what drive the next resolver pass.

**Why this matters:** if you are debugging a calculation, the live ref values at the moment of calling `handleActionSelect` are the ground truth for what modifiers/statuses/coordinated attacks are currently active. The displayed values in the previous `Snapshot` row should match them, but the refs are what the next resolver actually uses.
