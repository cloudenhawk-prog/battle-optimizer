// DEBUG console dump of each action's stored vs. re-evaluated damage, logged when the data overlay opens
import type { Snapshot } from '../../../types/snapshot'
import type { DamageEvent } from '../../../types/events'

/** Flags events whose average exceeds their crit value (stored, or after re-evaluating with all contributions). */
export function logDataOverlayDiagnostics(snapshot: Snapshot | null, damageEvents: DamageEvent[], contribGroupKeys: Set<string>) {
  console.group(`[DEBUG DataOverlay] opened — ${snapshot?.character ?? '?'} / ${snapshot?.action ?? '?'} (snap ${snapshot?.id})`)
  const allContribKeys = new Set(contribGroupKeys)
  const _dbgSeenActions = new Set<string>()
  for (const event of damageEvents) {
    if (_dbgSeenActions.has(event.actionName)) continue
    _dbgSeenActions.add(event.actionName)
    const storedOk = event.average <= event.criticalStrike + 0.01
    const prefix = storedOk ? '  ' : '⚠️STORED avg>crit'
    console.log(
      prefix,
      `[snap ${event.snapshotId}] ${event.actionName}`,
      '| stored avg:', Math.round(event.average),
      '| stored normal:', Math.round(event.normalStrike),
      '| stored crit:', Math.round(event.criticalStrike),
    )
    if (event.calcParams) {
      const reEval = event.calcParams.reEvaluate(allContribKeys)
      const reEvalOk = reEval.avg <= reEval.crit + 0.01
      const rePrefix = reEvalOk ? '  ' : '⚠️REEVAL avg>crit'
      console.log(
        rePrefix,
        `  reEval(allContribs) avg:`, Math.round(reEval.avg),
        '| normal:', Math.round(reEval.normal),
        '| crit:', Math.round(reEval.crit),
      )
    }
  }
  console.groupEnd()
}
