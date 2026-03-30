# Gear-Swapping Framework — LLM Context File

## Project

**battle-optimizer** — A Wuthering Waves DPS rotation optimizer. React + TypeScript + Vite.  
The tool simulates skill rotations for a set of characters, computing damage output over a timeline.

---

## Task Summary

Implement a gear-swapping framework that allows characters' weapons and echoes to be changed at runtime, with the timeline resetting on every change. Includes types, resolver logic, data, click handler stubs, and picker UI.

**Current status**: Core resolver and type system complete (Iterations 1 & 2). Echo catalog being defined. Picker UI is next.

---

## What Was Done

### 1. Type Changes

**`src/types/gear.ts`**

- Added `WeaponType = 'Sword' | 'Broadblade' | 'Pistols' | 'Gauntlets' | 'Rectifier'`
- Added `weaponType: WeaponType` to `Weapon`
- Added `setName: string` to `Echo` — identifies which echo set the piece belongs to
- Added `EchoSetMilestone = { stats?: Partial<CharacterStats> }`
- Added `EchoSet = { name, icon, info, milestones: Partial<Record<2|5, EchoSetMilestone>> }` — global set definition
- `EchoSetBonus.stats` marked `@deprecated` — stats now come from the global registry, not per-character gear files

**`src/types/character.ts`**

- Added `weaponType: WeaponType` to the `Character` type

---

### 2. Echo Set Registry

**`src/data/gear/echoSets.ts`** (new file)

A global `Readonly<Record<string, EchoSet>>` called `echoSetRegistry` that defines milestone stat bonuses indexed by set name. Current sets:

- `'Windward Pilgrimage'` → 2-piece: `aeroBonusDMG +10%`
- `'Gusts of Welkin'` → 2-piece: `aeroBonusDMG +10%`
- `'Halo of Starry Radiance'` → 2-piece: `healingBonus +10%`

5-piece effects that inject per-action modifiers are NOT in this registry — they live in the character's `gear.setBonus.injectedModifiers` because they reference character-specific action objects.

Also exports `computeEchoSetCounts(slots: EchoSlots): Record<string, number>` which counts echoes per `setName`.

---

### 3. resolveCharacter — Non-Mutating Refactor

**`src/utils/gear/resolveCharacter.ts`**

Previously mutated character objects in place, which broke re-resolution (gear modifiers would double-inject on repeated calls). Now fully non-mutating.

**Key pattern — clone map:**  
`resolveGear` uses `=== target` reference matching to inject gear modifiers into the right action. After cloning, those original references no longer point to the working copies. Fix: build a `Map<Action | CoordinatedAttack, Action | CoordinatedAttack>` from originals to their clones, passed into `resolveGear`.

**Resolution order (doc comment in the file):**

1. `getDefaultCharacterStats()` (critRate=0.05, critDamage=1.5, all multipliers=1, rest=0)
2. `character.stats` (base stats)
3. `character.inherentStats`
4. `gear.weapon.stats`
5. Per-slot echo stats (`baseStats + subStats + firstSlotStats + conditionalStats`)
6. Echo set milestone stats from `echoSetRegistry` (2-piece, 5-piece, etc.)
7. Echo skill from slot 1 — replaces the placeholder `ECHO` action in working copies
8. `resolveGear(...)` — injects weapon/echo/set-bonus modifiers into working copies
9. Flatten always-active passive modifiers directly into stats

Returns a new `ResolvedCharacter` without mutating any original.

**Signature:** `resolveCharacter(character: Character, overrideGear?: Gear): ResolvedCharacter`

---

### 4. resolveGear — Clone Map Support

**`src/utils/gear/resolveGear.ts`**

Updated to accept `originalToClone: Map<Action | CoordinatedAttack, Action | CoordinatedAttack>` as 4th parameter.

`applyInjectedModifiers` and `applyInjectedSideEffects` now look up targets via `originalToClone.get(target)` instead of `characterActions.find(a => a === target)`. This ensures injection goes into the working clone, not the original definition.

---

### 5. computeStatBreakdown — Set Bonus Update

**`src/utils/gear/computeStatBreakdown.ts`**

Updated to use `computeEchoSetCounts` + `echoSetRegistry` for set bonus stat display, instead of reading from the deprecated `gear.setBonus.stats`. Supports partial sets (e.g. 2-piece active but not 5-piece).

---

### 6. Data Files Updated

All gear and character data files updated with new required fields:

