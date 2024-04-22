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
			actorSheet: data.config.actor,
			raceSheet: data.config.actor.raceSheet,
			gear: data.system
		}
	}

	activateListeners(html){
		super.activateListeners(html);
		console.log("Activating listeners for GSItemSheet");
		html.find("input[type='checkbox']").change(this._onChangeCheckbox.bind(this));
		html.find('.innateSkills').on('drop', this._onDrop.bind(this)); // Drag N Drop skills into race sheets
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

	async _onDrop(event){
		event.preventDefault();
		const data = JSON.parse(event.originalEvent.dataTransfer.getData("text/plain"));

		if(data.type === "Item"){
			const itemID = data.uuid.slice(5); // Removing `Item.` from the id
			const item = game.items.get(itemID);
			if(item){
				if(item.type === "skill"){
					const raceItem = this.item;
					if(raceItem){
						raceItem.system.skills.push(item);
						await raceItem.update({ "system.skills": raceItem.system.skills });
					}
				}else{
					console.log("Item dropped is not a skill", item);
				}
			}else{
				console.log("Item with ID:", itemID, "not found.");
			}
		}else{
			console.error("Item:", data);
		}
		console.log("Did skill transfer?", this.item);
	}
}
