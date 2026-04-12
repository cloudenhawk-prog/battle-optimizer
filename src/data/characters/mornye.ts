import type { Character } from '../../types/character'
import { all_actions } from '../actions/mornye'
import { form_baseline_mode, form_wide_field_observation_mode } from '../forms/mornye'
import { mornye_cost_1_echo_1, mornye_cost_1_echo_2, mornye_cost_3_echo_1, mornye_cost_3_echo_2, mornye_cost_4_echo_1, mornye_weapon } from '../gear/mornye'
import { mornye_inherentStats, mornye_stats } from '../stats/mornye'

export const mornye: Character = {
  name: 'Mornye',
  element: 'FUSION',
  weaponType: 'Broadblade',
  maxEnergies: {energy: 175, concerto: 100, rest_mass_energy: 100, relative_momentum: 100 },
  actions: [...all_actions],
  damageModifiers: [],
  stats: mornye_stats,
  inherentStats: mornye_inherentStats,
  gear: {
    weapon: mornye_weapon,
    echoSlots:  {
      1: mornye_cost_4_echo_1,
      2: mornye_cost_3_echo_1,
      3: mornye_cost_3_echo_2,
      4: mornye_cost_1_echo_1,
      5: mornye_cost_1_echo_2
    },
    setBonus: null
  },
  defaultForm: 'Baseline Mode',
  forms: [form_baseline_mode, form_wide_field_observation_mode],
  sequence: 2,
  sequence_nodes: [
    'Basic Attack – Wide Field Observation Mode becomes immune to interruption. The duration of Interfered Marker is extended by 150%. Interfered Marker now grants DMG increase even when the target is not affected by Tune Rupture - Interfered or Tune Strain - Interfered. When Mornye applies Observation Marker on a target, she also inflicts Interfered Marker.',
    'All nearby Resonators in the team gain Crit. DMG increase against targets with Interfered Marker: Every 1% of Mornye\'s Energy Regen over 100% grants 0.2% Crit. DMG increase, up to 32%. Syntony Field and High Syntony Field further increase the Off-Tune Buildup Rate of all nearby Resonators in the team by 20%.',
    'Casting Resonance Skill - Distributed Array additionally restores 25 points of Concerto Energy and 100 Relative Momentum, triggered once every 25s.',
    'The healing of High Syntony Field is increased by 30%.',
    'The DMG Multiplier of Resonance Liberation - Critical Protocol is increased by 40%. The DMG Multiplier of Tune Rupture Response - Particle Jet is increased by 160%.',
    'Resonance Liberation - Critical Protocol deals 400% more DMG. If Mornye has not engaged in combat for over 4s, she restores Resonance Energy equal to 10% of her Max Resonance Energy every 0.2s.'
  ],
  sequence_nodes_icons: [
    'assets/characters/sequences/mornye_1.png',
    'assets/characters/sequences/mornye_2.png',
    'assets/characters/sequences/mornye_3.png',
    'assets/characters/sequences/mornye_4.png',
    'assets/characters/sequences/mornye_5.png',
    'assets/characters/sequences/mornye_6.png',
  ],
  image: '/assets/characters/mornye.png',
}
