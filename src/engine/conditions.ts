import type { StepContext } from "../types/resolver"

// Sets multiplier by number of aero erosion stacks
export function stacksOf(statusName: string) {
  return (ctx: StepContext): number => {
    const status = ctx.negativeStatusesInAction.find(
      ns => ns.negativeStatus.name === statusName
    )
    console.log("Condition: stacksOf called with status.currentStacks: ", status?.currentStacks ?? 0)
    return status?.currentStacks ?? 0
  }
}
