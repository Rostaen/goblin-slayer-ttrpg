# Goblin Slayer TTRPG Change Log

## Recent updates

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
