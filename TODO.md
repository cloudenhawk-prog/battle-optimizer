
TODO (22 tasks):

Task:    Implement buffs and other timed things
Context: Right now negative statuses are handled with an "inAction" variable. Consider how to handle buffs, debuffs, corrdinated attacks and other timed things

Task:    Implement rows on-click overlay data breakdown
Context: Right now damageEvents are passed to the component RotationEditor.tsx These can be passed to the RotationTable if it needs them for future features

Task:    Damage Events should have type -> action, action-side-effect, negative-status such that we can put them together 
Context: Right now damage events only includes events from actions. We do not want a seperate event list for every type of damage event. Sorted by ID, these can be used by rows on-click overlay

Task:    Implement tests for all reasonably-testable functions
Context: Right now we aren't performing any tests other than an outdated DamageCalculator.test.ts. It would be best if all functions in hooks and utils are tested

Task:    Implement toggler to active/deactive the Selector Check on skill cost requrements (no need to update resolver, it's useful to see if energy becomes negative)
Context: Right now energy stops characters from using actions if the requirement is not met. It would be nice with a toggle option that let's you bypass this

Task:    Implement more icon/button logic, split it into multiple css classes for different kinds
Context: Right now you can hide/unhide columns with button presses. Make certain icons non-clickable/no animation like Character/Action. Make group headers hide all columns under the group at once

Task:    Implement coordinated attacks
Context: Coordinated attacks could work similar to negative statuses but have its own section (perhaps actually called DoT)

Task:    Implement source tracking on missing things
Context: Right now we can apply negative statuses (and buffs/Debuffs/coordinated attacks). We need to make sure that we can track the source - who applied them? Since they may count towards tracking the damage contribution of each character

Task:    Implement a step in the useCharacterActions hook that creates references to all different effects before the first resolver
Context: Right now the resolvers are doing A LOT of work with context but run-time isn't an issue. Later it might be useful to only have to iterate the context/snapshots once and directly collect and distribute all the effects and modifiers needed in future resolvers

Task:    Implement custom/dynamic outro trigger conditions
Context: Right now the outro-intro flow is hardcoded using 100 Concerto energy. It might be useful to make this function more dynamically by letting each character define a custom outro-intro trigger condition

Task:    Implement dispatchable effects so damages and other things don't always proc at 'toTime'
Context: Right now everything is summed up at the 'toTime' milestone. For a more detailed timeline in the future, and so that all damage is not necessarily triggered at once, it might be useful to create a queue that you can dispatch events to. The queue might be able to resolve/progress events, sorts the events at the time it happened, and more detailed create a timeline of action/effect starts, damage-procs, occurences, and event endings. This could be especially useful for outro skills, swap-cancelling, and delayed effects and damage procs. It might even automatically let us create Coordinated Attacks and alike really easily.

Task:    Implement custom Selectors for our table
Context: Right now our Selectors are just default JSX element which doesn't let us style a whole lot. Custom ones would allow for free styling

Task:    Implement Graphs that show current performance in real time (under table)
Context: Right now we collect (or will soon collect) damage related events. Would be nice to have a live-updating state-based graph view with pie-charts and alike

Task:    Implement logic for deleting rows - both rows, logs and saved events should be updated as a result
Context: Right now we have minimal delete logic. Consider if we can automatically recompute all the old rows underneath (use red highlight for problematic rows) or when it should break off entirely

Task:    Implement multi-instance boss battle timeline
Context: Right now we fight one predetermined boss. It would be useful to be able to queue bosses and automatically swap between them when one dies - even reset debuffs and negative statuses on them

Task:    Implement the new 3.0 Break mechanisms 
Context: Right now we have no idea how these work - collect info and implement them when the time is right, preferably when I have a character that I can use for testing

Task:    Implement global states
Context: Right now states are passed between components, but certain states might be useful to live globally. Consider using Zustand, React Context or other libaries

Task:    Make use of useMemo and other React utlities
Context: Right now we haven't really considered if using useMemo or other utilities could make some of our implementations more elegant or light-weight. Examples such as: tableConfig via useMemo or lazy load certain things

Task:    Consider ways to develop components better
Context: For example, Storybook to component development (tables, droipdowns, lightbox), Vitest to unit tests, better Husky + Lint flow, Zod to runetime validation of snapshots or actions

Task:    Implement Drag & Drop for columns icons to rearrange the table
Context: Right now the table order is hardcoded. We could use a state or something else to track the order and allow for rearrangement with MUI

Task:    Implement Settings for Theme Selection, Table Behaviour, Graph & Analytics Behaviour, etc.
Context: Right now all of this is hardcoded with no ability to choose preferences or avoid annoying conventions like energy cost requirements

Task:    Implement Analytics Page
Context: This could be implemented as its own page (by saving and importing rotations) or directly be routed from rotationEditor with necessary information
