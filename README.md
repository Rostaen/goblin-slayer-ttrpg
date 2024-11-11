# Goblin Slayer TTRPG

This is the (unofficial) Goblin Slayer game system for FoundryVTT. A passion project putting a moderate amount of FoundryVTT skills together to test out developing game systems as a first run.

## Current State v0.11.0 (2024-09-12)

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
  - All skills roll to chat window
  - Misc. modifier pop-up window for all player rolls
  - Attrition & Fatigue
    - Attrition tracking works properly for both under half and over half health, triggering fatigue as required
    - Fatigue tracking adds modifiers to character sheets
    - Hover over fatigue numbers to see how they affect the character
    - Attrition & Fatigue healing buttons have been added to recover each item from resting/potions/spells
  - Resting
    - Short Rest button (fork & knife) heals 3 attrition
    - Long Rest button (person in bed) on 3+ hours heals a small amount of attrition and fatigue, 6+ hours heals 10 attrition, all spell uses (if any), half life force in woulds (rounded up), and 2d3+1 fatigue
  - Effects page has been updated with checkboxes, an icon, and name of effect. Automation has not been implemented yet until a full understanding of how each effect interacts with the character/monster
- Full compendium added from core book

### TODO:

- [x] Melee/Thrown/Projectile
- [x] PC Stealth
- [x] Combat Tracking
- [x] Movement Updates
- [x] Move Race skills from Race to Item level
- [x] Add in a Parry check
- [x] Context menu for Race skills
- [x] Prompt for Roll modifiers
- [x] Add skill bonuses where needed
- [x] Allow attrition to update fatigue
- [x] Allow fatigue to modify character sheet
- [x] Create CompediumFolders for all monsters & items
- [x] Better sheet styling
- [x] Add mouse hover context for game related information
  - [x] Monster sheet '!' information hovers
- [ ] Block skills from having a higher value when levels and rank are in conflict
- [ ] Supplement book items added to game
  - [x] Necromancy Spells
  - [x] High End Spells
  - [x] New weapons, items, armor, gear, etc.
  - [x] Races: Dark Elf, Padfoot x4
  - [x] Mount actor sheet
  - [ ] Martial Techniques
    - [x] (Basic & Master) Item sheet
    - [x] Location in Actor sheet
    - [ ] Automate in game(?)
  - [x] Monsters
  - [ ] Conditions
    - [x] Update conditions tab with checkboxes
    - [ ] Implement automation
    - [ ] Add hover info pages
  - [ ] Diseases(?)
  - [x] Mounts Actor
  - [ ] Skills
    - [ ] Adventurer
      - [x] Calculations added
      - [ ] Automated
    - [x] General
    - [ ] Padfoot Only
      - [x] Calculations added
      - [ ] Automated
- [x] Resting: Short Rest & Lost Rest
- [ ] Add equip checkbox to gear and update code accordingly
- [ ] Regulate items with an "equipped" button to determine misc. modifiers
- [x] Create new actor for Fate Points usage and table
- [x] Fix health bars so they show up on character tokens
- [ ] Combat Updates
  - [x] Rework code to streamline checks
  - [x] Checks range of weapon and tokens before attacking
  - [ ] Have ranged attacks check for +ammo before rolling to Hit
  - [x] Add damage button to "to hit" rolls
  - [x] Add effectiness score bonus damage to player rolls
  - [x] Add button to apply damage to target
  - [x] Learn how to show info to GM only
    - [x] Show static defense value of minions
    - [x] Show armor roll button for boss
- [x] Set weapons and armor to macro toolbar for ease of player use
- [ ] Set General skills to macro toolbar for ease of player use
- [ ] Add cover condition -2, -4, -6 to hit checks

### Skill Implementation Tracking

#### Adventerer Skills

- [x] Alert
- [x] Anticipate
- [x] Armor: XX
- [ ] Binding Attack (Future update to affect targets and add conditions)
- [x] Bonus Spells: XX
- [x] Burst of Strength
- [x] Curved Shot (Requires cover reduction for rank 5 when cover implemented)
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
- [x] Rapid Fire (Automated but requires special care to ensure attacks are made to reset attack tracking)
- [x] Shields
- [x] Sixth Sense
- [x] Slice Attack
- [x] Slip Behind
- [x] Snipe
- [x] Spell Expertise: XX (Partial setup, spell maintenance button required to finish)
- [x] Spell Resistance
- [x] Stealth
- [x] Strengthened Immunity
- [x] Strong Blow: Bludgeon
- [x] Strong Blow: Slash
- [x] Tactical Movement
- [x] Weapons: XX
- [x] Gorilla Tactics
- [ ] Biological Knowledge
- [ ] Dungeon Knowledge
- [ ] Moving Chant
- [ ] Multiple Chants
- [ ] Penetrating Spells
- [ ] Poisoner
- [x] Shieldsman
- [ ] Spell Ritual
- [ ] Pass Through
- [ ] Cartography
- [ ] Herbalist
- [x] Magical Perception
- [ ] Miner
- [ ] Taming
- [ ] Nurse
- [ ] Sacrament of Forgiveness
- [ ] Veil of Darkness
- [ ] Torture

