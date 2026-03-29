# Battle Optimizer — Codebase Map

> **LLM context document.** Where to find every piece of the codebase.  
> For architecture and logic explanation: [ARCHITECTURE.md](ARCHITECTURE.md)  
> For deep system detail: [ROTATION_FLOW.md](ROTATION_FLOW.md) | [EFFECTS_GUIDE.md](EFFECTS_GUIDE.md)

---

## Top-Level Files

| File | Purpose |
|---|---|
| `index.html` | Vite entry point |
| `ARCHITECTURE.md` | Architecture overview (LLM context) |
| `CODEBASE_MAP.md` | This file |
| `ROTATION_FLOW.md` | Authoritative deep-dive: all types, all resolvers, all systems |
| `EFFECTS_GUIDE.md` | Cookbook: how to implement every kind of effect |
| `TODO/` | Dev notes: bugs, features, algorithms, QoL tasks |

---

## `src/types/` — All TypeScript Types

| File | Key Types |
|---|---|
| `baseTypes.ts` | `ScalingType`, `ElementType`, `DamageType`, `EnergyType`, `Position` |
| `character.ts` | `Character`, `ResolvedCharacter`, `ResourceMilestoneDef` |
| `stats.ts` | `CharacterStats` (full stat block), `EnemyStats` |
| `action.ts` | `Action`, `ActionCategory`, `CastConditions` |
| `snapshot.ts` | `Snapshot` (full per-row battle state) |
| `stepContext.ts` | `StepContext`, `StepLog` |
| `modifiers.ts` | `DamageModifier`, `ModifierInAction`, `TargetStrategy`, `DurationStrategy`, `StackingStrategy`, `NegativeStatusEffect` |
| `sideEffect.ts` | `SideEffect`, `StatusModification`, `CooldownReduction` |
| `negativeStatus.ts` | `NegativeStatus`, `NegativeStatusInAction`, `ReductionStrategy` |
| `coordinatedAttack.ts` | `CoordinatedAttack`, `CoordinatedAttackInAction` |
| `energy.ts` | `EnergyGeneration`, `EnergyCost` |
| `events.ts` | `DamageEvent`, `Contribution` |
| `gear.ts` | `Gear`, `Weapon`, `Echo`, `EchoSlots`, `EchoSetBonus`, `InjectedModifier`, `InjectedSideEffect` |
| `form.ts` | `Form` |
| `enemy.ts` | `Enemy` |
| `tableDefinitions.ts` | `TableConfig`, `ColumnGroup`, `ColumnDef`, `StatusMetadata`, `EnergyMetadata`, `ColumnVisibility`, `GlobalColumns` |

---

## `src/data/` — Static Game Data

### Characters
| File | Purpose |
|---|---|
| `data/characters.ts` | Exports `characters: ResolvedCharacter[]` — the active roster. Edit here to add/remove characters from rotation. |
| `data/characters/blueprint.ts` | Empty character template. Copy this to create a new character. |
| `data/characters/cartethyia.ts` | Cartethyia character definition |
| `data/characters/ciaccona.ts` | Ciaccona character definition |
| `data/characters/mornye.ts` | Mornye character definition |
| `data/characters/roverAero.ts` | Rover (Aero) character definition |

### Actions
| File | Purpose |
|---|---|
| `data/actions/blueprint.ts` | Empty action template |
| `data/actions/cartethyia.ts` | Cartethyia actions |
| `data/actions/ciaccona.ts` | Ciaccona actions |
| `data/actions/mornye.ts` | Mornye actions |
| `data/actions/roverAero.ts` | Rover Aero actions |

### Gear
| File | Purpose |
|---|---|
| `data/gear/weapons.ts` | All weapon definitions |
| `data/gear/echoes.ts` | All echo definitions |
| `data/gear/cartethyia.ts` | Cartethyia's equipped gear |
| `data/gear/ciaccona.ts` | Ciaccona's equipped gear |
| `data/gear/mornye.ts` | Mornye's equipped gear |
| `data/gear/roverAero.ts` | Rover Aero's equipped gear |

