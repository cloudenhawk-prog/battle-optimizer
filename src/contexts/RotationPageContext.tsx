import { createContext, useContext } from 'react'
import type React from 'react'

// ========== Context: Rotation Page ===========================================================================================
// Provider lives in App.tsx so both Sidebar and RotationEditorPage are descendants.
// Carries the three sidebar actions and the panel state needed by RotationEditorPage.

export interface RotationPageContextValue {
  // Sidebar actions
  topbarVisible: boolean
  toggleTopbar: () => void
  openRotations: () => void
  openFieldReport: () => void
  openBuildOptimizer: () => void
  hasData: boolean
  optimizerEditMode: boolean
  toggleOptimizerEditMode: () => void
  // Panel state consumed by RotationEditorPage
  rotationsOpen: boolean
  setRotationsOpen: React.Dispatch<React.SetStateAction<boolean>>
  summaryOpen: boolean
  setSummaryOpen: React.Dispatch<React.SetStateAction<boolean>>
  buildOptimizerOpen: boolean
  setBuildOptimizerOpen: React.Dispatch<React.SetStateAction<boolean>>
  onHasDataChange: (value: boolean) => void
  // Active character for sidebar image
  selectedCharacterName: string | null
  setSelectedCharacterName: React.Dispatch<React.SetStateAction<string | null>>
}

export const RotationPageContext = createContext<RotationPageContextValue | null>(null)

export function useRotationPageContext(): RotationPageContextValue | null {
  return useContext(RotationPageContext)
}
