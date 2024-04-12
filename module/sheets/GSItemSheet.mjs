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
		const itemData = data.data;
		data.rollData = this.item.getRollData();
		data.system = itemData.system;
		data.flags = itemData.flags;

		console.log("Check system data:", data.system);

		return {
			data,
			config: data.config.gear,
			gear: data.system
		}
	}

	activateListeners(html){
		super.activateListeners(html);
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
