Example:

Base: 100
Bonus dmg % (inclusive 100% base): 300%
Amp dmg % (inclusive 100 % base): 200%

Total Damage: 100 * 3 * 2 = 600

Ally B:
50 % bonus
60 % amp

Ally C:
40 % Amp

Character A who performed the action (without ally buffs):
Damage: 100 * 2.50 * 1.00 = 250
Own share is 250/600 = 0.416666667% = 41.67 dmg

Ally share:
0.58333333% = 58.33 dmg

Now we just need to figure out each share!


How to implement? Something like:
For each action:
 - Remove all modifiers
 - Apply only the own character's own modifiers
Now you have the damage contribution of Character A
What remains: Find the contrubtion of each of the 2 other character of the remaining amount




