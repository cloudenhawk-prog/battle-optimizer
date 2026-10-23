// Equipment orbit: weapon + 5 echo slots on a ring, with an orbiting particle that "scans" each slot
import { useState, useRef, useEffect } from 'react'
import { motion, useAnimationFrame, useMotionValue, animate } from 'framer-motion'
import type { Echo, Weapon, EchoSlots } from '../../../types/gear'
import { GearSlot } from './GearSlot'
import { assetPath } from './theme'

// ========== Sub-component: Equipment Orbit ===================================================================================

const ORBIT_POSITIONS = [
  { angle: -90 }, // Weapon — top
  { angle: 90 }, // Echo slot 1 (main) — bottom
  { angle: -30 }, // Echo slot 2 — top-right
  { angle: 30 }, // Echo slot 3 — bottom-right
  { angle: 150 }, // Echo slot 4 — bottom-left
  { angle: 210 }, // Echo slot 5 — top-left
]

// Rotation-space angle for each orbit item: 0° = rightmost point of the ring, increasing clockwise.
// Derived from ORBIT_POSITIONS: mathematical angle → CSS rotate degrees (same axis for clockwise motion).
const ITEM_ROTATION_ANGLES = ORBIT_POSITIONS.map(p => ((p.angle % 360) + 360) % 360)
// = [270, 90, 330, 30, 150, 210]
const ORBIT_SCAN_THRESHOLD = 16 // degrees — full scan window width (8° before → 8° after a slot); items are 60° apart so no overlap

export type OrbitalScanItem = { type: 'weapon'; data: Weapon } | { type: 'echo'; data: Echo; slot: 1 | 2 | 3 | 4 | 5 }

