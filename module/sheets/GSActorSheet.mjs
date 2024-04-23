export default class GSActorSheet extends ActorSheet{

	static get defaultOptions(){
		return mergeObject(super.defaultOptions, {
			width: 800,
			classes: ["gs", "sheet", "actor"],
			tabs: [{
				navSelector: ".sheet-tabs",
				contentSelector: ".sheet-body",
				initial: "skills"
			}]
		});
	}

	get template(){
		const path = "systems/gs/templates/actors";
		return `${path}/${this.actor.type}-sheet.hbs`;
	}

	itemContextMenu = [
		{
			name: "Edit",
			icon: '<i class="fas fa-edit"></i>',
			callback: element => {
				const actorData = super.getData();
				console.log("Actor Super Data:",super.getData());
				const id = element[0].dataset.skillid;
				const type = element[0].dataset.skilltype;
				console.log("Element:", element, "ID:", id, "Type:", type);
				let item = undefined;
				let theSkill = undefined;
				if(type === 'race'){
					item = actorData.items.find(item => item.type === type);
					if(item){
						const skills = item.system.skills;
						const skillIndex = skills.findIndex(skill => skill._id === id);
						if(skillIndex !== -1){
							theSkill = skills[skillIndex];
						}else{
							console.error("Skill with the given ID not found in the race item.");
						}
					}else{
						console.error("Race item not found.");
					}
				}
				if (theSkill) {
					if (typeof theSkill.sheet === 'undefined') {
						// Try creating an item object to get a sheet property
						try {
							theSkill = new Item(theSkill);
						} catch (error) {
							console.error("Failed to create Item from theSkill:", error);
							return; // Exit early since it's not possible to render the sheet
						}
					}
					// Check if it has a sheet
					if (theSkill.sheet) {
						theSkill.sheet.render(true);
					} else {
						console.error("TheSkill has no sheet property even after creating an Item.");
					}
				} else {
					console.error("TheSkill is undefined or not found.");
				}
			}
		},
		{
			name: "Delete",
			icon: '<i class="fas fa-trash"></i>',
			callback: element => {
				// Handle item deletion here
				console.log("Deleting item...");
			}
		}
	];

	getData(){
		const data = super.getData();
		data.config = CONFIG.gs;
		const actorData = data.actor;
		data.rollData = this.actor.getRollData();
		data.system = actorData.system;
		data.flags = actorData.flags;

		console.log("Checking Actor Super Data:", data);

		return {
			data,
			config: data.config.actor,
			gearConfig: data.config.gear,
			actor: data.system
		}

	}

	activateListeners(html){
		super.activateListeners(html);
		html.find("input[data-inventory='quantity']").change(this._onUpdateCharQuantity.bind(this));
		html.find("input.skillRankInput").change(this._onUpdateSkillRank.bind(this));
		html.find("button[class='delete']").click(this._deleteItem.bind(this));
		html.find("button[class='edit']").click(this._editItem.bind(this));

		new ContextMenu(html, ".contextMenu", this.itemContextMenu);
	}

	_onUpdateSkillRank(event){
		event.preventDefault();
		const element = event.currentTarget;
		const rank = element.value;
		const skillId = element.dataset.skillid;
		const skillType = element.dataset.skilltype;
		const actorId = this.actor._id;
		const actor = game.actors.get(actorId);

		if(actor){
			if(skillType === 'racial'){
				const raceItem = actor.items.find(item => item.type === 'race');
				if(raceItem){
					const skills = raceItem.system.skills;
					const skillIndex = skills.findIndex(skill => skill._id === skillId);
					if(skillIndex !== -1){
						skills[skillIndex].system.value = parseInt(rank, 10);

						raceItem.update({
							'system.skills': skills
						}).then(updatedItem => {
							console.log("Skill updated:", updatedItem.system.skills[skillIndex]);
						}).catch(error => {
							console.error("Error updating skill:", error);
						})
					}
				}
			}
		}
		console.log("Check if change took:", this.actor);
	}

	_onUpdateCharQuantity(event){
		event.preventDefault();
		const element = event.currentTarget;
		const quantity = parseInt(element.value, 10);
		const id = element.closest(".item").dataset.itemId;
		const actorId = this.actor._id;
		const actor = game.actors.get(actorId);
		const itemId = "";

		if(actor){
			const item = actor.items.get(id);
			if(item){
				item.update({
					system: {
						quantity: quantity
					}
				}).then(updatedItem => {
					console.log("Item Updated:", updatedItem);
				}).catch(error => {
					console.log("Error updating item:", error);
				})
			}
		}
	}

	_deleteItem(event){
		event.preventDefault();
		const element = event.currentTarget;
		const id = element.closest(".item").dataset.itemId;
		const actorId = this.actor._id;
		const actor = game.actors.get(actorId);

		if(actor){
			const item = actor.items.get(id);
			if(item){
				item.delete();
			}
		}
	}

	_editItem(event){
		event.preventDefault();
		const element = event.currentTarget;
		const id = element.closest(".item").dataset.itemId;
		const actorId = this.actor._id;
		const actor = game.actors.get(actorId);

		if(actor){
			const item = actor.items.get(id);
			if(item){
				item.sheet.render(true);
			}
		}
	}

	// Keeping the below code as reference for future use later on.

	// async _onDrop(event){
	// 	//event.preventDefault();
	// 	const data = JSON.parse(event.dataTransfer.getData("text/plain"));
	// 	// Check if even is a Race sheet
	// 	if(data.type === Item && data.uuid.startsWith("Item.")){
	// 		const itemId = data.uuid.split(".")[1];
	// 		const droppedItem = game.items.get(itemId);
	// 		if(droppedItem.type === 'race') this._handleRaceDrop(droppedItem);
	// 	}
	// }

	// _handleRaceDrop(droppedItem){
	// 	// Extract skills from the dropped race item
	// 	const raceSkills = droppedItem.system.skills || [];
	// 	// Getting all actor data
	// 	const actorData = super.getData();
	// 	// Create new items for each skill and add them to the actor's items
	// 	const skillItems = raceSkills.map(skill => ({
	// 		name: skill.name,
	// 		img: skill.img,
	// 		type: "skill",
	// 		_id: skill._id,
	// 		ownership: skill.ownership,
	// 		sort: skill.sort,
	// 		system: skill.system
	// 	}));
	// 	// Add new skill items to the actor's top level items array
	// 	actorData.createEmbeddedDocuments("items", skillItems);
	// }
}
