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

	const actorHold = foundry.documents.collections.Actors;
	const actorSheetLocation = foundry.appv1.sheets.ActorSheet

	actorHold.unregisterSheet("core", actorSheetLocation);
	actorHold.registerSheet("gs", GSActorSheet, {
		makeDefault: true,
		label: game.i18n.localize('gs.sheets.actor')
	});

	const itemHold = foundry.documents.collections.Items;
	const itemSheetLocation = foundry.appv1.sheets.ItemSheet;

	itemHold.unregisterSheet("core", itemSheetLocation);
	itemHold.registerSheet("gs", GSItemSheet, {
		makeDefault: true,
		label: game.i18n.localize('gs.sheets.item')
	});

	// Preload Handlebars templates
	return preloadHandlebarsTemplates();
});

// Defining Enrichers ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Hooks.on("init", () => {
	CONFIG.TextEditor.enrichers.push({
		pattern: /\[\[\/cast "(?<spellName>[^"]+)"(?: (?<checkFormula>[^\]]+))?]]/gi,
		enricher: enrichSpellCast
	});
});

Hooks.on("renderJournalSheet", handleSpellCastButtons);
Hooks.on("renderActorSheet", handleSpellCastButtons);
Hooks.on("renderItemSheet", handleSpellCastButtons);

function handleSpellCastButtons(sheet, html) {
	html.find(".spell-link").click(async (event) => {
		event.preventDefault();
		const uuid = event.currentTarget.dataset.uuid;

		if (uuid) {
			const doc = await fromUuid(uuid);
			if (doc)
				doc.sheet.render(true);
			else
				ui.notifications.warn(`Document with UUID "${uuid}" not found!`);
		}
	});

	html.find(".spell-cast-button").click(async (event) => {
		const spellName = event.currentTarget.dataset.spellName;
		const checkFormula = event.currentTarget.dataset.checkFormula;
		const actor = sheet.actor;
		await castMonsterSpell(spellName, actor, checkFormula);
	});
}

// Hooks.on('renderChatMessageHTML', (app, html, data) => {
// 	// Use this section later on if needed.
// });

// Defining Hotbar Drops here ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Hooks.on('hotbarDrop', (bar, data, slot) => {
	weaponMacroHotbarDrop(data, slot);
	return false;
});

async function weaponMacroHotbarDrop(data, slot) {
	if (data.type === "Item") {
		const item = await fromUuid(data.uuid);
		const actor = item.parent;
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
			if (item.type === 'weapon')
				command += `actor.sheet._playerAttack(mockEvent);`;
			else if (item.type === 'armor')
				command += `actor.sheet._playerDodge(mockEvent);`;
			else if (item.type === 'shield')
				command += `actor.sheet._playerBlock(mockEvent);`;
			else if (item.type === 'spell')
				command += `actor.sheet._playerSpellCast(mockEvent);`;
			else
				console.log(`GS Hotbar Drop Error | The current item you have dropped into the hot bar is not configured yet.`);

			let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));

			if (!macro) {
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

/**
	 * Sets up a simple return statement to add the correct items and values to the localized message for debugging and player knowledge
	 * @param {string} cssClass Class string to color the message, diceInfo, gearModifier, abilScore, levelScore, skillScore, skillEffectiveScore, rollScore, miscScore, armorDodgeScore
	 * @param {string} labelName What is modifying the the dice roll
	 * @param {*} labelMessage How much is being modified, usually an int value, can also be a string if needed.
	 * @returns A string to be added to the localized message
	 */
function addToFlavorMessage(cssClass, labelName, labelMessage) {
	return `<div class="${cssClass} specialRollChatMessage">${labelName}: ${labelMessage}</div>`;
}

// Using a hook to dynamically adjust content in chat window for GM only viewing
Hooks.on('renderChatMessageHTML', (message, html, data) => {
	const elements = html.querySelectorAll('.gm-view');
	for (let el of elements) {
		el.style.display = game.user.isGM ? '' : 'none';
	}
});

document.addEventListener('dragstart', function (event) {
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

// Updating token Dead effect if HP <= 0 || HP > 0
Hooks.on('preUpdateActor', async (actor, updateData) => {
	const newHP = foundry.utils.getProperty(updateData, "system.lifeForce.value");
	let token = actor.getActiveTokens()[0];
	if (!token) return;

	// Setting the "dead" id to a const for use later on.
	const deadEffect = "dead";

	if (newHP === 0) { // If HP reaches zero
		// If the token is already marked as "Dead", do nothing
		if (actor.statuses.has(deadEffect)) return;

		// Remove all active effects on the token
		for (let effect of actor.effects) {
			await effect.delete();
		}

		// Apply the "Dead" status effect and set it to display the large icon
		await actor.toggleStatusEffect(deadEffect, { overlay: true });
	} else if (newHP > 0) { // If HP goes above 0
		if (actor.statuses.has(deadEffect)) {
			await actor.toggleStatusEffect(deadEffect, { overlay: true });
		}
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
	if (typeof text === 'string') {
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
