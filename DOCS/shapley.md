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