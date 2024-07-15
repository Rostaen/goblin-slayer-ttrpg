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
	Actors.registerSheet("gs", GSActorSheet, {makeDefault: true});

	Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("gs", GSItemSheet, {makeDefault: true});

	// Preload Handlebars templates
	return preloadHandlebarsTemplates();
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
