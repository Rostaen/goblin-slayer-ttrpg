const { mergeObject } = foundry.utils;

export default class GSItemSheet extends ItemSheet {

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			width: 550,
			height: "fit-content",
			classes: ["gs", "sheet", "item"]
		});
	}

	get template() {
		const path = "systems/gs/templates/items";
		return `${path}/${this.item.type}-sheet.hbs`;
	}

	async getData() {
		const data = super.getData();
		const item = this.item || this.document;

		if (!item) {
			console.error("Item or document is undefined.");
			return {};
		}
		const system = item.system;
		if (!system) {
			console.error("System is undefined.");
			return {};
		}
		data.enrichedEffects = await TextEditor.enrichHTML(
			system.effects, { async: true, rollData: item.getRollData(), }
		);
		if (item.type === 'skill') {
			data.eBeginner = await TextEditor.enrichHTML(system.beginner, { async: true, rollData: item.getRollData(), });
			data.eIntermediate = await TextEditor.enrichHTML(system.intermediate, { async: true, rollData: item.getRollData(), });
			data.eExpert = await TextEditor.enrichHTML(system.expert, { async: true, rollData: item.getRollData(), });
			data.eMaster = await TextEditor.enrichHTML(system.master, { async: true, rollData: item.getRollData(), });
			data.eLegend = await TextEditor.enrichHTML(system.legend, { async: true, rollData: item.getRollData(), });
			this.item.update({
				'system.enrichedText': {
					'beginner': data.eBeginner,
					'intermediate': data.eIntermediate,
					'expert': data.eExpert,
					'master': data.eMaster,
					'legend': data.eLegend
				}
			});
		} else if (item.type === 'race') {
			data.eComment = await TextEditor.enrichHTML(
				system.comment, { async: true, rollData: item.getRollData(), }
			);
		} else if (item.type === 'item') {
			const systemData = item.system;
			if (!systemData.quantity || systemData.quantity === null)
				item.update({
					"system.quantity": 1
				});
			if (!systemData.movePen || systemData.movePen === null)
				item.update({
					"system.movePen": 0
				});
		}

		data.config = CONFIG.gs;
		const itemData = data.data;
		data.rollData = this.item.getRollData();
		data.system = itemData.system;
		data.flags = itemData.flags;

		// console.log("Review Data", data);

		return {
			data,
			config: data.config.gear,
			actorSheet: data.config.actor,
			raceSheet: data.config.actor.raceSheet,
			gear: data.system,
			item,
		}
	}

	activateListeners(html) {
		super.activateListeners(html);
		html.find("input[type='checkbox']").change(this._onChangeCheckbox.bind(this));
		html.find('.innateSkills').on('drop', this._onDrop.bind(this)); // Drag N Drop skills into race sheets
	}

	async _onChangeCheckbox(event) {
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

	async _onDrop(event) {
		event.preventDefault();
		const data = JSON.parse(event.originalEvent.dataTransfer.getData("text/plain"));

		if (data.type === "Item") {
			const itemID = data.uuid.slice(5); // Removing `Item.` from the id
			const item = game.items.get(itemID);
			if (item) {
				if (item.type === "skill") {
					const raceItem = this.item;
					if (raceItem) {
						raceItem.system.skills.push(item);
						await raceItem.update({ "system.skills": raceItem.system.skills });
					}
				} else {
					console.log("Item dropped is not a skill", item);
				}
			} else {
				console.log("Item with ID:", itemID, "not found.");
			}
		} else {
			console.error("Item:", data);
		}
		console.log("Did skill transfer?", this.item);
	}
}
