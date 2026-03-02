### TODO:

# Timeline:

Implement a linepath for the graphs (dps & total dmg)

Implement Hover handlers for interactive data points or other parts or info

Timeline could get individual damage points within a snapshot (for example split damage into X intervals each time or static intervals of X units)
Timeline graphs should have lines, points, squares to show when different things occured in what intervals or times

Bug: Vertical lines in timeline seem to pop up in the beginning of actions, instead of when the damage procs (which by default right now is at the very end of the snapshot interval) (negative statuse aside). However, negative statuses have a different issue: it seems to always create a vertical line at 0.00s regardless of what happens or doesnt happen (although it is first created when the first negative status of that type is created/gets its first stack).

Bug: vertical lines in GLOBAL (negative stasus is the only thing that inhabit this linepath atm) have their vertical lines inserted in the linepath underneath where they are supposed to - perhaps the calculation determining where to add them accidently adds +1 too many, or it might be caused by some other reason.

# Data Overlay:

There should be a button to hide: 'permanent' damageModifiers with condition 'always' in the timeline and in the dataoverlay

Data Overlay contributions sections should grow wider as more are added with a minimum width and a maximum width (at which point it becomes scrollable)

Left Corner: The 3 buttons should have a title or helpful label -> we are swapping between scenarios like; too long but theoretically 'see scenario where everything crits'

Contributions: could also have hover - 'show more details'

All Sections: could have a small button in the right corner for explanations

Tether: Swap the bottom two labels: TETHER//V3.2.17 and LINK: ESTABLISHED PHASE DRIFT: 0.02' so tether is the in the left bottom corner

General: Arrows up/down to swap between data overlays quickly. Also if you click outside the data overlay it should close

MODIFIER CONTRIBUTIONS: Remove empty shell for the pillars - It makes it seem like the biggest pillar is some sort of "max possible value" which is not the case: it's just used for scaling heights so it looks good.

# Actions:

# Negative Statuses:

Need a way to dynamically update negative status: max stacks and ticks frequency since some characters affect it

# Data:

Implement Data Checker that checks if everything is respected

Cartethyia BA3-5 action - tooltip: can be used when swapped in without intro
Cartethyia's conviction generation is uncertain - need more testing
Could technically add action: cartehyia_avatar & fleurdelys_avatar (can only be cast during mandate, has a cast time, might affect mandate related buffs)
Need fleurdelys intro/outro - and logic in resolver to automatically determine which to use

Mandate buff also does: Basic 5 Fleurdelys, Mid-air 2, Enhanced Heavy, Resonance 2 apply 99 stacks of aero erosion during this time
Mandate buff also does: Lowers dmg intervals between Aero Erosion by 50 % (TODO : Test if it works when you swap away from her)
Mandate buff: Does it work or not when swapped away?
This might affect howe we want to show Mandate in timeline

CharacterData: define data that later can be combined into a character object (resolve gear, echoes etc into stats, actions, modifiers). Makes stats mistakes less prone. Might give us an overview of what contributes with what stats
Would be nice if it understood partial stats to simplify the data and make it less prone to mistakes

# Types:

Normalize keywords: source, name, displayName. When is what used? What is unique?

Clean up types - determine where which types should live!

Damage Modifiers: Do we need a type for things that also affect negative statuses? What do we do right now?

In StatusModification type under Side Effects, is 'buff/Debuff' ever used? Can side effect actually even trigger buffs? Would they need to use Damage Modifiers (since these represet buffs/debuffs)

# Table/Snapshot/Resolvers:

When cooldowns are implemented there should be ways to lower them. Cartethyia lowers skill CD when consuming swords (1s each I think)

Check Resolver flow - do they have correct numbering? Do they split responsible up nicelly? Where do different things happen?

CastConditions + offtune need logic in resolvers (defined in actions)

Action Selectors should get an upgrade. Actions should be able to define multiple different 'versions'. When one is hovered/clicked, these options should pop up. Like "Swap Cancel", "Default" - and be enforced: if swap cancel is chosen, the next row will not display that character

Make it possible to delete rows (should character/action become locked when I row is created, or should reselection automatically delete the row(s) and create the new one?)

Since picking a character doesn't do anything until an action is also selected, it's a harmless thing to do. Therefore, when creating a new empty snapshot, might as well pre-select the same character as the previous row, since in most scenarios a character is performing multiple actions before swapping out

