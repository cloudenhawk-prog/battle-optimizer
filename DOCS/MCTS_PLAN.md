1. Goal + Output

Find the highest-DPS rotation(s) for a fixed team vs a fixed enemy.
Return top-N SavedRotation[] (from importExport.ts) — directly importable into the rotation editor.
Termination goal: fixed time budget (simulate N seconds) or fixed damage target (simulate until X damage dealt).
2. Configuration

3. State Representation (Node)

Each node carries a full clone of the simulation state reachable through it:

State is cloned at child-creation time, not lazily.

4. Choices — getMCTSChoices(snapshots, team)

Aggregates getAvailableActions across all team members and returns flat Choice[] ({ character, actionName }).

Must-chain priority: if any character has a must: true follow-up lock in snapshot.charactersAttemptFollowUp, return only that character's locked choice — nothing else.

engineStep is always called with autocastFollowUps: false inside MCTS. Optional (must: false) follow-ups are not auto-cast; they surface as regular choices.

5. Terminal Condition — isTerminal(snapshots, goal)

Last resolved snapshot = snapshots[snapshots.length - 2] (tail slot is always blank placeholder).

Time budget: lastResolved.toTime >= goal.seconds
Damage target: lastResolved.damage >= goal.amount
6. Scoring

Score is read only at terminal nodes:

No per-step intermediate scoring. This avoids front-loading bias — casting a high-DPS skill early doesn't get rewarded unless the rotation as a whole finishes with high total DPS.

Note on front-loading: total DPS does naturally reward damage dealt earlier (since it raises damage/time at the terminal step). This is correct behaviour — a rotation that finishes the time budget with damage concentrated early genuinely has better DPS. No special handling needed.

7. The Four MCTS Phases

Selection — UCB1 walk from root until a node with untried choices is found:

C is a tunable exploration constant (√2 as baseline). Left open for tuning.

Expansion — Pop one untried choice. Call:

Before calling engineStep, assign the chosen character to the current row via assignCharacterToRow (snapshotHelpers.ts). Create a child node from the result.

Rollout — From the child node, randomly sample getMCTSChoices and call engineStep until isTerminal. Returns score. Policy is left open — start with uniform random, revisit with heuristic weighting if convergence is slow.

Backpropagation — Walk from child back to root: visits += 1, totalScore += score.

8. Output — extractTopRotations(root, N) → SavedRotation[]

After all iterations, collect the N highest-scoring terminal paths. For each path, read the incomingChoice.character / incomingChoice.actionName chain from root to leaf → convert to RotationStep[] → wrap as SavedRotation.

This format is directly loadable by runImportSteps in the rotation editor — no conversion step needed.

9. File Structure (proposed)

10. Open Questions

#	Question	Notes
1	Rollout policy	Uniform random is the baseline. Weighted policy (by multiplier, resource efficiency, etc.) may help convergence. Decide during implementation.
2	Exploration constant C	Needs empirical tuning. Start at √2.
3	State clone depth	Verify shallow [...snapshots] is safe — resolvers copy-on-write. EngineState sub-arrays need spread clones.
4	Execution environment	Synchronous MCTS will block the browser. Web Worker or standalone Node script are both viable. Leave open.
5	Variable rollout length	Damage-target rollouts vary in length; time-budget rollouts are fixed-length. UCB1 scores are more comparable with fixed-length rollouts. May matter for search quality.
Relevant files

step.ts — engineStep, initEngineState, EngineState, assignCharacterToRow
choices.ts — getAvailableActions
snapshotHelpers.ts — assignCharacterToRow, createSnapshot
importExport.ts — SavedRotation, RotationStep (output format)
snapshot.ts — Snapshot.dps, Snapshot.damage, Snapshot.toTime, Snapshot.charactersAttemptFollowUp
MCTS_ENGINE_REFERENCE.md — full engine API reference
