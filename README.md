# Goblin Slayer TTRPG

This is the (unofficial) Goblin Slayer game system for FoundryVTT. A passion project putting a moderate amount of FoundryVTT skills together to test out developing game systems as a first run.

## Current State v0

- Item sheets setup for: armor, shields, weapons, items, spells, skills, races
- Monster sheets setup
  - Adjustable attacks set from 1 - 4
- PC sheets setup
  - Tabs for specific pages
  - PC stats rollable
  - Calculated Rolling to chat bar
    - Stats roll to chat bar for checks
    - Melee/Power/Dodge/Block checks rolling to chat bar
    - Rolls broken down into 'Dice + Stat + Class + Item Mod'

### TODO:

- [ ] Melee/Thrown/Projectile
  - [ ] To Hit checks
    - [x] Fighter checks
    - [x] Monk checks
    - [x] Scout checks
    - [x] Ranger checks
    - [x] Monster
    - [ ] Skill modifiers
  - [ ] Power rolls
    - [x] Fighter
    - [x] Monk
    - [x] Scout
    - [x] Ranger
    - [x] Monster
    - [ ] Skill Modifiers
  - [ ] Dodge Checks
    - [x] Fighter
    - [x] Monk
    - [x] Scout
    - [ ] Monster
    - [ ] Skill Modifiers
  - [ ] Block Checks
    - [x] Fighter
    - [x] Scout
    - [ ] Monster
    - [ ] Skill Modifiers
  - [ ] Check non class related items for reduced modifiers eg: Priest attacking with sword, etc.
- [ ] Movement Updates
  - [ ] Change movement field for PC creation to maximum
  - [ ] Create disabled field for modified movement from armor/skills
- [ ] Move Race skills from Race to Item level
- [ ] Add in a Parry check
- [ ] Context menu for Race skills
- [ ] Prompt for Roll modifiers
- [ ] Add conditions and effects to PC effects tab
- [ ] Add skill bonuses where needed
- [ ] Allow attrition to update fatigue
- [ ] Allow fatigue to modify character sheet
- [ ] Setup effects page in character sheet for status effects (if needed)
- [ ] Adding "click to roll" dice when rolls made to chat bar
- [ ] Create CompediumFolders for all monsters & items
- [ ] Better sheet styling
- [ ] Add mouse hover context for game related information

## How to use the Game System

At this point in v0 (2024/4/26) you will need to create each monster/item/skills/races/spells that you'll be using for the first game before hand (future updates will add compediums to save you time). Setup skills before creating Races as you can drag 'n drop skills into character sheets. If you drop the wrong skill into a Race, you'll need to make a new one since there is no current way to delete them (future update).

Once all of these items are ready, invite your players in to start creating characters. All items are drag 'n drop ready and will show up in their respective tabs. Players will be able to roll for checks you give them by clicking on the labels for each calculated stat. When a player needs to roll a "To Hit" check, they can click on the number for the weapon they're attacking with. As of v0, there is no skill modifiers added yet to anything, _verbally add these into the final score for now_. To roll an attack, click on the weapons power and verbally add in any modifiers from skills, for now. To block an attack, click on the armor or shields block modifier and verbally add in any skill modifiers, for now.

When moving characters around in the game, the grid is set to 1 meter (or 1m). PCs (player characters) are at close range to another monster at 5m and should be aware of this at all times. So all PCs are within melee range at 5m or less and do not need to be adjacent to their target in order to attack. This gives characters a little bit of room to move without penalties and also block movement checks and so forth.

More How Tos to come...

## Contributors

- Andrew F. (zerrian\_ on Discord): full-stack developer
- HerrDoctor: token artwork
