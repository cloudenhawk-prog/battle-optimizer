// verifyData(): runs the per-character checks and prints a collapsible pass/fail report; throws if any check failed.
import { characters } from '../../characters'
import { negativeStatuses } from '../../negativeStatuses'
import { verifyCharacter, type CharacterCheckResult } from './characterChecks'

// Blueprint files are intentionally excluded — they are not registered in the characters array.
export function verifyData(): void {
  const negativeStatusNames = new Set(Object.values(negativeStatuses).map(ns => ns.name))
  const results: CharacterCheckResult[] = characters.map(c => verifyCharacter(c, negativeStatusNames))

  const allErrors = results.flatMap(r => r.checks.filter(c => !c.ok))
  const totalChecks = results.reduce((sum, r) => sum + r.checks.length, 0)

  const summary = allErrors.length > 0 ? `%c[Data Check] ✓ ${totalChecks - allErrors.length} passed  %c✗ ${allErrors.length} failed` : `%c[Data Check] ✓ ${totalChecks} / ${totalChecks} passed`

  console.groupCollapsed(summary, 'color: #4caf50', ...(allErrors.length > 0 ? ['color: #f44336'] : []))

  for (const result of results) {
    const charErrors = result.checks.filter(c => !c.ok)
    const charColor = charErrors.length > 0 ? '#f44336' : '#4caf50'
    const charSummary = charErrors.length > 0 ? `%c✗ ${result.name} (${charErrors.length} error${charErrors.length > 1 ? 's' : ''})` : `%c✓ ${result.name} (${result.checks.length} checks)`

    console.groupCollapsed(charSummary, `color: ${charColor}`)
    for (const check of result.checks) {
      if (check.ok) {
        console.log(`%c  ✓ ${check.label}`, 'color: #4caf50')
      } else {
        console.error(`%c  ✗ ${check.label}: ${check.error}`, 'color: #f44336')
      }
    }
    console.groupEnd()
  }

  console.groupEnd()

  if (allErrors.length > 0) {
    throw new Error(`[Data] ${allErrors.length} data check(s) failed — see console for details`)
  }
}

