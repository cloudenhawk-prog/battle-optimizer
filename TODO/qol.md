### Quality of Life

# Overall
The table is a lighter shade than the character State Tracker windows. Let's change the table to fit them more.

# Actions
Some actions should not allow you to swap out after cast (i.e. the next selection, by locking all other character choices)

# Verify Data
- Verify data should also look for assets in the project that is not used anywhere (if possible and not too complicated)

# Table
- Some columns, once you hide them, cant be returned to the table
- Dupe Row Button - casts the same action again if possible
- Delete Rows should be made possible with logging
- When a new row is added - play an animation similarly to the light that moves through the sections in data overlay - instead of using a green color?

# Selectors
- When action/character is not selectable, hovering should display a tooltip telling why. Sometimes multiple conditions may make it unselectable, just showcase the first encountered. Therefore conditions should be checked in order of importance. If it's easy, could show a list of failed conditions (if it's not too much work)
- Implement toggler to active/deactive the Selector Check on character/actions

# Sidebar
- Currently selected character should show up in the sidebar where phrolova is
- Might need to define custom coodinate/size helpers, or crop images specifically

# Displays

- Go over name vs displayName everywhere and decide:
  - What is shown where
  - Names should act as IDs if they're unique, otherwise need a different way for uniqueness

# Import/Export
- gear (a character setup)
- Enemies

# Enemy
- Allow multi-instance battle timeline -> Track boss HP - when dead, automatically proceed to next boss in the list.
- Allow picking enemies if no actions have been chosen, or alternatively allow picks always (make a visual showcase of when which enemy was present)

# Background
- Make the background move slower as to not stress a new user
