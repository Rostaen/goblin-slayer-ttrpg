import { gs } from "./module/config.mjs";
import GSActorSheet from "./module/sheets/GSActorSheet.mjs";
import { GSActor } from "./module/documents/GSActor.mjs";

Hooks.once("init", () => {
	game.gs = {
		GSActor
	}

	console.log("GS | Initializing Gobline Slayer TTRPG");

	CONFIG.gs = gs;

	CONFIG.Combat.initiative = {
		formula: "2d6 + @something.here",
		decimals: 2
	};

	CONFIG.Actor.documentClass = GSActor;

	Actor.unregisterSheet("core", ActorSheet);
	Actor.registerSheet("gs", GSActorSheet, {makeDefault: true});

	// Preload Handlebars templates
	return preloadHandlebarsTemplates();
});

// Define Handlebars Helpers here ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
