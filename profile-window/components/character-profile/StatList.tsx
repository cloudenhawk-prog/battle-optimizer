import { motion } from 'framer-motion'
import type { CharacterStat } from './types'

interface StatListProps {
  stats: CharacterStat[]
  elementColor: string
}

const StatList = ({ stats, elementColor }: StatListProps) => {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
      {stats.map((stat, i) => (
        <motion.div key={stat.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.03, duration: 0.25 }} className="flex items-center justify-between py-1.5 border-b border-border/20 group">
          <span className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider">{stat.name}</span>
          <span className="text-sm font-mono-tech tabular-nums transition-colors group-hover:brightness-125" style={{ color: `hsl(${elementColor} / 0.9)` }}>
            {stat.displayValue}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

export default StatList
