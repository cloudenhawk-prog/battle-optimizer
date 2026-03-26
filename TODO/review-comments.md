
# src/utils/gear/computeStatBreakdown.ts
snapshot.buffs / snapshot.debuffs keys are normalized (spaces removed) when written by updateModifierStacks and when building status metadata, but this function treats the snapshot entry key as the modifier displayName. As a result, allModifiers.find(m => m.displayName === entry.displayName ...) will not match and active buffs/debuffs will be ignored. Normalize keys consistently (e.g., store/compare by displayName.replace(/\s+/g, '')) or build a lookup map from normalized key -> modifier blueprint.

# src/utils/gear/computeStatBreakdown.ts
Active modifier application is currently decided solely by mod.ownerCharacter === character.name (self vs team), but the runtime modifier system applies modifiers based on targetStrategy (self/active/all/activeAlly/nextSwap) via shouldApplyModifier/filterApplicableModifiers. This will incorrectly apply self-only and nextSwap buffs to other characters and apply active-only buffs to off-field characters. Consider reusing the same target-strategy logic when attributing stats for a specific character (at minimum handle self/all/active/activeAlly using snapshot.character as the active character).

# src/utils/gear/computeStatBreakdown.ts
This breakdown scales mod.characterStats by the snapshot stack count but does not apply the modifier's condition(ctx) multiplier. In the resolver pipeline, resolveDamageModifiers multiplies every modifier stat contribution by conditionMultiplier, and some conditions return non-boolean values (e.g. scaling with negative status stacks). Without applying the condition multiplier, both computeFinalStats and the displayed breakdown can diverge from the stats actually used in damage calculations for the selected snapshot.

Before:
const scaled = scaleStats(mod.characterStats, entry.stacks)

After:
    // Align with resolver behavior: apply the modifier's condition(ctx) multiplier.
    let conditionMultiplier = 1
    if (typeof (mod as any).condition === 'function') {
      try {
        const raw = (mod as any).condition({
          snapshot,
          character,
          allCharacters,
          modifier: mod,
        })
        if (typeof raw === 'number') {
          conditionMultiplier = raw
        } else if (typeof raw === 'boolean') {
          conditionMultiplier = raw ? 1 : 0
        }
      } catch {
        // If condition evaluation fails, fall back to multiplier 1 to preserve prior behavior.
        conditionMultiplier = 1
      }
    }
    const effectiveStacks = entry.stacks * conditionMultiplier
    if (effectiveStacks === 0) continue
    const scaled = scaleStats(mod.characterStats, effectiveStacks)