Modifiers that only have 1 maxStack, the currentState row should display "ACTIVE" versus "INACTIVE" (with green vs red color text?). Modifiers with more than 1 maxStack should do like now, displaying "currentStacks/maxStacks"

Bug: Modifiers with type 'self' also affect side effects and negative statuses (like Mandate). There is no real logic to determine which other things aside from the main action which should be affected by a modifier. Right now it assumes that if the filter resolves to true, it affects everything in this snapshot.
Possible solutions:
Add a scope to target strategyS? action, actionSideEffects, otherSideEffects (coordinated attacks etc?), negative statuses?
Any other ideas?

Need a way to remove buffs - like FLeurdelys Mandate and sword buffs (they are timed but also disappear when she used liberation - i.e. swaps back)

TASK: When a new row is added - play an animation similarly to the light that moves through the sections in data overlay - instead of using a green color?

TASK: When a new snapshot is created, it should automatically set the character in the next one to the previous one

(MAYBE IF NOT ALREADY): Damage Events should have type -> action, action-side-effect, negative-status such that we can put them together
Context: Right now damage events only includes events from actions. We do not want a seperate event list for every type of damage event. Sorted by ID, these can be used by rows on-click overlay

# Tests:

Update tests - simple, guaranteed correct. There is a chance we sometimes test wrong things or assume wrong logic (many tests area auto generated) (to help with this, make a lot of good helper mock methods)

# Other:

Implement logic: if displayName exists use it in certain places like: selectors, timeline - not in places with lots of space and details - otherwise use name
Use custom component for the 2 table Selectors - that way we can style them EXACTLY like we want, for example making them transparent

Echoes + Weapons

TASK: Allow to click on groups to restore all icons instead of one at a time

TASK: Turn phrolova into a see-through gif with AI? Or make the background move with some "animations"?

---

---

---

NOT SORTED YET

---

Task: Implement tests for all reasonably-testable functions
Context: Right now we aren't performing any tests other than an outdated DamageCalculator.test.ts. It would be best if all functions in hooks and utils are tested

