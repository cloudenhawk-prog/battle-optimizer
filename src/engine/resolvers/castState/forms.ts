// Form bookkeeping in the cast-state resolver: this action's form change, and the leaving character's swap-out reset.
import type { StepContext } from '../../../types/stepContext'
import { getDefaultFormName } from '../../state/formHelpers'

// ========== Form Change =====================================================================================================

export function applyFormChange(ctx: StepContext, charName: string): void {
  // Handle form changes if this action changes the character's form
  if (ctx.action.formChange) {
    ctx.current.charactersForms = {
      ...(ctx.prev.charactersForms ?? {}),
      [charName]: ctx.action.formChange,
    }
    ctx.logs.push({
      resolver: 'resolveCastState',
      message: `Form changed for ${charName}: ${ctx.prev.charactersForms?.[charName] || 'default'} → ${ctx.action.formChange}`,
      details: { formChange: ctx.action.formChange },
    })
  } else {
    // Preserve current form
    ctx.current.charactersForms = {
      ...(ctx.prev.charactersForms ?? {}),
    }
  }
}

// ========== Swap-Out Reset ==================================================================================================

/** On swap-out: reset the leaving character's form to default and clear any form-specific energies (if the form opts in). */
export function resetLeavingCharacterForm(ctx: StepContext, prevCharName: string): void {
  const prevChar = ctx.allies.find(a => a.name === prevCharName)
  if (prevChar?.forms && prevChar.forms.length > 0) {
    const prevCurrentFormName = ctx.current.charactersForms?.[prevCharName] ?? ''
    const defaultFormName = getDefaultFormName(prevChar)

    // Reset energies specified by the form that was active at swap-out time
    const prevForm = prevChar.forms.find(f => f.name === prevCurrentFormName)
    if (prevForm?.resetEnergiesOnSwapOut && prevForm.resetEnergiesOnSwapOut.length > 0) {
      const prevEnergies = { ...(ctx.current.charactersEnergies?.[prevCharName] ?? {}) }
      for (const energyType of prevForm.resetEnergiesOnSwapOut) {
        prevEnergies[energyType] = 0
      }
      ctx.current.charactersEnergies = {
        ...(ctx.current.charactersEnergies ?? {}),
        [prevCharName]: prevEnergies,
      }
    }

    // Reset to default form if the form opts in
    if (prevForm?.resetFormOnSwapOut && prevCurrentFormName !== defaultFormName) {
      ctx.current.charactersForms = {
        ...ctx.current.charactersForms,
        [prevCharName]: defaultFormName,
      }
      ctx.logs.push({
        resolver: 'resolveCastState',
        message: `Form reset for ${prevCharName} on swap-out: ${prevCurrentFormName || 'default'} → ${defaultFormName}`,
        details: { prevForm: prevCurrentFormName, defaultForm: defaultFormName },
      })
    }
  }
}
