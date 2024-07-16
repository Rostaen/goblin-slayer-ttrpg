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
		const actorData = data.actor;
		data.config = CONFIG.gs;
		data.rollData = this.actor.getRollData();
		data.flags = actorData.flags;
		data.system = actorData.system;

		console.log("GSActorSheet >>> Checking Actor Super Data:", data);

		if(this.actor.type === 'monster'){
			data.eAbilities = await TextEditor.enrichHTML(
				actorData.system.abilities, {async: true, rollData: actorData.getRollData(), }
			);
			data.eComment = await TextEditor.enrichHTML(
				actorData.system.comment, {async: true, rollData: actorData.getRollData(), }
			);
		}
		if(this.actor.type === 'fate'){
			data.isGM = game.users.current.isGM;
		}
		if(this.actor.type === 'character'){
			this._prepareItems(data);
			this._prepareCharacterData(data);
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
		html.find(".genSkillContainer").on('mouseenter', this._changeSkillImage.bind(this, true));
		html.find(".genSkillContainer").on('mouseleave', this._changeSkillImage.bind(this, false));
		html.find(".genSkillContainer").click(this._rollGenSkills.bind(this));

		new ContextMenu(html, ".contextMenu", this.contextMenu);
	}

	/**
	 * Checks over general skills and sends rolls to where they're needed or makes a basic check
	 * @param {HTML} event The HTML event to trigger a roll or check
	 * @returns Early break if specific skills need work elsewhere.
	 */
	async _rollGenSkills(event){
		event.preventDefault();
		const container = event.currentTarget;
		const skillId = container.dataset.id;
		const skill = this.actor.items.get(skillId);
		const skipCheck = ['Draconic Heritage', 'Beloved of the Fae', 'Darkvision', 'Faith: Supreme God', 'Faith: Earth Mother',
			'Faith: Trade God', 'Faith: God of Knowledge', 'Faith: Valkyrie', 'Faith: Ancestral Dragon'];

		if(skipCheck.includes(skill.name)) return;

		if(skill.name.toLowerCase() === 'long-distance movement')
			this._specialRolls(event, 'longDistance', 'Long-Distance Movement');
		else if(skill.name.toLowerCase() === 'general knowledge')
			this._specialRolls(event, 'generalKnow', 'General Knowledge');
		else if(skill.name.toLowerCase() === 'cool and collected'){
			const resistType = await this._promptMiscModChoice('coolAndCollected');
			this._specialRolls(event, resistType === "int" ? "intRes" : "psyRes", "default");
		}else{
			let promptChoices = await this._promptMiscModChoice(skill.name);
			if(promptChoices){
				let skillBonus = this._getSkillBonus(skill.name);
				skillBonus = skillBonus = 3 ? 4 : skillBonus;
				promptChoices[0] += this._addStringToChatMessage("skillScore", skill, skillBonus);
				this._rollsToMessage(null, '2d6', promptChoices[1], promptChoices[3], 0, promptChoices[0], skillBonus, promptChoices[2], 'generalSkills');
			}else{
				ui.notifications.warn(`${game.i18n.localize('gs.dialog.genSkills.cancelled')}`);
			}
		}
	}

	/**
	 * Simple method to swap the image of the General Skills to indicate these are rollable skills
	 * @param {boolean} isHover True when hovering, False when not
	 * @param {*} event HTML container event
	 */
	_changeSkillImage(isHover, event){
		const skillImage = $(event.currentTarget).find('.genSkills img');
		// console.log(">>> Check image html", skillImage[0], isHover);
		if(isHover){
			const skillImageURL = skillImage.attr('src');
			this.actor.setFlag('gs', 'genSkillImage', skillImageURL);
			skillImage.attr('src', 'icons/svg/d20-highlight.svg');
		}else{
			const oldImage = this.actor.getFlag('gs', 'genSkillImage');
			this.actor.unsetFlag('gs', 'genSkillImage');
			skillImage.attr('src', oldImage);
		}
	}

	/**
	 * Adds Check roll buttons to the favorites bar in the left sidbar.
	 * @param {HTML} event The click event
	 */
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
			const raceItem = this.actor.items.find(item => item.type === 'race');
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
			const skill = this.actor.items.get(skillId);
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
		console.log(">>> updateAttritionFlag");
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
			let skills, skillValue, critSuccess = 12, critFail = 2, results = [], maintainedSpell;
			const actorType = this.actor.type;

			if(typeof(label) === "object"){
				maintainedSpell = label;
				label = "x";
			}

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
				if(event){
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
					if(critSuccessOnlySkills.includes(`${skill.name.toLowerCase()}`)){
						let element, splitSkillName;
						if(typeof(maintainedSpell) === "object"){
							element = maintainedSpell.system.elementChoice;
							splitSkillName = [0, 0, maintainedSpell.system.elementChoice];
						}else{
							element = event.currentTarget.closest('.reveal-rollable').querySelector("#element").value;
							splitSkillName = skill.name.split(" ");
						}
						if(splitSkillName[2].toLowerCase() === element.toLowerCase())
							setCritSuccessValues(skillValue);
					}else if(critSuccessFailSkills.includes(`${skill.name.toLowerCase()}-${label.toLowerCase()}`))
						setSuccessFailValues(skillValue);
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
		const cssClassType = event?.currentTarget?.classList || ["", ""];
		const spellCastCSSCheck = cssClassType[1];

		// Getting roll modifiers from user
		// TODO: Update to remove this prompt from all but basic ability score rolls
		if(modSelector !== 'generalSkills')
			rollMod = await this._promptMiscModChoice("rollMod", localizedMessage);

		if(rollMod != 0)
			localizedMessage += this._addToFlavorMessage("miscScore", game.i18n.localize('gs.dialog.mods.misc'), rollMod);
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
			let eventID;
			if(event)
				eventID = event.currentTarget.closest('.reveal-rollable').dataset.id;
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

			// console.log("Checking Rolls to Message for misc mod addon", event, dice, stat, classBonus, modifier, localizedMessage, skillBonus, rollMod, modSelector);

			// Checking flags
			const belovedFlag = this.actor.getFlag('gs', 'belovedSkill');
			if(belovedFlag){
				const skillValue = belovedFlag.system.value - 1;
				diceTotal += skillValue;
				localizedMessage += this._addToFlavorMessage("skillScore", belovedFlag.name, skillValue);
				this.actor.unsetFlag('gs', 'belovedSkill');
			}

			// Checking if a power/damage roll is coming through to remove Effectiveness message
			if(modSelector != ".power"){
				localizedMessage += `<div class="spellEffectivenessScore">${game.i18n.localize('gs.gear.spells.efs')}: ${diceTotal + rollMod}</div>`;
			}
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
				let labelText = label.innerHTML + this._addToFlavorMessage("abilScore", game.i18n.localize('gs.actor.character.abil'), bonusScore);
				// TODO: Update with chat box to add modifiers
				this._rollsToMessage(null, baseDice, bonusScore, 0, 0, labelText);
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
		return `<div class="${cssClass} specialRollChatMessage">${skill.name}: ${amount}</div>`;
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
					const weaponsXX = ['Weapons: Axes', 'Weapons: Close-Combat', 'Weapons: Maces', 'Weapons: Bows', 'Weapons: Throwing Weapons', 'Weapons: Spears', 'Weapons: Staves', 'Weapons: One-Handed Swords', 'Weapons: Two-Handed Swords'];
					skills.forEach(skill => {
						if(skill.name.toLowerCase === 'mow down'){
							const {modifier: mod, localizedMessage: message} = this._calculateMowDownModifier(container, skill, modifier, localizedMessage);
							modifier = mod;
							localizedMessage = message;
						}
						if(weaponsXX.includes(skill.name)){
							const {modifier: mod, localizedMessage: message} = this._addSpecificWeaponBonus(container, skill, modifier, localizedMessage, weaponsXX);
							modifier = mod;
							localizedMessage = message;
						}
					});
				}else if(modSelector === '.spellDif'){
					const spellID = container.dataset.id;
					const spell = this.actor.items.get(spellID);
					// Checking if a Shaman spell and has Shaman's Bag or Beloved of the Fae skill
					const skills = this.actor.items.filter(item => item.type === 'skill');
					const items = this.actor.items.filter(item => item.type === 'item');
					if(spell.system.schoolChoice === "Spirit Arts"){
						let belovedSkill, shamanBag;
						skills.forEach(skill => skill.name === "Beloved of the Fae" ? belovedSkill = skill : belovedSkill = null);
						items.forEach(item => item.name === "Shaman's Bag" ? shamanBag = item : shamanBag = null);
						if((!belovedSkill || belovedSkill.system.value === 0)  && !shamanBag){
							ui.notifications.warn(game.i18n.localize('gs.dialog.spellCasting.shamanAlert'));
							return;
						}else if(belovedSkill.system.value >= 2){
							const usingCatalyst = await this._promptMiscModChoice('catalyst');
							if(usingCatalyst){
								this.actor.setFlag('gs', 'belovedSkill', belovedSkill);
							}
						}
					}else if(spell.system.schoolChoice === 'Ancestral Dragon'){
						let dPCPouch;
						items.forEach(item => item.name === "Dragon Priest's Catalyst Pouch" ? dPCPouch = item : dPCPouch = null);
						if(!dPCPouch){
							ui.notifications.warn(game.i18n.localize('gs.dialog.spellCasting.dragonPriestAlert'));
							return;
						}
					}
					const {skillBonus: bonus, localizedMessage: message} = await this._calculateSpellExpertise(skills, localizedMessage, spellID);
					skillBonus += bonus;
					localizedMessage = message;
					const {skillBonus: bonus1, localizedMessage: message1} = await this._checkFaith(skills, localizedMessage, spellID);
					skillBonus += bonus1;
					localizedMessage = message1;
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
	 * Checks for the Faith: XX skill to apply a negative modifier for not chanting the spell's verbal components
	 * @param {JSON} theSkill Skill JSON object to be checked against
	 * @param {string} localizedMessage A string to be added to the flavor message of the chat window
	 * @param {string} spellID String of the ID to the spell being cast
	 * @returns Updated skill bonus and localized message, if any changes
	 */
	async _checkFaith(skills, localizedMessage, spellID){
		let skillBonus = 0;
		const spell = this.actor.items.get(spellID);
		if(spell.system.schoolChoice === "Miracle" || spell.system.schoolChoice === "Ancestral Dragon"){
			const faithBonus = [ 'Faith: Supreme God', 'Faith: Earth Mother',
				'Faith: Trade God', 'Faith: God of Knowledge', 'Faith: Valkyrie', 'Faith: Ancestral Dragon'];
			let theSkill = null;
			skills.forEach(skill => {
				if(faithBonus.includes(skill.name)){
					theSkill = skill;
				}
			});
			if(theSkill){
				skillBonus = this._getSkillBonus(theSkill.name);
				const chantlessMod = await this._promptMiscModChoice('faith');
				if(chantlessMod){
					skillBonus = skillBonus === 1 ? -4 : skillBonus === 2 ? -2 : 0;
					localizedMessage += this._addToFlavorMessage('skillScore', theSkill.name, skillBonus);
				}else
					skillBonus = 0;
			}
		}
		return {skillBonus, localizedMessage};
	}

	/**
	 * The method search over each skill and compares it to the current weapon to see if a to hit bonus is going to be applied.
	 * @param {HTML} container HTML container of the weapon being used
	 * @param {JSON} skill JSON object of the skill that could affect weapon to hit
	 * @param {int} modifier Pos/Neg bonus modifier for the to hit
	 * @param {string} localizedMessage A string to be added to the flavor message of the chat window
	 * @param {array} weaponsXX An array of strings that have the different weapon skill types to check over
	 * @returns Updated modifier and loclizedMessage with any possible changes
	 */
	_addSpecificWeaponBonus(container, skill, modifier, localizedMessage, weaponsXX){
		const weaponAttr = container.querySelector('.type').value;
		const typeContainer = weaponAttr.split('/');
		const weaponType = typeContainer[0].trim();
		const weaponTypes = ['Ax', 'Close-Combat', 'Mace', 'Bow', 'Throwing', 'Spear', 'Staff', 'One-Handed Sword', 'Two-Handed Sword'];
		for(let x = 0; x < weaponTypes.length; x++){
			if(skill.name === weaponsXX[x] && weaponType === weaponTypes[x]){
				modifier += skill.system.value;
				localizedMessage += this._addStringToChatMessage("skillScore", skill, skill.system.value);
				break;
			}
		}
		return {modifier, localizedMessage};
	}

	/**
	 * Sets up a simple return statement to add the correct items and values to the localized message for debugging and player knowledge
	 * @param {string} cssClass Class string to color the message, abilScore, levelScore, skillScore, rollScore, miscScore, armorDodgeScore
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
		console.log(">>> calculateBurstofStrengthBonus");
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
	 * @param {JSON} skill The JSON object of the Mow Down skill
	 * @param {int} modifier The modifier value to be added to the dice roller
	 * @param {string} localizedMessage A flavor message for the chat window
	 * @returns Updated modifier and localized message
	 */
	async _calculateMowDownModifier(container, skill, modifier, localizedMessage){
		const weaponUse = container.querySelector('.weaponUse').value;
		const weaponAttr = container.querySelector('.weaponAttr').value;
		const weaponAttrSplit = weaponAttr.split('/');
		const attributes = ['Slash', 'Bludgeoning'];
		if (weaponUse.toLowerCase() === 'two-handed' && weaponAttrSplit.some(attr => attributes.includes(attr))) {
			const modHitPen = await this._promptMiscModChoice("mowDown", skill.system.value);
			modifier += modHitPen;
			localizedMessage += this._addStringToChatMessage("skillScore", skill, modHitPen);
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
		const fateButtons = ['byOne', 'byThree'];

		if (rollMappings[classType]) {
			const { mod, dice, label, type } = rollMappings[classType];
			this._rollWithModifiers(event, mod, dice, game.i18n.localize(label) + " " + game.i18n.localize('gs.charSheet.statsPage.checks'), type);
		} else if (healActions.includes(classType)) {
			this._healAttrFatigue(classType);
		} else if (classType === 'initiative') {
			this._rollInitiative(event);
		} else if (specialRolls.includes(classType)) {
			this._specialRolls(event, classType, classType.charAt(0).toUpperCase() + classType.slice(1).replace(/([A-Z])/g, ' $1').trim());
		} else if (fateButtons.includes(classType)){
			this._fateAdjustment(event, classType);
		} else {
			console.error(`GS _actorRolls || ${classType} was not found in the method.`);
		}
	}

	/**
	 * Updates the player's Fate value by 1 or 3 depending on the choic clicked.
	 * @param {HTML} event The click event
	 * @param {string} byAmount Either 'byOne' or 'byThree'
	 */
	_fateAdjustment(event, byAmount){
		event.preventDefault();
		let fateUpdate = 0;
		if(byAmount === 'byOne')
			fateUpdate = 1;
		else
			fateUpdate = 3;
		this.actor.update({
			'system.value': parseInt(this.actor.system.value, 10) + fateUpdate
		});
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
			let dialogContent, promptTitle, button1, button2, button3, buttons = {};

			const genSkills = ['Appraisal', 'Artisan: Smithing', 'Artisan: Needlework', 'Artisan: Carpentry', 'Artisan: Leatherworking', 'Artisan: Metal-Carving',
				'Cooking', 'Craftsmanship', 'Criminal Knowledge', 'Etiquette', 'Labor', 'Leadership', 'Meditate', 'Negotiate: Persuade', 'Negotiate: Tempt',
				'Negotiate: Intimidate', 'No Preconceptions', 'Perform: Sing', 'Perform: Play', 'Perform: Dance', 'Perform: Street Perform', 'Perform: Act',
				'Production: Farming', 'Production: Fishing', 'Production: Logging', 'Production: Mining', 'Research', 'Riding', 'Survivalism ', 'Theology',
				'Worship'];
			const specialRolls = ['moveRes', 'strRes', 'psyRes', 'intRes', 'strength', 'stealth', 'acrobatics', 'monsterKnow'];

			const addModifiersSection = () => {
				return `<p>${game.i18n.localize("gs.dialog.mods.addInfo")}</p>
						<input type="text" class="rollMod" style="margin-bottom: 10px;" />`;
			};

			switch(promptType){
				case 'faith': case 'catalyst':
					const header = game.i18n.localize(`gs.dialog.${promptType}.header`);
					const title = game.i18n.localize(`gs.dialog.${promptType}.title`);
					const label1 = game.i18n.localize(`gs.dialog.${promptType}.label1`);
					const label2 = game.i18n.localize(`gs.dialog.${promptType}.label2`);
					dialogContent = `<h3>${header}</h3>`;
					promptTitle = title;
					button1 = {
						label: label1,
						callback: () => resolve(false)
					};
					button2 = {
						label: label2,
						callback: () => resolve(true)
					};
					break;

					break;
				case 'coolAndCollected':
					dialogContent = `<h3>${game.i18n.localize("gs.dialog.coolAndColl.header")}</h3>`;
					promptTitle = game.i18n.localize("gs.dialog.coolAndColl.title");
					button1 = {
						label: game.i18n.localize("gs.dialog.actorSheet.sidebar.buttons.intRes"),
						callback: () => {
							resolve("int");
						}
					};
					button2 = {
						label: game.i18n.localize("gs.dialog.actorSheet.sidebar.buttons.psyRes"),
						callback: () => {
							resolve("psy");
						}
					};
					break;
				case 'rollMod':
					dialogContent = `
						<h3>${game.i18n.localize("gs.dialog.mods.addMod")}</h3>
						<p>${game.i18n.localize("gs.dialog.mods.addInfo")}</p>
						<input type="text" class="rollMod" style="margin-bottom: 10px;" />`;
					promptTitle = promptName + " " + game.i18n.localize("gs.dialog.mods.mod");
					button1 = {
						label: game.i18n.localize("gs.dialog.mods.addMod"),
						callback: (html) => {
							resolve(this._getRollMod(html, ".rollMod"));
						}
					};
					button2 = {
						label: game.i18n.localize("gs.dialog.cancel"),
						callback: () => {
							resolve(0);
						}
					};
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
					button1 = {
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
					button2 = {
						label: game.i18n.localize('gs.dialog.cancel'),
						callback: () => resolve(0)
					};
					break;
				case 'returnSpell':
					const spells = this.actor.items.filter(item => item.type === 'spell');
					const header1 = game.i18n.localize(`gs.dialog.spellMaint.header`);
					promptTitle = game.i18n.localize(`gs.dialog.spellMaint.title`);
					dialogContent = `<h3>${header1}</h3>`;

					// Function to create a button containing the spell image and name
					const createSpellButton = (spell) => ({
						label: `<img src="${spell.img}" alt="spell icon" /> ${spell.name}`,
						callback: () => resolve(spell)
					});

					// Loops through all of the spells the player has and creates a button
					for(const [index, spell] of spells.entries()){
						buttons[index] = createSpellButton(spell);
					}
					break;
				default:
					break;
			}

			if(specialRolls.includes(promptType)){
				const header = game.i18n.localize(`gs.dialog.${promptType}.header`);
				const paragraph = game.i18n.localize(`gs.dialog.${promptType}.label`);
				const promptMapping = {
					'moveRes': {word1: 'str', word2: 'foc', word3: 'tec', word4: 'foc', ability1: 'sf', ability2: 'tf'},
					'strRes': {word1: 'str', word2: 'ref', word3: 'str', word4: 'end', ability1: 'sr', ability2: 'se'},
					'psyRes': {word1: 'p', word2: 'ref', word3: 'p', word4: 'end', ability1: 'pr', ability2: 'pe'},
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

				button1 = createButton([word1, word2], ability1);
				button2 = createButton([word3, word4], ability2);

				if(promptType === 'stealth' || promptType === 'acrobatics'){
					button3 = createButton([word5, word6], ability3);
				}
			}else if(genSkills.includes(promptType)){
				const genSkillsList = {
					"Appraisal": { first: 'i', second: 'none', class: 'none' },
					"Artisan: Smithing": { first: 'i', second: 't', class: 'none' },
					"Artisan: Carpentry": { first: 'i', second: 't', class: 'none' },
					"Artisan: Leatherworking": { first: 'i', second: 't', class: 'none' },
					"Artisan: Metal-Carving": { first: 'i', second: 't', class: 'none' },
					"Cooking": { first: 'i', second: 't', class: 'none' },
					"Craftsmanship": { first: 't', second: 'none', class: 'none' },
					"Criminal Knowledge": { first: 'i', second: 'none', class: 'scout' },
					"Etiquette": { first: 'p', second: 'none', class: 'sorcerer' },
					"Labor": { first: 'i', second: 'none', class: 'none' },
					"Leadership": { first: 'p', second: 'none', class: 'none' },
					"Meditate": { first: 'i', second: 'none', class: 'sorcerer/shaman' },
					"Negotiate: Persuade": { first: 'i', second: 'none', class: 'none' },
					"Negotiate: Tempt": { first: 'p', second: 'none', class: 'none' },
					"Negotiate: Intimidate": { first: 'str', second: 'none', class: 'none' },
					"No Preconceptions": { first: 'p', second: 'none', class: 'none' },
					"Perform: Sing": { first: 'i', second: 'p', class: 'none' },
					"Perform: Act": { first: 'i', second: 'p', class: 'none' },
					"Perform: Play": { first: 'i', second: 't', class: 'none' },
					"Perform: Dance": { first: 'i', second: 't', class: 'none' },
					"Perform: Street Perform": { first: 'i', second: 't', class: 'none' },
					"Production: Farming": { first: 'i', second: 't', class: 'none' },
					"Production: Fishing": { first: 'i', second: 't', class: 'none' },
					"Production: Logging": { first: 'i', second: 't', class: 'none' },
					"Production: Mining": { first: 'i', second: 't', class: 'none' },
					"Research": { first: 'i', second: 'none', class: 'sorcerer' },
					"Riding": { first: 't', second: 'none', class: 'none' },
					"Survivalism ": { first: 'i', second: 't', class: 'ranger' },
					"Theology": { first: 'i', second: 'none', class: 'priest/dragon' },
					"Worship": { first: 'p', second: 'none', class: 'priest/dragon' }
				};
				let header = game.i18n.localize(`gs.dialog.genSkills.header`) + promptType;
				dialogContent = `<h3>${header}</h3>`;
				promptTitle = game.i18n.localize(`gs.dialog.genSkills.title`);
				let classNames, classLevelBonus = 0;

				for(const [id, item] of Object.entries(genSkillsList)){
					if(id === promptType){
						classNames = item.class;
						console.log(">>> Checking id and item", id, item);
						dialogContent += `<p style="font-weight: bold;">${game.i18n.localize('gs.dialog.genSkills.primary')}</p>`;
						const primaryAbilityMap = {
							i: 'int',
							t: 'tec',
							p: 'psy'
						}
						const firstWord = game.i18n.localize(`gs.actor.character.${primaryAbilityMap[item.first]}`);
						const secondWord = game.i18n.localize(`gs.actor.character.${primaryAbilityMap[item.second]}`);
						if(item.second === 'none'){
							dialogContent += `
								<p><input class='recall' type='radio' name="primary" checked disabled value="${item.first}"> ${game.i18n.localize('gs.dialog.genSkills.recall')} (${firstWord})</p>
								<p><input class='use' type='radio' name="primary" disabled value="${item.second}"> ${game.i18n.localize('gs.dialog.genSkills.use')}</p>
							`;
						}else{
							dialogContent += `
								<p><input class='recall' type='radio' name="primary" value="${item.first}"> ${game.i18n.localize('gs.dialog.genSkills.recall')} (${firstWord})</p>
								<p><input class='use' type='radio' name="primary" value="${item.second}"> ${game.i18n.localize('gs.dialog.genSkills.use')} (${secondWord})</p>
							`;
						}
						dialogContent += `
							<p style="font-weight: bold;">${game.i18n.localize('gs.dialog.genSkills.secondary')}</p>
							<div class="grid grid-3col">
								<div style="">
									<input class="focus" type="radio" name="secondary" value="f"> ${game.i18n.localize('gs.actor.character.foc')}
								</div>
								<div style="">
									<input class="endurance" type="radio" name="secondary" value="e"> ${game.i18n.localize('gs.actor.character.end')}
								</div>
								<div style="">
									<input class="reflex" type="radio" name="secondary" value="r"> ${game.i18n.localize('gs.actor.character.ref')}
								</div>
							</div>
						`;
						dialogContent += addModifiersSection();
						break;
					}
				}

				button1 = {
					label: game.i18n.localize(`gs.dialog.rolling`),
					callback: (html) => {
						const inputs = html.find('input');
						const primaryAbility = inputs[0].checked ? inputs[0].value : inputs[1].checked ? inputs[1].value : null;
						const secondaryAbility = inputs[2].checked ? inputs[2].value : inputs[3].checked ? inputs[3].value : inputs[4].checked ? inputs[4].value : null;
						const modifiers = parseInt(inputs[5].value, 10) || 0;

						const getSecondaryScore = (letter, secondaryAbility) => {
							const calcScore = this.actor.system.abilities.calc;
							const localizedText = 'gs.actor.character.';
							const abilityMap = {
								f: 'foc',
								e: 'end',
								r: 'ref'
							};
							const abilityKey = abilityMap[secondaryAbility];
							const text = game.i18n.localize(localizedText + abilityKey) + " ";
							const score = calcScore[letter+secondaryAbility];
							return {text, score};
						};

						let bonusScore = 0, labelText = "";
						const localizedText = 'gs.actor.character.';
						if(primaryAbility === 'i'){
							labelText += game.i18n.localize(localizedText + 'int') + " ";
							const {text, score} = getSecondaryScore(primaryAbility, secondaryAbility);
							labelText += text;
							bonusScore = score;
						}else if(primaryAbility === 't'){
							labelText += game.i18n.localize(localizedText + 'tec') + " ";
							const {text, score} = getSecondaryScore(primaryAbility, secondaryAbility);
							labelText += text;
							bonusScore = score;
						}else if(primaryAbility === 'p'){
							labelText += game.i18n.localize(localizedText + 'psy') + " ";
							const {text, score} = getSecondaryScore(primaryAbility, secondaryAbility);
							labelText += text;
							bonusScore = score;
						}

						labelText += this._addToFlavorMessage("abilScore", game.i18n.localize('gs.actor.character.abil'), bonusScore);
						classNames = classNames.includes("/") ? classNames.split("/") : classNames;
						let tempName = "";
						for(let x = 0; x < classNames.length; x++){}
						if(typeof(classNames) === 'string'){
							classLevelBonus = this.actor.system.levels.classes[classNames];
							tempName = classNames;
						}else{
							classNames.forEach(name => {
								if(this.actor.system.levels.classes[name] > classLevelBonus){
									classLevelBonus = this.actor.system.levels.classes[name];
									tempName = name;
								}
							});
						}
						if(classLevelBonus > 0) labelText += this._addToFlavorMessage("levelScore", tempName.charAt(0).toUpperCase() + tempName.slice(1), classLevelBonus);
						const foundValues = [labelText, bonusScore, modifiers, classLevelBonus];
						resolve(foundValues);
					}
				};
				button2 = {
					label: game.i18n.localize('gs.dialog.cancel'),
					callback: () => resolve(0)
				};
			}

			if(promptType != 'returnSpell')
				buttons = { button1: button1, buttonTwo: button2 };
			if(promptType === 'stealth' || promptType === 'acrobatics')
				buttons.button3 = button3;

			new Dialog({
				title: promptTitle,
				content: dialogContent,
				buttons: buttons,
				default: "button1",
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
	async _sendRollMessage(rollMessage, flavorMessage, maintainedSpell = ""){
		try{
			const roll = new Roll(rollMessage);
			await roll.evaluate();

			const diceResults = roll.terms[0].results.map(r => r.result);
			const status = this._checkForCritRolls(diceResults, maintainedSpell ? maintainedSpell : "");

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
	_specialRollsClassBonus(rollType, dialogMessage){
		let classBonus = 0, selectedClass = "";
		switch(rollType){
			case 'luck': case 'swim': case 'strRes': case 'longDistance': case 'tacMove': return {classBonus, dialogMessage};
			case 'psyRes': case 'intRes':
				const advLevel = this.actor.system.levels.adventurer;
				const dragonLevel = this.actor.system.levels.classes.dragon;
				console.log('>>> AdvLevel & Dragon Level', advLevel, dragonLevel);
				if(advLevel >= dragonLevel){
					classBonus = parseInt(advLevel, 10);
					dialogMessage +=  `<div class="levelScore specialRollChatMessage">${game.i18n.localize('gs.actor.character.lvl')}: ${classBonus}</div>`;
				}else{
					classBonus = parseInt(dragonLevel, 10);
					dialogMessage +=  `<div class="levelScore specialRollChatMessage">${game.i18n.localize('gs.actor.character.dPri')}: ${classBonus}</div>`;
				}
				return {classBonus, dialogMessage};
		}
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
			'spellMaintI': ['sorcerer'], 'spellMaintPp': ['priest'], 'spellMaintPd': ['dragon'], 'spellMaintPs': ['shaman'],
		}
		const classNameMapping = {
			'fighter': 'gs.actor.character.figh', 'monk': 'gs.actor.character.monk', 'ranger': 'gs.actor.character.rang', 'scout': 'gs.actor.character.scou',
			'sorcerer': 'gs.actor.character.sorc', 'priest': 'gs.actor.character.prie', 'dragon': 'gs.actor.character.dPri', 'shaman': 'gs.actor.character.sham',
		}

		// Getting the relevant classes for the roll type
		const relevantClasses = rollTypeMapping[rollType];

		if(relevantClasses){
			relevantClasses.forEach(className => actorClasses[className] > classBonus
				? (classBonus = parseInt(actorClasses[className], 10), selectedClass = className.charAt(0).toUpperCase() + className.slice(1))
				: classBonus );
		}else{
			console.error(`GS _specialRollsClassBonus || Unknown roll type: ${rollType}`);
		}

		dialogMessage += `<div class="levelScore specialRollChatMessage">${game.i18n.localize(selectedClass)}: ${classBonus}</div>`;

		return {classBonus, dialogMessage};
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
		let abilityScore = 0, dice = '2d6', classBonus = 0, maintainedSpell, spellTypeMaintained;
		let dialogMessage = game.i18n.localize(`gs.dialog.actorSheet.sidebar.buttons.${rollType}`);
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

		if(rollType === 'spellMaint'){
			maintainedSpell = await this._promptMiscModChoice('returnSpell', dialogMessage);
			const maintainedSpellSchool = maintainedSpell.system.schoolChoice.toLowerCase();
			spellTypeMaintained = maintainedSpell.system.styleChoice.toLowerCase();
			maintainedSpellSchool === 'words of true power' ? (intelligenceEduranceChecks.push('spellMaintI'), rollType = "spellMaintI")
				: maintainedSpellSchool === 'miracle' ? (pyscheEnduranceChecks.push('spellMaintPp'), rollType="spellMaintPp")
				: maintainedSpellSchool === 'ancestral dragon' ? (pyscheEnduranceChecks.push('spellMaintPd'), rollType="spellMaintPd")
				: (pyscheEnduranceChecks.push('spellMaintPs'), rollType="spellMaintPs");
		}

		const abilityMapping = {
			ir: intelligenceReflexChecks, if: intelligenceFocusChecks, ie: intelligenceEduranceChecks,
			tf: techniqueFocusChecks, pr: psycheReflexChecks, pe: pyscheEnduranceChecks,
			sr: strengthReflexChecks, se: strengthEnduranceChecks, sf: strengthFocusChecks
		};
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

		console.log(">> from genskill to specail roll", event, rollType, skillName);
		// Getting class bonus or adventurer level in certain cases.
		const {classBonus: cBonus, dialogMessage: dMessage} = this._specialRollsClassBonus(rollType, dialogMessage);
		classBonus += cBonus;
		dialogMessage = dMessage;
		if(adventurerLevel.includes(rollType)){
			classBonus = this._getAdventurerLevel(dialogMessage);
			if(classBonus > 0)
				dialogMessage += `<div class="levelScore specialRollChatMessage">${game.i18n.localize('gs.actor.common.leve')}: ${classBonus}</div>`;
		}

		// Getting misc modifiers such as circumstance bonuses or terrain disadvantages and etc.
		const rollMod = await this._promptMiscModChoice("rollMod", dialogMessage);

		// Updating skillName when special roll != skill name
		switch(rollType){
			case 'spellMaintI':
			case 'spellMaintPp':
			case 'spellMaintPd':
			case 'spellMaintPs':
				const styleMapping = {
					'attack': 'Spell Expertise: Attack Spells',
					'imbuement': 'Spell Expertise: Imbuement Spells',
					'creation': 'Spell Expertise: Creation Spells',
					'control': 'Spell Expertise: Control Spells',
					'healing': 'Spell Expertise: Healing Spells',
					'general': 'Spell Expertise: General Spells',
				};
				skillName = styleMapping[spellTypeMaintained] || skillName;
				break;
			default:
				const rollTypeMapping = {
					'moveObs': 'Rampart',
					'strRes': 'Strengthened Immunity',
					'monsterKnow': 'Monster Knowledge',
					'generalKnow': 'General Knowledge',
					'longDistance': 'Long-Distance Movement',
					'tacMove': 'Tactical Movement',
					'psyRes': 'Cool and Collected', 'intRes': 'Cool and Collected',
					'strength': 'Encumbered Action', 'escape': 'Encumbered Action', 'climbM': 'Encumbered Action',
					'swim': 'Martial Arts', 'climbF': 'Martial Arts', 'acrobatics': 'Martial Arts', 'jump': 'Martial Arts',
				};
				skillName = rollTypeMapping[rollType] || skillName;
				break;
		}

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

		this._sendRollMessage(rollMessage, dialogMessage, maintainedSpell ? maintainedSpell : "");
	}

	// Pushing all items from embedded documents into top level objects for ease of use
	_prepareItems(data){
		const weapons = [];
		const armor = [];
		const shields = [];
		const items = [];
		const skills = {
			adventurer: [],
			general: []
		};
		const spells = {
			miracles: [],
			dragon: [],
			spirit: [],
			words: []
		};

		// Iterating through all items
		for(let i of data.items){
			if(i.type === 'weapon')
				weapons.push(i);
			else if(i.type === 'armor')
				armor.push(i);
			else if(i.type === 'shield')
				shields.push(i);
			else if(i.type === 'item')
				items.push(i);
			else if(i.type === 'skill'){
				if(i.system.type)
					skills.adventurer.push(i);
				else
					skills.general.push(i);
			}
			else if(i.type === 'spell'){
				if(i.system.schoolChoice === 'Miracles')
					spells.miracles.push(i);
				else if(i.system.schoolChoice === 'Ancestral Dragon')
					spells.dragon.push(i);
				else if(i.system.schoolChoice === 'Spirit Arts')
					spells.spirit.push(i);
				else
					spells.words.push(i);
			}
		}

		// Assigning to data and return
		data.weapons = weapons;
		data.armor = armor;
		data.shields = shields;
		data.items = items;
		data.skills = skills;
		data.spells = spells;
	}

	async _prepareCharacterData(data){
		const systemData = data.actor.system;

		try{
			// Setting up vision for standard or darkvision
			const darkVision = systemData.skills.general?.darkVision || 0;
			const updateVision = {
				vision: true,
				visionMode: darkVision > 0 ? 'darkvision' : 'basic',
				range: darkVision > 0 ? darkVision : 0
			}

			// Checking Perseverance Skill
			const perseveranceRank = systemData.skills.adventurer?.perseverance || 0;
			const perseveranceFlag = data.actor.getFlag('gs', 'perseverance') || 0;
			if(perseveranceRank !== perseveranceFlag){
				await data.actor.setFlag('gs', 'perseverance', perseveranceRank);
				for(let rank = 1; rank <= 5; rank++){
					let ex = rank <= perseveranceRank ? 1 : 0;
					let maxAdjust = rank <= perseveranceRank ? 1 : 0;
					await data.actor.update({
						[`system.fatigue.rank${rank}.ex`]: ex,
						[`system.fatigue.rank${rank}.max`]: systemData.fatigue[`rank${rank}`].max + maxAdjust
					});
				}
			}

			const _updateItemScore = async (itemType, skillKey, flagKey, skillType) => {
				const skillRank = systemData.skills[skillType]?.[skillKey] || 0;
				if(skillRank){
					const itemFlag = data.actor.getFlag('gs', flagKey) || 0;
					const item = data.actor.items.find(i => i.type === itemType);
					console.log(">>> SR", skillRank, "IFlag", itemFlag, "Type", skillType);
					if(item){
						if(!itemFlag)
							await data.actor.setFlag('gs', flagKey, item.system.score);
						const newScore = itemFlag + skillRank;
						if(item.system.score !== newScore)
							await item.update({
								'system.score': newScore
							});
					}
				}
			}
			// Updating Armor, Shields if skilled
			await _updateItemScore('armor', 'armorAC', 'armor', 'adventurer');
			await _updateItemScore('shield', 'shieldAC', 'shield', 'adventurer');

			// const lizardRank = systemData.skills.general?.lizardman || 0;
			// if(lizardRank){
			// 	const lizardFlag = data.actor.getFlag('gs', 'lizardman') || 0;
			// 	const armorFlag = data.actor.getFlag('gs', 'armor') || 0;
			// 	const armorRank = systemData.skills.adventurer?.armorAC || 0;
			// 	const armor = data.actor.items.find(i => i.type === 'armor');

			// 	if(!armorRank)
			// 		await _updateItemScore('armor', 'lizardman', 'armor', 'general');
			// 	else if(armor){
			// 		const withArmorBonus = lizardFlag + lizardRank + armorRank;
			// 		console.log(">>> Lizard Check ArmorScore", armor.system.score, withArmorBonus, lizardFlag, lizardRank, armorRank );
			// 		if(armor.system.score !== withArmorBonus){
			// 			await armor.update({
			// 				'system.score': withArmorBonus
			// 			});
			// 		}
			// 	}

			// 	const barehands1H = data.actor.items.get(i => i.name === 'Barehanded Attack (1H)');
			// 	const barehands2H = data.actor.items.get(i => i.name === 'Barehanded Attack (2H)')
			// 	const barehandsFlag = data.actor.getFlag('gs', 'oneHandFlag') || 0;
			// 	//if()
			// }

			// Batch update all items here at one go.
			await data.actor.update({
				'prototypeToken.sight.vision': updateVision.vision,
				'prototypeToken.sight.visionMode': updateVision.visionMode,
				'prototypeToken.sight.range': updateVision.range
			});
		}catch(err){
			console.error("Error Perparing character data:", err);
		}
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
						if(skill.name === 'Draconic Heritage'){
							const armorScore = this.actor.getFlag('gs', 'lizardman');
							const oneHandScore = this.actor.getFlag('gs', 'oneHandSlash');
							const twoHandScore = this.actor.getFlag('gs', 'twoHandSlash');
							const armorWorn = this.actor.items.filter(item => item.type === 'armor');
							const weapons = this.actor.items.filter(item => item.system.type === 'Close-Combat / Light');
							console.log(">>> Removing", armorWorn, weapons);
							if(armorWorn.length > 0)
								armorWorn[0].update({'system.score': armorScore});
							if(weapons.length > 0){
								weapons[0].update({
									'img': 'icons/skills/melee/unarmed-punch-fist.webp',
									'system.power': oneHandScore,
									'system.attribute': 'Bludgeoning'
								});
								weapons[1].update({
									'img': 'icons/skills/melee/unarmed-punch-fist.webp',
									'system.power': twoHandScore,
									'system.attribute': 'Bludgeoning'
								});
							}
							this.actor.unsetFlag('gs', 'lizardman');
							this.actor.unsetFlag('gs', 'oneHandSlash');
							this.actor.unsetFlag('gs', 'twoHandSlash');
						}
						else if(skill.name === 'Darkvision'){
							this.actor.unsetFlag('gs', 'darkvision');
							const token = this.actor.getActiveTokens()[0];
							// const token = canvas.tokens.placeables.find(t => t.name === this.name);
							if(token){
								token.document.update({
									'sight': {
										'visionMode': 'basic',
										'range': 0
									}
								});
								token.refresh();
							}
						}
						else if(skill.name === 'Perseverance')
							this.actor.unsetFlag('gs', 'perseverance');
						else if(skill.name === 'Armor: Cloth' || skill.name === 'Armor: Light' || skill.name === 'Armor: Heavy'){
							const originalScore = this.actor.getFlag('gs', 'armor');
							const armor = this.actor.items.filter(item => item.type === 'armor');
							armor[0].update({
								'system.score': originalScore
							});
							this.actor.unsetFlag('gs', 'armor');
						}else if(skill.name === 'Shields'){
							const originalScore = this.actor.getFlag('gs', 'shield');
							const shield = this.actor.items.filter(item => item.type === 'shield');
							shield[0].update({
								'system.score': originalScore
							});
							this.actor.unsetFlag('gs', 'shield');
						}else if(skill.name === 'Draconic Heritage')
							this.actor.unsetFlag('gs', 'lizard');
						break;
					case 'raceSheet':case 'weapon':case 'armor':case 'shield':case 'item':case 'spell':
						const pcTarget = actor.items.get(id);
						if (pcTarget)
							pcTarget.delete();
						else
							console.error("Race item not found for deletion.");

						if(type === 'armor' || type === 'shield'){
							const originalScore = this.actor.getFlag('gs', type);
							let equipment = this.actor.items.filter(item => item.type.toLowerCase() === type);
							equipment[0].update({
								'system.score': originalScore
							})
							this.actor.unsetFlag('gs', type);
						}
						break;
				}
			}
		}
	];
}
