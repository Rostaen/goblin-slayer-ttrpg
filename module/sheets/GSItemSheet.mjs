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

	async getData(){
		const data = await super.getData();
		data.enrichedBiography = await TextEditor.enrichHTML(this.item.system.effects, {async: true});
		data.config = CONFIG.gs;

		return {
			data,
			config: data.config.gear,
			gear: data.item.system
		}
	}

	activateListeners(html){
		html.find("input[type='checkbox']").change(this._onChangeCheckbox.bind(this));
	}

	async _onChangeCheckbox(event){
		event.preventDefault();
		const element = event.currentTarget;
		const key = element.dataset.key;
		let value = element.checked ? true : false;
		element.setAttribute("value", value);
		const cloneObject = Object.assign({}, this.item.system);
		cloneObject[key] = value;
		await this.item.update({ system: cloneObject });
		// console.log(this.item.system);
	}
}
