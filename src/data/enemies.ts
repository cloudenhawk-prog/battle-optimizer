// Enemy roster (level + elemental resistances) used as the damage target.
import type { Enemy } from '../types/enemy'

// ========== Enemies ==========================================================================================================

export const enemies: Enemy[] = [
  {
    name: 'Birdy',
    stats: {
      level: 100, // NOTE: the in-game bird is level 85; 100 is used here
      aeroRES: 0.1,
      spectroRES: 0.1,
      havocRES: 0.4,
      glacioRES: 0.1,
      fusionRES: 0.1,
      electroRES: 0.1,
      resistance: 0.0,
      damageReduction: 0.0
    }
  }
]
