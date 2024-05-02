export default class GSActorSheet extends ActorSheet{

	static get defaultOptions(){
		return mergeObject(super.defaultOptions, {
			width: 800,
			classes: ["gs", "sheet", "actor"],
			tabs: [{
				navSelector: ".sheet-tabs",
				contentSelector: ".sheet-body",
				initial: "items"
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
		html.find("label.scoreRoll").click(this._rollStatDice.bind(this));
		html.find(".minStatic").click(this._rollMinionStatic.bind(this));
		html.find(".actorRolls").click(this._actorRolls.bind(this));
		html.find(".stealthCheck").click(this._promptStealthChoice.bind(this));

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
		//console.log("Check Actor JSON:", actor);

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
		const id = element.dataset.itemid;
		const actor = this.actor;

		//console.log(element, id, actor);

		if(actor){
			const item = actor.items.find(item => item._id === id);
			if(item){
				//item.delete();
				actor.deleteEmbeddedDocuments(
					'Item', [id]
				)
			}
		}
	}

	_editItem(event){
		event.preventDefault();
		const element = event.currentTarget;
		const id = element.dataset.itemid;
		const actor = this.actor;

		if(actor){
			const item = actor.items.find(item => item._id === id);
			if(item){
				item.sheet.render(true);
			}
		}
	}

	_rollsToMessage(dice, stat, classBonus, modifier, label){
		let rollExpression = `${dice}`;
		if(stat > 0){
			rollExpression += ` + ${stat}`;
		}
		if(classBonus > 0){
			rollExpression += ` + ${classBonus}`;
		}
		if(modifier < 0){
			rollExpression += ` ${modifier}`;
		}else{
			rollExpression += ` + ${modifier}`;
		}
		const roll = new Roll(rollExpression);
		roll.evaluate({ async: true }).then(() => {
			const diceResults = roll.terms[0].results.map(r => r.result);

			let status = "";
			if(diceResults.length === 2){
				if(diceResults[0] === 1 && diceResults[1] === 1){
					status = ": <span class='critFailColor'>Critical Failure!</span>";

				}else if(diceResults[0] === 6 && diceResults[1] === 6){
					status = ": <span class='critSuccessColor'>Critical Success!</span>";
				}
			}

			roll.toMessage({
				speaker: ChatMessage.getSpeaker({ actor: this.actor }),
				flavor: `Rolling a ${label} check${status}`
			}); // Sending results to chat
		});
	}

	_sendBasicMessage(value, type){
		const speaker = ChatMessage.getSpeaker({ actor: this.actor });
		const messageContent = `
			<h1 style="text-align: center; background-color: rgba(124, 250, 124, 0.75); border: 1px solid green; border-radius: 5px; padding: 5px 10px; width: 100%; height: auto;">
				${value}
			</h1>
		`;

		ChatMessage.create({
			speaker,
			flavor: `Basic ${type}`,
			content: messageContent
		}).then(() => {
			console.log("GS || Basic message sent to chat.");
		}).catch(error => {
			console.error("Error sending basic message to chat:", error);
		});
	}

	_rollStatDice(event){
		event.preventDefault();
		let baseDice = "2d6";
		// Find the parent container that contains the label and input
		const container = event.currentTarget.closest('.calcScore');
		if(container){
			// Find the input field within the same container
			const input = container.querySelector('input');
			const label = container.querySelector('label');
			if(input){
				const bonusScore = input.value;
				const labelText = label.innerHTML;
				// TODO: Update with chat box to add modifiers
				this._rollsToMessage(baseDice, bonusScore, labelText);
			}else{
				console.error("Input field not found.");
			}
		}else{
			console.error("Container with '.calcScore' class not found.");
		}
	}

	_getItemType(container){
		return container.querySelector('input[type="hidden"].type');
	}

	_getClassLevelBonus(typeHolder, gearType){
		const [type, weight] = typeHolder.value.toLowerCase().split('/').map(item => item.trim());
		const {fighter = 0, monk = 0, ranger = 0, scout = 0 } = this.actor.system.levels.classes;

		let bonus = 0;

		const includesAny = (words, text) => words.some(word => text.includes(word));

		// TODO: Find any skills that influence class type hit checks to add here.
		if(gearType === 'weapon'){
			if(type === 'projectile' && ranger > 0){
				bonus += ranger;
			}else if(type === 'throwing'){
				if(monk > 0){
					bonus += monk;
				}else if(ranger > 0){
					bonus += ranger;
				}else if(scout > 0){
					bonus += scout;
				}
			}else{ // Assuming type is a melee weapon
				const fighterWeapons = ["sword", "ax", "spear", "mace"];
				const monkWeapons = ["close-combat", "staff"];
				const scoutWeapons = ["sword", "ax", "spear", "mace", "close-combat", "staff"];
				if (fighter > 0 && includesAny(fighterWeapons, type)) {
					bonus += fighter;
				} else if (monk > 0 && includesAny(monkWeapons, type)) {
					bonus += monk;
				} else if (scout > 0 && includesAny(scoutWeapons, type) && weight === 'light') {
					bonus += scout;
				}
			}
		}else if(gearType === 'armor'){
			let armorType = type.match(/\((.*?)\)/);
			if(armorType && armorType[1]){
				const isCloth = armorType[1] === 'cloth';
				if(fighter > 0){
					bonus += fighter;
				}else if(monk > 0 && isCloth){
					bonus += monk;
				}else if(scout > 0 && weight === 'light'){
					bonus += scout;
				}
			}else{
				console.error("Not text found in type from hidden input");
			}
		}else if(gearType === 'shield'){
			if(fighter > 0){
				bonus += fighter;
			}else if(scout && weight === 'light'){
				bonus += scout;
			}
		}
		return bonus;
	}

	_rollWithModifiers(event, modSelector, baseDice, localizedMessage, itemType){
		event.preventDefault();
		const container = event.currentTarget.closest('.reveal-rollable');
		const actorType = this.actor.type;
		let diceToRoll = baseDice, typeHolder, stat = 0, classBonus = 0, modifier, diceNotation;

		if (!container) {
			console.error("Container with '.reveal-rollable' class not found.");
			return;
		}

		const modElement = container.querySelector(modSelector);
		if (!modElement) {
			console.error(`${localizedMessage} modifier not found.`);
			return;
		}

		if(actorType === 'character') diceNotation = modElement.textContent;
		else if(actorType === 'monster') diceNotation = modElement.value;

		console.log("Before dice eval");
		// Getting monster to hit dice and modifiers (if any)
		if((modSelector === '.hitMod' || modSelector === '.boss.dodge' ||
			modSelector === '.boss.block' || modSelector === '.boss.spellRes' ||
			modSelector === '.power') && actorType === 'monster'){
			if(diceNotation != 0){
				const [powerDice, powerMod] = diceNotation.includes('+') ? diceNotation.split('+') : [diceNotation, 0];
				diceToRoll = powerDice.trim();
				if(powerMod != 0) modifier = parseInt(powerMod.trim(), 10);
				else modifier = powerMod;
			}else{
				ui.notifications.info(`The check has a value of 0 or undefined and cannot be rolled`);
				return;
			}
		}else if(actorType === 'character'){
			if(modSelector === '.power'){
				const [powerDice, powerMod] = diceNotation.includes('+') ? diceNotation.split('+') : [diceNotation, 0];
				diceToRoll = powerDice.trim();
				if(powerMod != 0) modifier = parseInt(powerMod.trim(), 10);
				else modifier = powerMod;
			}else if(modSelector === '.hitMod' || modSelector === '.dodge' ||
					 modSelector === '.blockMod'){
				modifier = parseInt(modElement.textContent, 10);
			}
		}

		if(actorType === 'character') {
			// Getting hidden item type
			typeHolder = this._getItemType(container);
			if (!typeHolder) {
				console.error("Item type not found.");
				return;
			}

			// Getting stat for to hit or damage
			if(modSelector === '.power'){
				// Do nothing here
			}else if(itemType === 'weapon'){
				stat = this.actor.system.abilities.calc.tf;
			}else{
				stat = this.actor.system.abilities.calc.tr;
			}

			classBonus = this._getClassLevelBonus(typeHolder, itemType);
		}

		console.log("Before rollsToMessage check:", modSelector, diceToRoll, stat, classBonus, modifier, localizedMessage);

		this._rollsToMessage(diceToRoll, stat, classBonus, modifier, localizedMessage);
	}

	_rollMinionStatic(event){
		event.preventDefault();
		const container = event.currentTarget.closest('.reveal-rollable');
		const type = event.currentTarget.classList;
		let message, staticContainer;
		if (!container) {
			console.error("Container with '.reveal-rollable' class not found.");
			return;
		}
		switch(type[1]){
			case 'minionHit':
				message = "Hit Check";
				staticContainer = container.querySelector('.minionStatic.hit');
				break;
			case 'minionDodge':
				message = "Dodge Check";
				staticContainer = container.querySelector('.minionStatic.dodge');
				break;
			case 'minionBlock':
				message = "Block Check";
				staticContainer = container.querySelector('.minionStatic.block');
				break;
			case 'minionSR':
				message = "Spell Resistance Check";
				staticContainer = container.querySelector('.minion.spellRes');
				break;
			default:
				ui.notifications.warn(`${type[0]} was not found in the minion's basic classes.`);
				return;
		}
		if (!staticContainer){
			console.error("Minion hit amount container not found.");
			return;
		}
		const amount = staticContainer.value;
		if (amount === NaN || amount === undefined || amount === null){
			console.error("Minion static hit amount empty or other problem.");
			return;
		}else if(amount == 0 || amount == undefined){
			ui.notifications.info(`The ${message} has a value of 0 or undefined and can't be rolled.`);
			return;
		}

		this._sendBasicMessage(amount, message);
	}

	_actorRolls(event){
		const classType = event.currentTarget.classList;
		switch(classType[1]){
			// PC Character checks/rolls
			case 'hitMod':
				this._rollWithModifiers(event, '.hitMod', '2d6', game.i18n.localize("gs.actor.character.hit"), 'weapon');
				break;
			case 'power':
				this._rollWithModifiers(event, '.power', '2d6', game.i18n.localize("gs.gear.spells.att"), 'weapon');
				break;
			case 'dodge':
				this._rollWithModifiers(event, '.dodge', '2d6', game.i18n.localize("gs.actor.character.dodge"), 'armor');
				break;
			case 'blockMod':
				this._rollWithModifiers(event, '.blockMod', '2d6', game.i18n.localize('gs.actor.character.block'), 'shield');
				break;

			// Monster checks/rolls
			case 'bossHit':
				this._rollWithModifiers(event, '.hitMod', '2d6', game.i18n.localize("gs.actor.character.hit"), 'weapon');
				break;
			case 'bossDodge':
				this._rollWithModifiers(event, '.boss.dodge', '2d6', game.i18n.localize("gs.actor.character.dodge"), 'armor');
				break;
			case 'bossBlock':
				this._rollWithModifiers(event, '.boss.block', '2d6', game.i18n.localize("gs.actor.character.block"), 'armor');
				break;
			case 'bossSR':
				this._rollWithModifiers(event, '.boss.spellRes', '2d6', game.i18n.localize("gs.actor.common.spRe"), 'resistance');
				break;
			case 'mPower':
				this._rollWithModifiers(event, '.power', '2d6', game.i18n.localize("gs.gear.spells.att"), 'weapon');
				break;
			default:
				ui.notifications.warn(`${classType[0]} was not found in the boss' classes.`);
				return;
		}
	}

	_promptStealthChoice(event){
		event.preventDefault();

		const dialogContent = `
			<h3>${game.i18n.localize("gs.dialog.stealth.choice")}</h3>
			<ul>
				<li>${game.i18n.localize("gs.dialog.stealth.long")}${game.i18n.localize("gs.dialog.stealth.longChoice")}</li>
				<li>${game.i18n.localize("gs.dialog.stealth.short")}${game.i18n.localize("gs.dialog.stealth.shortChoice")}</li>
			</ul>
		`;

		new Dialog({
			title: game.i18n.localize("gs.dialog.stealth.header"),
			content: dialogContent,
			buttons: {
				longTerm: {
					label: game.i18n.localize("gs.dialog.stealth.long"),
					callback: () => this._handleStealthChoice("te")
				},
				shortTerm: {
					label: game.i18n.localize("gs.dialog.stealth.short"),
					callback: () => this._handleStealthChoice("tr")
				}
			},
			default: "shortTerm",
			close: () => console.log("GS || Stealth check dialog closed"),
		}).render(true);
	}

	_handleStealthChoice(choice){
		let stealthStat, classBonus = 0, skillBonus, rollMessage, armorPenalties = 0;
		const actorData = this.actor.system;
		const actorStats = actorData.abilities.calc;
		const actorClasses = actorData.levels.classes;
		const actorSkills = this.actor.items; // Filter for skill(s) later

		// Determining which calculated stat to use
		if(choice === 'te'){
			stealthStat = parseInt(actorStats.te, 10);
		}else if(choice === 'tr'){
			stealthStat = parseInt(actorStats.tr, 10);
		}else{
			console.error("Invalid stealth choice.");
			ui.notifications.warn("Invalid stealth choice.");
		}

		// Getting Class level bonus
		if(actorClasses.monk > 0){
			classBonus = parseInt(actorClasses.monk, 10);
		}else if(actorClasses.scout > 0){
			classBonus = parseInt(actorClasses.scout, 10);
		}

		// Getting armor/shield penalties
		const armor = actorSkills.filter(item => item.type === 'armor');
		if(armor) armorPenalties += parseInt(armor[0].system.stealth, 10);

		const shield = actorSkills.filter(item => item.type === 'shield');
		if(shield) armorPenalties += parseInt(shield[0].system.stealth, 10);


		// TODO: Add in skill bonuses for stealth here
		// Getting skill bonus(es) here

		// Setting up roll message
		rollMessage = `2d6 + ${stealthStat}`;
		if(classBonus > 0){
			rollMessage += ` + ${classBonus}`;
		}if (armorPenalties < 0){
			rollMessage += ` ${armorPenalties}`;
		}
		console.log("Stat", stealthStat, "CB", classBonus);

		let roll = new Roll(rollMessage);
		roll.evaluate({ async: true }).then(() => {

			roll.toMessage({
				speaker: ChatMessage.getSpeaker({ actor: this.actor }),
				flavor: `${game.i18n.localize("gs.dialog.stealth.output")}`,
			});
		});
	}

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
