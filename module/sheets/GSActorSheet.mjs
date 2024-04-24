export default class GSActorSheet extends ActorSheet{

	static get defaultOptions(){
		return mergeObject(super.defaultOptions, {
			width: 800,
			classes: ["gs", "sheet", "actor"],
			tabs: [{
				navSelector: ".sheet-tabs",
				contentSelector: ".sheet-body",
				initial: "spells"
			}]
		});
	}

	get template(){
		const path = "systems/gs/templates/actors";
		return `${path}/${this.actor.type}-sheet.hbs`;
	}

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
			actor: data.actor
		}

	}

	activateListeners(html){
		super.activateListeners(html);
		html.find("input[data-inventory='quantity']").change(this._onUpdateCharQuantity.bind(this));
		html.find("input.skillRankInput").change(this._onUpdateSkillRank.bind(this));
		html.find("button[class='delete']").click(this._deleteItem.bind(this));
		html.find("button[class='edit']").click(this._editItem.bind(this));

		new ContextMenu(html, ".contextMenu", this.contextMenu);
	}

	_onUpdateSkillRank(event){
		event.preventDefault();
		const element = event.currentTarget;
		const rank = parseInt(element.value, 10);
		const skillId = element.dataset.skillid;
		const skillType = element.dataset.skilltype;
		const actor = game.actors.get(this.actor._id);
		const items = actor.items;
		console.log("Check Actor JSON:", actor);

		if(!actor){
			console.error("Actor not found.");
			return;
		}

		if(isNaN(rank)){
			console.error("Invalid rank value:", element.value);
		}

		if(skillType === 'racial'){
			const raceItem = items.find(item => item.type === 'race');
			if(!raceItem){
				console.error("Race item not found.");
            	return;
			}
			const skills = raceItem.system.skills || [];
			const skillIndex = skills.findIndex(skill => skill._id === skillId);
			if(skillIndex === -1){
				console.error("Skill not found in racial item.");
	            return;
			}
			skills[skillIndex].system.value = rank;
			raceItem.update({
				'system.skills': skills
			}).then(updatedItem => {
				console.log("Skill updated:", updatedItem.system.skills[skillIndex]);
			}).catch(error => {
				console.error("Error updating racial skill:", error);
			});
		}else if(skillType === 'earned'){
			const skill = items.get(skillId);
			if(!skill){
				console.error("Skill not found.");
            	return;
			}
			skill.update({
				'system.value': rank
			}).then(updatedSkill => {
				console.log("Skill updated:", updatedSkill.system);
			}).catch(error => {
				console.error("Error updating earned skill:", error);
			});
		}else{
			console.error("Unknown skill type:", skillType);
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
	contextMenu = [
		{
			name: "View",
			icon: '<i class="fas fa-edit"></i>',
			callback: element => {
				const actorData = this.actor;
				const id = element[0].dataset.skillid;
				const type = element[0].dataset.skilltype;
				let item = undefined;

				// Function to get a skill by ID within an item
				function getSkillFromItem(item, skillId){
					const skills = item.system.skills || [];
					const skillIndex = skills.findIndex( skill => skill._id === skillId );
					return skillIndex !== -1 ? skills[skillIndex] : undefined;
				}

				switch(type){
					case 'race':
						const raceItem = actorData.items.find(item => item.type === 'race');
						if(raceItem) item = getSkillFromItem(raceItem, id);
						break;
					case 'skill':
					case 'raceSheet':
						item = actorData.items.get(id);
						break;
				}

				if(item){
					try{
						if(!item.sheet){
							item = new Item(item); // Ensures it has a sheet property
						}
						item.sheet.render(true);
					}catch(error){
						console.error("Error rendering skill sheet:", error);
					}
				}else{
					console.error("Skill with ID:", id, "not found.");
				}
			}
		},
		{
			name: "Delete",
			icon: '<i class="fas fa-trash"></i>',
			callback: element => {
				const actor = game.actors.get(this.actor._id);
				const id = element[0].dataset.skillid;
				const type = element[0].dataset.skilltype;

				if(type === 'race'){
					new Dialog({
						title: "Racial Skill Deletion",
						content: "<p>This skill belongs to the selected character race. Please delete the race to delete this skill.</p>",
						buttons: {
							yes: {
								icon: '<i class="fas fa-check"></i>',
								label: "Okay",
								callback: () => {
									// Logic to delete the item
									ui.notifications.info("Skill not deleted.");
								}
							},
							no: {
								icon: '<i class="fas fa-times"></i>',
								label: "Cancel",
								callback: () => {
									ui.notifications.info("Skill deletion cancelled.");
								}
							}
						},
						default: "no"
					}).render(true);
				}else if(type === 'skill'){
					const skill = actor.items.get(id);
					if(!skill){
						console.error("Skill not found for deletion.");
                		return;
					}
					actor.deleteEmbeddedDocuments(
						'Item', [id]
					).then(() => {
						console.log(`GS || ${skill.name} deleted successfully.`);
					}).catch(error => {
						console.error("Error deleting skill:", error);
					});
				}else if(type === 'raceSheet'){
					const pcRace = actor.items.get(id);
					if (pcRace) {
						pcRace.delete();
					} else {
						console.error("Race item not found for deletion.");
					}
				}
			}
		}
	];
}
