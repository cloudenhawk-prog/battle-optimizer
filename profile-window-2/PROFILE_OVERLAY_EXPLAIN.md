
# Character Profile Overlay: Migration Overview

This folder contains a self-contained character profile overlay UI. Only the overlay and its direct dependencies are relevant for migration. Ignore app/routing logic.

## Files Required for Migration

**components/character-profile/**
- CharacterProfileOverlay.tsx — Main overlay component (modal logic, layout, rendering)
- StatList.tsx — Stat grid
- SequenceChain.tsx — Resonance/sequence progression
- EquipmentOrbit.tsx — Equipment/echoes/weapon layout
- WeaponSlot.tsx, EchoSlot.tsx, SequenceNode.tsx — Subcomponents for equipment/sequence
- types.ts — Overlay data types
- mockData.ts — Example/mock data

**components/ui/**
- Only migrate UI primitives (e.g., dialog.tsx, button.tsx) if your target app lacks equivalents and they are directly imported by overlay files. But in that case, refactor them into the component rather than having primitives exist in files that are only referenced once.

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