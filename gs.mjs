import { gs } from "./module/config.mjs";
import GSItemSheet from "./module/sheets/GSItemSheet.mjs";
import GSActorSheet from "./module/sheets/GSActorSheet.mjs";
import { GSActor } from "./module/documents/GSActor.mjs";
import { preloadHandlebarsTemplates } from "./module/helpers/templates.mjs";
import { GSItem } from "./module/documents/GSItem.mjs";

Hooks.once("init", () => {
	game.gs = { GSActor }

	console.log("GS | Initializing Gobline Slayer TTRPG");

	CONFIG.gs = gs;
	CONFIG.Item.entityClass = GSItem;
	CONFIG.Combat.initiative = {
		formula: "@init",
		decimals: 2
	};

	CONFIG.Actor.documentClass = GSActor;

	Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("gs", GSActorSheet, {
		makeDefault: true,
		label: game.i18n.localize('gs.sheets.actor')
	});

	Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("gs", GSItemSheet, {
		makeDefault: true,
		label: game.i18n.localize('gs.sheets.item')
	});

	// Preload Handlebars templates
	return preloadHandlebarsTemplates();
});

Hooks.on('renderChatMessage', (app, html, data) => {
	html.find(".actorDamageRoll").click( async event => {
		event.preventDefault();
		const button = event.currentTarget;
		const weaponId = button.dataset.id;
		const playerId = button.dataset.playerid;
		const extraDamage = button.dataset.extradmg;
		const player = game.actors.get(playerId);
		const weapon = player.items.find(i => i._id === weaponId);
		const targets = Array.from(game.user.targets);
		const activeTarget = targets[0].document.actor.getActiveTokens()[0];
		const armorScore = targets[0].document.actor.system.defenses.minion.armor;
		const curvedShotFlag = player.getFlag('gs', 'Curved Shot');

		let chatMessage = `<div class="chat messageHeader grid grid-7col">
			<img src='${player.prototypeToken.texture.src}'><h2 class="actorName grid-span-6">${weapon.name}: ${game.i18n.localize('gs.actor.character.damage')}</h2>
		</div>`;

		// Setting up roll with weapon damage
		let damageString = weapon.system.power;
		if(extraDamage !== "0"){
			damageString += `+ ${extraDamage}`;
			chatMessage += `<div class="diceInfo specialRollChatMessage">${game.i18n.localize('gs.dialog.bonusDmg')}: ${extraDamage}</div>`;
		}

		// Adding reduce dmg from Curved Shot if available
		if(curvedShotFlag){
			damageString += `- ${curvedShotFlag.reducedPower}`;
			chatMessage += `<div class="skillScore specialRollChatMessage">${game.i18n.localize('gs.dialog.curvedShotLabel')}: -${curvedShotFlag.reducedPower}</div>`;
			player.unsetFlag('gs', 'Curved Shot');
		}

		const roll = new Roll(damageString);
		await roll.evaluate();

		// Setting up chat window details
		chatMessage += `<h2 class="chat targetsLabel">${game.i18n.localize('gs.dialog.mowDown.targets')}</h2>
		<div class="chat target grid grid-8col">
			<img class="targetImg" src="${activeTarget.document.texture.src}">
			<h3 class="targetName grid-span-4">${activeTarget.document.name}</h3>
			<div class="diceInfo specialRollChatMessage grid-span-3">${game.i18n.localize('gs.gear.armor.sco')}: ${armorScore}</div>
		</div>
		<div class="chat gmDmgButtons grid grid-4col">
			<div class="fs10">${game.i18n.localize('gs.dialog.dmgMod')}</div><input class="dmgModInput type="text">
			<div class="fs10">${game.i18n.localize('gs.dialog.applyDmg')}</div><button class="applyDmgButton" data-armor="${armorScore}" data-target="${activeTarget.document.actor._id}" data-dmg="${roll._total}" type="button"><i class="fa-solid fa-arrows-to-circle"></i></button>
		</div>`;

		roll.toMessage({
			speaker: { actor: player },
			flavor: chatMessage,
		});
	});

	// This will check between the dodge or block buttons, minion or boss, and send or roll to chat appropriately
	html.find(".monsterDefRoll").click( async event => {
		event.preventDefault();
		const monster = game.actors.get(event.currentTarget.dataset.monsterid);
		const defType = event.currentTarget.dataset.type;
		const activeToken = monster.getActiveTokens()[0];
		const playerId = event.currentTarget.dataset.playerid;
		const player = game.actors.get(playerId);
		const curvedShotFlag = player.getFlag('gs', 'Curved Shot');
		let valueName = game.i18n.localize(`gs.dialog.${defType}.value`),
			rollLabel = game.i18n.localize(`gs.dialog.${defType}.roll`),
			rollResult = game.i18n.localize(`gs.dialog.${defType}.total`);

		// The monster's dodge or block
		let value = event.currentTarget.dataset.value;
		let chatMessage = `<div class="chat messageHeader grid grid-7col">
				<img src='${activeToken.document.texture.src}'><h2 class="actorName grid-span-6">${activeToken.document.name}: ${rollLabel}</h2>
			</div>
			<div class="armorDodgeScore specialRollChatMessage">${valueName}: ${value}</div>`;
		if(value.includes('d')){
			if(curvedShotFlag) value += ` - ${curvedShotFlag.targetReduction}`;
			const roll = new Roll(value);
			await roll.evaluate();
			if(curvedShotFlag){
				chatMessage += `<div class="skillScore specialRollChatMessage">Curved Shot: -${curvedShotFlag.targetReduction}</div>`;
				chatMessage += `<div class="armorDodgeScore specialRollChatMessage">${rollResult}: ${roll._total}</div>`;
			}
			roll.toMessage({
				speaker: { actor: monster },
				flavor: chatMessage
			});
		}else{
			if(curvedShotFlag){
				chatMessage += `<div class="skillScore specialRollChatMessage">Curved Shot: -${curvedShotFlag.targetReduction}</div>`;
				chatMessage += `<div class="armorDodgeScore specialRollChatMessage">${rollResult}: ${parseInt(value, 10) - curvedShotFlag.targetReduction}</div>`;
			}
			ChatMessage.create({
				speaker: { actor: monster },
				flavor: chatMessage
			});
		}
	});

	// Applies damage to the target and sends message to chat window
	html.find(".applyDmgButton").click( async event => {
		event.preventDefault();
		const container = event.currentTarget.closest('.gmDmgButtons');
		const modifier = parseInt(container.querySelector('.dmgModInput').value, 10) || 0;
		const target = game.actors.get(event.currentTarget.dataset.target);
		const token = target.getActiveTokens()[0];
		const armorScore = parseInt(event.currentTarget.dataset.armor, 10);
		let dmg = parseInt(event.currentTarget.dataset.dmg, 10);
		dmg += modifier;
		let currentHP = token.document.actor.system.lifeForce.value;
		const totalDmg = Math.max(currentHP - (dmg - armorScore), 0);

		if(target.type === 'character')
			await target.update({
				'system.lifeForce.value': totalDmg
			});
		else if(target.type === 'monster'){
			const token = target.getActiveTokens()[0];
			await token.document.actor.update({
				'system.lifeForce.value': totalDmg
			});
		}

		ChatMessage.create({
			speaker: ChatMessage.getSpeaker({ actor: target }),
			flavor: `<div class="chat messageHeader grid grid-7col">
				<img src='${token.document.texture.src}'><h2 class="actorName grid-span-6">${token.document.name}</h2>
			</div>
			<div class="levelScore specialRollChatMessage">${game.i18n.localize('gs.dialog.suffered')}: ${Math.max(dmg - armorScore, 0)}</div>`
		});
	});

	// Rolls Spell Power/Recovery Dice
	html.find(".actorSpellDmg").click( async event => {
		event.preventDefault();
		const targets = Array.from(game.user.targets);

		// Check if targets selected, else return early.
		if(targets.length === 0){
			ui.notifications.warn("No targets selected; select targets and roll damage again.");
			return;
		}

		console.log('... checking user', game.user.isGM);

		const button = event.currentTarget;
		const playerId = button.dataset.playerid;
		const player = game.actors.get(playerId);
		const spellId = button.dataset.spell;
		const spellKey = button.dataset.keytype;
		const spellUsed = player.items.find(i => i._id === spellId);
		const spellSchool = spellUsed.system.schoolChoice;
		const playerClassLvls = player.system.levels.classes;
		const diceToRoll = button.dataset.rolldice;
		const numTargets = button.dataset.targets;
		let levelBonus = 0, classNameFlag = '';

		// Setting spellKey localization
		let dmgRecoverLocalization = game.i18n.localize(`gs.dialog.spells.${spellKey === 'recovery' ? 'recoveryAmt' : 'spellDmg'}`);

		const addChatFlavor = (css, h1, h2) => {
			return `<div class="${css} specialRollChatMessage">${h1}: ${h2}</div>`;
		};

		// Setting chat header
		let chatMessage = `<div class="chat messageHeader grid grid-7col">
			<img src='${player.prototypeToken.texture.src}'><h2 class="actorName grid-span-6">${spellUsed.name}: ${dmgRecoverLocalization}</h2>
		</div>`;

		// Parse dice into an array, "Level" should be the final position, if present
		const diceArray = diceToRoll.split(" + ");

		// Check for "Level" and update bonus if present
		const spellSchools = {
			"Miracle": "priest",
			"Ancestral Dragon": "dragon",
			"Spirit Arts": "shaman",
			"Words of True Power": 'sorcerer',
			"Necromancy": "necro"
		};
		if(diceArray.pop() === 'Level'){
			if(spellSchools[spellSchool]){
				levelBonus = playerClassLvls[spellSchools[spellSchool]];
				classNameFlag = game.i18n.localize(`gs.actor.character.${spellSchools[spellSchool]}`);
			}
		}

		// Reconstruct Dice Roll without '+ Level'
		let diceString = '';
		for(let x = 0; x < diceArray.length; x++){
			if(x === 0){
				diceString += diceArray[x];
				chatMessage += addChatFlavor('diceInfo', game.i18n.localize('gs.dialog.dice'), diceArray[x]);
			}else{
				diceString +=  ' + ' + diceArray[x];
				chatMessage += addChatFlavor('gearModifier', game.i18n.localize('gs.dialog.bonus'), diceArray[x]);
			}
		}

		// Add final level bonus to string
		if(levelBonus){
			diceString += ' + ' + levelBonus;
			chatMessage += addChatFlavor('levelScore', classNameFlag, levelBonus);
		}

		// Rolling Dice
		const roll = new Roll(diceString);
		await roll.evaluate();

		// Setting End portion with targets
		targets.forEach(t => {
			console.log('... targets', t);
		});

		// Sending results to chatwindow
		roll.toMessage({
			speaker: { actor: player },
			flavor: chatMessage,
		});
	});
});

