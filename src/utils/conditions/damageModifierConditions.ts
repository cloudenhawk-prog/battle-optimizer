import type { StepContext } from "../../types/stepContext"

// ========== Set Multiplier By Number of Negative Status Stacks ===============================================================

export function stacksOf(statusName: string) {
  return (ctx: StepContext): number => {
    const status = ctx.negativeStatusesInAction.find(
      ns => ns.negativeStatus.name === statusName
    )
    return status?.currentStacks ?? 0
  }
}
