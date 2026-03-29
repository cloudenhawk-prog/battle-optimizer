# Gear-Swapping Framework — LLM Context File

## Project

**battle-optimizer** — A Wuthering Waves DPS rotation optimizer. React + TypeScript + Vite.  
The tool simulates skill rotations for a set of characters, computing damage output over a timeline.

---

## Task Summary

Implement a gear-swapping framework that allows characters' weapons and echoes to be changed at runtime, with the timeline resetting on every change. The picker UI itself is out of scope for now — only the types, resolver logic, data, and TODO-stubs for click handlers are in scope.

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

| File | Changes |
|---|---|
| `src/data/gear/cartethyia.ts` | `weaponType: 'Broadblade'` on weapon; `setName: 'Windward Pilgrimage'` on all 5 echoes |
| `src/data/gear/ciaccona.ts` | `weaponType: 'Rectifier'`; `setName: 'Gusts of Welkin'` |
| `src/data/gear/mornye.ts` | `weaponType: 'Rectifier'`; `setName: 'Halo of Starry Radiance'` |
| `src/data/gear/roverAero.ts` | `weaponType: 'Sword'`; `setName: 'Windward Pilgrimage'` |
| `src/data/characters/cartethyia.ts` | `weaponType: 'Broadblade'` |
| `src/data/characters/ciaccona.ts` | `weaponType: 'Rectifier'` |
| `src/data/characters/mornye.ts` | `weaponType: 'Rectifier'` |
| `src/data/characters/roverAero.ts` | `weaponType: 'Sword'` |

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
  setResolvedCharacters(prev => prev.map(c => c.name === characterName ? reResolved : c))
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
