# Rover (Aero) Form System Test Data

This directory contains test data demonstrating the form system implementation for Rover (Aero).

## Files Structure

### `/src/data/forms/roverAero.ts`

Defines two forms:

- **Base Form** (default): Standard form with no restrictions
- **TEST FORM**: Alternative form for testing form-specific actions

### `/src/data/testActions/roverAero.ts`

Contains 5 test actions demonstrating different form behaviors:

1. **Base Form Exclusive Skill**
   - Can ONLY be cast in Base form
   - Uses `requiredForms: ['Base']`
   - 5s cooldown, costs no energy

2. **Test Form Exclusive Skill**
   - Can ONLY be cast in TEST FORM
   - Uses `requiredForms: ['TEST FORM']`
   - 8s cooldown, costs no energy

3. **Transform to Test Form**
   - Switches from Base → TEST FORM
   - Uses `requiredForms: ['Base']` + `formChange: 'TEST FORM'`
   - Costs 20 energy, 15s cooldown

4. **Transform to Base Form**
   - Switches from TEST FORM → Base
   - Uses `requiredForms: ['TEST FORM']` + `formChange: 'Base'`
   - Free (no energy cost), 3s cooldown

5. **Universal Skill**
   - Can be cast in ANY form
   - No `requiredForms` specified = universally available
   - 6s cooldown, costs no energy

## How to Use

1. **Start in Base Form** (default)
   - "Base Form Exclusive Skill" is available
   - "Universal Skill" is available
   - "Transform to Test Form" is available

2. **Transform to TEST FORM**
   - Use "Transform to Test Form" (costs 20 energy)
   - "Test Form Exclusive Skill" becomes available
   - "Universal Skill" remains available
   - "Transform to Base Form" becomes available

3. **Transform Back**
   - Use "Transform to Base Form" (free)
   - Returns to Base form state

## Key Concepts Demonstrated

### Form Restrictions

```typescript
castConditions: {
  requiredForms: ['Base'], // Locked to specific form(s)
  // ...
}
```

### Form Changes

```typescript
formChange: 'TEST FORM', // Changes character to this form
castConditions: {
  requiredForms: ['Base'], // Can only transform FROM Base
  // ...
}
```

### Universal Actions

```typescript
castConditions: {
  // No requiredForms = available in all forms
  startState: 'GROUND',
  endState: 'GROUND',
}
```

## Integration

These test actions and forms are automatically included in Rover's action list:

- Imported in `/src/data/characters/roverAero.ts`
- Spread into the actions array
- Forms added to the character's `forms` property

## Testing the System

1. Select Rover (Aero) in the rotation editor
2. Observe form display in Character State Tracker (shows "Base Form")
3. Try casting "Base Form Exclusive Skill" (should work)
4. Try finding "Test Form Exclusive Skill" (should be disabled/hidden)
5. Cast "Transform to Test Form"
6. Observe form changes to "Test Form" in Character State Tracker
7. Now "Test Form Exclusive Skill" is available, "Base Form Exclusive Skill" is not
8. "Universal Skill" works in both forms

## Cleanup

To remove test data:

1. Delete `/src/data/forms/roverAero.ts`
2. Delete `/src/data/testActions/roverAero.ts`
3. Remove imports and form/action references from `/src/data/characters/roverAero.ts`