export function EquipmentOrbit({ weapon, echoSlots, elColor, characterName, onItemHighlight, onEchoSlotClick, onWeaponSlotClick }: { weapon: Weapon; echoSlots: EchoSlots; elColor: string; characterName: string; onItemHighlight?: (item: OrbitalScanItem | null) => void; onEchoSlotClick?: (slot: 1 | 2 | 3 | 4 | 5) => void; onWeaponSlotClick?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState(0)
  const lastPassedIndexRef = useRef<number>(-1)
  // Single MotionValue drives both the visual particle and the detection logic —
  // the two can never drift apart because they read from identical values.
  const rotation = useMotionValue(0)
  const [scannedIndex, setScannedIndex] = useState(-1)
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1)
  const hoveredIndexRef = useRef<number>(-1)

  useEffect(() => {
    const controls = animate(rotation, [0, 360], { duration: 36, repeat: Infinity, ease: 'linear' })
    return () => controls.stop()
  }, [rotation])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setContainerSize(Math.min(width, height))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const radius = Math.max(60, containerSize / 2 - 120)
  const size = containerSize
  const center = size / 2
  const baseSlot = Math.max(62, Math.min(98, Math.round(radius * 0.4)))
  const largeSlot = Math.round(baseSlot * 1.25)

  const items: Array<{ type: 'weapon'; data: Weapon } | { type: 'echo'; data: Echo | null; slot: 1 | 2 | 3 | 4 | 5 }> = [
    { type: 'weapon', data: weapon },
    { type: 'echo', data: echoSlots[1], slot: 1 },
    { type: 'echo', data: echoSlots[2], slot: 2 },
    { type: 'echo', data: echoSlots[3], slot: 3 },
    { type: 'echo', data: echoSlots[4], slot: 4 },
    { type: 'echo', data: echoSlots[5], slot: 5 },
  ]

  // Reports slot `index` to the scan panel; an empty echo slot resets the panel to its idle state.
  function emitHighlight(index: number) {
    if (!onItemHighlight) return
    const item = items[index]
    if (item.type === 'weapon') {
      onItemHighlight({ type: 'weapon', data: item.data })
    } else if (item.type === 'echo' && item.data !== null) {
      onItemHighlight({ type: 'echo', data: item.data, slot: item.slot })
    } else {
      onItemHighlight(null)
    }
  }

  function handleSlotHover(index: number) {
    hoveredIndexRef.current = index
    setHoveredIndex(index)
    setScannedIndex(index)
    emitHighlight(index)
  }

  function handleSlotLeave() {
    hoveredIndexRef.current = -1
    setHoveredIndex(-1)
  }

  useAnimationFrame(() => {
    // Suppress orbital scan updates while a slot is being hovered.
    if (hoveredIndexRef.current >= 0) return
    // rotation.get() is the exact same value used to render the particle — perfect sync.
    const currentAngle = rotation.get() % 360
    let closestIndex = -1
    ITEM_ROTATION_ANGLES.forEach((angle, i) => {
      // Fire when the particle is within 8° before to (ORBIT_SCAN_THRESHOLD - 8)° after the slot.
      const past = (currentAngle - angle + 8 + 360) % 360
      if (past < ORBIT_SCAN_THRESHOLD) {
        closestIndex = i
      }
    })
    if (closestIndex !== lastPassedIndexRef.current) {
      lastPassedIndexRef.current = closestIndex
      // Only advance when a real slot is hit — never reset to -1 so the frame persists.
      if (closestIndex >= 0) {
        setScannedIndex(closestIndex)
      }
      if (closestIndex >= 0) emitHighlight(closestIndex)
    }
  })

  return (
    <div ref={containerRef} className="cpo-orbit-container">
      {size > 0 && (
        <div style={{ position: 'relative', width: size, height: size }}>
          {/* Orbit ring + concentric ripple circles */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <circle cx={center} cy={center} r={radius} fill="none" stroke={`hsl(${elColor} / 0.22)`} strokeWidth="1" strokeDasharray="4 6" />
            <circle cx={center} cy={center} r={radius + 22} fill="none" stroke={`hsl(${elColor} / 0.18)`} strokeWidth="0.75" />
            <circle cx={center} cy={center} r={radius + 52} fill="none" stroke={`hsl(${elColor} / 0.11)`} strokeWidth="0.65" />
            <circle cx={center} cy={center} r={radius + 94} fill="none" stroke={`hsl(${elColor} / 0.06)`} strokeWidth="0.5" />
            <circle cx={center} cy={center} r={radius + 152} fill="none" stroke={`hsl(${elColor} / 0.03)`} strokeWidth="0.4" />
          </svg>

          {/* Orbiting energy particle */}
          <motion.div style={{ position: 'absolute', width: size, height: size, pointerEvents: 'none', rotate: rotation }}>
            <div
              style={{
                position: 'absolute',
                width: 6,
                height: 6,
                borderRadius: '50%',
                left: center + radius - 3,
                top: center - 3,
                background: `hsl(${elColor} / 0.6)`,
                boxShadow: `0 0 8px hsl(${elColor} / 0.4), 0 0 16px hsl(${elColor} / 0.2)`,
              }}
            />
          </motion.div>

          {/* Character shadow — centered inside orbit ring */}
          <div
            style={{
              position: 'absolute',
              left: center,
              top: center,
              width: radius * 1.55,
              height: radius * 1.55,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}>
            <img
              src={`/assets/characters/${characterName.toLowerCase()}_shadow.gif`}
              alt=""
              aria-hidden="true"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'brightness(0) opacity(0.28)',
                WebkitMaskImage:
                  'radial-gradient(circle at center, black 50%, rgba(0,0,0,0.55) 70%, transparent 90%)',
                maskImage:
                  'radial-gradient(circle at center, black 50%, rgba(0,0,0,0.55) 70%, transparent 90%)',
              }}
              onError={(e) => {
                const el = e.currentTarget
                el.onerror = null
                el.src = `/assets/characters/${characterName.toLowerCase()}_shadow.png`
              }}
            />
          </div>

          {/* SVG: orbit tick marks */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {Array.from({ length: 24 }).map((_, i) => {
              const angleDeg = i * 15 - 90
              const rad = (angleDeg * Math.PI) / 180
              // every 4th tick lands on a slot angle (60° spacing)
              const isSlot = i % 4 === 0
              const tickLen = isSlot ? 10 : 5
              const inner = radius - tickLen / 2
              const outer = radius + tickLen / 2
              return <line key={i} x1={center + Math.cos(rad) * inner} y1={center + Math.sin(rad) * inner} x2={center + Math.cos(rad) * outer} y2={center + Math.sin(rad) * outer} stroke={`hsl(${elColor} / ${isSlot ? 0.4 : 0.15})`} strokeWidth={isSlot ? 1.5 : 1} />
            })}
          </svg>

          {/* Slots */}
          {items.map((item, i) => {
            const rad = (ORBIT_POSITIONS[i].angle * Math.PI) / 180
            const x = center + Math.cos(rad) * radius
            const y = center + Math.sin(rad) * radius
            const isLarge = item.type === 'weapon' || (item.type === 'echo' && item.slot === 1)
            const slotSize = isLarge ? largeSlot : baseSlot

            return (
              <div key={i} style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)' }}>
                {item.type === 'weapon' ? (
                  <GearSlot
                    icon={assetPath(item.data.icon)}
                    primaryLabel={`R${item.data.rank}`}
                    secondaryLabel={item.data.name}
                    elColor={elColor}
                    size={slotSize}
                    delay={0.35 + i * 0.08}
                    typeTag="Weapon"
                    isScanned={i === (hoveredIndex >= 0 ? hoveredIndex : scannedIndex)}
                    onHoverEnter={() => handleSlotHover(i)}
                    onHoverLeave={handleSlotLeave}
                    onClick={() => onWeaponSlotClick?.()}
                  />
                ) : (
                  <GearSlot
                    icon={item.data ? assetPath(item.data.icon) : undefined}
                    primaryLabel={item.data ? `${item.data.cost} Cost` : undefined}
                    secondaryLabel={item.data ? item.data.name : undefined}
                    elColor={elColor}
                    size={slotSize}
                    delay={0.35 + i * 0.08}
                    typeTag={item.slot === 1 ? 'Main Echo' : item.data ? 'Echo' : undefined}
                    isScanned={i === (hoveredIndex >= 0 ? hoveredIndex : scannedIndex)}
                    onHoverEnter={() => handleSlotHover(i)}
                    onHoverLeave={handleSlotLeave}
                    onClick={() => onEchoSlotClick?.(item.slot)}
                    alwaysClickable
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
