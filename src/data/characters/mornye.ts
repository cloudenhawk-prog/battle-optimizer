import type { Character } from '../../types/character'
import { form_baseline_mode, form_wide_field_observation_mode } from '../forms/mornye'
import { mornye_cost_1_echo_1, mornye_cost_1_echo_2, mornye_cost_3_echo_1, mornye_cost_3_echo_2, mornye_cost_4_echo_1, mornye_set_bonus, mornye_weapon } from '../gear/mornye'
import { mornye_inherentStats, mornye_stats } from '../stats/mornye'

export const mornye: Character = {
  name: 'Mornye',
  maxEnergies: {energy: 175, concerto: 100, forte: 100, relative_momentum: 100 },
  actions: [], // TODO
  damageModifiers: [], // TODO
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
    setBonus: mornye_set_bonus
  },
  defaultForm: 'Baseline Mode',
  forms: [form_baseline_mode, form_wide_field_observation_mode],
  sequence: 2
}
