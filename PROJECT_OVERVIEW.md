# Battle Optimizer - Projektoversigt

## 📋 Overordnet Formål
Battle Optimizer er en React-baseret webapplikation til optimering af kampsekvenser (rotations) i et spil. Brugeren kan vælge karakterer, planlægge deres handlinger (actions) i sekvens, og systemet beregner automatisk energi, skade, buffs, debuffs og negative statuses over tid.

---

## 🏗️ Arkitektur & Teknologi Stack

### Frontend Framework
- **React 19.2.0** med TypeScript
- **Vite** som build tool
- **React Router DOM** til navigation
- **Tailwind CSS** til styling
- **ESLint** til code quality

### Planlagte UI-biblioteker (endnu ikke implementeret)
- Material UI (@mui/material, @emotion/react, @emotion/styled)
- Material UI Icons (@mui/icons-material, mdi-material-ui)
- @dnd-kit (drag & drop)
- @tanstack/react-virtual (virtualized lists)
- react-colorful (color picker)
- yet-another-react-lightbox (image gallery)
- react-minimal-pie-chart (charts)

---

## 📁 Mappestruktur & Filbeskrivelser

### 🎯 `/src/` - Root
- **`main.tsx`**: Entry point. Renderer `<App />` wrapped i `<BrowserRouter>`
- **`App.tsx`**: Hovedkomponent med routing logic (React Router)
  - Wrapper alt i `<AppLayout>`
  - Definerer routes: `/`, `/rotations`, `/analytics`, `/settings`

---

### 🧩 `/src/types/` - Type Definitions

#### `characters.ts`
Definerer kernetyper for karakterer og handlinger:
```typescript
Action = {
  name: string                          // Navn på handlingen (fx "Fireball", "Backstab")
  time: number                          // Tid handlingen tager (sekunder)
  damage: number                        // Base damage
  energyGenerated: Record<string, number>  // Energi genereret (energy, concerto, forte)
  negativeStatusesApplied: string[]     // Hvilke negative statuses der påføres
  buffsApplied: string[]                // Hvilke buffs der påføres
  debuffsApplied: string[]              // Hvilke debuffs der påføres
}

Character = {
  name: string
  actions: Action[]                     // Alle handlinger karakteren kan udføre
  negativeStatuses: string[]            // Negative statuses karakteren kan påføre
  buffs: string[]                       // Buffs karakteren har adgang til
  debuffs: string[]                     // Debuffs karakteren kan påføre
  maxEnergies: Record<string, number>   // Max energi for hver energitype
}
```

#### `snapshot.ts`
En snapshot repræsenterer tilstanden på et specifikt tidspunkt i rotationen:
```typescript
Snapshot = Record<string, 
  number |                              // fx id, fromTime, toTime, damage, dps
  string |                              // fx character, action
  Record<string, number> |              // fx buffs, debuffs, negativeStatuses
  Record<string, Record<string, number>> // fx charactersEnergies
>
```

#### `tableDefinitions.ts`
Definerer strukturen for tabelvisningen:
```typescript
TableConfig = {
  basic: ColumnGroup                    // Grundlæggende kolonner (tid, skade, dps)
  characters: ColumnGroup[]             // En gruppe per karakter (energier)
  negativeStatuses: ColumnGroup         // Negative status kolonner
  buffs: ColumnGroup                    // Buff kolonner
  debuffs: ColumnGroup                  // Debuff kolonner
}

ColumnGroup = {
  label: string                         // Gruppenavn
  columns: ColumnDef[]                  // Kolonnedefinitioner
}

ColumnDef = {
  key: string                           // Unik nøgle
  label: string                         // Visningsnavn
  render: (snapshot: Snapshot) => ReactNode  // Rendering funktion
}
```

#### `negativeStatus.ts`
```typescript
NegativeStatus = {
  name: string                          // Navn (fx "Aero Erosion")
  duration: number                      // Varighed i sekunder
  maxStacksDefault: number              // Max antal stacks
  frequency: number                     // Hvor ofte effekten ticker
  damage: Record<number, number>        // Damage per stack level
  element: string                       // Element type (Aero, Spectro, etc.)
}
```

---

### 📊 `/src/data/` - Game Data

#### `characters.ts`
Hårdkodet data for alle karakterer i spillet. Eksempler:
- **Mage**: Fireball, Ice Spike, Intro, Outro
- **Rogue**: Backstab, Poison, Intro, Outro
- Hver karakter har `maxEnergies` (energy, concerto, forte)

#### `negativeStatuses.ts`
Eksporterer `Record<string, NegativeStatus>`:
- **aeroErosion**: 15s duration, 3 stacks, ticks hver 3. sekund
- **spectroFrazzle**: 10s duration, 10 stacks, damage per stack

