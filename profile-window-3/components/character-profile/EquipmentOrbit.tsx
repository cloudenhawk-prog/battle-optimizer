import { motion } from 'framer-motion'
import EchoSlot from './EchoSlot'
import WeaponSlot from './WeaponSlot'
import type { EchoData, WeaponData } from './types'

interface EquipmentOrbitProps {
  echoes: (EchoData | null)[]
  weapon: WeaponData | null
  elementColor: string
}

const ORBIT_POSITIONS = [
  { angle: -90, label: 'W' },
  { angle: 90, label: 'E1' },
  { angle: -30, label: 'E2' },
  { angle: 30, label: 'E3' },
  { angle: 150, label: 'E4' },
  { angle: 210, label: 'E5' },
]

const EquipmentOrbit = ({ echoes, weapon, elementColor }: EquipmentOrbitProps) => {
  const radius = 150
  const size = radius * 2 + 90
  const center = size / 2

  const items = [{ type: 'weapon' as const, data: weapon }, ...echoes.map(e => ({ type: 'echo' as const, data: e }))]

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Slow rotating outer ring */}
      <motion.div className="absolute inset-0 pointer-events-none" animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}>
        <svg className="w-full h-full">
          <circle cx={center} cy={center} r={radius + 20} fill="none" stroke={`hsl(${elementColor} / 0.05)`} strokeWidth="1" strokeDasharray="2 12" />
        </svg>
      </motion.div>

      {/* Counter-rotating inner ring */}
      <motion.div className="absolute inset-0 pointer-events-none" animate={{ rotate: -360 }} transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}>
        <svg className="w-full h-full">
          <circle cx={center} cy={center} r={radius - 20} fill="none" stroke={`hsl(${elementColor} / 0.04)`} strokeWidth="1" strokeDasharray="1 8" />
        </svg>
      </motion.div>

      {/* Static dashed orbit ring */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <circle cx={center} cy={center} r={radius} fill="none" stroke={`hsl(${elementColor} / 0.1)`} strokeWidth="1" strokeDasharray="4 6" />
      </svg>

      {/* Orbiting energy particle */}
      <motion.div className="absolute pointer-events-none" style={{ width: size, height: size }} animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
        <div
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            left: center + radius - 1,
            top: center - 1,
            background: `hsl(${elementColor} / 0.6)`,
            boxShadow: `0 0 8px hsl(${elementColor} / 0.4), 0 0 16px hsl(${elementColor} / 0.2)`,
          }}
        />
      </motion.div>

      {/* Second orbiting particle (opposite side, slower) */}
      <motion.div className="absolute pointer-events-none" style={{ width: size, height: size }} initial={{ rotate: 180 }} animate={{ rotate: 540 }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}>
        <div
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: center + radius - 0.5,
            top: center - 0.5,
            background: `hsl(${elementColor} / 0.4)`,
            boxShadow: `0 0 6px hsl(${elementColor} / 0.3)`,
          }}
        />
      </motion.div>

      {/* Central element emblem with pulse */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
        className="absolute rounded-full flex items-center justify-center"
        style={{
          width: 64,
          height: 64,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, hsl(${elementColor} / 0.15), transparent)`,
          border: `1px solid hsl(${elementColor} / 0.2)`,
        }}>
        {/* Breathing glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.05, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: `radial-gradient(circle, hsl(${elementColor} / 0.2), transparent 70%)`,
          }}
        />
        <div
          className="w-8 h-8 rounded-full relative z-10"
          style={{
            background: `radial-gradient(circle, hsl(${elementColor} / 0.4), hsl(${elementColor} / 0.1))`,
            boxShadow: `0 0 20px hsl(${elementColor} / 0.3)`,
          }}
        />
      </motion.div>

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {ORBIT_POSITIONS.slice(0, items.length).map((pos, i) => {
          const rad = (pos.angle * Math.PI) / 180
          const x = center + Math.cos(rad) * radius
          const y = center + Math.sin(rad) * radius
          return <motion.line key={i} x1={center} y1={center} x2={x} y2={y} stroke={`hsl(${elementColor} / 0.08)`} strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }} />
        })}
      </svg>

      {/* Items positioned around the orbit */}
      {items.slice(0, ORBIT_POSITIONS.length).map((item, i) => {
        const pos = ORBIT_POSITIONS[i]
        const rad = (pos.angle * Math.PI) / 180
        const x = center + Math.cos(rad) * radius
        const y = center + Math.sin(rad) * radius

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
