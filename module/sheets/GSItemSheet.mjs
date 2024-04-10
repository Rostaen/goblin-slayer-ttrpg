import { gs } from "../config.mjs";
export default class GSItemSheet extends ItemSheet {
	constructor(options={}){
		super(options);
		this.initializeData = false;
	}

	static get defaultOptions(){
		return mergeObject(super.defaultOptions, {
			width: 540,
			//height: auto,
			classes: ["gs", "sheet", "item"]
		});
	}

	get template(){
		const path = "systems/gs/templates/items";
		return `${path}/${this.item.type}-sheet.hbs`;
	}

	getData(){
		const data = super.getData();
		data.config = CONFIG.gs;

		return {
			data
		}
	}

	activateListeners(html){
		//html.find("input[data-field='input']").change(this._onChangeInput.bind(this));
	}

	// async _onChangeInput(event){
	// 	event.preventDefault();
	// }
}
