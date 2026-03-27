import { motion } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { EchoData } from './types'

interface EchoSlotProps {
  echo: EchoData | null
  index: number
  elementColor: string
  delay?: number
}

const COST_SIZES: Record<number, { box: string; text: string }> = {
  4: { box: 'w-[72px] h-[72px]', text: 'text-xs' },
  3: { box: 'w-16 h-16', text: 'text-[11px]' },
  1: { box: 'w-14 h-14', text: 'text-[10px]' },
}

const EchoSlot = ({ echo, index, elementColor, delay = 0 }: EchoSlotProps) => {
  const sizes = echo ? COST_SIZES[echo.cost] || COST_SIZES[3] : COST_SIZES[3]

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay, duration: 0.35, type: 'spring', stiffness: 200 }} className={`relative group cursor-pointer ${sizes.box}`}>
          {/* Square slot with beveled corners */}
          <div
            className="absolute inset-0 rounded-lg transition-all duration-300 border"
            style={{
              background: echo ? `linear-gradient(135deg, hsl(${elementColor} / 0.08), hsl(var(--secondary) / 0.6))` : 'hsl(var(--secondary) / 0.3)',
              borderColor: echo ? `hsl(${elementColor} / 0.25)` : 'hsl(var(--border) / 0.3)',
            }}
          />

          {/* Hover glow */}
          <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: `inset 0 0 20px hsl(${elementColor} / 0.1), 0 0 12px hsl(${elementColor} / 0.15)` }} />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-1">
            {echo ? (
              <>
                <span className={`font-display font-bold leading-none ${sizes.text}`} style={{ color: `hsl(${elementColor} / 0.9)` }}>
                  {echo.cost}C
                </span>
                <span className="text-[8px] text-muted-foreground mt-0.5 truncate max-w-full text-center leading-tight">{echo.name}</span>
              </>
            ) : (
              <span className="text-lg text-muted-foreground/30">+</span>
            )}
          </div>

          {/* Corner accents */}
          {echo && (
            <>
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l rounded-tl-lg transition-colors" style={{ borderColor: `hsl(${elementColor} / 0.4)` }} />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r rounded-tr-lg transition-colors" style={{ borderColor: `hsl(${elementColor} / 0.4)` }} />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l rounded-bl-lg transition-colors" style={{ borderColor: `hsl(${elementColor} / 0.4)` }} />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r rounded-br-lg transition-colors" style={{ borderColor: `hsl(${elementColor} / 0.4)` }} />
            </>
          )}
        </motion.div>
      </TooltipTrigger>

      {echo && (
        <TooltipContent side="top" className="panel-glass border-panel-border max-w-[260px] p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-bold text-foreground">{echo.name}</span>
              <span className="text-[10px] font-mono-tech" style={{ color: `hsl(${elementColor})` }}>
                Lv.{echo.level} · {echo.cost} Cost
              </span>
            </div>
            {echo.setName && (
              <p className="text-[10px] uppercase tracking-wider" style={{ color: `hsl(${elementColor} / 0.7)` }}>
                {echo.setName}
              </p>
            )}
            <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, hsl(${elementColor} / 0.3), transparent)` }} />
            <div className="text-xs text-foreground">
              <span className="text-muted-foreground">Main: </span>
              {echo.mainStat.name} <span className="font-mono-tech">{echo.mainStat.value}</span>
            </div>
            <div className="space-y-0.5">
              {echo.subStats.map((sub, i) => (
                <div key={i} className="text-[11px] text-muted-foreground flex justify-between">
                  <span>{sub.name}</span>
                  <span className="font-mono-tech">{sub.value}</span>
                </div>
              ))}
            </div>
          </div>
        </TooltipContent>
      )}
    </Tooltip>
  )
}

export default EchoSlot
