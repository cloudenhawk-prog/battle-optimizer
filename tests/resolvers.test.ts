// Tests for resolver functions that process action steps
//
// Functions to test:
// - buildStepContext: Creates the context object for an action step
// - resolveTime: Calculates fromTime/toTime for an action
// - resolveDamageModifiers: Applies damage modifiers from buffs/debuffs/stats
// - resolveDamage: Calculates damage and creates damage events
// - resolveNegativeStatuses: Updates negative status stacks and timers
// - resolveResources: Updates energy/concerto/forte resources
//
// These are the core functions in the action flow pipeline
