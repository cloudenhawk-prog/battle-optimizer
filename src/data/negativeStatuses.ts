import type { NegativeStatus } from "../types/negativeStatus"

// Damage affectected by DEF, RES, Damage Reduction (and AERO EROSION dmg boost from Ciaconna)
export const negativeStatuses: Record<string, NegativeStatus> = {
    aeroErosion: {
        name: "Aero Erosion",
        duration: 15,
        maxStacksDefault: 3,
        frequency: 3,
        damage: {
            1: 1654,
            2: 4134,
            3: 8268,
            4: 12402,
            5: 16536,
            6: 20670,
            7: 24804,
            8: 28938,
            9: 33072,
        },
        element: "Aero"
    },
    spectroFrazzle: {
        name: "Spectro Frazzle",
        duration: 10, // TODO
        maxStacksDefault: 10, // TODO
        frequency: 1, // TODO
        damage: { // TODO
            1: 500,
            2: 1000,
            3: 1500,
            4: 2000,
            5: 2500,
            6: 3000,
            7: 3500,
            8: 4000,
            9: 4500,
            10: 5000,
        },
        element: "Spectro"
    }
}