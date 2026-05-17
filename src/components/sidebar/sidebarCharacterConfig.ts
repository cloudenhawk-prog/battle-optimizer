// ========== Sidebar Character Image Config ===================================================================================
// Controls the background image displayed in the sidebar for each character.
// All fields are optional — omitted fields fall back to the CSS defaults.
// The image path convention is /assets/ui/<character_name_lowercase>.png

export type SidebarCharacterImageConfig = {
  /** Horizontal offset of the background image (e.g. '-70px'). Defaults to --img-x. */
  x?: string
  /** Vertical offset of the background image (e.g. '-15px'). Defaults to --img-y. */
  y?: string
  /** Width of the background image (e.g. '400px'). Defaults to --img-width. */
  width?: string
}

// Keyed by character name (must match Character.name exactly).
export const sidebarCharacterConfig: Record<string, SidebarCharacterImageConfig> = {
  Hiyuki: { x: '-45px', y: '5px', width: '350px' },
  Lucila: { x: '-23px', y: '4px', width: '350px' },
}
