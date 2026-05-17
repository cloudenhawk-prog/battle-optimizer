// ========== Default Form =====================================================================================================

// BA Stage 1
const BA1_multiplier = (59.29) / 100
const BA1_energy = (1.07)
const BA1_concerto = (1.71)
const BA1_offtune = (0.34)
const BA1_castTime = 0.3 // TODO

// BA Stage 2
const BA2_multiplier = (26.89 + 40.34) / 100
const BA2_energy = (0.49 + 0.73)
const BA2_concerto = (0.78 + 1.16)
const BA2_offtune = (0.19 + 0.29)
const BA2_castTime = 0.3 // TODO

// BA Stage 3 - Commendable
const BA3_multiplier = (235.27) / 100
const BA3_energy = (4.23)
const BA3_concerto = (6.77)
const BA3_offtune = (1.35)
const BA3_traces = 50                         // Restores 50 Traces (= 1 photo)
const BA3_castTime = 0.3 // TODO

// Skill — Phantom Frame → Spotlight (treated as one combined cast)
// Phantom Frame hits (14.13% × 3) + Spotlight hits (82.35% + 82.35% + 274.48% + 109.80%)
const skill_multiplier = (3 * 14.13 + 82.35 + 82.35 + 274.48 + 109.80) / 100
const skill_energy = (3 * 0.45 + 4.19 + 4.19 + 13.94 + 5.58)
const skill_concerto = (3 * 1.05 + 1.02 + 1.02 + 3.40 + 1.36 + 20)  // +20 additional from Spotlight mechanic
const skill_offtune = (3 * 0.14 + 0.14 + 0.14 + 0.46 + 0.18)
const skill_traces = 50                       // Restores 50 Traces from Spotlight (= 1 photo)
const skill_cooldown = 16
const skill_castTime = 0.3 // TODO

// Liberation — Clear As Day
const liberation_multiplier = (142.74) / 100
const liberation_energy_cost = 125
const liberation_concerto = 20
const liberation_film_roll = 4                // Gains 4 Film Roll (Memory Palace forte circuit)
const liberation_cooldown = 25
const liberation_offtune = (3.84)
const liberation_castTime = 0.3 // TODO

// ========== Reminiscence Form ================================================================================================

// Tracing BA Stage 1
const tracingBA1_multiplier = (30.64 + 45.95) / 100
const tracingBA1_energy = (1.02 + 0.65)
const tracingBA1_concerto = (1.02 + 1.52)
const tracingBA1_offtune = (0.14 + 0.21)
const tracingBA1_castTime = 0.3 // TODO

// Tracing BA Stage 2
const tracingBA2_multiplier = (59.77 + 89.65) / 100
const tracingBA2_energy = (0.84 + 1.26)
const tracingBA2_concerto = (1.98 + 2.96)
const tracingBA2_offtune = (0.27 + 0.40)
const tracingBA2_castTime = 0.3 // TODO

// Tracing BA Stage 3 (47.87% × 8)
const tracingBA3_multiplier = (8 * 47.87) / 100
const tracingBA3_energy = (8 * 0.67)
const tracingBA3_concerto = (8 * 1.58)
const tracingBA3_offtune = (8 * 0.21)
const tracingBA3_castTime = 0.3 // TODO

// Oblivion — side effect fired once per photo consumed during Tracing BA3
// Considered as Basic Attack DMG in Glacio Chafe mode
const oblivion_multiplier = (285.48) / 100
const oblivion_concerto_per_photo = 5         // +5 Concerto per photo consumed
const oblivion_film_roll_per_photo = 2        // +2 Film Roll per photo consumed (Remembrance)
const oblivion_offtune = (0.96)

// Letting It Go (84.81% × 3 + 593.64%)
const lettingItGo_multiplier = (3 * 84.81 + 593.64) / 100
const lettingItGo_energy = (3 * 0.34 + 2.34)
const lettingItGo_concerto = (3 * 0.79 + 5.51)
const lettingItGo_offtune = (3 * 0.37 + 2.56)
const lettingItGo_castTime = 0.3 // TODO

// ========== Others — Intro / Outro ===========================================================================================

// Intro: Clip It (Default Form)
const clipIt_multiplier = (105.77) / 100
const clipIt_energy = (11.90)
const clipIt_concerto = (4.49 + 10)           // +10 Concerto Regen from triggering Intro Skill
const clipIt_traces = 100                     // Restores 100 Traces (= 2 photos)
const clipIt_offtune = (0.61)
const clipIt_castTime = 0.3 // TODO

// Intro: Clip It: Hard Cut (Reminiscence Form)
const clipItHardCut_multiplier = (44.83 + 104.59) / 100
const clipItHardCut_energy = (3.63 + 8.47)
const clipItHardCut_concerto = (1.48 + 3.45 + 10)  // +10 Concerto Regen from triggering Intro Skill
const clipItHardCut_traces = 100              // Restores 100 Traces (= 2 photos)
const clipItHardCut_offtune = (0.20 + 0.47)
const clipItHardCut_castTime = 0.3 // TODO

export {
  // Default Form — BA
  BA1_multiplier, BA1_energy, BA1_concerto, BA1_offtune, BA1_castTime,
  BA2_multiplier, BA2_energy, BA2_concerto, BA2_offtune, BA2_castTime,
  BA3_multiplier, BA3_energy, BA3_concerto, BA3_offtune, BA3_traces, BA3_castTime,

  // Default Form — Skill / Liberation
  skill_multiplier, skill_energy, skill_concerto, skill_offtune, skill_traces, skill_cooldown, skill_castTime,
  liberation_multiplier, liberation_energy_cost, liberation_concerto, liberation_film_roll, liberation_cooldown, liberation_offtune, liberation_castTime,

  // Reminiscence Form — Tracing BA
  tracingBA1_multiplier, tracingBA1_energy, tracingBA1_concerto, tracingBA1_offtune, tracingBA1_castTime,
  tracingBA2_multiplier, tracingBA2_energy, tracingBA2_concerto, tracingBA2_offtune, tracingBA2_castTime,
  tracingBA3_multiplier, tracingBA3_energy, tracingBA3_concerto, tracingBA3_offtune, tracingBA3_castTime,

  // Oblivion (side effect)
  oblivion_multiplier, oblivion_concerto_per_photo, oblivion_film_roll_per_photo, oblivion_offtune,

  // Reminiscence Form — Letting It Go
  lettingItGo_multiplier, lettingItGo_energy, lettingItGo_concerto, lettingItGo_offtune, lettingItGo_castTime,

  // Intro
  clipIt_multiplier, clipIt_energy, clipIt_concerto, clipIt_traces, clipIt_offtune, clipIt_castTime,
  clipItHardCut_multiplier, clipItHardCut_energy, clipItHardCut_concerto, clipItHardCut_traces, clipItHardCut_offtune, clipItHardCut_castTime,
}
