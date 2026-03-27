import { motion } from 'framer-motion'
import SequenceNode from './SequenceNode'
import type { SequenceInfo } from './types'

interface SequenceChainProps {
  sequenceLevel: number
  sequences: SequenceInfo[]
  elementColor: string
}

const SequenceChain = ({ sequenceLevel, sequences, elementColor }: SequenceChainProps) => {
  return (
    <div className="flex items-center gap-0 shrink-0">
      {sequences.map((seq, i) => (
        <div key={i} className="flex items-center">
          <SequenceNode index={i + 1} active={i < sequenceLevel} info={seq} elementColor={elementColor} delay={0.4 + i * 0.06} />
          {i < sequences.length - 1 && (
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5 + i * 0.06, duration: 0.3 }} className="relative w-3 h-[2px] origin-left">
              {/* Base connector */}
              <div
                className="absolute inset-0"
                style={{
                  background: i < sequenceLevel - 1 ? `hsl(${elementColor} / 0.6)` : i < sequenceLevel ? `linear-gradient(90deg, hsl(${elementColor} / 0.5), hsl(var(--sequence-inactive) / 0.3))` : 'hsl(var(--sequence-inactive) / 0.2)',
                }}
              />
              {/* Energy flow on active connectors */}
              {i < sequenceLevel - 1 && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, transparent, hsl(${elementColor} / 0.8), transparent)`,
                  }}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear', delay: i * 0.2 }}
                />
              )}
            </motion.div>
          )}
        </div>
      ))}
    </div>
  )
}

export default SequenceChain
