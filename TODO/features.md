## Features

# General
Right now action names and other things may not be unique. Make sure they are so we can reference each other, or find a different approach

# Damage Calculators
- Make it possible to chose a damageCalculationStrategy, i.e. like default, negativeStatus scaling or others (see what aero erosion explosion does since it should follow the same pattern)

# Data Overlay
- All Sections: could have a small button in the right corner for explanations

# Timeline
- Add a settings/configuration button. Each existing potential character, global event, buff, debuff, coodinated attack etc should have a toggle where you can choose whether to display it or not in the timeline.

- Timeline should not display permanently but be something you open and generate based on snapshots + damage events
HIDE IT for now - then we will simplify it once we start working on it again

- Linepath Graph : Implement a linepath for the graphs (dps & total dmg)

- Hover Handlers : for interactive data points or other parts or info

- Split snapshot into X points : Timeline could get individual damage points within a snapshot (for example split damage into X intervals each time or static intervals of X units).

- More graphics : Timeline graphs should have lines, points, squares to show when different things occured in what intervals or times

- Bug: Vertical lines in timeline seem to pop up in the beginning of actions, instead of when the damage procs (which by default right now is at the very end of the snapshot interval) (negative statuse aside). However, negative statuses have a different issue: it seems to always create a vertical line at 0.00s regardless of what happens or doesnt happen (although it is first created when the first negative status of that type is created/gets its first stack).

- Bug: vertical lines in GLOBAL (negative stasus is the only thing that inhabit this linepath atm) have their vertical lines inserted in the linepath underneath where they are supposed to - perhaps the calculation determining where to add them accidently adds +1 too many, or it might be caused by some other reason.

- MIN/MAX/AVEARAGE graphs in the same plot (and/or toggle). Since we calculate average damage, it could be cool to have MIN and MAX in a graph with colored areas - or even cooler: percentage based with colored areas (would require to do calculations on ALL damage instances though).

- Area with percentages - chance to deal different kinds of damages (can use estimate if precise numbers are too hard/branches into too many calculations)

- Toggle Hide Certain contributions: There should be a button to hide: 'permanent' damageModifiers with condition 'always' in the timeline and in the dataoverlay
