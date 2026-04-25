# Sequence Optimizer Tool

## Goal

Allow the user to insert an **optimizer block** into any position in the rotation timeline. The block specifies a character and constraints. The tool enumerates all legal action sequences for that character within those constraints, replays the full rotation (block + everything after it) for each candidate, scores by overall DPS, and lets the user save/export/apply a winning sequence.

---

## User Flow

1. User builds a rotation in the editor as normal.
2. User inserts an "optimizer row" at the desired position in the table (via a button on any row).
3. Optimizer row renders visually distinct — shows character, duration range, required/banned actions summary.
4. User clicks "Configure & Run" on the row → opens the `OptimizerPanel` modal.
5. Modal: edit constraints → hit Run → progress indicator → results list (top-N, sorted by DPS).
6. Per result: **Save** (to saved rotations), **Export JSON**, or **Apply** (inserts the steps into the table and re-simulates).

---

## Architecture

### Key Invariant

Optimizer blocks are stored as **parallel state alongside `Snapshot[]`**, never injected into it. The engine pipeline stays completely untouched.

```
Rotation editor state:
  snapshots: Snapshot[]         ← pure engine output, unchanged
  optimizerBlocks: OptimizerBlock[]   ← parallel list, each has insertAfterRowIndex
```

The table renders rows by interleaving optimizer rows into the snapshot list at the right positions.

---

## New Files

| File | Purpose |
|---|---|
| `src/types/optimizerBlock.ts` | `OptimizerBlock` type |
| `src/utils/optimizer/enumerate.ts` | DFS enumeration of all legal sequences |
| `src/utils/optimizer/score.ts` | Replay post-block steps and return final DPS |
| `src/hooks/rotation-editor/useOptimizer.ts` | Orchestrates enumerate + score, exposes results + progress |
| `src/components/rotation-editor/OptimizerRow.tsx` | Optimizer row rendered in the table |
| `src/components/rotation-editor/OptimizerPanel.tsx` | Modal: constraint editing + results |

---

## Modified Files

| File | Change |
|---|---|
| `src/utils/importExport.ts` | Extend `RotationStep` to discriminated union; serialize/deserialize optimizer blocks |
| `src/hooks/rotation-editor/useSnapshots.ts` | Add `optimizerBlocks` state + CRUD actions |
| `src/hooks/rotation-editor/useImportExport.ts` | Add `applyOptimizerResult(blockIndex, steps)` |
| `src/components/rotation-editor/RotationTable.tsx` | Interleave optimizer rows; add "Insert optimizer block here" button |

---

## Type: `OptimizerBlock`

```ts
// src/types/optimizerBlock.ts
type RequiredAction = {
  action: string    // raw action name or groupName
  minCount: number  // must appear at least this many times
}

type OptimizerBlock = {
  id: string
  character: string
  minDuration: number           // seconds
  maxDuration: number           // seconds
  requiredActions: RequiredAction[] // actions that MUST appear a minimum number of times
  bannedActions: string[]       // action names that MUST NOT appear
  insertAfterStepCount: number  // how many user steps precede this block (0 = before all)
}
```

Each required action carries a `minCount` so you can express constraints like "Iai must appear at least 3 times" directly. The UI shows a count stepper next to each required action's ✓ button.

---

## Import/Export Format

`RotationStep` becomes a discriminated union. Old saves (plain `{character, action}`) remain valid — treated as `type: 'action'` on load.

```ts
type RotationStep =
  | { type: 'action';    character: string; action: string }
  | { type: 'optimizer'; config: OptimizerBlock }
```

Optimizer steps are saved in the `steps` array. On load:
- `type: 'action'` steps replay normally through `runImportSteps`
- `type: 'optimizer'` steps are reconstructed as `OptimizerBlock` entries; the `insertAfterRowIndex` tells the editor where to place them

---

## Enumeration Logic (`enumerate.ts`)

```
Input:
  preBlockSnapshot: Snapshot
  preBlockEngineState: EngineState
  config: OptimizerBlock

Output:
  CandidateSequence[]
    steps: { character, action }[]
    terminalSnapshot: Snapshot
    terminalEngineState: EngineState
```

**Algorithm:** DFS over action choices.

At each node:
1. Call `getAvailableActions(snapshot, character)` from `src/utils/engine/choices.ts`
2. Filter candidates:
   - Remove `action.castConditions.requiresSwapOut === true`
   - Remove actions in `config.bannedActions`
