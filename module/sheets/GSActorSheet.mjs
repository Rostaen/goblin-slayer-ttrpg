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
				const item = this.actor.getOwnedItem(element.data("item-id"));
				item.sheet.render(true);
			}
		},
		{
			name: "Delete",
			icon: '<i class="fas fa-trash"></i>',
			callback: element => {
				this.actor.deleteOwnedItem(element.data("item-id"));
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

		// console.log("Check system data:", data);

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

		new ContextMenu(html, ".weapon-card", this.itemContextMenu);
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
}