### Stats
| File | Purpose |
|---|---|
| `data/stats/blueprint.ts` | Default/empty stat structure |
| `data/stats/cartethyia.ts` | Cartethyia base stats |
| `data/stats/ciaccona.ts` | Ciaccona base stats |
| `data/stats/mornye.ts` | Mornye base stats |
| `data/stats/roverAero.ts` | Rover Aero base stats |

### Other Data
| File | Purpose |
|---|---|
| `data/enemies.ts` | Enemy definitions (resistance, level). First entry used by default. |
| `data/negativeStatuses.ts` | All negative status definitions (erosion, frazzle, bane, chafe, burst, flare) |
| `data/sideEffects/sideEffects.ts` | Shared side effect helpers |
| `data/coordinatedAttacks/ciaccona.ts` | Ciaccona coordinated attack definitions |
| `data/forms/cartethyia.ts` | Cartethyia form definitions |
| `data/forms/mornye.ts` | Mornye form definitions |

---

## `src/utils/` — Pure Calculation & Logic

### `utils/hooks/` — The Resolver Engine (core logic, no React)

| File | Purpose |
|---|---|
| `resolvers.ts` | **All 10 resolvers** (R0–R9). Entry point for every per-action calculation. `buildStepContext`, `resolveTime`, `resolveDamageModifiers`, `resolveDamage`, `resolveSideEffectsAndStatuses`, `resolveCoordinatedAttacks`, `resolveModifierState`, `resolveResourceMilestones`, `resolveResources`, `resolveCooldowns`, `resolveCastState`. Also exports `aggregateStat`. |
| `modifierHelpers.ts` | `collectAllModifiers`, `activateModifiers`, `filterApplicableModifiers`, `applyStackMultiplier`, `updateModifiersForSwap`, `updateModifiersForTime` |
| `modifierStateHelpers.ts` | `updateModifierStacks` — writes modifier state into snapshot fields |
| `actionHelpers.ts` | `getActionFromCharacter` (resolves variants), `getActionNameByDmgType` (finds intro/outro by dmgType, checks form overrides first) |
| `characterHelpers.ts` | `getCharacter`, `getPrevCharacter` |
| `snapshotHelpers.ts` | `createSnapshot`, `copySnapshots`, `getSnapshotById`, `getPrevSnapshot`, `getSnapshotIndex`, `assignCharacterToRow`, `isSwapRequiredLocked` |
| `cooldownHelpers.ts` | `updateAllCharactersCooldowns`, `setActionOnCooldown`, `reduceCooldown`, `getActionCooldownKey` |
| `energyHelpers.ts` | `getCharacterEnergyState`, `updateEnergyValue`, `getConcertoValue` |
| `negativeStatusHelpers.ts` | `getNegativeStatusStacks`, `processNegativeStatusStacks`, `updateNegativeStatusStacks` |
| `coordinatedAttackHelpers.ts` | `activateCoordinatedAttacks`, `processCoordinatedAttacks`, `updateCoordinatedAttackSnapshot`, `makeCoordinatedAttackKey`, `parseCoordinatedAttackKey` |
| `formHelpers.ts` | Form state helpers |
| `snapshotHelpers.ts` | Snapshot construction / mutation utilities |

### `utils/calculators/`

| File | Purpose |
|---|---|
| `damageCalculator.ts` | `calculateDamage()` — full damage formula implementation including per-modifier contribution calculation |
| `sideEffectCalculators.ts` | Helpers for computing side effect damage |

### `utils/gear/`

| File | Purpose |
|---|---|
| `resolveCharacter.ts` | `resolveCharacter(character)` — called once at startup; merges all gear stats, injects echo skill and gear modifiers, flattens permanent passives |
| `resolveGear.ts` | Injects `injectedModifiers` and `injectedSideEffects` from weapon/echoes/set bonus into character |
| `computeStatBreakdown.ts` | Per-source stat contribution breakdown used by `CharacterProfileOverlay`. Exports `computeGearStatBreakdown` (weapon / echo / setBonus / passive-mod totals), `computeActiveModifierBreakdown` (self-buffs vs team-buffs from the current snapshot), and `computeFinalStats`. All functions derive from gear data directly — they do not read `character.stats`. |

