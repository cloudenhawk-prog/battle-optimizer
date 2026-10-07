// R1 resolveTime: validates the step window and writes fromTime/toTime onto the row.
import type { StepContext } from '../../types/stepContext'

// ========== Resolver 1: Time ================================================================================================

export function resolveTime(ctx: StepContext): void {
  if (ctx.fromTime == null || ctx.toTime == null || ctx.fromTime > ctx.toTime || ctx.snapshotId !== Number(ctx.current.id)) {
    throw Error(`Resolver: resolveTime failed for snapshot ${ctx.current.id} with snapshotId=${ctx.snapshotId}, fromTime=${ctx.fromTime}, toTime=${ctx.toTime}`)
  }

  ctx.current.fromTime = ctx.prev.toTime
  ctx.current.toTime = ctx.prev.toTime + ctx.action.castTime

  ctx.logs.push({
    resolver: 'resolveTime',
    message: `Snapshot with id: ${ctx.snapshotId}: from ${ctx.current.fromTime}s to ${ctx.current.toTime}s`,
    details: { action: ctx.action.name },
  })
}
