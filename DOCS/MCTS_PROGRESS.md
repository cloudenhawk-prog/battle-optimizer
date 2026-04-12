# MCTS Implementation Progress

## Status: Baseline complete — not yet runnable end-to-end

The core search loop, node structure, scoring, and output conversion are all implemented and type-check cleanly. What is missing before the first real run can happen is a script entry point and some open correctness questions that should be validated before drawing conclusions from results.

---

## What is done

| Module | File | Status |
|---|---|---|
| Choice enumeration | `src/utils/mcts/choices.ts` | Done |
| Node type + state cloning | `src/utils/mcts/node.ts` | Done |
| Termination + scoring | `src/utils/mcts/score.ts` | Done |
| MCTS loop (select / expand / rollout / backprop) | `src/utils/mcts/search.ts` | Done |
| Output → SavedRotation[] | `src/utils/mcts/output.ts` | Done |
| Pure engine step | `src/utils/engine/step.ts` | Done (prev sprint) |
| Pure action selector | `src/utils/engine/choices.ts` | Done (prev sprint) |

---

## What is needed before first run

### 1. Entry point script
There is no runner yet. Needs to be a Node.js script (or browser console call) that wires up:
- the character team from `src/data/characters.ts`
- an enemy from `src/data/enemies.ts`
- a `TerminationGoal`
- calls `runMCTS(config)` → `extractTopRotations(terminalNodes, N)`
- prints or saves the resulting `SavedRotation[]` to a JSON file

The MCTS modules have no browser dependencies, so a plain Node.js script (e.g. `scripts/run-mcts.ts`, run via `ts-node` or `tsx`) works without a build step.

### 2. Validate initial snapshot choices
`getMCTSChoices` is called on the initial snapshot (id: '0') before any action has been taken.
At this point `charactersAttemptFollowUp`, `charactersForms`, `charactersPositions` etc. are all empty.
Verify that `getAvailableActions` returns sane results (non-empty, correct set of actions) given a fresh snapshot.

### 3. Validate `engineStep` with empty `characterColumnsMap`
The MCTS passes `characterColumnsMap: {}` (empty). The engine calls `createSnapshot` with it at the end of each step. Confirm `createSnapshot` handles empty maps cleanly (it iterates `charactersMap` keys for energies, so it should be fine — but worth a quick check).

---

## Known limitations and potential improvements

### Correctness

- **`customCanCast` not evaluated** — actions with custom runtime cast conditions (e.g. "only when buff X is active") are still offered as choices even when they would not fire in the real game. These actions will produce 0 damage but consume a rotation slot. Impact depends on how many data actions use this field. Mitigation: post-filter `getAvailableActions` results with `customCanCast` before returning from `getMCTSChoices`.

- **Outro/Intro cost not reflected in choices** — `getMCTSChoices` does not warn that swapping to a different character will silently insert 2 extra rows (outro + intro). The MCTS does not "see" this as a cost when selecting a choice; it only discovers the cost after `engineStep` runs. This is correct MCTS behaviour (the engine is the ground truth) but may slow convergence if swap costs are high.

- **Optional follow-ups as free choices** — `must: false` follow-ups surface as regular choices. The MCTS may learn to skip them even when they are the optimal play. This is intentional per the design, but worth re-evaluating if results look suboptimal.

- **Initial snapshot vs UI snapshot** — `createMCTSInitialSnapshot` skips the permanent-modifier pre-evaluation that `createEmptySnapshot` performs. Permanent buffs that use `condition()` checks will not appear in row 0. This does not affect DPS computation (resolvers correct it on the first step) but means the first row's buffs display would be wrong if imported.

### Performance

- **Full `Snapshot` clone per node** — `cloneSnapshots` spread-clones every snapshot in the array. For long rollouts the array can grow to 50–100+ rows. This is the main memory and CPU hotspot. Optimization: only clone the tail snapshot(s) that are actually mutated during expansion, and share the rest as a read-only prefix. Requires verifying resolvers never mutate earlier rows (they should not — all resolver writes go to `current`).

- **No pruning / early termination** — the rollout has a hard `maxSteps = 500` guard but no smarter stopping criterion (e.g. stop if no choices are available or if DPS stops improving). A game tree that loops without hitting the goal wastes iterations.

- **Main-thread blocking** — `runMCTS` is synchronous. Running 5000+ iterations on the browser main thread will freeze the UI. Execution environment options (not yet decided):
  - Web Worker — keeps the UI live; requiries message passing for team/enemy/config
  - Standalone Node.js/`tsx` script — simplest for development; output saved as JSON, then imported manually

- **Tree memory** — every expanded node retains its full `Snapshot[]` and `EngineState`. With many iterations the tree can be large. If memory becomes a concern: stop storing snapshots on fully-backed-up nodes (only terminal nodes along best paths need them for output reconstruction).

### Search quality

- **Rollout policy is uniform random** — planned to be revisited. Candidates: weight by action `multiplier`, prefer actions that spend accumulated energy, prefer on-cooldown-free actions.

- **Exploration constant C = √2 is not tuned** — √2 is the theoretical optimum for rewards in [0, 1]. DPS values are much larger. Either normalise scores before backpropagation or tune C empirically.

- **No transposition table** — identical game states reached via different paths are explored independently. A transposition table keyed by a canonical snapshot hash would allow evidence sharing across paths.

- **Fixed team, fixed enemy** — the search is single-scenario. Generalisation to multiple enemies or team compositions would require running separate searches (or reusing the tree with transplanted roots).

---

## Suggested next steps (in order)

1. Write `scripts/run-mcts.ts` entry point and run a small test (100 iterations, 10s goal, current team).
2. Confirm output `SavedRotation[]` loads cleanly into the rotation editor.
3. Check `customCanCast` actions in the data — if any exist, add the post-filter to `getMCTSChoices`.
4. Scale up iterations and observe convergence.
5. Normalise scores for UCB1 (or tune C empirically).
6. Profile cloning cost and apply prefix-sharing optimisation if warranted.
7. Move to a Web Worker once the algorithm is stable.