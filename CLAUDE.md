# Battle Optimizer — Agent Guide

Wuthering Waves DPS rotation optimizer (React + Vite + TypeScript). The user builds a rotation row by row;
a pure simulation engine resolves each action into a `Snapshot` (full battle state) plus `DamageEvent`s.
Deeper docs: [DOCS/ARCHITECTURE.md](DOCS/ARCHITECTURE.md), [DOCS/CODEBASE_MAP.md](DOCS/CODEBASE_MAP.md),
[DOCS/ROTATION_FLOW.md](DOCS/ROTATION_FLOW.md), [DOCS/EFFECTS_GUIDE.md](DOCS/EFFECTS_GUIDE.md).

## Layers (dependencies point down only)

```
components/ pages/ contexts/ hooks/   React UI. Hooks are thin adapters: they call the engine and hold React state.
tableConfig/                          Table column definitions (render functions) + engine column-key derivation.
optimizers/                           MCTS rotation search, block optimizer. Pure, built on engine/.
persistence/                          localStorage + file I/O (rotations, snippets, settings).
engine/                               Pure simulation. No React, no DOM, no localStorage (one known exception below).
  simulation/   step → resolveAction → resolvers; outro/intro, autocast, replay, runRotation (import path)
  resolvers/    the per-row pipeline (R0..R9), one file per resolver
  castRules/    can-this-action-be-cast logic (available actions, must-chains, failure reasons)
  state/        snapshot/cooldown/energy/form/action helpers, row-0 creation
  modifiers/ negativeStatuses/ coordinatedAttacks/ damage/ gear/
data/                                 Static game content (characters, actions, gear, enemies) + authoring helpers.
types/                                Domain types only.
```

- `data/` may import `data/helpers/` and `engine/damage` side-effect calculators (authoring), never UI.
- Known exception: `data/actions/hiyuki/.../liberation.ts` reads `persistence/settingsStorage` at runtime.

## Conventions

- **File header**: every file starts with a one-line comment saying what it holds/does
  (`// ...` for TS/TSX, `/* ... */` for CSS). Then imports.
- **Comments** explain *why* and *how*, briefly. No essays, no restating the code.
- **Size**: logic/UI files stay small (aim < ~400 lines). Flat data tables (catalogs) may be longer.
- **Splitting a module**: `foo.ts` → `foo/` with focused files plus `foo/index.ts` re-exporting the
  public API, so importers don't change. Pure logic leaves components into sibling `.ts` files.
- **Sections**: `// ========== Name ====...` separators (existing style). Style: no semicolons, single quotes.

## Verify every change

```bash
npx tsc -b            # 7 pre-existing errors are known (see TODO/refactor-findings.md); add none
npx jest              # unit + golden tests; golden = bit-identical snapshots/damage/markup
npx eslint .
```

Golden tests (`tests/golden/`) lock the observable behaviour of the engine, optimizers, data and SSR markup.
A refactor must never need `UPDATE_GOLDEN=1`; only an intentional behaviour change regenerates them.
