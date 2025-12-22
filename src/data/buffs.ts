import type { Buff } from "../types/buff"
import { addCharStats } from "../utils/dataCreators/modifiers"
import { activeTarget, infiniteExpiration } from "../utils/dataCreators/strategies"

// ========== Buffs ============================================================================================================

export const stellarRealmBuff: Buff = {
    name: "Stellar Realm",
    duration: 15,
    damageModifiers: [addCharStats( {critRate: 12.5, critDamage: 25 }, "Stellar Realm" )],
    expirationStrategy: infiniteExpiration(),
    targetingStrategy: activeTarget(),
    source: "Cartethyia"
}