// Defining Hotbar Drops here ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Hooks.on('hotbarDrop', (bar, data, slot) => {
    weaponMacroHotbarDrop(data, slot);
	return false;
});

async function weaponMacroHotbarDrop(data, slot){
	if (data.type === "Item") {
		const item = await fromUuid(data.uuid);
        const actor = item.parent;
		console.log('... checking data drop', item, actor);

        if (actor && item) {
            let command = `const actor = game.actors.get("${actor._id}");
				// Mock event object
				const mockEvent = {
					preventDefault: () => {},
					currentTarget: {
						dataset: {
							itemid: "${item._id}"
						}
					}
				};
				`;
			if(item.type === 'weapon')
				command += `actor.sheet._playerAttack(mockEvent);`;
			else if(item.type === 'armor')
				command += `actor.sheet._playerDodge(mockEvent);`;
			else if(item.type === 'shield')
				command += `actor.sheet._playerBlock(mockEvent);`;
			else if(item.type === 'spell')
				command += `actor.sheet._playerSpellCast(mockEvent);`;
			else
				console.log(`GS Hotbar Drop Error | The current item you have dropped into the hot bar is not configured yet.`);

			let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));

			if(!macro){
				macro = await Macro.create({
					name: `Roll ${item.name}`,
					type: "script",
					img: item.img,
					command: command,
					flags: { 'gs.itemMacro': true }
				});
			}

            game.user.assignHotbarMacro(macro, slot);
			return false
        }
    }
}

