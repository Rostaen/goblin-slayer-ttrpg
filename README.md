# Goblin Slayer TTRPG

This is the (unofficial) Goblin Slayer game system for FoundryVTT. A passion project putting a moderate amount of FoundryVTT skills together to test out developing game systems as a first run.

## Current State v0

- Item sheets setup for: armor, shields, weapons, items, spells, skills, races
- Monster sheets setup
  - Adjustable attacks set from 1 - 4
  - Spell Resistance, To Hit, Power, Dodge, & Block checks are rollable
  - Split minion and boss info to respective fields
- PC sheets setup
  - Rank changed to drop down menu
  - Tabs for specific pages
  - PC stats rollable
  - Initiative roller setup with skill bonus
  - Calculated Rolling to chat bar
    - Stats roll to chat bar for checks
    - Melee/Power/Dodge/Block checks rolling to chat bar
    - Rolls broken down into 'Dice + Stat + Class + Item Mod'
    - Spell DC casting check
  - Stealth rolls to chat bar with class level and item modifiers
- Full compendium added from core book

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
    - [x] Monster
    - [ ] Skill Modifiers
  - [ ] Block Checks
    - [x] Fighter
    - [x] Scout
    - [x] Monster
    - [ ] Skill Modifiers
  - [ ] Check non class related items for reduced modifiers eg: Priest attacking with sword, etc.
- [ ] PC Stealth
  - [x] Stealth button rolling
  - [x] Armor/shield modifiers added in
  - [x] Classes that stealth added in
  - [ ] Skill Modifiers
  - [ ] Update chat window for crit success/fail
- [ ] Combat Tracking
  - [ ] Add initiative rolls to combat tracker
  - [ ] Update tracker to reroll initiative at start of next round
- [ ] Movement Updates
  - [x] Change movement field for PC creation to maximum
  - [x] Create disabled field for modified movement from armor/skills
  - [x] Armor Modifiers added
  - [ ] Skill Modifiers
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
- [x] Create CompediumFolders for all monsters & items
- [x] Better sheet styling
- [ ] Add mouse hover context for game related information
  - [x] Monster sheet '!' information hovers
- [ ] Block skills from having a higher value when levels and rank are in conflict
- [ ] Supplement book items added to game

# How to use the Game System

At this point in v0.6.0 (2024/5/15):

All items are drag 'n drop ready and will show up in their respective tabs. Players will be able to roll for checks you give them by clicking on the labels for each calculated stat. When a player needs to roll a "To Hit" check, they can click on the number for the weapon they're attacking with. As of v0.6.0, there is no skill modifiers added yet to anything, _verbally add these into the final score for now_. To roll an attack, click on the weapons power and verbally add in any modifiers from skills, for now. To block/dodge an attack, click on the armor or shield dodge/block modifier and verbally add in any skill modifiers, for now.

When moving characters around in the game, the grid is set to 1 meter (or 1m). PCs (player characters) are at close range to another monster at 5m and should be aware of this at all times. So all PCs are within melee range at 5m or less and do not need to be adjacent to their target in order to attack. This gives characters a little bit of room to move without penalties and also block movement checks and so forth.

More How Tos to come...

# Installation

To install and use the Goblin Slayer system for Foundry VTT, please (visit my Ko-Fi page)[https://ko-fi.com/dndcrexposed] to support my efforts and to get a link for Foundry system installation and auto updates.

Otherwise, you may manually install the system. To do so, you must clone or extract this repository into the `Data/systems/gs` folder. You may do this by cloning the repository or downloading a zip archive from the `<> Code` button above.

## Contributors

- Andrew F. (zerrian\_ on Discord): full-stack developer
- HerrDoctor: token artwork
