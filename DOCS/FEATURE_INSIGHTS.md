# Feature Insights and Main Flows

Purpose
- Provide focused context for AI agents working on main product flows.
- Reduce time spent rediscovering how end-to-end behavior is stitched together.

1. Rotation Editing Flow
- User picks character/action per row in the rotation editor.
- Selection triggers engine execution or replay, producing updated snapshots.
- Autocast, outro/intro, and follow-up logic may insert additional rows/events.
- Timeline rows show resolved action identity and resulting state.

2. Replay/Import/Export Flow
- Portable format stores user steps as (character, action).
- Import/load re-simulates from a fresh baseline snapshot.
- Append and edit-mode insertion also use replay to preserve deterministic state.
- Export/write paths serialize user-intent steps (not transient engine-only rows).

3. Variant Selection Flow
- Actions can have grouped variants under a shared groupName.
- System supports dynamic variant resolution at runtime.
- Auto-variant behavior now infers more of the user intent (for example swap-driven cancel choice) and recalculates affected rows.
- Variant policies should stay deterministic and explainable.

4. Cast Rules and Validation
- Castability is determined by state, resources, cooldowns, combo/state restrictions, and custom checks.
- Blocking reasons are surfaced in UI availability states.
- Replay/import should fail with clear step-level reasons when cast conditions are not met.

5. Damage/Modifiers/Statuses Flow
- Resolver pipeline applies timing, damage modifiers, side effects, coordinated attacks, resources, cooldowns, and cast-state updates.
- Negative statuses and modifiers are tracked as active runtime entities and re-applied over time.
- Damage events should remain reproducible for the same inputs.

6. Optimizer Flow (Broad)
- Optimizers generate candidate action sequences.
- Candidate tails are replayed/scored through the same simulation behavior.
- Correctness depends on parity between editor simulation and optimizer replay.

7. Testing Expectations
- Unit tests cover helper/resolver behavior.
- Golden tests lock observable outcomes for timeline and damage behavior.
- Refactors should preserve behavior unless intentionally changing rules.

Feature Work Guidance
- Prefer changing shared simulation/replay paths over one-off UI hacks.
- If a change affects step semantics, verify editor, import/export, and optimizer paths stay aligned.
