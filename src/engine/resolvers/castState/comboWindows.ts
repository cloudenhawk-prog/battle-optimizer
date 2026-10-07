// Combo-window tracking: carries windows forward, flags swaps/form changes, opens a window when a starter is cast.
import type { StepContext } from '../../../types/stepContext'

// ========== Combo Windows ===================================================================================================

export function updateComboWindows(ctx: StepContext, charName: string, swapOccurred: boolean, prevCharName: string | undefined): void {
  // Handle combo windows: track actions that can start time-based combo chains
  // First, copy over existing combo windows and update their swap/form change flags
  ctx.current.charactersComboWindows = { ...(ctx.prev.charactersComboWindows ?? {}) }

  // Update swap flag for all characters that had an active combo window
  // Mark the outgoing character's combo window as interrupted by a swap
  if (swapOccurred) {
    // When a swap occurs, mark the previous character's combo window as swapped (it's no longer active)
    const updatedWindows: typeof ctx.current.charactersComboWindows = {}
    for (const [char, window] of Object.entries(ctx.current.charactersComboWindows)) {
      updatedWindows[char] = {
        ...window,
        wasSwapped: char === prevCharName ? true : window.wasSwapped,
      }
    }
    ctx.current.charactersComboWindows = updatedWindows
  }

  // Update form change flag if the current character changed form
  const prevForm = ctx.prev.charactersForms?.[charName]
  const newForm = ctx.current.charactersForms?.[charName]
  const didFormChange = !!ctx.action.formChange || prevForm !== newForm
  if (didFormChange && ctx.current.charactersComboWindows[charName]) {
    ctx.current.charactersComboWindows[charName] = {
      ...ctx.current.charactersComboWindows[charName],
      formChanged: true,
    }
  }

  // Record this action for potential combo window usage, but only if it is actually a combo
  // window starter (referenced in another action's comboWindow.previousActions).
  // Non-starter actions (e.g. intermediate mid-air attacks between Skill 1 and Skill 2) must
  // NOT overwrite the existing entry — the window must survive those intermediate actions.
  // The wasSwapped / formChanged flags set above still apply to the preserved entry.
  const isComboWindowStarter = ctx.character.actions.some(a =>
    a.castConditions.comboWindow?.previousActions.some(pa => pa.name === ctx.action.name)
  )
  if (isComboWindowStarter) {
    ctx.current.charactersComboWindows = {
      ...ctx.current.charactersComboWindows,
      [charName]: {
        actionName: ctx.action.name,
        startTime: ctx.fromTime, // Record cast start time
        wasSwapped: false, // Reset when a new combo window is opened
        formChanged: false, // Reset when a new combo window is opened
      },
    }
  }
}
