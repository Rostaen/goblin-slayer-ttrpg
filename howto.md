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
