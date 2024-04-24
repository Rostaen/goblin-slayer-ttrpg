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
	CONFIG.Item.entityClass = GSItem
	CONFIG.Combat.initiative = {
		formula: "2d6 + @something.here",
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
Handlebars.registerHelper('getSkillRangeText', (object, value) => {
	let skillLevel = "";
	// TODO: Will need future checks for levels and ranks to allow higher rank levels
	if(value == 1) skillLevel = object.system.beginner;
	else if(value == 2) skillLevel = object.system.intermediate;
	else if(value == 3) skillLevel = object.system.expert;
	else if(value == 4) skillLevel = object.system.master;
	else if(value == 5) skillLevel = object.system.legend;
	else return "Rank Value must be a number and greater than 0 and less than 3 (Gen) or 5 (Adv).";
	return skillLevel.replace(/^<p>/, '').replace(/<\/p>$/, '');
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
