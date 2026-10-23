// Damage timeline data: buff / debuff active-interval blocks, with permanent self buffs tied to their owner's field time.
import type { Snapshot } from '../../../types/snapshot'
import type { Character } from '../../../types/character'
import type { StatusBlock } from './types'

// ========== Buff / Debuff Blocks =============================================================================================

/**
 * Track buff/debuff duration blocks with intelligent filtering based on targeting strategy.
 *
 * DISPLAY RULES:
 * 1. Self-targeted permanent buffs: Only show during owner character's active time
 * 2. Time-based buffs (any target): Show for full duration
 * 3. All-targeted buffs: Show for full duration
 * 4. Debuffs: Show for full duration (affect enemy, independent of character swaps)
 *
 * Intervals run from the toTime of the first snapshot with stacks > 0 to the toTime of the last one.
 */
export function buildStatusBlocks(snapshots: Snapshot[], selectedCharacters: Character[]): StatusBlock[] {
  const buffDebuffTracking = new Map<
    string,
    {
      startTime: number
      lastSeenTime: number
      wasActive: boolean
      type: 'buff' | 'debuff'
      ownerCharacter?: string
      targetStrategy?: string
      durationStrategy?: string
      activeCharacter?: string // Track which character was active when buff appeared
    }
  >()
  const buffDebuffBlocksList: StatusBlock[] = []

  // Build a lookup map for buff/debuff metadata from damage modifiers
  const buffMetadata = new Map<string, { ownerCharacter?: string; targetStrategy?: string; durationStrategy?: string }>()
  selectedCharacters?.forEach(char => {
    char.damageModifiers?.forEach(mod => {
      if (mod.displayName) {
        buffMetadata.set(mod.displayName, {
          ownerCharacter: (mod as any).ownerCharacter,
          targetStrategy: (mod as any).targetStrategy,
          durationStrategy: (mod as any).durationStrategy?.type,
        })
      }
    })
  })

  // Helper function to normalize buff names (remove spaces for comparison)
  const normalizeName = (name: string) => name.replace(/\s+/g, '')

  // Create a mapping from normalized names to original metadata names
  const normalizedToOriginal = new Map<string, string>()
  buffMetadata.forEach((_meta, name) => {
    normalizedToOriginal.set(normalizeName(name), name)
  })

  // 1️⃣ Identify permanent self buffs - these are contextual presence, not duration-based
  const permanentSelfBuffs = new Set<string>()
  buffMetadata.forEach((meta, name) => {
    if (meta.targetStrategy === 'self' && meta.durationStrategy === 'permanent') {
      permanentSelfBuffs.add(name)
      // Also add the normalized version
      permanentSelfBuffs.add(normalizeName(name))
    }
  })

  // 2️⃣ Build active character windows for deriving permanent self buff blocks
  const activeWindows: Array<{
    character: string
    start: number
    end: number
  }> = []

  if (snapshots.length > 0) {
    let currentChar = snapshots[0]?.character
    let windowStart = snapshots[0]?.fromTime ?? 0

    snapshots.forEach((snap, i) => {
      if (snap.character !== currentChar) {
        // Character changed - close the previous window and start a new one
        const windowEnd = snapshots[i - 1].toTime

        activeWindows.push({
          character: currentChar!,
          start: windowStart,
          end: windowEnd,
        })

        // New window starts where the previous one ended to avoid gaps/overlaps
        currentChar = snap.character
        windowStart = windowEnd
      }
    })

    // Close the final window
    if (currentChar) {
      activeWindows.push({
        character: currentChar,
        start: windowStart,
        end: snapshots[snapshots.length - 1].toTime,
      })
    }
  }

  // 3️⃣ Generate permanent self buff blocks directly from active windows
  // These buffs exist whenever their owner is active - no duration tracking needed
  activeWindows.forEach(activeWindow => {
    // Check all buffs that exist in any snapshot to find permanent self buffs for this character
    const buffNamesInRotation = new Set<string>()
    snapshots.forEach(snap => {
      Object.keys(snap.buffs || {}).forEach(name => buffNamesInRotation.add(name))
    })

    buffNamesInRotation.forEach(buffName => {
      if (!permanentSelfBuffs.has(buffName)) {
        return
      }

      // Get metadata using normalized name lookup
      const originalName = normalizedToOriginal.get(normalizeName(buffName)) || buffName
      const meta = buffMetadata.get(originalName)

      if (meta?.ownerCharacter !== activeWindow.character) {
        return
      }

      const block = {
        name: buffName,
        type: 'buff' as const,
        startTime: activeWindow.start,
        endTime: activeWindow.end,
        ownerCharacter: activeWindow.character,
        targetStrategy: meta.targetStrategy,
        durationStrategy: meta.durationStrategy,
      }

      buffDebuffBlocksList.push(block)
    })
  })

  snapshots.forEach(snap => {
    const currentTime = snap.toTime
    const activeCharacter = snap.character

    // Process buffs
    for (const [buffName, stacks] of Object.entries(snap.buffs || {})) {
      // 4️⃣ Skip permanent self buffs - they're already handled via active windows
      if (permanentSelfBuffs.has(buffName)) continue

      const metadata = buffMetadata.get(buffName)
      const trackingKey = `buff:${buffName}`

      // For remaining buffs, check if they're active based on stacks
      const effectivelyActive = stacks > 0

      if (effectivelyActive) {
        if (!buffDebuffTracking.has(trackingKey)) {
          buffDebuffTracking.set(trackingKey, {
            startTime: currentTime,
            lastSeenTime: currentTime,
            wasActive: true,
            type: 'buff',
            ownerCharacter: metadata?.ownerCharacter,
            targetStrategy: metadata?.targetStrategy,
            durationStrategy: metadata?.durationStrategy,
            activeCharacter,
          })
        } else {
          const tracking = buffDebuffTracking.get(trackingKey)!

          if (!tracking.wasActive) {
            // Buff was inactive, now becoming active - start a new block
            tracking.startTime = currentTime
            tracking.activeCharacter = activeCharacter
          }

          tracking.lastSeenTime = currentTime
          tracking.wasActive = true
        }
      } else {
        const tracking = buffDebuffTracking.get(trackingKey)
        if (tracking && tracking.wasActive) {
          // Buff just became inactive - create a block for its duration
          buffDebuffBlocksList.push({
            name: buffName,
            type: 'buff',
            startTime: tracking.startTime,
            endTime: tracking.lastSeenTime,
            ownerCharacter: tracking.ownerCharacter,
            targetStrategy: tracking.targetStrategy,
            durationStrategy: tracking.durationStrategy,
          })
          tracking.wasActive = false
        }
      }
    }

    // Process debuffs
    for (const [debuffName, stacks] of Object.entries(snap.debuffs || {})) {
      const metadata = buffMetadata.get(debuffName)
      const trackingKey = `debuff:${debuffName}`

      if (stacks > 0) {
        if (!buffDebuffTracking.has(trackingKey)) {
          buffDebuffTracking.set(trackingKey, {
            startTime: currentTime,
            lastSeenTime: currentTime,
            wasActive: true,
            type: 'debuff',
            ownerCharacter: metadata?.ownerCharacter,
            targetStrategy: metadata?.targetStrategy,
            durationStrategy: metadata?.durationStrategy,
            activeCharacter,
          })
        } else {
          const tracking = buffDebuffTracking.get(trackingKey)!
          if (!tracking.wasActive) {
            tracking.startTime = currentTime
            tracking.activeCharacter = activeCharacter
          }
          tracking.lastSeenTime = currentTime
          tracking.wasActive = true
        }
      } else {
        const tracking = buffDebuffTracking.get(trackingKey)
        if (tracking && tracking.wasActive) {
          // Debuff just became inactive - create a block for its duration
          buffDebuffBlocksList.push({
            name: debuffName,
            type: 'debuff',
            startTime: tracking.startTime,
            endTime: tracking.lastSeenTime,
            ownerCharacter: tracking.ownerCharacter,
            targetStrategy: tracking.targetStrategy,
            durationStrategy: tracking.durationStrategy,
          })
          tracking.wasActive = false
        }
      }
    }
  })

  // Handle any buffs/debuffs that are still active at the end
  for (const [key, tracking] of buffDebuffTracking.entries()) {
    if (tracking.wasActive) {
      const name = key.replace(/^(buff|debuff):/, '')
      buffDebuffBlocksList.push({
        name,
        type: tracking.type,
        startTime: tracking.startTime,
        endTime: tracking.lastSeenTime,
        ownerCharacter: tracking.ownerCharacter,
        targetStrategy: tracking.targetStrategy,
        durationStrategy: tracking.durationStrategy,
      })
    }
  }

  return buffDebuffBlocksList
}
