/**
 * Catalog of all echo names organized by echo set.
 *
 * Used by the gear picker to populate the echo selection (both pre-defined and custom echo modes).
 * A catalog entry contains all static properties of an echo — everything except rolled main/substats,
 * which are chosen by the user when building a custom echo instance.
 *
 * Cost values represent the echo's slot cost in the echo loadout (max total cost: 12 across 5 slots).
 *   - 4 (CALAMITY class): Boss echoes, Nightmare: variants, Reminiscence: variants
 *   - 3 (ELITE class): Named non-boss enemies
 *   - 1 (COMMON class): Small common enemies
 */

import type { Action } from '../../types/action'
import type { Echo, EchoConditionalStats, InjectedModifier, InjectedSideEffect } from '../../types/gear'
import type { CharacterStats } from '../../types/stats'
import { nightmareKelpieOutroTrigger } from '../sideEffects/sideEffects'
import { buildBaseStats } from './echoStats'

export type EchoCatalogEntry = {
  name: string
  setName: string
  cost: 1 | 3 | 4 // 4 costs always have 150 flat attack, 3 costs always have 100 flat attack, 1 costs always have 2280 flat HP
  icon: string
  info_icon: string
  info: string
  /**
   * Stats applied only when this echo occupies slot 1 (the main echo slot).
   * Populated from the echo's passive description (e.g. "gains 10.00% Aero DMG Bonus").
   * Used by the picker to assemble a correct Echo object when building a custom echo for slot 1.
   */
  firstSlotStats?: Partial<CharacterStats>
  echoSkill?: Action
  injectedModifiers?: InjectedModifier[]
  injectedSideEffects?: InjectedSideEffect[]
  conditionalStats?: EchoConditionalStats
}

// ========== Shared Echo Skills ================================================================================================
// Defined once here and referenced by catalog entries — the same echo skill appears in multiple sets.

const echoSkill_reminiscenceFleurdelys: Action = {
  name: 'Reminiscence: Fleurdelys (Active)',
  displayName: 'Reminiscence: Fleurdelys (Active)',
  category: 'Echo Skill',
  castTime: 0,
  multiplier: (8 * 27.36 + 136.8) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['ECHO'],
  cooldown: 20,
  energyGenerated: [{ energyType: 'energy', amount: 8 * 0.38 + 1.9, share: 0.5, scalingStat: 'energyPercent' }],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: { startState: 'ANY', endState: 'PRESERVE' },
  offtune: 0,
}

const echoSkill_nightmareKelpie: Action = {
  name: 'Echo Skill',
  displayName: 'Nightmare: Kelpie (Active)',
  category: 'Echo Skill',
  castTime: 0,
  multiplier: 405 / 100,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['ECHO'],
  cooldown: 25,
  energyGenerated: [{ energyType: 'energy', amount: 2.81, share: 0.5, scalingStat: 'energyPercent' }],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND', // TODO: verify
    endState: 'AIR',      // TODO: verify
  },
  offtune: 0,
}

const echoSkill_reactorHusk: Action = {
  name: 'Echo Skill',
  displayName: 'Reactor Husk (Active)',
  category: 'Echo Skill',
  castTime: 0.09,
  multiplier: 351 / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['ECHO'],
  cooldown: 20,
  energyGenerated: [{ energyType: 'energy', amount: 4.87, share: 0.5, scalingStat: 'energyPercent' }],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'GROUND',
    swapOutState: 'PRESERVE',
    persistenceTime: 0.09,
    requiresSwapOut: true,
  },
  offtune: 0,
}

// ========== Shared Injected Side Effects =====================================================================================

const nightmareKelpieInjectedSideEffects: InjectedSideEffect[] = [
  { targets: [{ tag: 'OUTRO_ACTION' }], sideEffects: [nightmareKelpieOutroTrigger] },
]

// ========== Echo Catalog =====================================================================================================

