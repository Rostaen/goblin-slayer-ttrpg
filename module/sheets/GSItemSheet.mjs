import { gs } from "../config.mjs";
export default class GSItemSheet extends ItemSheet {

	static get defaultOptions(){
		return mergeObject(super.defaultOptions, {
			width: 550,
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
			data,
			config: data.config.gear,
			gear: data.item.system
		}
	}

	activateListeners(html){
		//html.find("input[data-field='input']").change(this._onChangeInput.bind(this));
	}

	// async _onChangeInput(event){
	// 	event.preventDefault();

	// if(element.type === 'checkbox'){
	// 	value = element.checked ? true : false;
	// 	element.setAttribute("value", value);
	// }else if(element.tagName.toLowerCase() === 'select'){
	// 	value = element.value;
	// }else{
	// 	value = $(element).val();
	// }
	// }
}
