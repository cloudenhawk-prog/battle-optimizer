// Mornye — per-hit numbers (multiplier / energy / concerto / resources / offtune / persistence) shared by the basic attack variants.
// Per-stage values are summed by the chained variants (e.g. BA1-3 = BA1 + BA2 + BA3).

// BA1
export const BA1_multiplier = (22.27 + 2 * 16.71) / 100
export const BA1_energy = (0.35 + 2 * 0.27)
export const BA1_concerto = (1.12 + 2 * 0.84)
export const BA1_rest_mass_energy = 20
export const BA1_offtune = (0.11 + 2 * 0.08)
export const BA1_persistenceTime = 1.4

// BA2
export const BA2_multiplier = (23.86 + 23.86 + 4 * 17.90) / 100
export const BA2_energy = (0.38 + 0.38 + 4 * 0.29)
export const BA2_concerto = (1.20 + 1.20 + 4 * 0.90)
export const BA2_rest_mass_energy = 40
export const BA2_offtune = (0.12 + 0.12 + 2 * 0.09)
export const BA2_persistenceTime = 2.551

// BA3
export const BA3_multiplier = (41.36 + 6 * 10.34) / 100
export const BA3_energy = (0.65 + 6 * 0.17)
export const BA3_concerto = (2.08 + 6 * 0.52)
export const BA3_rest_mass_energy = 40
export const BA3_offtune = (0.21 + 6 * 0.05)
export const BA3_persistenceTime = 2.92

// Heavy Attack
export const heavy_multiplier = (44.14 + 99.02) / 100
export const heavy_energy = (0.93 + 2.08)
export const heavy_concerto = (2.96 + 6.65)
export const heavy_rest_mass_energy_cost = 100
export const heavy_offtune = 0.30 + 0.66

// Mode: BA1
export const MODE_BA1_multiplier = (4 * 13.92) / 100
export const MODE_BA1_energy = (4 * 0.22)
export const MODE_BA1_concerto = (4 * 0.35)
export const MODE_BA1_relative_momentum = 8
export const MODE_BA1_offtune = (4 * 0.07)

// Mode: BA2
export const MODE_BA2_multiplier = (4 * 25.85) / 100
export const MODE_BA2_energy = (4 * 0.41)
export const MODE_BA2_concerto = (4 * 0.64)
export const MODE_BA2_relative_momentum = 14
export const MODE_BA2_offtune = (4 * 0.13)

// Mode: BA3
export const MODE_BA3_multiplier = (4 * 9.31 + 2 * 33.09) / 100
export const MODE_BA3_energy = (4 * 0.15 + 2 * 0.52)
export const MODE_BA3_concerto = (4 * 0.23 + 2 * 0.82)
export const MODE_BA3_relative_momentum = 18
export const MODE_BA3_offtune = (4 * 0.05 + 2 * 0.17)
