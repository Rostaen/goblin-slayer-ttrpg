const {mergeObject} = foundry.utils;

export default class GSActorSheet extends ActorSheet{

	static get defaultOptions(){
		return mergeObject(super.defaultOptions, {
			width: 800,
			classes: ["gs", "sheet", "actor"],
			tabs: [{
				navSelector: ".sheet-tabs",
				contentSelector: ".sheet-body",
				initial: "stats"
			}]
		});
	}

	get template(){
		const path = "systems/gs/templates/actors";
		return `${path}/${this.actor.type}-sheet.hbs`;
	}

	// Use this section to manage item drops without overwritting core functionality
	async _onDropItem(event, data){
		const itemData = await super._onDropItem(event, data);

		// Check if item dropped is a race item
		if(itemData[0].type === 'race'){
			this._inheritRaceSkills(itemData);
		}
		return itemData;
	}

	async _inheritRaceSkills(raceItem){
		const raceSkills = raceItem[0].system.skills || [];
		if (raceSkills.length === 0) {
			console.error("No skills found in the race item.");
			return;
		}

		const skillItems = raceSkills.map(skill => {
			return {
				flags: skill.flogs,
				img: skill.img,
				name: skill.name,
				ownership: {...skill.ownership},
				sort: skill.sort,
				system: {...skill.system},
				type: 'skill',
				_stats: {...skill._stats}
			};
		});

		try{
			const createdSkills = await this.actor.createEmbeddedDocuments('Item', skillItems);
		} catch (error) {
			console.error("Error adding skills to actor:", error);
		}
	}

	async getData(){
		const data = super.getData();
		data.config = CONFIG.gs;
		const actorData = data.actor;
		data.rollData = this.actor.getRollData();
		data.flags = actorData.flags;

		console.log("GSActorSheet >>> Checking Actor Super Data:", data);

		if(this.actor.type === 'monster'){
			data.eAbilities = await TextEditor.enrichHTML(
				actorData.system.abilities, {async: true, rollData: actorData.getRollData(), }
			);
			data.eComment = await TextEditor.enrichHTML(
				actorData.system.comment, {async: true, rollData: actorData.getRollData(), }
			);
		}

		return {
			data,
			config: data.config.actor,
			gearConfig: data.config.gear,
			actor: data.actor
		}

	}

	activateListeners(html){
		super.activateListeners(html);
		// html.find(".topArea").update(this._inheritRaceSkills.bind(this));
		html.find("input[data-inventory='quantity']").change(this._onUpdateCharQuantity.bind(this));
		html.find("input.skillRankInput").change(this._onUpdateSkillRank.bind(this));
		html.find("label.scoreRoll").click(this._rollStatDice.bind(this));
		html.find(".minStatic").click(this._rollMinionStatic.bind(this));
		html.find(".actorRolls").click(this._actorRolls.bind(this));
		html.find(".attritionCBox").off('click').click(this._updateAttritionFlag.bind(this));
		// html.find(".fatigueCBox").click(this._updateFatigue.bind(this));

		new ContextMenu(html, ".contextMenu", this.contextMenu);
	}

	_getSkillBonus(skillName){
		const skills = this.actor.items.filter(item => item.type === 'skill');
		if(skills.length){
			const skillBonusValue = skills.filter(skill => skill.name.toLowerCase() === skillName);
			if(skillBonusValue.length){
				return parseInt(skillBonusValue[0].system.value, 10);
			}
		}
	}

	_getRollMod(html, target){
		const rollMod = html.find(`${target}`)[0].value;
		return parseInt(rollMod, 10);
	}

	_setRollMessage(dice = "2d6", stat = 0, firstMod = 0, secondMod = 0, thirdMod = 0, fourthMod = 0){
		console.log(">>> setRollMessage Check:", fourthMod);
		let rollMessage = dice, fatigueMod;

		if(this.actor.type === 'character')
			fatigueMod = this.actor.system.fatigue.fatigueMod;
		else
			fatigueMod = 0;

		if(stat > 0)
			rollMessage += `  + ${stat}`;
		if(firstMod > 0) // Class Bonus
			rollMessage += ` + ${firstMod}`;
		if(secondMod < 0) // Item/gear +/-
			rollMessage += ` - ${Math.abs(secondMod)}`;
		else if(secondMod > 0)
			rollMessage += ` + ${secondMod}`;
		if(thirdMod > 0) // Extra roll modifiers
			rollMessage += ` + ${thirdMod}`;
		else if(thirdMod < 0)
			rollMessage += ` - ${Math.abs(thirdMod)}`;
		if(fourthMod > 0 || fourthMod !== "")
			rollMessage += ` + ${fourthMod}`;
		if(fatigueMod < 0)
			rollMessage += ` - ${Math.abs(fatigueMod)}`;
		return rollMessage;
	}

