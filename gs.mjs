import { gs } from "./module/config.mjs";
import GSItemSheet from "./module/sheets/GSItemSheet.mjs";
import GSActorSheet from "./module/sheets/GSActorSheet.mjs";
import { GSActor } from "./module/documents/GSActor.mjs";
import { preloadHandlebarsTemplates } from "./module/helpers/templates.mjs";
import { GSItem } from "./module/documents/GSItem.mjs";

Hooks.once("init", () => {
	game.gs = { GSActor }

	console.log("GS | Initializing Gobline Slayer TTRPG");

	CONFIG.gs = gs;
	CONFIG.Item.entityClass = GSItem;
	CONFIG.Combat.initiative = {
		formula: "@init",
		decimals: 2
	};

	CONFIG.Actor.documentClass = GSActor;

	Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("gs", GSActorSheet, {
		makeDefault: true,
		label: game.i18n.localize('gs.sheets.actor')
	});

	Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("gs", GSItemSheet, {
		makeDefault: true,
		label: game.i18n.localize('gs.sheets.item')
	});

	// Preload Handlebars templates
	return preloadHandlebarsTemplates();
});

// Defining Enrichers ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Hooks.on("init", () => {
	CONFIG.TextEditor.enrichers.push({
		pattern: /\[\[\/cast "(?<spellName>[^"]+)"(?: (?<checkFormula>[^\]]+))?]]/gi,
		enricher: enrichSpellCast
	});
});

async function enrichSpellCast(match, options) {
	// Extract spell name and check formula
	const { spellName, checkFormula } = match.groups;

	const spell = await findSpellByName(spellName);
	if (!spell) {
		return document.createTextNode(`Spell "${spellName}" not found!`);
	}

	// Create the @UUID link
	const uuidLink = `@UUID[${spell.uuid}]{${spell.name}}`;

	// Use TextEditor.enrichHTML to process the @UUID link
	const enrichedLink = await TextEditor.enrichHTML(uuidLink, { async: true });

	// Create button for rolling the spell with the spell check formula
	const rollButton = document.createElement("button");
	rollButton.classList.add("spell-cast-button");
	rollButton.dataset.spellName = spell.name;
	rollButton.dataset.checkFormula = checkFormula;
	rollButton.innerHTML = `<i class="fa-solid fa-dice-d20"></i>`;

	// Combine both elements into a wrapper
	const wrapper = document.createElement("span");
	wrapper.classList.add("spell-cast-wrapper");
	wrapper.innerHTML = enrichedLink;
	wrapper.appendChild(document.createTextNode(` > `));
	wrapper.appendChild(rollButton);

	return wrapper;
}

async function findSpellByName(spellName) {
	const spellSchools = CONFIG.gs.spells;
	if (!spellSchools) return null;

	for (const school in spellSchools) {
		const spells = spellSchools[school];
		const spell = Object.values(spells).find(s => s.name.toLowerCase() === spellName.toLowerCase());
		if (spell) return spell;
	}

	return null; // Ensure the function always returns something
}

Hooks.on("renderJournalSheet", handleSpellCastButtons);
Hooks.on("renderActorSheet", handleSpellCastButtons);
Hooks.on("renderItemSheet", handleSpellCastButtons);

function handleSpellCastButtons(sheet, html) {
	html.find(".spell-link").click(async (event) => {
		event.preventDefault();
		const uuid = event.currentTarget.dataset.uuid;

		if (uuid) {
			const doc = await fromUuid(uuid);
			if (doc)
				doc.sheet.render(true);
			else
				ui.notifications.warn(`Document with UUID "${uuid}" not found!`);
		}
	});

	html.find(".spell-cast-button").click(async (event) => {
		const spellName = event.currentTarget.dataset.spellName;
		const checkFormula = event.currentTarget.dataset.checkFormula;
		const actor = sheet.actor;
		await castMonsterSpell(spellName, actor, checkFormula);
	});
}

// Casting function
async function castMonsterSpell(spellName, actor, checkFormula) {
	const spell = await findSpellByName(spellName);

	// Check if spell is spelt correctly, else return early
	if (!spell) {
		ui.notifications.warn(`Spell "${spellName}" not found in the system!`);
		return;
	}

	// Retrieve spell document from compendium using uuid, else return early
	const spellDoc = await fromUuid(spell.uuid);
	if (!spellDoc) {
		ui.notifications.warn(`Spell document for "${spellName}" not found!`);
		return;
	}

	const actorToken = actor.token;
	const defaultDice = '2d6';

	// Retrieving spell DC for later use.
	const spellDC = spellDoc.system.difficulty;

	// Setup chatmessage string
	let chatMessage = `<div class="chat messageHeader grid grid-7col">
		<img src='${actorToken.texture.src}'><h2 class="actorName grid-span-6">${spell.name}: ${game.i18n.localize('gs.dialog.spells.useCheck')}</h2>
	</div>`;
	// Adding Spell DC to chat
	chatMessage += addToFlavorMessage('rollScore', game.i18n.localize('gs.dialog.spells.diffCheck'), spellDC);
	// Setting base hit check dice to chat window
	chatMessage += addToFlavorMessage('diceInfo', game.i18n.localize('gs.dialog.dice'), defaultDice);
	// Setting monster modifier
	chatMessage += addToFlavorMessage('skillScore', game.i18n.localize('gs.gear.spells.mds'), '+' + checkFormula.split("+")[1]);
	// Setting up new roll with attack formula
	const roll = new Roll(checkFormula);
	await roll.evaluate();
	// Setting EffectScore vs DC results
	let effectScoreResult = roll.total >= spellDC ? true : false;
	// Checking for Crit Success/Failure
	const critStatus = _checkForCriticals(roll);
	if (critStatus[0]) {
		chatMessage += addToFlavorMessage('diceInfo', game.i18n.localize('gs.gear.spells.efs'), roll.total);
		if (critStatus[0] === 'success') {
			if (effectScoreResult)
				roll.total += 5;
			else
				roll.total = spellDC;
			chatMessage += `${critStatus[1]}`;
		} else if (critStatus[0] === 'fail') {
			effectScoreResult = false;
		}
	}

	// If spell is effective, check power increase and set roll power button
	let spellPowerDiceHold = '';
	if (effectScoreResult) {
		let results = _addEffectiveResults(actor, spell, roll.total);
		if (results) {
			let tempTargets;
			for (let x = 0; x < results.length; x++) {
				if (x === 2)
					chatMessage += results[x];
				if (x === 1) {
					for (const [key, item] of Object.entries(results[1])) {
						if (key === 'recovery' || key === 'power')
							spellPowerDiceHold += _setSpellPowerDice(key, item, spell, tempTargets, roll.total, actor);
					}
				}
				if (x === 0)
					tempTargets = results[0];
			}
		}
		// Adding effectiveness indicator
		chatMessage += _checkEffectResulsts(effectScoreResult);
		// If spell use is effective, add button to chat window
		if (spellPowerDiceHold)
			chatMessage += spellPowerDiceHold;
	}

	sendRollToWindow(roll, chatMessage, actor);
}

