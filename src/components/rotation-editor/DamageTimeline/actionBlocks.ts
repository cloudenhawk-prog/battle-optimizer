// Damage timeline data: swimlane owners plus action / damage-event / negative-status blocks per owner.
import type { Snapshot } from '../../../types/snapshot'
import type { DamageEvent } from '../../../types/events'
import type { ActionBlock, Owner } from './types'
import { CHARACTER_COLORS, GLOBAL_COLOR, getOwnerColor } from './constants'

// ========== Owners ===========================================================================================================

// Dealers can be formatted as "CharacterName" or "CharacterName: ActionName"
export function extractCharacterName(dealer: string): string {
  const colonIndex = dealer.indexOf(':')
  return colonIndex !== -1 ? dealer.substring(0, colonIndex).trim() : dealer
}

/**
 * Splits every owner name seen in snapshots / damage events into characters (own swimlane each) and
 * everything else (collapsed into one trailing "Global" lane, added only when such a source exists).
 */
export function collectOwners(snapshots: Snapshot[], damageEvents: DamageEvent[]): { characterOwners: Set<string>; owners: Owner[] } {
  // Collect all unique owner names and determine which are characters vs global sources
  const allOwnerNames = new Set<string>()
  snapshots.forEach(s => {
    if (s.character) allOwnerNames.add(s.character)
  })
  damageEvents.forEach(e => {
    if (e.dealer) {
      const characterName = extractCharacterName(e.dealer)
      allOwnerNames.add(characterName)
    }
  })

  // Characters are those that have a color defined OR appear in snapshots with character field
  // Everything else goes to "Global"
  const characterOwners = new Set<string>()
  let hasGlobalSources = false

  allOwnerNames.forEach(name => {
    if (CHARACTER_COLORS[name]) {
      characterOwners.add(name)
    } else {
      // Check if this name appears as a character in snapshots (not just in events)
      const isCharacter = snapshots.some(s => s.character === name)
      if (isCharacter) {
        characterOwners.add(name)
      } else {
        hasGlobalSources = true
      }
    }
  })

  // Also check if there are any damage events with non-character dealers
  if (!hasGlobalSources) {
    hasGlobalSources = damageEvents.some(e => {
      const characterName = extractCharacterName(e.dealer)
      return !characterOwners.has(characterName) && !snapshots.some(s => s.character === characterName)
    })
  }

  // Build owner list: individual characters + one "Global" entry if needed
  const ownersList: Owner[] = Array.from(characterOwners).map(name => ({
    name,
    color: getOwnerColor(name),
    isGlobal: false,
  }))

  if (hasGlobalSources) {
    ownersList.push({
      name: 'Global',
      color: GLOBAL_COLOR,
      isGlobal: true,
    })
  }

  return { characterOwners, owners: ownersList }
}

// ========== Action Blocks ====================================================================================================

/**
 * Builds the swimlane blocks, grouped by ATTRIBUTION (what action/event), in this order:
 *  1. one block per snapshot (each action use),
 *  2. damage events — merged into a same-owner/attribution block ending within 0.1s, else a new block,
 *  3. negative-status duration blocks on the Global lane (application → last snapshot it was active).
 * Non-character owners are mapped to "Global".
 */
export function buildActionBlocks(snapshots: Snapshot[], damageEvents: DamageEvent[], characterOwners: Set<string>): ActionBlock[] {
  const blocks: ActionBlock[] = []

  // Process snapshots into action blocks
  // Each snapshot creates its own block to show individual action uses
  snapshots.forEach(snap => {
    const rawOwner = snap.character || 'Global'
    // Map to "Global" if not a recognized character
    const owner = characterOwners.has(rawOwner) ? rawOwner : 'Global'
    const attribution = snap.action || 'Unknown Action'

    blocks.push({
      owner,
      attribution,
      startTime: snap.fromTime,
      endTime: snap.toTime,
      snapshots: [snap],
    })
  })

  // Process damage events - extract character name from dealer and group appropriately
  damageEvents.forEach(e => {
    const characterName = extractCharacterName(e.dealer)
    const owner = characterOwners.has(characterName) ? characterName : 'Global'
    const attribution = e.actionName || e.dealer

    // Check if we can merge with an existing block
    const existingBlock = blocks.find(b => b.owner === owner && b.attribution === attribution && Math.abs(b.endTime - e.timeStamp) < 0.1)

    if (existingBlock) {
      // Extend the block to include this event
      existingBlock.endTime = Math.max(existingBlock.endTime, e.timeStamp)
    } else {
      // Create a new block for this event
      blocks.push({
        owner,
        attribution,
        startTime: e.timeStamp,
        endTime: e.timeStamp,
        snapshots: [],
      })
    }
  })

  // Track negative status duration blocks
  // Create blocks showing when each negative status is active (application to expiry)
  const negativeStatusTracking = new Map<string, { startTime: number; lastSeenTime: number; wasActive: boolean }>()

  snapshots.forEach(snap => {
    const currentTime = snap.toTime

    // Check all negative statuses in this snapshot
    for (const [statusName, stacks] of Object.entries(snap.negativeStatuses || {})) {
      if (stacks > 0) {
        const trackingKey = statusName

        if (!negativeStatusTracking.has(trackingKey)) {
          // New negative status application - start a new duration block
          negativeStatusTracking.set(trackingKey, {
            startTime: currentTime,
            lastSeenTime: currentTime,
            wasActive: true,
          })
        } else {
          // Status still active - update last seen time
          const tracking = negativeStatusTracking.get(trackingKey)!

          // If status was previously inactive, this is a new application - reset start time
          if (!tracking.wasActive) {
            tracking.startTime = currentTime
          }

          tracking.lastSeenTime = currentTime
          tracking.wasActive = true
        }
      } else {
        // Status has 0 stacks - check if it was previously active
        const trackingKey = statusName
        const tracking = negativeStatusTracking.get(trackingKey)

        if (tracking && tracking.wasActive) {
          // Status just ended - create a duration block
          blocks.push({
            owner: 'Global',
            attribution: `${statusName} (Active)`,
            startTime: tracking.startTime,
            endTime: tracking.lastSeenTime,
            snapshots: [],
          })

          // Mark as inactive so we can detect new applications
          tracking.wasActive = false
        }
      }
    }
  })

  // Handle any negative statuses that are still active at the end
  for (const [statusName, tracking] of negativeStatusTracking.entries()) {
    if (tracking.wasActive) {
      blocks.push({
        owner: 'Global',
        attribution: `${statusName} (Active)`,
        startTime: tracking.startTime,
        endTime: tracking.lastSeenTime,
        snapshots: [],
      })
    }
  }

  return blocks
}