document.addEventListener('dragstart', function(event) {
	// Assuming the item is being dragged from a valid source like a character sheet
    const draggedElement = event.target.closest('.item-list'); // Adjust the selector as needed
    if (!draggedElement) return;

    // Get the item's UUID or ID
    const itemId = draggedElement.dataset.itemid; // Ensure the item element has the correct data attribute
	const actorId = draggedElement.dataset.actorid;

    // Find the item and actor (you may need to adjust this based on your specific setup)
    const actor = game.actors.get(actorId);
    const item = actor ? actor.items.get(itemId) : null;

	//console.log("... check items", event, itemId, actorId, actor, item);

    if (item) {
        // Set the drag data
        event.dataTransfer.setData("text/plain", JSON.stringify({
            type: "Item",
            uuid: item.uuid,
			img: item.img
        }));

        //console.log("Drag Start Data:", event.dataTransfer);
    } else {
        console.error("Item not found or invalid drag source.");
    }
});

// Define Handlebars Helpers here ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Logs an item from the HTML/HBS pages to see specific information
Handlebars.registerHelper('log', (item) => console.log("Helper Logging >>> ", item));

// Returns added values together
Handlebars.registerHelper('add', (value, increment) => {
	return value + increment;
});

// Getting quantity at the index
Handlebars.registerHelper('getQuantAtIndex', (array, index, field) => {
	const value = array[index].system[field];
	return value;
});