/** All echoes grouped by echo set name. Each echo appears once per set it belongs to. */
export const echoCatalog: Record<string, EchoCatalogEntry[]> = {

  // ==========================================================================================================================
  // Sets with defined echoes from current characters
  // ==========================================================================================================================

  'Windward Pilgrimage': [
    {
      name: 'Reminiscence: Fleurdelys',
      setName: 'Windward Pilgrimage',
      cost: 4,
      icon: 'assets/gear/echoes/reminiscence_fleurdelys.png',
      info_icon: 'assets/gear/echoes/info_reminiscence_fleurdelys.png',
      info: 'The Resonator with this Echo equipped in the main slot gains 10.00% Aero DMG Bonus. When Resonator: Aero Rover or Cartethyia equips this Echo, they gain 10.00% more Aero DMG Bonus.',
      firstSlotStats: { aeroBonusDMG: 0.10 },
      echoSkill: echoSkill_reminiscenceFleurdelys,
      conditionalStats: {
        condition: (name) => name === 'Cartethyia' || name === 'Rover',
        stats: { aeroBonusDMG: 0.10 },
      },
    },
    {
      name: 'Nightmare: Kelpie',
      setName: 'Windward Pilgrimage',
      cost: 4,
      icon: 'assets/gear/echoes/nightmare_kelpie.png',
      info_icon: 'assets/gear/echoes/info_nightmare_kelpie.png',
      info: 'The Resonator with this Echo equipped in the main slot gains 12.00% Glacio DMG Bonus and 12.00% Aero DMG Bonus. Switching out the Resonator with Outro Skill summons Nightmare: Kelpie to deal 405.00% Aero DMG.',
      firstSlotStats: { glacioBonusDMG: 0.12, aeroBonusDMG: 0.12 },
      echoSkill: echoSkill_nightmareKelpie,
      injectedSideEffects: nightmareKelpieInjectedSideEffects,
    },
    {
      name: 'Capitaneus',
      setName: 'Windward Pilgrimage',
      cost: 3,
      icon: 'assets/gear/echoes/capitaneus.png',
      info_icon: 'assets/gear/echoes/info_capitaneus.png',
      info: 'The Resonator with this Echo equipped in their main slot gains 12.00% Spectro DMG Bonus and 12.00% Heavy Attack DMG Bonus.',
      firstSlotStats: { spectroBonusDMG: 0.12, heavyBonusDMG: 0.12 },
    },
    {
      name: 'Kerasaur',
      setName: 'Windward Pilgrimage',
      cost: 3,
      icon: 'assets/gear/echoes/kerasaur.png',
      info_icon: 'assets/gear/echoes/info_kerasaur.png',
      info: 'The Resonator with this Echo equipped in the main slot gains 12.00% Aero DMG Bonus and 12.00% Resonance Liberation DMG Bonus.',
      firstSlotStats: { aeroBonusDMG: 0.12, liberationBonusDMG: 0.12 },
    },
    {
      name: 'Sacerdos',
      setName: 'Windward Pilgrimage',
      cost: 1,
      icon: 'assets/gear/echoes/sacerdos.png',
      info_icon: 'assets/gear/echoes/info_sacerdos.png',
      info: '',
    },
    {
      name: "Devotee's Flesh",
      setName: 'Windward Pilgrimage',
      cost: 1,
      icon: "assets/gear/echoes/devotee's_flesh.png",
      info_icon: "assets/gear/echoes/info_devotee's_flesh.png",
      info: '',
    },
    {
      name: 'Spectro Drake',
      setName: 'Windward Pilgrimage',
      cost: 1,
      icon: 'assets/gear/echoes/spectro_drake.png',
      info_icon: 'assets/gear/echoes/info_spectro_drake.png',
      info: '',
    },
    // -- stubs (not yet defined) --
    // { name: 'Glacio Drake',      cost: 1 },
    // { name: 'Fusion Drake',      cost: 1 },
    // { name: 'Havoc Drake',       cost: 1 },
    // { name: "Pilgrim's Shell",   cost: 1 },
    // { name: 'Phantom: Kerasaur', cost: 3 },
  ],

  'Gusts of Welkin': [
    {
      name: 'Nightmare: Kelpie',
      setName: 'Gusts of Welkin',
      cost: 4,
      icon: 'assets/gear/echoes/nightmare_kelpie.png',
      info_icon: 'assets/gear/echoes/info_nightmare_kelpie.png',
      info: 'The Resonator with this Echo equipped in the main slot gains 12.00% Glacio DMG Bonus and 12.00% Aero DMG Bonus. Switching out the Resonator with Outro Skill summons Nightmare: Kelpie to deal 405.00% Aero DMG.',
      firstSlotStats: { glacioBonusDMG: 0.12, aeroBonusDMG: 0.12 },
      echoSkill: echoSkill_nightmareKelpie,
      injectedSideEffects: nightmareKelpieInjectedSideEffects,
    },
    {
      name: 'Reminiscence: Fleurdelys',
      setName: 'Gusts of Welkin',
      cost: 4,
      icon: 'assets/gear/echoes/reminiscence_fleurdelys.png',
      info_icon: 'assets/gear/echoes/info_reminiscence_fleurdelys.png',
      info: 'The Resonator with this Echo equipped in the main slot gains 10.00% Aero DMG Bonus. When Resonator: Aero Rover or Cartethyia equips this Echo, they gain 10.00% more Aero DMG Bonus.',
      firstSlotStats: { aeroBonusDMG: 0.10 },
      echoSkill: echoSkill_reminiscenceFleurdelys,
      conditionalStats: {
        condition: (name) => name === 'Cartethyia' || name === 'Rover',
        stats: { aeroBonusDMG: 0.10 },
      },
    },
    {
      name: 'Capitaneus',
      setName: 'Gusts of Welkin',
      cost: 3,
      icon: 'assets/gear/echoes/capitaneus.png',
      info_icon: 'assets/gear/echoes/info_capitaneus.png',
      info: 'The Resonator with this Echo equipped in their main slot gains 12.00% Spectro DMG Bonus and 12.00% Heavy Attack DMG Bonus.',
      firstSlotStats: { spectroBonusDMG: 0.12, heavyBonusDMG: 0.12 },
    },
    {
      name: 'Hurriclaw',
      setName: 'Gusts of Welkin',
      cost: 3,
      icon: 'assets/gear/echoes/hurriclaw.png',
      info_icon: 'assets/gear/echoes/info_hurriclaw.png',
      info: '',
    },
    {
      name: "Devotee's Flesh",
      setName: 'Gusts of Welkin',
      cost: 1,
      icon: "assets/gear/echoes/devotee's_flesh.png",
      info_icon: "assets/gear/echoes/info_devotee's_flesh.png",
      info: '',
    },
    {
      name: 'Sagittario',
      setName: 'Gusts of Welkin',
      cost: 1,
      icon: 'assets/gear/echoes/sagittario.png',
      info_icon: 'assets/gear/echoes/info_sagittario.png',
      info: '',
    },
    {
      name: 'Sacerdos',
      setName: 'Gusts of Welkin',
      cost: 1,
      icon: 'assets/gear/echoes/sacerdos.png',
      info_icon: 'assets/gear/echoes/info_sacerdos.png',
      info: '',
    },
    // -- stubs (not yet defined) --
    // { name: 'Rage Against the Statue', cost: 4 },
    // { name: 'La Guardia',              cost: 4 },
    // { name: 'Aero Drake',              cost: 1 },
    // { name: 'Electro Drake',           cost: 1 },
    // { name: 'Glacio Drake',            cost: 1 },
    // { name: 'Phantom: Capitaneus',     cost: 3 },
  ],

  'Halo of Starry Radiance': [
    {
      name: 'Reactor Husk',
      setName: 'Halo of Starry Radiance',
      cost: 4,
      icon: 'assets/gear/echoes/reactor_husk.png',
      info_icon: 'assets/gear/echoes/info_reactor_husk.png',
      info: 'The Resonator with this Echo equipped in their main slot gains 10.00% Energy Regen.',
      firstSlotStats: { energyPercent: 0.10 },
      echoSkill: echoSkill_reactorHusk,
    },
    {
      name: 'Sabercat Prowler',
      setName: 'Halo of Starry Radiance',
      cost: 3,
      icon: 'assets/gear/echoes/sabercat_prowler.png',
      info_icon: 'assets/gear/echoes/info_sabercat_prowler.png',
      info: '',
    },
    {
      name: 'Spacetrek Explorer',
      setName: 'Halo of Starry Radiance',
      cost: 3,
      icon: 'assets/gear/echoes/spacetrek_explorer.png',
      info_icon: 'assets/gear/echoes/info_spacetrek_explorer.png',
      info: '',
    },
    {
      name: 'Geospider S4',
      setName: 'Halo of Starry Radiance',
      cost: 1,
      icon: 'assets/gear/echoes/geospider_s4.png',
      info_icon: 'assets/gear/echoes/info_geospider_s4.png',
      info: '',
    },
    {
      name: 'Mining Drone',
      setName: 'Halo of Starry Radiance',
      cost: 1,
      icon: 'assets/gear/echoes/mining_drone.png',
      info_icon: 'assets/gear/echoes/info_mining_drone.png',
      info: '',
    },
    // -- stubs (not yet defined) --
    // { name: 'Tremor Warrior',    cost: 3 },
    // { name: 'Sabercat Reaver',   cost: 3 },
    // { name: 'Frostbite Coleoid', cost: 3 },
  ],

  // ==========================================================================================================================
  // Remaining sets — to be defined later
  // ==========================================================================================================================

  // 'Freezing Frost': [
  //   { name: 'Lampylumen Myriad',              cost: 4 },
  //   { name: 'Lumiscale Construct',            cost: 4 },
  //   { name: 'Phantom: Lumiscale Construct',   cost: 4 },
  //   { name: 'Autopuppet Scout',               cost: 3 },
  //   { name: 'Clang Bang',                     cost: 3 },
  //   { name: 'Glacio Dreadmane',               cost: 3 },
  //   { name: 'Phantom: Clang Bang',            cost: 3 },
  //   { name: 'Glacio Predator',                cost: 3 },
  //   { name: 'Sabyr Boar',                     cost: 1 },
  //   { name: 'Gulpuff',                        cost: 1 },
  //   { name: 'Excarat',                        cost: 1 },
  //   { name: 'Hoartoise',                      cost: 1 },
  //   { name: 'Fusion Prism',                   cost: 1 },
  //   { name: 'Glacio Prism',                   cost: 1 },
  //   { name: 'Tambourinist',                   cost: 1 },
  //   { name: 'Roseshroom',                     cost: 1 },
  //   { name: 'Phantom: Gulpuff',               cost: 1 },
  //   { name: 'Phantom: Hoartoise',             cost: 1 },
  // ],

  // 'Molten Rift': [
  //   { name: 'Traffic Illuminator',            cost: 4 },
  //   { name: 'Nightmare: Inferno Rider',       cost: 4 },
  //   { name: 'Phantom: Nightmare Inferno Rider', cost: 4 },
  //   { name: 'Inferno Rider',                  cost: 4 },
  //   { name: 'Phantom: Inferno Rider',         cost: 4 },
  //   { name: 'Phantom: Questless Knight',      cost: 3 },
  //   { name: 'Phantom: Vitreum Dancer',        cost: 3 },
  //   { name: 'Electro Predator',               cost: 3 },
  //   { name: 'Fusion Warrior',                 cost: 3 },
  //   { name: 'Fusion Dreadmane',               cost: 3 },
  //   { name: 'Violet-Feathered Heron',         cost: 3 },
  //   { name: 'Viridblaze Saurian',             cost: 3 },
  //   { name: 'Havoc Dreadmane',                cost: 3 },
  //   { name: 'Lava Larva',                     cost: 1 },
  //   { name: 'Snip Snap',                      cost: 1 },
  //   { name: 'Baby Viridblaze Saurian',        cost: 1 },
  //   { name: 'Fusion Prism',                   cost: 1 },
  //   { name: 'Spectro Prism',                  cost: 1 },
  // ],

  // 'Void Thunder': [
  //   { name: 'Tempest Mephis',                 cost: 4 },
  //   { name: 'Traffic Illuminator',            cost: 4 },
  //   { name: 'Lumiscale Construct',            cost: 4 },
  //   { name: 'Nightmare: Thundering Mephis',   cost: 4 },
  //   { name: 'Nightmare: Tempest Mephis',      cost: 4 },
  //   { name: 'Phantom: Lumiscale Construct',   cost: 4 },
  //   { name: 'Thundering Mephis',              cost: 4 },
  //   { name: 'Phantom: Thundering Mephis',     cost: 4 },
  //   { name: 'Phantom: Questless Knight',      cost: 3 },
  //   { name: 'Phantom: Vitreum Dancer',        cost: 3 },
  //   { name: 'Phantom: Sentry Construct',      cost: 3 },
  //   { name: 'Electro Predator',               cost: 3 },
  //   { name: 'Fusion Warrior',                 cost: 3 },
  //   { name: 'Aero Predator',                  cost: 3 },
  //   { name: 'Violet-Feathered Heron',         cost: 3 },
  //   { name: 'Vanguard Junrock',               cost: 1 },
  //   { name: 'Fission Junrock',                cost: 1 },
  //   { name: 'Baby Viridblaze Saurian',        cost: 1 },
  //   { name: 'Spectro Prism',                  cost: 1 },
  //   { name: 'Havoc Prism',                    cost: 1 },
  //   { name: 'Flautist',                       cost: 1 },
  // ],

  // 'Sierra Gale': [
  //   { name: 'Feilian Beringal',               cost: 4 },
  //   { name: 'Traffic Illuminator',            cost: 4 },
  //   { name: 'Nightmare: Feilian Beringal',    cost: 4 },
  //   { name: 'Phantom: Feilian Beringal',      cost: 4 },
  //   { name: 'Hoochief',                       cost: 3 },
  //   { name: 'Fusion Warrior',                 cost: 3 },
  //   { name: 'Aero Predator',                  cost: 3 },
  //   { name: 'Cyan-Feathered Heron',           cost: 3 },
  //   { name: 'Hooscamp',                       cost: 1 },
  //   { name: 'Carapace',                       cost: 1 },
  //   { name: 'Chirpuff',                       cost: 1 },
  //   { name: 'Dwarf Cassowary',                cost: 1 },
  //   { name: 'Whiff Whaff',                    cost: 1 },
  //   { name: 'Sabyr Boar',                     cost: 1 },
  //   { name: 'Baby Roseshroom',                cost: 1 },
  // ],

  // 'Celestial Light': [
  //   { name: 'Mourning Aix',                   cost: 4 },
  //   { name: 'Lightcrusher',                   cost: 4 },
  //   { name: 'Jué',                            cost: 4 },
  //   { name: 'Phantom: Mourning Aix',          cost: 4 },
  //   { name: 'Autopuppet Scout',               cost: 3 },
  //   { name: 'Clang Bang',                     cost: 3 },
  //   { name: 'Phantom: Clang Bang',            cost: 3 },
  //   { name: 'Havoc Warrior',                  cost: 3 },
  //   { name: 'Glacio Predator',                cost: 3 },
  //   { name: 'Cyan-Feathered Heron',           cost: 3 },
  //   { name: 'Rocksteady Guardian',            cost: 3 },
  //   { name: 'Phantom: Rocksteady Guardian',   cost: 3 },
  //   { name: 'Phantom: Diggy Duggy',           cost: 1 },
  //   { name: 'Zig Zag',                        cost: 1 },
  //   { name: 'Cruisewing',                     cost: 1 },
  //   { name: 'Gulpuff',                        cost: 1 },
  //   { name: 'Hoartoise',                      cost: 1 },
  //   { name: 'Spectro Prism',                  cost: 1 },
  //   { name: 'Havoc Prism',                    cost: 1 },
  //   { name: 'Phantom: Gulpuff',               cost: 1 },
  //   { name: 'Phantom: Hoartoise',             cost: 1 },
  // ],

  // 'Havoc Eclipse': [
  //   { name: 'Crownless',                      cost: 4 },
  //   { name: 'Dreamless',                      cost: 4 },
  //   { name: 'Nightmare: Crownless',           cost: 4 },
  //   { name: 'Phantom: Crownless',             cost: 4 },
  //   { name: 'Phantom: Dreamless',             cost: 4 },
  //   { name: 'Phantom: Lightcrusher',          cost: 4 },
  //   { name: 'Phantom: Nightmare Crownless',   cost: 4 },
  //   { name: 'Havoc Warrior',                  cost: 3 },
  //   { name: 'Havoc Dreadmane',                cost: 3 },
  //   { name: 'Chirpuff',                       cost: 1 },
  //   { name: 'Tick Tack',                      cost: 1 },
  //   { name: 'Excarat',                        cost: 1 },
  //   { name: 'Baby Roseshroom',                cost: 1 },
  //   { name: 'Glacio Prism',                   cost: 1 },
  //   { name: 'Havoc Prism',                    cost: 1 },
  //   { name: 'Tambourinist',                   cost: 1 },
  //   { name: 'Roseshroom',                     cost: 1 },
  // ],

  // 'Rejuvenating Glow': [
  //   { name: 'Fallacy of No Return',           cost: 4 },
  //   { name: 'Phantom: Fallacy of No Return',  cost: 4 },
  //   { name: 'Bell-Borne Geochelone',          cost: 4 },
  //   { name: 'Hoochief',                       cost: 3 },
  //   { name: 'Fusion Dreadmane',               cost: 3 },
  //   { name: 'Stonewall Bracer',               cost: 3 },
  //   { name: 'Rocksteady Guardian',            cost: 3 },
  //   { name: 'Chasm Guardian',                 cost: 3 },
  //   { name: 'Phantom: Rocksteady Guardian',   cost: 3 },
  //   { name: 'Dwarf Cassowary',                cost: 1 },
  //   { name: 'Vanguard Junrock',               cost: 1 },
  //   { name: 'Fission Junrock',                cost: 1 },
  //   { name: 'Snip Snap',                      cost: 1 },
  //   { name: 'Whiff Whaff',                    cost: 1 },
  //   { name: 'Tick Tack',                      cost: 1 },
  //   { name: 'Cruisewing',                     cost: 1 },
  // ],

  // 'Moonlit Clouds': [
  //   { name: 'Diamondclaw',                    cost: 4 },
  //   { name: 'Impermanence Heron',             cost: 4 },
  //   { name: 'Phantom: Impermanence Heron',    cost: 4 },
  //   { name: 'Bell-Borne Geochelone',          cost: 4 },
  //   { name: 'Glacio Dreadmane',               cost: 3 },
  //   { name: 'Stonewall Bracer',               cost: 3 },
  //   { name: 'Viridblaze Saurian',             cost: 3 },
  //   { name: 'Carapace',                       cost: 1 },
  //   { name: 'Phantom: Diggy Duggy',           cost: 1 },
  //   { name: 'Fission Junrock',                cost: 1 },
  //   { name: 'Zig Zag',                        cost: 1 },
  //   { name: 'Whiff Whaff',                    cost: 1 },
  //   { name: 'Cruisewing',                     cost: 1 },
  //   { name: 'Sabyr Boar',                     cost: 1 },
  //   { name: 'Glacio Prism',                   cost: 1 },
  //   { name: 'Spearback',                      cost: 1 },
  // ],

  // 'Lingering Tunes': [
  //   { name: 'Diamondclaw',                    cost: 4 },
  //   { name: 'Mech Abomination',               cost: 4 },
  //   { name: 'Chasm Guardian',                 cost: 3 },
  //   { name: 'Hooscamp',                       cost: 1 },
  //   { name: 'Lava Larva',                     cost: 1 },
  //   { name: 'Phantom: Diggy Duggy',           cost: 1 },
  //   { name: 'Vanguard Junrock',               cost: 1 },
  //   { name: 'Snip Snap',                      cost: 1 },
  //   { name: 'Zig Zag',                        cost: 1 },
  //   { name: 'Tick Tack',                      cost: 1 },
  //   { name: 'Baby Viridblaze Saurian',        cost: 1 },
  //   { name: 'Fusion Prism',                   cost: 1 },
  //   { name: 'Flautist',                       cost: 1 },
  //   { name: 'Spearback',                      cost: 1 },
  // ],

  // 'Frosty Resolve': [
  //   { name: 'Nightmare: Lampylumen Myriad',   cost: 4 },
  //   { name: 'Galescourge Stalker',            cost: 3 },
  //   { name: 'Chop Chop: Leftless',            cost: 3 },
  //   { name: 'Chop Chop: Rightless',           cost: 3 },
  //   { name: 'Questless Knight',               cost: 3 },
  //   { name: 'Abyssal Patricius',              cost: 3 },
  //   { name: 'Abyssal Mercator',               cost: 3 },
  //   { name: 'Sentry Construct',               cost: 3 },
  //   { name: 'Hocus Pocus',                    cost: 1 },
  //   { name: 'Chest Mimic',                    cost: 1 },
  //   { name: 'Golden Junrock',                 cost: 1 },
  //   { name: 'Phantom: Chest Mimic',           cost: 1 },
  //   { name: 'Phantom: Cuddle Wuddle',         cost: 1 },
  // ],

  // 'Eternal Radiance': [
  //   { name: 'Rage Against the Statue',        cost: 4 },
  //   { name: 'Nightmare: Mourning Aix',        cost: 4 },
  //   { name: 'Frostscourge Stalker',           cost: 3 },
  //   { name: 'Chop Chop: Headless',            cost: 3 },
  //   { name: 'Fae Ignis',                      cost: 3 },
  //   { name: 'Diurnus Knight',                 cost: 3 },
  //   { name: 'Abyssal Mercator',               cost: 3 },
  //   { name: 'Vitreum Dancer',                 cost: 3 },
  //   { name: 'Capitaneus',                     cost: 3 },
  //   { name: 'Phantom: Fae Ignis',             cost: 3 },
  //   { name: 'Phantom: Capitaneus',            cost: 3 },
  //   { name: 'Diggy Duggy',                    cost: 1 },
  //   { name: 'Golden Junrock',                 cost: 1 },
  //   { name: 'Aero Prism',                     cost: 1 },
  //   { name: 'Sagittario',                     cost: 1 },
  // ],

  // 'Midnight Veil': [
  //   { name: 'Lorelei',                        cost: 4 },
  //   { name: 'Nightmare: Impermanence Heron',  cost: 4 },
  //   { name: 'La Guardia',                     cost: 4 },
  //   { name: 'Phantom: Lorelei',               cost: 4 },
  //   { name: 'Voltscourge Stalker',            cost: 3 },
  //   { name: 'Frostscourge Stalker',           cost: 3 },
  //   { name: 'Fae Ignis',                      cost: 3 },
  //   { name: 'Nimbus Wraith',                  cost: 3 },
  //   { name: 'Questless Knight',               cost: 3 },
  //   { name: 'Nocturnus Knight',               cost: 3 },
  //   { name: 'Abyssal Gladius',                cost: 3 },
  //   { name: 'Phantom: Fae Ignis',             cost: 3 },
  //   { name: 'Phantom: Nimbus Wraith',         cost: 3 },
  //   { name: 'Chest Mimic',                    cost: 1 },
  //   { name: 'Electro Drake',                  cost: 1 },
  //   { name: 'Phantom: Chest Mimic',           cost: 1 },
  //   { name: 'Phantom: Cuddle Wuddle',         cost: 1 },
  // ],

  // 'Empyrean Anthem': [
  //   { name: 'Hecate',                         cost: 4 },
  //   { name: 'Nightmare: Tempest Mephis',      cost: 4 },
  //   { name: 'Nightmare: Lampylumen Myriad',   cost: 4 },
  //   { name: 'Galescourge Stalker',            cost: 3 },
  //   { name: 'Voltscourge Stalker',            cost: 3 },
  //   { name: 'Nimbus Wraith',                  cost: 3 },
  //   { name: 'Nocturnus Knight',               cost: 3 },
  //   { name: 'Abyssal Patricius',              cost: 3 },
  //   { name: 'Chop Chop',                      cost: 3 },
  //   { name: 'Vitreum Dancer',                 cost: 3 },
  //   { name: 'Phantom: Nimbus Wraith',         cost: 3 },
  //   { name: 'Phantom: Chop Chop',             cost: 3 },
  //   { name: 'Hocus Pocus',                    cost: 1 },
  //   { name: 'Chest Mimic',                    cost: 1 },
  //   { name: 'Calcified Junrock',              cost: 1 },
  //   { name: 'Phantom: Chest Mimic',           cost: 1 },
  // ],

  // 'Tidebreaking Courage': [
  //   { name: 'Dragon of Dirge',                cost: 4 },
  //   { name: 'Chop Chop: Headless',            cost: 3 },
  //   { name: 'Chop Chop: Leftless',            cost: 3 },
  //   { name: 'Chop Chop: Rightless',           cost: 3 },
  //   { name: 'Diurnus Knight',                 cost: 3 },
  //   { name: 'Abyssal Gladius',                cost: 3 },
  //   { name: 'Chop Chop',                      cost: 3 },
  //   { name: 'Hurriclaw',                      cost: 3 },
  //   { name: 'Phantom: Chop Chop',             cost: 3 },
  //   { name: 'Diggy Duggy',                    cost: 1 },
  //   { name: 'Calcified Junrock',              cost: 1 },
  //   { name: 'Aero Prism',                     cost: 1 },
  //   { name: 'Aero Drake',                     cost: 1 },
  // ],

  // 'Flaming Clawprint': [
  //   { name: 'Lioness of Glory',               cost: 4 },
  //   { name: 'La Guardia',                     cost: 4 },
  //   { name: 'Corrosaurus',                    cost: 3 },
  //   { name: 'Kerasaur',                       cost: 3 },
  //   { name: "Devotee's Flesh",                cost: 1 },
  //   { name: 'Sagittario',                     cost: 1 },
  //   { name: 'Aero Drake',                     cost: 1 },
  //   { name: 'Electro Drake',                  cost: 1 },
  //   { name: 'Fusion Drake',                   cost: 1 },
  //   { name: 'Spectro Drake',                  cost: 1 },
  //   { name: 'Havoc Drake',                    cost: 1 },
  //   { name: "Pilgrim's Shell",                cost: 1 },
  //   { name: 'Phantom: Kerasaur',              cost: 3 },
  // ],

  // 'Dream of the Lost': [
  //   { name: 'Nightmare: Hecate',              cost: 4 },
  //   { name: 'Reminiscence: Fenrico',          cost: 4 },
  //   { name: 'Nightmare: Havoc Warrior',       cost: 4 },
  //   { name: 'Nightmare: Glacio Predator',     cost: 4 },
  //   { name: 'Nightmare: Tambourinist',        cost: 4 },
  //   { name: 'Fae Ignis',                      cost: 3 },
  //   { name: 'Chop Chop',                      cost: 3 },
  //   { name: 'Phantom: Chop Chop',             cost: 3 },
  // ],

  // 'Crown of Valor': [
  //   { name: 'The False Sovereign',            cost: 4 },
  //   { name: 'Lady of the Sea',                cost: 4 },
  //   { name: 'Nightmare: Violet-Feathered Heron', cost: 4 },
  //   { name: 'Nightmare: Electro Predator',    cost: 4 },
  //   { name: 'Nightmare: Aero Predator',       cost: 4 },
  //   { name: 'Phantom: The False Sovereign',   cost: 4 },
  //   { name: 'Calcified Junrock',              cost: 1 },
  //   { name: 'Hurriclaw',                      cost: 3 },
  // ],

  // 'Law of Harmony': [
  //   { name: 'Rage Against the Statue',        cost: 4 },
  //   { name: 'Reminiscence: Fenrico',          cost: 4 },
  //   { name: 'Nightmare: Cyan-Feathered Heron', cost: 4 },
  //   { name: 'Nightmare: Gulpuff',             cost: 4 },
  //   { name: 'Nightmare: Chirpuff',            cost: 4 },
  //   { name: 'Golden Junrock',                 cost: 1 },
  // ],

  // "Flamewing's Shadow": [
  //   { name: 'Reminiscence: Threnodian - Leviathan', cost: 4 },
  //   { name: 'Nightmare: Viridblaze Saurian',  cost: 4 },
  //   { name: 'Nightmare: Baby Viridblaze Saurian', cost: 4 },
  //   { name: 'Nightmare: Baby Roseshroom',     cost: 4 },
  //   { name: 'Nimbus Wraith',                  cost: 3 },
  //   { name: 'Kerasaur',                       cost: 3 },
  //   { name: 'Corrosaurus',                    cost: 3 },
  // ],

  // 'Thread of Severed Fate': [
  //   { name: 'Reminiscence: Threnodian - Leviathan', cost: 4 },
  //   { name: 'Nightmare: Tick Tack',           cost: 4 },
  //   { name: 'Nightmare: Dwarf Cassowary',     cost: 4 },
  //   { name: 'Nightmare: Roseshroom',          cost: 4 },
  //   { name: 'Abyssal Gladius',                cost: 3 },
  //   { name: 'Havoc Drake',                    cost: 1 },
  // ],

  // 'Pact of Neonlight Leap': [
  //   { name: 'Hyvatia',                        cost: 4 },
  //   { name: 'Ironhoof',                       cost: 3 },
  //   { name: 'Sabercat Reaver',                cost: 3 },
  //   { name: 'Sabercat Prowler',               cost: 3 },
  //   { name: 'Flora Drone',                    cost: 1 },
  //   { name: 'Geospider S4',                   cost: 1 },
  //   { name: 'Zip Zap',                        cost: 1 },
  //   { name: 'Mining Reindeer',                cost: 1 },
  //   { name: 'Phantom: Zip Zap',               cost: 1 },
  // ],

  // 'Rite of Gilded Revelation': [
  //   { name: 'Twin Nova: Nebulous Cannon',     cost: 4 },
  //   { name: 'Twin Nova: Collapsar Blade',     cost: 4 },
  //   { name: 'Hyvatia',                        cost: 4 },
  //   { name: 'Phantom: Twin Nova - Nebulous Cannon', cost: 4 },
  //   { name: 'Phantom: Twin Nova - Collapsar Blade', cost: 4 },
  //   { name: 'Windlash Coleoid',               cost: 3 },
  //   { name: 'Flora Drone',                    cost: 1 },
  //   { name: 'Mining Drone',                   cost: 1 },
  //   { name: 'Zip Zap',                        cost: 1 },
  //   { name: 'Flora Reindeer',                 cost: 1 },
  //   { name: 'Phantom: Zip Zap',               cost: 1 },
  // ],

  // 'Trailblazing Star': [
  //   { name: 'Sigillum',                       cost: 4 },
  //   { name: 'Twin Nova: Collapsar Blade',     cost: 4 },
  //   { name: 'Reminiscence: Kronaclaw',        cost: 4 },
  //   { name: 'Phantom: Sigillum',              cost: 4 },
  //   { name: 'Kronablight',                    cost: 3 },
  //   { name: 'Glommoth',                       cost: 3 },
  //   { name: 'Iceglint Dancer',                cost: 3 },
  //   { name: 'Shadow Stepper',                 cost: 3 },
  //   { name: 'Phantom: Iceglint Dancer',       cost: 3 },
  //   { name: 'Geospider S4',                   cost: 1 },
  // ],

  // 'Chromatic Foam': [
  //   { name: 'Twin Nova: Nebulous Cannon',     cost: 4 },
  //   { name: 'Reminiscence: Kronaclaw',        cost: 4 },
  //   { name: 'Reactor Husk',                   cost: 4 },
  //   { name: 'Kronablight',                    cost: 3 },
  //   { name: 'Tremor Warrior',                 cost: 3 },
  //   { name: 'Spacetrek Explorer',             cost: 3 },
  //   { name: 'Shadow Stepper',                 cost: 3 },
  //   { name: 'Zip Zap',                        cost: 1 },
  // ],

  // 'Sound of True Name': [
  //   { name: 'Twin Nova: Collapsar Blade',     cost: 4 },
  //   { name: 'Nameless Explorer',              cost: 4 },
  //   { name: 'Spacetrek Explorer',             cost: 3 },
  //   { name: 'Sabercat Reaver',                cost: 3 },
  //   { name: 'Sabercat Prowler',               cost: 3 },
  //   { name: 'Flora Drone',                    cost: 1 },
  //   { name: 'Mining Drone',                   cost: 1 },
  //   { name: 'Zip Zap',                        cost: 1 },
  // ],
}

