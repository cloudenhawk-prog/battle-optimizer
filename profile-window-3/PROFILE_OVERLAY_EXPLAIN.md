
# Character Profile Overlay: Migration Overview

This folder contains a self-contained character profile overlay UI. Only the overlay and its direct dependencies are relevant for migration. Ignore app/routing logic.

## Files Required for Migration

**components/character-profile/**
- CharacterProfileOverlay.tsx — Main overlay component (modal logic, layout, rendering)
- StatList.tsx — Stat grid
- SequenceChain.tsx — Resonance/sequence progression
- EquipmentOrbit.tsx — Equipment/echoes/weapon layout
- WeaponSlot.tsx, EchoSlot.tsx, SequenceNode.tsx — Subcomponents for equipment/sequence
- types.ts — We should use our own types, or add new types to the project based on the demo if needed
- mockData.ts — We should use our own data from the project, not the example data used for demoing.

**components/ui/**
- Only migrate UI primitives (e.g., dialog.tsx, button.tsx) if your target app lacks equivalents and they are directly imported by overlay files.

**lib/utils.ts** — Utility functions used by overlay components

**hooks/use-mobile.tsx** — (If referenced) Responsive/mobile logic

## CSS/Styling

- App.css, index.css — Only migrate overlay-specific styles if present
- Overlay components may use CSS modules or inline styles; check imports in overlay files

## What to Ignore

- App.tsx, main.tsx, routing, unrelated pages/components
- Only overlay and its direct dependencies are needed

---
To migrate: port all files in components/character-profile/ and any overlay-specific CSS. Bring over only the UI primitives and utilities directly used by the overlay. Integrate by rendering CharacterProfileOverlay and providing required data/types.



# Profile Overlay Overview for LLM / Copilot
Goal

Produce a single-file ProfileOverlay.tsx that:

Shows character sequences, echoes, weapons, and stats.
Uses animations (Framer Motion).
Uses tooltips (Tooltip.tsx).
Uses project styling from CSS variables and classes.
Works with example data, which will later be replaced with real data.
Required Source Files
1. Tooltip.tsx
Location: ./Tooltip.tsx
Exports:
Tooltip, TooltipTrigger, TooltipContent, TooltipProvider
Uses: @radix-ui/react-tooltip and cn utility.
Purpose: All hover info tooltips in the overlay.
2. utils.ts
Location: ./utils.ts
Exports:
cn(...inputs: ClassValue[]) — merges Tailwind classes safely.
Used in Tooltip and optional styling merges.
3. Tailwind CSS + Project Variables
Location: index.css / app.css (you may combine)
Provides:
Base colors: --background, --foreground, --card, --popover, --primary, etc.
Overlay-specific tokens: --energy-cyan, --energy-violet, --panel-glass, --sequence-active, etc.
Utility classes: .panel-glass, .hex-clip, .glow-cyan, .glow-violet, .font-display, .font-mono-tech, .font-body.
Required for: proper overlay styling, shadows, colors, and fonts.
4. Profile Overlay Components (example)

Components that make up the overlay:

SequenceNode
Displays individual sequence elements.
Animates active/inactive state.
Uses tooltip for description.
Uses elementColor variable for dynamic coloring.
EchoSlot
Displays equipped echoes.
Shows cost, level, main and sub stats.
Uses tooltip for detailed info.
WeaponSlot (if needed later)
Displays weapon info.
Uses tooltip for weapon stats and passive info.
StatList
Displays character stats (health, attack, defense, etc.).
Uses elementColor for highlighting.

Note: All of these components rely on example data interfaces (SequenceInfo, EchoData, WeaponData, CharacterStat) — the real data will differ but follow similar structures.

Data Inputs
Example / placeholder data is used in the current overlay.
Types/interfaces should be included in the single-file version.
Real data can be injected later; the overlay should not assume any fixed values.
Animation / Motion
Uses Framer Motion:
Entrance animations (scale, opacity).
Pulsing/looping effects for active sequences or echoes.
Tooltips can appear with default Radix transitions.
Tooltip Integration

Each interactive component (SequenceNode, EchoSlot, WeaponSlot) wraps with:

<Tooltip>
  <TooltipTrigger asChild> ... </TooltipTrigger>
  <TooltipContent> ... </TooltipContent>
</Tooltip>
Tooltip content uses .panel-glass and border-panel-border for style consistency.
Styling Summary
CSS variables control colors dynamically.
Classes to include:
.panel-glass, .hex-clip, .glow-cyan, .glow-violet, .energy-line
Font helpers: .font-display, .font-mono-tech, .font-body
Tailwind utilities for spacing, flex, grid, rounded corners, borders, shadows.
LLM Guidance for Single File Generation

When generating ProfileOverlay.tsx:

Import required modules:

import React from 'react'
import { motion } from 'framer-motion'
import { Tooltip, TooltipTrigger, TooltipContent } from './Tooltip'
import { cn } from './utils'
import './profile-overlay.css'
Include types/interfaces for:
SequenceInfo
EchoData (with main and sub stats)
WeaponData
CharacterStat
Include all overlay components in the same file:
SequenceNode, EchoSlot, WeaponSlot (optional), StatList
Use Tailwind classes and CSS variables from profile-overlay.css for consistent styling.
Use example data for placeholder rendering; real data can be passed via props.
Keep all animations and tooltip logic intact.
All colors dynamically use elementColor where needed for sequences, echoes, weapons, and stat highlights.

# Data in the real project
The following types support properties that can be used for info, icons, tooltips etc. on the new profile overlay instead of "mock data"

Echoes:
icon: string
info?: string
info_icon: string

EchoSlots:
1: Echo | null (main slot echo, treated specially)
2: Echo | null
3: Echo | null
4: Echo | null
5: Echo | null

EchoSetBonus:
name: string
info: { [key: string]: string } (contains entries equivalent to each set bonus, like 2-set bonus, 5-set bonus or whatever is present)
icon: the echo set bonus icon

CharacterStats:
level
stats used for the stat display (we already have implemented a stat displayed so we need to use it combined with the new layout)
sequence (used for resonance chain display)
sequence_nodes (used for tooltips of the 6 nodes)
sequence_nodes_icons (corresponding icons)
(important: Currently the structure is bad because it assumes exactly 6 entries in the right order, this could cause a mess if someone inputs the data wrong)

Character:
name
element (used for color theme)

type Weapon
name
stats
rank
info
icon

And possibly some others depending on what the profile overlay expects