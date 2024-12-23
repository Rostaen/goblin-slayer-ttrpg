const { mergeObject } = foundry.utils;

export default class GSActorSheet extends ActorSheet {

	constructor(...args) {
		super(...args);
		this._renderTimeout = null;
	}

	async render(force = false, options = {}) {
		// Clear any existing timeout
		if (this._renderTimeout) clearTimeout(this._renderTimeout);

		// Set a timeout to debounce the render
		this._renderTimeout = setTimeout(() => {
			super.render(force, options);
		}, 100); // Adjust the delay as needed
	}

	static get defaultOptions() {
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

	get template() {
		const path = "systems/gs/templates/actors";
		return `${path}/${this.actor.type}-sheet.hbs`;
	}

	// Use this section to manage item drops without overwritting core functionality
	async _onDropItem(event, data) {
		const itemData = await super._onDropItem(event, data);

		// Check if item dropped is a race item
		if (itemData[0].type === 'race') {
			this._inheritRaceSkills(itemData);
		}
		return itemData;
	}

	async _inheritRaceSkills(raceItem) {
		const raceSkills = raceItem[0].system.skills || [];
		if (raceSkills.length === 0) {
			console.error("No skills found in the race item.");
			return;
		}

		const skillItems = raceSkills.map(skill => {
			return {
				flags: skill.flogs,
				img: skill.img,
				name: skillName,
				ownership: { ...skill.ownership },
				sort: skill.sort,
				system: { ...skill.system },
				type: 'skill',
				_stats: { ...skill._stats }
			};
		});

		try {
			const createdSkills = await this.actor.createEmbeddedDocuments('Item', skillItems);
		} catch (error) {
			console.error("Error adding skills to actor:", error);
		}
	}

	async getData() {
		const data = super.getData();
		const actorData = data.actor;
		data.config = CONFIG.gs;
		data.rollData = this.actor.getRollData();
		data.flags = actorData.flags;
		data.system = actorData.system;

		//console.log("GSActorSheet >>> Checking Actor Super Data:", data);

		if (this.actor.type === 'monster' || this.actor.type === 'mount') {
			data.eAbilities = await TextEditor.enrichHTML(
				actorData.system.abilities, { async: true, rollData: actorData.getRollData(), }
			);
			data.eComment = await TextEditor.enrichHTML(
				actorData.system.comment, { async: true, rollData: actorData.getRollData(), }
			);
		}
		if (this.actor.type === 'fate') {
			data.isGM = game.users.current.isGM;
		}
		if (this.actor.type === 'character') {
			data.skillValues = actorData.system.skills;
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

	activateListeners(html) {
		super.activateListeners(html);
		html.find("input.skillRankInput").change(this._onUpdateSkillRank.bind(this));
		html.find("label.scoreRoll").click(this._rollStatDice.bind(this));
		html.find(".minStatic").click(this._rollMinionStatic.bind(this));
		html.find(".actorRolls").click(this._actorRolls.bind(this));
		html.find(".attritionCBox").click(this._checkAttrition.bind(this));
		html.find(".fatigueCBox").click(this._checkFatigue.bind(this));
		html.find(".starred").change(this._addRollToFavorites.bind(this));
		html.find(".genSkillContainer").on('mouseenter', this._changeSkillImage.bind(this, true));
		html.find(".genSkillContainer").on('mouseleave', this._changeSkillImage.bind(this, false));
		html.find(".genSkillContainer.genSkills").click(this._rollGenSkills.bind(this));

		// Equipment Override
		html.find(".equipGear").click(this._equipGear.bind(this));

		// New player rolls
		html.find(".toHit.player").click(this._playerAttack.bind(this));
		html.find(".dodge.player").click(this._playerDodge.bind(this));
		html.find(".block.player").click(this._playerBlock.bind(this));
		html.find(".spellCast.player").click(this._playerSpellCast.bind(this));
		html.find(".spellResist.player").click(this._playerSpellResistance.bind(this));

		// New monster rolls
		html.find('.toHit.monster').click(this._monsterAttack.bind(this));

		new ContextMenu(html, ".contextMenu", this.contextMenu);
	}

	async _playerAttack(event) {
		event.preventDefault();
		const targets = Array.from(game.user.targets);
		const targetToken = targets[0]?.document?.actor?.getActiveTokens()[0] || 0;

		// Return early if target isn't selected and warn player
		if (!this._checkTargets(targetToken)) {
			return;
		}

		const actor = this.actor;
		const actorToken = game.actors.get(actor._id).getActiveTokens()[0];
		const defaultDice = '2d6';
		const skills = this._getFromItemsList('skill');
		const itemInfo = this._pullItemInfo(event, actor);
		let chatMessage = this._setMessageHeader(actor, itemInfo, 'toHit');

		// Checking if range is vallid before rolling attacks, else return early
		const rangeValid = this._checkWeaponRange(actorToken, targetToken, itemInfo);
		if (!rangeValid) {
			ui.notifications.warn(game.i18n.localize('gs.dialog.outOfRange'));
			return;
		}

		// Checking for Curved Shot skill if weapon is a bow and skill present to update various factors
		if (itemInfo.system.type.split(" / ")[0] === 'Bow' && skills.some(s => s.name === 'Curved Shot')) {
			const cSPromptResponse = await this._promptMiscModChoice('curvedShot');
			if (cSPromptResponse === 1)
				this._curvedShotCheck(itemInfo, skills);
		}

		// Setting base hit check dice to chat window
		chatMessage += this._addToFlavorMessage('diceInfo', game.i18n.localize('gs.dialog.dice'), defaultDice);

		// Pulling Weapon To Hit Info
		let weaponHitMod = itemInfo.system.hitMod;
		if (skills.some(s => s.name === 'Gorilla Tactics')) {
			const gorTact = skills.find(s => s.name === 'Gorilla Tactics');
			const gTactVal = this._updateWeaponHitMod(gorTact);
			weaponHitMod = weaponHitMod - gTactVal;
			chatMessage += this._addToFlavorMessage('armorDodgeScore', gorTact.name, gTactVal);
		}
		chatMessage += this._addToFlavorMessage('gearModifier', game.i18n.localize('gs.dialog.gearMod'), weaponHitMod);

		// Pulling Class Bonus
		let { classBonus, chatMessage: message, statUsed: stat } = this._getClassLevelBonus2('weapon', itemInfo, chatMessage);
		chatMessage = message;

		// Checking for skill hit check bonus
		let { skillBonus, skillMessage } = await this._getHitSkillModifier(skills, itemInfo);
		chatMessage += skillMessage;

		// Get random modifiers from Prompt
		let randomMods = await this._promptRandomModifiers();
		if (randomMods) chatMessage += this._addToFlavorMessage('miscScore', game.i18n.localize('gs.dialog.miscMod'), randomMods);

		// Setting Roll Message
		let rollString = this._setRollMessage(defaultDice, weaponHitMod, stat, classBonus, skillBonus, randomMods);

		// Rolling Dice
		let { roll, diceResults, rollTotal } = await this._rollDice(rollString);

		// Checking for Effectiveness Score buffs
		let { tempAmount, eSMessage } = this._checkEffectivenessSkills(skills, itemInfo);
		rollTotal += tempAmount;
		chatMessage += eSMessage;

		// Setting up Effectivess Score view
		chatMessage += this._addToFlavorMessage('diceInfo', game.i18n.localize('gs.gear.spells.efs'), rollTotal);
		let extraDamage = this._getExtraDamage(rollTotal) || 0;
		if (extraDamage)
			chatMessage += this._addToFlavorMessage('diceInfo', game.i18n.localize('gs.dialog.bonusDmg'), extraDamage);

		// Checking weapon with slice attribute, if true, look for Slice skill and update if found
		let sliceSkill = 0;
		if (itemInfo.system.effect.checked[10])
			sliceSkill = skills.find(s => s.name === 'Slice Attack');

		// Checking for Crit Success/Failure
		const critStatus = this._checkForCriticals(diceResults, sliceSkill);
		if (critStatus != undefined || critStatus != null)
			chatMessage += `${critStatus[1]}`;

		// Getting target information
		try {
			chatMessage += this._setMonsterTargetInfo(targets, itemInfo, extraDamage);
		} catch (err) {
			ui.notifications.warn("You must select a target first before attacking.", err);
			console.error('... setting monster target', err);
			return false;
		}

		// Ending of chat message box before roll evaluation
		chatMessage += this._setMessageEnder();

		// Sending dice rolls to chat window
		await roll.toMessage({
			speaker: { actor: actor },
			flavor: chatMessage,
			author: game.user
			// content: Change dice rolls and other items here if needed
		});
	}

	async _playerDodge(event) {
		event.preventDefault();
		const actor = this.actor;
		const defaultDice = '2d6';
		const skills = this._getFromItemsList('skill');
		const itemInfo = this._pullItemInfo(event, actor);

		// Setting Message Header for dodge roll
		let chatMessage = this._setMessageHeader(actor, itemInfo, 'dodge');

		// Adding Dice to chat window
		chatMessage += this._addToFlavorMessage('diceInfo', game.i18n.localize('gs.dialog.dice'), defaultDice);

		// Adding Armor bonus/negative to chat window
		let armorMod = itemInfo.system.dodge;
		chatMessage += this._addToFlavorMessage('gearModifier', game.i18n.localize('gs.dialog.gearMod'), armorMod);

		// Getting Class Level bonus, if any
		let { classBonus, message, stat } = this._getClassLevelBonus2('dodge', itemInfo, chatMessage);
		chatMessage = message;

		// Get random modifiers from Prompt
		let randomMods = await this._promptRandomModifiers();
		if (randomMods) chatMessage += this._addToFlavorMessage('miscScore', game.i18n.localize('gs.dialog.miscMod'), randomMods);

		// Setting Roll Message
		let rollString = this._setRollMessage(defaultDice, armorMod, stat, classBonus, 0, randomMods);

		// Rolling Dice
		let { roll, diceResults, rollTotal } = await this._rollDice(rollString);

		// Checking for Alert skill usage and crit change
		let alertSkill = skills.find(s => s.name === 'Alert') || 0;
		let useSkill = 0;
		if (alertSkill) {
			useSkill = await this._promptMiscModChoice('useSkill', alertSkill.name);
			if (useSkill) chatMessage += this._addToFlavorMessage('skillEffectiveScore', alertSkill.name, alertSkill.system.value);
		}
		const critStatus = this._checkForCriticals(diceResults, alertSkill);
		if (critStatus != undefined || critStatus != null)
			chatMessage += `${critStatus[1]}`;

		await roll.toMessage({
			speaker: { actor: actor },
			flavor: chatMessage,
			author: game.user
			// content: Change dice rolls and other items here if needed
		});
	}

	async _playerBlock(event) {
		event.preventDefault();
		const actor = this.actor;
		const defaultDice = '2d6';
		const skills = this._getFromItemsList('skill');
		const itemInfo = this._pullItemInfo(event, actor);

		// Setting Message Header for dodge roll
		let chatMessage = this._setMessageHeader(actor, itemInfo, 'block');

		// Adding Dice to chat window
		chatMessage += this._addToFlavorMessage('diceInfo', game.i18n.localize('gs.dialog.dice'), defaultDice);

		// Adding Armor bonus/negative to chat window
		let shieldMod = itemInfo.system.mod;
		chatMessage += this._addToFlavorMessage('gearModifier', game.i18n.localize('gs.dialog.gearMod'), shieldMod);

		// Getting Class Level bonus, if any
		let { classBonus, message, stat } = this._getClassLevelBonus2('block', itemInfo, chatMessage);
		chatMessage = message;

		// Checking for Shields skill bonus
		const shieldsSkill = skills.find(s => s.name === 'Shields') || 0;
		let shieldsBonus = 0;
		if (shieldsSkill) {
			shieldsBonus = this._getSkillBonus(shieldsSkill.name);
			chatMessage += this._addToFlavorMessage('skillScore', shieldsSkill.name, shieldsBonus);
		}

		// Get random modifiers from Prompt
		let randomMods = await this._promptRandomModifiers();
		if (randomMods) chatMessage += this._addToFlavorMessage('miscScore', game.i18n.localize('gs.dialog.miscMod'), randomMods);

		// Setting Roll Message
		let rollString = this._setRollMessage(defaultDice, shieldMod, stat, classBonus, shieldsBonus, randomMods);

		// Rolling Dice
		let { roll, diceResults, rollTotal } = await this._rollDice(rollString);

		// Checking for Critical and Shieldsman skill
		const shieldsmanSkill = skills.find(s => s.name === 'Shieldsman') || 0;
		const critStatus = this._checkForCriticals(diceResults, shieldsmanSkill);

		// If Shieldsman bonus returned
		if (critStatus[2]) {
			shieldsBonus += critStatus[2];
			chatMessage += this._addToFlavorMessage('skillEffectiveScore', 'Shieldsman', critStatus[2]);
		}

		// Adding Armor Score to chat window
		chatMessage += this._addToFlavorMessage('armorDodgeScore', game.i18n.localize('gs.dialog.block.shieldScore'), itemInfo.system.score + shieldsBonus);

		// Adding critical information to chat window
		if (critStatus != undefined || critStatus != null)
			chatMessage += `${critStatus[1]}`;

		await roll.toMessage({
			speaker: { actor: actor },
			flavor: chatMessage,
			author: game.user
			// content: Change dice rolls and other items here if needed
		});
	}

	async _playerSpellCast(event) {
		event.preventDefault();
		const actor = this.actor;
		const actorToken = game.actors.get(actor._id).getActiveTokens()[0];
		const defaultDice = '2d6';
		const spellId = event.currentTarget.dataset.itemid;
		const spells = this._getFromItemsList('spell');
		const spellUsed = spells.find(s => s._id === spellId);
		const spellDC = spellUsed.system.difficulty;
		let chatMessage = this._setMessageHeader(actor, spellUsed, 'spellCast');

		// Adding Spell DC to chat
		chatMessage += this._addToFlavorMessage('rollScore', game.i18n.localize('gs.dialog.spells.diffCheck'), spellDC);

		// Setting base hit check dice to chat window
		chatMessage += this._addToFlavorMessage('diceInfo', game.i18n.localize('gs.dialog.dice'), defaultDice);

		// Get casting class level bonus
		let { classBonus, chatMessage: message, statUsed: stat } = this._getClassLevelBonus2('casting', spellUsed, chatMessage);
		chatMessage = message;

		// Get Skill Modifiers
		// Checking for Faith: XX skills
		let { skillBonus: tempFaithBonus, message: tempFaithMessage } = await this._faithCheck(spellUsed);
		if (tempFaithMessage) chatMessage += tempFaithMessage;

		// Checking Multiple Chants
		let { bonus: tempMChantBonus, message: tempMChantMessage } = await this._multiChantCheck();
		if (tempMChantMessage) chatMessage += tempMChantMessage;

		// Check for move pentalty and reduce as needed.
		let { message: moveMessage, movePenalty: movePen } = await this._reduceMovementPenalty();
		if (moveMessage) chatMessage += moveMessage;

		// Get random modifiers from Prompt
		let randomMods = await this._promptRandomModifiers();
		if (randomMods) chatMessage += this._addToFlavorMessage('miscScore', game.i18n.localize('gs.dialog.miscMod'), randomMods);

		// Setting Roll Message
		let rollString = this._setRollMessage(defaultDice, 0, stat, classBonus, tempMChantBonus, randomMods, movePen + tempFaithBonus);

		// Rolling Dice
		let { roll, diceResults, rollTotal } = await this._rollDice(rollString);

		// Getting Master of XX skill (if any) to modify crit range
		const skills = this._getFromItemsList('skill');
		let masterOfXX = skills.find(s => s.name === `Master of ${spellUsed.system.elementChoice}`) || null;

		// Setting EffectScore vs DC results
		let effectScoreResult = rollTotal >= spellDC ? true : false;

		// Checking for Crit Success/Failure
		const critStatus = this._checkForCriticals(diceResults, masterOfXX);
		if (critStatus[0] === 'success') {
			if (effectScoreResult)
				rollTotal += 5;
			else
				rollTotal = spellDC;
			chatMessage += this._addToFlavorMessage('diceInfo', game.i18n.localize('gs.gear.spells.efs'), rollTotal);
			chatMessage += `${critStatus[1]}`;
		} else if (critStatus[0] === 'normal') {
			chatMessage += this._addToFlavorMessage('diceInfo', game.i18n.localize('gs.gear.spells.efs'), rollTotal);
		} else if (critStatus[0] === 'fail') {
			chatMessage += this._addToFlavorMessage('diceInfo', game.i18n.localize('gs.gear.spells.efs'), rollTotal);
			rollTotal = 0;
			effectScoreResult = false;
		}
		chatMessage += this._checkEffectResulsts(effectScoreResult);

		// TODO: Add extra dice for specific spells here
		let results = null;
		if (effectScoreResult)
			results = this._addEffectiveResults(spellUsed, rollTotal);

		// Adding to chatMessage if anything is there
		let diceHold = null;
		if (results) {
			let tempTargets;
			for (let x = 0; x < results.length; x++) {
				if (x === 2)
					chatMessage += results[x];
				if (x === 1) {
					for (const [key, item] of Object.entries(results[1])) {
						if (key === 'recovery' || key === 'power')
							diceHold = this._setSpellPowerDice(key, item, spellUsed, tempTargets, rollTotal);
					}
				}
				if (x === 0)
					tempTargets = results[0];
			}
		}

		// Adding dice button to end of message if true
		if (diceHold)
			chatMessage += diceHold;

		// Sending dice rolls to chat window
		await roll.toMessage({
			speaker: { actor: actor },
			flavor: chatMessage,
			// author: game.user
			// content: Change dice rolls and other items here if needed
		});
	}

	async _playerSpellResistance(event) {
		event.preventDefault();
		const actor = this.actor;
		const skills = this._getFromItemsList('skill');
		const psyRef = actor.system.abilities.calc.pr;
		const advLvl = actor.system.levels.adventurer;
		const resistanceSkill = skills.find(s => s.name === 'Spell Resistance') || 0;
		const veilOfDarknessSkill = skills.find(s => s.name === 'Veil of Darkness') || 0;
		const defaultDice = '2d6';
		const fakeSkill = { name: game.i18n.localize('gs.actor.common.spRe') };
		let skillBonus = 0;

		// Setting up chatMessage
		let chatMessage = this._setMessageHeader(actor, fakeSkill, game.i18n.localize('gs.dialog.skillCheck'));

		// Setting dice modifiers to chatMessage
		chatMessage += this._addToFlavorMessage('diceInfo', game.i18n.localize('gs.dialog.dice'), defaultDice);
		chatMessage += this._addToFlavorMessage('abilScore', game.i18n.localize('gs.actor.character.psyRef'), psyRef);
		chatMessage += this._addToFlavorMessage('levelScore', game.i18n.localize('gs.gear.skills.adv') + " " + game.i18n.localize('gs.actor.common.leve'), advLvl);
		if (resistanceSkill) {
			chatMessage += this._addToFlavorMessage('skillScore', resistanceSkill.name, resistanceSkill.system.value);
			skillBonus += resistanceSkill.system.value;
		}
		if (veilOfDarknessSkill && veilOfDarknessSkill.system.value > 1) {
			chatMessage += this._addToFlavorMessage('skillScore', veilOfDarknessSkill.name, veilOfDarknessSkill.system.value - 1);
			skillBonus += veilOfDarknessSkill.system.value - 1;
		}

		// Prompting for any random modifications
		const randomMods = await this._promptRandomModifiers();
		if (randomMods) chatMessage += this._addToFlavorMessage('miscScore', game.i18n.localize('gs.dialog.miscMod'), randomMods);

		// Setting Roll Message
		let rollString = this._setRollMessage(defaultDice, 0, psyRef, advLvl, skillBonus, randomMods);

		// Rolling Dice
		let { roll, diceResults, rollTotal } = await this._rollDice(rollString);

		// Checking for Crit Success/Failure
		const critStatus = this._checkForCriticals(diceResults, 0);
		if (critStatus != undefined || critStatus != null)
			chatMessage += `${critStatus[1]}`;

		// Sending dice rolls to chat window
		await roll.toMessage({
			speaker: { actor: actor },
			flavor: chatMessage,
			author: game.user
			// content: Change dice rolls and other items here if needed
		});
	}

	async _monsterAttack(event) {
		event.preventDefault();
		const targets = Array.from(game.user.targets);
		const targetToken = targets[0]?.document?.actor?.getActiveTokens()[0] || 0;

		// Return early if target isn't selected and warn player
		if (!this._checkTargets(targetToken)) {
			return;
		}

		const actor = this.actor;
		const actorToken = game.actors.get(actor._id).getActiveTokens()[0];
		const monsterHitDiv = event.currentTarget.closest('.monsterHit');
		const attackValue = monsterHitDiv.dataset.attacknum;
		const power = monsterHitDiv.querySelector('.hiddenPower').value;
		const weaponName = monsterHitDiv.querySelector('.hiddenName').value;
		console.log('gsas power', power, weaponName);

		// Checking if range is vallid before rolling attacks, else return early
		const rangeValid = this._checkWeaponRange(actorToken, targetToken, actor, attackValue);
		if (!rangeValid) {
			ui.notifications.warn(game.i18n.localize('gs.dialog.outOfRange'));
			return;
		}

		const encounterBoss = actor.system.isBoss;
		const selectedAttack = actor.system.attacks[attackValue];
		const monsterToken = actor.getActiveTokens()[0];
		let chatMessage = this._setMessageHeader(actor, selectedAttack, 'toHit');

		// Checking if monster is boss or not.
		if (encounterBoss) {
			// Adding dice + bonus to chat window
			const bossDice = actor.system.attacks[attackValue].check.split('+');
			chatMessage += this._addToFlavorMessage('diceInfo', game.i18n.localize('gs.dialog.dice'), bossDice[0]);
			chatMessage += this._addToFlavorMessage('gearModifier', game.i18n.localize('gs.dialog.bonus'), bossDice[1]);

			// Get random modifiers from Prompt
			let randomMods = await this._promptRandomModifiers();
			if (randomMods) chatMessage += this._addToFlavorMessage('miscScore', game.i18n.localize('gs.dialog.miscMod'), randomMods);

			// Setting Roll Message
			let rollString = this._setRollMessage(bossDice[0], bossDice[1], 0, 0, 0, randomMods);

			// Rolling Dice
			let { roll, diceResults, rollTotal } = await this._rollDice(rollString);

			// Checking for Crit Success/Failure
			const critStatus = this._checkForCriticals(diceResults, null);
			if (critStatus != undefined || critStatus != null)
				chatMessage += `${critStatus[1]}`;

			// Setting boss' target info
			chatMessage += this._setPlayerTargetInfo(targets, power, weaponName);

			// Sending dice rolls to chat window
			await roll.toMessage({
				speaker: { alias: monsterToken.name },
				flavor: chatMessage,
				author: game.user
				// content: Change dice rolls and other items here if needed
			});
		} else {
			// Adding static attack score to chat window
			chatMessage += this._addToFlavorMessage('gearModifier', game.i18n.localize('gs.actor.monster.atta'), selectedAttack.mCheck);
			// Setting minion's target info
			chatMessage += this._setPlayerTargetInfo(targets, power, weaponName);

			ChatMessage.create({
				speaker: { alias: monsterToken.name },
				flavor: chatMessage,
				author: game.user
			});
		}
	}

	_checkTargets(targetToken) {
		// Return early if target isn't selected and warn player
		if (!targetToken) {
			ui.notifications.warn(game.i18n.localize('gs.dialog.firstTargetMonster'));
			return false;
		} else {
			return true;
		}
	}

	_curvedShotCheck(itemInfo, skills) {
		const curvedShot = skills.find(s => s.name === 'Curved Shot');
		this.actor.setFlag('gs', 'Curved Shot', {
			bowRange: itemInfo.system.range / 2,
			reducedPower: 2, // Negated in attack roll in gs.mjs file
			targetReduction: curvedShot.system.value < 5 ? curvedShot.system.value + 1 : curvedShot.system.value
		});
	}

	_checkWeaponRange(actorToken, targetToken, weaponInfo, monsterValue = false) {
		const curvedShotFlag = this.actor.getFlag('gs', 'Curved Shot') || 0;
		let weaponRange = 0;
		if (curvedShotFlag && (weaponInfo.system.type.split(" / ")[0] === "Bow"))
			weaponRange = curvedShotFlag.bowRange;
		else
			if (monsterValue === false)
				weaponRange = parseInt(weaponInfo.system.range, 10);
			else
				weaponRange = parseInt(weaponInfo.system.attacks[monsterValue].range, 10);
		const path = [actorToken.center, targetToken.center];
		const distanceInfo = canvas.grid.measurePath(path);
		// console.log('... checking weapon range check:', weaponRange, path, distanceInfo);
		if (distanceInfo.distance <= weaponRange) return true;
		else return false;
	}

	_updateWeaponHitMod(skill) {
		const str = this.actor.system.abilities.primary.str;
		let skillValue = skill.system.value;

		// Helper function
		const setEffectiveBonus = value => this.actor.setFlag('gs', skill.name, value);

		//Calculating str bonus adjustments
		if (skillValue === 1)
			skillValue = Math.round(str * 0.25);
		else if (skillValue === 2)
			skillValue = Math.round(str * 0.5);
		else if (skillValue === 3) {
			skillValue = Math.round(str * 0.5);
			setEffectiveBonus(1);
		} else {
			if (skillValue === 4) setEffectiveBonus(3);
			else setEffectiveBonus(4);
			skillValue = str;
		}

		return -1 * skillValue;
	}

	_pullItemInfo(event, actor) {
		const itemID = event.currentTarget.dataset.itemid;
		return actor.items.find(i => i._id === itemID);
	}

	_setMessageHeader(actor, attackResource, labelHeading) {
		const tokenImg = actor.prototypeToken.texture.src;
		const labelMapping = {
			'toHit': game.i18n.localize('gs.actor.monster.supportEffect.hit'),
			'dodge': game.i18n.localize('gs.dialog.dodge.roll'),
			'block': game.i18n.localize('gs.dialog.block.roll'),
			'spellCast': game.i18n.localize('gs.dialog.spells.useCheck'),
		};
		const messageLabel = labelMapping[labelHeading] || labelHeading; //labelHeading here is used for GenSkill Roll Type eg Int Focus, etc.
		return `<div class="chat messageHeader grid grid-7col">
			<img src='${tokenImg}'><h2 class="actorName grid-span-6">${attackResource.name}: ${messageLabel}</h2>
		</div>`;
	}

	_setMessageEnder() {
		return '<div class="chat messageEnder"></div>';
	}

	_getClassLevelBonus2(classifier, itemInfo, chatMessage) {
		// Get's level score from JSON and applies it to the correctly labeled const, ex: monk = ...classes.monk || necro = ...classes.necro
		const { fighter = 0, monk = 0, ranger = 0, scout = 0, sorcerer = 0, priest = 0, dragon = 0, shaman = 0, necro = 0 } = this.actor.system.levels.classes;
		const abilityScores = this.actor.system.abilities.calc;
		let classBonus = 0, statUsed = 0;

		if (classifier === 'weapon') {
			let [weaponType, weaponWeight] = itemInfo.system.type.split(" / ").map(type => type.toLowerCase());

			// Setting ability score to message
			statUsed = abilityScores.tf;
			chatMessage += this._addToFlavorMessage('abilScore', game.i18n.localize('gs.actor.character.tec') + " " + game.i18n.localize('gs.actor.character.foc'), statUsed);

			if (weaponType !== "bow" && weaponType !== "throwing") {
				// Function to search through weapon arrays for specific types of weapons
				const includesAny = (words, text) => words.some(word => text.includes(word));
				// check for all melee weapons and class bonuses
				const fighterWeapons = ["one-handed sword", "two-handed sword", "ax", "spear", "mace"];
				const monkWeapons = ["close-combat", "staff"];
				const scoutWeapons = ["one-handed sword", "ax", "spear", "mace", "close-combat", "staff"];
				if (fighter >= scout && includesAny(fighterWeapons, weaponType)) {
					classBonus = fighter;
					if (classBonus) chatMessage += this._addToFlavorMessage('levelScore', game.i18n.localize('gs.actor.character.figh'), classBonus);
				} else if (monk >= scout && includesAny(monkWeapons, weaponType)) {
					classBonus = monk;
					if (classBonus) chatMessage += this._addToFlavorMessage('levelScore', game.i18n.localize('gs.actor.character.monk'), classBonus);
				} else if ((scout >= fighter || scout >= monk) && includesAny(scoutWeapons, weaponType) && weaponWeight === 'light') {
					classBonus = scout;
					if (classBonus) chatMessage += this._addToFlavorMessage('levelScore', game.i18n.localize('gs.actor.character.scou'), classBonus);
				}
			} else if (weaponType === "bow" || weaponType === "throwing") {
				// check for all ranged weaopns and class bonuses
				if (weaponType === 'bow' && ranger) { // Bows and guns only
					classBonus = ranger;
					if (classBonus) chatMessage += this._addToFlavorMessage('levelScore', game.i18n.localize('gs.actor.character.rang'), classBonus);
				} else { // All other throwing weapons
					if (monk >= ranger || monk >= scout) {
						classBonus = monk;
						if (classBonus) chatMessage += this._addToFlavorMessage('levelScore', game.i18n.localize('gs.actor.character.monk'), classBonus);
					} else if (ranger >= scount || ranger >= monk) {
						classBonus = ranger;
						if (classBonus) chatMessage += this._addToFlavorMessage('levelScore', game.i18n.localize('gs.actor.character.rang'), classBonus);
					} else if (scout >= monk || scout >= ranger) {
						classBonus = scout;
						if (classBonus) chatMessage += this._addToFlavorMessage('levelScore', game.i18n.localize('gs.actor.character.scou'), classBonus);
					}
				}
			}
		} else if (classifier === 'dodge') {
			statUsed = abilityScores.tr;
			chatMessage += this._addToFlavorMessage('abilScore', game.i18n.localize('gs.actor.character.tec') + " " + game.i18n.localize('gs.actor.character.ref'), statUsed);
			if ((fighter >= monk && fighter >= scout) && fighter > 0) {
				classBonus = fighter;
				if (classBonus) chatMessage += this._addToFlavorMessage('levelScore', game.i18n.localize('gs.actor.character.figh'), classBonus);
			} else if ((monk >= fighter && monk >= scout) && monk > 0) {
				classBonus = monk;
				if (classBonus) chatMessage += this._addToFlavorMessage('levelScore', game.i18n.localize('gs.actor.character.monk'), classBonus);
			} else if ((scout >= fighter && scout >= monk) && scout > 0) {
				classBonus = scout;
				if (classBonus) chatMessage += this._addToFlavorMessage('levelScore', game.i18n.localize('gs.actor.character.scou'), classBonus);
			}
		} else if (classifier === 'block') {
			let [shieldType, shieldWeight] = itemInfo.system.type.split(" / ").map(type => type.toLowerCase());
			statUsed = abilityScores.tr;
			chatMessage += this._addToFlavorMessage('abilScore', game.i18n.localize('gs.actor.character.tec') + " " + game.i18n.localize('gs.actor.character.ref'), statUsed);
			if ((fighter >= scout) && fighter > 0) {
				classBonus = fighter;
				if (classBonus) chatMessage += this._addToFlavorMessage('levelScore', game.i18n.localize('gs.actor.character.figh'), classBonus);
			} else if (scout >= fighter && scout > 0 && shieldWeight === 'light') {
				classBonus = scout;
				if (classBonus) chatMessage += this._addToFlavorMessage('levelScore', game.i18n.localize('gs.actor.character.scou'), classBonus);
			}
		} else if (classifier === 'casting') {
			let schoolChoice = itemInfo.system.schoolChoice;
			const psyBased = ["Miracle", "Spirit Arts", "Ancestral Dragon"];
			const intBased = ['Words of True Power', 'Necromancy'];
			if (intBased.includes(schoolChoice)) {
				statUsed = abilityScores.if;
				chatMessage += this._addToFlavorMessage('abilScore', game.i18n.localize('gs.actor.character.intFoc'), statUsed);
				if (schoolChoice === 'Words of True Power') {
					classBonus = sorcerer;
					chatMessage += this._addToFlavorMessage('levelScore', game.i18n.localize('gs.actor.character.sorcerer'), classBonus);
				} else {
					classBonus = necro;
					chatMessage += this._addToFlavorMessage('levelScore', game.i18n.localize('gs.actor.character.necro'), classBonus);
				}
			} else if (psyBased.includes(schoolChoice)) {
				statUsed = abilityScores.pf;
				chatMessage += this._addToFlavorMessage('abilScore', game.i18n.localize('gs.actor.character.psyFoc'), statUsed);
				if (schoolChoice === 'Miracle') {
					classBonus = priest;
					chatMessage += this._addToFlavorMessage('levelScore', game.i18n.localize('gs.actor.character.priest'), classBonus);
				} else if (schoolChoice === 'Spirit Arts') {
					classBonus = shaman;
					chatMessage += this._addToFlavorMessage('levelScore', game.i18n.localize('gs.actor.character.shaman'), classBonus);
				} else {
					classBonus = dragon;
					chatMessage += this._addToFlavorMessage('levelScore', game.i18n.localize('gs.actor.character.dragon'), classBonus);
				}
			}
		}
		return { classBonus, chatMessage, statUsed };
	}

	async _getHitSkillModifier(skills, itemInfo) {
		let skillBonus = 0, skillMessage = '';
		const weaponType = itemInfo.system.type.split(" / ")[0];

		const skillWeaponMapping = {
			'Bow': ['Weapons: Bow', 'Snipe', 'Rapid Fire'],
			'Throwing': ['Weapons: Throwing', 'Snipe', 'Rapid Fire'],
			'One-Handed Sword': ['Weapons: One-Handed Sword', 'Dual Wielding'],
			'Two-Handed Sword': ['Weapons: Two-Handed Sword', 'Mow Down'],
			'Ax': ['Weapons: Ax', 'Dual Wielding', 'Mow Down'],
			'Close-Combat': ['Weapons: Close-Combat', 'Dual Wielding', 'Mow Down'],
			'Mace': ['Weapons: Mace', 'Dual Wielding', 'Mow Down'],
			'Spear': ['Weapons: Spear', 'Dual Wielding', 'Mow Down'],
			'Staff': ['Weapons: Staff', 'Mow Down']
		};

		const relevantSkills = skillWeaponMapping[weaponType];

		for (const s of skills) {
			let tempBonus = 0;
			if (relevantSkills.includes(s.name)) {
				if (s.name === 'Snipe') tempBonus = (s.system.value + 1) * 2;
				if (s.name === 'Rapid Fire') {
					const rFPenalty = itemInfo.system.effect.rFire;
					const skillValue = s.system.value;
					let targetSequence = 0;
					let rFFlag = this.actor.getFlag('gs', s.name);
					if (skillValue === 1) {
						if (!rFFlag)
							this.actor.setFlag('gs', s.name, 1);
						else {
							this.actor.unsetFlag('gs', s.name);
							tempBonus = rFPenalty;
						}
					} else { // SkillValues 2 - 5
						targetSequence = await this._promptMiscModChoice('rapidFire');
						if (skillValue > 1 && skillValue < 5) {
							if (targetSequence === 1) {
								if (!rFFlag)
									this.actor.setFlag('gs', s.name, 1);
								else {
									this.actor.unsetFlag('gs', s.name);
									tempBonus = skillValue > 2 ? rFPenalty / 2 : rFPenalty;
								}
							} else {
								if (!rFFlag) {
									this.actor.setFlag('gs', s.name, 1);
									tempBonus = skillValue > 3 ? rFPenalty / 2 : rFPenalty;
								} else {
									this.actor.unsetFlag('gs', s.name);
									tempBonus = skillValue > 3 ? rFPenalty / 2 : rFPenalty;
								}
							}
						} else { // SkillValue == 5
							if (targetSequence === 1) {
								if (!rFFlag)
									this.actor.setFlag('gs', s.name, 1);
								else {
									this.actor.setFlag('gs', s.name, rFFlag + 1);
									tempBonus = skillValue > 2 ? rFPenalty / 2 : rFPenalty;
								}
							} else {
								if (!rFFlag) {
									this.actor.setFlag('gs', s.name, 1);
									tempBonus = skillValue > 3 ? rFPenalty / 2 : rFPenalty;
								} else {
									this.actor.setFlag('gs', s.name, rFFlag + 1);
									tempBonus = skillValue > 2 ? rFPenalty / 2 : rFPenalty;
								}
							}
						}
						rFFlag = this.actor.getFlag('gs', s.name);
						if (rFFlag === 2)
							this.actor.unsetFlag('gs', s.name);
					}
				}
				else if (s.name === 'Dual Wielding') {
					let numbTargets = 1;
					if (s.system.value > 1)
						numbTargets = await this._promptMiscModChoice('dualWielding');
					if (numbTargets === 1) {
						if (s.system.value <= 2) tempBonus = -4;
						else if (s.system.value <= 4) tempBonus = -3;
						else tempBonus = -2;
					} else {
						if (s.system.value <= 3) tempBonus = -6;
						else if (s.system.value <= 4) tempBonus = -5;
						else tempBonus = -3;
					}
				} else if (s.name === 'Mow Down') {
					const weaponUse = itemInfo.system.use;
					const weaponAttr = itemInfo.system.attribute;
					const weaponAttrSplit = weaponAttr.split('/');
					const attributes = ['Slash', 'Bludgeoning'];
					if (weaponUse.toLowerCase() === 'two-handed' && weaponAttrSplit.some(attr => attributes.includes(attr))) {
						const modHitPen = await this._promptMiscModChoice("mowDown", s.system.value);
						tempBonus = modHitPen;
					}
				} else if (s.name === `Weapons: ${itemInfo.system.type.split(" / ")[0]}`) tempBonus = s.system.value;
				skillMessage += this._addToFlavorMessage('skillScore', s.name, tempBonus);
				skillBonus += tempBonus;
			} else if (s.name === 'Slip Behind') {
				const skillPromptChoice = await this._promptMiscModChoice('slipBehind');
				if (skillPromptChoice === 1) {
					skillBonus = s.system.value * 2;
					skillMessage += this._addToFlavorMessage('skillScore', s.name, skillBonus);
				}
			}
		}
		return { skillBonus, skillMessage };
	}

	_promptRandomModifiers() {
		return new Promise((resolve) => {
			const dialogContent = `
				<h3>${game.i18n.localize("gs.dialog.mods.addMod")}</h3>
				<p>${game.i18n.localize("gs.dialog.mods.addInfo")}</p>
				<input type="text" class="rollMod" style="margin-bottom: 10px;" />`;
			const promptTitle = game.i18n.localize("gs.dialog.mods.mod");
			const button1 = {
				label: game.i18n.localize("gs.dialog.mods.addMod"),
				callback: (html) => {
					resolve(this._getRollMod(html, ".rollMod"));
				}
			};
			const button2 = {
				label: game.i18n.localize("gs.dialog.cancel"),
				callback: () => {
					resolve(0);
				}
			};

			new Dialog({
				title: promptTitle,
				content: dialogContent,
				buttons: { button1: button1, buttonTwo: button2 },
				default: "button1",
				close: () => "",
			}).render(true);
		});
	}

	async _rollDice(rollString) {
		const roll = new Roll(rollString);
		await roll.evaluate();
		let diceResults = roll.terms[0].results.map(r => r.result);
		let rollTotal = roll.total;
		return { roll, diceResults, rollTotal };
	}

	_checkEffectivenessSkills(skills, itemInfo) {
		let tempAmount = 0;
		let eSMessage = '';
		const itemEffects = itemInfo.system.effect;
		const str = this.actor.system.abilities.primary.str;
		const gorTactFlag = this.actor.getFlag('gs', 'Gorilla Tactics') || 0;
		skills.forEach(skill => {
			if (skill.name === "Piercing Attack" && itemEffects.checked[6]) {
				tempAmount = (skill.system.value * itemEffects.pierce);
				eSMessage = this._addToFlavorMessage('skillEffectiveScore', skill.name, tempAmount);
			} else if (skill.name === "Strong Blow: Bludgeon" && itemEffects.checked[11]) {
				tempAmount = Math.round((0.25 * (skill.system.value - 1) + 0.25) * str) + itemEffects.sbBludg;
				eSMessage = this._addToFlavorMessage('skillEffectiveScore', skill.name, tempAmount);
			} else if (skill.name === "Strong Blow: Slash" && itemEffects.checked[12]) {
				tempAmount = Math.round((0.25 * (skill.system.value - 1) + 0.25) * str) + itemEffects.sbSlash;
				eSMessage = this._addToFlavorMessage('skillEffectiveScore', skill.name, tempAmount);
			}
		});
		if (gorTactFlag) {
			tempAmount += gorTactFlag;
			eSMessage += this._addToFlavorMessage('skillEffectiveScore', 'Gorilla Tactics', gorTactFlag);
		}
		return { tempAmount, eSMessage };
	}

	_getExtraDamage(rollTotal) {
		let extraDamage;
		if (rollTotal > 14) {
			if (rollTotal > 14 && rollTotal < 20)
				extraDamage = '1d6';
			else if (rollTotal > 19 && rollTotal < 25)
				extraDamage = '2d6';
			else if (rollTotal > 24 && rollTotal < 30)
				extraDamage = '3d6';
			else if (rollTotal > 29 && rollTotal < 40)
				extraDamage = '4d6';
			else
				extraDamage = '5d6';
		}
		return extraDamage;
	}

	_checkForCriticals(diceResults, skill) {
		let critSuccess = 12, critFail = 2, results = [], skillValue = 0, blockScoreBonus = 0, diceResultTotal = diceResults[0] + diceResults[1];

		// Setting Up Skill Names
		const successFailRangeSkills = ['alert', 'slice attack'];
		const masterOfElements = ['Fire', 'Water', 'Wind', 'Earth', 'Life'];

		// Updating crit rates if skill found
		if (skill) {
			skillValue = skill.system.value;

			const setCritRange = skillValue => {
				if (skillValue < 3) critSuccess = 11;
				else if (skillValue < 5) critSuccess = 10;
				else if (skillValue == 5) critSuccess = 9;
			};

			if (successFailRangeSkills.includes(skill.name.toLowerCase())) {
				if (skillValue === 1) { critSuccess = 11; critFail = 5; }
				else if (skillValue === 2) { critSuccess = 11; critFail = 4; }
				else if (skillValue === 3) { critSuccess = 10; critFail = 4; }
				else if (skillValue === 4) { critSuccess = 10; critFail = 3; }
				else if (skillValue === 5) { critSuccess = 9; critFail = 3; }
			} else if (masterOfElements.includes(skill?.name.split(" ")[2])) {
				setCritRange(skillValue);
			} else if (skill.name === 'Shieldsman') {
				setCritRange(skillValue);
				if (skillValue > 1) {
					if (diceResultTotal >= 6 && skillValue > 4) blockScoreBonus = 3;
					else if ((diceResultTotal >= 7 && skillValue > 3) || (diceResultTotal >= 8 && skillValue > 2)) blockScoreBonus = 2;
					else if (diceResultTotal >= 9 && skillValue > 1) blockScoreBonus = 1;
					if (blockScoreBonus > 0) results[2] = blockScoreBonus;
				}
			}
		}

		// Comparing results to [un]modified crit ranges
		if (diceResultTotal <= critFail) {
			results[0] = 'fail';
			results[1] = `<div class='critFailColor'>${game.i18n.localize("gs.dialog.crits.crit")} ${game.i18n.localize("gs.dialog.crits.fail")}</div>`;
		} else if (diceResultTotal >= critSuccess) {
			results[0] = 'success';
			results[1] = `<div class='critSuccessColor'>${game.i18n.localize("gs.dialog.crits.crit")} ${game.i18n.localize("gs.dialog.crits.succ")}</div>`;
		} else {
			results[0] = 'normal';
			results[1] = '';
		}
		return results;
	}

	_setMonsterTargetInfo(targets, itemInfo, extraDmg) {
		const activeTarget = targets[0].document.actor.getActiveTokens()[0];
		const monster = targets[0].document.actor;
		const isBoss = monster.system.isBoss;
		const hasBlock = monster.system.hasBlock;

		const dodgeValue = isBoss ? monster.system.defenses.boss.dodge : monster.system.defenses.minion.dodge;
		const blockValue = hasBlock ? isBoss ? monster.system.defenses.boss.block : monster.system.defenses.minion.block : monster.system.defenses.minion.block;

		let targetMessage = `<h2 class="targetsLabel">${game.i18n.localize('gs.dialog.mowDown.targets')}</h2>
		<div class="target grid grid-9col">
			<img class="targetImg" src="${activeTarget.document.texture.src}">
			<h3 class="targetName grid-span-5">${activeTarget.document.name}</h3>
			<button type="button" class="monsterDefRoll gm-view" data-monsterid="${monster._id}" data-playerid="${this.actor._id}" data-type="dodge" data-value="${dodgeValue}" title="${game.i18n.localize('gs.dialog.actorSheet.itemsTab.dodge')}"><i class="fa-solid fa-angles-right"></i></button>
			<button type="button" class="monsterDefRoll gm-view" data-monsterid="${monster._id}" data-playerid="${this.actor._id}" data-type="block" data-value="${blockValue}" title="${game.i18n.localize('gs.dialog.actorSheet.itemsTab.block')}" ${hasBlock ? `` : `disabled`}><i class="fa-solid fa-shield-halved"></i></i></button>
			<button type="button" class="actorDamageRoll" data-extradmg="${extraDmg}" data-playerid="${this.actor._id}" data-id="${itemInfo._id}" title="${game.i18n.localize('gs.dialog.actorSheet.itemsTab.power')}"><i class="fa-solid fa-burst"></i></button>
		</div>`;
		return targetMessage;
	}

	_setPlayerTargetInfo(targets, weaponPower, weaponName) {
		const activeTarget = targets[0].document.actor.getActiveTokens()[0];
		const player = targets[0].document.actor;
		const shield = this._getEquippedArmor(this._getFromItemsList('shield'));

		//console.log('... checking weaponInfo', this.actor._id, this.actor.name);

		let targetMessage = `<h2 class="targetsLabel">${game.i18n.localize('gs.dialog.mowDown.targets')}</h2>
		<div class="target grid grid-9col">
			<img class="targetImg" src="${activeTarget.document.texture.src}">
			<h3 class="targetName grid-span-5">${activeTarget.document.name}</h3>
			<button type="button" class="playerDodgeRoll" data-playerid="${player._id}" data-monsterid="${this.actor._id}" title="${game.i18n.localize('gs.dialog.actorSheet.itemsTab.dodge')}"><i class="fa-solid fa-angles-right"></i></button>
			<button type="button" class="playerShieldBlock" data-playerid="${player._id}" data-monsterid="${this.actor._id}" title="${game.i18n.localize('gs.dialog.actorSheet.itemsTab.block')}" ${shield ? `` : `disabled`}><i class="fa-solid fa-shield-halved"></i></i></button>
			<button type="button" class="monsterDamageRoll gm-view" data-playerid="${player._id}" data-monsterid="${this.actor._id}" data-weaponname="${weaponName}" data-weaponpower="${weaponPower}" title="${game.i18n.localize('gs.dialog.actorSheet.itemsTab.power')}"><i class="fa-solid fa-burst"></i></button>
		</div>`;
		return targetMessage;
	}

	_setSpellPowerDice(key, extractedDice, spell, targets, spellDC) {
		return `<div class='spellTarget grid grid-2col'>
			<div style="display:flex; justify-content: center; align-items: center; font-size: 14px;">${game.i18n.localize('gs.dialog.spells.rolldice')}</div>
			<button type="button" class="actorSpellDmg" data-spelldc="${spellDC}" data-targets="${targets}" data-keytype="${key}" data-rolldice="${extractedDice}" data-playerid="${this.actor._id}" data-spell="${spell._id}"><i class="fa-solid fa-wand-magic-sparkles"></i></button>
		</div>`;
	}

	async _genRollsToWindow(promptChoices) {
		// promptChoices = [labelText 0, abilityScore 1, classLevelBonus 2, modifiers 3, className 4, skillBonus 5, skill 6];
		const defaultDice = '2d6';

		// Adding header information
		let chatMessage = this._setMessageHeader(this.actor, promptChoices[6], promptChoices[0]);

		// Adding defualt dice
		chatMessage += this._addToFlavorMessage('diceInfo', game.i18n.localize('gs.dialog.dice'), defaultDice);

		// Adding Ability Score
		chatMessage += this._addToFlavorMessage('abilScore', promptChoices[0], promptChoices[1]);

		// Adding Class Level bonus, if any
		const className = promptChoices[4];
		if (promptChoices[2])
			chatMessage += this._addToFlavorMessage('levelScore', className.charAt(0).toUpperCase() + className.slice(1), promptChoices[2]);

		// Adding skill score bonus
		chatMessage += this._addToFlavorMessage('skillScore', promptChoices[6].name, promptChoices[5]);
		if (promptChoices[6].name === 'Riding') {
			const skills = this._getFromItemsList('skill');
			const tamingSkill = skills.find(s => s.name === 'Taming') || 0;
			if (tamingSkill) {
				let skillValue = tamingSkill.system.value < 3 ? tamingSkill.system.value : 4;
				chatMessage += this._addToFlavorMessage('skillScore', tamingSkill.name, skillValue);
				promptChoices[5] += skillValue;
			}
		}

		// Adding misc modifiers
		if (promptChoices[3])
			chatMessage += this._addToFlavorMessage('miscScore', game.i18n.localize('gs.dialog.miscMod'), promptChoices[3]);

		// Setting Roll Message
		let rollString = this._setRollMessage(defaultDice, 0, promptChoices[1], promptChoices[2], promptChoices[5], promptChoices[3]);

		// Rolling Dice
		let { roll, diceResults, rollTotal } = await this._rollDice(rollString);

		// Checking for Crit Success/Failure
		const critStatus = this._checkForCriticals(diceResults, 0);
		if (critStatus != undefined || critStatus != null)
			chatMessage += `${critStatus[1]}`;

		// Sending dice rolls to chat window
		await roll.toMessage({
			speaker: { actor: this.actor },
			flavor: chatMessage,
			user: game.user.id
			// content: Change dice rolls and other items here if needed
		});
	}

	/**
	 * Returns a JSON object from the items field with the given type
	 * @param {string} typeName The type of item you want returned: "weapon", "armor", "shield", "item", "spell", "skill", "race", "martialtechniques"
	 * @returns JSON object of the given type
	 */
	_getFromItemsList(typeName) {
		return this.actor.items.filter(i => i.type === typeName) || 0;
	}

	async _faithCheck(spell) {
		const skills = this._getFromItemsList('skill');
		let message = '';
		let skillBonus = 0;
		const spellFaith = ['Miracle', 'Ancestral Dragon'];
		const faithBonus = ['Faith: Supreme God', 'Faith: Earth Mother', 'Faith: Trade God', 'Faith: God of Knowledge', 'Faith: Valkyrie'];

		// Return early if school choice is not listed below
		if (!spellFaith.includes(spell.system.schoolChoice))
			return { skillBonus, message };

		const setSkillInfo = async (skillBonus, theSkill) => {
			const chantlessMod = await this._promptMiscModChoice('faith');
			if (chantlessMod) {
				skillBonus = skillBonus === 1 ? -4 : skillBonus === 2 ? -2 : 0;
				message += this._addToFlavorMessage('skillScore', theSkill.name, skillBonus);
			} else
				skillBonus = 0;
			return skillBonus;
		}

		const dragonFaith = skills.find(s => s.name === 'Faith: Ancestral Dragon')?.name || '';

		if (spell.system.schoolChoice === 'Ancestral Dragon' && (dragonFaith === 'Faith: Ancestral Dragon')) {
			const dragonSkill = skills.find(s => s.name === 'Faith: Ancestral Dragon');
			skillBonus = dragonSkill.system.value;
			skillBonus = await setSkillInfo(skillBonus, dragonSkill);
		}
		if (spell.system.schoolChoice === 'Miracle') {
			let theSkill = null;
			skills.forEach(s => {
				if (faithBonus.includes(s.name))
					theSkill = s;
			});
			if (theSkill) {
				skillBonus = this._getSkillBonus(theSkill.name);
				skillBonus = await setSkillInfo(skillBonus, theSkill);
			}
		}
		return { skillBonus, message };
	}

	async _multiChantCheck() {
		const skills = this._getFromItemsList('skill');
		const multiChantSkill = skills.find(s => s.name === 'Multiple Chants') || 0;
		let bonus = 0, message = '';

		// Return early if skill is missing
		if (!multiChantSkill) return { bonus, message };

		// Getting skill Value and prompting for spells being cast
		const skillValue = this._getSkillBonus(multiChantSkill.name);
		const numOfSpellsUsed = await this._promptMiscModChoice('multipleChants', skillValue);
		if (numOfSpellsUsed === 2)
			bonus = skillValue === 1 ? -8 : skillValue === 2 ? -4 : skillValue === 3 ? -4 : skillValue === 4 ? -2 : 0;
		else if (numOfSpellsUsed === 3)
			bonus = skillValue === 3 ? -8 : -4;

		message = this._addToFlavorMessage('skillScore', multiChantSkill.name, bonus);
		return { bonus, message };
	}

	_reduceMovementPenalty() {
		const movementPenalty = this.actor.getFlag('gs', 'Movement Penalty');
		let message, movePenalty = 0, skillBonus = 0;

		// If move penalty not found, return early
		if (!movementPenalty) return { message, movePenalty };

		// Looking for Moving Chant Skill
		const skills = this._getFromItemsList('skill');
		const movingChantSkill = skills.find(s => skill.name === 'Moving Chant') || 0;

		// Return if not found
		if (!movingChantSkill) {
			movePenalty = movementPenalty;
			return { message, movePenalty };
		}

		// Calculate new neg modifier
		let movingChantBonus = movingChantSkill.system.value;
		if (movingChantBonus < 4) {
			movePenalty = movementPenalty - (movingChantBonus + 1);
			skillBonus = movingChantBonus + 1
		} else if (movingChantBonus < 5) {
			movePenalty = movementPenalty - (movingChantBonus + 2);
			skillBonus = movingChantBonus + 2
		} else
			skillBonus = movementPenalty;

		message = this._addToFlavorMessage('skillEffectiveScore', movingChantSkill.name, skillBonus);

		return { message, movePenalty };
	}

	_addEffectiveResults(spellUsed, rollTotal) {
		const tempSpellSchool = spellUsed.system.schoolChoice.split(" ");
		const tempSpellName = spellUsed.name.split(" ");
		let lowerCamelSpellName = '', lowerCamelSchoolName = '';
		let configSpell;
		let results = [];

		// Converting spell name to lowerCamelCase.
		for (let x = 0; x < tempSpellName.length; x++)
			x === 0 ? lowerCamelSpellName = tempSpellName[x].toLowerCase() : lowerCamelSpellName += tempSpellName[x];

		// Converting school name to lowerCamelCase
		for (let x = 0; x < tempSpellSchool.length; x++)
			x === 0 ? lowerCamelSchoolName = tempSpellSchool[x].toLowerCase() : lowerCamelSchoolName += tempSpellSchool[x];

		// Grabbling spell effect score range and modifications
		configSpell = CONFIG.gs.spells[lowerCamelSchoolName][lowerCamelSpellName].effectiveScore;

		// Adding target info to results
		results.push(CONFIG.gs.spells[lowerCamelSchoolName][lowerCamelSpellName].target);

		configSpell.forEach(s => {
			if (rollTotal >= s.range[0] && rollTotal <= s.range[1])
				results.push(s);
		});

		for (let [key, item] of Object.entries(results[1])) {
			if (key !== 'range') {
				results.push(this._addToFlavorMessage('armorDodgeScore', key.charAt(0).toUpperCase() + key.slice(1), item));
			}
		}

		return results;
	}

	_checkEffectResulsts(effectScoreResult) {
		if (effectScoreResult)
			return this._addEffectiveMessage('spellCastSuccess', game.i18n.localize('gs.dialog.spells.cast'), game.i18n.localize('gs.dialog.crits.succ'));
		else
			return this._addEffectiveMessage('spellCastFailure', game.i18n.localize('gs.dialog.spells.cast'), game.i18n.localize('gs.dialog.crits.fail'));
	}

	_equipGear(event) {
		event.preventDefault();
		const itemId = event.currentTarget.dataset.itemid;
		const actor = this.actor;
		const item = actor.items.find(i => i.id === itemId);
		console.log("... item", item);
		item.update({
			"system.equip": !item.system?.equip
		});
	}

	_getEquippedArmor(defenseItems) {
		// Find the first equipped armor or default to a fake JSON object
		return (
			defenseItems.find(i => i.system.equip) ||
			{ system: { dodge: 0 } }
		);
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~ OLD CODE BELOW ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	/**
	 * Checks over general skills and sends rolls to where they're needed or makes a basic check
	 * @param {HTML} event The HTML event to trigger a roll or check
	 * @returns Early break if specific skills need work elsewhere.
	 */
	async _rollGenSkills(event) {
		event.preventDefault();
		const container = event.currentTarget;
		const skillId = container.dataset.id;
		const skill = this.actor.items.get(skillId);
		const skipCheck = ['Draconic Heritage', 'Beloved of the Fae', 'Darkvision', 'Faith: Supreme God', 'Faith: Earth Mother',
			'Faith: Trade God', 'Faith: God of Knowledge', 'Faith: Valkyrie', 'Faith: Ancestral Dragon'];
		const supplementGenSkills = ['Herbalist', 'Miner'];

		// If Gen skills to be skipped are found, return and stop from rolling dice
		if (skipCheck.includes(skill.name)) return;

		if (skill.name.toLowerCase() === 'long-distance movement')
			this._specialRolls('longDistance', 'Long-Distance Movement');
		else if (skill.name.toLowerCase() === 'general knowledge')
			this._specialRolls('generalKnow', 'General Knowledge');
		else if (skill.name.toLowerCase() === 'cool and collected') {
			const resistType = await this._promptMiscModChoice('coolAndCollected');
			this._specialRolls(resistType === "int" ? "intRes" : "psyRes", "default");
		} else if (supplementGenSkills.includes(skill.name)) {
			let promptChoices = await this._promptMiscModChoice(skill.name);
			if (promptChoices === 'Observe')
				this._specialRolls('observe', 'Observe', skill);
			else if (promptChoices === 'Sixth Sense')
				this._specialRolls('sixthSense', 'Sixth Sense', skill);
			else if (promptChoices === 'General Knowledge')
				this._specialRolls('generalKnow', 'General Knowledge', skill);
		} else if (skill.name === 'Taming') {
			let promptChoices = await this._promptMiscModChoice(skill.name);
			if (promptChoices === 'General Knowledge')
				this._specialRolls('generalKnow', 'General Knowledge', skill);
			else if (promptChoices === 'Monster Knowledge')
				this._specialRolls('monsterKnow', 'Monster Knowledge', skill);
		} else {
			let promptChoices = await this._promptMiscModChoice(skill.name);
			if (promptChoices) {
				let skillBonus = this._getSkillBonus(skill.name);
				if (skill.name === 'Sacrement of Forgiveness')
					skillBonus -= 1;
				else
					skillBonus = skillBonus === 3 ? 4 : skillBonus;
				console.log('... skill name', skill.name, skillBonus);
				promptChoices[5] = skillBonus;
				promptChoices[6] = skill;
				this._genRollsToWindow(promptChoices);
			} else {
				ui.notifications.warn(`${game.i18n.localize('gs.dialog.genSkills.cancelled')}`);
			}
		}
	}

	/**
	 * Simple method to swap the image of the General Skills to indicate these are rollable skills
	 * @param {boolean} isHover True when hovering, False when not
	 * @param {*} event HTML container event
	 */
	_changeSkillImage(isHover, event) {
		const skillImage = $(event.currentTarget).find('.genSkills img');
		// console.log(">>> Check image html", skillImage[0], isHover);
		if (isHover) {
			const skillImageURL = skillImage.attr('src');
			this.actor.setFlag('gs', 'genSkillImage', skillImageURL);
			skillImage.attr('src', 'icons/svg/d20-highlight.svg');
		} else {
			const oldImage = this.actor.getFlag('gs', 'genSkillImage');
			this.actor.unsetFlag('gs', 'genSkillImage');
			skillImage.attr('src', oldImage);
		}
	}

	/**
	 * Adds Check roll buttons to the favorites bar in the left sidbar.
	 * @param {HTML} event The click event
	 */
	_addRollToFavorites(event) {
		//event.preventDefault();
		const container = event.currentTarget.closest(".checksCont");
		const $target = $(event.currentTarget).closest(".checksCont");
		const checkStatus = container.querySelector('.starred').checked;
		const checkName = container.querySelector('.checkName').innerHTML;
		//const index = event.currentTarget.dataset.index;
		const buttonClass = $target.find('button.actorRolls').attr("class");
		const iconClass = $target.find('i').attr("class");

		if (checkStatus) {
			this.actor.setFlag('gs', `favorites.${checkName}`, {
				'name': checkName,
				'button': buttonClass,
				'icon': iconClass
			});
		} else {
			this.actor.unsetFlag('gs', `favorites.${checkName}`);
		}
	}

	/**
	 * Looks for a given skill name in the actor's list of items to retrieve the value associated with the current skill level
	 * @param {string} skillName Name of the skill to be searched for, not case sensitive
	 * @returns The value (level) of the given skill
	 */
	_getSkillBonus(skillName) {
		const skills = this._getFromItemsList('skill');
		let skillValue = 0;
		skills.forEach(s => {
			if (s.name.toLowerCase() === skillName.toLowerCase()) {
				skillValue = s.system.value;
			}
		});
		return skillValue;
	}

	/**
	 * Looks for the 'target' piece of HTML code inside of the 'html' sent to the method
	 * @param {*} html Large chunk of HTML to be search over for the target
	 * @param {string} target The target to be found inside of the HTML
	 * @returns The value associated with the target
	 */
	_getRollMod(html, target) {
		let rollMod = html.find(`${target}`)[0].value;
		if (!rollMod) rollMod = 0;
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
	 * @param {int} negativeMods Use for negative modifiers from skills and other sources
	 * @returns Roll message to be evaluated by Foundry.
	 */
	_setRollMessage(dice = "2d6", weaponMod = 0, abilityScore = 0, classBonus = 0, skillItemMod = 0, promptMod = 0, negativeMods = 0) {
		let rollMessage = dice, fatigueMod;

		if (this.actor.type === 'character')
			fatigueMod = this.actor.system.fatigue.fatigueMod;
		else
			fatigueMod = 0;

		// console.log(">>> AbilScore", abilityScore, "CB", classBonus, "ItemMod", skillItemMod, "promptMod", promptMod, "negativeMods", negativeMods);

		if (weaponMod > 0 || weaponMod < 0)
			rollMessage += ` + ${weaponMod}`;
		if (abilityScore > 0)
			rollMessage += ` + ${abilityScore}`;
		if (classBonus > 0) // Class Bonus
			rollMessage += ` + ${classBonus}`;
		if (skillItemMod < 0) // Item/gear +/-
			rollMessage += ` - ${Math.abs(skillItemMod)}`;
		else if (skillItemMod > 0)
			rollMessage += ` + ${skillItemMod}`;
		if (promptMod > 0) // Extra roll modifiers
			rollMessage += ` + ${promptMod}`;
		else if (promptMod < 0)
			rollMessage += ` - ${Math.abs(promptMod)}`;
		if (negativeMods < 0)
			rollMessage += ` - ${Math.abs(negativeMods)}`;
		if (fatigueMod < 0)
			rollMessage += ` - ${Math.abs(fatigueMod)}`;
		return rollMessage;
	}

	/**
	 * Updates the actor's skill rank in the embedded collection of items
	 * @param {*} event The click event
	 * @returns Nothing, used to break method early
	 */
	_onUpdateSkillRank(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const rank = parseInt(element.value, 10);
		const skillId = element.dataset.id;
		const skillType = element.dataset.contexttype;
		const actor = game.actors.get(this.actor._id);
		const items = actor.items;
		//console.log("Check Actor JSON:", actor);

		if (!actor) {
			console.error("Actor not found.");
			return;
		}

		if (isNaN(rank)) {
			console.error("Invalid rank value:", element.value);
		}

		if (skillType === 'racial') {
			const raceItem = this.actor.items.find(item => item.type === 'race');
			if (!raceItem) {
				console.error("Race item not found.");
				return;
			}
			const skills = raceItem.system.skills || [];
			const skillIndex = skills.findIndex(skill => skill._id === skillId);
			if (skillIndex === -1) {
				console.error("Skill not found in racial item.");
				return;
			}
			skills[skillIndex].system.value = rank;
			raceItem.update({
				'system.skills': skills
			});
		} else if (skillType === 'earned') {
			const skill = this.actor.items.get(skillId);
			if (!skill) {
				console.error("Skill not found.");
				return;
			}
			skill.update({
				'system.value': rank
			});
			this.actor.render(true);
		} else {
			console.error("Unknown skill type:", skillType);
		}
		// console.log("Check if change took:", this.actor);
	}

	/**
	 * Updates current fatigue rank by 1
	 * @param {string} rank Current fatigue rank being checked, eg 'rank1', 'rank2', etc.
	 */
	async _updateFatigue(rank) {
		// console.log("GSAS _updateFatigue", rank);
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
	async _checkFatigueRanks() {
		const ranks = ['rank1', 'rank2', 'rank3', 'rank4', 'rank5'];
		for (const rank of ranks) {
			const currentMin = this.actor.system.fatigue[rank].min;
			const max = this.actor.system.fatigue[rank].max;
			// console.log("GSAS _checkFatigueRanks", currentMin, max);
			if (currentMin < max) {
				await this._updateFatigue(rank);
				break;
			}
		}
	}

	/**
	 * Method to help determin if the dice rolled a critical success/failure or a regular result. The critical rates are modified by any skills that are present in the character's items array.
	 * @param {array} diceResults An integer array of dice values
	 * @param {string} label The type of action being checked for skills, used with Maintenance spells
	 * @returns Fail/Success/Normal
	 */
	_checkForCritRolls(diceResults, label = "", itemInfo = null) {
		if (diceResults.length === 2) {
			let skills, skillValue, critSuccess = 12, critFail = 2, results = [], maintainedSpell;
			const actorType = this.actor.type;

			if (typeof (label) === "object") {
				maintainedSpell = label;
				label = "x";
			}

			// Checking actor type to get skills
			if (actorType === "character") {
				skills = this._getFromItemsList('skill');

				// Updating the Critical Success/Failure rate based on the given skill
				const setSuccessFailValues = (skillValue) => {
					if (skillValue === 1) { critSuccess = 11; critFail = 5; }
					else if (skillValue === 2) { critSuccess = 11; critFail = 4; }
					else if (skillValue === 3) { critSuccess = 10; critFail = 4; }
					else if (skillValue === 4) { critSuccess = 10; critFail = 3; }
					else if (skillValue === 5) { critSuccess = 9; critFail = 3; }
				};
				const setCritSuccessValues = (skillValue) => {
					if (skillValue < 3) critSuccess = 11;
					else if (skillValue < 5) critSuccess = 10;
					else if (skillValue == 5) critSuccess = 9;
				}
				// Checking over each character skill to modify success rates
				let critSuccessFailSkills = ['alert-.dodge'];
				const critSuccessOnlySkills = ['master of fire', 'master of water', 'master of wind', 'master of earth', 'master of life'];

				// Setting up info for Slice Attack skill
				let sliceAttr;
				if (itemInfo !== null && itemInfo !== undefined && itemInfo !== 0) {
					if (itemInfo.type === 'weapon') {
						sliceAttr = itemInfo.system.effect.checked[9];

						if (sliceAttr)
							critSuccessFailSkills.push('slice attack-.hitmod');
					}
				}

				for (const skill of skills) {
					skillValue = skill.system.value;
					if (critSuccessOnlySkills.includes(`${skill.name.toLowerCase()}`)) {
						let element, splitSkillName;
						if (typeof (maintainedSpell) === "object") {
							element = maintainedSpell.system.elementChoice;
							splitSkillName = [0, 0, maintainedSpell.system.elementChoice];
						} else {
							element = itemInfo.system.value;
							splitSkillName = skillName.split(" ");
						}
						if (splitSkillName[2].toLowerCase() === element.toLowerCase())
							setCritSuccessValues(skillValue);
					} else if (critSuccessFailSkills.includes(`${skill.name.toLowerCase()}-${label.toLowerCase()}`))
						setSuccessFailValues(skillValue);
				}
			}

			// Checking dice results vs. crit fail/success otherwise this is a regular result
			if (diceResults[0] + diceResults[1] <= critFail) {
				results[0] = 'fail';
				results[1] = `<div class='critFailColor'>${game.i18n.localize("gs.dialog.crits.crit")} ${game.i18n.localize("gs.dialog.crits.fail")}</div>`;
			} else if (diceResults[0] + diceResults[1] >= critSuccess) {
				results[0] = 'success';
				results[1] = `<div class='critSuccessColor'>${game.i18n.localize("gs.dialog.crits.crit")} ${game.i18n.localize("gs.dialog.crits.succ")}</div>`;
			} else {
				results[0] = 'normal';
				results[1] = '';
			}
			return results;
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
	async _rollsToMessage(event, dice, stat, classBonus, modifier, localizedMessage, skillBonus = 0, rollMod = 0, modSelector = "") {
		let rollExpression = `${dice}`;
		const casting = 'spellCast';
		const cssClassType = event?.currentTarget?.classList || ["", ""];
		const spellCastCSSCheck = cssClassType[1];

		// Getting roll modifiers from user
		// TODO: Update to remove this prompt from all but basic ability score rolls
		if (modSelector !== 'generalSkills')
			rollMod = await this._promptMiscModChoice("rollMod", localizedMessage);

		if (rollMod != 0)
			localizedMessage += this._addToFlavorMessage("miscScore", game.i18n.localize('gs.dialog.mods.misc'), rollMod);
		// Setting up roll message
		rollExpression = this._setRollMessage(dice, stat, classBonus, spellCastCSSCheck === casting ? 0 : modifier, rollMod, skillBonus);

		try {
			const roll = new Roll(rollExpression);
			await roll.evaluate();

			const diceResults = roll.terms[0].results.map(r => r.result);
			const status = this._checkForCritRolls(diceResults, modSelector, event);
			let dcCheck = '';

			// Getting dice total plus bonuses to compare to DC stored in Modifier
			let diceTotal = diceResults[0] + diceResults[1] + parseInt(stat, 10) + parseInt(classBonus, 10) + parseInt(skillBonus, 10);

			// Setting up casting results for critical success
			if (spellCastCSSCheck === casting) {
				if (diceTotal >= modifier && status[0] != 'fail') {
					if (status[0] === 'success')
						diceTotal += 5;
					dcCheck = `<div class="spellCastSuccess">${game.i18n.localize('gs.dialog.spells.cast')} ${game.i18n.localize('gs.dialog.crits.succ')}</div>`;
				} else {
					dcCheck = `<div class="spellCastFailure">${game.i18n.localize('gs.dialog.spells.cast')} ${game.i18n.localize('gs.dialog.crits.fail')}</div>`;
				}
			} else {
				diceTotal += modifier;
			}

			// Checking skills for Piercing Attack skill and weapon
			const skills = this._getFromItemsList('skill');
			// Getting Weapon ID to check for Piercing trait
			let eventID;
			if (event)
				eventID = event.currentTarget.closest('.reveal-rollable').dataset.id;
			const currentWeapon = this.actor.items.get(eventID);
			skills.forEach(skill => {
				if (skill.name.toLowerCase() === "piercing attack") {
					let pierceAmount = currentWeapon.system.effect?.pierce;
					if (pierceAmount) {
						pierceAmount *= skill.system.value;
						diceTotal += pierceAmount;
						localizedMessage += this._addToFlavorMessage("skillScore", game.i18n.localize('gs.actor.common.pierc') + " " + game.i18n.localize('gs.actor.monster.atta'), pierceAmount);
					}
				} else if (skill.name.toLowerCase() === 'strong blow: bludgeon' || skill.name.toLowerCase() === 'strong blow: slash') {
					console.log(">>> In SB: Slash check");
					const skillName = skill.name.toLowerCase();
					let strongBlow = skill.name === 'strong blow: bludgeon' ? currentWeapon.system.effect?.checked[11] : currentWeapon.system.effect?.checked[12];
					if (strongBlow) {
						const weaponSBValue = skillName === 'strong blow: bludgeon' ? currentWeapon.system.effect?.sbBludg : currentWeapon.system.effect?.sbSlash;
						let strBonus = this.actor.system.abilities.primary.str;
						const skillValue = skill.system.value;

						const strBonusMultiplier = skillValue === 1 ? 0.25 : skillValue === 2 ? 0.5 : skillValue === 3 ? 1 : skillValue === 4 ? 1.5 : 2;
						strBonus = Math.floor(strBonus * strBonusMultiplier);

						diceTotal += weaponSBValue + strBonus;
						localizedMessage += this._addToFlavorMessage("skillScore", game.i18n.localize(skillName === 'strong blow: bludgeon' ? 'gs.gear.weapons.effects.sbBludg' : 'gs.gear.weapons.effects.sbSlash'), weaponSBValue + strBonus);
					}
				}
			});

			// Checking flags
			const belovedFlag = this.actor.getFlag('gs', 'belovedSkill');
			if (belovedFlag) {
				const skillValue = belovedFlag.system.value - 1;
				diceTotal += skillValue;
				localizedMessage += this._addToFlavorMessage("skillScore", belovedFlag.name, skillValue);
				this.actor.unsetFlag('gs', 'belovedSkill');
			}

			// Checking if a power/damage roll is coming through to remove Effectiveness message
			if (modSelector != ".power") {
				localizedMessage += `<div class="spellEffectivenessScore">${game.i18n.localize('gs.gear.spells.efs')}: ${diceTotal + rollMod}</div>`;
			}
			let chatFlavor = `<div class="customFlavor">${localizedMessage}`;
			if (status != undefined || status != null)
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
	_sendBasicMessage(value, type) {
		const speaker = ChatMessage.getSpeaker({ actor: this.actor });
		const messageContent = `
			<h1 style="text-align: center; background-color: rgba(124, 250, 124, 0.75); border: 1px solid green; border-radius: 5px; padding: 5px 10px; width: 100%; height: auto;">
				${value}
			</h1>
		`;

		ChatMessage.create({
			speaker,
			flavor: `${type}`,
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
	async _rollStatDice(event) {
		event.preventDefault();
		let baseDice = "2d6";

		// Find the parent container that contains the label and input
		const container = event.currentTarget.closest('.calcScore');
		if (container) {
			// Find the input field within the same container
			const input = container.querySelector('input');
			const label = container.querySelector('label');
			if (input) {
				const bonusScore = input.value;
				let labelText = label.innerHTML + this._addToFlavorMessage("abilScore", game.i18n.localize('gs.actor.character.abil'), bonusScore);
				// TODO: Update with chat box to add modifiers
				this._rollsToMessage(null, baseDice, bonusScore, 0, 0, labelText);
			} else {
				console.error("Input field not found.");
			}
		} else {
			console.error("Container with '.calcScore' class not found.");
		}
	}

	/**
	 * Simple method to find the hidden input item type and return it for filtering purposes
	 * @param {html} container The HTML container
	 * @returns Hidden input item type
	 */
	_getItemType(container) {
		return container.querySelector('input[type="hidden"].type');
	}

	/**
	 * Sorts through item/spell to help determin what class level to use for the bonus and apply it to the roll message
	 * @param {string} typeHolder The Type of the item/spell being used with a variety of information for items or spell name
	 * @param {string} itemType Either weapon/armor/shield/cast to help decide how to proceed ahead with calculations
	 * @returns The bonus for the class level of the item/spell being used
	 */
	_getClassLevelBonus(typeHolder, itemType) {
		let [type, weight] = "", className = "";
		if (itemType != 'cast') {
			[type, weight] = typeHolder.value.toLowerCase().split('/').map(item => item.trim());
		}
		const { fighter = 0, monk = 0, ranger = 0, scout = 0, sorcerer = 0, priest = 0, dragon = 0, shaman = 0, necro = 0 } = this.actor.system.levels.classes;
		const includesAny = (words, text) => words.some(word => text.includes(word));
		let bonus = 0;

		// TODO: Find any skills that influence class type hit checks to add here.
		if (itemType === 'weapon') {
			if (type === 'projectile' && ranger > 0) {
				bonus += ranger;
				className = game.i18n.localize('gs.actor.character.rang');
			} else if (type === 'throwing') {
				if (monk > bonus) {
					bonus += monk;
					className = game.i18n.localize('gs.actor.character.monk');
				} else if (ranger > bonus) {
					bonus += ranger;
					className = game.i18n.localize('gs.actor.character.rang');
				} else if (scout > bonus) {
					bonus += scout;
					className = game.i18n.localize('gs.actor.character.scou');
				}
			} else { // Assuming type is a melee weapon
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
		} else if (itemType === 'armor') {
			let armorType = type.match(/\((.*?)\)/);
			if (armorType && armorType[1]) {
				const isCloth = armorType[1] === 'cloth';
				if (fighter > bonus) {
					bonus += fighter;
					className = game.i18n.localize('gs.actor.character.figh');
				} else if (monk > bonus && isCloth) {
					bonus += monk;
					className = game.i18n.localize('gs.actor.character.monk');
				} else if (scout > bonus && weight === 'light') {
					bonus += scout;
					className = game.i18n.localize('gs.actor.character.scou');
				}
			} else {
				console.error("Not text found in type from hidden input");
			}
		} else if (itemType === 'shield') {
			if (fighter > bonus) {
				bonus += fighter;
				className = game.i18n.localize('gs.actor.character.figh');
			} else if (scout && weight === 'light') {
				bonus += scout;
				className = game.i18n.localize('gs.actor.character.scou');
			}
		} else if (itemType === 'cast') {
			typeHolder = typeHolder.value;
			if (typeHolder.toLowerCase() === "words of true power") {
				bonus += sorcerer;
				className = game.i18n.localize('gs.actor.character.sorcerer');
			} else if (typeHolder.toLowerCase() === "miracle") {
				bonus += priest;
				className = game.i18n.localize('gs.actor.character.priest');
			} else if (typeHolder.toLowerCase() === "ancestral dragon") {
				bonus += dragon;
				className = game.i18n.localize('gs.actor.character.dragon');
			} else if (typeHolder.toLowerCase() === "spirit arts") {
				bonus += shaman;
				className = game.i18n.localize('gs.actor.character.shaman');
			} else if (typeHolder.toLowerCase() === "necromancy") {
				bonus += necro;
				className = game.i18n.localize('gs.actor.character.necro');
			}
		}
		return { bonus, className };
	}

	/**
	 * Adds a string to the chat message to show what is modifying the final dice results and how
	 * @param {string} cssClass class name to color message, diceInfo, gearModifier, abilScore, levelScore, skillScore, rollScore, miscScore, armorDodgeScore
	 * @param {JSON} skill the skill for associated information
	 * @param {int} amount a value modifying final dice results
	 * @returns A string to be added to the chat message
	 */
	_addStringToChatMessage(cssClass, skill, amount) {
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
	async _rollWithModifiers(event, modSelector, baseDice, localizedMessage, itemType) {
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
		if (!diceNotation) return;

		if (actorType === 'character') {
			stat = this._getStatForItemType(itemType, modSelector, container);
			if (stat > 0) localizedMessage += this._addToFlavorMessage("abilScore", game.i18n.localize('gs.actor.character.abil'), stat);

			const { bonus, className } = this._getClassLevelBonus(this._getItemType(container), itemType);
			classBonus = bonus;
			if (classBonus > 0) localizedMessage += this._addToFlavorMessage("levelScore", className, classBonus);

			skills = this._getFromItemsList('skill');
			if (modSelector === '.power') {
				const { dice, mod } = this._parseDiceNotation(diceNotation);
				diceToRoll = dice;
				modifier = mod;
				if (this.actor.system.levels.classes.monk > 0) {
					typeHolder = this._getItemType(container);
					const { weaponName, type } = this._parseWeaponType(container, typeHolder);
					if (weaponName.toLowerCase() === 'barehanded')
						skillBonus += this._calculateIronFistBonus(skills, 'iron fist');
					if (type === 'close-combat')
						skillBonus += await this._calculateBurstOfStrengthBonus(skills);
				}
			} else if (['.hitMod', '.dodge', '.blockMod', '.spellDif'].includes(modSelector)) {
				modifier = parseInt(modElement.textContent, 10);
				if (modSelector === '.dodge' || modSelector === '.blockMod') {
					localizedMessage += this._addToFlavorMessage("armorDodgeScore", game.i18n.localize('gs.gear.equipment'), modifier)
					const { modifier: mod, localizedMessage: message } = modSelector === '.dodge'
						? this._calculateDodgeModifier(modifier, skills, localizedMessage)
						: this._calculateBlockModifier(modifier, skills, localizedMessage);
					modifier = mod;
					localizedMessage = message;
				} else if (modSelector === '.hitMod') {
					const weaponsXX = ['Weapons: Axes', 'Weapons: Close-Combat', 'Weapons: Maces', 'Weapons: Bows', 'Weapons: Throwing Weapons', 'Weapons: Spears', 'Weapons: Staves', 'Weapons: One-Handed Swords', 'Weapons: Two-Handed Swords'];
					skills.forEach(skill => {
						if (skill.name.toLowerCase === 'mow down') {
							const { modifier: mod, localizedMessage: message } = this._calculateMowDownModifier(container, skill, modifier, localizedMessage);
							modifier = mod;
							localizedMessage = message;
						}
						if (weaponsXX.includes(skill.name)) {
							const { modifier: mod, localizedMessage: message } = this._addSpecificWeaponBonus(container, skill, modifier, localizedMessage, weaponsXX);
							modifier = mod;
							localizedMessage = message;
						}
					});
				} else if (modSelector === '.spellDif') {
					const spellID = container.dataset.id;
					const spell = this.actor.items.get(spellID);
					const skills = this._getFromItemsList('skill');
					const items = this._getFromItemsList('item');
					// Checking if a Shaman spell and has Shaman's Bag or Beloved of the Fae skill
					if (spell.system.schoolChoice === "Spirit Arts") {
						let belovedSkill = this.actor.items.find(i => i.name === "Beloved of the Fae");
						let shamanBag = this.actor.items.find(i => i.name === 'Shaman\'s Bag');
						if ((!belovedSkill || belovedSkill.system.value === 0) && !shamanBag) {
							ui.notifications.warn(game.i18n.localize('gs.dialog.spellCasting.shamanAlert'));
							return;
						}
						if (belovedSkill && belovedSkill.system.value >= 2) {
							const usingCatalyst = await this._promptMiscModChoice('catalyst');
							if (usingCatalyst) {
								this.actor.setFlag('gs', 'belovedSkill', belovedSkill);
							}
						}
					} else if (spell.system.schoolChoice === 'Ancestral Dragon') {
						let dPCPouch = this.actor.items.find(i => i.name === "Dragon Priest's Catalyst Pouch") || 0;
						if (!dPCPouch) {
							ui.notifications.warn(game.i18n.localize('gs.dialog.spellCasting.dragonPriestAlert'));
							return;
						}
					}
					const { skillBonus: bonus, localizedMessage: message } = await this._calculateSpellExpertise(skills, localizedMessage, spellID);
					skillBonus += bonus;
					localizedMessage = message;
					const { skillBonus: bonus1, localizedMessage: message1 } = await this._checkFaith(skills, localizedMessage, spellID);
					skillBonus += bonus1;
					localizedMessage = message1;
				}
			}
			if (modifier != 0 && modSelector != '.spellDif')
				localizedMessage += this._addToFlavorMessage("rollScore", game.i18n.localize('gs.dialog.mods.mod'), modifier);
		} else if (actorType === 'monster') {
			const { dice, mod } = this._parseDiceNotation(diceNotation);
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
	async _checkFaith(skills, localizedMessage, spellID) {
		let skillBonus = 0;
		const spell = this.actor.items.get(spellID);
		const faithSystems = ["Miracle", "Ancestral Dragon"];
		if (faithSystems.includes(spell.system.schoolChoice)) {
			const faithBonus = ['Faith: Supreme God', 'Faith: Earth Mother',
				'Faith: Trade God', 'Faith: God of Knowledge', 'Faith: Valkyrie', 'Faith: Ancestral Dragon'];
			let theSkill = null;
			skills.forEach(skill => {
				if (faithBonus.includes(skill.name)) {
					theSkill = skill;
				}
			});
			if (theSkill) {
				skillBonus = this._getSkillBonus(theSkill.name);
				const chantlessMod = await this._promptMiscModChoice('faith');
				if (chantlessMod) {
					skillBonus = skillBonus === 1 ? -4 : skillBonus === 2 ? -2 : 0;
					localizedMessage += this._addToFlavorMessage('skillScore', theSkill.name, skillBonus);
				} else
					skillBonus = 0;
			}
		}
		return { skillBonus, localizedMessage };
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
	_addSpecificWeaponBonus(container, skill, modifier, localizedMessage, weaponsXX) {
		const weaponAttr = container.querySelector('.type').value;
		const typeContainer = weaponAttr.split('/');
		const weaponType = typeContainer[0].trim();
		const weaponTypes = ['Ax', 'Close-Combat', 'Mace', 'Bow', 'Throwing', 'Spear', 'Staff', 'One-Handed Sword', 'Two-Handed Sword'];
		for (let x = 0; x < weaponTypes.length; x++) {
			if (skill.name === weaponsXX[x] && weaponType === weaponTypes[x]) {
				modifier += skill.system.value;
				localizedMessage += this._addStringToChatMessage("skillScore", skill, skill.system.value);
				break;
			}
		}
		return { modifier, localizedMessage };
	}

	/**
	 * Sets up a simple return statement to add the correct items and values to the localized message for debugging and player knowledge
	 * @param {string} cssClass Class string to color the message, diceInfo, gearModifier, abilScore, levelScore, skillScore, skillEffectiveScore, rollScore, miscScore, armorDodgeScore
	 * @param {string} labelName What is modifying the the dice roll
	 * @param {*} labelMessage How much is being modified, usually an int value, can also be a string if needed.
	 * @returns A string to be added to the localized message
	 */
	_addToFlavorMessage(cssClass, labelName, labelMessage) {
		return `<div class="${cssClass} specialRollChatMessage">${labelName}: ${labelMessage}</div>`;
	}

	_addEffectiveMessage(cssClass, labelName, labelMessage) {
		return `<div class="${cssClass}">${labelName}: ${labelMessage}</div>`;
	}

	/**
	 * Helps determine if the dice/value is from a monster/character and how to proceed in extracting the proper value.
	 * @param {variable} modElement Containers either an int (monsters) or string (character)
	 * @param {string} actorType Either 'monster' or 'character' to determine dice values
	 * @param {string} modSelector CSS string to help identify what kind of value is being pulled
	 * @returns The dice being used in the roll or a value to modifier the dice roll
	 */
	_getDiceNotation(modElement, actorType, modSelector) {
		if (actorType === 'monster' && ['.hitMod', '.boss.dodge', '.boss.block', '.boss.spellRes', '.power', '.moraleCheck'].includes(modSelector)) {
			const diceNotation = modElement.value;
			if (diceNotation != 0)
				return diceNotation;
			else {
				ui.notifications.info(`The check has a value of 0 or undefined and cannot be rolled`);
				return null;
			}
		} else if (actorType === 'character')
			return modElement.textContent;
		return null;
	}

	/**
	 * Helps determine the dice being sent to the roller  where 'N' is the number of dice being rolled and '3/6 is either a 3-sided or 6-sided die.
	 * @param {string} diceNotation A dice notation in either "Nd3/6 + N" or "Nd3/6"
	 * @returns The dice to roll and any modifers
	 */
	_parseDiceNotation(diceNotation) {
		let [dice, mod] = diceNotation.includes('+') ? diceNotation.split('+') : [diceNotation, 0];
		console.log("GS _parseDiceNotation |", diceNotation, dice, mod);
		if (dice != "1d6" && dice != "2d6" && dice != "1d3") {
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
	_parseWeaponType(container, typeHolder) {
		const [type, weight] = typeHolder.value.toLowerCase().split('/').map(item => item.trim());
		const weaponName = container.querySelector('div.name').innerHTML.split(" ")[0].trim();
		return { weaponName, type };
	}

	/**
	 * Searches through the players skills for the Spell Expertise skill and compares it to the spell being cast for bonuses.
	 * @param {JSON} skills An array of JSON skill objects
	 * @param {string} localizedMessage A string message to output to the chat window
	 * @param {string} spellID The idea of the spell being cast
	 * @returns Updated skill bonus value and localized message with skill information.
	 */
	_calculateSpellExpertise(skills, localizedMessage, spellID) {
		const spellTypes = ['Spell Expertise: Attack Spells', 'Spell Expertise: Imbuement Spells', 'Spell Expertise: Creation Spells', 'Spell Expertise: Control Spells', 'Spell Expertise: Healing Spells', 'Spell Expertise: General Spells'];
		const spell = this.actor.items.get(spellID);
		let skillBonus = 0;
		skills.forEach(skill => {
			for (let x = 0; x < spellTypes.length; x++) {
				const spellSplit = spellTypes[x].split(" ");
				if (skill.name.toLowerCase() === spellTypes[x].toLowerCase() && spell.system.styleChoice === spellSplit[2]) {
					skillBonus = skill.system.value;
					localizedMessage += this._addStringToChatMessage("skillScore", skill, skillBonus);
				}
			}
		});
		return { skillBonus, localizedMessage };
	}

	/**
	 * Special method only used to find the skill bonus for the Iron Fist monk (fighter) skill
	 * @param {JSON} skills An array of JSON objects
	 * @param {string} skillName Name of skill to find
	 * @returns Skill bonus for the associated skill
	 */
	_calculateIronFistBonus(skills, skillName) {
		let skillBonus = 0;
		for (const skill of skills) {
			if (skillName.toLowerCase === skillName) {
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
		for (const skill of skills) {
			if (skillName.toLowerCase() === 'burst of strength') {
				switch (skill.system.value) {
					case 1: skillBonus = 1; break;
					case 2: skillBonus = 2; break;
					case 3: skillBonus = "1d3"; break;
					case 4:
					case 5: skillBonus = "1d6"; break;
				}
				const powerBonus = await this._promptFatigueForPower();
				if (powerBonus > 0) {
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
	_calculateDodgeModifier(modifier, skills, localizedMessage) {
		const armor = this._getEquippedArmor(this._getFromItemsList('armor'));
		const strEnd = this.actor.system.abilities.calc.se;
		const { monk, scout, fighter } = this.actor.system.levels.classes;

		console.log("+++ Check initial mod", modifier);

		// Checking if character is wearing heavy armor and adjusting as needed
		if (armor[0].system.heavy.value && strEnd >= armor[0].system.heavy.y)
			modifier = Math.floor(modifier / 2);

		// Helper function to return bonus Parry values on gear
		const checkGear = (skill) => {
			const shield = this._getEquippedArmor(this._getFromItemsList('shield'));
			const weapons = this._getFromItemsList('weapon');
			let highestParry = 0, highestWeapon = 0;

			shield.forEach(item => {
				if (item.system.effect?.parry != undefined) {
					if (item.system.effect.parry > highestParry)
						highestParry = item.system.effect.parry;
				}
			});
			weapons.forEach(item => {
				if (item.system.effect?.parry != undefined) {
					if (item.system.effect.parry > highestWeapon)
						highestWeapon = item.system.effect.parry;
				}
			});
			if (skill.system.value > 3)
				return highestParry += highestWeapon;
			else
				highestParry >= highestWeapon ? null : highestParry = highestWeapon;
			return highestParry;
		};

		// Helper function to add skill bonus and message
		const addSkillBonus = (skill, minLevel, requiredClassLevel, bonusModifier = (val) => val) => {
			const skillValue = skill.system.value;
			const skillName = skill.name;
			let gearBonus = 0;
			if (skillValue <= minLevel - 1 || (skillValue >= minLevel && requiredClassLevel >= 7)) {
				if (skillName.toLowerCase() === 'parry') {
					gearBonus = checkGear(skill);
					modifier += gearBonus
				}
				const adjustedModifier = bonusModifier(skillValue);
				modifier += adjustedModifier;
				localizedMessage += this._addStringToChatMessage("skillScore", skill, adjustedModifier + gearBonus);
			} else
				ui.notifications.warn(`Your ${skillName} level does not meet the requirements!`);
		};

		// Process skills
		skills.forEach(skill => {
			switch (skill.name.toLowerCase()) {
				case 'martial arts': addSkillBonus(skill, 4, Math.max(monk, scout)); break;
				case 'parry': addSkillBonus(skill, 4, fighter, (val) => val - 1); break;
			}
		});

		return { modifier, localizedMessage };
	}

	/**
	 * Searches through the character's skills to find the Block skill and update the modifier as needed.
	 * @param {int} modifier The value of the current modifier for the dice roll
	 * @param {JSON} skills An array of JSON objects containing the skill in question
	 * @param {string} localizedMessage The message to be added to the flavor text of the chat window
	 * @returns Updated modifier and localized message
	 */
	_calculateBlockModifier(modifier, skills, localizedMessage) {
		skills.forEach(skill => {
			if (skill.name.toLowerCase() === 'shields') {
				modifier += skill.system.value;
				localizedMessage += this._addStringToChatMessage("skillScore", skill, skill.system.value);
			}
		});
		return { modifier, localizedMessage };
	}

	/**
	 * Used in tandem with the Mod Down skill for two-handed slash/bludgeoning weapons. Updates the modifier and localized message if the skill is present.
	 * @param {HTML} container The weapon HTML container
	 * @param {JSON} skill The JSON object of the Mow Down skill
	 * @param {int} modifier The modifier value to be added to the dice roller
	 * @param {string} localizedMessage A flavor message for the chat window
	 * @returns Updated modifier and localized message
	 */
	async _calculateMowDownModifier(container, skill, modifier, localizedMessage) {
		const weaponUse = container.querySelector('.weaponUse').value;
		const weaponAttr = container.querySelector('.weaponAttr').value;
		const weaponAttrSplit = weaponAttr.split('/');
		const attributes = ['Slash', 'Bludgeoning'];
		if (weaponUse.toLowerCase() === 'two-handed' && weaponAttrSplit.some(attr => attributes.includes(attr))) {
			const modHitPen = await this._promptMiscModChoice("mowDown", skill.system.value);
			modifier += modHitPen;
			localizedMessage += this._addStringToChatMessage("skillScore", skill, modHitPen);
		}
		return { modifier, localizedMessage };
	}

	/**
	 * Determines what calculated ability score to use for the given item type of weapon, armor/shield, or casting
	 * @param {string} itemType Identifier for the type of item being used in the roll
	 * @param {string} modSelector CSS class being used to identify what type of value to use
	 * @returns A value from the characters calculated abilities
	 */
	_getStatForItemType(itemType, modSelector, container) {
		const actorCalcStats = this.actor.system.abilities.calc;
		switch (itemType) {
			case 'weapon': return modSelector === '.power' || modSelector === '.spellRes' ? 0 : actorCalcStats.tf;
			case 'armor': case 'shield': return actorCalcStats.tr;
			case 'cast':
				const school = container.querySelector("input[type='hidden']").value;
				return (school.toLowerCase() === "words of true power" || school.toLowerCase() === "necromancy") ? actorCalcStats.if : actorCalcStats.pf;
			default: return 0;
		}
	}

	/**
	 * A simple method that pushes static minion data to the chat window
	 * @param {*} event The click event
	 * @returns Nothing and break out of the method early if nothing is found
	 */
	_rollMinionStatic(event) {
		event.preventDefault();
		const container = event.currentTarget.closest('.reveal-rollable');
		const type = event.currentTarget.classList;
		let message, staticContainer;
		if (!container) {
			console.error("Container with '.reveal-rollable' class not found.");
			return;
		}
		switch (type[1]) {
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
		if (!staticContainer) {
			console.error("Minion hit amount container not found.");
			return;
		}
		const amount = staticContainer.value;
		if (amount === NaN || amount === undefined || amount === null) {
			console.error("Minion static hit amount empty or other problem.");
			return;
		} else if (amount == 0 || amount == undefined) {
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
	_promptHealingAmount(healType) {
		let healingTitle = game.i18n.localize('gs.actor.character.heal') + " ";
		if (healType === 'healAttrition')
			healingTitle += game.i18n.localize('gs.actor.character.attr');
		else if (healType === 'healFatigue')
			healingTitle += game.i18n.localize('gs.actor.character.fatW');
		else if (healType === 'healing')
			healingTitle += game.i18n.localize('gs.actor.character.wounds');

		return new Promise((resolve) => {
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
	async _healAttrFatigue(healType, healAmount = 0) {
		const systemData = this.actor.system;
		let amountToHeal = healAmount === 0 ? await this._promptHealingAmount(healType) : healAmount;
		console.log("Check before conversion", amountToHeal);
		if (typeof (amountToHeal) === 'string') {
			const dice = healAmount.includes("+") ? healAmount.split("+") : [healAmount, 0];
			const roll = new Roll(dice[0]);
			await roll.evaluate();
			const diceResults = roll.terms[0].results.map(r => r.result);
			amountToHeal = parseInt(diceResults[0], 10) + (diceResults[1] ? parseInt(diceResults[1], 10) : 0) + (dice[1] > 0 ? parseInt(dice[1], 10) : 0);
			await this.actor.setFlag('gs', 'fatigueHealed', amountToHeal);
			console.log("Check after conversion", amountToHeal);
		}

		const healThisAmount = healAmount => {
			if (healAmount < 0)
				healAmount = 0;
			this.actor.update({
				'system.lifeForce.wounds': healAmount
			});
		}

		if (amountToHeal > 0) {
			if (healType === 'healAttrition') {
				const attritionThresholds = [5, 8, 11, 14, 16, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40];
				const attritionTrack = this.actor.system.attrition;
				amountToHeal -= 1;
				let attritionAmount = 0;
				// Finding attrition amount
				for (attritionAmount; attritionAmount < Object.entries(attritionTrack).length; attritionAmount++) {
					if (attritionTrack[attritionAmount] === false) {
						attritionAmount -= 1;
						break;
					}
				}

				// Updating attrition flag as needed
				const newAttrition = (attritionAmount + 1) - (amountToHeal + 1);
				if (attritionThresholds.includes(newAttrition))
					this.actor.setFlag('gs', 'attrition', newAttrition);


				// Moving backwards and "healing" attrition based on the amount to heal
				for (let x = attritionAmount; x >= attritionAmount - amountToHeal; x--) {
					if (x < 0) {// Check to ensure x doesn't break below array position 0
						break;
					}
					attritionTrack[x] = false;
				}
				this.actor.update({ 'system.attrition': attritionTrack });

			} else if (healType === 'healFatigue') {
				const fatigueTracks = this.actor.system.fatigue;
				const ranks = ['rank5', 'rank4', 'rank3', 'rank2', 'rank1'];

				for (const rank of ranks) {
					const currentMin = this.actor.system.fatigue[rank].min;
					console.log("healing fatigue", amountToHeal, currentMin);

					if (amountToHeal == 0) break;
					else if (currentMin == 0) continue;
					else {
						let healedMin = currentMin - amountToHeal;
						if (healedMin < 0) {
							healedMin = 0;
							amountToHeal -= currentMin;
						}
						for (let x = currentMin; x > healedMin; x--) {
							fatigueTracks[rank].marked[x] = false;
						}

						await this.actor.update({
							[`system.fatigue.${rank}.min`]: healedMin,
							[`system.fatigue.${rank}.marked`]: fatigueTracks[rank].marked
						});
					}

				}
			} else if (healType === 'sleep') {
				const halfLifeForce = Math.round(systemData.lifeForce.double / 2);
				healThisAmount(systemData.lifeForce.wounds - halfLifeForce);
			} else if (healType === 'healing') {
				const skills = this._getFromItemsList('skill');
				let skillMod = 0;

				for (const skill of skills) {
					if (skillName.toLowerCase() === 'first aid')
						skillMod += skill.system.value;
					if (skillName.toLowerCase() === 'healing affinity')
						skillMod += skill.system.value * 2;
				}

				healThisAmount(systemData.lifeForce.wounds - amountToHeal - skillMod);
			}
		}
	}

	/**
	 * A sorting function for actor sheet rolls
	 * @param {*} event The click event
	 */
	async _actorRolls(event) {
		event.preventDefault();
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
		const resting = ['sRest', 'lRest'];
		const fateButtons = ['byOne', 'byThree'];

		if (rollMappings[classType]) {
			const { mod, dice, label, type } = rollMappings[classType];
			this._rollWithModifiers(event, mod, dice, game.i18n.localize(label) + " " + game.i18n.localize('gs.charSheet.statsPage.checks'), type);
		} else if (healActions.includes(classType)) {
			this._healAttrFatigue(classType);
		} else if (classType === 'initiative') {
			this._toggleCombatState(event, this.actor);
			// this._rollInitiative(event);
		} else if (specialRolls.includes(classType)) {
			this._specialRolls(classType, classType.charAt(0).toUpperCase() + classType.slice(1).replace(/([A-Z])/g, ' $1').trim());
		} else if (fateButtons.includes(classType)) {
			this._fateAdjustment(event, classType);
		} else if (resting.includes(classType)) {
			if (classType === 'sRest') {
				await this._healAttrFatigue('healAttrition', 3);
				await this._sendBasicMessage(3, this.actor.name + " " + game.i18n.localize('gs.dialog.resting.sRestMessage'));
			} else {
				const restAmount = await this._promptMiscModChoice('resting');
				if (restAmount === 3) {
					await this._healAttrFatigue('healAttrition', 3);
					await this._healAttrFatigue('healFatigue', '1d3');
					await this._sendBasicMessage(this.actor.getFlag('gs', 'fatigueHealed'), this.actor.name + " " + game.i18n.localize('gs.dialog.resting.briefLongRest'));
				} else {
					await this._healAttrFatigue('healAttrition', 10);
					await this._healAttrFatigue('healFatigue', '2d3+1');
					await this._healAttrFatigue('sleep', 1);
					if (this.actor.system.spellUse.max > 0)
						await this._restorSpellUse(this.actor);
					await this._sendBasicMessage(this.actor.getFlag('gs', 'fatigueHealed'), this.actor.name + " " + game.i18n.localize('gs.dialog.resting.lRestMessage'));
				}
				await this.actor.unsetFlag('gs', 'fatigueHealed');
			}
		} else {
			console.error(`GS _actorRolls || ${classType} was not found in the method.`);
		}
	}

	/**
	 * Refreshes all spell use after a long rest
	 * @param {JSON} actor Actor JSON data
	 */
	_restorSpellUse(actor) {
		const checks = actor.system.spellUse.checks;
		for (let [id] in checks)
			checks[id] = false;
		actor.update({
			'system.spellUse.checks': checks
		});
	}

	/**
	 * Updates the player's Fate value by 1 or 3 depending on the choic clicked.
	 * @param {HTML} event The click event
	 * @param {string} byAmount Either 'byOne' or 'byThree'
	 */
	_fateAdjustment(event, byAmount) {
		event.preventDefault();
		let fateUpdate = 0;
		if (byAmount === 'byOne')
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
	_promptFatigueForPower() {
		return new Promise((resolve) => {
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
	async _promptMiscModChoice(promptType, promptName = '') {
		return new Promise((resolve) => {
			let dialogContent, promptTitle, button1, button2, button3, buttons = {};

			const genSkills = ['Appraisal', 'Artisan: Smithing', 'Artisan: Needlework', 'Artisan: Carpentry', 'Artisan: Leatherworking', 'Artisan: Metal-Carving',
				'Cooking', 'Craftsmanship', 'Criminal Knowledge', 'Etiquette', 'Labor', 'Leadership', 'Meditate', 'Negotiate: Persuade', 'Negotiate: Tempt',
				'Negotiate: Intimidate', 'No Preconceptions', 'Perform: Sing', 'Perform: Play', 'Perform: Dance', 'Perform: Street Perform', 'Perform: Act',
				'Production: Farming', 'Production: Fishing', 'Production: Logging', 'Production: Mining', 'Research', 'Riding', 'Survivalism ', 'Theology',
				'Worship', 'Cartography', 'Nurse', 'Sacrement of Forgiveness', 'Torture'];
			const specialRolls = ['moveRes', 'strRes', 'psyRes', 'intRes', 'strength', 'stealth', 'acrobatics', 'monsterKnow'];
			const supplementGenSkills = ['Herbalist', 'Miner', 'Taming'];
			const thirdButtonNames = ['stealth', 'acrobatics', 'Herbalist', 'Miner'];

			const addModifiersSection = () => {
				return `<p>${game.i18n.localize("gs.dialog.mods.addInfo")}</p>
						<input type="text" class="rollMod" style="margin-bottom: 10px;" />`;
			};

			switch (promptType) {
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
				case 'dualWielding': case 'rapidFire': case 'slipBehind': case 'curvedShot':
					dialogContent = `<h3>${game.i18n.localize(`gs.dialog.${promptType}.header`)}</h3>`;
					promptTitle = game.i18n.localize(`gs.dialog.${promptType}.title`);
					button1 = {
						label: game.i18n.localize(`gs.dialog.${promptType}.primary`),
						callback: () => {
							resolve(1);
						}
					};
					button2 = {
						label: game.i18n.localize(`gs.dialog.${promptType}.secondary`),
						callback: () => {
							resolve(2);
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
							${[1, 2, 3, 4, 5].map(value =>
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
					const spells = this._getFromItemsList('spell');
					const header1 = game.i18n.localize(`gs.dialog.spellMaint.header`);
					promptTitle = game.i18n.localize(`gs.dialog.spellMaint.title`);
					dialogContent = `<h3>${header1}</h3>`;

					// Function to create a button containing the spell image and name
					const createSpellButton = (spell) => ({
						label: `<img src="${spell.img}" alt="spell icon" /> ${spell.name}`,
						callback: () => resolve(spell)
					});

					// Loops through all of the spells the player has and creates a button
					for (const [index, spell] of spells.entries()) {
						buttons[index] = createSpellButton(spell);
					}
					break;
				case 'resting':
					dialogContent = `<h3>${game.i18n.localize("gs.dialog.longResting.header")}</h3>`;
					promptTitle = game.i18n.localize("gs.dialog.longResting.title");
					button1 = {
						label: game.i18n.localize("gs.dialog.longResting.label1"),
						callback: () => {
							resolve(3);
						}
					};
					button2 = {
						label: game.i18n.localize("gs.dialog.longResting.label2"),
						callback: () => {
							resolve(6);
						}
					};
					break;
				case 'useSkill':
					promptTitle = promptName + game.i18n.localize("gs.dialog.useSkill.title");
					dialogContent = `<h3>${game.i18n.localize("gs.dialog.useSkill.header") + promptName}</h3>`;
					button1 = {
						label: game.i18n.localize("gs.dialog.useSkill.primary"),
						callback: () => {
							resolve(1);
						}
					};
					button2 = {
						label: game.i18n.localize("gs.dialog.useSkill.secondary"),
						callback: () => {
							resolve(0);
						}
					};
					break;
				default:
					break;
			}

			if (specialRolls.includes(promptType)) {
				const header = game.i18n.localize(`gs.dialog.${promptType}.header`);
				const paragraph = game.i18n.localize(`gs.dialog.${promptType}.label`);
				const promptMapping = {
					'moveRes': { word1: 'str', word2: 'foc', word3: 'tec', word4: 'foc', ability1: 'sf', ability2: 'tf' },
					'strRes': { word1: 'str', word2: 'ref', word3: 'str', word4: 'end', ability1: 'sr', ability2: 'se' },
					'psyRes': { word1: 'p', word2: 'ref', word3: 'p', word4: 'end', ability1: 'pr', ability2: 'pe' },
					'intRes': { word1: 'int', word2: 'ref', word3: 'int', word4: 'end', ability1: 'ir', ability2: 'ie' },
					'strength': { word1: 'str', word2: 'foc', word3: 'str', word4: 'end', ability1: 'sf', ability2: 'se' },
					'monsterKnow': { word1: 'int', word2: 'foc', word3: 'int', word4: 'ref', ability1: 'if', ability2: 'ir' },
					'stealth': { word1: 'tec', word2: 'foc', word3: 'tec', word4: 'end', word5: 'tec', word6: 'ref', ability1: 'tf', ability2: 'te', ability3: 'tr' },
					'acrobatics': { word1: 'tec', word2: 'foc', word3: 'tec', word4: 'end', word5: 'tec', word6: 'ref', ability1: 'tf', ability2: 'te', ability3: 'tr' },
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

				if (promptType === 'stealth' || promptType === 'acrobatics') {
					button3 = createButton([word5, word6], ability3);
				}
			} else if (genSkills.includes(promptType)) {
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
					"Worship": { first: 'p', second: 'none', class: 'priest/dragon' },
					"Cartography": { first: 'i', second: 'none', class: 'scout' },
					"Nurse": { first: 'i', second: 'none', class: 'none' },
					"Sacrement of Forgiveness": { first: 'i', second: 'none', class: 'priest/dragon' },
					"Torture": { first: 'p', second: 'none', class: 'scout' },
				};
				let header = game.i18n.localize(`gs.dialog.genSkills.header`) + promptType;
				dialogContent = `<h3>${header}</h3>`;
				promptTitle = game.i18n.localize(`gs.dialog.genSkills.title`);
				let classNames, classLevelBonus = 0;

				for (const [id, item] of Object.entries(genSkillsList)) {
					if (id === promptType) {
						classNames = item.class;
						dialogContent += `<p style="font-weight: bold;">${game.i18n.localize('gs.dialog.genSkills.primary')}</p>`;
						const primaryAbilityMap = {
							i: 'int',
							t: 'tec',
							p: 'psy'
						}
						const firstWord = game.i18n.localize(`gs.actor.character.${primaryAbilityMap[item.first]}`);
						const secondWord = game.i18n.localize(`gs.actor.character.${primaryAbilityMap[item.second]}`);
						if (item.second === 'none') {
							dialogContent += `
								<p><input class='recall' type='radio' name="primary" checked disabled value="${item.first}"> ${game.i18n.localize('gs.dialog.genSkills.recall')} (${firstWord})</p>
								<p><input class='use' type='radio' name="primary" disabled value="${item.second}"> ${game.i18n.localize('gs.dialog.genSkills.use')}</p>
							`;
						} else {
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
							const abilityMap = {
								f: 'foc',
								e: 'end',
								r: 'ref'
							};
							const abilityKey = abilityMap[secondaryAbility];
							const text = game.i18n.localize(`gs.actor.character.${abilityKey}`) + " ";
							const score = calcScore[letter + secondaryAbility];
							return { text, score };
						};

						let bonusScore = 0, labelText = "";
						// Helper function
						const settingItems = (labelCode, primary, secondary) => {
							labelText += game.i18n.localize(`gs.actor.character.${labelCode}`) + " ";
							const { text, score } = getSecondaryScore(primary, secondary);
							labelText += text;
							bonusScore = score;
						};

						if (primaryAbility === 'i')
							settingItems('int', primaryAbility, secondaryAbility);
						else if (primaryAbility === 't')
							settingItems('tec', primaryAbility, secondaryAbility);
						else if (primaryAbility === 'p')
							settingItems('psy', primaryAbility, secondaryAbility);

						classNames = classNames.includes("/") ? classNames.split("/") : classNames;
						let tempName = '';
						for (let x = 0; x < classNames.length; x++) {
							if (typeof (classNames) === 'string') {
								classLevelBonus = this.actor.system.levels.classes[classNames];
								tempName = classNames;
							} else {
								classNames.forEach(name => {
									if (this.actor.system.levels.classes[name] > classLevelBonus) {
										classLevelBonus = this.actor.system.levels.classes[name];
										tempName = name;
									}
								});
							}
						}

						const foundValues = [labelText, bonusScore, classLevelBonus, modifiers, tempName];
						resolve(foundValues);
					}
				};
				button2 = {
					label: game.i18n.localize('gs.dialog.cancel'),
					callback: () => resolve(0)
				};
			} else if (supplementGenSkills.includes(promptType)) {
				let selector = '';
				promptType === 'Taming' ? selector = 'taming' : selector = 'herbalist';
				promptTitle = promptType + game.i18n.localize(`gs.dialog.${selector}.title`);
				dialogContent = `<h2>${game.i18n.localize(`gs.dialog.${selector}.header`)}</h2>
					<div>${game.i18n.localize(`gs.dialog.${selector}.body`)}${promptType}</div>`;
				button1 = {
					label: game.i18n.localize(`gs.dialog.${selector}.button1`),
					callback: () => {
						resolve(game.i18n.localize(`gs.dialog.${selector}.button1`));
					}
				};
				button2 = {
					label: game.i18n.localize(`gs.dialog.${selector}.button2`),
					callback: () => {
						resolve(game.i18n.localize(`gs.dialog.${selector}.button2`));
					}
				};
				button3 = {
					label: game.i18n.localize(`gs.dialog.${selector}.button3`),
					callback: () => {
						resolve(game.i18n.localize(`gs.dialog.${selector}.button3`));
					}
				};
			} else if (promptType === 'multipleChants') {
				promptTitle = game.i18n.localize(`gs.dialog.${promptType}.title`);
				// promptName is holding the Skill Value in this case
				dialogContent = `<h3>` + game.i18n.localize(`gs.dialog.${promptType}.header`) + `</h3>
					<div>`+ game.i18n.localize(`gs.dialog.${promptType}.body0`) + `</div><div>&nbsp;</div>
					<div>`+ game.i18n.localize(`gs.dialog.${promptType}.body${promptName}`) + `</div>`;

				// Adding buttons
				button1 = {
					label: game.i18n.localize(`gs.dialog.${promptType}.button1`),
					callback: () => {
						resolve(1);
					}
				};
				button2 = {
					label: game.i18n.localize(`gs.dialog.${promptType}.button2`),
					callback: () => {
						resolve(2);
					}
				};
				button3 = {
					label: game.i18n.localize(`gs.dialog.${promptType}.button3`),
					callback: () => {
						resolve(3);
					}
				};

			}

			if (promptType != 'returnSpell')
				buttons = { button1: button1, buttonTwo: button2 };

			if (promptType === 'multipleChants' && promptName > 2)
				buttons.button3 = button3;

			if (thirdButtonNames.includes(promptType))
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
	 * Simple method to allow players and monsters to be added to the combat tracker & roll initiative
	 * @param {HTML} event Click event
	 * @param {JSON} actor JSON directory for the actor that made the click event
	 */
	async _toggleCombatState(event, actor) {
		event.preventDefault();
		try {
			// Ensure there is an active combat or start a new one if necessary
			let combat = game.combat;
			if (!combat)
				combat = await Combat.create({}, { renderSheet: false });

			// Check if the actor is already in the current combat
			let combatant = combat.combatants.find(c => c.actor.id === actor.id);

			// If not, add them
			if (!combatant) {
				combatant = await combat.createEmbeddedDocuments('Combatant', [{
					actorId: actor.id,
					tokenId: actor.getActiveTokens()[0]?.id,  // Ensures a tokenId if there's an active token
				}]);
				combatant = combatant[0]; // Create returns an array
			}

			// If the actor is already in combat but not active, activate them
			if (!combatant.isActive)
				await combat.updateEmbeddedDocuments('Combatant', [{ _id: combatant.id, active: true }]);

			// Roll initiative if it hasn't been rolled yet
			if (combatant.initiative === null)
				await combat.rollInitiative(combatant.id);

			console.log(`GSAS _toggleCombatState || ${actor.name} is now active in combat.`);
		} catch (err) {
			console.error('GSAS _toggleCombatState || Error:', err);
		}
	}

	/**
	 * Helps roll initiative for both characters and monsters
	 * @param {*} event The click event
	 * @returns Nothing to break out of method early
	 */
	async _rollInitiative(event) {
		event.preventDefault();

		const actorType = this.actor.type;
		let anticipateBonus = 0, rollMessage = "2d6";

		if (actorType === 'character') {
			const rollMod = await this._promptMiscModChoice("rollMod", game.i18n.localize('gs.actor.common.init'));
			anticipateBonus = this._getSkillBonus('Anticipate');
			if (anticipateBonus > 0)
				rollMessage += ` + ${anticipateBonus}`;
			if (rollMod > 0)
				rollMessage += ` + ${rollMod}`;
			else if (rollMod < 0)
				rollMessage += ` - ${Math.abs(rollMod)}`;
		} else if (actorType === 'monster') {
			const container = event.currentTarget.closest('.reveal-rollable');
			if (!container) {
				console.error("Error getting monster init container");
				return;
			}
			const initContainer = container.querySelector('.monsterInit');
			if (!initContainer) {
				console.error("Couldn't get monster init container");
				return;
			}
			const initValue = initContainer.value;
			const [powerDice, powerMod] = initValue.includes('+') ? initValue.split('+') : [initValue, 0];
			rollMessage = powerDice.trim();
			if (powerMod != 0) rollMessage += ` + ${parseInt(powerMod.trim(), 10)}`;
		}

		this._sendRollMessage(rollMessage, `${game.i18n.localize("gs.actor.common.init")}`);
	}

	/**
	 * A basic method to send Rolled messages to the chat window
	 * @param {string} rollMessage A string of characters to be evaluated: eg '2d6 + 2 - 1'
	 * @param {string} flavorMessage A message to go along with the roll to understand what the roll is for
	 */
	async _sendRollMessage(rollMessage, flavorMessage, maintainedSpell = "") {
		try {
			const roll = new Roll(rollMessage);
			await roll.evaluate();

			const diceResults = roll.terms[0].results.map(r => r.result);
			const status = this._checkForCritRolls(diceResults, maintainedSpell ? maintainedSpell : "");

			await roll.toMessage({
				speaker: ChatMessage.getSpeaker({ actor: this.actor }),
				flavor: `${flavorMessage} ${status[1]}`,
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
	_specialRollsClassBonus(rollType) {
		let classBonus = 0, selectedClass = "", dialogMessage = '';
		switch (rollType) {
			case 'luck': case 'swim': case 'strRes': case 'longDistance': case 'tacMove': return { classBonus, dialogMessage };
			case 'psyRes': case 'intRes':
				const advLevel = this.actor.system.levels.adventurer;
				const dragonLevel = this.actor.system.levels.classes.dragon;
				console.log('>>> AdvLevel & Dragon Level', advLevel, dragonLevel);
				if (advLevel >= dragonLevel) {
					classBonus = parseInt(advLevel, 10);
					dialogMessage += this._addToFlavorMessage('levelScore', game.i18n.localize('gs.actor.character.lvl'), classBonus);
				} else {
					classBonus = parseInt(dragonLevel, 10);
					dialogMessage += this._addToFlavorMessage('levelScore', game.i18n.localize('gs.actor.character.dragon'), classBonus);
				}
				return { classBonus, dialogMessage };
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
			'sorcerer': 'gs.actor.character.sorcerer', 'priest': 'gs.actor.character.priest', 'dragon': 'gs.actor.character.dragon', 'shaman': 'gs.actor.character.shaman',
		}

		// Getting the relevant classes for the roll type
		const relevantClasses = rollTypeMapping[rollType];

		if (relevantClasses) {
			relevantClasses.forEach(className => actorClasses[className] > classBonus
				? (classBonus = parseInt(actorClasses[className], 10), selectedClass = className.charAt(0).toUpperCase() + className.slice(1))
				: classBonus);
		} else {
			console.error(`GS _specialRollsClassBonus || Unknown roll type: ${rollType}`);
		}

		dialogMessage += this._addToFlavorMessage('levelScore', game.i18n.localize(selectedClass), classBonus);

		return { classBonus, dialogMessage };
	}

	/**
	 * Finds the proper calculated ability score for a given string
	 * @param {string} calcAbilityScore A two character string representing a calculated ability score: E.G. se = Strength Endurance
	 * @returns A number associated with the given string
	 */
	_findTheCalcAbilityScore(calcAbilityScore) {
		const abilityCalcScores = this.actor.system.abilities.calc;
		return abilityCalcScores[calcAbilityScore];
	}

	/**
	 * Returns the overall adventurer level rather than a class level
	 * @returns Adventurer level
	 */
	_getAdventurerLevel() {
		return this.actor.system.levels.adventurer;
	}

	/**
	 * Sorts the special roll from the character sheet side bar and helps get all associated bonuses for this roll check
	 * @param {string} rollType The type of roll being made, must be lowercase
	 * @param {string} skillName The skill associated with the roll for any applicable bonus
	 * @param {JSON} extraSkill This is an extra skill modifier, currently only used with the herbalist skill, otherwise leave blank
	 */
	async _specialRolls(rollType, skillName, extraSkill = null) {
		let abilityScore = 0, dice = '2d6', classBonus = 0, maintainedSpell, spellTypeMaintained, abilityName = '';
		const fakeSkill = { name: skillName };
		let chatMessage = this._setMessageHeader(this.actor, fakeSkill, game.i18n.localize('gs.dialog.skillCheck'));
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
		const appliedTooSkills = ['observe', 'sixthSense', 'generalKnow', 'monsterKnow', 'riding'];
		const abilityMapping = {
			ir: intelligenceReflexChecks, if: intelligenceFocusChecks, ie: intelligenceEduranceChecks,
			tf: techniqueFocusChecks, pr: psycheReflexChecks, pe: pyscheEnduranceChecks,
			sr: strengthReflexChecks, se: strengthEnduranceChecks, sf: strengthFocusChecks
		};
		const abilityNames = {
			ir: game.i18n.localize('gs.actor.character.intRef'), if: game.i18n.localize('gs.actor.character.intFoc'), ie: game.i18n.localize('gs.actor.character.intEnd'),
			tf: game.i18n.localize('gs.actor.character.tecFoc'), pr: game.i18n.localize('gs.actor.character.psyRef'), pe: game.i18n.localize('gs.actor.character.psyEnd'),
			sr: game.i18n.localize('gs.actor.character.strRef'), se: game.i18n.localize('gs.actor.character.strEnd'), sf: game.i18n.localize('gs.actor.character.strFoc')
		}

		// Sending standard dice to chat message
		chatMessage += this._addToFlavorMessage('diceInfo', game.i18n.localize('gs.dialog.dice'), dice);

		if (rollType === 'spellMaint') {
			maintainedSpell = await this._promptMiscModChoice('returnSpell', chatMessage);
			const maintainedSpellSchool = maintainedSpell.system.schoolChoice.toLowerCase();
			spellTypeMaintained = maintainedSpell.system.styleChoice.toLowerCase();
			maintainedSpellSchool === 'words of true power' ? (intelligenceEduranceChecks.push('spellMaintI'), rollType = "spellMaintI")
				: maintainedSpellSchool === 'miracle' ? (pyscheEnduranceChecks.push('spellMaintPp'), rollType = "spellMaintPp")
					: maintainedSpellSchool === 'ancestral dragon' ? (pyscheEnduranceChecks.push('spellMaintPd'), rollType = "spellMaintPd")
						: (pyscheEnduranceChecks.push('spellMaintPs'), rollType = "spellMaintPs");
		}

		// Checking if RollType is found in ability mapping and subsequently getting ability name from key
		for (const [key, checks] of Object.entries(abilityMapping)) {
			if (checks.includes(rollType)) {
				abilityScore = this._findTheCalcAbilityScore(key);
				abilityName = abilityNames[key];
				break;
			}
		}

		// Updating ability score to that of the Special Prompts array
		if (specialPrompts.includes(rollType)) {
			abilityScore = await this._promptMiscModChoice(rollType);
			abilityName = skillName;
		}

		// Adding ability scores to chat message
		chatMessage += this._addToFlavorMessage('abilScore', abilityName, abilityScore);

		// Getting class bonus or adventurer level in certain cases.
		const { classBonus: cBonus, dialogMessage: dMessage } = this._specialRollsClassBonus(rollType, chatMessage);
		classBonus += cBonus;
		chatMessage += dMessage;
		if (adventurerLevel.includes(rollType)) {
			classBonus = this._getAdventurerLevel(chatMessage);
			if (classBonus > 0)
				chatMessage += this._addToFlavorMessage('levelScore', game.i18n.localize('gs.actor.common.leve'), classBonus);
		}

		// Getting misc modifiers such as circumstance bonuses or terrain disadvantages and etc.
		const rollMod = await this._promptMiscModChoice("rollMod", game.i18n.localize('gs.dialog.random'));

		// Updating skillName when special roll != skill name
		switch (rollType) {
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
		if (rollType === 'provoke' || (rollType === 'tacMove' && skillBonus != 0)) skillBonus -= 1;
		else if (rollType === 'moveObs') skillBonus += 1;
		else if (rollType === 'monsterKnow') skillBonus = skillBonus * 2;
		else if (rollType === 'generalKnow' || rollType === 'longDistance')
			skillBonus = skillBonus === 3 ? 4 : skillBonus;

		// Helper function for the next section
		const addExtraSkillInfo = (extraSkill) => {
			let skillValue = extraSkill.system.value < 3 ? extraSkill.system.value : 4
			chatMessage += this._addToFlavorMessage('skillScore', extraSkill.name, skillValue);
			skillBonus += skillValue;
		}

		if (skillBonus > 0)
			chatMessage += this._addToFlavorMessage('skillScore', skillName, skillBonus);
		if (appliedTooSkills.includes(rollType) && extraSkill)
			addExtraSkillInfo(extraSkill);
		if (rollType === 'firstAid') {
			const skills = this._getFromItemsList('skill');
			const nurseSkill = skills.find(s => s.name === "Nurse") || 0;
			if (nurseSkill)
				addExtraSkillInfo(nurseSkill);
		}
		if (rollMod > 0)
			chatMessage += this._addToFlavorMessage('rollScore', game.i18n.localize('gs.dialog.mods.mod'), rollMod);

		const rollMessage = this._setRollMessage(dice, abilityScore, classBonus, skillBonus, rollMod);

		this._sendRollMessage(rollMessage, chatMessage, maintainedSpell ? maintainedSpell : "");
	}

	// Pushing all items from embedded documents into top level objects for ease of use
	_prepareItems(data) {
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
			words: [],
			necro: []
		};
		const martial = [];

		// Iterating through all items
		for (let i of data.items) {
			if (i.type === 'weapon')
				weapons.push(i);
			else if (i.type === 'armor')
				armor.push(i);
			else if (i.type === 'shield')
				shields.push(i);
			else if (i.type === 'item')
				items.push(i);
			else if (i.type === 'skill') {
				if (i.system.type)
					skills.adventurer.push(i);
				else
					skills.general.push(i);
			}
			else if (i.type === 'spell') {
				if (i.system.schoolChoice === 'Miracles')
					spells.miracles.push(i);
				else if (i.system.schoolChoice === 'Ancestral Dragon')
					spells.dragon.push(i);
				else if (i.system.schoolChoice === 'Spirit Arts')
					spells.spirit.push(i);
				else if (i.system.schoolChoice === 'Necromancy')
					spells.necro.push(i);
				else
					spells.words.push(i);
			}
			else if (i.type === 'martialtechniques')
				martial.push(i);
		}

		// Assigning to data and return
		data.weapons = weapons;
		data.armor = armor;
		data.shields = shields;
		data.items = items;
		data.skills = skills;
		data.spells = spells;
		data.martialTechniques = martial;
	}

	async _prepareCharacterData(data) {
		// Updating wounds and health
		const lFValue = data.actor.system.lifeForce.max - data.actor.system.lifeForce.wounds;
		await data.actor.update({
			'system.lifeForce.value': lFValue,
			'prototypeToken.actorLink': true
		});

		// Checking Perseverance Skill
		if (data.skillValues.adventurer.Perseverance)
			this._updatePerseverance(data);

		// Updating Armor if armor is worn and Armor: XX skill is present with a value > 0
		if (data.armor && data.skills.adventurer.some(skill => (skill.name === 'Armor: Cloth' || skill.name === 'Armor: Light' || skill.name === 'Armor: Heavy') && skill.system.value > 0))
			this._updateArmor(data);

		// Setting up vision for standard or darkvision
		if (data.skillValues.general.Darkvision)
			this._updateVision(data, 'Darkvision');
		if (data.skillValues.general['Magical Perception'])
			this._updateVision(data, 'Magical Perception');

		// Updating Draconic armor and weapons
		if (data.skillValues.general['Draconic Heritage'])
			this._updateDraconicHeritage(data);

		// Updating Spell Uses based on Magical Talent Skill
		if (data.skillValues.adventurer['Magical Talent'])
			this._updateSpellUses(data);
	}

	async _updatePerseverance(data) {
		const perseveranceRank = data.skillValues.adventurer.Perseverance;
		const skill = data.actor.items.find(i => i.name === 'Perseverance');
		const perseveranceFlag = this.actor.getFlag('gs', skill.name) || 0;

		if (perseveranceRank !== perseveranceFlag) {
			await this.actor.setFlag('gs', skill.name, perseveranceRank);
			for (let rank = 1; rank <= 5; rank++) {
				let ex = rank <= perseveranceRank ? 1 : 0;
				let maxAdjust = rank <= perseveranceRank ? 1 : 0;
				await this.actor.update({
					[`system.fatigue.rank${rank}`]: {
						'ex': ex,
						'max': data.actor.system.fatigue[`rank${rank}`].max + maxAdjust
					}
				});
			}
		}
	}

	async _updateArmor(data) {
		const draconicValue = data.skillValues.general['Draconic Heritage'] || 0;
		// Uses helper function to return equiped armor
		const armor = this._getEquippedArmor(data.armor) || 0;
		if (!armor) return;
		const armorScore = armor.system.score;
		const armorWeight = armor.system.type.split(" ")[0];
		const armorName = `Armor: ${armorWeight}`;
		let skillValue = data.skillValues.adventurer[armorName] || 0;
		const armorFlag = this.actor.getFlag('gs', armorName) || 0;
		if (!armorFlag)
			await this.actor.setFlag('gs', armorName, armorScore);
		const newScore = (armorFlag === 0 ? armorScore : armorFlag) + skillValue + draconicValue;
		if (armorScore !== newScore) {
			const deepArmor = this.actor.items.find(i => i._id === armor._id);
			await deepArmor.update({ 'system.score': newScore });
		}
	}

	async _updateDraconicHeritage(data) {
		// Using updateArmor method to apply Draconic Skill Level
		const draconicValue = data.skillValues.general['Draconic Heritage'];
		this._updateArmor(data);

		const barehands1H = this.actor.items.find(i => i.name === 'Barehanded Attack (1H)') || 0;
		const barehands2H = this.actor.items.find(i => i.name === 'Barehanded Attack (2H)') || 0;

		const updatePowerValues = (barehandsPower, skillRank) => {
			const values = barehandsPower.includes("+") ? barehandsPower.split("+") : [barehandsPower, 0];
			if (values[1] === 0)
				return values[0] + "+" + skillRank;
			else
				return values[0] + "+" + (parseInt(values[1], 10) + skillRank);
		};

		const updateHand = async (weapon, flagText, lizardRank) => {
			let weaponFlag = this.actor.getFlag('gs', flagText);
			if (!weaponFlag) {
				weaponFlag = weapon.system.power;
				await this.actor.setFlag('gs', flagText, weaponFlag);
			}
			const newPower = updatePowerValues(weaponFlag, lizardRank);
			if (weapon && weapon.system.power !== newPower)
				await weapon.update({
					'img': 'icons/creatures/claws/claw-talons-glowing-orange.webp',
					'system.power': newPower,
					'system.attribute': 'Slash'
				});
		}

		if (barehands1H)
			updateHand(barehands1H, 'lizardClaws1', draconicValue);
		if (barehands2H)
			updateHand(barehands2H, 'lizardClaws2', draconicValue);
	}

	async _updateVision(data, visionType) {
		const dVValue = data.skillValues.general[visionType];
		let visionName = visionType === 'Darkvision' ? 'darkvision' : 'basic';
		const updateVision = {
			visionMode: visionName,
			range: dVValue > 0 ? dVValue : 0,
			enabled: true
		}

		if (data.actor.prototypeToken.sight.range !== dVValue) {
			// Updating actor Prototype Token Info, this will effect the Token settings on PC sheet
			await this.actor.update({
				'prototypeToken.sight.visionMode': updateVision.visionMode,
				'prototypeToken.sight.range': updateVision.range,
				'prototypeToken.sight.enabled': updateVision.enabled
			});

			// Checking and updating any active tokens
			const token = this.actor.getActiveTokens()[0];
			if (token && token.document) {
				await token.document.update({
					'sight.visionMode': updateVision.visionMode,
					'sight.range': updateVision.range,
					'sight.enabled': updateVision.enabled
				});
			}
		}
	}

	async _updateSpellUses(data) {
		const magicalTalentFlag = data.actor.getFlag('gs', 'Magical Talent') || 0;
		const magicalTalentValue = data.skillValues.adventurer['Magical Talent'];
		const playerSpellUses = data.actor.system.spellUse.max;
		if (!magicalTalentFlag)
			data.actor.setFlag('gs', 'Magical Talent', playerSpellUses);
		const newScore = (magicalTalentFlag === 0 ? playerSpellUses : magicalTalentFlag) + magicalTalentValue;
		if (playerSpellUses !== newScore) {
			data.actor.update({
				'system.spellUse.max': newScore
			});
		}
	}

	/**
	 * Checks over attrition clicks and decides to add fatigue based on current wounds and heavy armor
	 */
	async _checkAttrition() {
		const actor = this.actor;
		const systemData = actor.system;
		let attritionLevel = 1;
		const attritionThresholds = [5, 8, 11, 14, 16, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40];
		const attrition = systemData.attrition;
		const currentWounds = systemData.lifeForce.wounds;
		const lifeForceHalf = systemData.lifeForce.double;
		// Using helper function to pull equipped armor
		const armor = this._getEquippedArmor(this.armor);
		const armorWorn = armor ? armor.system.heavy : null;
		const attritionFlag = actor.getFlag('gs', 'attrition');

		for (let [id, a] of Object.entries(attrition)) {
			if (a) attritionLevel += 1;
			else continue;
		}

		// Checking if character is wearing heavy armor and if Str End is less than value, true? +1 fatigue
		const checkIfHeavy = async (armorWorn, systemData) => {
			let encActionSkillValue = this._getSkillBonus('Encumbered Action');
			if (armorWorn.value && (systemData.abilities.calc.se + encActionSkillValue) < armorWorn.x) {
				setTimeout(async () => {
					await this._checkFatigueRanks();
				}, 200);
			}
		}

		// Built-in arrow function to (re)set attrition flag level, update fatigue, and modify fatigue based on armor.
		const updatingFatigue = async (attritionLevel, armorWorn, systemData) => {
			await actor.setFlag('gs', 'attrition', attritionLevel);
			await this._checkFatigueRanks();
			await checkIfHeavy(armorWorn, systemData);
		}

		if (currentWounds < lifeForceHalf) {
			if (attritionThresholds.includes(attritionLevel)) {
				console.log("_checkAttrition |", attritionFlag, attritionLevel);
				if (!attritionFlag || (attritionFlag && (attritionFlag + 1) === attritionLevel))
					updatingFatigue(attritionLevel, armorWorn, systemData);
			} else if (attritionFlag)
				await actor.unsetFlag('gs', 'attrition');
		} else if (currentWounds >= lifeForceHalf) {
			await this._checkFatigueRanks();
			if (attritionThresholds.includes(attritionLevel)) {
				if (!attritionFlag || (attritionFlag && (attritionFlag + 1) === attritionLevel))
					updatingFatigue(attritionLevel, armorWorn, systemData);
			} else if (attritionFlag)
				await actor.unsetFlag('gs', 'attrition');
		}
	}

	async _checkFatigue(event) {
		event.preventDefault();
		let boxNumber = event.currentTarget.dataset.fcbox;
		const cBoxValue = event.currentTarget.checked;

		// Update character checkbox
		boxNumber = boxNumber.split("");
		await this.actor.update({
			[`system.fatigue.rank${boxNumber[0]}.marked.${boxNumber[1]}`]: cBoxValue
		});

		const actor = this.actor;
		const systemData = actor.system;
		const fatigue = systemData.fatigue;
		const ranks = [
			{ rank: fatigue.rank1, flag: 'fatigueRank1', minMaxCount: 6, label: 'rank1' },
			{ rank: fatigue.rank2, flag: 'fatigueRank2', minMaxCount: 5, label: 'rank2' },
			{ rank: fatigue.rank3, flag: 'fatigueRank3', minMaxCount: 4, label: 'rank3' },
			{ rank: fatigue.rank4, flag: 'fatigueRank4', minMaxCount: 3, label: 'rank4' },
			{ rank: fatigue.rank5, flag: 'fatigueRank5', minMaxCount: 2, label: 'rank5' }
		];

		const flags = {
			fatigueRank1: await actor.getFlag('gs', 'fatigueRank1'),
			fatigueRank2: await actor.getFlag('gs', 'fatigueRank2'),
			fatigueRank3: await actor.getFlag('gs', 'fatigueRank3'),
			fatigueRank4: await actor.getFlag('gs', 'fatigueRank4'),
			fatigueRank5: await actor.getFlag('gs', 'fatigueRank5'),
			rank4Unconscious: await actor.getFlag('gs', 'rank4Unconscious')
		};

		// Iterrate over fatigue to update min to/from max
		const updateFatigueMin = async (rank, count, label) => {
			rank.min = 0;
			for (let i = 1; i <= count; i++) {
				if (rank.marked[i]) rank.min += 1;
			}
			await this.actor.update({
				[`system.fatigue.${label}.min`]: rank.min > 0 ? rank.min + 1 : 0
			});
		};

		// Checking over fatigue and applying negative modifiers as needed
		for (const { rank, flag, minMaxCount, label } of ranks) {
			updateFatigueMin(rank, minMaxCount, label);
			// console.log(".>>", rank, flag, minMaxCount, label);
			// console.log("min/max", rank.min, rank.max);
			if (rank.min == rank.max && !flags[flag]) {
				await actor.setFlag('gs', flag, -1);
				this._applyAbilityScoreFatigueMods(actor, systemData, true, label);
			} else if (rank.min < rank.max && flags[flag]) {
				await actor.unsetFlag('gs', flag);
				this._applyAbilityScoreFatigueMods(actor, systemData, false, label);
			}
		}

		// Special case to remove unconscious when rank 4 fully cleared
		if (fatigue.rank4.min === 0 && flags.rank4Unconscious) {
			await actor.unsetFlag('gs', 'rank4Unconscious');
			ui.notifications.info(`You are no longer unconscious and may act normally again.`);
		}
	}

	// Apply or revert fatigue modifiers
	async _applyAbilityScoreFatigueMods(actor, systemData, apply, rank) {
		let moveMod = 0, rollMod = 0, lifeForceDeduction = 0;

		const updateAbilities = async (modifier, actor) => {
			for (const id in systemData.abilities.primary)
				systemData.abilities.primary[id] += modifier;
			for (const id in systemData.abilities.secondary)
				systemData.abilities.secondary[id] += modifier;
			await actor.update({
				'system.abilities.primary': systemData.abilities.primary,
				'system.abilities.secondary': systemData.abilities.secondary
			});
		};

		const updateMove = async (apply, factor, actor) => {
			moveMod = apply ? Math.floor(systemData.move / factor) : systemData.move * factor;
			if (apply && systemData.move % factor !== 0)
				actor.setFlag('gs', 'rank2Decimal', 0.5);
			else if (!apply) {
				const decimalFlag = actor.getFlag('gs', 'rank2Decimal');
				if (decimalFlag) {
					moveMod += 1;
					actor.unsetFlag('gs', 'rank2Decimal');
				}
			}
			await actor.update({
				'system.fatigue.fatigueMod': rollMod,
				'system.move': moveMod
			});
		};

		const updateLifeForce = async (apply, factor, actor) => {
			lifeForceDeduction = apply ? Math.floor(systemData.lifeForce.current / factor) : systemData.lifeForce.current * factor;
			if (apply && systemData.lifeForce.current % factor !== 0) {
				actor.setFlag('gs', 'rank3LifeForce', -1);
			} else if (!apply) {
				const lifeForceFlag = actor.getFlag('gs', 'rank3LifeForce');
				if (lifeForceFlag) {
					lifeForceDeduction += 1;
					actor.unsetFlag('gs', 'rank3LifeForce');
				}
			}
			await actor.update({
				'system.fatigue.fatigueMod': rollMod,
				'system.lifeForce.current': lifeForceDeduction
			})
		};

		switch (rank) {
			case "rank1":
				updateAbilities(apply ? -1 : 1, actor);
				break;
			case "rank2":
				rollMod = apply ? -2 : 0;
				updateMove(apply, 2, actor);
				break;
			case "rank3":
				rollMod = apply ? -3 : -2;
				updateLifeForce(apply, 2, actor);
				break;
			case "rank4":
				rollMod = apply ? -4 : -3;
				if (apply) {
					ui.notifications.warn(`Warning: You are now unconscious until your fatigue drops to rank 3 or less!`);
					if (!await actor.getFlag('gs', 'rank4RollMod')) {
						await actor.setFlag('gs', 'rank4Unconscious', -1);
						await actor.setFlag('gs', 'rank4RollMod', -1);
					}
				} else
					await actor.unsetFlag('gs', 'rank4RollMod');
				await actor.update({
					'system.fatigue.fatigueMod': rollMod
				});
				break;
			case "rank5":
				if (apply) {
					await actor.setFlag('gs', 'rank5Death', -1);
					ui.notifications.error(`Sadly, you have succumbed to your wounds and can no longer fight. Rest in peace ${actor.name}...`);
					// TODO: add in disable JS here and well as changing skills and other areas to 0.
				} else
					await actor.unsetFlag('gs', 'rank5Death');
				break;
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
				function getSkillFromItem(item, skillId) {
					const skills = item.system.skills || [];
					const skillIndex = skills.findIndex(skill => skill._id === skillId);
					return skillIndex !== -1 ? skills[skillIndex] : undefined;
				}

				if (item) {
					try {
						if (!item.sheet) {
							item = new Item(item); // Ensures it has a sheet property
						}
						item.sheet.render(true);
					} catch (error) {
						console.error("Error rendering skill sheet:", error);
					}
				} else {
					console.error("Skill with ID:", id, "not found.");
				}
			}
		},
		{
			name: "Delete",
			icon: '<i class="fas fa-trash"></i>',
			callback: async element => {
				const actor = this.actor;
				const id = element[0].dataset.id;
				const itemToDelete = actor.items.get(id);
				if (!itemToDelete) {
					console.error("Skill not found for deletion.");
					return;
				}
				const type = itemToDelete.type;
				// console.log("GS || ", itemToDelete, id, type);

				switch (type) {
					case 'skill':
						if (itemToDelete)
							await itemToDelete.delete();
						else return;

						if (itemToDelete.name === 'Draconic Heritage') {
							// Reverting claws to hands
							const barehands1 = await actor.getFlag('gs', 'lizardClaws1');
							const barehands2 = await actor.getFlag('gs', 'lizardClaws2');
							await actor.unsetFlag('gs', 'lizardClaws1');
							await actor.unsetFlag('gs', 'lizardClaws2');
							const bh1 = await actor.items.find(i => i.name === 'Barehanded Attack (1H)');
							const bh2 = await actor.items.find(i => i.name === 'Barehanded Attack (2H)');
							const revertWeapons = async (weapon, value) => {
								await weapon.update({
									'img': 'icons/skills/melee/unarmed-punch-fist.webp',
									'system.power': value,
									'system.attribute': 'Bludgeoning'
								});
							}
							if (bh1) await revertWeapons(bh1, barehands1);
							if (bh2) await revertWeapons(bh2, barehands2);

							// Checking for Armor: XX skill
							const armorWorn = actor.items.find(i => i.type === 'armor');
							const armorWeight = armorWorn.system.type.split(" ")[0];
							const armorXXSkill = this.skills?.adventurer?.[`Armor: ${armorWeight}`] || 0;
							const armorFlag = actor.getFlag('gs', `Armor: ${armorWeight}`) || 0;
							if (armorXXSkill === 0) {
								await armorWorn.update({ 'system.score': armorFlag });
								await actor.unsetFlag('gs', `Armor: ${armorWeight}`);
							}
						}
						else if (itemToDelete.name === 'Darkvision' ||
							itemToDelete.name === 'Magical Perception') {
							// await actor.unsetFlag('gs', 'darkvision');
							await this.actor.update({
								'prototypeToken.sight': {
									'visionMode': 'basic',
									'range': 0
								}
							});
							const token = actor.getActiveTokens()[0];
							// const token = canvas.tokens.placeables.find(t => t.name === this.name);
							if (token) {
								await token.document.update({
									'sight': {
										'visionMode': 'basic',
										'range': 0
									}
								});
								await token.refresh();
							}
						}
						else if (itemToDelete.name === 'Perseverance') {
							await actor.unsetFlag('gs', itemToDelete.name);
							await this.actor.update({
								'system.fatigue.rank1.ex': 0,
								'system.fatigue.rank2.ex': 0,
								'system.fatigue.rank3.ex': 0,
								'system.fatigue.rank4.ex': 0,
								'system.fatigue.rank5.ex': 0,
								'system.fatigue.rank1.max': 5,
								'system.fatigue.rank2.max': 4,
								'system.fatigue.rank3.max': 3,
								'system.fatigue.rank4.max': 2,
								'system.fatigue.rank5.max': 1
							});
						} else if (itemToDelete.name === 'Armor: Cloth' || itemToDelete.name === 'Armor: Light' || itemToDelete.name === 'Armor: Heavy') {
							const originalScore = await actor.getFlag('gs', itemToDelete.name);
							await actor.unsetFlag('gs', itemToDelete.name);
							const armor = await actor.items.find(i => i.type === 'armor');
							await armor.update({
								'system.score': originalScore
							});
						} else if (itemToDelete.name === 'Shields') {
							const originalScore = actor.getFlag('gs', 'shield');
							await actor.unsetFlag('gs', 'shield');
							const shield = actor.items.find(i => i.type === 'shield');
							await shield.update({
								'system.score': originalScore
							});
						} else if (itemToDelete.name === 'Magical Talent') {
							const originalSpellUses = actor.getFlag('gs', itemToDelete.name);
							await actor.unsetFlag('gs', itemToDelete.name);
							await actor.update({
								'system.spellUse.max': originalSpellUses
							});
						} else if (itemToDelete.name === 'Gorilla Tactics') actor.unsetFlag('gs', itemToDelete.name);
						break;
					case 'raceSheet': case 'weapon': case 'armor': case 'shield': case 'item': case 'spell': case 'martialtechnique':
						if (itemToDelete)
							itemToDelete.delete();
						else
							console.error("Race item not found for deletion.");

						// if(type === 'armor' || type === 'shield'){
						// 	const originalScore = this.actor.getFlag('gs', type);
						// 	let equipment = this.actor.items.filter(item => item.type.toLowerCase() === type);
						// 	equipment[0].update({
						// 		'system.score': originalScore
						// 	})
						// 	this.actor.unsetFlag('gs', type);
						// }
						break;
				}
			}
		}
	];
}