### `utils/conditions/`

| File | Purpose |
|---|---|
| `damageModifierConditions.ts` | Reusable condition functions for modifiers (e.g. `isAlwaysCondition`, `isActiveCondition`) |

### `utils/modifications/`

| File | Purpose |
|---|---|
| `statusModificationHelpers.ts` | Helpers for applying status stack/timer changes |

### `utils/selectors/`

| File | Purpose |
|---|---|
| `selectorHelpers.tsx` | React selector utilities (e.g. for CharacterSelect / ActionSelect dropdowns) |

### `utils/table-builders/`

| File | Purpose |
|---|---|
| `buildTableConfig.ts` | `buildTableConfig(characters)` — assembles the full `TableConfig` |
| `buildBasicColumns.ts` | Basic columns (time, damage, DPS) |
| `buildCharacterGroupedColumns.ts` | Per-character energy columns |
| `buildStatusEffectsColumns.ts` | Buffs / debuffs / negative statuses columns |
| `buildBuffColumns.ts` | Buff column definitions |
| `buildDebuffColumns.ts` | Debuff column definitions |
| `buildNegativeStatusColumns.ts` | Negative status column definitions |
| `buildCoordinatedAttackColumns.ts` | Coordinated attack columns |
| `buildOtherColumns.ts` | Cooldown and misc columns |
| `helpers.tsx` | `flattenTableColumns` and other table utilities |

---

## `src/hooks/rotation-editor/` — React Hooks

| File | Purpose |
|---|---|
| `useRotationEditor.ts` | Top-level hook: composes `useSnapshots` + `useCharacterActions`. Exposes `snapshots`, `damageEvents`, `handleCharacterSelect`, `handleActionSelect`. |
| `useSnapshots.ts` | Owns `snapshots` state. Creates the initial empty snapshot from `TableConfig`. |
| `useCharacterActions.ts` | Owns state refs (`modifiersInAction`, `negativeStatusesInAction`, `coordinatedAttacksInAction`). Handles `handleCharacterSelect` and `handleActionSelect`. Runs the full resolver pipeline on action select. Handles outro/intro auto-trigger on swap. |

---

## `src/components/rotation-editor/` — UI Components

| File | Purpose |
|---|---|
| `RotationEditor.tsx` | Root editor: composes RotationTable + DataOverlay. Passes event handlers down. |
| `RotationTable.tsx` | The full table shell. Manages row highlight animation on new rows. Passes `previousSnapshot` to each `BodyRow` so status display shows the state *before* the action. |
| `HeaderRow.tsx` | Column headers with group labels and icons |
| `BodyRows.tsx` | Renders all snapshot rows (`BodyRow`). Computes locked-character and swap-cooldown sets from the previous snapshot before rendering `CharacterSelect`/`ActionSelect`. |
| `CurrentStateRow.tsx` | Sticky header row showing live running totals (cumulative damage, DPS, current energy/buff state) from the most recent resolved snapshot. |
| `CharacterSelect.tsx` | Character picker dropdown for a row. Disables characters that are locked (swap-required, swap-cooldown). |
| `ActionSelect.tsx` | Action picker per row. Evaluates all cast conditions against `previousSnapshot` and renders each action as enabled, disabled (with reason tooltip), or part of a collapsible variant group. Variant groups open a popup with individual variants. |
| `CharacterStateTracker.tsx` | Per-character card row above the table: shows portrait, active form badge, swap cooldown, energy bars, and clickable column-visibility toggles. Clicking a character portrait opens `CharacterProfileOverlay`. |
| `CharacterProfileOverlay.tsx` | Full character stat sheet overlay. Shows resolved final stats with a per-source breakdown (base / weapon / echo / set bonus / passive modifiers / active runtime buffs). Uses `computeStatBreakdown.ts`. Renders via `createPortal`. |
| `StatusTag.tsx` / `StatusTagGroup.tsx` | Individual status indicator chips (buff, debuff, negative-status icons with stack counts) and their grouped container used in `CurrentStateRow` and `BodyRow`. |
| `DataOverlay.tsx` | Full-screen overlay opened when clicking a resolved row. Shows a pie-chart damage breakdown by event/type, per-modifier contribution table (normal / crit / average), and a combat overview panel. Renders via `createPortal`. |
| `StatusDetailPanel.tsx` | Expandable status detail panel inside `DataOverlay`; shows per-modifier contribution rows. |
| `DamageTimeline.tsx` | Dual-view damage visualization below the table. **Timeline view**: action blocks and damage-event squares on horizontal character tracks. **Chart view**: line/area graph of cumulative damage or DPS over time. |

