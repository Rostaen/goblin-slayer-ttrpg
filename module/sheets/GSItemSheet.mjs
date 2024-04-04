export default class GSItemSheet extends ItemSheet {
	static get defaultOptions(){
		return mergeObject(super.defaultOptions, {
			width: 530,
			height: 530,
			classes: ["gs", "sheet", "item"]
		});
	}

	get template(){
		const path = "systems/gs/templates/sheets/items";
		return `${path}/${this.item.type}-sheet.hbs`;
	}

	getData(){
		const data = super.getData();
		data.config = CONFIG.gs;

		return data;
	}
}
