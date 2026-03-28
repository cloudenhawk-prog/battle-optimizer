import type { Form } from '../../types/form'
import { cartethyia_intro_outro_actions,  } from '../actions/cartethyia'

export const form_baseline_mode: Form = {
  name: 'Baseline Mode',
  displayName: 'Baseline Mode',
  introAction: cartethyia_intro_outro_actions.find(a => a.dmgTypes.includes('INTRO')), // TODO
  outroAction: cartethyia_intro_outro_actions.find(a => a.dmgTypes.includes('OUTRO')), // TODO
}

export const form_wide_field_observation_mode: Form = {
  name: 'Wide Field Observation Mode',
  displayName: 'Wide Field Observation Mode',
} 
