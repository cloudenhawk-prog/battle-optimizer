import type { Form } from '../../types/form'
import { cartethyia_actions, fleurdelys_actions, universal_actions, cartethyia_intro_outro_actions, fleurdelys_intro_outro_actions } from '../actions/cartethyia'

export const form_cartethyia: Form = {
  name: 'Cartethyia',
  displayName: 'Cartethyia',
  availableActions: [...cartethyia_actions, ...universal_actions],
  introAction: cartethyia_intro_outro_actions.find(a => a.dmgTypes.includes('INTRO')),
  outroAction: cartethyia_intro_outro_actions.find(a => a.dmgTypes.includes('OUTRO')),
  icon: '/assets/temp-path.png'
}

export const form_fleurdelys: Form = {
  name: 'Fleurdelys',
  displayName: 'Fleurdelys',
  availableActions: [...fleurdelys_actions, ...universal_actions],
  introAction: fleurdelys_intro_outro_actions.find(a => a.dmgTypes.includes('INTRO')),
  icon: '/assets/temp-path.png'
}