	_onUpdateSkillRank(event){
		event.preventDefault();
		const element = event.currentTarget;
		const rank = parseInt(element.value, 10);
		const skillId = element.dataset.id;
		const skillType = element.dataset.contexttype;
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
			});
			// .then(updatedItem => {
			// 	console.log("Skill updated:", updatedItem.system.skills[skillIndex]);
			// }).catch(error => {
			// 	console.error("Error updating racial skill:", error);
			// });
		}else if(skillType === 'earned'){
			const skill = items.get(skillId);
			if(!skill){
				console.error("Skill not found.");
            	return;
			}
			skill.update({
				'system.value': rank
			});
			// .then(updatedSkill => {
			// 	console.log("Skill updated:", updatedSkill.system);
			// }).catch(error => {
			// 	console.error("Error updating earned skill:", error);
			// });
		}else{
			console.error("Unknown skill type:", skillType);
		}
		// console.log("Check if change took:", this.actor);
	}

	_onUpdateCharQuantity(event){
		event.preventDefault();
		const element = event.currentTarget;
		const quantity = parseInt(element.value, 10);
		const id = element.closest(".item").dataset.id;
		const item = this.actor.items.get(id);

		if(item){
			item.update({
				system: {
					quantity: quantity
				}
			}).then(updatedItem => {
				//console.log("Item Updated:", updatedItem);
			}).catch(error => {
				console.error("Error updating item:", error);
			})
		}
	}

	// Updates current fatigue rank by 1
	async _updateFatigue(rank){
		const fatigueMin = `system.fatigue.${rank}.min`;
		const fatigueMarked = `system.fatigue.${rank}.marked`;
		const currentMin = this.actor.system.fatigue[rank].min;

		await this.actor.update({
			[fatigueMin]: currentMin + 1,
			[`${fatigueMarked}.${currentMin + 1}`]: true
		});
	}

	// Checks through fatigue ranks to find rank now maxed out yet
	async _checkFatigueRanks(){
		const ranks = ['rank1', 'rank2', 'rank3', 'rank4', 'rank5'];
		for(const rank of ranks){
			const currentMin = this.actor.system.fatigue[rank].min;
			const max = this.actor.system.fatigue[rank].max;
			if(currentMin < max){
				await this._updateFatigue(rank);
				break;
			}
		}
	}

	_updateAttritionFlag = async (event) => {
		event.preventDefault();
		const element = event.currentTarget;
		const checkBoxNum = element.dataset.cbox;
		const boxHasAttrition = element.checked;
		const systemData = this.actor.system;
		const currentWounds = systemData.lifeForce.min;
		const lifeForceHalf = systemData.lifeForce.double;
		const attrition = systemData.attrition;
		const attritionThresholds = [5,8,11,14,16,18,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40];
		const armor = this.actor.items.filter(item => item.type.toLowerCase() === 'armor');
		const armorWorn = armor[0].system.heavy;
		let attritionLevel = 0;

		// Getting attrition level from JSON array
		for (let x = 0; x < Object.keys(attrition).length; x++){
            if(!attrition[x]){
                attritionLevel = x + 1;
                break;
            }
        }

		// Updating checkbox
		this.actor.update({
			[`system.attrition.${checkBoxNum - 1}`]: !systemData.attrition[checkBoxNum - 1]
		});

		// Checking if character is wearing heavy armor and if Str End is less than value, true? +1 fatigue
		const checkIfHeavy = async (armorWorn) => {
			if(armorWorn.value && this.actor.system.abilities.calc.se < armorWorn.x){
				setTimeout(async () => {
					await this._checkFatigueRanks();
				}, 200);
			}
		}

		// Checking if checkbox is checked or not, if checked, skip check to indicate attrition healing.
		if(boxHasAttrition){
			// Checking the state of actor and checkbox for fatigue
			if(currentWounds < lifeForceHalf && attritionThresholds.includes(attritionLevel)){
				await this._checkFatigueRanks();
				checkIfHeavy(armorWorn);
			}else if(currentWounds >= lifeForceHalf){
				await this._checkFatigueRanks();
				if(attritionThresholds.includes(attritionLevel)){
					setTimeout(async () => {
						await this._checkFatigueRanks();
					}, 100);
					checkIfHeavy(armorWorn);
				}
			}
		}
	}

	_checkForCritRolls(diceResults, label){
		if(diceResults.length === 2){
			let skills, skillValue, critSuccess = 12, critFail = 2, results = [];
			const actorType = this.actor.type;

			// Checking actor type to get skills
			if(actorType === "character"){
				skills = this.actor.items.filter(item => item.type === 'skill');

				// Updating the Critical Success/Failure rate based on the given skill
				const setCritValues = (skillValue) => {
					if(skillValue === 1){ critSuccess = 11; critFail = 5; }
					else if(skillValue === 2){ critSuccess = 11; critFail = 4; }
					else if(skillValue === 3){ critSuccess = 10; critFail = 4; }
					else if(skillValue === 4){ critSuccess = 10; critFail = 3; }
					else if(skillValue === 5){ critSuccess = 9; critFail = 3; }
				};

				// Checking over each character skill to modify success rates
				for(const skill of skills){
					skillValue = skill.system.value;
					switch(`${skill.name.toLowerCase()}-${label.toLowerCase()}`){
						case 'alert-dodge':
							setCritValues(skillValue);
							break;
					}
				}
			}

			// Checking dice results vs. crit fail/success otherwise this is a regular result
			if(diceResults[0] + diceResults[1] <= critFail){
				results[0] = 'fail';
				results[1] = `<br><div class='critFailColor'>${game.i18n.localize("gs.dialog.crits.crit")} ${game.i18n.localize("gs.dialog.crits.fail")}</div>`;
				return results;
			}else if(diceResults[0] + diceResults[1] >= critSuccess){
				results[0] = 'success';
				results[1] = `<br><div class='critSuccessColor'>${game.i18n.localize("gs.dialog.crits.crit")} ${game.i18n.localize("gs.dialog.crits.succ")}</div>`;
				return results;
			}else {
				results[0] = 'normal';
				results[1] = '';
				return results;
			}
		}
	}

	async _rollsToMessage(dice, stat, classBonus, modifier, label, skillBonus = 0, rollMod = 0){
		let rollExpression = `${dice}`;
		const casting = game.i18n.localize('gs.dialog.spells.spUse');

		// Getting roll modifiers from user
		rollMod = await this._promptStealthChoice("rollMod", label);

		// Setting up roll message
		if(label === casting)
			rollExpression = this._setRollMessage(dice, stat, classBonus, 0, rollMod);
		else
			rollExpression = this._setRollMessage(dice, stat, classBonus, modifier, rollMod, skillBonus);

		try{
			const roll = new Roll(rollExpression);
			await roll.evaluate();

			const diceResults = roll.terms[0].results.map(r => r.result);
			const status = this._checkForCritRolls(diceResults, label);
			let dcCheck = '';
			if(label === casting){
				// Getting dice total plus bonuses to compare to DC stored in Modifier
				let diceTotal = diceResults[0] + diceResults[1] + stat + classBonus;
				if(diceTotal >= modifier && status[0] != 'fail'){
					if(status[0] === 'success')
						diceTotal += 5;
					dcCheck = `<div class="spellCastSuccess">${game.i18n.localize('gs.dialog.spells.cast')} ${game.i18n.localize('gs.dialog.crits.succ')}</div><div class="spellEffectivenessScore">${game.i18n.localize('gs.gear.spells.efs')}: ${diceTotal}</div>`;
				}else{
					dcCheck = `<div class="spellCastFailure">${game.i18n.localize('gs.dialog.spells.cast')} ${game.i18n.localize('gs.dialog.crits.fail')}</div>`;
				}
			}
			let chatFlavor = `<div class="customFlavor">Rolling a ${label} check`;
			if(status != undefined || status != null)
				chatFlavor += `${status[1]}`;
			chatFlavor += `${dcCheck}</div>`;

			// Sending dice rolls to chat window
			await roll.toMessage({
				speaker: ChatMessage.getSpeaker({ actor: this.actor }),
				flavor: chatFlavor,
			});
		} catch (error) {
			console.error("Error evaluating roll:", error);
		}
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
			//console.log("GS || Basic message sent to chat.");
		}).catch(error => {
			console.error("Error sending basic message to chat:", error);
		});
	}

	async _rollStatDice(event){
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
				this._rollsToMessage(baseDice, bonusScore, 0, 0, labelText);
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

	_getClassLevelBonus(typeHolder, itemType){
		// console.log("Check Class Level Bonus", typeHolder, itemType);
		let [type, weight] = "";
		if(itemType != 'cast') {
			[type, weight] = typeHolder.value.toLowerCase().split('/').map(item => item.trim());
		}
		const {fighter = 0, monk = 0, ranger = 0, scout = 0, sorcerer = 0, priest = 0, dragon = 0, shaman = 0 } = this.actor.system.levels.classes;

		let bonus = 0;

		const includesAny = (words, text) => words.some(word => text.includes(word));

		// TODO: Find any skills that influence class type hit checks to add here.
		if(itemType === 'weapon'){
			if(type === 'projectile' && ranger > 0){
				bonus += ranger;
			}else if(type === 'throwing'){
				if(monk > bonus){
					bonus += monk;
				}else if(ranger > bonus){
					bonus += ranger;
				}else if(scout > bonus){
					bonus += scout;
				}
			}else{ // Assuming type is a melee weapon
				const fighterWeapons = ["sword", "ax", "spear", "mace"];
				const monkWeapons = ["close-combat", "staff"];
				const scoutWeapons = ["sword", "ax", "spear", "mace", "close-combat", "staff"];
				if (fighter > bonus && includesAny(fighterWeapons, type)) {
					bonus += fighter;
				} else if (monk > bonus && includesAny(monkWeapons, type)) {
					bonus += monk;
				} else if (scout > bonus && includesAny(scoutWeapons, type) && weight === 'light') {
					bonus += scout;
				}
			}
		}else if(itemType === 'armor'){
			let armorType = type.match(/\((.*?)\)/);
			if(armorType && armorType[1]){
				const isCloth = armorType[1] === 'cloth';
				if(fighter > bonus){
					bonus += fighter;
				}else if(monk > bonus && isCloth){
					bonus += monk;
				}else if(scout > bonus && weight === 'light'){
					bonus += scout;
				}
			}else{
				console.error("Not text found in type from hidden input");
			}
		}else if(itemType === 'shield'){
			if(fighter > bonus){
				bonus += fighter;
			}else if(scout && weight === 'light'){
				bonus += scout;
			}
		}else if(itemType === 'cast'){
			if(typeHolder.toLowerCase() === "words of true power"){
				bonus += sorcerer;
			}else if(typeHolder.toLowerCase() === "miracle"){
				bonus += priest;
			}else if(typeHolder.toLowerCase() === "ancestral dragon"){
				bonus += dragon;
			}else if(typeHolder.toLowerCase() === "spirit arts"){
				bonus += shaman;
			}
		}
		return bonus;
	}

	async _rollWithModifiers(event, modSelector, baseDice, localizedMessage, itemType){
		event.preventDefault();
		const container = event.currentTarget.closest('.reveal-rollable');
		const actorType = this.actor.type;
		const actorCalcStats = this.actor.system.abilities.calc;
		let diceToRoll = baseDice, typeHolder, stat = 0, classBonus = 0, modifier, diceNotation, skills, skillBonus = 0;

		if (!container) {
			console.error("Container with '.reveal-rollable' class not found.");
			return;
		}

		const modElement = container.querySelector(modSelector);
		if (!modElement) {
			console.error(`${localizedMessage} modifier not found.`);
			return;
		}

		if(actorType === 'character'){
			diceNotation = modElement.textContent;
			skills = this.actor.items.filter(item => item.type === 'skill');
		}else if(actorType === 'monster') diceNotation = modElement.value;

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
		// Getting character elements ready
		}else if(actorType === 'character'){
			if(modSelector === '.power'){
				// Breaking down weapon power for damage dice and +N modifiers, if any
				const [powerDice, powerMod] = diceNotation.includes('+') ? diceNotation.split('+') : [diceNotation, 0];
				diceToRoll = powerDice.trim();
				if(powerMod != 0) modifier = parseInt(powerMod.trim(), 10);
				else modifier = powerMod;

				// Checking if character has monk levels and burst of strength skill
				if(this.actor.system.levels.classes.monk > 0){
					const typeHolder = this._getItemType(container);
					let [type, weight] = typeHolder.value.toLowerCase().split('/').map(item => item.trim());
					if(type === 'close-combat'){
						for(const skill of skills){
							// console.log(">>> Checking skills", skill.name);
							if(skill.name.toLowerCase() === 'burst of strength'){
								switch(skill.system.value){
									case 1: skillBonus = 1; break;
									case 2: skillBonus = 2; break;
									case 3: skillBonus = "1d3"; break;
									case 4:
									case 5: skillBonus = "1d6"; break;
								}
								const powerBonus = await this._promptFatigueForPower();
								if(powerBonus > 0){
									for(let x = 0; x < powerBonus; x++)
										await this._checkFatigueRanks();
									if(skill.system.value <= 2)
										skillBonus += powerBonus;
									else if(skill.system.value <= 4)
										skillBonus += `+${powerBonus}`;
									else
										skillBonus += `+${powerBonus * 2}`;
								}
							}
						}
					}
				}
			}else if(modSelector === '.hitMod' || modSelector === '.dodge' ||
					 modSelector === '.blockMod' || modSelector === '.spellDif'){
				modifier = parseInt(modElement.textContent, 10);
				// Checking for dodging and heavy classified armor vs Str End score
				if(modSelector === '.dodge'){
					const armor = this.actor.items.filter(item => item.type === 'armor');
					const strEnd = this.actor.system.abilities.calc.se;
					if(armor[0].system.heavy.value && strEnd >= armor[0].system.heavy.y){
						modifier = Math.floor(modifier / 2);
					}
				}
			}else if(modSelector === '.spellRes'){
				modifier = parseInt(modElement.value);
			}
		}

		if(actorType === 'character') {
			// Getting hidden item type
			switch(itemType){
				case 'weapon': case 'armor': case 'shield':
					typeHolder = this._getItemType(container);
					if (!typeHolder) {
						console.error("Item type not found.");
						return;
					}
					classBonus = this._getClassLevelBonus(typeHolder, itemType);
					break;
				case 'cast':
					const school = container.querySelector("input[type='hidden']").value;
					if(school.toLowerCase() === "words of true power"){
						stat = actorCalcStats.if;
					}else{
						stat = actorCalcStats.pf;
					}
					classBonus = this._getClassLevelBonus(school, itemType);
					break;
				// Do nothing else for other items types
			}

			// Getting stat for to hit or damage
			if(modSelector === '.power' || modSelector === '.spellRes'){
				// Do nothing here
			}else if(itemType === 'weapon'){
				stat = actorCalcStats.tf;
			}else if(itemType === 'shield' || itemType === 'armor'){
				stat = actorCalcStats.tr;
			}
		}

		// console.log("Before rollsToMessage check:", modSelector, diceToRoll, stat, classBonus, modifier, localizedMessage);

		this._rollsToMessage(diceToRoll, stat, classBonus, modifier, localizedMessage, skillBonus);
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

	_promptHealingAmount(healType){
		let healingTitle = game.i18n.localize('gs.actor.character.heal') + " ";
		if(healType === 'healAttrition')
			healingTitle += game.i18n.localize('gs.actor.character.attr');
		else
			healingTitle += game.i18n.localize('gs.actor.character.fatW');

		return new Promise ((resolve) => {
			let dialogContent, promptTitle, buttonOne, buttonTwo;
			dialogContent = `
				<h3>${healingTitle}</h3>
				<p>${game.i18n.localize('gs.dialog.healingPrompt.healAmount')}</p>
				<input type="text" class="healAmount" style="margin-bottom: 10px;" />
			`;
			promptTitle = game.i18n.localize('gs.actor.character.heal');
			buttonOne = {
				label: game.i18n.localize('gs.actor.character.heal'),
				callback: (html) => {
					let amount;
					resolve(
						amount = parseInt(html.find('.healAmount')[0].value, 10)
					);
				}
			};
			buttonTwo = {
				label: game.i18n.localize("gs.dialog.cancel"),
				callback: () => {
					resolve(0);
				}
			};
			new Dialog({
				title: promptTitle,
				content: dialogContent,
				buttons: { buttonOne: buttonOne, buttonTwo: buttonTwo },
				default: "buttonOne",
				close: () => "",
			}).render(true);
		});
	}

	async _healAttrFatigue(healType){
		let amountToHeal = await this._promptHealingAmount(healType);

		if(amountToHeal > 0){
			if(healType === 'healAttrition'){
				const attritionTrack = this.actor.system.attrition;
				amountToHeal -= 1;
				let attritionAmount = 0;
				for(attritionAmount; attritionAmount < Object.entries(attritionTrack).length; attritionAmount++){
					if(attritionTrack[attritionAmount] === false){
						attritionAmount -= 1;
						break;
					}
				}
				for(let x = attritionAmount; x >= attritionAmount - amountToHeal; x--){
					if(x < 0) {// Check to ensure x doesn't break below array position 0
						break;
					}
					attritionTrack[x] = false;
				}
				this.actor.update({ 'system.attrition': attritionTrack });
			}else{
				const fatigueTracks = this.actor.system.fatigue;
				const ranks = ['rank5', 'rank4', 'rank3', 'rank2', 'rank1'];

				for(const rank of ranks){
					const currentMin = this.actor.system.fatigue[rank].min;
					const max = this.actor.system.fatigue[rank].max;

					if(amountToHeal == 0) break;
					else if(currentMin == 0) continue;
					else{
						let healedMin = currentMin - amountToHeal;
						if(healedMin < 0){
							healedMin = 0;
							amountToHeal -= currentMin;
						}
						for(let x = currentMin; x > healedMin; x--){
							fatigueTracks[rank].marked[x] = false;
						}

						this.actor.update({
							[`system.fatigue.${rank}.min`]: healedMin,
							[`system.fatigue.${rank}.marked`]: fatigueTracks[rank].marked
						});
					}

				}
			}
		}
	}

	_actorRolls(event){
		const classType = event.currentTarget.classList;
		switch(classType[1]){
			// PC Character checks/rolls
			case 'toHit':
				this._rollWithModifiers(event, '.hitMod', '2d6', game.i18n.localize("gs.actor.character.hit"), 'weapon');
				break;
			case 'damage':
				this._rollWithModifiers(event, '.power', '2d6', game.i18n.localize("gs.gear.spells.att"), 'weapon');
				break;
			case 'avoid':
				this._rollWithModifiers(event, '.dodge', '2d6', game.i18n.localize("gs.actor.character.dodge"), 'armor');
				break;
			case 'block':
				this._rollWithModifiers(event, '.blockMod', '2d6', game.i18n.localize('gs.actor.character.block'), 'shield');
				break;
			case 'charSR':
				this._rollWithModifiers(event, '.spellRes', '2d6', game.i18n.localize('gs.actor.common.spRe'), 'resistance');
				break;
			case 'spellCast':
				this._rollWithModifiers(event, '.spellDif', '2d6', game.i18n.localize('gs.dialog.spells.spUse'), 'cast');
				break;
			case 'healAttrition':
			case 'healFatigue':
				this._healAttrFatigue(classType[1]);
				break;
			case 'initiative':
				this._rollInitiative(event);
				break;
			case 'stealthCheck':
				this._promptStealthChoice("stealth");
				break;
			case 'sixthSense':
				this._sixthSenseRoll(event);
				break;
			case 'luck':
				this._luckRoll(event);
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

	_promptFatigueForPower(){
		return new Promise ((resolve) => {
			let dialogContent, promptTitle, buttonOne, buttonTwo;

			dialogContent = `
				<h3>${game.i18n.localize("gs.dialog.burstOfStr.header")}</h3>
				<p>${game.i18n.localize("gs.dialog.burstOfStr.label")} ${this.actor.system.abilities.primary.psy}</p>
				<input type="test" class="burstSkill" style="margin-bottom: 10px;" />`;
			promptTitle = game.i18n.localize("gs.dialog.burstOfStr.title");
			buttonOne = {
				label: game.i18n.localize('gs.dialog.confirm'),
				callback: (html) => {
					let amount;
					resolve(
						amount = parseInt(html.find('.burstSkill')[0].value, 10)
					);
				}
			};
			buttonTwo = {
				label: game.i18n.localize("gs.dialog.cancel"),
				callback: () => {
					resolve(0);
				}
			};
			new Dialog({
				title: promptTitle,
				content: dialogContent,
				buttons: { buttonOne: buttonOne, buttonTwo: buttonTwo },
				default: "buttonOne",
				close: () => "",
			}).render(true);
		});
	}

	_promptStealthChoice(promptType, promptName = ''){
		return new Promise ((resolve) => {
			let dialogContent, promptTitle, buttonOne, buttonTwo;

			switch(promptType){
				case 'stealth':
					dialogContent = `
						<h3>${game.i18n.localize("gs.dialog.stealth.choice")}</h3>
						<ul>
							<li>${game.i18n.localize("gs.dialog.stealth.long")}${game.i18n.localize("gs.dialog.stealth.longChoice")}</li>
							<li>${game.i18n.localize("gs.dialog.stealth.short")}${game.i18n.localize("gs.dialog.stealth.shortChoice")}</li>
						</ul>
						<h3>${game.i18n.localize("gs.dialog.mods.addMod")}</h3>
						<p>${game.i18n.localize("gs.dialog.mods.addInfo")}</p>
						<input type="text" class="rollMod" style="margin-bottom: 10px;" />`;
					promptTitle = game.i18n.localize("gs.dialog.stealth.header");
					buttonOne = {
						label: game.i18n.localize("gs.dialog.stealth.long"),
						callback: (html) => {
							resolve(this._getRollMod(html, ".rollMod"));
                        	this._handleStealthChoice("te", this._getRollMod(html, ".rollMod"));
						}
					};
					buttonTwo = {
						label: game.i18n.localize("gs.dialog.stealth.short"),
						callback: (html) => {
							resolve(this._getRollMod(html, ".rollMod"));
                        	this._handleStealthChoice("tr", this._getRollMod(html, ".rollMod"));
						}
					};
					break;
				case 'rollMod':
					dialogContent = `
						<h3>${game.i18n.localize("gs.dialog.mods.addMod")}</h3>
						<p>${game.i18n.localize("gs.dialog.mods.addInfo")}</p>
						<input type="text" class="rollMod" style="margin-bottom: 10px;" />`;
					promptTitle = promptName + " " + game.i18n.localize("gs.dialog.mods.mod");
					buttonOne = {
						label: game.i18n.localize("gs.dialog.mods.addMod"),
						callback: (html) => {
							resolve(this._getRollMod(html, ".rollMod"));
						}
					};
					buttonTwo = {
						label: game.i18n.localize("gs.dialog.cancel"),
						callback: () => {
							resolve(0);
						}
					};
					break;
				default:
					break;
			}

			new Dialog({
				title: promptTitle,
				content: dialogContent,
				buttons: { buttonOne: buttonOne, buttonTwo: buttonTwo },
				default: "buttonOne",
				close: () => "",
			}).render(true);
		});
	}

	_handleStealthChoice(choice, rollMod = 0){
		let stealthStat, skillBonus = 0, classBonus = 0, rollMessage, armorPenalties = 0;
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
		if(armor.length) armorPenalties += parseInt(armor[0].system.stealth, 10);

		const shield = actorSkills.filter(item => item.type === 'shield');
		if(shield.length) armorPenalties += parseInt(shield[0].system.stealth, 10);


		// TODO: Add in skill bonuses for stealth here
		// Getting skill bonus(es) here

		// Setting up roll message
		rollMessage = this._setRollMessage("2d6", stealthStat, classBonus, armorPenalties, rollMod);
		// console.log("Stat", stealthStat, "CB", classBonus);

		this._sendRollMessage(rollMessage, `${game.i18n.localize("gs.dialog.stealth.output")}`);
	}

	async _rollInitiative(event){
		event.preventDefault();

		const actorType = this.actor.type;
		let anticipateBonus = 0, rollMessage = "2d6";

		if(actorType === 'character'){
			const skill = this.actor.items.filter(item => item.type === 'skill');
			const rollMod = await this._promptStealthChoice("rollMod", game.i18n.localize('gs.actor.common.init'));
			if(skill.length){
				const anticipate = skill.filter(skill => skill.name.toLowerCase() === "anticipate");
				if(anticipate.length){
					anticipateBonus = parseInt(anticipate[0].value, 10);
				}
			}
			if(anticipateBonus > 0)
				rollMessage += ` + ${anticipateBonus}`;
			if(rollMod > 0)
				rollMessage += ` + ${rollMod}`;
			else if(rollMod < 0)
				rollMessage += ` - ${Math.abs(rollMod)}`;
		}else if(actorType === 'monster'){
			const container = event.currentTarget.closest('.reveal-rollable');
			if(!container){
				console.error("Error getting monster init container");
				return;
			}
			const initContainer = container.querySelector('.monsterInit');
			if(!initContainer){
				console.error("Couldn't get monster init container");
				return;
			}
			const initValue = initContainer.value;
			const [powerDice, powerMod] = initValue.includes('+') ? initValue.split('+') : [initValue, 0];
			rollMessage = powerDice.trim();
			if(powerMod != 0) rollMessage += ` + ${parseInt(powerMod.trim(), 10)}`;
		}

		this._sendRollMessage(rollMessage, `${game.i18n.localize("gs.actor.common.init")}`);
	}

	async _sixthSenseRoll(event){
		event.preventDefault();
		const actorData = this.actor.system;
		const actorStats = actorData.abilities.calc;
		const actorClasses = actorData.levels.classes;
		const stat = actorStats.ir; // Intelligence reflex bonus
		const skillBonus = this._getSkillBonus("Sixth Sense"); // TODO: Check if this should get bonus from this skill
		let classBonus = 0;

		// Getting Class level bonus
		if(actorClasses.ranger > classBonus){
			classBonus = parseInt(actorClasses.ranger, 10);
		}else if(actorClasses.scout > classBonus){
			classBonus = parseInt(actorClasses.scout, 10);
		}else if(actorClasses.shaman > classBonus){
			classBonus = parseInt(actorClasses.shaman, 10);
		}

		const rollMod = await this._promptStealthChoice("rollMod", game.i18n.localize('gs.dialog.actorSheet.sidebar.buttons.6sense'));
		const rollMessage = this._setRollMessage("2d6", stat, classBonus, skillBonus, rollMod);

		this._sendRollMessage(rollMessage, `${game.i18n.localize("gs.dialog.actorSheet.sidebar.buttons.6sense")}`);
	}

	async _sendRollMessage(rollMessage, flavorMessage){
		try{
			const roll = new Roll(rollMessage);
			await roll.evaluate();

			const diceResults = roll.terms[0].results.map(r => r.result);
			const status = this._checkForCritRolls(diceResults);

			await roll.toMessage({
				speaker: ChatMessage.getSpeaker({actor: this.actor}),
				flavor: `${game.i18n.localize("gs.dialog.rolling")} ${flavorMessage} ${status[1]}`,
			});
		} catch (error) {
			console.error("Error evaluating roll:", error);
		}
	}

	async _luckRoll(event){
		event.preventDefault();

		const rollMod = await this._promptStealthChoice("rollMod", game.i18n.localize('gs.dialog.actorSheet.sidebar.buttons.luck'));
		const skillBonus = this._getSkillBonus("Sixth Sense");
		const rollMessage = this._setRollMessage('2d6', 0, 0, skillBonus, rollMod);

		this._sendRollMessage(rollMessage, `${game.i18n.localize("gs.dialog.actorSheet.sidebar.buttons.luck")}`);
	}

	contextMenu = [
		{
			name: "View",
			icon: '<i class="fas fa-edit"></i>',
			callback: element => {
				const actorData = this.actor;
				const id = element[0].dataset.id;
				const type = element[0].dataset.contexttype;
				let item = actorData.items.get(id);

				// Function to get a skill by ID within an item
				function getSkillFromItem(item, skillId){
					const skills = item.system.skills || [];
					const skillIndex = skills.findIndex( skill => skill._id === skillId );
					return skillIndex !== -1 ? skills[skillIndex] : undefined;
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
				const id = element[0].dataset.id;
				const type = element[0].dataset.contexttype;

				switch(type){
					case 'skill':
						const skill = actor.items.get(id);
						if(!skill){
							console.error("Skill not found for deletion.");
							return;
						}
						actor.deleteEmbeddedDocuments(
							'Item', [id]
						).then(() => {
							// console.log(`GS || ${skill.name} deleted successfully.`);
						}).catch(error => {
							console.error("Error deleting skill:", error);
						});
						break;
					case 'raceSheet':case 'weapon':case 'armor':case 'shield':case 'item':case 'spell':
						const pcTarget = actor.items.get(id);
						if (pcTarget) {
							pcTarget.delete();
						} else {
							console.error("Race item not found for deletion.");
						}
						break;
				}
			}
		}
	];
}
