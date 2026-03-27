import { useState } from 'react'
import { Settings } from 'lucide-react'
import CharacterProfileOverlay from '@/components/character-profile/CharacterProfileOverlay'
import { MOCK_CHARACTER } from '@/components/character-profile/mockData'

const Index = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {/* Demo trigger — simulates the gear icon on a character window */}
      <button
        onClick={() => setIsProfileOpen(true)}
        className="group flex items-center gap-3 px-6 py-4 rounded-xl panel-glass
          border border-border/40 hover:border-energy-cyan/40 transition-all duration-300 hover:glow-cyan">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(45 100% 60% / 0.2), hsl(45 100% 60% / 0.05))' }}>
          <span className="font-display text-lg font-black text-sequence-active">J</span>
        </div>
        <div className="text-left">
          <p className="font-display text-sm font-bold text-foreground tracking-wide">Jinhsi</p>
          <p className="text-xs font-mono-tech text-muted-foreground">Lv.90 · Spectro</p>
        </div>
        <Settings size={18} className="ml-4 text-muted-foreground group-hover:text-energy-cyan group-hover:rotate-90 transition-all duration-500" />
      </button>

      <CharacterProfileOverlay isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} character={MOCK_CHARACTER} />
    </div>
  )
}

export default Index
