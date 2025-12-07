
type NegativeStatus = {
    name: string
    duration: number
    maxStacksDefault: number,
    frequency: number,
    damage: Record<number, number>,
    element: string
    // TODO: debuffs or other mechanics
}

export type { NegativeStatus }