import { gs } from "../config.mjs";

export default class GSActorSheet extends ActorSheet{
	static get defaultOptions(){
		return mergeObject(super.defaultOptions, {
			template: "systems/gs/templates/actors/character-sheet.hbs",
			width: 800,
			height: 800,
			classes: ["gs", "sheet", "actor"],
			tabs: [{
				navSelector: ".sheet-tabs",
				contentSelector: ".sheet-body",
				initial: "stats"
			}]
		});
	}

	getData(){
		const data = super.getData();

		return data;

	}

	activateListeners(html){

	}
}
