You have already implemented the redesign for SummaryOverlay.

This is a STRICT CORRECTION PASS.
DO NOT rethink, DO NOT redesign, DO NOT restructure.

Only fix the remaining issues listed below.

---

## ❗ GLOBAL RULES

- Do NOT rewrite components
- Do NOT introduce new layout systems
- Do NOT add animations or decorative features
- Do NOT change structure unless explicitly required below
- Keep all existing changes intact unless they conflict with these fixes

---

## 🔧 REQUIRED FIXES

### 1. Field Time — Enforce FULL Consistency

Requirement:
ALL field time percentages MUST use totalFieldTime.

Do NOT assume this is already correct — VERIFY and FIX.

Checklist:
- Any `pct` or percentage calculation for field time MUST be:

pct = character.fieldTime / totalFieldTime

- Ensure:
- No remaining usage of `totalDuration` in field time bars
- No mixed logic (e.g. bar uses one value, label uses another)
- Sorting (if any) uses correct values

This must be consistent everywhere.

---

### 2. Resonator Breakdown — HARD Constrain Bars

Problem:
Bars are still implicitly scaling with container width.

Requirement:
Bars must be explicitly constrained, not indirectly via grid.

Fix:
- Inside each character card:
- Create a dedicated bar container
- Apply a max-width (or fixed width) to that container
- Bars must scale relative to THAT container only

Important:
- Do NOT rely on grid width to control bar size
- Do NOT allow bars to stretch full card width

Goal:
Bars have a consistent, controlled visual width regardless of layout.

---

### 3. Team Composition — Visual Alignment Consistency

Problem:
Structure is correct, but visual alignment may not match other sections.

Fix:
- Match spacing, font sizing, and alignment with Resonator Breakdown rows

Specifically:
- Label width and alignment should feel consistent
- Bar positioning should align visually with breakdown bars
- Value and % spacing should follow same rhythm

Do NOT redesign — just align styles.

---

### 4. Pie Chart — Color & Visual Quality (NOT Structure)

Current state:
- Simplified, but may now feel too flat or disconnected

Fix:
- Improve color harmony ONLY:
- Ensure colors match existing UI palette (same tone/saturation family)
- Slightly improve contrast between segments if needed

Do NOT:
- Add decorations
- Add animations
- Add extra SVG elements

Goal:
Make it feel like part of the same design system, not just a simplified chart.

---

### 5. Zero Filtering — Final Sweep

Ensure zero filtering is applied EVERYWHERE relevant.

Checklist:
- Resonator Breakdown ✅
- Team Composition ✅
- Global damage lists ✅
- ANY other mapped data lists → MUST also exclude 0 values

Rule:
If value === 0 → it should not render at all.

---

## ✅ OUTPUT EXPECTATION

- Minimal, surgical changes only
- No refactors
- No new abstractions
- No redesign attempts

---

If something is unclear:
→ Choose the simplest fix that satisfies the requirement
→ Do NOT invent new behavior

Proceed with corrections only.