| File                                | Changes                                                                                |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| `src/data/gear/cartethyia.ts`       | `weaponType: 'Broadblade'` on weapon; `setName: 'Windward Pilgrimage'` on all 5 echoes |
| `src/data/gear/ciaccona.ts`         | `weaponType: 'Rectifier'`; `setName: 'Gusts of Welkin'`                                |
| `src/data/gear/mornye.ts`           | `weaponType: 'Rectifier'`; `setName: 'Halo of Starry Radiance'`                        |
| `src/data/gear/roverAero.ts`        | `weaponType: 'Sword'`; `setName: 'Windward Pilgrimage'`                                |
| `src/data/characters/cartethyia.ts` | `weaponType: 'Broadblade'`                                                             |
| `src/data/characters/ciaccona.ts`   | `weaponType: 'Rectifier'`                                                              |
| `src/data/characters/mornye.ts`     | `weaponType: 'Rectifier'`                                                              |
| `src/data/characters/roverAero.ts`  | `weaponType: 'Sword'`                                                                  |

---

### 7. characters.ts — baseCharacters Export

**`src/data/characters.ts`**

```ts
export const baseCharacters: Character[] = [cartethyia, ciaccona, roverAero, mornye]
export const characters: ResolvedCharacter[] = baseCharacters.map(c => resolveCharacter(c))
```

`baseCharacters` is needed in `RotationEditorPage` to re-resolve a character from scratch when gear changes (we always re-resolve from the unmodified base, never from a previously-resolved copy).

---

### 8. Gear Change + Timeline Reset

**`src/pages/RotationEditorPage.tsx`**

- `const [resolvedCharacters, setResolvedCharacters] = useState<ResolvedCharacter[]>(characters)`
- `const [timelineKey, setTimelineKey] = useState(0)`

```ts
const handleGearChange = useCallback((characterName: string, newGear: Gear) => {
  const base = baseCharacters.find(c => c.name === characterName)
  if (!base) return
  const reResolved = resolveCharacter(base, newGear)
  setResolvedCharacters(prev => prev.map(c => (c.name === characterName ? reResolved : c)))
  setSnapshots([])
  setDamageEvents([])
  setTimelineKey(k => k + 1)
}, [])
```

`<RotationEditor key={timelineKey} ... onGearChange={handleGearChange} />`

Incrementing `timelineKey` unmounts and remounts `RotationEditor`, clearing all internal hook state (snapshots, refs, timers).

**Prop threading path:**  
`RotationEditorPage` → `RotationEditor` → `RotationTable` → `CharacterStateTracker` → `CharacterProfileOverlay`

Each component has `onGearChange?: (characterName: string, newGear: Gear) => void` added to its props type.

---

### 9. Gear Click TODO Stubs

**`src/components/rotation-editor/CharacterProfileOverlay.tsx`**

`GearSlot` component received `onClick?: () => void`, wired to the `motion.div`.

In `EquipmentOrbit`, each slot now has a click handler:

- Weapon: `onClick={() => { console.log('TODO: open weapon picker for', item.data.name, '(', item.data.weaponType, ')') }}`
- Echo: `onClick={() => { console.log('TODO: open echo picker for slot', item.slot, ':', item.data?.name ?? 'empty') }}`

`CharacterProfileOverlay` accepts `onGearChange?: (characterName: string, newGear: Gear) => void` in its props (stored as `_onGearChange` since no picker UI exists yet — held for when the picker is wired up).

---

### 10. Bug Fixes

- **`tuneBreakBoost` displaying 0 in overlay**: The stat value (e.g. `0.10`) was being formatted with `format: 'integer'`, causing `Math.round(0.10) = 0`. Fixed to `format: 'percent'` in both `STAT_DISPLAYS` and `GEAR_STAT_LABELS` in `CharacterProfileOverlay.tsx`.
- **Duplicate `applyInjectedSideEffects`**: The old mutating implementation was accidentally left at the bottom of `resolveGear.ts` after the refactor, causing an esbuild "symbol already declared" error. Removed the duplicate.

---

## What Was Done (Iteration 2) — Action Tag System

### 11. ActionTag Type

**`src/types/action.ts`**

- Added `ActionTag` union type with the following tags:
  - `'BASIC_ATTACK'` — action belongs to the basic attack combo chain
  - `'HEAVY_ATTACK'` — heavy/charged attack
  - `'SKILL'` — Resonance Skill cast
  - `'LIBERATION'` — Resonance Liberation cast
  - `'INTRO_ACTION'` — Intro skill
  - `'OUTRO_ACTION'` — Outro skill
  - `'HEAL_PROC'` — action provides HP restoration (direct or periodic-tick trigger)
  - `'AERO_EROSION_APPLIER'` — action applies Aero Erosion stacks
  - `'SPECTRO_FRAZZLE_APPLIER'` — action applies Spectro Frazzle stacks (for future use)