3. For each remaining action:
   - Run `engineStep(snapshots, character, action, engineState)`
   - Compute `currentDuration = newSnapshot.toTime - preBlockSnapshot.toTime`
   - **Prune** if `currentDuration > config.maxDuration` (don't recurse)
   - **Collect** as a valid leaf if `currentDuration >= config.minDuration` and all `requiredActions` have appeared in the path
   - Otherwise recurse

No global state mutations — every branch clones `Snapshot[]` and `EngineState` before calling `engineStep`. Use the same cloning pattern as `src/utils/mcts/node.ts` (`cloneSnapshots` / `cloneEngineState`).

**Complexity:** Naturally bounded by `maxDuration` pruning. At ~5 choices per step and ~5 steps (15s / 3s avg castTime), worst case ≈ 5^5 = 3,125 leaves. Well within synchronous execution.

---

## Scoring Logic (`score.ts`)

```
Input:
  candidate: CandidateSequence
  postBlockSteps: { character, action }[]   ← steps after the block in the current rotation

Output:
  score: number   (finalDPS from last resolved snapshot)
  valid: boolean  (false if post-block replay hits an illegal state)
```

Replay each post-block step through `engineStep` on top of the candidate's `terminalEngineState`. If any step throws or produces no valid continuation, mark `valid: false` and discard. Return `lastResolvedSnapshot.dps` as the score.

---

## `useOptimizer` Hook

```ts
// src/hooks/rotation-editor/useOptimizer.ts
function useOptimizer(
  snapshots: Snapshot[],
  blocks: OptimizerBlock[],
  allSteps: RotationStep[]    // full rotation steps, used to derive post-block portion
): {
  run: (blockId: string) => void
  results: RankedResult[]     // sorted by score descending
  isRunning: boolean
  progress: { done: number; total: number }
}
```

To derive `preBlockEngineState`:
- Replay from scratch using the import replay pattern (`runImportSteps`) up to `insertAfterRowIndex`
- This is already fast since it's the same as loading a saved rotation

Initially runs synchronously. If enumeration ever grows large enough to block the UI (>~10k candidates), move to chunked async with `setTimeout` batching (no Web Worker needed).

---

## `OptimizerPanel` Modal

Sections:
1. **Constraint editor** — character picker, min/max duration sliders, required actions multi-select, banned actions multi-select
2. **Run button** — triggers `useOptimizer.run(blockId)`; shows `progress.done / progress.total` while running
3. **Results list** — top-N sequences, each showing:
   - Overall DPS score
   - Action sequence (names + durations)
   - Total block duration
   - Buttons: **Save**, **Export JSON**, **Apply**

**Apply:** calls `applyOptimizerResult(blockIndex, steps)` which:
1. Removes the optimizer block from `optimizerBlocks`
2. Splices the winning `RotationStep[]` into the saved step list at the block's position
3. Calls `runImportSteps` to regenerate the full snapshot array

---

## `OptimizerRow` Component

Rendered in the table between the row at `insertAfterRowIndex` and the next row. Visually distinct (different background, no damage columns). Shows:
- Character name
- Duration range (`12s – 17s`)
- Required actions count / banned actions count
- "Configure & Run" button (opens `OptimizerPanel`)
- Delete button

---

## Constraints on Generated Sequences

The following are enforced by the enumerator:

| Constraint | Enforcement |
|---|---|
| `requiresSwapOut` actions excluded | Filter before DFS branching |
| Duration range | Prune when exceeded; collect only when met |
| Required actions (with minCount) | Each action's usage count tracked throughout DFS; leaf collected only when all counts meet their minimums |
| Banned actions | Filter before DFS branching |
| Legal cast conditions | `getAvailableActions` already handles cooldowns, forms, energy, combo windows, must-chains |
| Sequence continuity errors (e.g. post-block breaks) | Caught in `score.ts` replay — candidates marked invalid and discarded |

---

## Testing Plan

- Unit test `enumerate.ts`: small character action set, verify leaf count and constraint filtering
- Unit test `score.ts`: replay a known post-block sequence, compare DPS to manual expectation
- Manual: build a short Hiyuki rotation, insert an optimizer block, run it, apply a result, verify table re-simulates correctly
- Regression: load an old saved rotation JSON (no `type` field on steps) and verify it still loads without errors
