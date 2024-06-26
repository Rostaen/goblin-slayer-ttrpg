# Goblin Slayer TTRPG

This is the (unofficial) Goblin Slayer game system for FoundryVTT. A passion project putting a moderate amount of FoundryVTT skills together to test out developing game systems as a first run.

## Current State v0.8.0

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
  - Attrition & Fatigue
    - Attrition tracking works properly for both under half and over half health, triggering fatigue as required
    - Fatigue tracking adds modifiers to character sheets
    - Hover over fatigue numbers to see how they affect the character
    - Attrition & Fatigue healing buttons have been added to recover each item from resting/potions/spells
- Full compendium added from core book

### TODO:

- [x] Melee/Thrown/Projectile
  - [x] To Hit checks
  - [x] Power rolls
  - [x] Dodge Checks
  - [x] Block Checks
  - [x] Check non class related items for reduced modifiers eg: Priest attacking with sword, etc.
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
- [x] Add in a Parry check
- [ ] Context menu for Race skills
- [x] Prompt for Roll modifiers
- [ ] Add conditions and effects to PC effects tab
- [ ] Add skill bonuses where needed
- [x] Allow attrition to update fatigue
- [x] Allow fatigue to modify character sheet
- [x] Create CompediumFolders for all monsters & items
- [x] Better sheet styling
- [ ] Add mouse hover context for game related information
  - [x] Monster sheet '!' information hovers
- [ ] Block skills from having a higher value when levels and rank are in conflict
- [ ] Supplement book items added to game
- [ ] Add button for resting and apply properl healing to all areas
- [ ] Regulate items with an "equipped" button to determine misc. modifiers
- [ ] Create new actor for Fate Points usage and table

### Skill Implementation Tracking

#### Adventerer Skills

- [x] Alert
- [x] Anticipate
- [x] Armor: XX
- [ ] Binding Attack (Future update to affect targets and add conditions)
- [x] Bonus Spells: XX
- [x] Burst of Strength
- [ ] Curved Shot (Future update to affect targets dodge/block checks)
- [ ] Defensive (May not need auto intergration for this skill)
- [x] Dual Wielding (Use misc modifiers for this skill)
- [x] Encumbered Action
- [ ] Enhance Spells: Power (Future update spell damage rolls)
- [x] First Aid (Future update for allies healing target)
- [ ] Guard (May not need auto intergration for this skill)
- [x] Handiwork
- [x] Hardiness
- [x] Healing Affinity
- [x] Iron Fist
- [x] Lucky
- [x] Magical Talent
- [x] Martial Arts
- [x] Master of XX (Requires advanced features not yet implemented to finish)
- [x] Monster Knowledge
- [x] Mow Down
- [x] Observe
- [x] Parry
- [x] Perseverance
- [x] Piercing Attack
- [x] Provoke
- [x] Rampart
- [ ] Rapid Fire (May not need auto integration and use Misc. Modifier prompt instead)
- [x] Shields
- [x] Sixth Sense
- [x] Slice Attack
- [ ] Slip Behind (Requires advanced features not yet implemented)
- [ ] Snipe (Requires advanced features not yet implemented)
- [x] Spell Expertise: XX (Partial setup, spell maintenance button required to finish)
- [x] Spell Resistance
- [x] Stealth
- [x] Strengthened Immunity
- [x] Strong Blow: Bludgeon
- [x] Strong Blow: Slash
- [x] Tactical Movement
- [x] Weapons: XX

#### General Skills

- [ ] Appraisal
- [ ] Artisan: XX
- [ ] Beloved of the Fae
- [ ] Cooking
- [x] Cool and Collected (Will require 2nd bonus to be added manually for now)
- [ ] Craftsmanship
- [ ] Criminal Knowledge
- [ ] Darkvision
- [ ] Draconic Heritage
- [ ] Etiquette
- [ ] Faith: XX
- [x] General Knowledge
- [ ] Labor
- [ ] Leadership
- [x] Long-Distance Movement
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

## v0.7.0 (2024/06/04)

Players will be able to roll for checks the GM gives them by clicking on the labels for each calculated ability score or used the Check buttons at the bottom of the Stats tab. Any Check button that is used often, click the checkbox to add it to the special rolls sidebar are for ease of use.

Approximately 77% of adventurer skills have been fully automated and work directly from the character sheet and will be added to the chat box for confirmation. Ability scores, class levels, skills, modifiers, successes, and crits are highlighted in the chat window for ease of reference. If you notice any errors/bugs, please submit them to the (issues tab of the GitHub page)[https://github.com/Rostaen/goblin-slayer-ttrpg/issues].

All items are drag 'n drop ready and will show up in their respective tabs when dropped from a compendium. When a player needs to roll a "To Hit" check or roll "Power" for damage, they can click the 'target' or 'explosion' icon to the left of the weapon. To roll a dodge check, click on the person icon to the left of the armor. Finally, block checks, click on the shield icon to the left of the shield equipped. Right-click on any item to get a context menu to view or delete the given item. _*Please note*_ that there is currently no code to stop a person from adding more armor or shields to their character sheet. For the time being, only drag and drop what your character has equipped and write down any extra gear/loot into the loot section of the character sheet (a future update will fix this).

Spells have a wand button next to the image to roll spell effectiveness checks. The resulting information in the chat window will determine if the spell was successful or not against the given DC value with an Effectiveness value. Right-click on a spell to get a context menu to see the spell's information and effectiness score results or to delete the spell. There is currently no way to roll damage from the effectiveness chart, this will come in a future update. Until then, please roll spell damage from the chat window.

Each time a player clicks a button to roll, a prompt window will be presented to the player. Enter in any skill/misc. modifiers here to be added to the roll. There is currently no way to bypass the modifier window. Pressing enter with a blank field or the Cancel button will evauluate the dice roll without a modifier (bypassing to come in a future update)

When moving characters around in the game, the grid is set to 1 meter (or 1m). PCs (player characters) are at close range to another monster at 5m and should be aware of this at all times. So all PCs are within melee range at 5m or less and do not need to be adjacent to their target in order to attack. This gives characters a little bit of room to move without penalties and also block movement checks and so forth.

More How Tos to come...

# Recommended Modules

- Dice So Nice!: Allows 3D dice to roll on the VTT.
- Dice Tray: Adds a small widget below the chat box to add custom dice rolls

# Installation

To install and use the Goblin Slayer system for Foundry VTT, please (visit my Ko-Fi page)[https://ko-fi.com/dndcrexposed] to support my efforts and to get a link for Foundry system installation and auto updates.

Otherwise, you may manually install the system. To do so, you must clone or extract this repository into the `Data/systems/gs` folder. You may do this by cloning the repository or downloading a zip archive from the `<> Code` button above.

## Contributors

- Andrew F. (zerrian\_ on Discord): full-stack developer & game system creator
- HerrDoctor: token artwork
- Elán from Elánowe Tabletopy: Polish translations
