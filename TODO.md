### TODO:
- Clean/fix data and data type files
- nightmareKelpieOutroTrigger: you should be able to choose a damageCalculationStrategy: it could function like a stats scaling like character Action or a Negative Status damage calculation. Might need to define certain properties like an Action or negative status damage event (see what Aero Erosion Explosion does)


- - Form System (WIP)
- Character has a state tracking Form
- Character Window Shows form
- Actions are locked behind Forms or Universal
- Form can be changed through actions when conditions are met, or denied when conditions are not met (Cartethyia can swap freely during Mandate, but otherwise needs Energy and has cooldown)
  - We could solve this by having special Swap Actions only available when, for example, a specific buff is active (Mandate for Cartethyia)
- Each form should be able to define their own intro/outro skills OR use default ones (typically they only have custom intro skills)

- - - Cartethyia Specific Form Implementations:
- Add 2 forms to Cartethyia Character Data
- Add Actions:
- Transform: To Fleurdelys Form -> Triggers Mandate : energy cost and high cooldown
- Cartethyia To Fleurdelys (during Mandate) : free and low cooldown
  - Create cartethyia_transform_during_mandate
- Fleurdelys To Cartethyia : free and low cooldown (if Mandate doesn't exist you can't swap back to Fleurdelys after though) (Can't cast if Conviction is full === 120)
  - Create fleurdelys_transform
- TLDR: Essentially Fleurdelys Form revolves around Mandate: when the buff is gone, anything that forces a Fleurdelys->Cartethyia transform will make you unable to swap back until the base Transform skill is off cooldown
  
- - - Cartethyia Data:
- Add Sequence 1-3
- Update stats
- Fleurdelys Intro (no outro?)
- Split Forte into 3 different sword bars (how do we do this with forte being mandatory?)

- - - Action Logic:
- Handle future casts: When an action requires a skill to be cast after it, all other characters/actions should be LOCKED
- Need a way to only allow certain skills to be cast within a certain time limit of a different action - and whether that makes it go on cooldown or not (Fleurdelys Skill 2)
  - Should also force it to be cast after Skill 1 (during the window)
  - Should also decide whether it persists through swaps or not
  - TLDR: Basically a skill combo system: Skill 1 -> Skill 2 (example: Fleurdelys)

- - - User Test:
- Ciaconna outro: Static Mist Outro buff, Aero Erosion amp outro buff, Nightmare Kelpio DMG trigger

- - - Wishes:
- Gear/Echo system
  - Allows us to compute stats more safely
  - Allows us to define modifiers that dynamically are added to characters
    - How do we handle this if a modifier is connected to an action? For example Static Mist Outro Buff (dynamically inject into data? Or some resolver logic?)

Need a way to determine which buffs/debuffs to show

> All limited buffs
> But what about: permanent modifiers that only affect certain characters at certain times
>
> > Show if relevant in current snapshot?
> > Show these in the character window instead?

> The data verification script should also generate a file that states: which images do we expect in different places and which ones do we actually have in assets already vs missing.

> Inspect character: stats (base and current) (later: weapon, echoes, sequence lvl etc)

> Selected character should show up in sidebar like Phrolova - might need to define custom coordinate/size helpers if there isn't an easy fit-it-all solution

> Possibility to lower cooldowns (example: Cartethyia when consuming swords)

# Fairly Important:

Modifiers (buffs) can affect how actions behave, like Mandate. Need an easy way to handle this. For example:
Side Effects behaviour can depend on a modifier (active, inactive, stacks etc)
StatusModification can depend on modifier (for example the number of stacks the action apply, can be negative, zero, positive)
Damage etc of an action could scale differently based on modifiers.
Essentially modifiers (buffs/debuffs) can do other things than strictly buff changes based on how a specific character may interact with it
Concrete needs for Cartethyia:Mandate buff also does: Basic 5 Fleurdelys, Mid-air 2, Enhanced Heavy, Resonance 2 apply 99 stacks of aero erosion during this time
Mandate buff also does: Lowers dmg intervals between Aero Erosion by 50 % (TODO : Test if it works when you swap away from her)
Mandate buff: Does it work or not when swapped away?
This might affect how we want to show Mandate in timeline

# Timeline:

Timeline should not display permanently but be something you open and generate based on snapshots + damage events
HIDE IT for now - then we will simplify it once we start working on it again

Linepath Graph : Implement a linepath for the graphs (dps & total dmg)

Hover Handlers : for interactive data points or other parts or info

Split snapshot into X points : Timeline could get individual damage points within a snapshot (for example split damage into X intervals each time or static intervals of X units).

More graphics : Timeline graphs should have lines, points, squares to show when different things occured in what intervals or times

Bug: Vertical lines in timeline seem to pop up in the beginning of actions, instead of when the damage procs (which by default right now is at the very end of the snapshot interval) (negative statuse aside). However, negative statuses have a different issue: it seems to always create a vertical line at 0.00s regardless of what happens or doesnt happen (although it is first created when the first negative status of that type is created/gets its first stack).

Bug: vertical lines in GLOBAL (negative stasus is the only thing that inhabit this linepath atm) have their vertical lines inserted in the linepath underneath where they are supposed to - perhaps the calculation determining where to add them accidently adds +1 too many, or it might be caused by some other reason.

MIN/MAX/AVEARAGE graphs in the same plot (and/or toggle). Since we calculate average damage, it could be cool to have MIN and MAX in a graph with colored areas - or even cooler: percentage based with colored areas (would require to do calculations on ALL damage instances though).

Area with percentages - chance to deal different kinds of damages (can use estimate if precise numbers are too hard/branches into too many calculations)

Toggle Hide Certain contributions: There should be a button to hide: 'permanent' damageModifiers with condition 'always' in the timeline and in the dataoverlay

# Data Overlay:

Toggle Hide Certain contributions: There should be a button to hide: 'permanent' damageModifiers with condition 'always' in the timeline and in the dataoverlay

Dynamic width for contributions : Data Overlay contributions sections should grow wider as more are added with a minimum width and a maximum width (at which point it becomes scrollable)

Top Left Corner: The 3 buttons should have a title or helpful label -> we are swapping between scenarios like; too long but theoretically 'see scenario where everything crits'

Contributions: could also have hover - 'show more details'

All Sections: could have a small button in the right corner for explanations

Tether labels: Swap the bottom two labels: TETHER//V3.2.17 and LINK: ESTABLISHED PHASE DRIFT: 0.02' so tether is the in the left bottom corner

General: Arrows up/down to swap between data overlays quickly. Also if you click outside the data overlay it should close

MODIFIER CONTRIBUTIONS: Remove empty shell for the pillars - It makes it seem like the biggest pillar is some sort of "max possible value" which is not the case: it's just used for scaling heights so it looks good.

# Actions:

# Negative Statuses:

# Data:

Implement Data Checker that checks if everything is respected on app-start or when rendering rotationEditorPage for the first time (things that must be unique are unique etc). characters, actions, stats, modifiers, etc (includes: Normalize keywords: source, name, displayName. When is what used? What is unique?)

Cartethyia BA3-5 action - tooltip: can be used when swapped in without intro
Cartethyia's conviction generation is uncertain - need more testing
Could technically add action: cartehyia_avatar & fleurdelys_avatar (can only be cast during mandate, has a cast time, might affect mandate related buffs)
Need fleurdelys intro/outro - and logic in resolver to automatically determine which to use

CharacterData: define data that later can be combined into a character object (resolve gear, echoes etc into stats, actions, modifiers). Makes stats mistakes less prone. Might give us an overview of what contributes with what stats
Would be nice if it understood partial stats to simplify the data and make it less prone to mistakes

# Types:

Clean up types - determine where which types should live!

Damage Modifiers: Do we need a type for buffs that also or do not affect negative statuses? What do we do right now?

In StatusModification type under sideEffects.ts, is 'buff/Debuff' ever used? Can side effect actually even trigger buffs? Would they need to use Damage Modifiers (since these represet buffs/debuffs)

# Table/Snapshot/Resolvers:

Dupe row button -> if you wish to cast the same action again

Check Resolver flow - overall do they have correct numbering? Do they split responsible up nicelly? Where do different things happen?

CastConditions + offtune need logic in resolvers (defined in actions)

Make it possible to delete rows (should character/action become locked when I row is created, or should reselection automatically delete the row(s) and create the new one?)

Modifiers that only have 1 maxStack, the currentState row should display "ACTIVE" versus "INACTIVE" (with green vs red color text?). Modifiers with more than 1 maxStack should do like now, displaying "currentStacks/maxStacks"

Bug: Modifiers with type 'self' also affect side effects and negative statuses (like Mandate). There is no real logic to determine which other things aside from the main action which should be affected by a modifier. Right now it assumes that if the filter resolves to true, it affects everything in this snapshot.
Possible solutions:
Add a scope to target strategyS? action, actionSideEffects, otherSideEffects (coordinated attacks etc?), negative statuses?
Any other ideas?

Need a way to remove buffs - like FLeurdelys Mandate and sword buffs (they are timed but also disappear when she used liberation - i.e. swaps back)

TASK: When a new row is added - play an animation similarly to the light that moves through the sections in data overlay - instead of using a green color?

Task: Implement toggler to active/deactive the Selector Check on skill cost requrements (no need to update resolver, it's useful to see if energy becomes negative)

# Tests:

Update tests - simple, guaranteed correct. There is a chance we sometimes test wrong things or assume wrong logic (many tests area auto generated) (to help with this, make a lot of good helper mock methods)

# Other:

Implement logic: if displayName exists use it in certain places like: selectors, timeline - not in places with lots of space and details - otherwise use name
Use custom component for the 2 table Selectors - that way we can style them EXACTLY like we want, for example making them transparent

Echoes + Weapons

TASK: Allow to click on groups to restore all icons instead of one at a time

TASK: Turn phrolova into a see-through gif with AI? Or make the background move with some "animations"?

Implement custom importable/exportable combos

The topbar layout changes every time an icon/column becomes hidden (I think this i still relevant)

Allow multi-instance battle timeline -> Track boss HP - when dead, automatically proceed to next boss in the list.

---

---

---

The modifier system is now implemented with the following flow:
Update tests if this hasnt already been taken into account:

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

## ALGORITHMS

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
