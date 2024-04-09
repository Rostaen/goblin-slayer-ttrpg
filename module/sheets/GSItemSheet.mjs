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
					case 'eff':case 'val':case 'ste':case 'typ':case 'ste':
						label = game.i18n.localize(gs.gear.common[subKey]);
						break;
					case 'use':case 'att':case 'pow':case 'hit':case 'ran':case 'sco':
					case 'dod':case 'mov':case 'mod':case 'sum':case 'dif':case 'cha':
					case 'cat':case 'pre':case 'beg':case 'int':case 'exp':case 'mas':
					case 'leg':
						if(type === 'weapon') label = game.i18n.localize(gs.gear.weapons[subKey]);
						else if (type === 'armor') label = game.i18n.localize(gs.gear.armor[subKey]);
						else if (type === 'shield') label = game.i18n.localize(gs.gear.shield[subKey]);
						else if (type === 'item') label = game.i18n.localize(gs.gear.item[subKey]);
						else if (type === 'spell') label = game.i18n.localize(gs.gear.spell[subKey]);
						else if (type === 'skill') label = game.i18n.localize(gs.gear.skill[subKey]);
						break;
					default:
						console.log("GS Weapons Error >>>> Error in switch statement");
				}

				// Set property in weaponSetup
				// const properties = {label};
				// if(key === 'effects') properties.value = value;
				// if (subKey === 'mag') {
				// 	// Handle magic properties separately
				// 	if(Object.keys(itemSetup.magicSchool).length === 0 || Object.keys(itemSetup.magicType).length === 0 || Object.keys(itemSetup.magicElement).length === 0){
				// 		console.log("Length >>>", Object.keys(itemSetup.magicSchool).length)
				// 		switch (key) {
				// 			case 'magicSchool':
				// 				for (const [subKey, value] of Object.entries(gs.gear.spell.school)) {
				// 					setProperty(itemSetup, `magicSchool.${subKey}`, game.i18n.localize(value));
				// 				}
				// 				break;
				// 			case 'magicType':
				// 				for (const [subKey, value] of Object.entries(gs.gear.spell.type)) {
				// 					setProperty(itemSetup, `magicType.${subKey}`, game.i18n.localize(value));
				// 				}
				// 				break;
				// 			case 'magicElement':
				// 				for (const [subKey, value] of Object.entries(gs.gear.spell.element)) {
				// 					setProperty(itemSetup, `magicElement.${subKey}`, game.i18n.localize(value));
				// 				}
				// 				break;
				// 			default:
				// 				console.log("GS Weapons Error >>>> Error in switch statement");
				// 		}
				// 	}
				// } else {
				// 	// Set other properties normally
				// 	setProperty(itemSetup, key, properties);
				// }

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
			data,
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
		const element = event.currentTarget;
		const key = element.dataset.key;
		let value;

		if(element.type === 'checkbox'){
			value = element.checked ? true : false;
			element.setAttribute("value", value);
		}else if(element.tagName.toLowerCase() === 'select'){
			value = element.value;
		}else{
			value = $(element).val();
		}
		console.log("The element >>>", element);
		console.log("The key >>>", key);
		console.log("The value >>>", value);
		const cloneObject = Object.assign({}, this.item.system);
		cloneObject[key].value = value;
		await this.item.update({ system: cloneObject });
		console.log("Finished input change", this.item.system);
	}
}
