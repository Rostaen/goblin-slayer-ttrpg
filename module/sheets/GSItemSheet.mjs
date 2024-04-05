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
		if(this.item.type === 'weapon'){
			let weaponSetup = this.item.system;

			// Check if weaponSetup.type is an empty object
			if(Object.keys(weaponSetup.type).length === 0){
				for(const [key, value] of Object.entries(weaponSetup)){
					// Skip comment key
					if(key === "comment") continue;

					// Extracting first three letters of key
					const subKey = key.substring(0, 3);

					// Define label based on subKey
					let label;
					let value = "";
					switch(subKey){
						case 'eff':
						case 'val':
						case 'ste':
						case 'typ':
							label = game.i18n.localize(gs.gear.common[subKey]);
							break;
						case 'use':
						case 'att':
						case 'pow':
						case 'hit':
						case 'ran':
							label = game.i18n.localize(gs.gear.weapons[subKey]);
							break;
						default:
							console.log("GS Weapons Error >>>> Error in switch statement");
					}

					// Set property in weaponSetup
					const properties = {label};
					if(key === 'effects') properties.value = value;
					setProperty(weaponSetup, key, properties);
				}
			}
		}
		const data = super.getData();
		data.config = CONFIG.gs;
		data.gs = gs;
		// console.log(data);
		// console.log("Item >>>", this.item);

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
