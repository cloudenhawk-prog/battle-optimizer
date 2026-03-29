import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import StatList from './StatList'
import SequenceChain from './SequenceChain'
import EquipmentOrbit from './EquipmentOrbit'
import type { CharacterProfileData } from './types'
import { ELEMENT_COLORS } from './types'

interface CharacterProfileOverlayProps {
  isOpen: boolean
  onClose: () => void
  character: CharacterProfileData
}

const CharacterProfileOverlay = ({ isOpen, onClose, character }: CharacterProfileOverlayProps) => {
  const elTheme = ELEMENT_COLORS[character.element] || ELEMENT_COLORS.spectro

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-4 md:inset-6 lg:inset-10 z-50 panel-glass rounded-xl overflow-hidden flex flex-col"
            style={{
              boxShadow: `0 0 80px hsl(${elTheme.primary} / 0.08), 0 8px 40px hsl(220 40% 4% / 0.85)`,
            }}>
            {/* Header bar */}
            <div className="shrink-0 border-b border-border/30">
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: 'spring' }}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: `radial-gradient(circle, hsl(${elTheme.primary} / 0.25), transparent)`,
                      border: `1px solid hsl(${elTheme.primary} / 0.3)`,
                    }}>
                    <span className="font-display text-sm font-black" style={{ color: `hsl(${elTheme.primary})` }}>
                      {character.name.charAt(0)}
                    </span>
                  </motion.div>
                  <div>
                    <h2 className="font-display text-base font-bold tracking-wide text-foreground">{character.name}</h2>
                    <p className="text-[10px] font-mono-tech text-muted-foreground">
                      Lv.{character.level} ·{' '}
                      <span style={{ color: `hsl(${elTheme.primary})` }} className="uppercase">
                        {elTheme.label}
                      </span>
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="flex flex-col lg:flex-row min-h-full">
                {/* Left — Character portrait area */}
                <div
                  className="relative lg:w-[320px] shrink-0 flex flex-col items-center justify-center py-8 px-6"
                  style={{
                    background: `linear-gradient(180deg, hsl(${elTheme.bg}), hsl(var(--background)))`,
                  }}>
                  {/* Large portrait placeholder */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="relative w-48 h-64 rounded-2xl overflow-hidden mb-6"
                    style={{
                      background: `linear-gradient(180deg, hsl(${elTheme.primary} / 0.08), hsl(${elTheme.primary} / 0.02))`,
                      border: `1px solid hsl(${elTheme.primary} / 0.15)`,
                    }}>
                    {/* Ethereal glow behind character */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(ellipse at 50% 30%, hsl(${elTheme.primary} / 0.12), transparent 70%)`,
                      }}
                    />
                    <div className="relative z-10 flex items-center justify-center h-full">
                      <span className="font-display text-6xl font-black opacity-20" style={{ color: `hsl(${elTheme.primary})` }}>
                        {character.name.charAt(0)}
                      </span>
                    </div>
                    {/* Bottom gradient fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-16" style={{ background: `linear-gradient(transparent, hsl(${elTheme.bg}))` }} />
                  </motion.div>

                  {/* Character name large */}
                  <motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="font-display text-xl font-black tracking-widest uppercase" style={{ color: `hsl(${elTheme.primary})` }}>
                    {character.name}
                  </motion.h3>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="text-xs font-mono-tech text-muted-foreground mt-1">
                    Level {character.level} · {elTheme.label}
                  </motion.p>

                  {/* Decorative vertical line */}
                  <div className="hidden lg:block absolute right-0 top-8 bottom-8 w-px" style={{ background: `linear-gradient(180deg, transparent, hsl(${elTheme.primary} / 0.2), transparent)` }} />
                </div>

                {/* Right — Data */}
                <div className="flex-1 p-6 flex flex-col">
                  {/* Stats Section — compact */}
                  <div className="mb-2">
                    <SectionHeader label="Attributes" elementColor={elTheme.primary} />
                    <StatList stats={character.stats} elementColor={elTheme.primary} />
                  </div>

                  {/* Resonance Chain — used as a creative divider */}
                  <div className="relative py-3 my-1">
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, hsl(${elTheme.primary} / 0.25))` }} />
                      <SequenceChain sequenceLevel={character.sequenceLevel} sequences={character.sequences} elementColor={elTheme.primary} />
                      <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, hsl(${elTheme.primary} / 0.25), transparent)` }} />
                    </div>
                    {/* Subtle glow line behind the chain */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-6 pointer-events-none opacity-30 blur-md" style={{ background: `linear-gradient(90deg, transparent 10%, hsl(${elTheme.primary} / 0.15) 50%, transparent 90%)` }} />
                  </div>

                  {/* Equipment + Set Bonuses — primary focus, takes remaining space */}
                  <div className="flex-1">
                    <SectionHeader label="Equipment" elementColor={elTheme.primary} />
                    <div className="flex flex-col xl:flex-row items-center xl:items-start gap-6">
                      {/* Orbit — takes primary space */}
                      <div className="flex-1 flex justify-center">
                        <EquipmentOrbit echoes={character.echoes} weapon={character.weapon} elementColor={elTheme.primary} />
                      </div>

                      {/* Set Bonuses — compact sidebar */}
                      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="xl:w-56 shrink-0 space-y-2">
                        <p className="text-[10px] font-display uppercase tracking-[0.15em] text-muted-foreground mb-2">Set Bonuses</p>
                        {character.setBonuses.map((bonus, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-lg border"
                            style={{
                              background: `hsl(${elTheme.primary} / 0.04)`,
                              borderColor: `hsl(${elTheme.primary} / 0.12)`,
                            }}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-display font-bold uppercase" style={{ color: `hsl(${elTheme.primary})` }}>
                                {bonus.pieces}-Set
                              </span>
                              <span className="text-[10px] text-muted-foreground font-body">{bonus.setName}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">{bonus.description}</p>
                          </div>
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom accent */}
            <div className="h-px w-full shrink-0" style={{ background: `linear-gradient(90deg, transparent, hsl(${elTheme.primary} / 0.3), transparent)` }} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const SectionHeader = ({ label, elementColor }: { label: string; elementColor: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, hsl(${elementColor} / 0.3), transparent)` }} />
    <span className="font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
    <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, hsl(${elementColor} / 0.3))` }} />
  </div>
)

export default CharacterProfileOverlay
