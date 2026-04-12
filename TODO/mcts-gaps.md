# MCTS Gaps vs App Action Selector

The app's `ActionSelect.tsx` (line 463) gates actions through more checks than `getAvailableActions`.
All three gaps are fixed in `getMCTSChoices` only — `getAvailableActions` stays minimal.

---

## Gap 1: `isMustChainUnsatisfiable` — FIXED ✅

**App source**: ActionSelect.tsx lines 371–372  
`isMustChainUnsatisfiable = !validateMustChain(action, prevSnapshot, character, actions)`

**Problem**: If an action has `attemptFollowUp.must = true` but the follow-up can't be cast
after the action completes (wrong form, insufficient energy, etc.), the app hard-blocks the parent action.
MCTS was scheduling such actions freely, which caused must-locks that could never resolve (stuck states).

**Fix**: After `getAvailableActions`, filter any action with a must follow-up using `validateMustChain`.

---

## Gap 2: `isFollowUpNotReady` (cooldown not cleared by action end) — FIXED ✅

**App source**: ActionSelect.tsx lines 349–368  
If the must follow-up's cooldown > action castTime, the action is hard-blocked.

**Problem**: `validateMustChain` checks position/form/energy but NOT cooldowns.
So an action that sets a must-lock for a follow-up that is still on cooldown at cast-end was allowed through.

**Fix**: In the same must-chain filter, check `charactersCooldowns[followUpCooldownKey] > resolvedCastTime`.
Uses resolved castTime (via resolveVariant) for consistency with our earlier requiresSwapOut fix.

---

## Gap 3: `requiresSwapOut` proactive +1s swap cooldown — FIXED ✅

**App source**: ActionSelect.tsx lines 340–352  
When a character is "swapping in" (active character ≠ previous on-field character), the character
being replaced will receive a 1-second swap cooldown during resolution — but that cooldown doesn't
exist in the snapshot yet. The app adds it proactively to the availability check.

**Problem**: MCTS's `requiresSwapOut` check didn't account for this, potentially allowing a
requiresSwapOut action where the only available "swap target" is the just-departed character who
will be locked for 1 second.

**Fix**: Replicate the `swappingIn` check in `getMCTSChoices`' `requiresSwapOut` block.

---

## Excluded / Non-issues

- **Permanent modifier pre-evaluation** (row 0 only, no DPS impact)
- **`autocastFollowUps`** (app default = `false`, same as MCTS)
- **Starting energy init** (both set `foreclaiming = 0` for Hiyuki; confirmed same behaviour)
- **`resolveVariant` for energy cost checking** — both app and MCTS use the unresolved `action.energyCost`
  for castability gating (via `isActionCastableInState`). This is consistent.