- Added `tags?: ActionTag[]` optional field to `Action`

**`src/types/coordinatedAttack.ts`**

- Added `tags?: ActionTag[]` optional field to `CoordinatedAttack`

---

### 12. InjectedTarget Type

**`src/types/gear.ts`**

- Added `InjectedTarget` union type:
  ```ts
  export type InjectedTarget =
    | 'character'
    | Action
    | CoordinatedAttack
    | { tag: ActionTag }
    | { tags: ActionTag[]; match: 'any' | 'all' }
  ```
- Updated `InjectedModifier.targets` to `Array<InjectedTarget>`
- Updated `InjectedSideEffect.targets` to `Array<Action | { tag: ActionTag } | { tags: ActionTag[]; match: 'any' | 'all' }>`

---

### 13. resolveGear — Tag-Based Injection

**`src/utils/gear/resolveGear.ts`**

- `applyInjectedModifiers` now handles tag targets:
  - For `{ tag }` or `{ tags, match }` targets: iterates `workingActions` (and their `coordinatedAttacks`) directly, matching by tags — no clone map needed since these are already working copies
  - For direct object references: unchanged (uses `originalToClone` map)
- `applyInjectedSideEffects` similarly handles tag targets
- Added `isTagTarget` helper: detects tag descriptors by absence of a `name` property (which both `Action` and `CoordinatedAttack` always have)
- Added `hasMatchingTags` helper: evaluates single-tag and multi-tag (`any`/`all`) matching

---

### 14. Character Actions Tagged

All four characters' actions have been tagged appropriately:

| Character | Actions Tagged |
|-----------|---------------|
| Cartethyia | `BASIC_ATTACK` on all BA/plunge variants; `HEAVY_ATTACK` on heavies; `SKILL` on Resonance Skills; `LIBERATION` on liberation; `INTRO_ACTION`/`OUTRO_ACTION` on intro/outro. Same for all Fleurdelys form actions. |
| Ciaccona | `BASIC_ATTACK` + `AERO_EROSION_APPLIER` on BA-3-4 and midair-2-BA-4 variants; `SKILL` + `AERO_EROSION_APPLIER` on skill variants; `LIBERATION`; `HEAVY_ATTACK`; `INTRO_ACTION`/`OUTRO_ACTION` |
| Rover (Aero) | `SKILL` on skill_1/skill_2; `SKILL` + `HEAL_PROC` on skill_3 variants (Unbound Flow provides healing); `LIBERATION` + `HEAL_PROC` on liberation; `HEAL_PROC` on midair actions; `BASIC_ATTACK` on plunge/BA_4; `INTRO_ACTION`/`OUTRO_ACTION` |
| Mornye | `BASIC_ATTACK` on all BA variants; `HEAVY_ATTACK` + `HEAL_PROC` on heavy attacks (trigger healing every 3s); `SKILL` on resonance skill; `BASIC_ATTACK` on Mode BA; `SKILL` + `HEAL_PROC` on Mode Skill (triggers healing); `HEAVY_ATTACK` on Mode Heavy; `LIBERATION` + `HEAL_PROC` on liberation; `INTRO_ACTION`/`OUTRO_ACTION` |

The `ciaccona_singers_triple_cadenza_coordinated` CoordinatedAttack was tagged `AERO_EROSION_APPLIER`.

---

### 15. Hardcoded Weapon Modifiers Removed from Rover Actions

**`src/data/actions/roverAero.ts`**

The following previously hardcoded weapon modifiers were removed from action `damageModifiers` arrays (they are now injected by the gear resolution system instead):

- `skill_3`, `skill_3_cancel_with_swap_1`, `skill_3_cancel_with_swap_2`: removed `'Bloodpacts Pledge Unbound'` modifier (was `{ aeroAmplifyDMG: 0.26 }`)
- `liberation`: removed `'Bloodpacts Pledge Heal'` modifier (was `{ skillBonusDMG: 0.26 }`)
- `midair_1_2`, `midair_1_2_cancel_with_swap`: removed `'Bloodpacts Pledge Heal'` modifier; kept `'Rover S4'` modifier (sequence node effect, not gear-injected)

---

### 16. Gear Files Updated to Use Tag-Based Targets

All gear files that previously used direct action object references now use tag-based targets:

| File | Change |
|------|--------|
| `src/data/gear/ciaccona.ts` | Weapon `targets: [ciaccona_outro]` → `[{ tag: 'OUTRO_ACTION' }]`; Echo injected side effects target → `[{ tag: 'OUTRO_ACTION' }]`; Set bonus targets → `[{ tag: 'AERO_EROSION_APPLIER' }]`; removed all action/CA imports |
| `src/data/gear/roverAero.ts` | Weapon group 1 targets → `[{ tag: 'HEAL_PROC' }]`; Weapon group 2 targets → `[{ tags: ['SKILL', 'HEAL_PROC'], match: 'all' }]` (uniquely identifies Unbound Flow = skill + heal); removed all action imports |
| `src/data/gear/mornye.ts` | Weapon target `['character']` → `[{ tag: 'LIBERATION' }]` (correct semantic intent) |

**Bloodpact's Pledge weapon group 2 targeting rationale:**  
`{ tags: ['SKILL', 'HEAL_PROC'], match: 'all' }` targets only actions tagged both SKILL and HEAL_PROC — which in Rover's kit is exclusively the Unbound Flow variants (skill_3). skill_1/skill_2 have `SKILL` only; liberation/midair have `HEAL_PROC` only. SKILL+HEAL_PROC together is the precise intersection.

---

## Future Work: Character Selection & Team Composition

### Goal

When a player opens the Rotation Editor page, they should be able to choose which 1–3 characters to bring into battle rather than having a hardcoded full team auto-loaded. The picker must enforce the 1–3 character limit. Any change to team composition must fully reset the rotation table and all derived state, for the same reason gear changes do: past timeline entries were computed with a specific set of characters and are no longer valid.

---

### Current State

`RotationEditorPage` currently hard-wires the full `characters` array (all 4 resolved characters) as `charactersInBattle`. There is no selection UI. The team is fixed at startup.

Key pieces of state and derived data in `RotationEditorPage` that all depend on which characters are in the team:

| State / Value        | What it is                                                 | Must reset on team change?                              |
| -------------------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| `resolvedCharacters` | `ResolvedCharacter[]` — the active team with gear resolved | Yes — replace with newly selected + resolved characters |
| `snapshots`          | `Snapshot[]` — past rotation steps                         | Yes — clear entirely                                    |
| `damageEvents`       | `DamageEvent[]` — damage events for the timeline           | Yes — clear entirely                                    |
| `timelineKey`        | `number` — React key that remounts `RotationEditor`        | Yes — increment to remount                              |
| `tableConfig`        | `TableConfig` — column layout derived from the active team | Yes — recompute via `buildTableConfig(newTeam)`         |
| `columnVisibility`   | `Record<string, boolean>` — which columns are shown        | Yes — reinitialise from the new `tableConfig`           |

`tableConfig` is currently computed at render time from the hardcoded `characters` array. Once team selection is added, it needs to be derived from the selected team (should become a `useMemo` or recomputed alongside character selection, not a plain const).

---

### What a Team Change Needs to Do

When the player confirms a team selection (replacing the current team with a new set of characters):

```ts
function handleTeamChange(selectedBaseCharacters: Character[]) {
  const newResolved = selectedBaseCharacters.map(c => resolveCharacter(c))
  const newTableConfig = buildTableConfig(newResolved)
  const newColumns = flattenTableColumns(newTableConfig)

  setResolvedCharacters(newResolved)
  setTableConfig(newTableConfig)
  setColumnVisibility(Object.fromEntries(newColumns.map(col => [col.key, true])))
  setSnapshots([])
  setDamageEvents([])
  setTimelineKey(k => k + 1)
}
```

This is the same pattern as gear change, extended to also rebuild `tableConfig` and `columnVisibility`.

---

### Where to Add the UI

The character selector should live in `RotationEditorPage` (or possibly a sibling component rendered near the top of that page). It does NOT belong inside `RotationEditor` or `RotationTable` — those components receive `charactersInBattle` as a prop and should not be responsible for deciding who is in the team.

Suggested placement: above the `<RotationEditor>` block, or accessible via a button/modal that opens a team picker. A simple design: show all available characters from `baseCharacters`, let the user toggle 1–3, confirm. Selecting fewer than 1 or more than 3 should be disabled/blocked.

---

### Gear Per Character After Team Change

Each character comes with their own default `gear` defined in their data file. When a character is added to the team, they resolve with their default gear. Any gear changes the player made to a character before swapping them out are lost when the team is reset — this is acceptable for now (gear overrides are not persisted). If persistence is added later, the gear override state per character would need to be stored separately (e.g. `Map<characterName, Gear>`) and re-applied when that character is selected.

---

### Relationship to Gear Change

Both team composition changes and gear changes are instances of the same broader pattern: **"the team setup changed, so the timeline is invalid."** They share the same reset logic. In the future it may make sense to unify them under a single `handleTeamSetupChange` or similar abstraction, but for now they can remain as separate handlers since their trigger points and data shapes differ.