// Strips leading and ending tags from editor saved text
Handlebars.registerHelper('stripTags', (text) => {
	if(typeof text === 'string'){
		return text.replace(/^<p>/, '').replace(/<\/p>$/, '');
	}
	return text;
});

// Returns the description of the Skill rank for diplaying in PC Skills tab.
Handlebars.registerHelper('getSkillRangeText', (object, value, skillType) => {
	const levels = ['beginner', 'intermediate', 'expert', 'master', 'legend'];

	// Determine the maximum value based on skillType
	const maxLevel = skillType === 'adv' ? 5 : (skillType === 'gen' ? 3 : 0);

	// Validate the value
	if (value < 1 || value > maxLevel) {
		return `Rank Value must be a number between 1 and ${maxLevel}.`;
	}

	// Get the corresponding skill level text
	let skillLevel = object.system[levels[value - 1]];

	// Remove wrapping paragraph/span tags
	skillLevel = skillLevel.replace(/^<p>/, '').replace(/<\/p>$/, '');
	skillLevel = skillLevel.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '');

	return skillLevel;
});

// Returns a string of text stripped of any HTML formating
Handlebars.registerHelper('stripFormating', (object) => {
	object = object.replace(/^<p>/, '').replace(/<\/p>$/, '');
	object = object.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '');

	return object;
});

// Logical OR check
Handlebars.registerHelper('or', (value1, value2) => {
	return (value1 || value2) ? true : false;
})

// Reviews object array for specific item type
Handlebars.registerHelper('checkInArray', (object, value) => {
	let inArray = false;
	object.find(item => item.type === value) ? inArray = true : undefined;
	return inArray;
});
