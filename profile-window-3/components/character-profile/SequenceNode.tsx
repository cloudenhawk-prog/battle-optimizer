import { motion } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { SequenceInfo } from './types'

interface SequenceNodeProps {
  index: number
  active: boolean
  info: SequenceInfo
  elementColor: string
  delay?: number
}

const SequenceNode = ({ index, active, info, elementColor, delay = 0 }: SequenceNodeProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay, duration: 0.3, type: 'spring', stiffness: 300 }} className="relative flex items-center justify-center cursor-pointer group">
          {/* Outer circle */}
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              borderWidth: '1.5px',
              borderStyle: 'solid',
              borderColor: active ? `hsl(${elementColor})` : 'hsl(var(--sequence-inactive) / 0.4)',
              background: active ? `radial-gradient(circle, hsl(${elementColor} / 0.25), hsl(${elementColor} / 0.05))` : 'hsl(var(--secondary) / 0.15)',
              boxShadow: active ? `0 0 8px hsl(${elementColor} / 0.4), inset 0 0 4px hsl(${elementColor} / 0.15)` : 'none',
            }}>
            <span className="text-[8px] font-display font-black transition-colors" style={{ color: active ? `hsl(${elementColor})` : 'hsl(var(--muted-foreground) / 0.5)' }}>
              {index}
            </span>
          </div>

          {/* Active ping ring */}
          {active && <motion.div className="absolute w-6 h-6 rounded-full" style={{ border: `1px solid hsl(${elementColor} / 0.3)` }} animate={{ scale: [1, 1.8], opacity: [0.5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }} />}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="top" className="panel-glass border-panel-border max-w-[280px] p-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="font-display text-xs font-bold" style={{ color: active ? `hsl(${elementColor})` : undefined }}>
              S{index} — {info.name}
            </span>
            <span className="text-[10px] font-mono-tech text-muted-foreground shrink-0">{active ? 'Unlocked' : 'Locked'}</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{info.description}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

export default SequenceNode
