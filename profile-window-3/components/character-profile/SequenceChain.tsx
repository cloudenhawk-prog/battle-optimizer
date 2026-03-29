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
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5 + i * 0.06, duration: 0.3 }}
              className="w-5 h-[1.5px] origin-left rounded-full"
              style={{
                background: i < sequenceLevel - 1 ? `hsl(${elementColor} / 0.6)` : i < sequenceLevel ? `linear-gradient(90deg, hsl(${elementColor} / 0.4), hsl(var(--sequence-inactive) / 0.25))` : 'hsl(var(--sequence-inactive) / 0.15)',
                boxShadow: i < sequenceLevel - 1 ? `0 0 4px hsl(${elementColor} / 0.3)` : 'none',
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default SequenceChain
