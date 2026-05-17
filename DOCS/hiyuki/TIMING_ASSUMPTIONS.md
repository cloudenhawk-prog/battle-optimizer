# Hiyuki Timing Assumptions

## Frame Rate

All frame data is recorded at **60 FPS**. Cast times in seconds are derived as `frames / 60`.

## Which Frame Column Is Used

Cast times use the **Frame Perfect Buffer (FPB)** column from `actions_frame_counts.csv`.

**Assumption**: FPB represents the earliest frame at which the game accepts a chained input and begins transitioning to the next action. This is preferred over *Earliest Frame Until Cancel* because:

- "Earliest Frame Until Cancel" requires all hit instances to have landed, which may not be the tightest possible cancel window in practice.
- FPB does not account for hitlag, making it the more consistent baseline for chaining actions in an optimized rotation.

**If this assumption is wrong**: revert `Cancel (FPB)` in `own_intepretation.csv` back to the values in the *Earliest Frame Until Cancel* column of `actions_frame_counts.csv`, and update `values.ts` accordingly.

## Time Stop

When a skill has Time Stop frames equal to its FPB (e.g. Ult1, Ult2, UFHA), the effective cast time would be zero. These are clamped to a minimum of **0.01 s** to avoid division-by-zero or zero-duration actions in the optimizer.

## Swap Cancel Time

The global constant `SWAP_CANCEL_TIME = 0.15 s` is used as the cast time for all *Cancel With Swap* variants. It represents the minimum time before Hiyuki can be swapped out after inputting a swap.

## NoSwap Offset

Some actions have a `NoSwap` value > 0, meaning the game prevents a swap for that many frames even after the action is technically cancellable. For those actions, the swap cancel cast time is:

```
castTime = no_swap_time + SWAP_CANCEL_TIME
```

Currently only **FHA** (Present Self Enhanced Heavy Attack) has a non-zero NoSwap value (120 frames = 2.0 s), so its swap cancel cast time is `2.0 + 0.15 = 2.15 s`.