---

### 🧠 `/src/engine/` - Game Logic

#### `damageCalculator.ts`
**Formål**: Beregne final damage baseret på stats, modifiers, defense, etc.
**Status**: Placeholder - returnerer bare base damage lige nu
**Fremtid**: Vil modtage karakter stats, damage type, enemy defense, buffs/debuffs

#### `buffManager.ts`
**Formål**: Håndtere buffs over tid (duration, stacking, expiration)
**Status**: Tom fil (ikke implementeret endnu)

#### `cooldownTracker.ts`
**Formål**: Tracke cooldowns på abilities
**Status**: Tom fil (ikke implementeret endnu)

#### `snapshotUtils.ts`
**Formål**: Utility funktioner til snapshot manipulation
**Status**: Tom fil (ikke implementeret endnu)

---

### 🪝 `/src/hooks/` - Custom Hooks

#### `useRotationEditor.ts`
**Hovedhook for rotation editor logik**

**Input**:
- `charactersInBattle: Character[]` - Valgte karakterer
- `tableConfig: TableConfig` - Tabelkonfiguration

**State**:
- `snapshots: Snapshot[]` - Array af alle snapshots i rotationen

**Funktioner**:
- `handleCharacterSelect(snapshotId, characterName)` - Vælg karakter til en row
- `handleActionSelect(snapshotId, actionName)` - Vælg action og trigger beregninger
- `recalcTimeline()` - Genberegn hele timeline (TODO)

**Intern Logik**:
- `createEmptySnapshot()` - Lav tom snapshot med 0-værdier
- `createSnapshot(previousSnapshot)` - Lav ny snapshot baseret på forrige
- `updateSnapshotsWithAction()` - Opdater snapshot når action vælges:
  - Beregner `fromTime`, `toTime`, `damage`, `dps`
  - Opdaterer energier baseret på `energyGenerated`
  - Håndterer speciel logic for Outro/Intro swaps
  - Tilføjer automatisk ny tom row når sidste row udfyldes

**Speciel Logic - Outro/Intro System**:
Når concerto når 100 og man skifter karakter:
1. Indsæt automatisk "Outro" for forrige karakter
2. Indsæt "Intro" for ny karakter
3. Nulstil concerto efter Outro

---

### 🎨 `/src/components/` - React Components

#### `AppLayout.tsx`
**Layout wrapper for hele applikationen**
- Sidebar med navigation (Home, Rotations, Analytics, Settings)
- Logo/ikon
- Version footer
- Main content area
- Bruger React Router's `useLocation` til active state

---

### 📝 `/src/components/rotation-editor/`

#### `RotationEditor.tsx`
**Hovedkomponent for rotation editor siden**
- Henter `charactersInBattle` som prop
- Bygger `tableConfig` via `buildTableConfig()`
- Initialiserer `useRotationEditor` hook
- Renderer `<RotationTable>` med alle nødvendige props

---

### 📊 `/src/components/rotation-editor/rotation-table/`

#### `RotationTable.tsx`
**Container for hele tabellen**
- Renderer `<HeaderRow>` og mange `<BodyRow>`
- Håndterer highlight-animation for nyligt tilføjede rows:
  - Tracker sidste 4 snapshots
  - Highlighter Outro/Intro rows når de auto-insertes
  - Highlighter forrige row når ny tilføjes
  - Fjerner highlight efter 1.5 sekund

#### `HeaderRow.tsx`
**Renderer tabel headers i 2 niveauer**:
1. **Top-level**: Gruppe headers (Basic, Character names, Negative Statuses, Buffs, Debuffs)
2. **Column-level**: Kolonnenavne inden for hver gruppe

Bruger `colSpan` til at gruppere kolonner visuelt.

#### `BodyRows.tsx`
**Renderer en enkelt row i tabellen**

**Kolonner**:
1. **Character select dropdown** - Vælg karakter
2. **Action select dropdown** - Vælg action (disabled indtil karakter valgt)
3. **Basic columns** - Tid, damage, dps (fra `tableConfig.basic`)
4. **Character-specific columns** - Energier per karakter (energy, concerto, forte)
5. **Negative status columns** - Stacks/damage
6. **Buff columns** - Buff status
7. **Debuff columns** - Debuff status

**Special Features**:
- `isLastRow` prop for styling
- `isNewRow` prop for highlight animation
- Actions dropdowns skjuler "Intro" og "Outro" medmindre de er current action
- Tom celler hvis karakter/action ikke valgt

---

### 🏗️ `/src/components/rotation-editor/table-builders/`

