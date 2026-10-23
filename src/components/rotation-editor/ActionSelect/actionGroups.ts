// Pure grouping for the action dropdown: variants → groups (by groupName) → categories in display order.
import type { ActionCategory } from '../../../types/action'
import { isActionBlocked, type ActionState, type MissingEnergy } from './actionAvailability'

// ========== Types ============================================================================================================

export type ActionGroup = {
  groupKey: string // The key used for grouping (groupName or action.name)
  displayName: string // What to show in the UI
  isGroup: boolean // Whether this represents multiple actions
  variants: ActionState[] // All action states in this group
  isSelectable: boolean // Whether any variant is selectable
  isCurrent: boolean // Whether any variant is current
}

// Desired order for categories, if present. Categories not listed here are appended at the end.
const PREFERRED_CATEGORY_ORDER = ['Basics', 'Skills', 'Echo Skill', 'Other', 'Testing'] satisfies ActionCategory[]

// ========== Grouping =========================================================================================================

/** Groups action states by groupName (or name for standalone actions), keeping first-seen order. */
export function buildActionGroups(actionStates: ActionState[]): ActionGroup[] {
  const actionGroups: ActionGroup[] = []
  const groupMap = new Map<string, ActionState[]>()

  for (const actionState of actionStates) {
    const groupKey = actionState.action.groupName || actionState.action.name
    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, [])
    }
    groupMap.get(groupKey)!.push(actionState)
  }

  for (const [groupKey, variants] of groupMap.entries()) {
    const isGroup = variants.length > 1 || variants[0].action.groupName !== undefined
    const isSelectable = variants.some(v => !isActionBlocked(v))
    const isCurrent = variants.some(v => v.isCurrent)

    actionGroups.push({
      groupKey,
      displayName: isGroup ? variants[0].action.groupName || variants[0].action.name : variants[0].action.name,
      isGroup,
      variants,
      isSelectable,
      isCurrent,
    })
  }
  return actionGroups
}

/**
 * Buckets groups by category (derived from the actions present, so any ActionCategory shows up
 * without a code change) and sorts groups alphabetically within each category.
 */
export function groupByCategory(actionGroups: ActionGroup[]) {
  const preferredCategoryOrder = PREFERRED_CATEGORY_ORDER
  const presentCategories = [...new Set(actionGroups.map(g => g.variants[0].action.category))]
  const orderedCategories = [...preferredCategoryOrder.filter(c => presentCategories.includes(c)), ...presentCategories.filter(c => !preferredCategoryOrder.includes(c))]
  return orderedCategories
    .map(category => ({
      category,
      groups: actionGroups.filter(g => g.variants[0].action.category === category).sort((a, b) => a.displayName.localeCompare(b.displayName)),
    }))
    .filter(categoryGroup => categoryGroup.groups.length > 0)
}

// ========== Display formatting ===============================================================================================

/** "current/needed type" list shown when energy is short. */
export function formatMissingEnergy(missingEnergy: MissingEnergy[]): string {
  return missingEnergy.map(e => `${e.current.toFixed(2)}/${e.needed} ${e.type}`).join(', ')
}

/** Stack counter "cur/max | recharge" (recharge only while it ticks). */
export function formatStacks({ current, max, rechargeTime }: { current: number; max: number; rechargeTime: number }): string {
  return `${current}/${max}${rechargeTime > 0 ? ` | ${rechargeTime.toFixed(1)}s` : ''}`
}
