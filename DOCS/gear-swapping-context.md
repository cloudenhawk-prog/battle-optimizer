# Gear-Swapping Framework — LLM Context File

## Project

**battle-optimizer** — A Wuthering Waves DPS rotation optimizer. React + TypeScript + Vite.  
The tool simulates skill rotations for a set of characters, computing damage output over a timeline.

---

## Task Summary

Implement a gear-swapping framework that allows characters' weapons and echoes to be changed at runtime, with the timeline resetting on every change (as it does not support re-calculating the timeline). Some of this may be done, but we need: the types, resolver logic, data, and TODO-stubs for click handlers are in scope, and the UI picker.

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

## Future Work: Action Tags for Gear Effect Targeting

### Motivation

Currently, `InjectedModifier` and `InjectedSideEffect` targets are either `'character'` (applied to the character's global modifier list) or a **direct object reference** to a specific `Action` or `CoordinatedAttack`. This works for hand-authored gear data where the exact action objects are imported and referenced directly. It breaks down for:

- **Generic set/weapon effects** — e.g. "boost all healing skills", "apply to all skills that inflict Aero Erosion", "apply to the Outro skill" — these need to target actions by category, not by hardcoded reference.
- **Dynamically registered effects** — e.g. "every 3s heal for X" passed through a `SideEffect`, which itself may need to interact with HEAL-tagged actions or buff-tagged effects on other characters.
- **Gear swapping correctness** — when gear is swapped, injected effects from the old gear must be cleanly removed. Today this works because `resolveCharacter` always re-builds from the unmodified `baseCharacters` entry. But as effects grow more complex (multi-step chains, tag-conditional stacking), a robust tag system makes the "what does this piece of gear affect" fully declarative and auditable. Since a weapon can be added to any character, it shouldn't statically inject into specific character actions but instead be able to target them dynamically based on some logic.

The first part of this task may be to update the injection system. For example by having action define some kind of tags that tells us that "this trigers a heal", "this applies a certain negative status" "this counts as an outro skill", "this counts as a resonance skill", and so on. Also timed things like "something that heals every 3s for 25s" (not sure if this can be described as a modifier or something else) might want to have certain things injected into them so "TRIGGER ON HEAL" also work for these kinds of things rather than only an action itself.

---

### Proposed: Action Tags

Add a `tags?: string[]` (or `tags?: Set<string>`) field to the `Action` type (and potentially `CoordinatedAttack`).

Tags are plain string keywords. Examples (consider more and consider good names; names purposely don't overlap with dmgTypes and other names to avoid confusion):

| Tag                         | Meaning                                                                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `'HEAL_PROC'`               | This action heals one or more targets                                                                                                 |
| `'OUTRO_ACTION'`            | This action is the character's Outro skill                                                                                            |
| `'INTRO_ACTION'`            | This action is the character's Intro skill                                                                                            |
| `'ECHO SKILL'`              | This action is the slot-1 echo skill, perhaps we need one for triggering ECHO DMG versus casting ECHO SkILL - could wait until needed |
| `'AERO_EROSION_APPLIER'`    | This action applies Aero Erosion                                                                                                      |
| `'SPECTRO_FRAZZLE_APPLIER'` | This action applies Spectro Frazzle                                                                                                   |
| `'COORDINATED_ATTACK'`      | This action is a coordinated attack                                                                                                   |
| `'BASIC_ATTACK'`            | This action is a basic attack                                                                                                         |
| `'SKILL'`                   | This action is a skill cast                                                                                                           |
| `'LIBERATION'`              | This action is a liberation cast                                                                                                      |

...

(!) Could use "PROC" related to actions and let PROCS related to dmgTypes simply be found in action.dmgTypes list. That way we don't get overlap and cause use both
(!!) Important: BASIC_ATTACK descripes an action (this action is related to the basic attack combo system targeting effects like "When using a basic attack, active buff X") while dmgType BASIC descripes the type of damage being done (When dealing basic attack damage, actives buff X). These are distinct!

Tags are set in character action definitions (`src/data/characters/*.ts`), not derived at runtime.

---

### Proposed: Tag-Based Injection Targets

Extend `InjectedModifier` and `InjectedSideEffect` target types to support tag queries:
We might want to be able to target both tags and damage types (maybe even action names in very rare cases)

```ts
type InjectedTarget =
  | 'character'
  | Action // existing: exact reference
  | CoordinatedAttack // existing: exact reference
  | { tag: string } // new: inject into all actions with this tag
  | { tags: string[]; match: 'any' | 'all' } // new: multi-tag query
```

`resolveGear` would then need a second pass over `workingActions` matching by tag instead of by reference. The clone map remains necessary for the reference-based path; tag-based targeting iterates the full `workingActions` array directly.

---

### Proposed: Helper Functions

A set of helpers in e.g. `src/utils/gear/gearHelpers.ts` to make gear data authoring easier:

```ts
// Inject a modifier into all actions with a given tag
injectIntoTag(tag: string, modifiers: DamageModifier[]): InjectedModifier

// Inject a side effect into all HEAL actions
injectHealSideEffect(sideEffects: SideEffect[]): InjectedSideEffect

// Build a 5-piece set bonus that targets the Outro
outroSetBonus(modifiers: DamageModifier[]): EchoSetBonus
```

These make gear data files read like intent ("buff all heals") rather than requiring the author to import and reference specific action objects.

---

### Gear Swap & Effect Removal

The current approach already handles removal correctly: **`resolveCharacter` always re-runs from `baseCharacters`** (the unmodified source-of-truth), so every gear swap produces a clean slate with no leftover injections from previous gear.

This invariant **must be preserved** as tag-based injection is added:

- Never inject into a `ResolvedCharacter` directly.
- Always call `resolveCharacter(base, newGear)` where `base` comes from `baseCharacters`.
- `baseCharacters` entries must never be mutated — they are the reset point.

If at some point a "live patch" approach is considered (mutating a resolved character without full re-resolve), a snapshot of the pre-injection state per gear piece would be needed. This is significantly more complex and should be avoided unless re-resolve becomes a performance bottleneck.

---

### Interaction with CoordinatedAttacks and Timed Effects

Some gear effects fire on a schedule (e.g. "heal every 3s") rather than attaching to a specific player action. These are typically modelled as `SideEffect` entries injected into a triggering action (e.g. the action that activates the buff). If such an effect itself needs to interact with HEAL-tagged actions — e.g. "each time this periodic heal fires, also trigger X" — the tag system needs to be queryable at side-effect resolution time, not just at resolve-character time.

This may require `SideEffect` to carry tag-based trigger conditions alongside its existing condition system, and the resolver (`resolver_4_resolveSideEffectsAndStatuses`) would need to evaluate those against active action tags. This is a larger architectural change and should be designed carefully to avoid coupling the side-effect resolver too tightly to the gear layer.

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

## What Remains

### Picker UI (next major task)

The gear slot click handlers currently just `console.log` TODO messages. The next step is building actual weapon/echo picker modals or panels.

When a picker confirms a selection, it should call `onGearChange(characterName, newGear)` — where `newGear` is the character's full `Gear` object with the new weapon or echo swapped in.

**`_onGearChange` in `CharacterProfileOverlay`** is already threaded down from the page. It just needs:

1. The picker UI (modal, dropdown, or inline panel)
2. The call: `_onGearChange(characterName, { ...character.gear, weapon: selectedWeapon })` or equivalent for echoes
3. Weapon type validation: only show weapons where `weapon.weaponType === character.weaponType`
4. Echo cost validation: total echo cost must not exceed 12 across all 5 slots

### Known Pre-existing Issue (unrelated to this task)

`setLocalSequence(seq)` in `CharacterProfileOverlay.tsx` line ~1316 has a TypeScript error:  
`Argument of type 'number' is not assignable to parameter of type 'SetStateAction<0 | 1 | 2 | 3 | 4 | 5 | 6>'`.  
This was present before this task and is out of scope.

---

## Key Invariants to Preserve

- **Never re-resolve from a `ResolvedCharacter`** — always re-resolve from `baseCharacters`. A `ResolvedCharacter` has already had gear modifiers injected; resolving it again would double-inject.
- **Echo set stats come from `echoSetRegistry`, not `gear.setBonus.stats`** — `setBonus.stats` is deprecated and ignored by the resolver. It remains in data files for human reference only.
- **5-piece injected modifiers stay in `gear.setBonus.injectedModifiers`** — these reference character-specific action objects and cannot be in the global registry.
- **Clone map must cover all actions and their coordinatedAttacks** — any action or CA not in the map will silently miss gear injection if it's a target.
