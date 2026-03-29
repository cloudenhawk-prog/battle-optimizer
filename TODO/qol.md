### Quality of Life

# Overall
The table is a lighter shade than the character State Tracker windows. Let's change the table to fit them more.

# Modifiers
- Certain modifiers only gives stats when conditions are met. They may not show up in the stats profile overlay, even though it could be an obvious almost 100 % uptime stat.
  Each stat should, for example at the bottom, show Conditional multipliers currently present
    > Example: Mornye S2 Crit Dmg Boost (false: belongs to Interfered Marker which is simply an always() buff)
    > Example: Mornye Weapon Crit Dmg Boost (false: will become an always() buff triggered by heals)

# Verify Data
- Verify data should also look for assets in the project that is not used anywhere (if possible and not too complicated)

# Table
- Some columns, once you hide them, cant be returned to the table
- Need a way to determine which buffs/debuffs to show
- Dupe Row Button - casts the same action again if possible
- Dete Rows should be made possible with logging
- When modifiers have maxStack: 1, they should display ACTIVE or nothing, rather than the stacks: 1
- When a new row is added - play an animation similarly to the light that moves through the sections in data overlay - instead of using a green color?

# Selectors
- When an aciton have a required follow up action, it should automatically cast it afterwards
- When action/character is not selectable, hovering should display a tooltip telling why. Sometimes multiple conditions may make it unselectable, just showcase the first encountered. Therefore conditions should be checked in order of importance. If it's easy, could show a list of failed conditions (if it's not too much work)
- Implement toggler to active/deactive the Selector Check on character/actions

# Character Tracker
- The gear Window should show stats, which parts contribute what, possibly if there are any buffs that are currently in effect on the character outside of specific actions etc

# Sidebar
- Currently selected character should show up in the sidebar where phrolova is
- Might need to define custom coodinate/size helpers, or crop images specifically

# Displays
- Go over name vs displayName everywhere and decide:
    - What is shown where
    - Names should act as IDs if they're unique, otherwise need a different way for uniqueness

# Import/Export
- Timelines (a series of actions)
- gear (a character setup)
- Enemies

# Enemy
- Allow multi-instance battle timeline -> Track boss HP - when dead, automatically proceed to next boss in the list.
- Allow picking enemies if no actions have been chosen, or alternatively allow picks always (make a visual showcase of when which enemy was present)

# Background
- Make the background move slower as to not stress a new user