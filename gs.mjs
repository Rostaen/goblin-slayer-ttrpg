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
		console.log("... checking targets", targets, data);

		// Setting up chat window details
		let chatMessage = `<div class="chat messageHeader grid grid-7col">
			<img src='${player.prototypeToken.texture.src}'><h2 class="actorName grid-span-6">${weapon.name}: ${game.i18n.localize('gs.actor.character.damage')}</h2>
		</div>
		<h2 class="chat targetsLabel">${game.i18n.localize('gs.dialog.mowDown.targets')}</h2>
		<div class="chat target grid grid-7col">
			<img class="targetImg" src="${activeTarget.document.texture.src}">
			<h3 class="targetName grid-span-6">${activeTarget.document.name}</h3>
		</div>
		<div class="chat gmDmgButtons grid grid-4col">
			<div class="fs10">${game.i18n.localize('gs.dialog.dmgMod')}</div><input class="dmgModInput type="text">
			<div class="fs10">${game.i18n.localize('gs.dialog.applyDmg')}</div><button class="applyDmgButton" type="button"><i class="fa-solid fa-arrows-to-circle"></i></button>
		</div>`;

		// Setting up roll with weapon damage
		let damageString = weapon.system.power;
		if(extraDamage)
			damageString += `+ ${extraDamage}`;
		const roll = new Roll(damageString);
		await roll.evaluate();

		roll.toMessage({
			speaker: ChatMessage.getSpeaker({ actor: player }),
			flavor: chatMessage,
		});
	});
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