---

## `src/components/` — Other Components

| File | Purpose |
|---|---|
| `AppLayout.tsx` | Main layout wrapper (sidebar + content) |
| `TetherBackground.tsx` | Animated background |
| `sidebar/Sidebar.tsx` | Left navigation sidebar |
| `topbar/Topbar.tsx` | Top bar with column visibility controls |

---

## `src/pages/`

| File | Purpose |
|---|---|
| `RotationEditorPage.tsx` | **Main page.** Instantiates `tableConfig`, `characters`, `enemy` and renders `RotationEditor` + `DamageTimeline`. Edit here to change the active team or enemy. |
| `AnalyticsPage.tsx` | Analytics tab (WIP) |
| `HomePage.tsx` | Home/landing page |
| `SettingsPage.tsx` | Settings page |
| `NotFoundPage.tsx` | 404 |

---

## `tests/`

| File | Purpose |
|---|---|
| `damageCalculator.test.ts` | Unit tests for damage formula |
| `modifiers.test.ts` | Modifier system tests |
| `cartethyiaStats.test.ts` | Cartethyia stat resolution tests |
| `coordinatedAttackHelpers.test.ts` | Coordinated attack logic tests |
| `resolver_0_buildStepContext.test.ts` | R0 tests |
| `resolver_1_resolveTime.test.ts` | R1 tests |
| `resolver_2_resolveDamageModifiers.test.ts` | R2 tests |
| `resolver_4_resolveSideEffectsAndStatuses.test.ts` | R4 tests |
| `testUtils.ts` | Shared test helpers and fixtures |

---

## `src/utils/verifyData.ts`

`verifyData()` is called at app startup (from `main.tsx`). It validates every registered character against the full ruleset: action cast-condition references, energy key consistency, negative-status target names, and more. Failures print grouped console errors — they don't throw. Check the console on startup if something seems off after adding new data.

---

## `src/styles/rotation-editor/` — Component CSS

One CSS file per component. All scoped to the rotation editor page.

| File | Component |
|---|---|
| `RotationEditor.css` | `RotationEditor` page wrapper and layout |
| `RotationTable.css` | Table wrapper, column widths, sticky header |
| `BodyRows.css` | Row styles, locked/new-row highlight animation |
| `CurrentStateRow.css` | Sticky live-totals row |
| `HeaderRow.css` | Column header group styling |
| `CharacterSelect.css` | Character picker dropdown |
| `ActionSelect.css` | Action picker dropdown and variant popup |
| `CharacterStateTracker.css` | Character card row above table (also used by `CharacterProfileOverlay`) |
| `DataOverlay.css` | Full-screen data overlay |
| `StatusDetailPanel.css` | Contribution panel inside `DataOverlay` |
| `StatusTag.css` / `StatusTagGroup.css` | Status chip components |
| `DamageTimeline.css` | Timeline/chart visualization |

---

## Key Conventions

- **`src/utils/hooks/`** files have no React dependencies — they are pure TypeScript and can be imported in tests freely.
- **`src/hooks/rotation-editor/`** files are React hooks (use `useState`, `useRef`, etc.).
- The `resolvers.ts` file is the single source of truth for computation order. Each resolver is labelled with its number in a banner comment.
- Stat aggregation: `bonusDMG`-style stats add, `amplify`-style stats add, `totalMultiplier`-style stats multiply. See `aggregateStat()` in `resolvers.ts`.
- Every character data file follows the same pattern: `blueprint.ts` → copy → fill in `stats`, `actions`, `gear`, `modifiers`.
- `characters.ts` (the roster) is the only place that determines who appears in the tool. Characters not listed there are inactive.
