# General Overview

Purpose
- Give AI agents and contributors a fast, broad understanding of where major responsibilities live.
- Explain high-level boundaries so changes are made in the right layer.

Project Summary
- This project is a rotation optimizer and simulator for Wuthering Waves.
- Users build/edit a rotation in the UI; the engine resolves each step into battle state snapshots and damage events.
- The optimizer layer explores candidate rotations by replaying and scoring simulation results.

High-Level Layout
- src/components, src/pages, src/contexts, src/hooks: React UI and UI state wiring.
- src/engine: Pure simulation and cast logic.
- src/optimizers: Search/optimization algorithms built on top of engine behavior.
- src/data: Game content definitions (actions, characters, gear, modifiers, negative statuses, enemies).
- src/types: Domain types used across layers.
- src/persistence: localStorage and file import/export concerns.
- src/tableConfig: Table columns and UI-facing configuration derived for engine usage.
- tests: Unit + golden behavior coverage.

Dependency Direction (Intended)
- UI -> hooks -> engine + persistence + tableConfig.
- optimizers -> engine + data + types.
- engine -> types (+ data-compatible inputs), but no React/DOM/localStorage.
- data -> types, and selected pure helpers.

Simulation Core (Broad)
- Timeline is represented as snapshots.
- A step resolves one chosen action through ordered resolvers.
- Output includes updated snapshots and emitted damage events.
- Import/replay paths rebuild timeline deterministically from step lists.

Working Conventions
- Keep logic isolated from rendering.
- Keep data declarative (avoid embedding behavior in content unless explicitly needed).
- Prefer small focused modules over monolithic files where practical.

Forward Architecture Direction
- Current codebase has some large files and mixed concerns.
- Target direction is cleaner architecture boundaries:
  - Clear domain/application/infrastructure separation.
  - Thin orchestration in hooks/UI.
  - Engine modules with narrow, testable responsibilities.
  - Data authoring patterns that reduce ad-hoc exceptions.
