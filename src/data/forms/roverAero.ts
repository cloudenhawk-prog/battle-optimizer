import type { Form } from '../../types/form'

// ========== Test Forms for Rover (Aero) =====================================================================================
// These forms demonstrate the form system capabilities

/**
 * Base Form - Default form for Rover
 * All normal actions are available in this form
 */
export const roverAero_form_base: Form = {
  name: 'Base',
  displayName: 'Base Form',
  isDefault: true,
  // availableActions undefined = all actions available (except those locked to other forms)
}

/**
 * TEST FORM - Example alternative form
 * Demonstrates form-specific actions and form switching
 */
export const roverAero_form_test: Form = {
  name: 'TEST FORM',
  displayName: 'Test Form',
  isDefault: false,
  // availableActions undefined = all actions available (except those locked to other forms)
  icon: '/assets/test-form-icon.png', // Optional icon
}
