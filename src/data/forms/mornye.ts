import type { Form } from '../../types/form'
import { mornye_intro_outro_actions } from '../actions/mornye'

export const form_baseline_mode: Form = {
  name: 'Baseline Mode',
  displayName: 'Baseline Mode',
  introAction: mornye_intro_outro_actions.find(a => a.dmgTypes.includes('INTRO')),
  outroAction: mornye_intro_outro_actions.find(a => a.dmgTypes.includes('OUTRO')),
}

export const form_wide_field_observation_mode: Form = {
  name: 'Wide Field Observation Mode',
  displayName: 'Wide Field Observation Mode',
}
