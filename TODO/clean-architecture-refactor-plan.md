# Clean Architecture Refactor Plan

## Objective
Create a stable, phased refactor plan that improves separation of concerns, keeps behavior unchanged, and makes code easier to locate and maintain.

This plan applies clean architecture principles pragmatically to the current codebase:
- Keep UI composition in UI files
- Move derivation and decision logic into focused pure modules
- Keep engine logic framework-free and side-effect-free
- Keep persistence concerns at the infrastructure boundary

## Decisions Locked
- 300 lines is a guideline for non-data, non-style files, not an absolute hard limit.
- Scope includes both UI and engine.
- Sequence is low-risk first, then high-risk/high-coupling files.
- Refactors should preserve behavior unless explicitly planned otherwise.
- Files should include a minimalistic description at the top that intuitively explain the responsibility and use of the file - keep brief enough that a human can read it in 30 seconds at most, but long enough that a human would be able to fit the broad pieces together without having to look through the code itself.

## Scope
### In Scope
- React UI files in `src/components`, `src/hooks`, `src/pages`, `src/contexts`
- Engine helper/orchestration files in `src/engine`
- Optimizer orchestration files in `src/optimizers`

### Out of Scope (for this campaign)
- Data catalogs and large declarative data files in `src/data`
- Stylesheets in `src/styles`
- Tests in `tests`

## Architecture Guardrails
### Dependency Direction
- UI layer can depend on hooks/application adapters and pure engine selectors/helpers.
- Engine layer must not depend on React, DOM, or localStorage.
- Persistence remains infrastructure and should not leak into engine.
- Existing known exceptions are tracked and should be explicitly addressed later.

### Splitting Triggers
Refactor when any of the following are true:
1. File is over 300 LOC and contains 2+ responsibilities.
2. File is over ~220 LOC and mixes rendering with heavy domain logic.
3. File has high change frequency and low discoverability even if under line threshold.

Allow an exception only if:
- Responsibility is clearly singular.
- Complexity is low enough to stay readable.
- Rationale is documented at file top.

### Standard Split Pattern
When splitting a large file:
1. Convert file to a folder with focused modules plus `index.ts` re-export.
2. Preserve public import path compatibility when possible.
3. Extract in this order:
- Pure derivation logic (`selectors`, `formatters`, `model`)
- Action/state mutation helpers (`actions`, `reducers`, `mutations`)
- Presentational units (`*View`, `*Panel`, `*Row`)
- Keep top-level orchestration file thin

## Refactor Waves

## Phase A: Baseline and Tracking
1. Confirm candidate list and risk classification.
2. Open tracking checklist for each target file.
3. Add a short exception template for any file intentionally left >300 LOC.

Deliverable:
- Stable file-by-file backlog with owner/risk/status.

## Phase B: Wave 1 (Quick Wins, Low Risk)
Primary goal: establish repeatable split conventions with low regression risk.

Target files:
- `src/components/rotation-editor/RotationTable.tsx`
- `src/components/rotation-editor/StatusDetailPanel.tsx`
- `src/components/rotation-editor/BuildOptimizerOverlay/ConfigDrawer.tsx`
- `src/components/rotation-editor/DataOverlay/DataOverlay.tsx`
- `src/optimizers/buildOptimizer/candidates.ts`

Expected outcomes:
- Thinner component shells
- Extracted pure helpers
- Clear module placement patterns for future waves

## Phase C: Wave 2 (High Value, Higher Risk)
Primary goal: decouple deeply mixed logic while preserving output behavior.

Engine-heavy targets:
- `src/engine/modifiers/modifierHelpers.ts`
- `src/engine/negativeStatuses/negativeStatusHelpers.ts`
- `src/engine/coordinatedAttacks/processCoordinatedAttacks.ts`
- `src/engine/gear/computeStatBreakdown.ts`

UI + behavior-coupled targets:
- `src/components/rotation-editor/ActionSelect/actionAvailability.ts`
- `src/components/rotation-editor/DamageTimeline.tsx`
- `src/components/rotation-editor/CharacterStateTracker.tsx`

Orchestration boundary targets:
- `src/hooks/rotation-editor/useImportExport.ts`
- `src/components/rotation-editor/ImportExportPanel.tsx`
- `src/engine/simulation/runRotation.ts`

Execution approach:
- Handle one high-coupling area at a time.
- Validate before moving to the next target.

## Phase D: Optional Wave 2.5
- `src/optimizers/blockOptimizer/enumerate.ts`
- `src/components/rotation-editor/BuildOptimizerOverlay/BuildOptimizerOverlay.tsx`
- `src/components/rotation-editor/CharacterProfileOverlay/CharacterProfileOverlay.tsx`

Run this phase only if Wave 2 velocity and regression profile are healthy.

## Conventions for All Refactors
- Every file starts with a one-line purpose header comment.
- Comments explain why/how, and a oneliner 'what'
- Keep existing section separator style.
- Favor small focused modules (target ~200-250 LOC where practical after split).
- Keep naming and placement predictable so code is easy to locate.

## Verification Gates
### After each target file
- Run targeted tests for affected area.
- Run local type/lint checks if touched surface is broad.

### After each wave
Run full project checks:
1. `npx tsc -b`
2. `npx jest`
3. `npx eslint .`

### High-risk behavior lock
For simulation/cast-rule/timeline modules:
- Compare representative before/after rotation outcomes.
- Treat unintended output differences as regressions.
- Only accept behavior changes when explicitly intended and documented, or when strong evidence that it should work in a specific way.

## Risk Management
- Prefer small commits with single-file or single-concern scope.
- Avoid mixing architectural moves with behavior changes in same commit.
- Keep old import shape through re-export barrels while migrating.
- If a split increases cognitive load, rollback that split design and re-cut boundaries.

## Done Criteria
A target area is considered done when:
1. Responsibilities are clearly separated.
2. Top-level orchestration file is thin.
3. Dependency direction is preserved.
4. Verification gates pass.
5. Any >300 LOC exception has documented rationale.

## Suggested Tracking Fields
Use these fields in a checklist table or issue tracker:
- File
- Risk (Low/Medium/High)
- Current LOC
- Target structure
- Owner
- Status
- Verification result
- Exception rationale (if needed)

## Next Execution Step
Start with Wave 1 file splits in parallel where independent, beginning with:
1. `src/components/rotation-editor/StatusDetailPanel.tsx`
2. `src/components/rotation-editor/RotationTable.tsx`
3. `src/optimizers/buildOptimizer/candidates.ts`
