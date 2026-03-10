# Form System Documentation

## Overview

The form system allows characters to have different forms/stances, each with their own available actions, custom intro/outro skills, and form-specific conditions.

## Core Components

### 1. Form Type (`src/types/form.ts`)

Defines what a form is:

```typescript
type Form = {
  name: string // Unique identifier
  displayName?: string // UI display name
  isDefault?: boolean // Whether this is the default starting form
  availableActions?: string[] // Actions available in this form (undefined = all actions)
  introAction?: string // Custom intro action for this form
  outroAction?: string // Custom outro action for this form
  icon?: string // Visual indicator
}
```

### 2. Character Integration

Characters can now define forms:

```typescript
type Character = {
  // ... existing fields
  forms?: Form[] // Array of available forms
}
```

### 3. Snapshot Tracking

Each snapshot now tracks the current form per character:

```typescript
interface Snapshot {
  // ... existing fields
  charactersForms: Record<string, string> // characterName -> formName
}
```

## Usage Guide

### Defining Forms for a Character

```typescript
export const exampleCharacter: Character = {
  name: 'Example',
  actions: [...],
  maxEnergies: {...},
  stats: {...},
  damageModifiers: [...],
  forms: [
    {
      name: 'Base',
      displayName: 'Base Form',
      isDefault: true,
      // availableActions undefined = all actions available
    },
    {
      name: 'Transformed',
      displayName: 'Transformed Form',
      availableActions: ['Skill 1', 'Skill 2', 'Transform Back'],
      introAction: 'Custom Intro',  // Optional custom intro
      outroAction: 'Custom Outro',  // Optional custom outro
      icon: '/assets/transformed-icon.png'
    }
  ]
}
```

### Restricting Actions to Specific Forms

Use `requiredForms` in action cast conditions:

```typescript
const skillOnlyInTransformedForm: Action = {
  name: 'Transformed Skill',
  // ... other properties
  castConditions: {
    requiredForms: ['Transformed'], // Only available in Transformed form
    startState: 'GROUND',
    endState: 'GROUND',
  },
}
```

### Changing Forms Through Actions

Use `formChange` property on actions:

```typescript
const transformAction: Action = {
  name: 'Transform',
  // ... other properties
  formChange: 'Transformed', // Changes character to Transformed form
  castConditions: {
    requiredForms: ['Base'], // Can only transform from Base form
    startState: 'GROUND',
    endState: 'GROUND',
  },
}
```

### Complex Casting Conditions

Use `customCanCast` for conditions beyond simple form checks:

```typescript
const conditionalTransform: Action = {
  name: 'Transform (During Buff)',
  // ... other properties
  formChange: 'Transformed',
  castConditions: {
    requiredForms: ['Base'],
    startState: 'GROUND',
    endState: 'GROUND',
    // Custom validation: can only cast when specific buff is active
    customCanCast: (prevSnapshot, characterName) => {
      if (!prevSnapshot) return false
      return (prevSnapshot.buffs['Mandate'] ?? 0) > 0
    },
  },
}
```

## Cartethyia Example Implementation

For Cartethyia's form system:

1. **Define two forms:**
   - Base (Cartethyia form)
   - Fleurdelys form

2. **Transform actions:**
   - `Transform to Fleurdelys`: High energy cost, cooldown, changes to Fleurdelys
   - `Transform to Fleurdelys (During Mandate)`: Free, low cooldown, requires Mandate buff
   - `Transform to Cartethyia`: Free, low cooldown, can't cast if Conviction is full

3. **Form-specific intro/outro:**
   - Each form can define custom intro/outro skills
   - System automatically selects correct one during swap

## System Behavior

### Form Display

- Current form shown in Character State Tracker
- Displays as a badge below the position indicator
- Shows form icon (if provided) and display name

### Action Selection

- Actions are filtered based on:
  1. Form restrictions (`requiredForms`)
  2. Custom conditions (`customCanCast`)
  3. Energy/cooldown/position requirements

### Form Persistence

- Forms persist across swaps
- Form state is tracked per character
- Default form used when character first appears

### Intro/Outro Selection

- System checks if current form has custom intro/outro
- Falls back to default intro/outro if not specified
- Automatically used during character swaps

## Helper Functions

### `getCurrentForm(character, formName)`

Gets the current form object for a character.

### `getAvailableActionsForForm(character, formName)`

Returns actions available in the specified form.

### `getDefaultFormName(character)`

Returns the default form name for a character.

### `getActionNameByDmgType(character, dmgType, formName?)`

Gets intro/outro action name, respecting form-specific overrides.

## Technical Details

### Resolvers

- Form changes are resolved in `resolveCastState()`
- Form state is preserved across snapshots
- Form changes are logged for debugging

### Action Validation

- Form checks integrated into `ActionSelect` component
- Actions disabled if form requirements not met
- Visual feedback for unavailable actions

### State Management

- Forms tracked in snapshot's `charactersForms` record
- Initialized in `createEmptySnapshot()`
- Carried forward in `createSnapshot()`

## Best Practices

1. **Always define a default form** if using forms
2. **Use `availableActions` to restrict actions per form** for clarity
3. **Use `customCanCast` for complex conditions** (buff-dependent, etc.)
4. **Provide descriptive display names** for better UX
5. **Test form transitions** to ensure proper state handling

## Future Enhancements

Potential future additions:

- Form-specific energy/stat modifiers
- Visual effects during form changes
- Form change animations
- Multiple form layers (e.g., stance + weapon form)