The invariant from gear swapping still applies: always resolve characters from `baseCharacters`, never from a previously-resolved copy.

---

## Future Work: Gear Picker

### Design: Two-Mode Echo Picker

Echoes have individually rolled substats, so the picker cannot simply display a static list — the user needs to either select a pre-existing fully-defined echo or build a custom one with their own rolled stats.

**Mode 1 – Pre-defined echo**: Selects from `Echo` objects already defined in character gear files (`src/data/gear/*.ts`). These have all stats, icons, and skill data fully specified. The picker shows name, icon, main stat, and substats.

**Mode 2 – Custom echo**: The user provides:
1. An echo name from `echoCatalog.ts` (filtered by set to maintain correct set bonus)
2. Echo cost — looked up from the catalog (1, 3, or 4), determines available base stats and main stat options via `ECHO_COST_BASE_DATA`
3. Main stat (one of `ECHO_COST_BASE_DATA[cost].mainStatOptions`)
4. Up to 5 substats from `ECHO_SUBSTAT_VALUES`

For slot 1, custom echoes will have no `echoSkill` — the `ECHO` placeholder action stays in the rotation with no skill. Acceptable for initial implementation.

---

### Echo Catalog

**`src/data/gear/echoCatalog.ts`** (implemented):
- Maps every set name to an array of `EchoCatalogEntry` objects: `{ name, cost: 1|3|4, icon? }`
- Covers all 28 echo sets
- `icon` is `undefined` until assets are added to `public/assets/gear/echoes/`
- Utility functions:
  - `getEchoSets(echoName)` — returns all set names an echo belongs to
  - `getEchoCost(echoName)` — returns the echo's slot cost from the catalog

---

### Weapon Catalog

Weapons are static (no substat rolling). The picker shows all weapons matching `character.weaponType`. **`src/data/gear/weapons.ts`** is currently empty and needs to be populated with weapon definitions, grouped by `WeaponType`.

The confirmed call path on selection:
```ts
_onGearChange(characterName, { ...character.gear, weapon: selectedWeapon })
```

---

### Validation Rules

- **Weapon type**: Only show weapons where `weapon.weaponType === character.weaponType`
- **Echo cost budget**: Total echo cost across all 5 slots must not exceed 12
- **Slot 1 only**: `firstSlotStats` and `echoSkill` only apply to slot 1 — other slots ignore them

---

### UI Placement

`_onGearChange` is already threaded down to `CharacterProfileOverlay`. Click handlers for weapon and echo slots are stubbed with `console.log` TODOs. Picker modals or panels should be triggered from those handlers.

---

## What Remains

1. **Gear picker UI** — weapon picker and two-mode echo picker (modal/panel), wired through `_onGearChange`
2. **`src/data/gear/weapons.ts`** — populate with all weapon definitions grouped by `WeaponType`
3. **Mornye weapon modifiers** — `Starfield Calibrator` weapon effect data; tag target `{ tag: 'LIBERATION' }` already correct, `modifiers` array is empty
4. **Echo assets** — add `icon` paths to `echoCatalog` entries as images land in `public/assets/gear/echoes/`
5. **Character Selection UI** — team picker (1–3 characters) with full state reset on change
6. **Pre-existing type error** — `setLocalSequence(seq)` in `CharacterProfileOverlay.tsx` (known, out of scope)

---

## Key Invariants to Preserve

- **Never re-resolve from a `ResolvedCharacter`** — always re-resolve from `baseCharacters`. A `ResolvedCharacter` has already had gear modifiers injected; resolving it again would double-inject.
- **Echo set stats come from `echoSetRegistry`, not `gear.setBonus.stats`** — `setBonus.stats` is deprecated and ignored by the resolver. It remains in data files for human reference only.
- **5-piece injected modifiers stay in `gear.setBonus.injectedModifiers`** — these reference character-specific action objects and cannot be in the global registry.
- **Clone map must cover all actions and their coordinatedAttacks** — any action or CA not in the map will silently miss gear injection if it's a direct-reference target.
- **Tags are set at definition time** in character action data files, not derived at runtime. The `tags` field is plain data on the action/CA object.
- **Tag-based injection iterates `workingActions` directly** — no clone lookup required. Tags in gear files do NOT import or reference specific action objects.
- **Direct-reference injection (`originalToClone` path) is preserved** — both tag-based and direct-reference injection paths coexist.
- **`ActionTag` and `dmgType` are distinct** — `BASIC_ATTACK` tag targets an action's role in the combo system; `'BASIC'` damage type targets the damage calculation. They serve different purposes and are independent.
