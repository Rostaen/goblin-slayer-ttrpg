# Goblin Slayer TTRPG Change Log

## Recent updates

### 2025-4-9

- Finished Non-Prayer Character casting to include non-damaging spells.
- Corrected Prayer Character non-damaging spells.

### 2025-4-8

- Updated all monsters to ensure HP shows on tokens, names show on hover for all, HP bars show on hover for GM, multiple monsters drawn out to game board use adjectives rather than numbers.
- Updated ReadMe.md file.
- Created new HowTo.md file and moved how to use the game system files from readme to howto.
- Monsters now cast magic from their character sheet. The remaining actions are taken in the chat window.
- Updated Polish localization file.
- Created Spanish, German, French, and Japanese localization using ChatGPT o3-mini-high.

### 2025-1-14

- Spell Power attack button showing if monster spell cast attack is effective.
- Spell power rolls are active and targeting is working for monster casting.

### 2025-1-13

- Updated monster spells to check for effectiveness results.

### 2025-1-9

- Enricher updated to include spell casting use check roll.
- Casting enricher rolls monster spell use to chat window.

### 2025-1-8

- Working through getting spell details and creating chat window message.

### 2025-1-7

- Modifications to get the text editor enricher to begin casting spells.

### 2025-1-6

- Further updates to enricher code.
- Updating spell configuration with name field to allow enricher to work correctly.
- Modified CSS for spell casting enricher.
- Confirmed uuid spell conpendium links working correctly.

### 2024-12-23

- Starting to add enrichers to allow monsters spell casting.

### 2024-12-6

- Updated most shield filter calls to search for equipped shield rather than top most shield.

### 2024-12-3

- Updated most armor filter calls to search for equipped armor rather than top most armor.

### 2024-11-27

- Added equip option to item headers.
- Added checkbox to weapons, armor, shields to represent equipped status.
- Armor movement penalty check updated to look for equipped armor and only apply that value.

### 2024-11-11

- Fixed missing section to get monster dodge rolls working correctly.
- Monster damage roll setup to check for targets first and warns if no target.
- Minon attacks working as well.
- Monster damage window now displays player armor score with shield if present. Players with shields usually are built to use a shield over dodging.
- Boss attacks and player dodge/block checks working from chat window.

### 2024-11-8

- Working on Monster damage roll.
- Made some various changes to monster sheets.
- Added player ability scores and level where appropriate.
- Updated monster sheet with hidden power/damage value for ease of rolling damage.
- Player block check rolls, checks for Shields & Shieldsman skill, applies as required.
- Player dodge roll now checks for Parry and Alert, applies as required.
- Added crit check for Boss monster defense rolls.

### 2024-11-7

- Reworked code a bit in gs.mjs.
- Added more code to Parry check and also reviewing output for errors.

### 2024-11-5

- Working on Dodge check for players. Working through grabbing Parry skill information to add to the roll.

### 2024-10-14

- Added attack checks for minions/bosses to the chat window.
- Player target showing in same attack check window.
- Starting player dodge check rolls.

### 2024-10-11

- Finished updating resist pass/fail check and spell damage updates accordingly.
- Tokens now update HP from player attacks and spells properly.
- Updated token code to apply the large dead condition icon and remove all other statuses when a character has been defeated.
- Token's dead condition removed if HP was incorrectly applied and character should still be alive after reapplying corrected HP.

### 2024-10-10

- Added spell resistance check for monsters.
- Configured resistance check to apply damage to monster.
- Adding resist pass/fail message to window.

### 2024-10-08

- Updating spell casting monster resistance rolls.

### 2024-09-26

- Successfully updated code for GM view only in chat window for attacks (and other needs).
- Setting up Monster spell resistance roll and results.

### 2024-09-25

- Updated player spell attacks to transfer target numbers.
- Attempting to modify view so only GM sees certain pieces of chat window information.

### 2024-09-24

- Added power/recovery dice rolls to chat window.
- Updated localization references to class names for ease of use and coding.

### 2024-09-23

- Adding attack/recover dice to chat window to roll on successful use check.

### 2024-09-20

- Spells are draggable and usable from the macro bar.
- Finished new Faith: XX check and modifiers.
- Finished Multiple Chants skill.
- Updated Macro bar drops so hover name is clearer.
- Spell effectiveness bonus showing to chat window.

### 2024-09-19

- Finishing Spell Use check to chat window.
- Updating elements for cleaner look.
- Working on Faith: XX check if multiple spell classes and skills conflict.

### 2024-09-18

- Setup of Moving Chants and Faith: XX Use checks.

### 2024-09-17

- Finished adding spell Effectivenss Score JSON objects into the game.
- Began updating spell attacks to include effectiveness bonuses from Config file.

### 2024-09-16

- Adding more spell Effectiveness Score JSON objects.

### 2024-09-13

- Implementing new spell Effectiveness Score JSON objects to allow for ease of automated rolls and other combat related needs.

### 2024-09-12

- Added: Sacrament of Forgiveness, Taming, Torture.
- Veil of Darkness partial setup, added to Spell Resistance.
- Updating weapons/armor/shields (WAS) and spells to no longer use buttons on leftside.
- WAS CSS updated to adjust for extra spacing.
- Added new Stealth effect field to armor for Ranger dodge/stealth checks.

### 2024-09-11

- Added: Herbalist, Miner, Nurse general skill implementation.
- Updating special rolls form the main character sheet to be in line with new look.
- Added warning to players not targeting monsters before rolling an attack.

### 2024-09-10

- Finished updating new Player Shield Block code.
- Shields and Shieldsman skills automated into new Player Shield Block code.
- Updated general skill rolls to use new output format. Further updates may be needed to streamline the code more.
- Minor README changes.

### 2024-09-09

- Fixed Wounds calculations bug for player tokens.
- Added new player dodge and block rolls to item tab armor click.
- Added hot bar support for armor and shield drops and usage.
- Updated CSS styling on certain boxes that had no radius border.

### 2024-09-08

- Fixed old Critical Check bug.

### 2024-09-06

- Gorilla Tactics updated and working with weapon hit mod and effectiveness score modifiers.
- Adding Supplemental general skills to automation. Reworking code is required here.

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