#### General Skills

Completed! Cool and Collected may need additional support in the future for the 2nd portion of the skill.

# How to use the Game System

## Player Character (PC) Sheets

### Top & Left Sidebar

The top and left sidebar are static to the PC sheet. These will alway be in view no matter which tab you shift too for information about your character. The left sidebar being the more imporant section showing short and long rest buttons, wounds, health, spell resistance, xp, and favorite rolls. The top bar simply contains the PC name and current rank.

### Stats Tab

Players will be able to roll for checks the GM gives them by clicking on the labels for each calculated ability score or used the Check buttons at the bottom of the Stats tab. Any Check button that is used often, click the checkbox to add it to the special rolls sidebar area for ease of use. The PC can also track their adventures as well as battle attrition, fatigue, and class levels on this page. The heart button will help you quickly recover these sections when resting, healing, or using potions/spells to heal.

### Items & Gear

All items are drag 'n drop ready and will show up in their respective tabs when dropped from a compendium. When a player needs to roll a "To Hit" check or roll "Power" for damage, they can click the 'target' or 'explosion' icon to the left of the weapon. To roll a dodge check, click on the person icon to the left of the armor. Finally, block checks, click on the shield icon to the left of the shield equipped. Right-click on any item to get a context menu to view or delete the given item. _*Please note*_ that there is currently no code to stop a person from adding more armor or shields to their character sheet. For the time being, only drag and drop what your character has equipped and write down any extra gear/loot into the loot section of the character sheet (a future update will fix this).

### Player Attacks (NEW INFO)

Players can roll a hit check from their weapon in the item sheet tab. Othewise, Player weapons can be dragged and droped into the hot/macro bar at the bottom of the screen. Clicking on the target button or from the hot/macro bar will roll a Hit Check for the player's equipped weapon. This attack triggers a new chat window that shows all information regarding the attack including the target of the attack.

- Setting up a hit check macro: https://youtu.be/63JiSeC6z2s
- Setting up a dodge check macro (do the same for a block check with the shield): https://youtu.be/suS3J8hcaFg

The buttons in the attack winow are dodge and block for the monster, and a damage/power attack if the attack succeeds to hit. When the damage is rolled, a new window shows up with how much damage and any modifiers that are being applied. The player or GM can then add any modifiers to the damage/power and apply the damage to the target. Applied damage will update the target of the attack.

### Skills

#### Adventurer

These are (mostly) automatically implemented into the game. Please see the details above about specific adventurer skills and their status. These skills are added into either attacks, dodges, shields, spell uses, or other checks to have their effects added in.

Approximately 77% of adventurer skills have been fully automated and work directly from the character sheet and will be added to the chat box for confirmation. Ability scores, class levels, skills, modifiers, successes, and crits are highlighted in the chat window for ease of reference. If you notice any errors/bugs, please submit them to the issues tab of the GitHub page: https://github.com/Rostaen/goblin-slayer-ttrpg/issues.

##### Skill: XX

When updating a skill that has ": XX" in the name. Right-click on the skill and 'view' it. Copy one of the names exactly as you see in the description for the skill you intend to use this with and update the paste it in the name slot. This will help skill automation work correctly. Ex: Armor: XX being used for "Armor: Heavy." Automation is currently case sensetive and will not work with these examples "armor: heavy", "Armor: heavy", "armor: Heavy", "Armor:Heavy", "ARMOR: HEAVY", etc.

#### General

To use these skills, hover your mouse over the skill block. The image will change from it's current image, into a d20 to indicate you can roll this general skill. When you move off of the skill, the image will return to it's original value. When clicking on a general skill, you will be prompted with a special window or redirected to a different window (for skills such as Long-Distance Movement). The special window has three areas that need to be entered. 1st is the Primary ability score, 2nd is the secondary ability score (giving by the GM), 3rd is an optional misc. modifier for random effects such as terrain, line of sight, and so forth. When you're ready, click the "Rolling" button to see the results of the skill check.

### Spells

Spells have a wand button next to the image to roll spell effectiveness checks. The resulting information in the chat window will determine if the spell was successful or not against the given DC value with an Effectiveness value. Right-click on a spell to get a context menu to see the spell's information and effectiness score results or to delete the spell. There is currently no way to roll damage from the effectiveness chart, this will come in a future update. Until then, please roll spell damage from the chat window.

### Maps/Scenarios

If you're using a battle map, when moving characters around in the game, the grid is set to 1 meter (or 1m). PCs (player characters) are at close range to another monster at 5m and should be aware of this at all times. So all PCs are within melee range at 5m or less and do not need to be adjacent to their target in order to attack. This gives characters a little bit of room to move without penalties and also block movement checks and so forth.

More How Tos to come...

## Fate

The fate actor is setup so that all players may interact with the same sheet and use Fate Points accordingly. The GM is the only one who can correct misused/misclicked fate points and rest Fate Points before or after the adventure. The GM should use this actor to set the initial Fate value for each adventure so players get an idea of how difficult it will be.

## Mounts

The mount actor looks similar to the Non-Prayer Character sheet with some minor differences. Use this sheet whenever a (Non-)Prayer Character is using a mount in the game and/or combat.

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