Task: Implement toggler to active/deactive the Selector Check on skill cost requrements (no need to update resolver, it's useful to see if energy becomes negative)
Context: Right now energy stops characters from using actions if the requirement is not met. It would be nice with a toggle option that let's you bypass this

Task: Implement more icon/button logic, split it into multiple css classes for different kinds
Context: Right now you can hide/unhide columns with button presses. Make certain icons non-clickable/no animation like Character/Action. Make group headers hide all columns under the group at once.

Task: Implement coordinated attacks
Context: Coordinated attacks could work similar to negative statuses but have its own section (perhaps actually called DoT)

Task: Implement source tracking on missing things
Context: Right now we can apply negative statuses (and buffs/Debuffs/coordinated attacks). We need to make sure that we can track the source - who applied them? Since they may count towards tracking the damage contribution of each character

Task: Implement a step in the useCharacterActions hook that creates references to all different effects before the first resolver
Context: Right now the resolvers are doing A LOT of work with context but run-time isn't an issue. Later it might be useful to only have to iterate the context/snapshots once and directly collect and distribute all the effects and modifiers needed in future resolvers

Task: Implement custom/dynamic outro trigger conditions
Context: Right now the outro-intro flow is hardcoded using 100 Concerto energy. It might be useful to make this function more dynamically by letting each character define a custom outro-intro trigger condition

Task: Implement dispatchable effects so damages and other things don't always proc at 'toTime'
Context: Right now everything is summed up at the 'toTime' milestone. For a more detailed timeline in the future, and so that all damage is not necessarily triggered at once, it might be useful to create a queue that you can dispatch events to. The queue might be able to resolve/progress events, sorts the events at the time it happened, and more detailed create a timeline of action/effect starts, damage-procs, occurences, and event endings. This could be especially useful for outro skills, swap-cancelling, and delayed effects and damage procs. It might even automatically let us create Coordinated Attacks and alike really easily.

Task: Implement custom importable combos
Context: Characters might have certain combos they often use - like Cartethyia double Plunge pre-Fleurdelys combo. The idea would be: select a combo from some menu -> table automatically inserts all the rows

Task: Character/gear builder
Context: Would let you set up a character, automatically calculating stats.
Task: Import characters/bosses in rotation editor
Context: Would let you set up a "battle"

The topbar layout changes every time an icon/column becomes hidden - likely reason: the icons are smaller than the empty placeholder in both directions

Since we calculate average damage, it could be cool to have MIN and MAX in a graph with colored areas - or even cooler: percentage based with colored areas (would require to do calculations on ALL damage instances though).

(Pending) Consider: when deleting rows, red highlight-fadeout effect before they are deleted

Allow multi-instance battle timeline -> Track boss HP - when dead, automatically proceed to next boss in the list.

TODO Prioritering

Høj prioritet (nu)

- Type safety (Snapshot, actions)
- Material UI migration for tables og dropdowns
- Splitting af useRotationEditor.ts hook
- Implementering af buffs/debuffs og negative status tracking

Medium (fremtid):

- Virtualized rows
- Drag & drop kolonner
- Color pickers / date pickers

Lav (fremtid):

- Analytics page
- Settings page
- Pie charts visualisering

---

---

---

---

---

## MODIFIERS

---

---

---

---

The modifier system is now implemented with the following flow:

1.  Resolver 0 (buildStepContext):
    Handles swap-based expiration if a character swap occurred
    Updates swapsLeft counter and removes expired modifiers
2.  Resolver 2 (resolveDamageModifiers):
    Collects all modifier blueprints from character/action/negative statuses
    Activates new limited modifiers → creates ModifierInAction
    Handles stacking (adds stacks, resets timers if configured)
    Filters applicable modifiers (target strategy + permanent vs active)
    Applies stack multipliers and aggregates stats
3.  Resolver 5 (resolveModifierState):
    Updates time-based modifiers (decrements timeLeft)
    Removes stacks/expires modifiers when duration runs out
    Key Design Decisions:
    Permanent modifiers: Don't create ModifierInAction, applied directly each step
    Limited modifiers: Create ModifierInAction to track stacks/time/swaps
    Stacking: Handled in activateModifiers (adds to existing or creates new)
    Target strategies: Filtered in filterApplicableModifiers
    Stack multiplier: Applied before aggregating stats
    TODO - Future improvements:
    Normalize damage source interface (action, negative status, coordinated attack, etc.)
    Allow modifiers from triggers (e.g., "on basic attack, gain buff for 5s")
    Consider buff/debuff display columns in table

---

---

---

---

---

---

## ALGORITHMS

---

---

---

---

// Best opening:
// Skill 1
// Air 1-2
// Plunge (swap cancel)
// Skill 1
// Air 1-2
// Plunge (swap cancel)
// Skill 1 (cancel with liberation) (IF POSSIBLE)
// Liberation
// Skill 3 (swap cancel instantly)

// 5.04 seconds = 80 concerto
// 5.21 seconds = 100 concerto + swap + 20 extra concerto
// All other rotations now only need to generate 80 concerto now (40 if counting liberation + skill 3 quickswap ending)

---

// Other rotations:
// Gain 120 windstring as fast as possible - you'll probably have enough concerto no matter what

---

// NOTE: Can you transform to Fleurdelys to activate mandate, then go back in cartethyia form and make use of the Aero Erosion DMG buff on 3 swords plunge (once or twice)? (even if it works, need time to use liberation)

---

// Try this TEAM OPENING:
// Cartethyia - Skill (swap cancel) (echo)
// Ciaconna - Skill (swap cancel) (echo if sword one)
// Rover - Skill 1 (echo)
// Rover - Air 1-2
// Rover - Plunge (swap cancel)
// Ciaconna - Plunge + BA4 (swap cancel)
// Rover - Skill 1
// Rover - Air 1-2
// Rover - Plunge (swap cancel)
// Ciaconna - Plunge + BA4 (swap cancel) (echo if weird one)
// Rover - Skill 1 (cancel with liberation)
// Rover - Liberation
// Rover - Skill 3 (swap cancel instantly)
// Ciaconna - Intro
// Ciaconna - Forte
// Ciaconna - (Skill if needed)
// Ciaconna - Liberation
// Cartethyia - Intro
// Cartethyia - BA2-4
// Cartethyia - Plunge (3 swords) (worth swapping to rover here for plunge + skill 1 swap cancel?)
// Cartethyia - BA1-4 (or skip second round?)
// Cartethyia - Heavy
// Cartethyia - Skill
// Cartethyia - Plunge (3 swords)
// Cartethyia - Transform
// Cartethyia - Some cool Cartethyia/Rover quickswap shit
