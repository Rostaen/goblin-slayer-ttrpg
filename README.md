# Goblin Slayer TTRPG

This is the (unofficial) Goblin Slayer game system for FoundryVTT. A passion project putting a moderate amount of FoundryVTT skills together to test out developing game systems as a first run.

## Current State v0.6.1

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
  - Misc. modifier pop-up window for all player rolls
- Full compendium added from core book

### TODO:

- [ ] Melee/Thrown/Projectile
  - [x] To Hit checks
    - [x] Fighter checks
    - [x] Monk checks
    - [x] Scout checks
    - [x] Ranger checks
    - [x] Monster
  - [x] Power rolls
    - [x] Fighter
    - [x] Monk
    - [x] Scout
    - [x] Ranger
    - [x] Monster
  - [x] Dodge Checks
    - [x] Fighter
    - [x] Monk
    - [x] Scout
    - [x] Monster
  - [x] Block Checks
    - [x] Fighter
    - [x] Scout
    - [x] Monster
  - [ ] Check non class related items for reduced modifiers eg: Priest attacking with sword, etc.
- [x] PC Stealth
  - [x] Stealth button rolling
  - [x] Armor/shield modifiers added in
  - [x] Classes that stealth added in
  - [x] Skill Modifiers
  - [x] Update chat window for crit success/fail
- [ ] Combat Tracking
  - [ ] Add initiative rolls to combat tracker
  - [ ] Update tracker to reroll initiative at start of next round
- [x] Movement Updates
  - [x] Change movement field for PC creation to maximum
  - [x] Create disabled field for modified movement from armor/skills
  - [x] Armor Modifiers added
- [x] Move Race skills from Race to Item level
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

### Skill Implementation Tracking

#### Adventerer Skills

- [ ] Alert
- [x] Anticipate
- [ ] Armor: XX
- [ ] Binding Attack
- [ ] Bonus Spells: XX
- [ ] Burst of Strength
- [ ] Curved Shot
- [ ] Defensive
- [ ] Dual Wielding
- [ ] Encumbered Action
- [ ] Enhance Spells: Power
- [ ] First Aid
- [ ] Guard
- [ ] Handiwork
- [x] Hardiness
- [ ] Healing Affinity
- [ ] Iron Fist
- [ ] Lucky
- [ ] Magical Talent
- [ ] Martial Arts
- [ ] Master of XX
- [ ] Monster Knowledge
- [ ] Mow Down
- [ ] Observe
- [ ] Parry
- [x] Perseverance
- [ ] Piercing Attack
- [ ] Provoke
- [ ] Rampart
- [ ] Rapid Fire
- [ ] Shields
- [ ] Sixth Sense
- [ ] Slice Attack
- [ ] Slip Behind
- [ ] Snipe
- [ ] Spell Expertise: XX
- [x] Spell Resistance
- [ ] Stealth
- [ ] Strengthened Immunity
- [ ] Strong Blow: Bludgeon
- [ ] Strong Blow: Slash
- [ ] Tactical Movement
- [ ] Weapons: XX

#### General Skills

- [ ] Appraisal
- [ ] Artisan: XX
- [ ] Beloved of the Fae
- [ ] Cooking
- [ ] Cool and Collected
- [ ] Craftsmanship
- [ ] Criminal Knowledge
- [ ] Darkvision
- [ ] Draconic Heritage
- [ ] Etiquette
- [ ] Faith: XX
- [ ] General Knowledge
- [ ] Labor
- [ ] Leadership
- [ ] Long-Distance Movement
- [ ] Meditate
- [ ] Negotiate: XX
- [ ] No Preconceptions
- [ ] Perform: XX
- [ ] Production: XX
- [ ] Research
- [ ] Riding
- [ ] Survivalism
- [ ] Theology
- [ ] Worship

# How to use the Game System

At this point in v0.6.0 (2024/5/15):

All items are drag 'n drop ready and will show up in their respective tabs. Players will be able to roll for checks you give them by clicking on the labels for each calculated stat. When a player needs to roll a "To Hit" check or roll "Power" for damage, they can click the 'target' or 'explosion' icon to the left of the weapon. To roll a dodge check, click on the person icon to the left of the armor. Finally, block checks, click on the shield icon to the left of the shield equipped. Initiative, stealth, sixth sense, and luck rolls can be found in the left sidebar of the player sheet. Each time a player clicks a roll, a prompt window will be presented to the player. Enter in and skill/misc. modifiers here to be added to the roll.

When moving characters around in the game, the grid is set to 1 meter (or 1m). PCs (player characters) are at close range to another monster at 5m and should be aware of this at all times. So all PCs are within melee range at 5m or less and do not need to be adjacent to their target in order to attack. This gives characters a little bit of room to move without penalties and also block movement checks and so forth.

More How Tos to come...

# Installation

To install and use the Goblin Slayer system for Foundry VTT, please (visit my Ko-Fi page)[https://ko-fi.com/dndcrexposed] to support my efforts and to get a link for Foundry system installation and auto updates.

Otherwise, you may manually install the system. To do so, you must clone or extract this repository into the `Data/systems/gs` folder. You may do this by cloning the repository or downloading a zip archive from the `<> Code` button above.

## Contributors

- Andrew F. (zerrian\_ on Discord): full-stack developer
- HerrDoctor: token artwork
