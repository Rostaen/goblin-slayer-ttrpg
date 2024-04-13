import { gs } from "./module/config.mjs";
import GSItemSheet from "./module/sheets/GSItemSheet.mjs";
import GSActorSheet from "./module/sheets/GSActorSheet.mjs";
import { GSActor } from "./module/documents/GSActor.mjs";
import { preloadHandlebarsTemplates } from "./module/helpers/templates.mjs";

Hooks.once("init", () => {
	game.gs = { GSActor }

	console.log("GS | Initializing Gobline Slayer TTRPG");

	CONFIG.gs = gs;

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
Handlebars.registerHelper('log', (item) => console.log("Helper Logging >>> ", item));

Handlebars.registerHelper('loopHelper', (loopNum, actor, config, options) => {
	//console.log("Loop Helper>>>",actor);
	let returnValue = '';
	for (let i = 0; i < loopNum; i++){
		returnValue += options.fn({ index: i, data: actor, config: config });
	}
	return returnValue
});