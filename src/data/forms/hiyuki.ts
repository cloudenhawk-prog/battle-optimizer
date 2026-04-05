import type { Form } from '../../types/form'
import { hiyuki_intro_outro_actions } from '../actions/hiyuki'

export const form_default: Form = { // TODO
  name: 'Default',
  displayName: 'Default',
  introAction: hiyuki_intro_outro_actions.find(a => a.dmgTypes.includes('INTRO')),
  outroAction: hiyuki_intro_outro_actions.find(a => a.dmgTypes.includes('OUTRO')),
}

export const form_sakura: Form = { // TODO
  name: 'Sakura Blossom',
  displayName: 'Sakura Blossom',
  resetFormOnSwapOut: false
}
