import type { NegativeStatus } from "../types/negativeStatus"

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
        element: "AERO",
        reductionStrategy: {
            stackConsumption: 999,
            triggerDmgOnReduction: false,
            resetTimerOnApplication: true,
        }
    },
    spectroFrazzle: {
        name: "Spectro Frazzle",
        duration: 12,
        maxStacksDefault: 10,
        frequency: 3,
        damage: {
            1: 1225,
            2: 2223,
            3: 2896,
            4: 3792,
            5: 4688,
            6: 5584,
            7: 6480,
            8: 8196,
            9: 9192,
            10: 10188,
        },
        element: "SPECTRO",
        reductionStrategy: {
            stackConsumption: 1,
            triggerDmgOnReduction: true,
            resetTimerOnApplication: false,
        }
    }
}


// Cant implement until ELEMENT is implemented - also pass through seperate damage calculator than normally - relies on fewer things

// TODO - define a reduction strategy?
    // number  : X stacks down per time                          (100 = default for wiping all stacks)
    // boolean : trigger dmg on stack reduction or not           (true = damage dealt)
    // bolean  : timer reset on application or not               (false = timer based on the very first stack)

    // Remember to check which occured first in a snapshot: Did stacks disappear/reduce or did a proc occur

// Aero Erosion:
    // 100
    // false
    // true

    // 1 stack down
    // Damage only trigger every 3 seconds from the first stack is applied
    // On application, the duration resets, but the interval is unaffected
    // Interval unaffected



// Spectro Frazze:
    // 1
    // true
    // false


    // 1 stack down
    // Damage trigger on reduction (before the reduction happen, i.e. with the previous amount of stacks)
    // on application, stacks goes up but the 3 second timer interval is unaffected
    // Interval unaffected

