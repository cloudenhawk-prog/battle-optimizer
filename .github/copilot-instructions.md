# Copilot Code Review Instructions

## Primary Objective

Focus strictly on verifying that the code works as intended.

Reviews should prioritize:

* Correctness
* Logical errors
* Maintainability
* Code behavior matching the intended functionality
* Identifying logic that is overly complex, over-engineered, or unnecessarily complicated when a simpler implementation would achieve the same result

The main goal is to ensure the implementation behaves correctly and reliably.

Developers may include comments describing the intended behavior. Use those comments as guidance when evaluating whether the implementation matches the intended logic.

---

## What Copilot SHOULD Review

Copilot should focus on identifying issues such as:

* Logical mistakes
* Incorrect conditions or branching
* Potential bugs
* Edge cases that break expected behavior
* Maintainability concerns that may cause future bugs
* Code that contradicts the intended functionality described in comments
* Code that is unnecessarily complicated and could be simplified without changing behavior

If the implementation does not match the stated intent, highlight the discrepancy.

---

## What Copilot MUST NOT Review

Do NOT comment on:

* Spelling
* Grammar
* Wording
* Writing style
* Comment phrasing
* Documentation quality
* Naming style unless it causes functional confusion

Comments should only be mentioned if they clearly contradict the actual implementation or intended behavior.

---

## Tests

Do NOT review or comment on test files or test quality.

Tests should be ignored during code review.

---

## Noise Reduction

Avoid low-value or stylistic feedback.
Do not suggest cosmetic improvements that do not affect functionality.

Only provide feedback that directly impacts:

* correctness
* logic
* maintainability
* functional behavior
