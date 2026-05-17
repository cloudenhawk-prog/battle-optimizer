import type { Form } from '../../types/form'
import { lucila_intro, lucila_outro } from '../actions/lucila/others/introOutro'

export const form_default: Form = {
  name: 'Default Form',
  displayName: 'Default Form',
  introAction: lucila_intro,
  outroAction: lucila_outro,
}

// Reminiscence: entered via Liberation (Clear As Day), exited via Letting It Go.
// In this form, basic attacks and intro skill are replaced with Tracing Forms equivalents.
export const form_reminiscence: Form = {
  name: 'Reminiscence',
  displayName: 'Reminiscence',
  resetFormOnSwapOut: false,
  introAction: lucila_intro, // resolveVariant on intro handles Hard Cut variant in this form
}
