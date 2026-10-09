# Shapley Attribution

## Implementation status — IMPORTANT: hybrid model, not full Shapley

The spec further down describes a **full Shapley** game where base damage is not pre-assigned to anyone.
The implementation (`splitEventByCharacter` in `src/engine/damage/contributionAttribution.ts`, used by the
Rotation Summary "Contribution" pie and the per-character "Damage origin") does **not** do that. It is a
**hybrid attribution model**:

- Per damage event, the **caster is not a player**. They are pre-assigned the base damage `v(∅)`: the event
  with no teammate buffs, but including the caster's own self buffs and inherent modifiers.
- The players are the **external buffer characters** (all of one character's buffs grouped as one player).
- **Shapley values split only the bonus** `v(N) − v(∅)` among those buffers. Efficiency still holds:
  caster share + Σ buffer shares = event damage.
- There is no `O` (environment) player; non-character dealers keep their own damage and are pooled as "Other".

Worked example — base 100, B and C each a ×1.5 all-damage multiplier, total 100 × 1.5 × 1.5 = 225:

| Model | A (dealer) | B (buff) | C (buff) |
|---|---|---|---|
| Hybrid (implemented) | 100 → 44.44% | 62.5 → 27.78% | 62.5 → 27.78% |
| Full Shapley (spec below) | 158.3 → 70.37% | 33.3 → 14.81% | 33.3 → 14.81% |

Hybrid answers *"who dealt the original damage, and who created the extra damage through buffs?"*.
Full Shapley answers *"who deserves credit for the whole output, including synergy?"*.

Note: the row detail's "Modifier Contributions" panel (`DataOverlay/shapley.ts`) is a different game again:
players are individual modifiers (inherent and self buffs included), the base is "no modifiers at all", and
percentages are relative to that base. Its numbers are not comparable to the summary pie.

### Consideration: should we move to full Shapley?

Open question, not decided. Points to weigh:

- **What full Shapley does here.** The dealer is a veto player: without them the event deals 0, so every buff
  is worthless alone. Full Shapley therefore hands the dealer a share of every buff's gain *and* of the
  synergy between buffs. Supports shrink a lot (27.8% → 14.8% in the example), and the gap grows with more
  buffers and more multiplicative stacking.
- **For hybrid.** It matches how players reason about supports ("this buff added X damage"). Synergy between
  buffers (the extra 25 above 50 + 50 in the example) is still split fairly among the buffers. The dealer's
  number is a stable, intuitive "what they do on their own kit".
- **For full Shapley.** It is the textbook fair allocation, symmetric in all characters, and matches the spec
  below (including a first-class `O` player). It credits the dealer for enabling buff value, which hybrid
  ignores entirely.
- **Cost.** Compute is not a concern (≤ 3 characters + `O` = 16 coalitions per event). The real cost is
  semantics: `v(S)` must be defined when the caster is absent (0 for their own events), the "Damage origin"
  self % would rise sharply, and the summary UI goldens would change.
- **Middle ground.** Keep hybrid as the default and offer full Shapley as a toggle on the Contribution pie,
  labelled with the question each one answers, rather than replacing one with the other.

---

## Original spec (full Shapley)

SHAPLEY ATTRIBUTION PROMPT (COMBAT SYSTEM)

You are given a cooperative game modeling a single combat event involving up to 3 characters plus a fourth non-character entity representing environmental/system effects.

0. PLAYERS IN THE GAME

Define the full player set:

N = {1, 2, 3, O}

Where:

1, 2, 3 = characters
O = “Other / Environment / Global Effects”

IMPORTANT:

O is a full first-class player in the cooperative game
O is NOT a residual bucket
O participates in coalition evaluation like any other player

Each character may contribute:

direct damage actions (multiple possible per event)
buffs affecting:
self
other characters
all characters
conditional targets depending on game state

O contributes:

environmental/system damage sources
global effects (DoTs, hazards, encounter mechanics)
passive or scripted damage events defined in snapshot_state
1. CORE OBJECTIVE

Compute exact Shapley values:

(φ_1, φ_2, φ_3, φ_O)
2. VALUE FUNCTION (CRITICAL — BLACK BOX RULE)

The combat system defines a deterministic engine.

For any subset S ⊆ N:

v(S) = Engine(snapshot_state, active_entities = S)

Where:

snapshot_state = full row state (all actions, buffs, parameters already defined)
active_entities = subset S
output = single scalar: total final damage
IMPORTANT RULES
The engine fully resolves all combat logic internally
No manual reconstruction of buffs, damage, or effects is allowed
No decomposition of damage types is allowed
No interpretation of internal mechanics is allowed
O must always be included/excluded exactly like other players in S
3. SHAPLEY DEFINITION (EXACT)
φ_i(v) = (1 / |N|!) * Σ_{R ∈ Π(N)} [ v(P_i^R ∪ {i}) - v(P_i^R) ]

Where:

N = {1,2,3,O}
|N| = 4
Π(N) = all permutations of N
P_i^R = set of players appearing before i in permutation R
4. EXPLICIT FORM

Since |N| = 4:

φ_i = (1 / 24) * Σ_{R ∈ Π(N)} [ v(P_i^R ∪ {i}) - v(P_i^R) ]
5. REQUIRED OUTPUTS
5.1 Coalition values
v(∅)

v({1}), v({2}), v({3}), v({O})

v({1,2}), v({1,3}), v({1,O}), v({2,3}), v({2,O}), v({3,O})

v({1,2,3}), v({1,2,O}), v({1,3,O}), v({2,3,O})

v({1,2,3,O})
5.2 Permutation marginal contributions

For each permutation R ∈ Π(N):

Marginal_i(R) = v(P_i^R ∪ {i}) - v(P_i^R)

P_i^R = set of players appearing before i in R
5.3 Full Shapley computation
φ_i = (1 / 24) * Σ_{R ∈ Π(N)} Marginal_i(R)
5.4 Final result vector
(φ_1, φ_2, φ_3, φ_O)
5.5 CONSISTENCY CHECK (must hold exactly)
φ_1 + φ_2 + φ_3 + φ_O = v({1,2,3,O}) - v(∅)
6. MODELING CONSTRAINTS
Base damage is NOT pre-assigned to any player
Buffs are NOT pre-attributed to outputs
All interactions are resolved only inside v(S)
Multiple damage sources are summed inside v(S)
O is treated symmetrically as a full player in all evaluations
7. HARD RULES (NO APPROXIMATIONS)

You MUST:

enumerate all 24 permutations explicitly
compute all marginal contributions exactly
avoid:
heuristic attribution
proportional splitting
log-space approximations
internal reinterpretation of mechanics outside the engine
8. INTERPRETATION RULE

Final Shapley values represent:

each entity’s fair marginal contribution to total event damage across all possible participation orders, including environmental/system contributions.

No internal breakdown of buffs, actions, or damage types is permitted unless explicitly requested.

9. KEY PRINCIPLE

All causality is defined exclusively through:

v(S)

No other representation of damage attribution is valid.


TLDR: We are not treating each buff as a player in the shapley calculations, but instead each character as a player; that way we will accurately find each player's contributions, and it would require much fewer permutations!