#### `buildTableConfig.ts`
**Master builder der samler alle kolonner**
```typescript
buildTableConfig(characters: Character[]): TableConfig {
  return {
    basic: buildBasicColumns(),
    characters: buildCharacterGroupsColumns(characters),
    negativeStatuses: buildNegativeStatusColumns(characters),
    buffs: buildBuffColumns(characters),
    debuffs: buildDebuffColumns(characters),
  }
}
```

#### `buildBasicColumns.ts`
Bygger grundkolonner:
- `fromTime` - Start tid (fx "2.5s")
- `toTime` - Slut tid (fx "4.5s")
- `damage` - Kumulativ damage
- `dps` - Damage per second

#### `buildCharacterGroupedColumns.ts`
Bygger en `ColumnGroup` per karakter med kolonner for hver energitype:
- Fx Mage får kolonner: "Energy", "Concerto", "Forte"
- Render funktion henter fra `snapshot.charactersEnergies[charName][energyKey]`

#### `buildNegativeStatusColumns.ts`
**Status**: Endnu ikke analyseret (formentlig bygger kolonner for hver negative status)

#### `buildBuffColumns.ts`
**Status**: Endnu ikke analyseret (formentlig bygger kolonner for hver buff)

#### `buildDebuffColumns.ts`
**Status**: Endnu ikke analyseret (formentlig bygger kolonner for hver debuff)

---

### 🔧 `/src/utils/` - Utility Functions

#### `optionBuilders.tsx`
```typescript
buildActionOptions(actions, currentAction) => JSX.Element[]
```
Bygger `<option>` elementer til action dropdown:
- Skjuler "Intro" og "Outro" med `hidden` og `disabled`
- UNDTAGEN hvis de er `currentAction` (så de kan vises i dropdown)

---

### 📄 `/src/pages/` - Page Components

#### `HomePage.tsx`
Placeholder page med "Home Page" tekst

#### `RotationEditorPage.tsx`
Wrapper page der renderer `<RotationEditor>`:
- Importerer `characters` data
- Sender det til `<RotationEditor charactersInBattle={characters} />`

#### `AnalyticsPage.tsx`
Ikke implementeret (formentlig fremtidig analytics/statistik side)

#### `SettingsPage.tsx`
Ikke implementeret (formentlig fremtidige indstillinger)

#### `NotFoundPage.tsx`
404 page for ukendte routes

---

## 🔄 Dataflow & Komponentsammenspil

### 1️⃣ Initial Load
```
main.tsx
  └─> App.tsx (BrowserRouter)
      └─> AppLayout (sidebar + navigation)
          └─> Routes
              └─> RotationEditorPage
                  └─> RotationEditor
```

### 2️⃣ Rotation Editor Flow
```
RotationEditorPage
  └─> Henter characters data
  └─> RotationEditor (charactersInBattle)
      ├─> buildTableConfig(charactersInBattle) → tableConfig
      ├─> useRotationEditor({ charactersInBattle, tableConfig })
      │   ├─> State: snapshots[]
      │   ├─> handleCharacterSelect()
      │   └─> handleActionSelect()
      └─> RotationTable
          ├─> Props: snapshots, charactersInBattle, tableConfig, handlers
          ├─> HeaderRow (tableConfig)
          └─> BodyRow[] (én per snapshot)
              ├─> Character dropdown → handleCharacterSelect()
              ├─> Action dropdown → handleActionSelect()
              └─> Render alle kolonner fra tableConfig
```

### 3️⃣ Action Selection Flow
```
User vælger action i BodyRow
  └─> onSelectAction(snapshotId, actionName)
      └─> handleActionSelect() i useRotationEditor
          └─> updateSnapshotsWithAction()
              ├─> Beregn fromTime, toTime, damage, dps
              ├─> Opdater energies (energy, concerto, forte)
              ├─> Check for Outro/Intro swap (concerto === 100)
              │   ├─> Insert Outro row
              │   ├─> Insert Intro row
              │   └─> Reset concerto
              ├─> Opdater snapshot
              └─> Tilføj ny tom snapshot hvis sidste row
  └─> Re-render RotationTable med opdaterede snapshots
  └─> Trigger highlight animation for nye rows
```

---

## 🎯 Vigtige Koncepter

### Snapshot
En "snapshot" repræsenterer tilstanden på ét specifikt tidspunkt:
- Hvilken karakter er aktiv
- Hvilken action blev udført
- Hvor meget tid er gået (fromTime → toTime)
- Hvor meget damage er gjort (kumulativt)
- Alle karakterers energier (energy, concerto, forte)
- Aktive buffs, debuffs, negative statuses

