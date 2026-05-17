import type { Character } from '../../types/character'
import { all_actions } from '../actions/lucila/actions'
import { lucila_inherentStats, lucila_stats } from '../stats/lucila'
import { form_default, form_reminiscence } from '../forms/lucila'
import { lucila_film_roll_proc } from '../sideEffects/sideEffects'
import { lucila_weapon, lucila_echo_main, lucila_echo_4cost, lucila_echo_3cost, lucila_echo_1cost_a, lucila_echo_1cost_b } from '../gear/lucila'

export const lucila: Character = {
  name: 'Lucila',
  element: 'GLACIO',
  weaponType: 'Rectifier',
  maxEnergies: {
    energy: 125,       // Used to cast Liberation (Clear As Day)
    concerto: 100,
    traces: 150,       // Forte resource: every 50 traces = 1 photo; max 3 photos conceptually
    film_roll: 10,     // Gained from consuming photos; used by Film Roll mechanic
  },
  hiddenEnergies: [],
  energyDescriptions: {
    energy: 'Used to cast Resonance Liberation - Clear As Day.',
    concerto: 'Used to cast Outro Skill and trigger Intro Skills.',
    traces: 'Forte resource. Every 50 Traces = 1 Photo (max 3). Consumed by Tracing Forms Stage 3 to fire Oblivion.',
    film_roll: 'Gained when consuming Photos (2 per photo). When teammates inflict Glacio Chafe, consumes 1 Film Roll to inflict Glacio Chafe 2 times.',
  },
  actions: [...all_actions],
  damageModifiers: [],
  stats: lucila_stats,
  inherentStats: lucila_inherentStats,
  gear: {
    weapon: lucila_weapon,
    echoSlots: {
      1: lucila_echo_main,
      2: lucila_echo_4cost,
      3: lucila_echo_3cost,
      4: lucila_echo_1cost_a,
      5: lucila_echo_1cost_b,
    },
    setBonus: null,
  },
  defaultForm: 'Default Form',
  forms: [form_default, form_reminiscence],
  sequence: 0,
  sequence_nodes: [
    // S1
    `While casting Resonance Skill - Phantom Frame to deploy Focus Ring and landing the cursor within Perfect Focus for the first time, Perfect Focus immediately fills up Focus Ring. Releasing the Resonance Skill while the cursor is within Perfect Focus increases Lucila's Crit. Rate by 20% for 10s.
Lucila is immune to interruption while casting Resonance Skill - Phantom Frame and deploying Focus Ring.
Resonance Skill - Spotlight and Basic Attack - Tracing Forms Stage 3 are immune to interruption.`,
    // S2
    `Outro Skill - Montage is enhanced:
- When in Resonance Mode - Glacio Chafe, nearby targets takes 120% Amplified damage from Glacio Chafe for 30s.
- When in Resonance Mode - Echo, grant 80% Echo Skill DMG Amplification to the incoming Resonator for 14s or until the Resonator is switched out.`,
    // S3
    `The DMG Multiplier of Letting It Go is increased by 100%.`,
    // S4
    `Oblivion pulls in nearby targets upon hit. While casting Oblivion, Lucila's ATK is increased by 10% for 6s, stacking up 3 times. All stacks are removed when the duration ends.
While casting Basic Attack - Tracing Forms Stage 3, Lucila takes 30% less DMG.`,
    // S5
    `The DMG Multiplier of Oblivion is increased by 50%.`,
    // S6
    `When in Reminiscence, each time Lucila consumes Photo she gains 1 Remembrance, stacking up 3 times. Each stack of Remembrance increases Letting It Go's damage dealt to the target by 30%. Casting Letting It Go removes all stacks of Remembrance.
Defeating a target with Letting It Go grants Lucila Longing: When not in combat, consume Longing, restoring 100% Resonance Energy and 150 Traces.`,
  ],
  sequence_nodes_icons: [
    'assets/characters/sequences/lucila_1.png',
    'assets/characters/sequences/lucila_2.png',
    'assets/characters/sequences/lucila_3.png',
    'assets/characters/sequences/lucila_4.png',
    'assets/characters/sequences/lucila_5.png',
    'assets/characters/sequences/lucila_6.png',
  ],
  image: '/assets/characters/lucila.png',
  teamActionTriggers: [
    {
      // Film Roll (Remembrance): when a teammate (not Lucila) inflicts Glacio Chafe,
      // Lucila consumes 1 Film Roll and inflicts Glacio Chafe 2 times.
      requiredTags: ['GLACIO_CHAFE_APPLIER'],
      condition: (ctx) => (ctx.prev.charactersEnergies['Lucila']?.film_roll ?? 0) >= 1,
      sideEffect: lucila_film_roll_proc,
      energyCost: [{ energyType: 'film_roll', amount: 1 }],
      propagateTags: ['GLACIO_CHAFE_APPLIER'],
    },
  ],
}
