export interface CharacterStat {
  name: string
  value: number
  maxValue?: number
  displayValue: string
  icon?: string
}

export interface EchoData {
  id: string
  name: string
  cost: number // 1 or 3 or 4
  level: number
  mainStat: { name: string; value: string }
  subStats: { name: string; value: string }[]
  setName?: string
  rarity: number // 1-5
  imageUrl?: string
}

export interface WeaponData {
  id: string
  name: string
  level: number
  rank: number // refinement rank 1-5
  baseAtk: number
  subStat: { name: string; value: string }
  passive: string
  rarity: number
  imageUrl?: string
}

export interface SequenceInfo {
  name: string
  description: string
}

export interface SetBonus {
  setName: string
  pieces: number // 2 or 5
  description: string
}

export interface CharacterProfileData {
  name: string
  element: 'spectro' | 'havoc' | 'electro' | 'aero' | 'glacio' | 'fusion'
  level: number
  sequenceLevel: number // 0-6
  stats: CharacterStat[]
  echoes: (EchoData | null)[]
  weapon: WeaponData | null
  sequences: SequenceInfo[]
  setBonuses: SetBonus[]
  portraitUrl?: string
}

export const ELEMENT_COLORS: Record<string, { primary: string; glow: string; bg: string; label: string }> = {
  spectro: { primary: '45 100% 60%', glow: '40 100% 70%', bg: '45 60% 12%', label: 'Spectro' },
  havoc: { primary: '270 80% 60%', glow: '280 90% 70%', bg: '270 40% 12%', label: 'Havoc' },
  electro: { primary: '280 100% 65%', glow: '285 100% 75%', bg: '280 50% 12%', label: 'Electro' },
  aero: { primary: '160 80% 55%', glow: '165 90% 65%', bg: '160 40% 12%', label: 'Aero' },
  glacio: { primary: '200 100% 70%', glow: '205 100% 80%', bg: '200 50% 12%', label: 'Glacio' },
  fusion: { primary: '15 100% 55%', glow: '20 100% 65%', bg: '15 50% 12%', label: 'Fusion' },
}