function _checkForCriticals(roll) {
	let critSuccess = 12, critFail = 2, results = [], diceResultTotal = roll.result.split(' + ')[0];

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

function _checkEffectResulsts(effectScoreResult) {
	if (effectScoreResult)
		return addToFlavorMessage('spellCastSuccess', game.i18n.localize('gs.dialog.spells.cast'), game.i18n.localize('gs.dialog.crits.succ'));
	else
		return addToFlavorMessage('spellCastFailure', game.i18n.localize('gs.dialog.spells.cast'), game.i18n.localize('gs.dialog.crits.fail'));
}

function _addEffectiveResults(actor, spell, rollTotal) {
	let configSpell;
	let results = [];

	// Grabbling spell effect score range and modifications
	configSpell = spell.effectivenessScore || null;

	if (configSpell != null) {
		// Adding target info to results
		results.push(spell.target);

		configSpell.forEach(s => {
			if (rollTotal >= s.range[0] && rollTotal <= s.range[1]) {
				results.push(s);
			}
		});

		for (let [key, item] of Object.entries(results[1])) {
			if (key === 'power') {
				let tempSpellPower = item.split(" + ");
				let newSpellPower = `${tempSpellPower.slice(0, -1).join(" + ")} + ${actor.system.lifeForce.double}`;
				results[1].power = newSpellPower;
				results.push(addToFlavorMessage('armorDodgeScore', game.i18n.localize('gs.actor.character.power'), newSpellPower));
			}
		}
	} else {
		results = 0;
	}

	return results;
}

function _setSpellPowerDice(key, extractedDice, spell, targets, spellDC, actor) {
	return `<div class='spellTarget grid grid-2col'>
		<div style="display:flex; justify-content: center; align-items: center; font-size: 14px;">${game.i18n.localize('gs.dialog.spells.rolldice')}</div>
		<button type="button" class="actorSpellDmg" data-spelldc="${spellDC}" data-targets="${targets}" data-keytype="${key}" data-rolldice="${extractedDice}" data-playerid="${actor._id}" data-spell="${spell.uuid}"><i class="fa-solid fa-wand-magic-sparkles"></i></button>
	</div>`;
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Sending roll to chatWindow
function sendRollToWindow(roll, chatMessage, player) {
	const token = player.getActiveTokens()[0];
	roll.toMessage({
		speaker: { alias: token.name },
		flavor: chatMessage,
		author: game.user
	});
}

/**
 * Helper function to set the target for spells and attacks.
 * @param {JSON} t target information for the attack or spell.
 * @param {*} playerId attacker ID string from JSON.
 * @param {string} spellType Either "recovery" or "attack" to help determin what buttons to be used.
 * @param {int} rollTotal The total from the dice roll to make the attack.
 * @param {int} spellEffectiveness the DC of the spell being cast.
 * @returns A message to be attached to the chatMessage object.
 */
const setTarget = (t, playerId, spellType, rollTotal, spellEffectiveness) => {
	let message = `<div class="target grid grid-8col">
		<img class="targetImg" src="${t.document.texture.src}">
		<h3 class="targetName grid-span-6">${t.document.name}</h3>`;
	message += spellType === 'recovery' ?
		`<button type="button" class="applyHealing" data-targetid="${t.document.actorId}" data-rolltotal="${rollTotal}" data-playerid="${playerId}"title="${game.i18n.localize('gs.dialog.applyHealing')}"><i class="fa-solid fa-heart-pulse"></i></button>`
		:
		`<button type="button" class="monsterSpellResist gm-view" data-spelldc="${spellEffectiveness}" data-monsterid="${t.document.actorId}" data-rolltotal="${rollTotal}" data-playerid="${playerId}" title="${game.i18n.localize('gs.actor.monster.supportEffect.spellResist')}"><i class="fa-solid fa-shield-virus"></i></button>`;
	message += `</div>`;
	return message;
};

Hooks.on('renderChatMessage', (app, html, data) => {

	// Helper function to look for critical rolls
	function checkCritStatus(roll, skill = null) {
		let diceResults = roll.terms[0].results.map(r => r.result),
			critSuccess = 12, critFail = 2, results = [], diceResultTotal = diceResults[0] + diceResults[1];

		if (skill?.name === 'Alert') {
			const critValues = {
				1: { critSuccess: 11, critFail: 5 },
				2: { critSuccess: 11, critFail: 4 },
				3: { critSuccess: 10, critFail: 4 },
				4: { critSuccess: 10, critFail: 3 },
				5: { critSuccess: 9, critFail: 3 },
			};
			const { critSuccess: critSuccessValue, critFail: critFailValue } = critValues[skill.system.value] || {};
			if (critSuccessValue !== undefined && critFailValue !== undefined) {
				critSuccess = critSuccessValue;
				critFail = critFailValue;
			}
		} else if (skill?.name === 'Shieldsman') {
			const critValues = {
				1: { critSuccess: 11 },
				2: { critSuccess: 11 },
				3: { critSuccess: 10 },
				4: { critSuccess: 10 },
				5: { critSuccess: 9 },
			};
			const { critSuccess: critSuccessValue } = critValues[skill.system.value] || {};
			if (critSuccessValue !== undefined) {
				critSuccess = critSuccessValue;
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


	// Helper to find gear
	function findItems(player, type) {
		return player.items.find(i => i.type === type);
	}

	// Helper function to find equipped armor or shields
	function getEquipedArmor(defenseItems) {
		// Find the first equipped armor/shield or default to a fake JSON object
		return (
			defenseItems.find(i => i.system.equip) ||
			{ system: { dodge: 0 } }
		);
	}

	html.find(".actorDamageRoll").click(async event => {
		event.preventDefault();
		const button = event.currentTarget;
		const weaponId = button.dataset.id;
		const playerId = button.dataset.playerid;
		const extraDamage = button.dataset.extradmg;
		const player = game.actors.get(playerId);
		const weapon = player.items.find(i => i._id === weaponId);
		const targets = Array.from(game.user.targets);
		const activeTarget = targets[0].document.actor.getActiveTokens()[0];
		const armorScore = targets[0].document.actor.system.defenses.minion.armor;
		const curvedShotFlag = player.getFlag('gs', 'Curved Shot');

		let chatMessage = `<div class="chat messageHeader grid grid-7col">
			<img src='${player.prototypeToken.texture.src}'><h2 class="actorName grid-span-6">${weapon.name}: ${game.i18n.localize('gs.actor.character.damage')}</h2>
		</div>`;

		// Setting up roll with weapon damage
		let damageString = weapon.system.power;
		if (extraDamage !== "0") {
			damageString += `+ ${extraDamage}`;
			chatMessage += addToFlavorMessage('diceInfo', game.i18n.localize('gs.dialog.bonusDmg'), extraDamage);
		}

		// Adding reduce dmg from Curved Shot if available
		if (curvedShotFlag) {
			damageString += `- ${curvedShotFlag.reducedPower}`;
			chatMessage += addToFlavorMessage('skillScore', game.i18n.localize('gs.dialog.curvedShotLabel'), `-${curvedShotFlag.reducedPower}`);
			player.unsetFlag('gs', 'Curved Shot');
		}

		const roll = new Roll(damageString);
		await roll.evaluate();

		// Setting up chat window details
		chatMessage += `<h2 class="chat targetsLabel">${game.i18n.localize('gs.dialog.mowDown.targets')}</h2>
		<div class="chat target grid grid-8col">
			<img class="targetImg" src="${activeTarget.document.texture.src}">
			<h3 class="targetName grid-span-4">${activeTarget.document.name}</h3>
			<div class="diceInfo specialRollChatMessage grid-span-3">${game.i18n.localize('gs.gear.armor.sco')}: ${armorScore}</div>
		</div>
		<div class="chat gmDmgButtons grid grid-4col gm-view">
			<div class="fs10">${game.i18n.localize('gs.dialog.dmgMod')}</div><input class="dmgModInput type="text">
			<div class="fs10">${game.i18n.localize('gs.dialog.applyDmg')}</div><button class="applyDmgButton" data-armor="${armorScore}" data-target="${activeTarget.document.actor._id}" data-dmg="${roll._total}" type="button"><i class="fa-solid fa-arrows-to-circle"></i></button>
		</div>`;

		// Sending roll to chat window
		sendRollToWindow(roll, chatMessage, player);
	});

	// This will check between the dodge or block buttons, minion or boss, and send or roll to chat appropriately
	html.find(".monsterDefRoll").click(async event => {
		event.preventDefault();
		const monster = game.actors.get(event.currentTarget.dataset.monsterid),
			defType = event.currentTarget.dataset.type,
			activeToken = monster.getActiveTokens()[0],
			playerId = event.currentTarget.dataset.playerid,
			player = game.actors.get(playerId),
			curvedShotFlag = player.getFlag('gs', 'Curved Shot');

		let valueName = game.i18n.localize(`gs.dialog.${defType}.value`),
			rollLabel = game.i18n.localize(`gs.dialog.${defType}.roll`),
			rollResult = game.i18n.localize(`gs.dialog.${defType}.total`),
			critResults;

		// The monster's dodge or block
		let value = event.currentTarget.dataset.value;
		let chatMessage = `<div class="chat messageHeader grid grid-7col">
				<img src='${activeToken.document.texture.src}'><h2 class="actorName grid-span-6">${activeToken.document.name}: ${rollLabel}</h2>
			</div>
			<div class="armorDodgeScore specialRollChatMessage">${valueName}: ${value}</div>`;
		if (value.includes('d')) {
			if (curvedShotFlag) value += ` - ${curvedShotFlag.targetReduction}`;
			const roll = new Roll(value);
			await roll.evaluate();

			// Checking for curvedShot results
			if (curvedShotFlag) {
				chatMessage += addToFlavorMessage('skillScore', game.i18n.localize('gs.dialog.curvedShotLabel'), `-${curvedShotFlag.targetReduction}`);
				chatMessage += addToFlavorMessage('armorDodgeScore', rollResult, roll._total);
			}

			// Checking crit results
			critResults = checkCritStatus(roll);
			chatMessage += critResults[1];

			// Sending roll to chat window
			sendRollToWindow(roll, chatMessage, monster);
		} else {
			if (curvedShotFlag) {
				chatMessage += addToFlavorMessage('skillScore', game.i18n.localize('gs.dialog.curvedShotLabel'), `-${curvedShotFlag.targetReduction}`);
				chatMessage += addToFlavorMessage('armorDodgeScore', rollResult, parseInt(value, 10) - curvedShotFlag.targetReduction);
			}
			ChatMessage.create({
				speaker: { alias: activeToken.name },
				flavor: chatMessage,
				author: game.user
			});
		}
	});

	// Applies damage to the target and sends message to chat window
	html.find(".applyDmgButton").click(async event => {
		event.preventDefault();
		const container = event.currentTarget.closest('.gmDmgButtons');
		const modifier = parseInt(container.querySelector('.dmgModInput')?.value, 10) || 0;
		const target = game.actors.get(event.currentTarget.dataset.target);
		const token = target.getActiveTokens()[0];
		const armorScore = parseInt(event.currentTarget.dataset.armor, 10) || 0;
		let dmg = parseInt(event.currentTarget.dataset.dmg, 10);
		dmg += modifier;
		let currentHP = token.document.actor.system.lifeForce.value;
		const totalDmg = Math.max(currentHP - (dmg - armorScore), 0);

		if (target.type === 'character')
			await target.update({
				'system.lifeForce.value': totalDmg
			});
		else if (target.type === 'monster') {
			const token = target.getActiveTokens()[0];
			await token.document.actor.update({
				'system.lifeForce.value': totalDmg
			});
		}

		ChatMessage.create({
			speaker: ChatMessage.getSpeaker({ actor: target }),
			flavor: `<div class="chat messageHeader grid grid-7col">
				<img src='${token.document.texture.src}'><h2 class="actorName grid-span-6">${token.document.name}</h2>
			</div>
			${addToFlavorMessage('levelScore', game.i18n.localize('gs.dialog.suffered'), Math.max(dmg - armorScore, 0))}`,
			author: game.user
		});
	});

	// Rolls Spell Power/Recovery Dice
	html.find(".actorSpellDmg").click(async event => {
		event.preventDefault();
		const targets = Array.from(game.user.targets);
		console.log('... checking targets', targets);

		// Check if targets selected, else return early.
		if (targets.length === 0) {
			ui.notifications.warn("No targets selected; select targets and roll damage again.");
			return;
		}

		const button = event.currentTarget;
		const playerId = button.dataset.playerid;
		const player = game.actors.get(playerId);
		const spellId = button.dataset.spell;
		const spellKey = button.dataset.keytype;
		let spellUsed = player.items.find(i => i._id === spellId);
		// Added to monster spell usage.
		if (spellUsed === undefined)
			spellUsed = await fromUuid(spellId);
		const spellSchool = spellUsed.system.schoolChoice;
		const spellEffectiveness = button.dataset.spelldc;
		const playerClassLvls = player.system.levels?.classes || 0;
		const diceToRoll = button.dataset.rolldice;
		const numTargets = button.dataset.targets;
		let levelBonus = 0, classNameFlag = '';

		// Setting spellKey localization
		let dmgRecoverLocalization = game.i18n.localize(`gs.dialog.spells.${spellKey === 'recovery' ? 'recoveryAmt' : 'spellDmg'}`);

		// Setting chat header
		let chatMessage = `<div class="chat messageHeader grid grid-7col">
			<img src='${player.prototypeToken.texture.src}'><h2 class="actorName grid-span-6">${spellUsed.name}: ${dmgRecoverLocalization}</h2>
		</div>`;

		// Parse dice into an array, "Level" should be the final position, if present
		const diceArray = diceToRoll.split(" + ");

		// Check for "Level" and update bonus if present
		const spellSchools = {
			"Miracle": "priest",
			"Ancestral Dragon": "dragon",
			"Spirit Arts": "shaman",
			"Words of True Power": 'sorcerer',
			"Necromancy": "necro"
		};

		// Updated to properly look at the last array for 'Level' if a character and remove it as required
		if (diceArray.at(-1) === 'Level') {
			diceArray.pop();
			if (spellSchools[spellSchool]) {
				levelBonus = playerClassLvls[spellSchools[spellSchool]];
				classNameFlag = game.i18n.localize(`gs.actor.character.${spellSchools[spellSchool]}`);
			}
		}

		// Reconstruct Dice Roll without '+ Level'
		let diceString = '';
		for (let x = 0; x < diceArray.length; x++) {
			if (x === 0) {
				diceString += diceArray[x];
				chatMessage += addToFlavorMessage('diceInfo', game.i18n.localize('gs.dialog.dice'), diceArray[x]);
			} else {
				diceString += ' + ' + diceArray[x];
				chatMessage += addToFlavorMessage('gearModifier', game.i18n.localize('gs.dialog.bonus'), diceArray[x]);
			}
		}

		// Add final level bonus to string
		if (levelBonus) {
			diceString += ' + ' + levelBonus;
			chatMessage += addToFlavorMessage('levelScore', classNameFlag, levelBonus);
		}

		// Rolling Dice
		const roll = new Roll(diceString);
		await roll.evaluate();

		// Setting End portion with targets
		if (targets.length > 0)
			chatMessage += `<h2 class="targetsLabel">${game.i18n.localize('gs.dialog.mowDown.targets')}</h2>`;

		// Getting roll total
		let rollTotal = roll.total;

		// Checking number of targets to add to chat window correctly
		console.log('... num of targets', numTargets);
		if (numTargets.toLowerCase() === 'all')
			targets.forEach(t => chatMessage += setTarget(t, playerId, spellKey, rollTotal, spellEffectiveness));
		else if (numTargets === '1' || numTargets === '1 target')
			chatMessage += setTarget(targets[0], playerId, spellKey, rollTotal, spellEffectiveness);

		// Sending results to chatwindow
		sendRollToWindow(roll, chatMessage, player);
	});

	html.find(".monsterSpellResist").click(async event => {
		event.preventDefault();
		const button = event.currentTarget;
		const monsterId = button.dataset.monsterid;
		const monster = game.actors.get(monsterId);
		const token = monster.getActiveTokens()[0];
		const playerId = button.dataset.playerid;
		let spellDmgRollTotal = button.dataset.rolltotal;
		const spellEffectiveness = button.dataset.spelldc;
		const isBoss = monster.system.isBoss;
		let spellResist = null;
		let chatMessage = `<div class="chat messageHeader grid grid-7col">
			<img src='${token.document.texture.src}'><h2 class="actorName grid-span-6">${token.document.name}: ${game.i18n.localize('gs.actor.monster.supportEffect.spellResist')}</h2>
		</div>`;

		// Helper function to add damage button to window
		function addApplyDmgButton(target, dmgAmount) {
			return `<div class="gm-view grid grid-4col monster-sr-container">
				<p class="grid-span-3 monster-sr-text">${game.i18n.localize('gs.dialog.applyDmg')}</p>
				<button class="applyDmgButton gmDmgButtons" type="button" data-target="${monsterId}" data-dmg="${dmgAmount}" title="${game.i18n.localize('gs.dialog.applyDmg')}"><i class="fa-solid fa-arrows-to-circle"></i></button>
			</div>`;
		}

		// Reduce spell damage if resist past helper function
		function reduceSpellDmg(spellDmgRollTotal) {
			spellDmgRollTotal = Math.round(spellDmgRollTotal / 2);
			spellDmgRollTotal -= monster.system.defenses.minion.armor;
			return spellDmgRollTotal;
		}

		// Splitting resistance between boss and minion
		if (isBoss) {
			spellResist = monster.system.bossSR;
			const diceInfo = spellResist.includes("+") ? spellResist.split("+") : [spellResist, 0];

			// Setting up roll mechanics
			const roll = new Roll(spellResist);
			await roll.evaluate();
			const rollTotal = roll.total;

			// Adding dice to window info
			chatMessage += addToFlavorMessage('diceInfo', game.i18n.localize('gs.dialog.dice'), diceInfo[0]);

			// Adding dice modifier if any
			if (diceInfo[1]) chatMessage += addToFlavorMessage('gearModifier', game.i18n.localize('gs.dialog.bonus'), diceInfo[1]);

			// Checking for crits
			const critCheck = checkCritStatus(roll);
			if (critCheck[0] === 'success') {
				chatMessage += critCheck[1];
			} else if (critCheck[0] === 'fail') {
				chatMessage += critCheck[1];
				chatMessage += addApplyDmgButton(monsterId, spellDmgRollTotal);
			} else if (critCheck[0] === 'normal') {
				// TODO: Check if prompt random modifier is needed here

				// Adding applyDamage button
				if (rollTotal >= spellEffectiveness) {
					console.log('... spell resisted');
					spellDmgRollTotal = reduceSpellDmg(spellDmgRollTotal);
					chatMessage += addToFlavorMessage('spellCastSuccess', game.i18n.localize('gs.actor.monster.supportEffect.spellResist'), game.i18n.localize('gs.dialog.crits.succ'));
				} else {
					//console.log('... spell not resisted');
					chatMessage += addToFlavorMessage('spellCastFailure', game.i18n.localize('gs.actor.monster.supportEffect.spellResist'), game.i18n.localize('gs.dialog.crits.fail'));
				}
				chatMessage += addApplyDmgButton(monsterId, spellDmgRollTotal);
			}
			sendRollToWindow(roll, chatMessage, monster);
		} else {
			spellResist = monster.system.spellRes;
			chatMessage += addToFlavorMessage('diceInfo', game.i18n.localize('gs.actor.character.total'), spellResist);
			if (spellResist >= spellEffectiveness) {
				spellDmgRollTotal = reduceSpellDmg(spellDmgRollTotal);
				chatMessage += addToFlavorMessage('spellCastSuccess', game.i18n.localize('gs.actor.monster.supportEffect.spellResist'), game.i18n.localize('gs.dialog.crits.succ'));
			} else {
				chatMessage += addToFlavorMessage('spellCastFailure', game.i18n.localize('gs.actor.monster.supportEffect.spellResist'), game.i18n.localize('gs.dialog.crits.fail'));
			}
			chatMessage += addApplyDmgButton(monsterId, spellDmgRollTotal);
			ChatMessage.create({
				speaker: { actor: monster },
				flavor: chatMessage,
				author: game.user
			});
		}
	});

	html.find(".playerDodgeRoll").click(async event => {
		event.preventDefault();
		// Setting const variables
		const playerId = event.currentTarget.dataset.playerid,
			player = game.actors.get(playerId),
			rollLabel = game.i18n.localize(`gs.dialog.dodge.roll`),
			equipedArmor = getEquipedArmor(findItems(player, 'armor')),
			defenseBonus = equipedArmor.system.dodge,
			martialArtsSkill = player.items.find(i => i.name === 'Martial Arts') || 0,
			parrySkill = player.items.find(i => i.name === 'Parry') || 0,
			alertSkill = player.items.find(i => i.name === 'Alert') || 0,
			{ monk, scout, fighter } = player.system.levels.classes;

		// Setting variable variables
		let dodgeString = '2d6',
			chatMessage = `<div class="chat messageHeader grid grid-7col">
				<img src='${player.prototypeToken.texture.src}'><h2 class="actorName grid-span-6">${rollLabel}: ${defenseItem.name}</h2>
			</div>`,
			parrySkillBonus = 0,
			critResults;

		// Adding standard dice to roll
		chatMessage += addToFlavorMessage('diceInfo', game.i18n.localize(`gs.dialog.dice`), `2d6`);

		// Adding ability modifier bonus
		const techRef = player.system.abilities.calc.tr;
		chatMessage += addToFlavorMessage('abilScore', game.i18n.localize('gs.actor.character.tecRef'), techRef);
		dodgeString += `+ ${techRef}`;

		// Adding dodge score bonus from level if present
		if (monk || scout || fighter) {
			let highestClass = '',
				highestBonus = Math.max(monk, scout, fighter);
			if (monk >= scout && monk >= fighter)
				highestClass = game.i18n.localize('gs.actor.character.monk');
			else if (scout >= fighter)
				highestClass = game.i18n.localize('gs.actor.character.scou');
			else
				highestClass = game.i18n.localize('gs.actor.character.figh');
			chatMessage += addToFlavorMessage('levelScore', highestClass, highestBonus);
			dodgeString += `+ ${highestBonus}`;
		}
		// Adding armor dodge value
		chatMessage += addToFlavorMessage('armorDodgeScore', defenseItem.name, defenseBonus);

		// Adding armor dodge bonus is positive or negative, 0 is removed from roll string
		if (defenseBonus > 0) {
			dodgeString += defenseBonus > 0 ? `+ ${defenseBonus}` : `- ${defenseBonus * -1}`;
		}

		// Checking for Martial Arts value
		if (martialArtsSkill) {
			const skillBonus = martialArtsSkill.system.value;
			chatMessage += addToFlavorMessage('skillScore', game.i18n.localize(`gs.dialog.martialArts`), skillBonus);
			dodgeString += `+ ${skillBonus}`;
		}

		// Checking for highest parry value
		if (parrySkill) {
			const weapons = player.items.filter(i => i.type === 'weapon') || 0,
				shield = getEquipedArmor(findItems(player, 'shield')) || 0;

			// Helper function to get the parry value, or 0 if none exists
			const getParryValue = (item) => item?.system?.effect?.parry || 0;

			// Get the highest parry value from weapons
			const weaponBonus = Math.max(0, ...weapons.map(getParryValue));

			// Get parry value for the shield
			const shieldBonus = getParryValue(shield);

			// Calculate total parry bonus based on parry skill level
			parrySkillBonus = (parrySkill.system.value >= 4) ? weaponBonus + shieldBonus : Math.max(weaponBonus, shieldBonus);
			parrySkillBonus += (parrySkill.system.value >= 2) ? parrySkillBonus-- : 0;

			// Add message and dodge string based on parry skill bonus
			chatMessage += addToFlavorMessage('skillScore', game.i18n.localize(`gs.gear.weapons.effects.parry`), parrySkillBonus);
			if (parrySkillBonus !== 0) {
				dodgeString += parrySkillBonus > 0 ? `+ ${parrySkillBonus}` : `- ${Math.abs(parrySkillBonus)}`;
			}
		}

		const roll = new Roll(dodgeString);
		await roll.evaluate();

		// Adding Alert skill info if present
		if (alertSkill) {
			let critSuccess = 12, critFail = 2;
			const critValues = {
				1: { critSuccess: 11, critFail: 5 },
				2: { critSuccess: 11, critFail: 4 },
				3: { critSuccess: 10, critFail: 4 },
				4: { critSuccess: 10, critFail: 3 },
				5: { critSuccess: 9, critFail: 3 },
			};
			const { critSuccess: critSuccessValue, critFail: critFailValue } = critValues[alertSkill.system.value] || {};
			if (critSuccessValue !== undefined && critFailValue !== undefined) {
				critSuccess = critSuccessValue;
				critFail = critFailValue;
			}
			chatMessage += addToFlavorMessage('skillScore', alertSkill.name, `${game.i18n.localize('gs.dialog.crits.succ').slice(0, 7)}: ${critSuccess}+, ${game.i18n.localize('gs.dialog.crits.fail').slice(0, 4)}: ${critFail}-`);
		}

		// Checking Crit results and adding to chatMessage
		critResults = checkCritStatus(roll, alertSkill);
		chatMessage += critResults[1];

		// Sending roll to chat window
		sendRollToWindow(roll, chatMessage, player);
	});

	html.find(".playerShieldBlock").click(async event => {
		event.preventDefault();
		// Setting const variables
		const playerId = event.currentTarget.dataset.playerid,
			player = game.actors.get(playerId),
			rollLabel = game.i18n.localize(`gs.dialog.block.roll`),
			defenseItem = findItems(player, 'shield'),
			defenseBonus = defenseItem.system.mod,
			shieldsSkill = player.items.find(i => i.name === 'Shields') || 0,
			shieldsManSkill = player.items.find(i => i.name === 'Shieldsman') || 0,
			{ scout, fighter } = player.system.levels.classes;

		// Setting variable variables
		let blockString = '2d6',
			chatMessage = `<div class="chat messageHeader grid grid-7col">
				<img src='${player.prototypeToken.texture.src}'><h2 class="actorName grid-span-6">${rollLabel}: ${defenseItem.name}</h2>
			</div>`,
			critResults,
			totalBlockBonus = 0;

		// Adding base dice to chat
		chatMessage += addToFlavorMessage('diceInfo', game.i18n.localize(`gs.dialog.dice`), `2d6`);

		// Adding ability modifier bonus
		const techRef = player.system.abilities.calc.tr;
		chatMessage += addToFlavorMessage('abilScore', game.i18n.localize('gs.actor.character.tecRef'), techRef);
		blockString += `+ ${techRef}`;

		// Adding block class if present
		if (scout || fighter) {
			let highestClass = '',
				highestBonus = Math.max(scout, fighter);
			if (scout >= fighter)
				highestClass = game.i18n.localize('gs.actor.character.scou');
			else
				highestClass = game.i18n.localize('gs.actor.character.figh');
			chatMessage += addToFlavorMessage('levelScore', highestClass, highestBonus);
			blockString += `+ ${highestBonus}`;
		}

		// Adding shield mod
		chatMessage += addToFlavorMessage('armorDodgeScore', defenseItem.name, defenseBonus);
		if (defenseBonus > 0) {
			blockString += defenseBonus > 0 ? `+ ${defenseBonus}` : `- ${defenseBonus * -1}`;
		}

		// Adding Shields skill is present
		if (shieldsSkill) {
			let skillBonus = shieldsSkill.system.value;
			chatMessage += addToFlavorMessage('skillScore', shieldsSkill.name, skillBonus);
			blockString += `+ ${skillBonus}`;
			totalBlockBonus += skillBonus;
		}

		const roll = new Roll(blockString);
		await roll.evaluate();

		// Adding Shieldsman skill is present
		if (shieldsManSkill) {
			let critSuccess = 12, blockRating = 0, blockBonus = 0;
			const critValues = {
				1: { critSuccess: 11, blockRating: 13, blockBonus: 0 },
				2: { critSuccess: 11, blockRating: 9, blockBonus: 1 },
				3: { critSuccess: 10, blockRating: 8, blockBonus: 2 },
				4: { critSuccess: 10, blockRating: 7, blockBonus: 2 },
				5: { critSuccess: 9, blockRating: 6, blockBonus: 3 },
			};
			const { critSuccess: critSuccessValue, blockRating: blockRatingValue, blockBonus: blockBonusValue } = critValues[shieldsManSkill.system.value] || {};
			if (critSuccessValue !== undefined && blockBonusValue !== undefined) {
				critSuccess = critSuccessValue;
				blockRating = blockRatingValue;
				blockBonus = blockBonusValue;
			}
			chatMessage += addToFlavorMessage('skillScore', shieldsManSkill.name, `${game.i18n.localize('gs.dialog.crits.succ').slice(0, 7)}: ${critSuccess}, ${game.i18n.localize('gs.dialog.dice')} ${blockRating}+: +${blockBonus}`);

			// Checking roll for bonus block amount
			console.log('... check roll log', roll, blockRating);
			if (roll.terms[0].results[0].result + roll.terms[0].results[1].result > blockRating)
				totalBlockBonus += blockBonus;
		}

		// Checking Crit results and adding to chatMessage
		critResults = checkCritStatus(roll, shieldsManSkill);
		if (totalBlockBonus)
			chatMessage += addToFlavorMessage('miscScore', game.i18n.localize('gs.dialog.block.totalBlock'), totalBlockBonus);
		chatMessage += critResults[1];

		// Sending roll to chat window
		sendRollToWindow(roll, chatMessage, player);
	});

	html.find(".monsterDamageRoll").click(async event => {
		event.preventDefault();
		const button = event.currentTarget,
			monster = game.actors.get(button.dataset.monsterid),
			weaponPower = button.dataset.weaponpower,
			weaponName = button.dataset.weaponname,
			playerId = button.dataset.playerid,
			player = game.actors.get(playerId),
			targets = Array.from(game.user.targets);
		if (!targets.length) {
			ui.notifications.warn(game.i18n.localize('gs.dialog.firstTargetMonster'));
			return;
		}
		const activeTarget = targets[0].document.actor.getActiveTokens()[0],
			armor = getEquipedArmor(findItems(player, 'armor')),
			shield = getEquipedArmor(findItems(player, 'shield')) || 0;


		let armorScore = armor.system.score;
		if (shield)
			armorScore += shield.system.score;
		//console.log('... checking armor', weaponPower);

		let chatMessage = `<div class="chat messageHeader grid grid-7col">
			<img src='${monster.prototypeToken.texture.src}'><h2 class="actorName grid-span-6">${weaponName}: ${game.i18n.localize('gs.actor.character.damage')}</h2>
		</div>`;

		// Setting up roll with weapon damage
		let damageString = weaponPower;
		let powerSplit = weaponPower.includes('+') ? weaponPower.split('+') : [weaponPower, 0];
		chatMessage += addToFlavorMessage('diceInfo', game.i18n.localize(`gs.dialog.dice`), powerSplit[0]);
		if (powerSplit[1] > 0 || powerSplit[1] < 0)
			chatMessage += addToFlavorMessage('gearModifier', game.i18n.localize('gs.dialog.bonus'), powerSplit[1]);

		console.log('... check dmgstring', weaponPower);

		const roll = new Roll(damageString);
		await roll.evaluate();

		// Setting up chat window details
		chatMessage += `<h2 class="chat targetsLabel">${game.i18n.localize('gs.dialog.mowDown.targets')}</h2>
			<div class="chat target grid grid-8col">
				<img class="targetImg" src="${activeTarget.document.texture.src}">
				<h3 class="targetName grid-span-4">${activeTarget.document.name}</h3>
				<div class="diceInfo specialRollChatMessage grid-span-3">${game.i18n.localize('gs.gear.armor.sco')}: ${armorScore}</div>
			</div>
			<div class="chat gmDmgButtons grid grid-4col gm-view">
				<div class="fs10">${game.i18n.localize('gs.dialog.dmgMod')}</div><input class="dmgModInput type="text">
				<div class="fs10">${game.i18n.localize('gs.dialog.applyDmg')}</div><button class="applyDmgButton" data-armor="${armorScore}" data-target="${activeTarget.document.actor._id}" data-dmg="${roll._total}" type="button"><i class="fa-solid fa-arrows-to-circle"></i></button>
			</div>`;

		// Sending roll to chat window
		sendRollToWindow(roll, chatMessage, monster);
	});
});

// Defining Hotbar Drops here ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Hooks.on('hotbarDrop', (bar, data, slot) => {
	weaponMacroHotbarDrop(data, slot);
	return false;
});

async function weaponMacroHotbarDrop(data, slot) {
	if (data.type === "Item") {
		const item = await fromUuid(data.uuid);
		const actor = item.parent;
		console.log('... checking data drop', item, actor);

		if (actor && item) {
			let command = `const actor = game.actors.get("${actor._id}");
				// Mock event object
				const mockEvent = {
					preventDefault: () => {},
					currentTarget: {
						dataset: {
							itemid: "${item._id}"
						}
					}
				};
				`;
			if (item.type === 'weapon')
				command += `actor.sheet._playerAttack(mockEvent);`;
			else if (item.type === 'armor')
				command += `actor.sheet._playerDodge(mockEvent);`;
			else if (item.type === 'shield')
				command += `actor.sheet._playerBlock(mockEvent);`;
			else if (item.type === 'spell')
				command += `actor.sheet._playerSpellCast(mockEvent);`;
			else
				console.log(`GS Hotbar Drop Error | The current item you have dropped into the hot bar is not configured yet.`);

			let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));

			if (!macro) {
				macro = await Macro.create({
					name: `Roll ${item.name}`,
					type: "script",
					img: item.img,
					command: command,
					flags: { 'gs.itemMacro': true }
				});
			}

			game.user.assignHotbarMacro(macro, slot);
			return false
		}
	}
}

/**
	 * Sets up a simple return statement to add the correct items and values to the localized message for debugging and player knowledge
	 * @param {string} cssClass Class string to color the message, diceInfo, gearModifier, abilScore, levelScore, skillScore, skillEffectiveScore, rollScore, miscScore, armorDodgeScore
	 * @param {string} labelName What is modifying the the dice roll
	 * @param {*} labelMessage How much is being modified, usually an int value, can also be a string if needed.
	 * @returns A string to be added to the localized message
	 */
function addToFlavorMessage(cssClass, labelName, labelMessage) {
	return `<div class="${cssClass} specialRollChatMessage">${labelName}: ${labelMessage}</div>`;
}

// Using a hook to dynamically adjust content in chat window for GM only viewing
Hooks.on('renderChatMessage', (message, html, data) => {
	if (game.user.isGM) {
		html.find('.gm-view').show();
	} else {
		html.find('.gm-view').hide();
	}
});

document.addEventListener('dragstart', function (event) {
	// Assuming the item is being dragged from a valid source like a character sheet
	const draggedElement = event.target.closest('.item-list'); // Adjust the selector as needed
	if (!draggedElement) return;

	// Get the item's UUID or ID
	const itemId = draggedElement.dataset.itemid; // Ensure the item element has the correct data attribute
	const actorId = draggedElement.dataset.actorid;

	// Find the item and actor (you may need to adjust this based on your specific setup)
	const actor = game.actors.get(actorId);
	const item = actor ? actor.items.get(itemId) : null;

	//console.log("... check items", event, itemId, actorId, actor, item);

	if (item) {
		// Set the drag data
		event.dataTransfer.setData("text/plain", JSON.stringify({
			type: "Item",
			uuid: item.uuid,
			img: item.img
		}));

		//console.log("Drag Start Data:", event.dataTransfer);
	} else {
		console.error("Item not found or invalid drag source.");
	}
});

// Updating token Dead effect if HP <= 0 || HP > 0
Hooks.on('preUpdateActor', async (actor, updateData) => {
	const newHP = foundry.utils.getProperty(updateData, "system.lifeForce.value");
	let token = actor.getActiveTokens()[0];
	if (!token) return;

	// Setting the "dead" id to a const for use later on.
	const deadEffect = "dead";

	if (newHP === 0) { // If HP reaches zero
		// If the token is already marked as "Dead", do nothing
		if (actor.statuses.has(deadEffect)) return;

		// Remove all active effects on the token
		for (let effect of actor.effects) {
			await effect.delete();
		}

		// Apply the "Dead" status effect and set it to display the large icon
		await actor.toggleStatusEffect(deadEffect, { overlay: true });
	} else if (newHP > 0) { // If HP goes above 0
		if (actor.statuses.has(deadEffect)) {
			await actor.toggleStatusEffect(deadEffect, { overlay: true });
		}
	}
});

// Define Handlebars Helpers here ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Logs an item from the HTML/HBS pages to see specific information
Handlebars.registerHelper('log', (item) => console.log("Helper Logging >>> ", item));

// Returns added values together
Handlebars.registerHelper('add', (value, increment) => {
	return value + increment;
});

// Getting quantity at the index
Handlebars.registerHelper('getQuantAtIndex', (array, index, field) => {
	const value = array[index].system[field];
	return value;
});

// Strips leading and ending tags from editor saved text
Handlebars.registerHelper('stripTags', (text) => {
	if (typeof text === 'string') {
		return text.replace(/^<p>/, '').replace(/<\/p>$/, '');
	}
	return text;
});

// Returns the description of the Skill rank for diplaying in PC Skills tab.
Handlebars.registerHelper('getSkillRangeText', (object, value, skillType) => {
	const levels = ['beginner', 'intermediate', 'expert', 'master', 'legend'];

	// Determine the maximum value based on skillType
	const maxLevel = skillType === 'adv' ? 5 : (skillType === 'gen' ? 3 : 0);

	// Validate the value
	if (value < 1 || value > maxLevel) {
		return `Rank Value must be a number between 1 and ${maxLevel}.`;
	}

	// Get the corresponding skill level text
	let skillLevel = object.system[levels[value - 1]];

	// Remove wrapping paragraph/span tags
	skillLevel = skillLevel.replace(/^<p>/, '').replace(/<\/p>$/, '');
	skillLevel = skillLevel.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '');

	return skillLevel;
});

// Returns a string of text stripped of any HTML formating
Handlebars.registerHelper('stripFormating', (object) => {
	object = object.replace(/^<p>/, '').replace(/<\/p>$/, '');
	object = object.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '');

	return object;
});

// Logical OR check
Handlebars.registerHelper('or', (value1, value2) => {
	return (value1 || value2) ? true : false;
})

// Reviews object array for specific item type
Handlebars.registerHelper('checkInArray', (object, value) => {
	let inArray = false;
	object.find(item => item.type === value) ? inArray = true : undefined;
	return inArray;
});
