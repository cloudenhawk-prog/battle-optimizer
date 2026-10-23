# Data Guides

Purpose
- Clarify the intent of key data properties and domain objects.
- Help both users and AI agents author/modify data consistently.

Core Data Domains
- Actions: cast definitions and gameplay effects.
- Modifiers: buffs/debuffs and conditional stat changes.
- Negative statuses: enemy/player status systems with stack/timing behavior.
- Coordinated attacks: triggered damage/heal style effects tied to runtime conditions.
- Characters/forms/stats: identity, stat models, and form-dependent behavior.

1. Action Data Intent
- name: Unique runtime identifier for exact variant.
- displayName: Human-facing label.
- groupName: Logical action family used for grouped selection/cooldown sharing.
- variantName: Human-readable variant label inside a group.
- variantIntent: Normalized semantic intent for variant reasoning (for example default, swap-cancel, dash-cancel).
- autoVariantLimited: Marks variants that should not be auto-preferred except when context requires them.
- castTime: Action execution duration used by timeline timing.
- multiplier/scaling/elements/dmgTypes: Damage model inputs.
- energyGenerated/energyCost: Resource flow definition.
- castConditions: State/form/chain restrictions and swap behavior semantics.
- sideEffects/statusModifications/damageModifiers/coordinatedAttacks: Non-direct and direct effect payloads.

2. Cast Condition Semantics (Authoring Intent)
- startState/endState: Required starting position and resulting end position.
- swapOutState + requiresSwapOut: Variant explicitly represents swapping out during/after cast.
- preventsSwapOut: Variant completes fully and should not permit swap-out semantics.
- requiredForms/customCanCast/comboWindow/requiredComboTags/blockedComboTags:
  Constraints that encode advanced sequencing rules.

3. Modifier Data Intent
- Modifiers should be declarative and composable.
- Keep trigger conditions explicit and avoid hidden coupling to unrelated systems.
- Prefer consistent scopes (self, ally, enemy, global) and clear lifetime/expiration conditions.

4. Negative Status Data Intent
- Model stack behavior, duration, application source, and refresh/overwrite rules explicitly.
- Keep damage-impacting links deterministic so replay/golden behavior remains stable.

5. Data Authoring Principles
- Favor convention-over-configuration where possible.
- Keep variants grouped and semantically normalized.
- Avoid creating near-duplicate variants unless gameplay behavior is observably different.
- Keep data files focused; split by feature/character/form if files grow too large.

6. Common Pitfalls
- Ambiguous variant naming that does not map to intent.
- Mixing UI-only concerns into data models.
- Encoding runtime logic in data where a simulation helper should own it.
- Introducing behavior differences between editor path and replay/import path.

7. Forward Data Direction
- Incrementally move toward cleaner schemas with explicit semantics and fewer one-off exceptions.
- Support future clean-architecture efforts by keeping data layer declarative and engine layer authoritative for behavior.
