# Goblin Slayer TTRPG Change Log

## Recent updates

### 2024-09-05

- Slip Behind skill partially implemented with skill use prompt and hit check addition.
- Curved Shot skill 90% implemented, just needs cover reduction for rank 5 when this condition has been implemented.

### 2024-09-04

- Finished checking and testing the Rapid Fire skill and works properly at rank 5.

### 2024-09-03

- Dual Wielding skill updated to new code and automated. Uses a prompt to choose between one or two targets. This attack must be made twice for both weapon attacks.
- Skill notifications in the chat window that effect hit check and effectiveness scores have been modified in color to show their difference. Bright green effects hit, dark gree effects effectiveness scores.
- Corrected Weapon: XX skill internals with Weapon: Staves to Weapon: Staff so the skill triggers correctly with Staff type weapons.
- Mow Down skill updated to new code and automated.
- Confirmed multiple hit check skills working in tandum and correctly applying to dice.
- Rapid Fire skill working up until 3 attacks at skill 5. Further testing needed.

### 2024-09-02

- Fixed Magical Talent skill bug.
- Player weapon hit check hotbar support working.
- Weapons: XX adding to new hit check.
- Snipe adding to hit check, working on monster dodge/def.
- Fixed draggables so any item from any character sheet can be dragged to a hotbar (eg GM dragging player attack to their bar).
- Some monster compendium updates for prototype tokens
  - Giant Rats
  - All Skeletons

### 2024-08-30

- Added dodge/block buttons for bosses and minions.
- Restyled chat windows button area for target.
- Added damage suffered window to show total damage to target (if any).
- Weapon Macro Drag & Drop showing in hotbar proper.
- Working on triggering attack roll properly.

### 2024-08-29

- Fixed HP bar bug for players and monsters. All tokens now fall to 0 HP when defeated rather than reverting to max.
- Damage window applying damage to target.
- Added Effectiveness Score Skill modifiers for Piercing & SB: B/S skills.

### 2024-08-28

- Damage roll button working in chat window.
- Styled windows to be more appealing.

### 2024-08-27

- Revamping code to streamline how they attack, roll damage, and other checks.
- Added more information to chat window for player attacks.
- Targeting a monster now shows up in the chat window with the token name and token image.
- Physical attack effectiveness score now shows bonus damage depending on how deftly the character attacks
- CSS reworking on chat window output for player attacks.

## v0.10.2 Released 2024-08-26

### v0.10.2

- Fixed copy/replace bug in Dragon Priest spell casting.
- Fixed similar bugs for Shaman spellcasting with/without Beloved skill or a shaman bag.

### v0.10.1

- Emergency patch for player sheets and dice rolls not going through.
- Updated items to have a default 0 for movement modification penalties if none are present.
- Added Necromancer class to rolls as appropriate.

### 2024-08-23

- Finished reworking Draconic Heritage and updating it with Armor: XX skill. Uses less code and has an easier implementation.
- Magical Perception (S) added to automation.
- Reviewing Magical Talent skill. Needs better implementation and flags in case someone needs to remove a skillup.

### 2024-08-22

- Added Skills Values to data level for ease of reference.
- Bonus Spell: XX tested and updated to include necromancy. This skill is one of few that isn't pushed to the skills values tracker.
- Darkvision has been updated and now only applies changes when the skill has been updated. This also corrected a long standing bug from the first implementation.
- Updated Perseverance skill, tested, and working properly.
- Reworking Draconic Heritage skill.

### 2024-08-21

- Updated how Armor: XX works using the calculated skill if the skill is present.
- Updated instructions to the readme about using 'Skill: XX' skills.

### 2024-08-20

- Added all skills (adventurer, general, padfoot) to the GSActor.mjs sheet for calculations. This will only populate skills that the character actively has. Testing required to ensure all skills are calculating properly.

## v0.10.0 Released 2024-08-16

### 2024-08-16

- Added Necromancer class into character sheet.
- Updated character sheet to take into account item movement pentalties.
- Added quantity field to items (specifically for movePen items).
- Updated items quantity field with new quantity JSON object, removed custom code for updating "floating" quantity variable.

### 2024-08-15

- Removed boss monster block/armor score(type) as they're repeated for both minion and boss monsters.
- Finished adding new monsters from supplemental book.
- Updated new actor dropdown to "Prayer Characters" and "Non-Prayer Characters" to reflect the books intent.
- Mount actor sheet added.
- Mount armor items added.

### 2024-08-14

- Updated support effects from an editor field to input values for ease of automation and future changes.
- Added all new magic from supplemental book.
- Added some new monsters from supplemental book.

### 2024-08-13

- Added basic/master martial techniques from supplemental book.

### 2024-08-12

- Updated display names for Actor and Item sheets.
- Updated new actor/item drop down menu with better styling and readability.
- Added new items/weapons/gear from supplemental book.

### 2024-08-09

- Added movement penalties field to items sheet so movement may be adjusted for prayer-charater sheets.

### 2024-08-08

- Added new Restrait feature to weapon sheet.

## Prior Changes

- See undetailed changes at GitHub Commits page (https://github.com/Rostaen/goblin-slayer-ttrpg/commits/main/).
