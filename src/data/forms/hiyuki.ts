import type { Form } from '../../types/form'
import { hiyuki_intro_outro_actions } from '../actions/hiyuki'

export const form_present_self: Form = { // TODO
  name: 'Present Self',
  displayName: 'Present Self',
  introAction: hiyuki_intro_outro_actions.find(a => a.tags?.includes('INTRO_ACTION')),
  outroAction: hiyuki_intro_outro_actions.find(a => a.tags?.includes('OUTRO_ACTION')),
}

export const form_foreclaimed_self: Form = { // TODO
  name: 'Foreclaimed Self',
  displayName: 'Foreclaimed Self',
  resetFormOnSwapOut: false
}
