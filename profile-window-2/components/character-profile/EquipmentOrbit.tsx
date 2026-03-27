import { motion } from 'framer-motion'
import EchoSlot from './EchoSlot'
import WeaponSlot from './WeaponSlot'
import type { EchoData, WeaponData } from './types'

interface EquipmentOrbitProps {
  echoes: (EchoData | null)[]
  weapon: WeaponData | null
  elementColor: string
}

// Position 6 items (5 echoes + 1 weapon) in a circle
// Weapon at top, main echo (4-cost) at bottom, rest distributed
const ORBIT_POSITIONS = [
  // Weapon — top
  { angle: -90, label: 'W' },
  // Echo 1 (4-cost) — bottom
  { angle: 90, label: 'E1' },
  // Echo 2 — top-right
  { angle: -30, label: 'E2' },
  // Echo 3 — bottom-right
  { angle: 30, label: 'E3' },
  // Echo 4 — bottom-left
  { angle: 150, label: 'E4' },
  // Echo 5 — top-left
  { angle: 210, label: 'E5' },
]

const EquipmentOrbit = ({ echoes, weapon, elementColor }: EquipmentOrbitProps) => {
  const radius = 130

  // Build the items array: [weapon, echo0, echo1, echo2, echo3, echo4]
  const items = [{ type: 'weapon' as const, data: weapon }, ...echoes.map(e => ({ type: 'echo' as const, data: e }))]

  return (
    <div className="relative" style={{ width: radius * 2 + 80, height: radius * 2 + 80 }}>
      {/* Central element emblem */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
        className="absolute rounded-full flex items-center justify-center"
        style={{
          width: 60,
          height: 60,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, hsl(${elementColor} / 0.15), transparent)`,
          border: `1px solid hsl(${elementColor} / 0.2)`,
        }}>
        <div
          className="w-8 h-8 rounded-full"
          style={{
            background: `radial-gradient(circle, hsl(${elementColor} / 0.4), hsl(${elementColor} / 0.1))`,
            boxShadow: `0 0 20px hsl(${elementColor} / 0.3)`,
          }}
        />
      </motion.div>

      {/* Orbit ring */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ left: 0, top: 0 }}>
        <circle cx="50%" cy="50%" r={radius} fill="none" stroke={`hsl(${elementColor} / 0.08)`} strokeWidth="1" strokeDasharray="4 6" />
      </svg>

      {/* Connection lines from center to each item */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {ORBIT_POSITIONS.slice(0, items.length).map((pos, i) => {
          const rad = (pos.angle * Math.PI) / 180
          const cx = radius + 40
          const cy = radius + 40
          const x = cx + Math.cos(rad) * radius
          const y = cy + Math.sin(rad) * radius
          return <motion.line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={`hsl(${elementColor} / 0.1)`} strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }} />
        })}
      </svg>

      {/* Items positioned around the orbit */}
      {items.slice(0, ORBIT_POSITIONS.length).map((item, i) => {
        const pos = ORBIT_POSITIONS[i]
        const rad = (pos.angle * Math.PI) / 180
        const x = radius + 40 + Math.cos(rad) * radius
        const y = radius + 40 + Math.sin(rad) * radius

        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
            }}>
            {item.type === 'weapon' ? <WeaponSlot weapon={item.data as WeaponData | null} elementColor={elementColor} delay={0.35 + i * 0.08} /> : <EchoSlot echo={item.data as EchoData | null} index={i - 1} elementColor={elementColor} delay={0.35 + i * 0.08} />}
          </div>
        )
      })}
    </div>
  )
}

export default EquipmentOrbit