// ========== Utility Functions ================================================================================================

/** Returns all set names that a given echo belongs to (an echo can belong to multiple sets). */
export function getEchoSets(echoName: string): string[] {
  return Object.entries(echoCatalog)
    .filter(([, echoes]) => echoes.some(e => e.name === echoName))
    .map(([setName]) => setName)
}

/** Returns the cost of a named echo from the first defined set it is found in, or undefined if not in the catalog. */
export function getEchoCost(echoName: string): 1 | 3 | 4 | undefined {
  for (const echoes of Object.values(echoCatalog)) {
    const found = echoes.find(e => e.name === echoName)
    if (found) return found.cost
  }
  return undefined
}

/** Returns all defined echo entries for a given set. */
export function getEchoesForSet(setName: string): EchoCatalogEntry[] {
  return echoCatalog[setName] ?? []
}

/**
 * Builds a fully-resolved Echo object from a catalog entry.
 * Mirrors the pattern used by EchoPickerModal when confirming a custom echo.
 *
 * @param setName      - The echo set the echo belongs to.
 * @param echoName     - The echo's name as it appears in the catalog.
 * @param mainStatKey  - The rolled main stat key (e.g. 'bonusDEF', 'energyPercent').
 * @param mainStatValue - The rolled main stat value at max tune.
 * @param subStats     - The echo's rolled sub-stats.
 */
export function buildEcho(
  setName: string,
  echoName: string,
  mainStatKey: keyof CharacterStats,
  mainStatValue: number,
  subStats: Partial<CharacterStats>,
): Echo {
  const entry = echoCatalog[setName]?.find(e => e.name === echoName)
  if (!entry) throw new Error(`Echo "${echoName}" not found in set "${setName}"`)

  return {
    name: entry.name,
    setName: entry.setName,
    cost: entry.cost,
    icon: entry.icon,
    info_icon: entry.info_icon,
    info: entry.info,
    baseStats: buildBaseStats(entry.cost, mainStatKey, mainStatValue),
    subStats,
    ...(entry.firstSlotStats ? { firstSlotStats: entry.firstSlotStats } : {}),
    ...(entry.echoSkill ? { echoSkill: entry.echoSkill } : {}),
    ...(entry.injectedModifiers ? { injectedModifiers: entry.injectedModifiers } : {}),
    ...(entry.injectedSideEffects ? { injectedSideEffects: entry.injectedSideEffects } : {}),
    ...(entry.conditionalStats ? { conditionalStats: entry.conditionalStats } : {}),
  }
}
