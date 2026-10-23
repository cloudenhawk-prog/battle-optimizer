// Cartethyia forms: Cartethyia (base) and Fleurdelys (after Liberation), with their intro/outro actions.
import type { Form } from '../../types/form'
import { cartethyia_intro_outro_actions, fleurdelys_intro_outro_actions } from '../actions/cartethyia/actions'

export const form_cartethyia: Form = {
  name: 'Cartethyia',
  displayName: 'Cartethyia',
  introAction: cartethyia_intro_outro_actions.find(a => a.dmgTypes.includes('INTRO')),
  outroAction: cartethyia_intro_outro_actions.find(a => a.dmgTypes.includes('OUTRO')),
}

export const form_fleurdelys: Form = {
  name: 'Fleurdelys',
  displayName: 'Fleurdelys',
  introAction: fleurdelys_intro_outro_actions.find(a => a.dmgTypes.includes('INTRO')),
}
