import res from "express/lib/response";

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
		html.find("input[data-inventory='quantity']").change(this._onUpdateCharQuantity.bind(this));
		html.find("input.skillRankInput").change(this._onUpdateSkillRank.bind(this));
		html.find("label.scoreRoll").click(this._rollStatDice.bind(this));
		html.find(".minStatic").click(this._rollMinionStatic.bind(this));
		html.find(".actorRolls").click(this._actorRolls.bind(this));
		html.find(".attritionCBox").off('click').click(this._updateAttritionFlag.bind(this));
		html.find(".starred").change(this._addRollToFavorites.bind(this));

		new ContextMenu(html, ".contextMenu", this.contextMenu);
	}

	_addRollToFavorites(event){
		//event.preventDefault();
		const container = event.currentTarget.closest(".checksCont");
		const $target = $(event.currentTarget).closest(".checksCont");
		const checkStatus = container.querySelector('.starred').checked;
		const checkName = container.querySelector('.checkName').innerHTML;
		//const index = event.currentTarget.dataset.index;
		const buttonClass = $target.find('button.actorRolls').attr("class");
		const iconClass = $target.find('i').attr("class");

		if(checkStatus){
			this.actor.setFlag('gs', `favorites.${checkName}`, {
				'name': checkName,
				'button': buttonClass,
				'icon': iconClass
			});
		}else{
			this.actor.unsetFlag('gs', `favorites.${checkName}`);
		}
	}

	/**
	 * Looks for a given skill name in the actor's list of items to retrieve the value associated with the current skill level
	 * @param {string} skillName Name of the skill to be searched for, not case sensitive
	 * @returns The value (level) of the given skill
	 */
	_getSkillBonus(skillName){
		const skills = this.actor.items.filter(item => item.type === 'skill');
		if(skills.length){
			const skillBonusValue = skills.filter(skill => skill.name.toLowerCase() === skillName.toLowerCase());
			if(skillBonusValue.length){
				return parseInt(skillBonusValue[0].system.value, 10);
			}else
				return 0;
		}
	}

	/**
	 * Looks for the 'target' piece of HTML code inside of the 'html' sent to the method
	 * @param {*} html Large chunk of HTML to be search over for the target
	 * @param {string} target The target to be found inside of the HTML
	 * @returns The value associated with the target
	 */
	_getRollMod(html, target){
		let rollMod = html.find(`${target}`)[0].value;
		if(!rollMod) rollMod = 0;
		rollMod = parseInt(rollMod, 10);
		return rollMod;
	}

	/**
	 * Prepares the roll message with all associated bonus. The message will resemble this: "2d6 + 1 + 2 +/- 3 + 4 - 5"
	 * @param {string} dice The amount of dice that is being rolled.
	 * @param {int} abilityScore The ability score bonus that should be used.
	 * @param {int} classBonus Class bonus for given roll.
	 * @param {int} skillItemMod Bonus from weapons/armor/shields/etc.
	 * @param {int} promptMod Extra modifier from prompt.
	 * @param {int} fourthMod TBD
	 * @returns Roll message to be evaluated by Foundry.
	 */
	_setRollMessage(dice = "2d6", abilityScore = 0, classBonus = 0, skillItemMod = 0, promptMod = 0, fourthMod = 0){
		let rollMessage = dice, fatigueMod;

		if(this.actor.type === 'character')
			fatigueMod = this.actor.system.fatigue.fatigueMod;
		else
			fatigueMod = 0;

		//console.log(">>> AbilScore", abilityScore, "CB", classBonus, "ItemMod", skillItemMod, "promptMod", promptMod, "fourthMod", fourthMod);

		if(abilityScore > 0)
			rollMessage += `  + ${abilityScore}`;
		if(classBonus > 0) // Class Bonus
			rollMessage += ` + ${classBonus}`;
		if(skillItemMod < 0) // Item/gear +/-
			rollMessage += ` - ${Math.abs(skillItemMod)}`;
		else if(skillItemMod > 0)
			rollMessage += ` + ${skillItemMod}`;
		if(promptMod > 0) // Extra roll modifiers
			rollMessage += ` + ${promptMod}`;
		else if(promptMod < 0)
			rollMessage += ` - ${Math.abs(promptMod)}`;
		if(fourthMod > 0 && fourthMod !== "")
			rollMessage += ` + ${fourthMod}`;
		if(fatigueMod < 0)
			rollMessage += ` - ${Math.abs(fatigueMod)}`;
		return rollMessage;
	}

	/**
	 * Updates the actor's skill rank in the embedded collection of items
	 * @param {*} event The click event
	 * @returns Nothing, used to break method early
	 */
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
		}else if(skillType === 'earned'){
			const skill = items.get(skillId);
			if(!skill){
				console.error("Skill not found.");
            	return;
			}
			skill.update({
				'system.value': rank
			});
			this.actor.render(true);
		}else{
			console.error("Unknown skill type:", skillType);
		}
		// console.log("Check if change took:", this.actor);
	}

	/**
	 * Updates the current item quanity by the value supplied.
	 * @param {*} event The click event
	 */
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

	/**
	 * Updates current fatigue rank by 1
	 * @param {string} rank Current fatigue rank being checked, eg 'rank1', 'rank2', etc.
	 */
	async _updateFatigue(rank){
		const fatigueMin = `system.fatigue.${rank}.min`;
		const fatigueMarked = `system.fatigue.${rank}.marked`;
		const currentMin = this.actor.system.fatigue[rank].min;

		await this.actor.update({
			[fatigueMin]: currentMin + 1,
			[`${fatigueMarked}.${currentMin + 1}`]: true
		});
	}

	/**
	 * Checks through fatigue ranks to find rank is maxed out yet then shifts to the next rank if so.
	 */
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

	/**
	 * Checks the currently clicked attrition check box for the type of checkbox, wounds vs life force, heavy armor and associated skills
	 * @param {*} event The click event
	 */
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
			const skills = this.actor.items.filter(item => item.type === 'skill');
			let encActionSkillValue = this._getSkillBonus('Encumbered Action');

			if(armorWorn.value && (this.actor.system.abilities.calc.se + encActionSkillValue) < armorWorn.x){
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

	/**
	 * Method to help determin if the dice rolled a critical success/failure or a regular result. The critical rates are modified by any skills that are present in the character's items array.
	 * @param {array} diceResults An integer array of dice values
	 * @param {string} label The type of action being checked for skills
	 * @returns Fail/Success/Normal
	 */
	_checkForCritRolls(diceResults, label="", event=""){
		if(diceResults.length === 2){
			let skills, skillValue, critSuccess = 12, critFail = 2, results = [];
			const actorType = this.actor.type;

			// Checking actor type to get skills
			if(actorType === "character"){
				skills = this.actor.items.filter(item => item.type === 'skill');

				// Updating the Critical Success/Failure rate based on the given skill
				const setSuccessFailValues = (skillValue) => {
					console.log("=== Checking skillValue sent", skillValue);
					if(skillValue === 1){ critSuccess = 11; critFail = 5; }
					else if(skillValue === 2){ critSuccess = 11; critFail = 4; }
					else if(skillValue === 3){ critSuccess = 10; critFail = 4; }
					else if(skillValue === 4){ critSuccess = 10; critFail = 3; }
					else if(skillValue === 5){ critSuccess = 9; critFail = 3; }
				};
				const setCritSuccessValues = (skillValue) => {
					if(skillValue < 3) critSuccess = 11;
					else if(skillValue < 5) critSuccess = 10;
					else if(skillValue == 5) critSuccess = 9;
				}
				// Checking over each character skill to modify success rates
				let critSuccessFailSkills = ['alert-.dodge'];
				const critSuccessOnlySkills = ['master of fire', 'master of water', 'master of wind',
					'master of earth', 'master of life'];

				// Setting up info for Slice Attack skill
				if(event != ""){
					const eventID = event.currentTarget.closest('.reveal-rollable').dataset.id;
					const eventItem = this.actor.items.get(eventID);
					let sliceAttr;
					if(eventItem.type === 'weapon'){
						sliceAttr = eventItem.system.effect?.checked[9];
					}
					if(sliceAttr)
						critSuccessFailSkills.push('slice attack-.hitmod');
				}

				for(const skill of skills){
					skillValue = skill.system.value;
					// console.log(">>> Check skill name", skill.name.toLowerCase(), label, critSuccessFailSkills, `${skill.name.toLowerCase()}-${label.toLowerCase()}`);
					// console.log("Truthy?", critSuccessFailSkills.includes(`${skill.name.toLowerCase()}-${label.toLowerCase()}`));
					if(critSuccessFailSkills.includes(`${skill.name.toLowerCase()}-${label.toLowerCase()}`))
						setSuccessFailValues(skillValue);
					else if(critSuccessOnlySkills.includes(`${skill.name.toLowerCase()}`)){
						const element = event.currentTarget.closest('.reveal-rollable').querySelector("#element").value;
						const splitSkillName = skill.name.split(" ");
						if(splitSkillName[2].toLowerCase() === element.toLowerCase())
							setCritSuccessValues(skillValue);
					}
				}
			}

			// Checking dice results vs. crit fail/success otherwise this is a regular result
			if(diceResults[0] + diceResults[1] <= critFail){
				results[0] = 'fail';
				results[1] = `<div class='critFailColor'>${game.i18n.localize("gs.dialog.crits.crit")} ${game.i18n.localize("gs.dialog.crits.fail")}</div>`;
				return results;
			}else if(diceResults[0] + diceResults[1] >= critSuccess){
				results[0] = 'success';
				results[1] = `<div class='critSuccessColor'>${game.i18n.localize("gs.dialog.crits.crit")} ${game.i18n.localize("gs.dialog.crits.succ")}</div>`;
				return results;
			}else {
				results[0] = 'normal';
				results[1] = '';
				return results;
			}
		}
	}

	/**
	 * Method to set specific information in various areas and then evaluate the roll and send to the chat window.
	 * @param {string} dice A string representing the dice to be rolled, eg 1d3, 1d6, 2d6, etc
	 * @param {int} stat An integer value of the ability score bonus for the given roll
	 * @param {int} classBonus An integer for the level of the class that can be used in the roll
	 * @param {int} modifier A value that is usually attached to an item for extra power, eg. Weapon 1d3+2 damage where '+2' is the modifier
	 * @param {string} localizedMessage A string to help make function/method call decisions, eg Weapon, Cast, etc.
	 * @param {int} skillBonus The value of the skill to help determine how much to add to a given roll
	 * @param {int} rollMod Misc. integer value to be added from the window prompt
	 */
	async _rollsToMessage(event, dice, stat, classBonus, modifier, localizedMessage, skillBonus = 0, rollMod = 0, modSelector = ""){
		let rollExpression = `${dice}`;
		const casting = 'spellCast';
		const cssClassType = event.currentTarget?.classList || ["", ""];
		const spellCastCSSCheck = cssClassType[1];

		// Getting roll modifiers from user
		rollMod = await this._promptMiscModChoice("rollMod", localizedMessage);
		if(rollMod != 0) localizedMessage += this._addToFlavorMessage("miscScore", game.i18n.localize('gs.dialog.mods.misc'), rollMod);
		// Setting up roll message
		rollExpression = this._setRollMessage(dice, stat, classBonus, spellCastCSSCheck === casting ? 0 : modifier, rollMod, skillBonus);

		try{
			const roll = new Roll(rollExpression);
			await roll.evaluate();

			const diceResults = roll.terms[0].results.map(r => r.result);
			const status = this._checkForCritRolls(diceResults, modSelector, event);
			let dcCheck = '';

			// Getting dice total plus bonuses to compare to DC stored in Modifier
			let diceTotal = diceResults[0] + diceResults[1] + parseInt(stat, 10) + parseInt(classBonus, 10) + parseInt(skillBonus, 10);

			// Setting up casting results for critical success
			if(spellCastCSSCheck === casting){
				if(diceTotal >= modifier && status[0] != 'fail'){
					if(status[0] === 'success')
						diceTotal += 5;
					dcCheck = `<div class="spellCastSuccess">${game.i18n.localize('gs.dialog.spells.cast')} ${game.i18n.localize('gs.dialog.crits.succ')}</div>`;
				}else{
					dcCheck = `<div class="spellCastFailure">${game.i18n.localize('gs.dialog.spells.cast')} ${game.i18n.localize('gs.dialog.crits.fail')}</div>`;
				}
			}else{
				diceTotal += modifier;
			}

			// Checking skills for Piercing Attack skill and weapon
			const skills = this.actor.items.filter(item => item.type === 'skill');
			// Getting Weapon ID to check for Piercing trait
			const eventID = event.currentTarget.closest('.reveal-rollable').dataset.id;
			const currentWeapon = this.actor.items.get(eventID);
			skills.forEach(skill => {
				if(skill.name.toLowerCase() === "piercing attack"){
					let pierceAmount = currentWeapon.system.effect?.pierce;
					if(pierceAmount){
						pierceAmount *= skill.system.value;
						diceTotal += pierceAmount;
						localizedMessage += this._addToFlavorMessage("skillScore", game.i18n.localize('gs.actor.common.pierc') + " " + game.i18n.localize('gs.actor.monster.atta'), pierceAmount );
					}
				}else if(skill.name.toLowerCase() === 'strong blow: bludgeon' || skill.name.toLowerCase() === 'strong blow: slash'){
					console.log(">>> In SB: Slash check");
					const skillName = skill.name.toLowerCase();
					let strongBlow = skillName === 'strong blow: bludgeon' ? currentWeapon.system.effect?.checked[10] : currentWeapon.system.effect?.checked[11];
					if(strongBlow){
						const weaponSBValue = skillName === 'strong blow: bludgeon' ? currentWeapon.system.effect?.sbBludg : currentWeapon.system.effect?.sbSlash;
						let strBonus = this.actor.system.abilities.primary.str;
						const skillValue = skill.system.value;

						const strBonusMultiplier = skillValue === 1 ? 0.25 : skillValue === 2 ? 0.5 : skillValue === 3 ? 1 : skillValue === 4 ? 1.5 : 2;
						strBonus = Math.floor(strBonus * strBonusMultiplier);

						diceTotal += weaponSBValue + strBonus;
						localizedMessage += this._addToFlavorMessage("skillScore", game.i18n.localize(skillName === 'strong blow: bludgeon' ? 'gs.gear.weapons.effects.sbBludg' : 'gs.gear.weapons.effects.sbSlash'), weaponSBValue + strBonus );
					}
				}
			});


			// Checking if a power/damage roll is coming through to remove Effectiveness message
			if(modSelector != ".power")
				localizedMessage += `<div class="spellEffectivenessScore">${game.i18n.localize('gs.gear.spells.efs')}: ${diceTotal}</div>`;
			let chatFlavor = `<div class="customFlavor">${localizedMessage}`;
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

	/**
	 * Sends a quick message to the chat window for the average dice value rather than rolling
	 * @param {int} value The amount of the basic score to send as a quick chat message
	 * @param {string} type Flavor text of the average dice roll being sent
	 */
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

	/**
	 * Simple method to roll calculated ability scores to the chat window for random events and GM calls
	 * @param {*} event The click event
	 */
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
				this._rollsToMessage(event, baseDice, bonusScore, 0, 0, labelText);
			}else{
				console.error("Input field not found.");
			}
		}else{
			console.error("Container with '.calcScore' class not found.");
		}
	}

	/**
	 * Simple method to find the hidden input item type and return it for filtering purposes
	 * @param {html} container The HTML container
	 * @returns Hidden input item type
	 */
	_getItemType(container){
		return container.querySelector('input[type="hidden"].type');
	}

	/**
	 * Sorts through item/spell to help determin what class level to use for the bonus and apply it to the roll message
	 * @param {string} typeHolder The Type of the item/spell being used with a variety of information for items or spell name
	 * @param {string} itemType Either weapon/armor/shield/cast to help decide how to proceed ahead with calculations
	 * @returns The bonus for the class level of the item/spell being used
	 */
	_getClassLevelBonus(typeHolder, itemType){
		let [type, weight] = "", className = "";
		if(itemType != 'cast') {
			[type, weight] = typeHolder.value.toLowerCase().split('/').map(item => item.trim());
		}
		const {fighter = 0, monk = 0, ranger = 0, scout = 0, sorcerer = 0, priest = 0, dragon = 0, shaman = 0 } = this.actor.system.levels.classes;
		const includesAny = (words, text) => words.some(word => text.includes(word));
		let bonus = 0;

		//console.log(">>> Checking types", typeHolder, itemType);

		// TODO: Find any skills that influence class type hit checks to add here.
		if(itemType === 'weapon'){
			if(type === 'projectile' && ranger > 0){
				bonus += ranger;
				className = game.i18n.localize('gs.actor.character.rang');
			}else if(type === 'throwing'){
				if(monk > bonus){
					bonus += monk;
					className = game.i18n.localize('gs.actor.character.monk');
				}else if(ranger > bonus){
					bonus += ranger;
					className = game.i18n.localize('gs.actor.character.rang');
				}else if(scout > bonus){
					bonus += scout;
					className = game.i18n.localize('gs.actor.character.scou');
				}
			}else{ // Assuming type is a melee weapon
				const fighterWeapons = ["sword", "ax", "spear", "mace"];
				const monkWeapons = ["close-combat", "staff"];
				const scoutWeapons = ["sword", "ax", "spear", "mace", "close-combat", "staff"];
				if (fighter > bonus && includesAny(fighterWeapons, type)) {
					bonus += fighter;
					className = game.i18n.localize('gs.actor.character.figh');
				} else if (monk > bonus && includesAny(monkWeapons, type)) {
					bonus += monk;
					className = game.i18n.localize('gs.actor.character.monk');
				} else if (scout > bonus && includesAny(scoutWeapons, type) && weight === 'light') {
					bonus += scout;
					className = game.i18n.localize('gs.actor.character.scou');
				}
			}
		}else if(itemType === 'armor'){
			let armorType = type.match(/\((.*?)\)/);
			if(armorType && armorType[1]){
				const isCloth = armorType[1] === 'cloth';
				if(fighter > bonus){
					bonus += fighter;
					className = game.i18n.localize('gs.actor.character.figh');
				}else if(monk > bonus && isCloth){
					bonus += monk;
					className = game.i18n.localize('gs.actor.character.monk');
				}else if(scout > bonus && weight === 'light'){
					bonus += scout;
					className = game.i18n.localize('gs.actor.character.scou');
				}
			}else{
				console.error("Not text found in type from hidden input");
			}
		}else if(itemType === 'shield'){
			if(fighter > bonus){
				bonus += fighter;
				className = game.i18n.localize('gs.actor.character.figh');
			}else if(scout && weight === 'light'){
				bonus += scout;
				className = game.i18n.localize('gs.actor.character.scou');
			}
		}else if(itemType === 'cast'){
			typeHolder = typeHolder.value;
			if(typeHolder.toLowerCase() === "words of true power"){
				bonus += sorcerer;
				className = game.i18n.localize('gs.actor.character.sorc');
			}else if(typeHolder.toLowerCase() === "miracle"){
				bonus += priest;
				className = game.i18n.localize('gs.actor.character.prie');
			}else if(typeHolder.toLowerCase() === "ancestral dragon"){
				bonus += dragon;
				className = game.i18n.localize('gs.actor.character.dPri');
			}else if(typeHolder.toLowerCase() === "spirit arts"){
				bonus += shaman;
				className = game.i18n.localize('gs.actor.character.sham');
			}
		}
		return {bonus, className};
	}

	/**
	 * Adds a string to the chat message to show what is modifying the final dice results and how
	 * @param {string} cssClass class name to color message
	 * @param {JSON} skill the skill for associated information
	 * @param {int} amount a value modifying final dice results
	 * @returns A string to be added to the chat message
	 */
	_addStringToChatMessage(cssClass, skill, amount){
		return  `<div class="${cssClass} specialRollChatMessage">${skill.name}: ${amount}</div>`;
	}

	/**
	 * Gathers specific information for character or monster rolls and then sends the message out to the chat window
	 * @param {*} event The click event
	 * @param {string} modSelector They type of modifier to be used such at hit/block/dodge checks, power/damage attacks, etc.
	 * @param {string} baseDice Dice to be used in the roll, usually either: 1d3, 1d6, or 2d6, can be more in future updates
	 * @param {string} localizedMessage Message to be used in the flavor text of the roll and chat window
	 * @param {string} itemType Help determine if the roll is part of a weapon/armor/shield for characters, otherwise ignored
	 * @returns Nothing, used to break the method early in certain cases
	 */
	async _rollWithModifiers(event, modSelector, baseDice, localizedMessage, itemType){
		event.preventDefault();
		const container = event.currentTarget.closest('.reveal-rollable');
		const actorType = this.actor.type;
		let diceToRoll = baseDice, typeHolder, stat = 0, classBonus = 0, modifier, diceNotation, skills, skillBonus = 0;

		//console.log(">>> Actor Type", actorType, modSelector);

		if (!container) {
			console.error("Container with '.reveal-rollable' class not found.");
			return;
		}

		const modElement = container.querySelector(modSelector);
		if (!modElement) {
			console.error(`${localizedMessage} modifier not found.`);
			return;
		}

		diceNotation = this._getDiceNotation(modElement, actorType, modSelector);
		if(!diceNotation) return;

		if(actorType === 'character'){
			stat = this._getStatForItemType(itemType, modSelector, container);
			if(stat > 0) localizedMessage += this._addToFlavorMessage("abilScore", game.i18n.localize('gs.actor.character.abil'), stat);

			const { bonus, className} = this._getClassLevelBonus(this._getItemType(container), itemType);
			classBonus = bonus;
			if(classBonus > 0) localizedMessage += this._addToFlavorMessage("levelScore", className, classBonus);

			skills = this.actor.items.filter(item => item.type === 'skill');
			if(modSelector === '.power'){
				const {dice, mod} = this._parseDiceNotation(diceNotation);
				diceToRoll = dice;
				modifier = mod;
				if(this.actor.system.levels.classes.monk > 0){
					typeHolder = this._getItemType(container);
					const {weaponName, type} = this._parseWeaponType(container, typeHolder);
					if(weaponName.toLowerCase() === 'barehanded')
						skillBonus += this._calculateIronFistBonus(skills, 'iron fist');
					if(type === 'close-combat')
						skillBonus += await this._calculateBurstOfStrengthBonus(skills);
				}
			}else if(['.hitMod', '.dodge', '.blockMod', '.spellDif'].includes(modSelector)){
				modifier = parseInt(modElement.textContent, 10);
				if(modSelector === '.dodge' || modSelector === '.blockMod'){
					localizedMessage += this._addToFlavorMessage("armorDodgeScore", game.i18n.localize('gs.gear.equipment'), modifier)
					const {modifier: mod, localizedMessage: message} = modSelector === '.dodge'
						? this._calculateDodgeModifier(modifier, skills, localizedMessage)
						: this._calculateBlockModifier(modifier, skills, localizedMessage);
					modifier = mod;
					localizedMessage = message;
				}else if(modSelector === '.hitMod'){
					const {modifier: mod, localizedMessage: message} = await this._calculateMowDownModifier(container, skills, modifier, localizedMessage);
					modifier = mod;
					localizedMessage = message;
				}else if(modSelector === '.spellDif'){
					const spellID = container.dataset.id;
					const {skillBonus: bonus, localizedMessage: message} = await this._calculateSpellExpertise(skills, localizedMessage, spellID);
					skillBonus += bonus;
					localizedMessage = message;
				}
			}
			if(modifier != 0 && modSelector != '.spellDif')
				localizedMessage += this._addToFlavorMessage("rollScore", game.i18n.localize('gs.dialog.mods.mod'), modifier);
		}else if(actorType === 'monster'){
			const {dice, mod} = this._parseDiceNotation(diceNotation);
			diceToRoll = dice;
			modifier = mod;
		}

		this._rollsToMessage(event, diceToRoll, stat, classBonus, modifier, localizedMessage, skillBonus, 0, modSelector);
	}

	/**
	 * Sets up a simple return statement to add the correct items and values to the localized message for debugging and player knowledge
	 * @param {string} cssClass Class string to color the message
	 * @param {*} labelName What is modifying the the dice roll
	 * @param {*} labelMessage How much is being modified
	 * @returns A string to be added to the localized message
	 */
	_addToFlavorMessage(cssClass, labelName, labelMessage){
		return `<div class="${cssClass} specialRollChatMessage">${labelName}: ${labelMessage}</div>`;
	}

	/**
	 * Helps determine if the dice/value is from a monster/character and how to proceed in extracting the proper value.
	 * @param {variable} modElement Containers either an int (monsters) or string (character)
	 * @param {string} actorType Either 'monster' or 'character' to determine dice values
	 * @param {string} modSelector CSS string to help identify what kind of value is being pulled
	 * @returns The dice being used in the roll or a value to modifier the dice roll
	 */
	_getDiceNotation(modElement, actorType, modSelector){
		if(actorType === 'monster' && ['.hitMod', '.boss.dodge', '.boss.block', '.boss.spellRes', '.power', '.moraleCheck'].includes(modSelector)){
			const diceNotation = modElement.value;
			if(diceNotation != 0)
				return diceNotation;
			else{
				ui.notifications.info(`The check has a value of 0 or undefined and cannot be rolled`);
            	return null;
			}
		}else if(actorType === 'character')
			return modElement.textContent;
		return null;
	}

	/**
	 * Helps determine the dice being sent to the roller  where 'N' is the number of dice being rolled and '3/6 is either a 3-sided or 6-sided die.
	 * @param {string} diceNotation A dice notation in either "Nd3/6 + N" or "Nd3/6"
	 * @returns The dice to roll and any modifers
	 */
	_parseDiceNotation(diceNotation){
		let [dice, mod] = diceNotation.includes('+') ? diceNotation.split('+') : [diceNotation, 0];
		if(dice != "1d6" || dice != "2d6" || dice != "1d3"){
			// Checks for moral bonus being a solo number
			mod = dice;
			dice = "2d6";
		}
		return {
			dice: dice.trim(),
			mod: parseInt(mod === 0 ? 0 : mod.trim(), 10)
		};
	}

	/**
	 * Helps find the name and the type of the weapon by extracting it's parts from the HTML provided
	 * @param {html} container The html block of the weapon to parse
	 * @param {string} typeHolder Type of weapon being sent, such as "One-Handed Sword / Light"
	 * @returns The name of the weapon and it's type (excluding weight)
	 */
	_parseWeaponType(container, typeHolder){
		const [type, weight] = typeHolder.value.toLowerCase().split('/').map(item => item.trim());
		const weaponName = container.querySelector('div.name').innerHTML.split(" ")[0].trim();
		return { weaponName, type};
	}

	/**
	 * Searches through the players skills for the Spell Expertise skill and compares it to the spell being cast for bonuses.
	 * @param {JSON} skills An array of JSON skill objects
	 * @param {string} localizedMessage A string message to output to the chat window
	 * @param {string} spellID The idea of the spell being cast
	 * @returns Updated skill bonus value and localized message with skill information.
	 */
	_calculateSpellExpertise(skills, localizedMessage, spellID){
		const spellTypes = ['Spell Expertise: Attack Spells', 'Spell Expertise: Imbuement Spells', 'Spell Expertise: Creation Spells', 'Spell Expertise: Control Spells', 'Spell Expertise: Healing Spells', 'Spell Expertise: General Spells'];
		const spell = this.actor.items.get(spellID);
		let skillBonus = 0;
		skills.forEach(skill => {
			for(let x = 0; x < spellTypes.length; x++){
				const spellSplit = spellTypes[x].split(" ");
				if(skill.name.toLowerCase() === spellTypes[x].toLowerCase() && spell.system.styleChoice === spellSplit[2]){
					skillBonus = skill.system.value;
					localizedMessage += this._addStringToChatMessage("skillScore", skill, skillBonus);
				}
			}
		});
		return {skillBonus, localizedMessage};
	}

	/**
	 * Special method only used to find the skill bonus for the Iron Fist monk (fighter) skill
	 * @param {JSON} skills An array of JSON objects
	 * @param {string} skillName Name of skill to find
	 * @returns Skill bonus for the associated skill
	 */
	_calculateIronFistBonus(skills, skillName){
		let skillBonus = 0;
		for(const skill of skills){
			if(skill.name.toLowerCase === skillName){
				switch (skill.system.value) {
					case 1:
					case 2:
						skillBonus += skill.system.value;
						break;
					case 3:
					case 4:
						skillBonus += skill.system.value + Math.floor(skill.system.value / 2);
						break;
					case 5:
						skillBonus += skill.system.value + Math.round(skill.system.value / 2);
						break;
				}
			}
		}
		return skillBonus;
	}

	/**
	 * Finds the skill bonus associated with the monk skill Burst of Strength and modifiers the character after selection.
	 * @param {JSON} skills An array of JSON objects
	 * @returns The skill bonus int value
	 */
	async _calculateBurstOfStrengthBonus(skills) {
		let skillBonus = 0;
		for(const skill of skills){
			if(skill.name.toLowerCase() === 'burst of strength'){
				switch (skill.system.value) {
					case 1: skillBonus = 1; break;
					case 2: skillBonus = 2; break;
					case 3: skillBonus = "1d3"; break;
					case 4:
					case 5: skillBonus = "1d6"; break;
				}
				const powerBonus = await this._promptFatigueForPower();
				if(powerBonus > 0){
					for (let x = 0; x < powerBonus; x++)
						await this._checkFatigueRanks();
					if (skill.system.value <= 2)
						skillBonus += powerBonus;
					else if (skill.system.value <= 4)
						skillBonus += `+${powerBonus}`;
					else
						skillBonus += `+${powerBonus * 2}`;
				}
			}
		}
		return skillBonus;
	}

	/**
	 * Updates the dodge modifier when this roll/check is being made. Adds more value if the character has the Martial Arts skill
	 * @param {int} modifier Extra modifier value for the dice roll
	 * @param {JSON} skills An array of JSON objects
	 * @param {string} localizedMessage Flavor message to display in the chat window
	 * @returns Updated modifier and localized message
	 */
	_calculateDodgeModifier(modifier, skills, localizedMessage){
		const armor = this.actor.items.filter(item => item.type === 'armor');
		const strEnd = this.actor.system.abilities.calc.se;
		const {monk, scout, fighter} = this.actor.system.levels.classes;

		console.log("+++ Check initial mod", modifier);

		// Checking if character is wearing heavy armor and adjusting as needed
		if(armor[0].system.heavy.value && strEnd >= armor[0].system.heavy.y)
			modifier = Math.floor(modifier / 2);

		// Helper function to return bonus Parry values on gear
		const checkGear = (skill) => {
			const shield = this.actor.items.filter(item => item.type === 'shield');
			const weapons = this.actor.items.filter(item => item.type === 'weapon');
			let highestParry = 0, highestWeapon = 0;

			shield.forEach(item => {
				if(item.system.effect?.parry != undefined){
					if(item.system.effect.parry > highestParry)
						highestParry = item.system.effect.parry;
				}
			});
			weapons.forEach(item => {
				if(item.system.effect?.parry != undefined){
					if(item.system.effect.parry > highestWeapon)
						highestWeapon = item.system.effect.parry;
				}
			});
			if(skill.system.value > 3)
				return highestParry += highestWeapon;
			else
				highestParry >= highestWeapon ? null : highestParry = highestWeapon;
			return highestParry;
		};

		// Helper function to add skill bonus and message
		const addSkillBonus = (skill, minLevel, requiredClassLevel, bonusModifier = (val) => val) => {
			const skillValue = skill.system.value;
			let gearBonus = 0;
			if(skillValue <= minLevel - 1 || (skillValue >= minLevel && requiredClassLevel >= 7)){
				if(skill.name.toLowerCase() === 'parry'){
					gearBonus = checkGear(skill);
					modifier += gearBonus
				}
				const adjustedModifier = bonusModifier(skillValue);
				modifier += adjustedModifier;
				localizedMessage += this._addStringToChatMessage("skillScore", skill, adjustedModifier + gearBonus);
			}else
				ui.notifications.warn(`Your ${skill.name} level does not meet the requirements!`);
		};

		// Process skills
		skills.forEach(skill => {
			switch(skill.name.toLowerCase()){
				case 'martial arts': addSkillBonus(skill, 4, Math.max(monk, scout)); break;
				case 'parry': addSkillBonus(skill, 4, fighter, (val) => val - 1); break;
			}
		});

		return {modifier, localizedMessage};
	}

	/**
	 * Searches through the character's skills to find the Block skill and update the modifier as needed.
	 * @param {int} modifier The value of the current modifier for the dice roll
	 * @param {JSON} skills An array of JSON objects containing the skill in question
	 * @param {string} localizedMessage The message to be added to the flavor text of the chat window
	 * @returns Updated modifier and localized message
	 */
	_calculateBlockModifier(modifier, skills, localizedMessage){
		skills.forEach(skill => {
			if(skill.name.toLowerCase() === 'shields'){
				modifier += skill.system.value;
				localizedMessage += this._addStringToChatMessage("skillScore", skill, skill.system.value);
			}
		});
		return {modifier, localizedMessage};
	}

	/**
	 * Used in tandem with the Mod Down skill for two-handed slash/bludgeoning weapons. Updates the modifier and localized message if the skill is present.
	 * @param {HTML} container The weapon HTML container
	 * @param {JSON} skills An array of JSON objects
	 * @param {int} modifier The modifier value to be added to the dice roller
	 * @param {string} localizedMessage A flavor message for the chat window
	 * @returns Updated modifier and localized message
	 */
	async _calculateMowDownModifier(container, skills, modifier, localizedMessage){
		for(const skill of skills){
			if(skill.name.toLowerCase() === 'mow down'){
				const weaponUse = container.querySelector('.weaponUse').value;
				const weaponAttr = container.querySelector('.weaponAttr').value;
				const weaponAttrSplit = weaponAttr.split('/');
				const attributes = ['Slash', 'Bludgeoning'];
				if (weaponUse.toLowerCase() === 'two-handed' && weaponAttrSplit.some(attr => attributes.includes(attr))) {
					const modHitPen = await this._promptMiscModChoice("mowDown", skill.system.value);
					modifier += modHitPen;
					localizedMessage += this._addStringToChatMessage("skillScore", skill, modHitPen);
				}
			}
		}
		return {modifier, localizedMessage};
	}

	/**
	 * Determines what calculated ability score to use for the given item type of weapon, armor/shield, or casting
	 * @param {string} itemType Identifier for the type of item being used in the roll
	 * @param {string} modSelector CSS class being used to identify what type of value to use
	 * @returns A value from the characters calculated abilities
	 */
	_getStatForItemType(itemType, modSelector, container){
		const actorCalcStats = this.actor.system.abilities.calc;
		switch(itemType){
			case 'weapon': return modSelector === '.power' || modSelector === '.spellRes' ? 0 : actorCalcStats.tf;
			case 'armor': case 'shield': return actorCalcStats.tr;
			case 'cast':
				const school = container.querySelector("input[type='hidden']").value;
				return school.toLowerCase() === "words of true power" ? actorCalcStats.if : actorCalcStats.pf;
			default: return 0;
		}
	}

	/**
	 * A simple method that pushes static minion data to the chat window
	 * @param {*} event The click event
	 * @returns Nothing and break out of the method early if nothing is found
	 */
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

	/**
	 * Prompts the user with a window to set the amount of healing to be done
	 * @param {string} healType Helps determin what language to use in the prompt: healAttrition or healFatigue
	 * @returns A value to be used to heal the selected track
	 */
	_promptHealingAmount(healType){
		let healingTitle = game.i18n.localize('gs.actor.character.heal') + " ";
		if(healType === 'healAttrition')
			healingTitle += game.i18n.localize('gs.actor.character.attr');
		else if(healType === 'healFatigue')
			healingTitle += game.i18n.localize('gs.actor.character.fatW');
		else if(healType === 'healing')
			healingTitle += game.i18n.localize('gs.actor.character.wounds');

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

	/**
	 * The method will either heal Attrition or Fatigue based on the parameter sent in.
	 * @param {string} healType The word to heal either attrition or fatigue
	 */
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
			}else if(healType === 'healFatigue'){
				const fatigueTracks = this.actor.system.fatigue;
				const ranks = ['rank5', 'rank4', 'rank3', 'rank2', 'rank1'];

				for(const rank of ranks){
					const currentMin = this.actor.system.fatigue[rank].min;

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
			}else if(healType === 'healing'){
				const skills = this.actor.items.filter(item => item.type === 'skill');
				let skillMod = 0;

				for(const skill of skills){
					if(skill.name.toLowerCase() === 'first aid')
						skillMod += skill.system.value;
					if(skill.name.toLowerCase() === 'healing affinity')
						skillMod += skill.system.value * 2;
				}

				let healAmount = this.actor.system.lifeForce.min - amountToHeal - skillMod;
				if(healAmount < 0)
					healAmount = 0;

				this.actor.update({
					'system.lifeForce.min': healAmount
				});
			}
		}
	}

	/**
	 * A sorting function for actor sheet rolls
	 * @param {*} event The click event
	 */
	_actorRolls(event){
		const cssClassType = event.currentTarget.classList;
		const classType = cssClassType[1];

		const rollMappings = {
			'toHit': { mod: '.hitMod', dice: '2d6', label: 'gs.actor.character.hit', type: 'weapon' },
			'damage': { mod: '.power', dice: '2d6', label: 'gs.gear.spells.att', type: 'weapon' },
			'avoid': { mod: '.dodge', dice: '2d6', label: 'gs.actor.character.dodge', type: 'armor' },
			'block': { mod: '.blockMod', dice: '2d6', label: 'gs.actor.character.block', type: 'shield' },
			'charSR': { mod: '.spellRes', dice: '2d6', label: 'gs.actor.common.spRe', type: 'resistance' },
			'spellCast': { mod: '.spellDif', dice: '2d6', label: 'gs.dialog.spells.spUse', type: 'cast' },
			'bossHit': { mod: '.hitMod', dice: '2d6', label: 'gs.actor.character.hit', type: 'weapon' },
			'bossDodge': { mod: '.boss.dodge', dice: '2d6', label: 'gs.actor.character.dodge', type: 'armor' },
			'bossBlock': { mod: '.boss.block', dice: '2d6', label: 'gs.actor.character.block', type: 'armor' },
			'morale': { mod: '.moraleCheck', dice: '2d6', label: 'gs.actor.monster.mora', type: 'morale' },
			'bossSR': { mod: '.boss.spellRes', dice: '2d6', label: 'gs.actor.common.spRe', type: 'resistance' },
			'mPower': { mod: '.power', dice: '2d6', label: 'gs.gear.spells.att', type: 'weapon' },
		};

		const specialRolls = ['stealth', 'sixthSense', 'lucky', 'firstAid', 'initiative', 'handiwork', 'swim', 'climbF',
			'acrobatics', 'jump', 'provoke', 'moveObs', 'moveRes', 'strRes', 'psyRes', 'intRes', 'strength', 'escape',
			'climbM', 'monsterKnow', 'generalKnow', 'magicalKnow', 'observe', 'longDistance', 'tacMove', 'spellMaint'];
    	const healActions = ['healAttrition', 'healFatigue', 'healing'];

		if (rollMappings[classType]) {
			const { mod, dice, label, type } = rollMappings[classType];
			this._rollWithModifiers(event, mod, dice, game.i18n.localize(label) + " " + game.i18n.localize('gs.charSheet.statsPage.checks'), type);
		} else if (healActions.includes(classType)) {
			this._healAttrFatigue(classType);
		} else if (classType === 'initiative') {
			this._rollInitiative(event);
		} else if (specialRolls.includes(classType)) {
			this._specialRolls(event, classType, classType.charAt(0).toUpperCase() + classType.slice(1).replace(/([A-Z])/g, ' $1').trim());
		} else {
			console.error(`GS _actorRolls || ${classType} was not found in the method.`);
		}
	}

	/**
	 * Prompts the Monk class user with a choice to use fatigue for extra damage during combat with the Burst of Strength skill
	 * @returns A promised value depending on select amount and skill
	 */
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

	/**
	 * Helps determine to prompt the user with either a Stealth or Misc Modifier message and get any roll modifiers not apart of skills or other variables.
	 * @param {string} promptType Decides to prompt player with a Misc Modifier or Stealth Choice
	 * @param {string} promptName Used with Misc Mod to help give flavor to the rolled message
	 * @returns A promised value to be added to the roll message
	 */
	async _promptMiscModChoice(promptType, promptName = ''){
		return new Promise ((resolve) => {
			let dialogContent, promptTitle, buttonOne, buttonTwo, buttonThree, buttons;

			switch(promptType){
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
				case 'moveRes':
				case 'strRes':
				case 'psyRes':
				case 'intRes':
				case 'strength':
				case 'stealth':
				case 'acrobatics':
				case 'monsterKnow':
					const header = game.i18n.localize(`gs.dialog.${promptType}.header`);
					const paragraph = game.i18n.localize(`gs.dialog.${promptType}.label`);
					const promptMapping = {
						'moveRes': {word1: 'str', word2: 'foc', word3: 'tec', word4: 'foc', ability1: 'sf', ability2: 'tf'},
						'strRes': {word1: 'str', word2: 'ref', word3: 'str', word4: 'end', ability1: 'sr', ability2: 'se'},
						'psyRes': {word1: 'psy', word2: 'ref', word3: 'psy', word4: 'end', ability1: 'pr', ability2: 'pe'},
						'intRes': {word1: 'int', word2: 'ref', word3: 'int', word4: 'end', ability1: 'ir', ability2: 'ie'},
						'strength': {word1: 'str', word2: 'foc', word3: 'str', word4: 'end', ability1: 'sf', ability2: 'se'},
						'monsterKnow': {word1: 'int', word2: 'foc', word3: 'int', word4: 'ref', ability1: 'if', ability2: 'ir'},
						'stealth': {word1: 'tec', word2: 'foc', word3: 'tec', word4: 'end', word5: 'tec', word6: 'ref', ability1: 'tf', ability2: 'te', ability3: 'tr'},
						'acrobatics': {word1: 'tec', word2: 'foc', word3: 'tec', word4: 'end', word5: 'tec', word6: 'ref', ability1: 'tf', ability2: 'te', ability3: 'tr'},
					};

					const { word1, word2, word3, word4, word5, word6, ability1, ability2, ability3 } = promptMapping[promptType] || {};

					dialogContent = `
						<h3>${header}</h3>
						<p>${paragraph}</p>`;
					promptTitle = game.i18n.localize(`gs.dialog.${promptType}.title`);

					const createButton = (labelWords, ability) => ({
						label: game.i18n.localize(`gs.actor.character.${labelWords[0]}`) + " " + game.i18n.localize(`gs.actor.character.${labelWords[1]}`),
						callback: () => resolve(this.actor.system.abilities.calc[ability])
					});

					buttonOne = createButton([word1, word2], ability1);
					buttonTwo = createButton([word3, word4], ability2);

					if(promptType === 'stealth' || promptType === 'acrobatics'){
						buttonThree = createButton([word5, word6], ability3);
					}
					break;
				case 'mowDown':
					const skillValue = parseInt(promptName, 10);
					const mDHeader = game.i18n.localize(`gs.dialog.${promptType}.header`);
					let mDParagraph = game.i18n.localize(`gs.dialog.${promptType}.label0`);

					mDParagraph += skillValue < 5 ?
						game.i18n.localize(`gs.dialog.${promptType}.label1`) + (skillValue - 1) :
						game.i18n.localize(`gs.dialog.${promptType}.label2`) + 5;

					dialogContent = `
						<h3>${mDHeader}</h3>
						<p>${mDParagraph}</p>
						<label>${game.i18n.localize(`gs.dialog.${promptType}.targets`)}</label>
						<select id="targetSelect" style="margin-bottom:10px;">
							${[1,2,3,4,5].map(value =>
								value <= skillValue + 1 ? `<option value"${value}">${value}</option>` : ""
							).join('')}
						</select>`;

					promptTitle = game.i18n.localize(`gs.dialog.${promptType}.title`);
					buttonOne = {
						label: game.i18n.localize(`gs.dialog.mods.addMod`),
						callback: (html) => {
							const selectedValue = parseInt(html.find('#targetSelect').val(), 10);
							let returnValue = 0;

							// Finding amount to be returned when attacking 2+ targets
							if (selectedValue > 1) {
								returnValue = -4;
								if (selectedValue > 2) {
									returnValue += (selectedValue - 2) * (skillValue < 5 ? -2 : -1);
								}
							}

							resolve(returnValue);
						}
					};
					buttonTwo = {
						label: game.i18n.localize('gs.dialog.cancel'),
						callback: () => resolve(0)
					};
					break;
				case 'returnSpell':
					const spells = this.actor.items.filter(item => item.type === 'spell');
					const header1 = game.i18n.localize(`gs.dialog.spellMaint.header`);
					promptTitle = game.i18n.localize(`gs.dialog.spellMaint.title`);
					dialogContent = `<h3>${header1}</h3>`;

					const createSpellButton = (spell) => ({
						label: spell.img + " " + spell.name,
						callback: () => resolve(spell)
					});

					// Finishe for loop here

					break;
				default:
					break;
			}

			if(promptType != 'returnSpell')
				buttons = { buttonOne: buttonOne, buttonTwo: buttonTwo };
			else
				buttons = {}

			if(promptType === 'stealth' || promptType === 'acrobatics'){
				buttons.buttonThree = buttonThree;
			}

			new Dialog({
				title: promptTitle,
				content: dialogContent,
				buttons: buttons,
				default: "buttonOne",
				close: () => "",
			}).render(true);
		});
	}

	/**
	 * Helps roll initiative for both characters and monsters
	 * @param {*} event The click event
	 * @returns Nothing to break out of method early
	 */
	async _rollInitiative(event){
		event.preventDefault();

		const actorType = this.actor.type;
		let anticipateBonus = 0, rollMessage = "2d6";

		if(actorType === 'character'){
			const rollMod = await this._promptMiscModChoice("rollMod", game.i18n.localize('gs.actor.common.init'));
			anticipateBonus = this._getSkillBonus('Anticipate');
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

	/**
	 * A basic method to send Rolled messages to the chat window
	 * @param {string} rollMessage A string of characters to be evaluated: eg '2d6 + 2 - 1'
	 * @param {string} flavorMessage A message to go along with the roll to understand what the roll is for
	 */
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

	/**
	 * Returns the highest class level bonus for a given special roll type
	 * @param {string} rollType The type of roll being made
	 * @returns Highest class level associated with the roll, if any
	 */
	_specialRollsClassBonus(rollType){
		switch(rollType){
			case 'luck': case 'swim': case 'strRes': case 'longDistance': case 'tacMove': return;
			case 'psyRes': case 'intRes':
				const advLevel = this.actor.system.levels.adventurer;
				const dragonLevel = this.actor.system.levels.classes.dragon;
				if(advLevel >= dragonLevel) return parseInt(advLevel, 10);
				else return parseInt(dragonLevel, 10);					;
		}

		let bonus = 0;
		const actorClasses = this.actor.system.levels.classes;

		// Defining class mappings for each roll type
		const rollTypeMapping = {
			'firstAid': ['ranger', 'priest', 'dragon'],
			'sixthSense': ['ranger', 'scout', 'shaman'],
			'stealth': ['ranger', 'scout'],
			'handiwork': ['ranger', 'scout'],
			'jump': ['monk', 'ranger', 'scout'],
			'acrobatics': ['monk', 'ranger', 'scout'],
			'climbF': ['ranger', 'scout'],
			'provoke': ['fighter', 'monk'],
			'moveObs': ['fighter'],
			'moveRes': ['fighter', 'monk', 'scout'],
			'strength': ['fighter', 'monk'],
			'escape': ['fighter', 'monk'],
			'climbM': ['fighter', 'monk'],
			'monsterKnow': ['sorcerer', 'priest', 'dragon', 'shaman'],
			'generalKnow': ['sorcerer'],
			'magicalKnow': ['sorcerer'],
			'observe': ['ranger', 'scout'],
		}

		// Getting the relevant classes for the roll type
		const relevantClasses = rollTypeMapping[rollType];

		if(relevantClasses){
			relevantClasses.forEach(className => {
				if((actorClasses[className]) > bonus){
					bonus = parseInt(actorClasses[className], 10);
				}
			});
		}else{
			console.error(`GS _specialRollsClassBonus || Unknown roll type: ${rollType}`);
		}

		return bonus;
	}

	/**
	 * Finds the proper calculated ability score for a given string
	 * @param {string} calcAbilityScore A two character string representing a calculated ability score: E.G. se = Strength Endurance
	 * @returns A number associated with the given string
	 */
	_findTheCalcAbilityScore(calcAbilityScore){
		const abilityCalcScores = this.actor.system.abilities.calc;
		return abilityCalcScores[calcAbilityScore];
	}

	/**
	 * Returns the overall adventurer level rather than a class level
	 * @returns Adventurer level
	 */
	_getAdventurerLevel(){
		return this.actor.system.levels.adventurer;
	}

	/**
	 * Sorts the special roll from the character sheet side bar and helps get all associated bonuses for this roll check
	 * @param {*} event The event of the click
	 * @param {string} rollType The type of roll being made, must be lowercase
	 * @param {string} skillName The skill associated with the roll for any applicable bonus
	 */
	async _specialRolls(event, rollType, skillName){
		event.preventDefault();
		let abilityScore = 0, dice = '2d6';
		let dialogMessage = game.i18n.localize(`gs.dialog.actorSheet.sidebar.buttons.${rollType}`);
		let maintainedSpell;
		const intelligenceFocusChecks = ['generalKnow', 'magicalKnow', 'observe', 'tacMove'];
		const intelligenceReflexChecks = ['sixthSense'];
		const intelligenceEduranceChecks = [];
		const psycheReflexChecks = ['provoke'];
		const pyscheEnduranceChecks = [];
		const strengthReflexChecks = ['moveObs'];
		const strengthFocusChecks = ['escape'];
		const strengthEnduranceChecks = ['climbM', 'longDistance'];
		const techniqueFocusChecks = ['firstAid', 'handiwork', 'swim', 'climbF', 'jump'];
		const adventurerLevel = ['swim', 'strRes', 'longDistance', 'tacMove'];
		const specialPrompts = ['moveRes', 'strRes', 'psyRes', 'intRes', 'strength', 'stealth', 'monsterKnow', 'acrobatics'];
		const abilityMapping = {
			ir: intelligenceReflexChecks, if: intelligenceFocusChecks, ie: intelligenceEduranceChecks,
			tf: techniqueFocusChecks, pr: psycheReflexChecks, pe: pyscheEnduranceChecks,
			sr: strengthReflexChecks, se: strengthEnduranceChecks, sf: strengthFocusChecks
		};

		if(rollType === 'spellMaint'){
			maintainedSpell = await this._promptMiscModChoice('returnSpell', dialogMessage);
			maintainedSpell.system.schoolChoice.toLowerCase() === 'words of true power' ? intelligenceEduranceChecks.push('spellMaint') : pyscheEnduranceChecks.puch('spellMaint');
		}

		//console.log(">>> Skill Name check", rollType, skillName);

		for (const [key, checks] of Object.entries(abilityMapping)){
			if(checks.includes(rollType)){
				abilityScore = this._findTheCalcAbilityScore(key);
				break;
			}
		}
		if(specialPrompts.includes(rollType)){
			abilityScore = await this._promptMiscModChoice(rollType, dialogMessage);
		}
		dialogMessage += `<div class="abilScore specialRollChatMessage">${game.i18n.localize('gs.actor.character.abil')}: ${abilityScore}</div>`;

		// Getting class bonus or adventurer level in certain cases.
		let classBonus = this._specialRollsClassBonus(rollType);
		if(adventurerLevel.includes(rollType))
			classBonus = this._getAdventurerLevel();
		if(classBonus > 0)
			dialogMessage += `<div class="levelScore specialRollChatMessage">${game.i18n.localize('gs.actor.common.leve')}: ${classBonus}</div>`;

		// Getting misc modifiers such as circumstance bonuses or terrain disadvantages and etc.
		const rollMod = await this._promptMiscModChoice("rollMod", dialogMessage);

		// Updating skillName when special roll != skill name
		const rollTypeMapping = {
			'moveObs': 'Rampart',
			'strRes': 'Strengthened Immunity',
			'monsterKnow': 'Monster Knowledge',
			'generalKnow': 'General Knowledge',
			'longDistance': 'Long-Distance Movement',
			'tacMove': 'Tactical Movement',
			'psyRes': 'Cool and Collected', 'intRes': 'Cool and Collected',
			'strength': 'Encumbered Action', 'escape': 'Encumbered Action', 'climbM': 'Encumbered Action',
			'swim': 'Martial Arts', 'climbF': 'Martial Arts', 'acrobatics': 'Martial Arts', 'jump': 'Martial Arts'
		};
		skillName = rollTypeMapping[rollType] || skillName;

		// Getting skill bonus
		let skillBonus = this._getSkillBonus(skillName);
		// Correcting skill bonuses here as needed
		if(rollType === 'provoke' || (rollType === 'tacMove' && skillBonus != 0)) skillBonus -= 1;
		else if(rollType === 'moveObs') skillBonus += 1;
		else if(rollType === 'monsterKnow') skillBonus = skillBonus * 2;
		else if(rollType === 'generalKnow' || rollType === 'longDistance')
			skillBonus = skillBonus === 3 ? 4 : skillBonus;

		if(skillBonus > 0)
			dialogMessage += `<div class="skillScore specialRollChatMessage">${game.i18n.localize('gs.actor.character.skills')}: ${skillBonus}</div>`;
		if(rollMod > 0)
			dialogMessage += `<div class="rollScore specialRollChatMessage">${game.i18n.localize('gs.dialog.mods.mod')}: ${rollMod}</div>`;

		//console.log("=== Checking", dice, abilityScore, classBonus, skillBonus, rollMod);
		const rollMessage = this._setRollMessage(dice, abilityScore, classBonus, skillBonus, rollMod);

		this._sendRollMessage(rollMessage, dialogMessage);
	}

	/**
	 * A special right-click menu that shows up for the particular item in question. Will show either a "view" to see the item's sheet or "delete" to remove the item
	 */
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
						if (pcTarget)
							pcTarget.delete();
						else
							console.error("Race item not found for deletion.");

						if(type === 'armor' || type === 'shield')
							this.actor.unsetFlag('gs', type);
						break;
				}
			}
		}
	];
}
