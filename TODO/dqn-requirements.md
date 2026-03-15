### DQN requirements

# Actions
- Swap-out action should not be selectable if you're in a scenario where the two other charaters' SWAP CD would be >0 after the cast (i.e. having no one to swap to)

- Add an action "Wait Until Next Cooldown" (current character's closest cooldown, if any)

- When an action variation require a certain action to be cast after it, all other choices should be locked (or alternatively, automatically call the next action - in fact might be smarter to just turn the whole thing into 1 action, but how to resolve cooldown; it might not be ready to cast atm, but it would be after the first part)

- Certain skills can only be cast within a certain time limit of a different action (think Fleurdlys skill 1 + skill 2). Sometimes might trigger the second one to go on cooldown on Swap (i.e. a skill combo system)

- Possibility to lower cooldowns (example: Cartethyia Skill 1 when consuming forte swords)


