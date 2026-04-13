Right now it's impossible to check all combinations of action. But let's create a tool to help. What we want is a rotation you can test. It defines a set number of steps (character, actions). The point is that we should allow blocks where we "try all combinations in a limited timespan". For example:

*use some Mornye actions*
*swap to Hiyuki*
*use some Hiyuki actions*

Here we might want to use a tool to optimize hiyuki's sequence inside this rotation. Perhaps even with some constrints:
- You must use at least 3 x Iai
- You must cast Liberation as the last action
- The sequence must last between 12 and 17 seconds
- Certain actions are banned (or only certain actions are allowed)
(for obvious reasons all actions that have requiresSwapOut must not be true)

After this tool, the rotation might continue:

*Some other character uses some actions*

At the end we have analytics tools to calculate team performance so you can see how well this sequence goes into to overall team.
The end goal is that we can check this for each of the rotations that derive from different Hiyuki sequences that our tool permutated.



Note:
We already have a way export/import rotation (button under table). We already have ways to recompute the entire timeline (for example after deleting a row).
It should be easy to reuse some of these things. What we really need is some logic that combines actions under certain conditions. Realistically this would be 10-20 actions to fill ~15 seconds and usually less than 10 choices per step. So the most sensible approach would be something like: the tool only computes the possible legal combinations.
So: try legal combiniations, if time or other conditions are broken, immediately throw away that sequence.
Sometimes the team overall rotation may break based on the sequence we're testing. That's completely fine. These are hard to catch pre-combination creation. We just throw them away when we encounter those special cases.