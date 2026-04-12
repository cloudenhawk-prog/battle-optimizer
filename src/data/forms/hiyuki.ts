import type { Form } from '../../types/form'
import { intro_outro_actions } from '../actions/hiyuki/actions'

export const form_present_self: Form = { // TODO
  name: 'Present Self',
  displayName: 'Present Self',
  introAction: intro_outro_actions.find(a => a.tags?.includes('INTRO_ACTION')),
  outroAction: intro_outro_actions.find(a => a.tags?.includes('OUTRO_ACTION')),
}

export const form_foreclaimed_self: Form = { // TODO
  name: 'Foreclaimed Self',
  displayName: 'Foreclaimed Self',
  resetFormOnSwapOut: false
}
