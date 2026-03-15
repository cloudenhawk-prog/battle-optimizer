### Data

# Characters
- Test and fix the 3 characters' actions (persistance time, cast time, etc)

- Ideally we want ALL actions variants for ALLcharacters (BA1, BA1_swap, BA1-2, ...)

# Helpers
- Make helpers to define energies/wait actions so we don't need to hardcode it for every character (for energy in energies ...)

# Cartethyia
- Add Actions:
- Transform: To Fleurdelys Form -> Triggers Mandate : energy cost and high cooldown
- Cartethyia To Fleurdelys (during Mandate) : free and low cooldown
  - Create cartethyia_transform_during_mandate
- Fleurdelys To Cartethyia : free and low cooldown (if Mandate doesn't exist you can't swap back to Fleurdelys after though) (Can't cast if Conviction is full === 120)
  - Create fleurdelys_transform
- TLDR: Essentially Fleurdelys Form revolves around Mandate: when the buff is gone, anything that forces a Fleurdelys->Cartethyia transform will make you unable to swap back until the base Transform skill is off cooldown
- Fleurdelys Intro (no outro?)
- Split Forte into 3 different sword bars (how do we do this with forte being mandatory?)
