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
          {/* Outer diamond shape */}
          <div
            className="w-7 h-7 rotate-45 rounded-[3px] flex items-center justify-center transition-all duration-300"
            style={{
              borderWidth: '1.5px',
              borderStyle: 'solid',
              borderColor: active ? `hsl(${elementColor})` : 'hsl(var(--sequence-inactive) / 0.5)',
              background: active ? `linear-gradient(135deg, hsl(${elementColor} / 0.2), hsl(${elementColor} / 0.05))` : 'hsl(var(--secondary) / 0.2)',
              boxShadow: active ? `0 0 10px hsl(${elementColor} / 0.4), inset 0 0 6px hsl(${elementColor} / 0.15)` : 'none',
            }}>
            <span className="-rotate-45 text-[9px] font-display font-black transition-colors" style={{ color: active ? `hsl(${elementColor})` : 'hsl(var(--muted-foreground) / 0.6)' }}>
              {index}
            </span>
          </div>

          {/* Active glow ring */}
          {active && <motion.div className="absolute w-7 h-7 rotate-45 rounded-[3px]" style={{ border: `1px solid hsl(${elementColor} / 0.25)` }} animate={{ scale: [1, 1.6], opacity: [0.5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }} />}

          {/* Active inner dot */}
          {active && <motion.div className="absolute w-1.5 h-1.5 rounded-full" style={{ background: `hsl(${elementColor})` }} animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} />}
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