### TableConfig
En "config" der beskriver hvordan tabellen skal vises:
- Hvilke kolonner skal vises
- Hvordan hver kolonne skal renderes
- Hvordan data skal hentes fra snapshot

### Outro/Intro System
Special mechanic hvor:
- Når en karakters "concerto" når 100
- Og brugeren skifter til en ny karakter
- System auto-inserter "Outro" for gammel karakter
- System auto-inserter "Intro" for ny karakter
- Concerto nulstilles efter Outro

---

## 🚧 TODO & Manglende Features

### Engine
- [ ] `buffManager.ts` - Implementer buff tracking over tid
- [ ] `cooldownTracker.ts` - Implementer cooldown system
- [ ] `snapshotUtils.ts` - Utility funktioner
- [ ] `damageCalculator.ts` - Real damage beregninger med stats/modifiers

### Rotation Editor
- [ ] `recalcTimeline()` - Genberegn hele timeline når tidligere rows redigeres
- [ ] Negative status tracking over tid (duration, stacks, damage ticks)
- [ ] Buff/debuff tracking over tid (application, duration, expiration)
- [ ] Energy cap validation
- [ ] Cooldown validation

### Table Builders
- [ ] `buildNegativeStatusColumns.ts` - Komplet implementation
- [ ] `buildBuffColumns.ts` - Komplet implementation
- [ ] `buildDebuffColumns.ts` - Komplet implementation

### UI Features (fra README)
- [ ] Drag & drop kolonner for at ændre rækkefølge (@dnd-kit)
- [ ] Hide/show kolonner (bruges stadig til beregninger)
- [ ] Material UI styling
- [ ] Date pickers (@mui/x-date-pickers)
- [ ] Color pickers (react-colorful)
- [ ] Virtualized tables (@tanstack/react-virtual)
- [ ] Charts (react-minimal-pie-chart)

---

## 🎨 Styling

### Nuværende Approach
- **Tailwind CSS** til global styling
- **Custom CSS** filer i `/src/styles/components/`:
  - `AppLayout.css` - Layout styling
  - `RotationEditor.css` - Table styling + animations
- CSS classes:
  - `.tableWrapper`, `.tableBase`, `.tableHeader`, `.tableBody`
  - `.tableCellBody`, `.charGroupBody`
  - `.lastRowClass` - Styling for sidste row
  - `.rowHighlight` - Animation class for nye rows
  - `.groupHeader` - Header gruppe styling

### Fremtidig Approach
- Migrer til Material UI components
- Brug @emotion/styled for custom styling
- Drag & drop med @dnd-kit

---

## 🧪 Testing
- **Vitest** setup
- Test fil: `/src/tests/engine/damageCalculator.test.ts`
- Commands:
  - `npm test` - Run tests
  - `npm run test:watch` - Watch mode

---

## 🚀 Scripts
- `npm start` / `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

---

## 💡 Refactoring Overvejelser

### Nuværende Svagheder
1. **Snapshot type safety**: `Snapshot` er for løs (`Record<string, ...>`)
   - Overvej at lave en proper interface med konkrete felter
2. **`any` types i `useRotationEditor.ts`**: Flere steder med `any`
3. **Manglende error handling**: Ingen validation af bruger input
4. **Ingen loading states**: Ingen feedback mens beregninger kører
5. **CSS spread**: Custom CSS filer i stedet for component-based styling

### Anbefalinger til Refactoring
1. **Type Safety**
   - Lav konkret `Snapshot` interface i stedet for Record
   - Fjern alle `any` types
   - Tilføj runtime validation (Zod?)

2. **Material UI Migration**
   - Udskift native `<select>` med `<Select>` fra MUI
   - Udskift `<table>` med `<TableContainer>`, `<Table>`, etc.
   - Brug `<TextField>`, `<Button>`, `<IconButton>`
   - Implementer MUI theming

3. **State Management**
   - Overvej Zustand eller React Context for global state
   - Split `useRotationEditor` i mindre hooks
   - Implementer undo/redo functionality

4. **Code Organization**
   - Opdel `useRotationEditor.ts` (235 linjer) i mindre moduler
   - Flyt beregningslogik til `/src/engine/`
   - Lav dedicated `/src/services/` for data fetching

5. **Performance**
   - Implementer `useMemo` for tunge beregninger
   - Implementer virtualized tables (@tanstack/react-virtual)
   - Lazy load pages

6. **DX Improvements**
   - Tilføj Storybook for component development
   - Tilføj comprehensive tests
   - Setup Husky pre-commit hooks (allerede i package.json)

---

## 📞 Kontakt & Links
- Repository: `cloudenhawk-prog/battle-optimizer`
- Current branch: `feat-dynamic-skill-cost-requirements`
- Version: `v0.0.1`
