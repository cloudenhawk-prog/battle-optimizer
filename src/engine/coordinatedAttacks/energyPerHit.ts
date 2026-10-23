// Per-hit energy generation of a coordinated attack: owner gets the full amount, allies their share.
import type { CoordinatedAttack } from '../../types/coordinatedAttack'
import type { StepContext } from '../../types/stepContext'
import type { ResolvedCharacter } from '../../types/character'
import type { CharacterStats } from '../../types/stats'
import { updateEnergyValue } from '../state/energyHelpers'

// ========== Per-hit Energy ==================================================================================================

// NOTE: mutates ctx.current.charactersEnergies[name] objects in place (owner and allies).
export function applyEnergyPerHit(ctx: StepContext, ownerCharacter: string, ownerCharObj: ResolvedCharacter, energyGenerated: CoordinatedAttack['energyGenerated']): void {
  const current = ctx.current
  const allCharacters = [ctx.character, ...ctx.allies]

  // Owner energy
  const ownerEnergies = current.charactersEnergies[ownerCharacter]
  if (ownerEnergies) {
    for (const gen of energyGenerated) {
      const max = ownerCharObj.maxEnergies?.[gen.energyType] ?? Infinity
      let amount = gen.amount
      if (amount > 0 && gen.scalingStat) {
        const scaling = (ownerCharObj.stats?.[gen.scalingStat as keyof CharacterStats] as number) ?? 1
        amount *= scaling
      }
      ownerEnergies[gen.energyType] = updateEnergyValue(ownerEnergies[gen.energyType], amount, max)
    }
  }

  // Ally energy share
  for (const ally of allCharacters) {
    if (ally.name === ownerCharacter) continue
    const allyEnergies = current.charactersEnergies[ally.name]
    const allyMax = ally.maxEnergies

    for (const gen of energyGenerated) {
      if (gen.share <= 0) continue
      if (!(gen.energyType in allyMax)) continue

      let amount = gen.amount * gen.share
      if (amount > 0 && gen.scalingStat) {
        const scaling = (ally.stats?.[gen.scalingStat as keyof CharacterStats] as number) ?? 1
        amount *= scaling
      }

      const prevValue = allyEnergies?.[gen.energyType] ?? 0
      const maxValue = allyMax[gen.energyType] ?? Infinity
      if (allyEnergies) {
        allyEnergies[gen.energyType] = updateEnergyValue(prevValue, amount, maxValue)
      }
    }
  }
}
