import type { DamageType, ElementType, ScalingType } from '../../types/baseTypes'
import type { EnergyGeneration } from '../../types/energy'
import type { DamageModifier } from '../../types/modifiers'
import type { SideEffect, StatusModification } from '../../types/sideEffect'
import type { Action, CastConditions } from '../../data/actions/yangyang'

type BasicsStage = {
  multipliers: number[]
  energiesGenerated: EnergyGeneration[][]
  statusModifications: StatusModification[]
  damageModifiers: DamageModifier[]
  sideEffects: SideEffect[]
  other: {
    hardness: number[]
    toughness: number[]
    offtune: number[]
  }
}

export type BasicsData = {
  scaling: ScalingType
  elements: ElementType[]
  dmgTypes: DamageType[]
  cooldown: number
  castConditions: CastConditions
  stages: Record<number, BasicsStage>
}

export function buildBasicAction(params: {
  name: string
  displayName?: string
  basics: BasicsData
  fromStage: number
  toStage: number
}): Action {
  const {
    name,
    displayName = name,
    basics,
    fromStage,
    toStage
  } = params

  const stages = Object.entries(basics.stages)
    .filter(([stage]) => {
      const s = Number(stage)
      return s >= fromStage && s <= toStage
    })
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, stage]) => stage)

  return {
    name,
    displayName,
    castTime: 0,

    multipliers: stages.flatMap(s => s.multipliers),
    scaling: basics.scaling,
    elements: basics.elements,
    dmgTypes: basics.dmgTypes,
    cooldown: basics.cooldown,

    castConditions: basics.castConditions,

    energiesGenerated: stages.flatMap(s => s.energiesGenerated),
    energiesCost: [],

    statusModifications: stages.flatMap(s => s.statusModifications),
    damageModifiers: stages.flatMap(s => s.damageModifiers),
    sideEffects: stages.flatMap(s => s.sideEffects),

    other: {
      hardness: stages.flatMap(s => s.other.hardness),
      toughness: stages.flatMap(s => s.other.toughness),
      offtune: stages.flatMap(s => s.other.offtune),
    }
  }
}

export const repeatEnergy = (count: number, gen: EnergyGeneration[]) => Array.from({ length: count }, () => gen.map(g => ({ ...g })))
