import { motion } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { WeaponData } from './types'

interface WeaponSlotProps {
  weapon: WeaponData | null
  elementColor: string
  delay?: number
}

const WeaponSlot = ({ weapon, elementColor, delay = 0 }: WeaponSlotProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay, duration: 0.35, type: 'spring', stiffness: 200 }} className="relative group cursor-pointer w-[72px] h-[72px]">
          <div
            className="absolute inset-0 rounded-lg transition-all duration-300 border"
            style={{
              background: weapon ? `linear-gradient(135deg, hsl(${elementColor} / 0.12), hsl(var(--secondary) / 0.6))` : 'hsl(var(--secondary) / 0.3)',
              borderColor: weapon ? `hsl(${elementColor} / 0.35)` : 'hsl(var(--border) / 0.3)',
            }}
          />

          <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: `inset 0 0 20px hsl(${elementColor} / 0.12), 0 0 14px hsl(${elementColor} / 0.2)` }} />

          <div className="relative z-10 flex flex-col items-center justify-center h-full px-1">
            {weapon ? (
              <>
                <span className="text-base leading-none mb-0.5">⚔</span>
                <span className="text-[9px] font-display font-bold leading-tight text-center truncate max-w-full" style={{ color: `hsl(${elementColor} / 0.9)` }}>
                  R{weapon.rank}
                </span>
                <span className="text-[7px] text-muted-foreground truncate max-w-full text-center leading-tight mt-0.5">{weapon.name}</span>
              </>
            ) : (
              <span className="text-lg text-muted-foreground/30">⚔</span>
            )}
          </div>

          {/* Corner accents */}
          {weapon && (
            <>
              <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l rounded-tl-lg" style={{ borderColor: `hsl(${elementColor} / 0.5)` }} />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r rounded-tr-lg" style={{ borderColor: `hsl(${elementColor} / 0.5)` }} />
              <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l rounded-bl-lg" style={{ borderColor: `hsl(${elementColor} / 0.5)` }} />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r rounded-br-lg" style={{ borderColor: `hsl(${elementColor} / 0.5)` }} />
            </>
          )}
        </motion.div>
      </TooltipTrigger>

      {weapon && (
        <TooltipContent side="top" className="panel-glass border-panel-border max-w-[280px] p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-bold text-foreground">{weapon.name}</span>
              <span className="text-[10px] font-mono-tech" style={{ color: `hsl(${elementColor})` }}>
                Lv.{weapon.level} · R{weapon.rank}
              </span>
            </div>
            <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, hsl(${elementColor} / 0.3), transparent)` }} />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Base ATK</span>
              <span className="font-mono-tech text-foreground">{weapon.baseAtk}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{weapon.subStat.name}</span>
              <span className="font-mono-tech text-foreground">{weapon.subStat.value}</span>
            </div>
            <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, hsl(${elementColor} / 0.2), transparent)` }} />
            <p className="text-[11px] text-muted-foreground leading-relaxed">{weapon.passive}</p>
          </div>
        </TooltipContent>
      )}
    </Tooltip>
  )
}

export default WeaponSlot
