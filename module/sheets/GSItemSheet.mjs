import { gs } from "../config.mjs";
export default class GSItemSheet extends ItemSheet {
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
		let itemSetup = this.item.system;
		// Check if itemSetup.type is an empty object
		if(Object.keys(itemSetup.value).length === 0){
			for(const [key, value] of Object.entries(itemSetup)){
				// Skip comment key
				if(key === "comment") continue;

				// Extracting first three letters of key
				const subKey = key.substring(0, 3);

				// Define label based on subKey
				let label;
				let value = "";
				let type = this.item.type;
				switch(subKey){
					case 'eff':
					case 'val':
					case 'ste':
					case 'typ':
					case 'ste':
						label = game.i18n.localize(gs.gear.common[subKey]);
						break;
					case 'use':
					case 'att':
					case 'pow':
					case 'hit':
					case 'ran':
					case 'sco':
					case 'dod':
					case 'mov':
					case 'mod':
						if(type === 'weapon') label = game.i18n.localize(gs.gear.weapons[subKey]);
						else if (type === 'armor') label = game.i18n.localize(gs.gear.armor[subKey]);
						else if (type === 'shield') label = game.i18n.localize(gs.gear.shield[subKey]);
						break;
					default:
						console.log("GS Weapons Error >>>> Error in switch statement");
				}

				// Set property in weaponSetup
				const properties = {label};
				if(key === 'effects') properties.value = value;
				setProperty(itemSetup, key, properties);
			}
		}
		const data = super.getData();
		data.config = CONFIG.gs;
		data.gs = gs;

		return {
			item: data.item,
			gear: this.item.system
		}
	}

	activateListeners(html){
		super.activateListeners(html);
		html.find("input[data-field='input']").change(this._onChangeInput.bind(this));
	}

	async _onChangeInput(event){
		event.preventDefault();
		console.log("Input changed >>>>");
		const key = event.currentTarget.dataset.key;
		const value = $(event.currentTarget).val();
		const cloneObject = Object.assign({}, this.item.system);
		cloneObject[key].value = value;
		await this.item.update({ system: cloneObject });
		console.log(this.item.system);
	}
}
