import type { StepContext } from '../../types/stepContext'

// ========== Stack Based Conditions ===============================================================

export function stacksOf(statusName: string) {
  return (ctx: StepContext): number => {
    const status = ctx.negativeStatusesInAction.find(ns => ns.negativeStatus.name === statusName)
    const stacks = status?.currentStacks ?? 0
    
    if (stacks === 0) return 0
    if (stacks <= 3) return 3
    if (stacks === 4) return 4
    if (stacks === 5) return 5
    return 6
  }
}

export function stacksOfCap(statusName: string) {
  return (ctx: StepContext): number => {
    const status = ctx.negativeStatusesInAction.find(ns => ns.negativeStatus.name === statusName)
    const stacks = status?.currentStacks ?? 0

    if (stacks > 5) return 5
    return stacks
  }
}

export function atLeastOneStackOf(statusName: string) {
  return (ctx: StepContext): number => {
    const status = ctx.negativeStatusesInAction.find(ns => ns.negativeStatus.name === statusName)
    const stacks = status?.currentStacks ?? 0
    return stacks >= 1 ? 1 : 0
  }
}

// ========== Always True ===============================================================

export function always() {
  return (): number => 1
}
