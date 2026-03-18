### DQN requirements

# Actions

<!-- Comment Overwite means 'might have been implemented but uncertain if it works or if every part of it is implemented>

<!-- - Add an action "Wait Until Next Cooldown" (current character's closest cooldown, if any) -->

<!-- - When an action require a certain action to be cast after it, all other choices should be locked (or alternatively, automatically call the next action, but how to resolve cooldown; it might not be ready to cast atm, but it would be after the first part)
  Possible clean solution:
  To be able to select a combo-like action that forces the next cast, the following condition must be met: It must be off cooldown by the time the first action finishes. Additionally, after the cast, in the next action Select, ALL other characters and actions must be locked (forcing you to choose this action).
  Alternativelly, it might even automatically select it afterwards since there's no reason to waste choice and time when you're forced to do it anyway. -->

<!-- - Certain skills can only be cast within a certain time limit of a different action (think Fleurdlys skill 1 + skill 2). Sometimes might trigger the second one to go on cooldown on Swap (i.e. a skill combo system) -->

- Possibility to lower cooldowns (example: Cartethyia Skill 1 when consuming forte swords)

- does Action type's property 'requiredForms' OR Form type's property 'availableActions' determine a character's actions? It seems silly to having to write both. From the user's perspective it would be the simplest to define it inside each action since you wouldnt need to rely on the actions being exported correctly to each form. But it's important that the implementation is also simple and elegant.
  Note: Actions unatached to a form shouldnt just be greyed out (unselectable in ActionSelect); instead they shouldnt appear at all as they are fully irrelevant for the form
