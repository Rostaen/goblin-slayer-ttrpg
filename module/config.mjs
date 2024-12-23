export const gs = {};

gs.gear = {
	common: {
		nam: "gs.gear.common.nam",
		val: "gs.gear.common.val",
		eff: "gs.gear.common.eff",
		ste: "gs.gear.common.ste",
		typ: "gs.gear.common.typ",
		des: "gs.gear.common.des"
	},
	weapons: {
		use: "gs.gear.weapons.use",
		att: "gs.gear.weapons.att",
		pow: "gs.gear.weapons.pow",
		hit: "gs.gear.weapons.hit",
		ran: "gs.gear.weapons.ran",
		range: {
			"5m": "5",
			"10m": "10",
			"20m": "20",
			"30m": "30",
			"60m": "60",
			"120m": "120"
		}
	},
	armor: {
		sco: "gs.gear.armor.sco",
		dod: "gs.gear.armor.dod",
		mov: "gs.gear.armor.mov",
		hea: "gs.gear.armor.hea",
		stealth: {
			Good: 0,
			Normal: -4,
			Poor: -8
		}
	},
	shield: {
		mod: "gs.gear.shield.mod",
		sco: "gs.gear.shield.sco"
	},
	item: {
		nam: "gs.gear.items.nam",
		des: "gs.gear.items.des"
	},
	spell: {
		sys: "gs.gear.spells.sys",
		efs: "gs.gear.spells.efs",
		pen: "gs.gear.spells.pen",
		rad: "gs.gear.spells.rad",
		dur: "gs.gear.spells.dur",
		siz: "gs.gear.spells.siz",
		phy: "gs.gear.spells.phy",
		sco: "gs.gear.spells.sco",
		exr: "gs.gear.spells.exr",
		mds: "gs.gear.spells.mds",
		mvs: "gs.gear.spells.mvs",
		qua: "gs.gear.spells.qua",
		sum: "gs.gear.spells.sum",
		dif: "gs.gear.spells.dif",
		cha: "gs.gear.spells.cha",
		cat: "gs.gear.spells.cat",
		schools: {
			wor: "gs.gear.spells.wor",
			mir: "gs.gear.spells.mir",
			anc: "gs.gear.spells.anc",
			spi: "gs.gear.spells.spi",
			nec: "gs.gear.spells.nec"
		},
		styles: {
			att: "gs.gear.spells.att",
			imb: "gs.gear.spells.imb",
			cre: "gs.gear.spells.cre",
			con: "gs.gear.spells.con",
			hea: "gs.gear.spells.hea",
			gen: "gs.gear.spells.gen"
		},
		elements: {
			fir: "gs.gear.spells.fir",
			wat: "gs.gear.spells.wat",
			ear: "gs.gear.spells.ear",
			win: "gs.gear.spells.win",
			lig: "gs.gear.spells.lig",
			dar: "gs.gear.spells.dar",
			lif: "gs.gear.spells.lif",
			min: "gs.gear.spells.min",
			mat: "gs.gear.spells.mat",
			tim: "gs.gear.spells.tim",
			spa: "gs.gear.spells.spa",
			none: "gs.gear.spells.none",
		}
	},
	skill: {
		gra: "gs.gear.skills.gra",
		pre: "gs.gear.skills.pre",
		beg: "gs.gear.skills.beg",
		int: "gs.gear.skills.int",
		exp: "gs.gear.skills.exp",
		mas: "gs.gear.skills.mas",
		leg: "gs.gear.skills.leg",
		adv: "gs.gear.skills.adv",
		gen: "gs.gear.skills.gen"
	}
}
gs.actor = {
	common: {
		life: "gs.actor.common.life",
		lFor: "gs.actor.common.lFor",
		spRe: "gs.actor.common.spRe",
		move: "gs.actor.common.move",
		modMove: "gs.actor.common.modMove",
		leve: "gs.actor.common.leve",
		max: "gs.actor.common.max",
		init: "gs.actor.common.init",
		roll: "gs.actor.common.roll",
		ed: "gs.actor.common.ed"
	},
	character: {
		rank: "gs.actor.character.rank",
		ability: "gs.actor.character.abil",
		primary: "gs.actor.character.pri",
		second: "gs.actor.character.sec",
		traits: {
			rac: "gs.actor.character.rac",
			age: "gs.actor.character.age",
			gen: "gs.actor.character.gen",
			his: "gs.actor.character.his",
			phy: "gs.actor.character.phy",
			hai: "gs.actor.character.hai",
			eye: "gs.actor.character.eye",
			oth: "gs.actor.character.oth"
		},
		scores: {
			str: "gs.actor.character.str",
			psy: "gs.actor.character.psy",
			tec: "gs.actor.character.tec",
			int: "gs.actor.character.int",
			foc: "gs.actor.character.foc",
			end: "gs.actor.character.end",
			ref: "gs.actor.character.ref"
		},
		experience: {
			exp: "gs.actor.character.exp",
			cum: "gs.actor.character.cum",
			cur: "gs.actor.character.cur",
			adv: "gs.actor.character.adv",
			lvl: "gs.actor.character.lvl",
			ads: "gs.actor.character.ads",
			com: "gs.actor.character.com"
		},
		status: "gs.actor.character.status",
		wounds: "gs.actor.character.wounds",
		spUse: "gs.actor.character.spUse",
		base: "gs.actor.character.base",
		clWd: "gs.actor.character.clWd",
		classes: {
			figh: "gs.actor.character.figh",
			monk: "gs.actor.character.monk",
			rang: "gs.actor.character.rang",
			scou: "gs.actor.character.scou",
			sorc: "gs.actor.character.sorcerer",
			prie: "gs.actor.character.priest",
			dPri: "gs.actor.character.dragon",
			sham: "gs.actor.character.shaman",
			necro: "gs.actor.character.necro",
		},
		fatW: "gs.actor.character.fatW",
		heal: "gs.actor.character.heal",
		fatigue: {
			rank: "gs.actor.character.rank",
			pena: "gs.actor.character.pena",
			ran1: "gs.actor.character.ran1",
			ran2: "gs.actor.character.ran2",
			ran3: "gs.actor.character.ran3",
			ran4: "gs.actor.character.ran4",
			ran5: "gs.actor.character.ran5",
		},
		attr: "gs.actor.character.attr",
		aTrack: "gs.actor.character.aTrack",
		skills: {
			advSW: "gs.actor.character.advSW",
			genSW: "gs.actor.character.genSW",
			mast: "gs.actor.character.mast",
			effe: "gs.actor.character.effe",
			page: "gs.actor.character.page"
		},
		scor: "gs.actor.character.scor",
		spells: {
			lear: "gs.actor.character.lear",
			syst: "gs.actor.character.syst",
		},
		combat: {
			hit: "gs.actor.character.hit",
			basic: "gs.actor.character.basic",
			dodge: "gs.actor.character.dodge",
			block: "gs.actor.character.block",
			skills: "gs.actor.character.skills",
			melee: "gs.actor.character.melee",
			throw: "gs.actor.character.throw",
			weapon: "gs.actor.character.weapon",
			armor: "gs.actor.character.armor",
			shield: "gs.actor.character.shield",
			usage: "gs.actor.character.usage",
			modi: "gs.actor.character.modi",
			total: "gs.actor.character.total",
			power: "gs.actor.character.power",
			ste: "gs.actor.character.ste",
		},
		damage: "gs.actor.character.damage",
		effective: "gs.actor.character.effective",
		table: "gs.actor.character.table",
		bonus: "gs.actor.character.bonus",
		under: "gs.actor.character.under",
		over: "gs.actor.character.over",
		none: "gs.actor.character.none",
		poss: "gs.actor.character.poss",
		advT: "gs.actor.character.advT",
		rati: "gs.actor.character.rati",
		clot: "gs.actor.character.clot",
		money: {
			money: "gs.actor.character.money",
			gold: "gs.actor.character.gold",
			silv: "gs.actor.character.silv",
			bron: "gs.actor.character.bron",
			piec: "gs.actor.character.piec"
		},
		dc: "gs.actor.character.dc"
	},
	monster: {
		type: "gs.actor.monster.type",
		types: {
			meleeC: "gs.actor.monster.types.meleeC",
			meleeT: "gs.actor.monster.types.meleeT",
			meleeN: "gs.actor.monster.types.meleeN",
			throw: "gs.actor.monster.types.throw",
			projec: "gs.actor.monster.types.projec",
		},
		minion: "gs.actor.monster.types.minion",
		boss: "gs.actor.monster.types.boss",
		ran: "gs.actor.monster.ran",
		range: {
			"5m": "5",
			"10m": "10",
			"20m": "20",
			"30m": "30",
			"60m": "60",
			"120m": "120"
		},
		mChec: "gs.actor.monster.mChec",
		chec: "gs.actor.monster.chec",
		powe: "gs.actor.monster.powe",
		init: "gs.actor.monster.init",
		inte: "gs.actor.monster.inte",
		intelligence: {
			com: "gs.actor.monster.intelligence.com",
			ins: "gs.actor.monster.intelligence.ins",
			low: "gs.actor.monster.intelligence.low",
			ave: "gs.actor.monster.intelligence.ave",
			hig: "gs.actor.monster.intelligence.hig"
		},
		mora: "gs.actor.monster.mora",
		supp: "gs.actor.monster.supp",
		spec: "gs.actor.monster.spec",
		atta: "gs.actor.monster.atta",
		attackType: {
			slash: "gs.actor.common.slash",
			bludg: "gs.actor.common.bludg",
			pierc: "gs.actor.common.pierc",
			other: "gs.actor.common.other"
		},
		defe: "gs.actor.monster.defe",
		dodg: "gs.actor.monster.dodg",
		bloc: "gs.actor.monster.bloc",
		aSco: "gs.actor.monster.aSco",
		name: "gs.actor.monster.name",
		mSR: "gs.actor.monster.mSR",
		min: "gs.actor.monster.min",
		bSR: "gs.actor.monster.bSR",
		boss: "gs.actor.monster.boss",
		description: "gs.actor.monster.description",
	},
	fate: {
		textBoxes: {
			"upResultText": "gs.actor.fate.upResultText",
			"rerollText": "gs.actor.fate.rerollText",
			"fleeText": "gs.actor.fate.retreatText",
			"hintText": "gs.actor.fate.hintText"
		}
	},
	charSheet: {
		tabs: {
			stats: "gs.charSheet.tabs.stats",
			items: "gs.charSheet.tabs.items",
			feats: "gs.charSheet.tabs.feats",
			spell: "gs.charSheet.tabs.spell",
			descr: "gs.charSheet.tabs.descr",
			effec: "gs.charSheet.tabs.effec"
		},
		ranks: {
			porc: "gs.charSheet.ranks.porc",
			obsi: "gs.charSheet.ranks.obsi",
			stee: "gs.charSheet.ranks.stee",
			sapp: "gs.charSheet.ranks.sapp",
			emer: "gs.charSheet.ranks.emer",
			ruby: "gs.charSheet.ranks.ruby",
			copp: "gs.charSheet.ranks.copp",
			silv: "gs.charSheet.ranks.silv",
			gold: "gs.charSheet.ranks.gold",
			plat: "gs.charSheet.ranks.plat"
		},
		items: {
			hitM: "gs.charSheet.items.hitM",
			rang: "gs.charSheet.items.rang",
			powe: "gs.charSheet.items.powe",
			attr: "gs.charSheet.items.attr",
			use: "gs.charSheet.items.use",
			quan: "gs.charSheet.items.quan",
			edit: "gs.charSheet.items.edit",
			dele: "gs.charSheet.items.dele",
			scores: "gs.charSheet.items.scores",
			weapons: "gs.charSheet.items.weapons",
			melee: "gs.charSheet.items.melee",
			throw: "gs.charSheet.items.throw",
			projectile: "gs.charSheet.items.projectile",
			other: "gs.charSheet.items.other",
		},
		checks: {
			acrobatics: {
				name: "gs.dialog.actorSheet.sidebar.buttons.acrobatics",
				icon: "fa-solid fa-cat"
			},
			climbF: {
				name: "gs.dialog.actorSheet.sidebar.buttons.climbF",
				icon: "fa-solid fa-arrow-up-long"
			},
			climbM: {
				name: "gs.dialog.actorSheet.sidebar.buttons.climbM",
				icon: "fa-solid fa-up-long"
			},
			escape: {
				name: "gs.dialog.actorSheet.sidebar.buttons.escape",
				icon: "fa-solid fa-user-lock"
			},
			firstAid: {
				name: "gs.dialog.actorSheet.sidebar.buttons.firstAid",
				icon: "fa-solid fa-user-nurse"
			},
			generalKnow: {
				name: "gs.dialog.actorSheet.sidebar.buttons.generalKnow",
				icon: "fa-solid fa-map"
			},
			handiwork: {
				name: "gs.dialog.actorSheet.sidebar.buttons.handiwork",
				icon: "fa-solid fa-lock-open"
			},
			initiative: {
				name: "gs.dialog.actorSheet.sidebar.buttons.initiative",
				icon: "fa-solid fa-dice"
			},
			intRes: {
				name: "gs.dialog.actorSheet.sidebar.buttons.intRes",
				icon: "fa-solid fa-book"
			},
			jump: {
				name: "gs.dialog.actorSheet.sidebar.buttons.jump",
				icon: "fa-solid fa-person-running"
			},
			longDistance: {
				name: "gs.dialog.actorSheet.sidebar.buttons.longDistance",
				icon: "fa-solid fa-person-hiking"
			},
			luck: {
				name: "gs.dialog.actorSheet.sidebar.buttons.luck",
				icon: "fa-solid fa-clover"
			},
			magicalKnow: {
				name: "gs.dialog.actorSheet.sidebar.buttons.magicalKnow",
				icon: "fa-solid fa-hand-sparkles"
			},
			monsterKnow: {
				name: "gs.dialog.actorSheet.sidebar.buttons.monsterKnow",
				icon: "fa-solid fa-ghost"
			},
			moveObs: {
				name: "gs.dialog.actorSheet.sidebar.buttons.moveObs",
				icon: "fa-solid fa-hand"
			},
			moveRes: {
				name: "gs.dialog.actorSheet.sidebar.buttons.moveRes",
				icon: "fa-solid fa-hand-fist"
			},
			observe: {
				name: "gs.dialog.actorSheet.sidebar.buttons.observation",
				icon: "fa-regular fa-eye"
			},
			provoke: {
				name: "gs.dialog.actorSheet.sidebar.buttons.provoke",
				icon: "fa-solid fa-fire"
			},
			psyRes: {
				name: "gs.dialog.actorSheet.sidebar.buttons.psyRes",
				icon: "fa-solid fa-brain"
			},
			sixthSense: {
				name: "gs.dialog.actorSheet.sidebar.buttons.sixthSense",
				icon: "fa-solid fa-eye"
			},
			stealth: {
				name: "gs.dialog.actorSheet.sidebar.buttons.stealth",
				icon: "fa-solid fa-user-ninja"
			},
			strength: {
				name: "gs.dialog.actorSheet.sidebar.buttons.strength",
				icon: "fa-solid fa-dumbbell"
			},
			strRes: {
				name: "gs.dialog.actorSheet.sidebar.buttons.strRes",
				icon: "fa-solid fa-hill-rockslide"
			},
			swim: {
				name: "gs.dialog.actorSheet.sidebar.buttons.swim",
				icon: "fa-solid fa-person-swimming"
			},
		}
	},
	raceSheet: {
		races: {
			hum: "gs.raceSheet.races.hum",
			dwa: "gs.raceSheet.races.dwa",
			elf: "gs.raceSheet.races.elf",
			liz: "gs.raceSheet.races.liz",
			rhe: "gs.raceSheet.races.rhe",
			pad: "gs.raceSheet.races.pad",
			mir: "gs.raceSheet.races.mir",
			har: "gs.raceSheet.races.har",
			dar: "gs.raceSheet.races.dar",
			dem: "gs.raceSheet.races.dem",
			vam: "gs.raceSheet.races.vam"
		},
		innate: "gs.raceSheet.innate",
		scores: {
			pri: "gs.raceSheet.scores.pri",
			fix: "gs.raceSheet.scores.fix",
			ran: "gs.raceSheet.scores.ran",
			sec: "gs.raceSheet.scores.sec",
			mov: "gs.raceSheet.scores.mov"
		}
	},
	dialog: {
		crits: {
			crit: "gs.dialog.crits.crit",
			succ: "gs.dialog.crits.succ",
			fail: "gs.dialog.crits.fail"
		}
	}
}
gs.spells = {
	ancestralDragon: {
		dragonArmor: {
			uuid: 'Compendium.gs.spells.Item.Y9GrvSynY2lDAu5i',
			range: 5,
			area: 'cylinder, 10m height, 5m radius',
			target: 'All',
			effectiveScore: [
				{ range: [20, 24], power: '5d6 + level' },
				{ range: [25, 29], power: '6d6 + level' },
				{ range: [30, 39], power: '6d6 + 5 + level' },
				{ range: [40, 500], power: '6d6 + 10 + level' }
			]
		},
		bezor: {
			uuid: 'Compendium.gs.spells.Item.wCWBenc9TjlIUBli',
			target: 'self'
		},
		camouflage: {
			uuid: 'Compendium.gs.spells.Item.18rQL3sDNlNpinhO',
			duration: '1 Hour',
			target: 'self'
		},
		charge: {
			uuid: 'Compendium.gs.spells.Item.7QDvMa3JPfv5nNCJ',
			range: '3 x Caster Movement',
			target: 'All',
			area: 'Movement Path',
			effectiveScore: [
				{ range: [10, 14], power: '2d6 + level + 1/5 Distance Moved' },
				{ range: [15, 19], power: '3d6 + level + 1/5 Distance Moved' },
				{ range: [20, 29], power: '4d6 + level + 1/5 Distance Moved' },
				{ range: [30, 39], power: '5d6 + level + 1/5 Distance Moved' },
				{ range: [40, 500], power: '6d6 + level + 1/5 Distance Moved' }
			]
		},
		communicate: {
			uuid: 'Compendium.gs.spells.Item.tWXBLZut7zUcIJ2B',
			target: 'self',
			duration: '1 Hour'
		},
		confrontation: {
			duration: '6 Rounds',
			target: 1,
			range: 60
		},
		dragonBreath: {
			fire: {
				target: 'All',
				area: 'Cone, 30m Length, 10m Base Radius',
				effectiveScore: [
					{ range: [10, 19], power: '4d6 + level' },
					{ range: [20, 29], power: '6d6 + level' },
					{ range: [30, 39], power: '8d6 + level' },
					{ range: [40, 500], power: '10d6 + level' },
				]
			},
			lightning: {
				target: 'All',
				area: 'Line, 60m',
				effectiveScore: [
					{ range: [10, 19], power: '2d6 + 2 + level' },
					{ range: [20, 29], power: '3d6 + 4 + level' },
					{ range: [30, 39], power: '5d6 + 4 + level' },
					{ range: [40, 500], power: '7d6 + 6 + level' },
				]
			},
			ice: {
				target: 'All',
				area: 'Cone, 30m Length, 10m Base Radius',
				duration: '3 Rounds',
				effectiveScore: [
					{ range: [10, 19], power: '2d6 + 2 + level' },
					{ range: [20, 29], power: '3d6 + 4 + level' },
					{ range: [30, 39], power: '5d6 + 4 + level' },
					{ range: [40, 500], power: '7d6 + 6 + level' },
				]
			},
			poison: {
				target: 'All',
				area: 'Cone, 20m Length, 20m Base Radius',
				duration: '3 Rounds',
				effectiveScore: [
					{ range: [10, 19], power: '2d6 + 2 + level', damage: '1d6' },
					{ range: [20, 29], power: '4d6 + level', damage: '1d6' },
					{ range: [30, 39], power: '5d6 + level', damage: '2d6' },
					{ range: [40, 500], power: '6d6 + level', damage: '3d6' },
				]
			}
		},
		dragonEyes: {
			target: 'self',
			duration: '10 Minutes',
			effectiveScore: [
				{ range: [10, 14], effects: 'Strengthens kinetic vision, gaining a +2 bonus to hit checks for melee attacks. Can also ignore negative effects to vision from distractions (p. 160) based on blinding or light.' },
				{ range: [15, 19], effects: 'Once per round, when Target: 1 within Range: 30m attempts to take some action, the caster can glare at them to apply a −2 penalty to whatever check is needed to execute the action (a hit check for an attack, a dodge check when attacked, a spell use check when using a spell, etc.). The target and caster must be able to see each other to do this. This effect only applies to 1 check.' },
				{ range: [20, 24], effects: 'The caster gains a +2 bonus to hit checks for ranged attacks, not just melee attacks. Additionally, as long as there are no obstacles, the caster can see well enough to discern a person’s face at a 5 kilometers.' },
				{ range: [25, 29], effects: 'Gain a +2 bonus to hit checks. Gain a +2 bonus to dodge checks and block checks as well.' },
				{ range: [30, 500], effects: 'Bonuses to checks granted by this spell are +4 instead of +2. The glaring target also suffers a −4 penalty to their check instead of −2.' }
			]
		},
		dragonScales: {
			target: 'self',
			duration: '6 Rounds',
			effectiveScore: [
				{ range: [10, 19], modifier: 3 },
				{ range: [20, 29], modifier: 4 },
				{ range: [30, 500], modifier: 5 },
			]
		},
		dragonBlood: {
			target: 1
		},
		dragonsProof: {
			target: 'self',
			effectiveScore: [
				{ range: [10, 19], duration: '3 rounds' },
				{ range: [20, 29], duration: '6 rounds' },
				{ range: [30, 500], duration: '10 minutes' },
			]
		},
		dragonsRoar: {
			target: 'All',
			effectiveScore: [
				{ range: [15, 19], effects: 'Target takes a −2 penalty on checks made as the active side and a −2 penalty to initiative.', durration: '3 rounds' },
				{ range: [20, 29], effects: 'The target will try to flee. For this effect’s duration, they will attempt to get as far away from the battlefield as possible.', durration: '6 rounds' },
				{ range: [30, 39], effects: 'The target’s penalty to checks and initiative becomes −4.', durration: '10 minutes' },
				{ range: [40, 500], effects: 'This spell is treated as a magic attack dealing 3d6 + Dragon Priest Level points of mind damage. This damage cannot be reduced by armor score. If the target passes a spell resistance check, they don’t receive any damage.', durration: '10 minutes' },
			]
		},
		dragonsWings: {
			target: 'self',
			duration: '10 Minutes'
		},
		dragontoothWarrior: {
			target: '1 Dragontooth Warrior',
			range: 1,
			duration: {
				warrior: '1 Hour',
				spino: '10 Minutes',
				bao: '6 Rounds'
			},
			effectiveScore: [
				{ range: [15, 19], effects: 'Caster can summon a dragontooth warrior (p. 601)' },
				{ range: [20, 29], effects: 'Caster can summon either a dragontooth warrior or a spino dragontooth warrior (p. 603)' },
				{ range: [30, 500], effects: 'Caster can summon either a dragontooth warrior, a spino dragontooth warrior, or a Bao Long dragontooth warrior (p. 605)' },
			]
		},
		huntingGrounds: {
			area: 100,
			target: 'All',
			duration: '12 Hours'
		},
		minorHeal: {
			target: 1,
			range: {
				distance: 30,
				touch: 5
			},
			effectiveScore: [
				{ range: [5, 9], recovery: '2d6 + Level' },
				{ range: [10, 14], recovery: '3d6 + Level' },
				{ range: [15, 19], recovery: '3d6 + 5 + Level' },
				{ range: [10, 19], recovery: '4d6 + 5 + Level' },
				{ range: [20, 29], recovery: '4d6 + 10 + Level' },
				{ range: [30, 500], recovery: '5d6 + 15 + Level' },
			]
		},
		partialDragon: {
			target: 'self',
			duration: '10 Minutes',
			effectiveScore: [
				{ range: [10, 19], modifier: 2 },
				{ range: [20, 29], modifier: 4 },
				{ range: [30, 500], modifier: 6 },
			]
		},
		rust: {
			area: 5,
			range: 30,
			target: 'all'
		},
		senseEnemy: {
			target: 'self',
			area: {
				general: 30,
				specific: 10
			},
			effectiveScore: [
				{ range: [10, 19], duration: '10 minutes' },
				{ range: [20, 29], duration: '1 hour' },
				{ range: [30, 500], duration: '6 hours' },
			]
		},
		swordClaw: {
			sword: {
				target: 1,
				range: 'self',
				type: 'Light',
				attribute: 'Slash'
			},
			claw: {
				target: 'self'
			},
			effectiveScore: [
				{ range: [10, 14], bonus: 0, duration: '6 rounds' },
				{ range: [15, 19], bonus: 1, duration: '6 rounds' },
				{ range: [20, 24], bonus: 1, duration: '10 minutes' },
				{ range: [25, 29], bonus: 2, duration: '10 minutes' },
				{ range: [30, 500], bonus: 2, duration: '1 hour' },
			]
		},
		vitality: {
			target: 1,
			range: 5,
			effectiveScore: [
				{ range: [10, 19], modifier: '1d3' },
				{ range: [20, 29], modifier: '1d3 + 1' },
				{ range: [30, 500], modifier: '1d3 + 2' },
			]
		}
	},
	miracle: {
		eucharist: {
			food: {
				range: 5,
				target: 1,
				duration: '1 Day'
			},
			water: {
				range: 5
			}
		},
		peace: {
			target: 'All',
			area: 100,
			duration: '10 Minutes'
		},
		steadfast: {
			target: 1,
			range: 30,
			duration: '12 Rounds',
			effectiveScore: [
				{ range: [10, 14], modifier: 3, heal: 2 },
				{ range: [15, 19], modifier: 4, heal: 2 },
				{ range: [20, 29], modifier: 4, heal: 3 },
				{ range: [30, 39], modifier: 5, heal: 3 },
				{ range: [40, 500], modifier: 6, heal: 4 },
			]
		},
		guidance: {
			target: 1,
			range: 5,
			duration: '6 Rounds',
			effectiveScore: [
				{ range: [10, 14], modifier: 2 },
				{ range: [15, 19], modifier: 3 },
				{ range: [20, 29], modifier: 4 },
				{ range: [30, 39], modifier: 5 },
				{ range: [40, 500], modifier: 6 },
			]
		},
		inspiration: {
			target: 'self'
		},
		reading: {
			target: 'self',
			duration: '1 Round',
			effectiveScore: [
				{ range: [10, 19], effects: 'No Bonus.' },
				{ range: [20, 29], effects: 'The caster’s reading abilities increase, and they gain a +2 bonus to research checks (p. 268).' },
				{ range: [30, 500], effects: 'The caster is able to decipher codes and solve riddles the same way they read the unknown language.' },
			]
		},
		greaterHeal: {
			target: 1,
			range: 5,
			effectiveScore: [
				{ range: [20, 29], recovery: '2d6 + 20 + Level', duration: '3 days' },
				{ range: [30, 39], recovery: '2d6 + 30 + Level', duration: '3 days' },
				{ range: [40, 49], recovery: '4d6 + 40 + Level', duration: '10 days' },
				{ range: [50, 500], recovery: '6d6 + 50 + Level', duration: '30 days' },
			]
		},
		revive: {
			target: 1,
			range: 5
		},
		inquisition: {
			target: 1,
			range: 30,
			duration: '3 Rounds'
		},
		judge: {
			target: 1,
			range: 5
		},
		judgement: {
			target: 'self',
			effectiveScore: [
				{ range: [20, 29], modifier: 2 },
				{ range: [30, 39], modifier: 3 },
				{ range: [40, 500], modifier: 4 },
			]
		},
		contract: {
			duration: '1 Year',
		},
		reverse: {
			target: 1,
			duration: '1 Day'
		},
		traveler: {
			target: 1,
			range: 8,
			effectiveScore: [
				{ range: [15, 19], duration: '6 hours' },
				{ range: [20, 29], duration: '1 day' },
				{ range: [30, 500], duration: '3 days' },
			]
		},
		encourage: {
			target: 'All',
			area: 'Sphere of ',
			duration: '10 Minutes',
			effectiveScore: [
				{ range: [10, 14], radius: 3 },
				{ range: [15, 19], radius: 5 },
				{ range: [20, 24], radius: 10 },
				{ range: [25, 29], radius: 15 },
				{ range: [30, 500], radius: 20 },
			]
		},
		saintCloth: {
			target: 'self',
			duration: '6 Rounds',
			effectiveScore: [
				{ range: [15, 19], effects: 'No Bonus.' },
				{ range: [20, 29], effects: 'Also, caster gains a +2 bonus to the power of melee and ranged attacks.' },
				{ range: [30, 39], effects: 'Also, the caster gains a +2 bonus to all checks.' },
				{ range: [40, 500], effects: 'Also, the caster gains a +3 bonus to armor score and the power of melee attacks.' },
			]
		},
		valkyriesJavelin: {
			target: 1,
			range: 100,
			effectiveScore: [
				{ range: [15, 19], power: '4d6 + 5 + Level' },
				{ range: [20, 24], power: '5d6 + 10 + Level' },
				{ range: [25, 29], power: '6d6 + 15 + Level' },
				{ range: [30, 34], power: '6d6 + 20 + Level' },
				{ range: [35, 40], power: '8d6 + 20 + Level' },
				{ range: [40, 49], power: '9d6 + 25 + Level' },
				{ range: [50, 500], power: '10d6 + 30 + Level' },
			]
		},
		blessing: {
			target: 1,
			range: 30,
			effectiveScore: [
				{ range: [10, 14], hit: 2, power: 2 },
				{ range: [15, 19], hit: 2, power: 4 },
				{ range: [20, 24], hit: 3, power: 6 },
				{ range: [25, 29], hit: 3, power: 8 },
				{ range: [30, 500], hit: 4, power: 10 },
			]
		},
		cure: {
			target: 1,
			range: 5
		},
		dispel: {
			target: 1,
			range: 30,
		},
		holyLight: {
			target: 1,
			range: 30,
			area: 30
		},
		holySmite: {
			target: 1,
			range: 30,
			effectiveScore: [
				{ range: [5, 9], power: '2d6 + Level' },
				{ range: [10, 14], power: '3d6 + Level' },
				{ range: [15, 19], power: '3d6 + 5 + Level' },
				{ range: [20, 24], power: '4d6 + 5 + Level' },
				{ range: [25, 29], power: '4d6 + 10 + Level' },
				{ range: [30, 500], power: '5d6 + 15 + Level' },
			]
		},
		hymn: {
			target: 'all'
		},
		minorHeal: {
			target: 1,
			range: {
				distance: 30,
				touch: 5
			},
			effectiveScore: [
				{ range: [5, 9], recovery: '2d6 + Level' },
				{ range: [10, 14], recovery: '3d6 + Level' },
				{ range: [15, 19], recovery: '3d6 + 5 + Level' },
				{ range: [20, 24], recovery: '4d6 + 5 + Level' },
				{ range: [25, 29], recovery: '4d6 + 10 + Level' },
				{ range: [30, 500], recovery: '5d6 + 15 + Level' },
			]
		},
		protection: {
			area: 120
		},
		purify: {
			range: 60,
			area: 'General Volume',
			effectiveScore: [
				{ range: [5, 9], volume: 'About 1 barrel' },
				{ range: [10, 19], volume: 'About a small garden pond or room' },
				{ range: [20, 29], volume: 'About a small pond or large room' },
				{ range: [30, 39], volume: 'About a pond or large town square' },
				{ range: [40, 500], volume: 'About a small lake or entire small town' },
			]
		},
		sanctuary: {
			area: 30
		},
		senseEnemy: {
			area: {
				general: 30,
				specific: 10
			}
		},
		senseLife: {
			target: 'self',
			effectiveScore: [
				{ range: [10, 19], duration: '6 Rounds' },
				{ range: [20, 29], duration: '10 Minutes' },
				{ range: [30, 500], duration: '1 Hour' },
			]
		},
		silence: {
			range: 30,
			area: 'Sphere + Radius',
			effectiveScore: [
				{ range: [10, 19], radius: 10 },
				{ range: [20, 29], radius: 15 },
				{ range: [30, 500], radius: 20 },
			]
		},
		transferMentalPower: {
			target: 1,
			range: 5
		},
		vitality: {
			target: 1,
			range: 5,
			effectiveScore: [
				{ range: [10, 19], recovery: '1d3' },
				{ range: [20, 29], recovery: '1d3 + 1' },
				{ range: [30, 500], recovery: '1d3 + 2' },
			]
		}
	},
	necromancy: {
		wickedCurse: {
			target: 1,
			range: 30,
		},
		aging: {
			target: 'All',
			range: 30,
			area: 'Sphere, 10m',
			effectiveScore: [
				{ range: [15, 19], penalty: -1, modifier: 2, movement: 3 },
				{ range: [20, 29], penalty: -2, modifier: 4, movement: 6 },
				{ range: [30, 39], penalty: -3, modifier: 6, movement: 12 },
				{ range: [40, 500], penalty: -4, modifier: 10, movement: 20 },
			]
		},
		anomaly: {
			target: 'self',
			duration: '1 Hour',
			specialAbilities: [
				{ dc: 5, ability: 'Soft Body', effect: 'Gain +3 armor against bludgeoning damage.' },
				{ dc: 10, ability: 'Bypass Attack', effect: 'Your melee attacks are unaffected by the opponent\'s parry. Furthermore, they suffer a -4 penalty to block checks.' },
				{ dc: 20, ability: 'Magic Vision', effect: 'Your vision suffers from no detrimental effects.' },
				{ dc: 25, ability: 'High Speed Casting', effect: 'You can cast two spells as a main action, taking a -4 penalty on both for doing so. You are unable to cast a second spell after casting this spell, however.' },
				{ dc: 30, ability: 'Reproduction', effect: 'Recover a number of wounds equal to your adventurer (or monster) level at the end of the round.' },
				{ dc: 40, ability: 'Immortal Body', effect: 'Upon taking damage from a weapon, halve the damage of all the dice rolls of said weapon.' },
			]
		},
		boneSpear: {
			target: 'All',
			range: 100,
			effectiveScore: [
				{ range: [15, 19], power: '3d6 + Level' },
				{ range: [20, 24], power: '4d6 + Level' },
				{ range: [25, 29], power: '5d6 + Level' },
				{ range: [30, 39], power: '7d6 + Level' },
				{ range: [40, 500], power: '9d6 + Level' },
			]
		},
		boneSpur: {
			area: 20,
			range: 30,
			duration: '10 Minutes'
		},
		burial: {
			area: 1,
			depth: 2,
			range: 30,
			duration: '10 Minutes'
		},
		chill: {
			target: 1,
			area: 'Sphere, 10m',
			range: 30,
			effectiveScore: [
				{ range: [15, 19], power: '1d6 + 2 + Level' },
				{ range: [20, 29], power: '2d6 + 2 + Level' },
				{ range: [30, 39], power: '2d6 + 4 + Level' },
				{ range: [40, 500], power: '3d6 + 4 + Level' },
			]
		},
		command: {
			target: 'All',
			range: 'Sphere, see Radius',
			effectiveScore: [
				{ range: [15, 19], radius: 5, conditions: 'Characters with Command-based Intelligence' },
				{ range: [20, 29], radius: 10, conditions: 'Characters with Command-based and Instinctive Intelligence' },
				{ range: [30, 500], radius: 30, conditions: 'Characters with Command-based, Instinctive, Low, and 0 Intelligence' },
			]
		},
		corpseExplosion: {
			target: {
				corpse: 1,
				effected: 'all'
			},
			area: 5,
			range: {
				corpse: 30,
				effected: 'See Radius'
			},
			effectiveScore: [
				{ range: [15, 19], radius: 3, power: '3d6 + Level' },
				{ range: [20, 24], radius: 5, power: '4d6 + Level' },
				{ range: [25, 29], radius: 5, power: '5d6 + Level' },
				{ range: [30, 34], radius: 10, power: '6d6 + Level' },
				{ range: [35, 500], radius: 15, power: '7d6 + Level' },
			]
		},
		cremation: {
			target: 1,
			range: 60,
			effectiveScore: [
				{ range: [15, 19], power: '3d6 + Level' },
				{ range: [20, 24], power: '4d6 + Level' },
				{ range: [25, 29], power: '5d6 + Level' },
				{ range: [30, 34], power: '6d6 + Level' },
				{ range: [35, 500], power: '8d6 + Level' },
			]
		},
		earthBound: {
			area: 'Sphere, see Radius',
			range: 30,
			effectiveScore: [
				{ range: [10, 19], radius: 3 },
				{ range: [20, 29], radius: 5 },
				{ range: [30, 39], radius: 10 },
				{ range: [40, 500], radius: 15 },
			]
		},
		epidemic: {
			target: 'All',
			area: 'Sphere, 5m',
			range: 30,
			effectiveScore: [
				{ range: [10, 19], duration: '3 Rounds' },
				{ range: [20, 29], duration: '6 Rounds' },
				{ range: [30, 39], duration: '12 Rounds' },
				{ range: [40, 500], duration: '1 Hour' },
			]
		},
		lethalCut: {
			target: 1,
			range: 60,
			effectiveScore: [
				{ range: [10, 24], duration: '1 Round' },
				{ range: [25, 39], duration: '2 Rounds' },
				{ range: [40, 500], duration: '3 Rounds' },
			]
		},
		lifeDrain: {
			target: 1,
			range: 30,
			effectiveScore: [
				{ range: [10, 14], power: '2d6 + Level' },
				{ range: [15, 19], power: '3d6 + Level' },
				{ range: [20, 29], power: '4d6 + Level' },
				{ range: [30, 500], power: '5d6 + Level' },
			]
		},
		quarentine: {
			range: 5,
			area: 'Sphere, see Radius',
			effectiveScore: [
				{ range: [5, 9], radius: 30 },
				{ range: [10, 19], radius: 100 },
				{ range: [20, 500], radius: 1000 },
			]
		},
		raiseGhost: {
			target: 1,
			range: 5,
			effectiveScore: [
				{ range: [10, 19], effect: 'Create a Wandering Spirit', duration: '6 rounds' },
				{ range: [20, 29], effect: 'Create a Wandering Spirit, or Ghost', duration: '10 minutes' },
				{ range: [30, 39], effect: 'Create a Wandering Spirit, or Ghost', duration: '1 hour' },
				{ range: [40, 500], effect: 'Create a Wandering Spirit, Ghost, or Wraith', duration: '1 day' },
			]
		},
		raiseGolem: {
			target: "Corpse",
			range: 5,
			materialCost: "level of golem * 10 silver coins",
			effectivenessScore: [
				{
					range: [10, 14],
					number: 1,
					golemType: "Oak Golem",
					material: "Oak, Bone",
					duration: "10 min"
				},
				{
					range: [15, 19],
					number: 2,
					golemType: "Gargoyle",
					material: "Stone",
					duration: "10 min"
				},
				{
					range: [20, 29],
					number: 3,
					golemType: "Stone Golem",
					material: "Stone",
					duration: "1 hour"
				},
				{
					range: [30, 39],
					number: 4,
					golemType: "Bronze Golem",
					material: "Bronze Ingots",
					duration: "1 hour"
				},
				{
					range: [40, 500],
					number: 5,
					golemType: "Iron Golem",
					material: "Iron Ingots",
					duration: "1 day"
				}
			],
			chant: "O nameless one, O monster, move by the spirit of thunder, and carry the work of God upon your body.",
			catalyst: "None"
		},
		raiseSkeleton: {
			target: "Corpse",
			range: 5,  // 'Close' range as per your mapping (5 meters)
			effectivenessScore: [
				{
					range: [10, 14],
					number: 1,
					effect: "Create Skeleton or Dog Skeleton",
					duration: "10 min"
				},
				{
					range: [15, 19],
					number: 2,
					effect: "Create Skeleton, Dog Skeleton, Skeleton Archer, or Skeleton Guard",
					duration: "10 min"
				},
				{
					range: [20, 29],
					number: 3,
					effect: "Create Skeleton, Dog Skeleton, Skeleton Archer, Skeleton Guard, or Giant Skeleton",
					duration: "1 hour"
				},
				{
					range: [30, 39],
					number: 4,
					effect: "Create Skeleton, Dog Skeleton, Skeleton Archer, Skeleton Guard, Giant Skeleton, or Ancient Skeleton",
					duration: "1 hour"
				},
				{
					range: [40, 500],
					number: 5,
					effect: "Create Skeleton, Dog Skeleton, Skeleton Archer, Skeleton Guard, Giant Skeleton, or Ancient Skeleton",
					duration: "1 day"
				}
			],
			chant: "N/A", // Assuming no specific chant was mentioned
			catalyst: "None" // Assuming no catalyst is required
		},
		raiseSlime: {
			target: "Corpse",
			range: 5,  // 'Close' range, which corresponds to 5 meters
			effectivenessScore: [
				{
					range: [10, 14],
					number: 1,
					effect: "Create Slime",
					duration: "10 min"
				},
				{
					range: [15, 19],
					number: 2,
					effect: "Create Slime, or Red Slime",
					duration: "10 min"
				},
				{
					range: [20, 29],
					number: 3,
					effect: "Create Slime, Red Slime, Green Slime, or Giant Slime",
					duration: "1 hour"
				},
				{
					range: [30, 39],
					number: 4,
					effect: "Create Slime, Red Slime, Green Slime, Giant Slime, or Black Slime",
					duration: "1 hour"
				},
				{
					range: [40, 500],
					number: 5,
					effect: "Create Slime, Red Slime, Green Slime, Giant Slime, Black Slime, or Gold Slime",
					duration: "1 day"
				}
			],
			chant: "O ye who live the vesicles of life, O maid of thread-like granules, dance off your lorries!",
			catalyst: "None"
		},
		raiseZombie: {
			target: "Corpse",
			range: 5,  // 'Close' range, which corresponds to 5 meters
			effectivenessScore: [
				{
					range: [10, 14],
					number: 1,
					effect: "Create a Zombie",
					duration: "6 rounds"
				},
				{
					range: [15, 19],
					number: 2,
					effect: "Create a Zombie, or Ghoul",
					duration: "10 min"
				},
				{
					range: [20, 29],
					number: 3,
					effect: "Create a Zombie, Ghoul, or Barrow-Wight",
					duration: "10 min"
				},
				{
					range: [30, 39],
					number: 4,
					effect: "Create a Zombie, Ghoul, Barrow-Wight, or Living Undead",
					duration: "1 hour"
				},
				{
					range: [40, 500],
					number: 5,
					effect: "Create a Zombie, Ghoul, Barrow-Wight, Living Undead, or Dracolich",
					duration: "1 hour"
				}
			],
			chant: "Dawn belongs to the dead, and the shadow of night belongs to the departed, so the sun is prey to the spirits of the dead.",
			catalyst: "Necroption"
		},
		spiritWalk: {
			target: "Self",
			effect: "Caster becomes a spirit, invisible and not emitting any sound or smell.",
			restrictions: "Cannot use equipment, items, or spells. Cannot interact with the material world without special conditions.",
			effectivenessScore: [
				{
					range: [15, 19],
					restrictions: "No relaxation",
					duration: "10 minutes",
					penalty: "Poor vision (-4 to perception)",
					additional: "Can fly and move through objects."
				},
				{
					range: [20, 29],
					restrictions: "Perceive sound from the physical world, reducing visibility penalty to -2.",
					duration: "10 minutes",
					penalty: "Reduced poor visibility",
					additional: "Can fly and move through objects."
				},
				{
					range: [30, 500],
					restrictions: "Can speak and read, removing penalty due to poor visibility. However, cannot cast spells.",
					duration: "1 hour",
					penalty: "No visibility penalty",
					additional: "Can fly and move through objects."
				}
			],
			chant: "The shadows are cut off, dancing and dancing. The man in gray, the demon is a demon.",
			catalyst: "None"
		},
		spiritualAwakening: {
			target: "Self",
			requirements: {
				rounds: 6
			},
			effectivenessScore: [
				{
					range: [15, 19],
					duration: "10 minutes",
					abilities: "Converse with spirits; sense presence of dangers but not specifics."
				},
				{
					range: [20, 29],
					duration: "1 hour",
					abilities: "Converse with spirits; better danger sensing without specifics."
				},
				{
					range: [30, 39],
					duration: "3 hours",
					abilities: "Converse with spirits; improved danger sensing with vague understanding of the nature of danger."
				},
				{
					range: [40, 500],
					duration: "6 hours",
					abilities: "Converse with spirits; full danger sensing with vague but more detailed understanding of the nature of danger."
				}
			],
			chant: "If you can see, hear, touch, smell and feel, the boundary between life and death is beyond the ethereal.",
			catalyst: "Crystal"
		},
		spookyDance: {
			target: "All living creatures in area",
			area: "Sphere, 5m",
			range: 5,
			duration: "10 minutes",
			effectivenessScore: [
				{
					range: [10, 19],
					lifeForceModification: "+2",
					intelligenceModification: "-2",
				},
				{
					range: [20, 29],
					lifeForceModification: "+3",
					intelligenceModification: "-4",
				},
				{
					range: [30, 500],
					lifeForceModification: "+4",
					intelligenceModification: "-6",
				}
			],
			intelligenceChanges: {
				innate: ["Command-based or Instinct", "Low", "Average", "High"],
				afterChange: ["Command-based or Instinct", "Instinct", "Low", "Average"]
			},
			immunities: "Poison, Disease, Mental",
			chant: "Tonight is the night of shivers, and in front of 40 eyes, the way of escape will vanish.",
			catalyst: "Necroption"
		}
	},
	spiritArt: {
		calamity: {
			type: "Spirit Arts",
			range: 60,
			target: "All",
			area: "Sphere, see Radius",
			element: {
				Fire: "At the end of the round, the target receives 3d6 points of fire elemental damage. This damage is treated as burning damage and lasts for 3 rounds.",
				Water: "The target has their movement speed halved for 6 rounds and receives a -4 penalty on initiative checks.",
				Earth: "The target is knocked prone.",
				Wind: "Move all targets in one direction up to 10m when the spell is used.",
				Light: "The target loses sight for 2 rounds. This effect can be prevented by countermeasures against blindness (look at Distraction on pg. 160).",
				Darkness: "Choose one effect that the target is sustaining and get rid of it. It's not possible to remove an effect that can't be removed by the target's own will."
			},
			effectivenessScore: [
				{
					range: [25, 29],
					radius: 10,
					power: "2d6+10 Level"
				},
				{
					range: [30, 34],
					radius: 15,
					power: "3d6+10 Level"
				},
				{
					range: [35, 39],
					radius: 20,
					power: "3d6+15 Level"
				},
				{
					range: [40, 49],
					radius: 25,
					power: "4d6+15 Level"
				},
				{
					range: [50, 500],
					radius: 30,
					power: "4d6+20 Level"
				}
			],
			chant: "Spirit, go wild, do as you please!",
			catalyst: "Oil, snowballs, mudballs, balloons, glass balls, ink bottles"
		},
		aquaVitae: {
			effect: "Grants healing and stamina-restoration effects from a cup of water.",
			target: "1 Cup of Water",
			range: "User must drink the water",
			duration: "6 Rounds, then normal after 3 hours",
			usageLimit: "At most, 10 people can receive the healing effects from one usage of this spell.",
			combatNote: "Outside combat, immediate spell use check allowed.",
			effectivenessScore: [
				{
					range: [10, 14],
					woundsRecovered: "3d6 + Shaman Level",
					fatigueRecovered: 1
				},
				{
					range: [15, 19],
					woundsRecovered: "3d6 + 2 + Shaman Level",
					fatigueRecovered: 2
				},
				{
					range: [20, 24],
					woundsRecovered: "4d6 + 2 + Shaman Level",
					fatigueRecovered: 2
				},
				{
					range: [25, 29],
					woundsRecovered: "4d6 + 4 + Shaman Level",
					fatigueRecovered: 2
				},
				{
					range: [30, 500],
					woundsRecovered: "5d6 + 6 + Shaman Level",
					fatigueRecovered: 3
				}
			]
		},
		banish: {
			target: 1,
			type: "spirit",
			range: 60
		},
		bind: {
			target: 1,
			area: 30
		},
		blizzard: {
			effect: "Perform a magic attack in a cone area, dealing water/wind damage.",
			target: "All in cone of Max Length 20m and Max Base Radius 10m",
			area: "Cone, 20m length, 10m radius",
			damageType: "Water/Wind",
			duration: "3 rounds",
			spellResistance: {
				passEffect: "Damage halved, no penalty applied",
				failEffect: "Full damage and penalty applied"
			},
			effectivenessScore: [
				{
					range: [20, 24],
					power: "3d6 + 2 + Level",
					penalty: -2
				},
				{
					range: [25, 29],
					power: "3d6 + 4 + Level",
					penalty: -2
				},
				{
					range: [30, 34],
					power: "3d6 + 6 + Level",
					penalty: -3
				},
				{
					range: [35, 39],
					power: "4d6 + 6 + Level",
					penalty: -3
				},
				{
					range: [40, 500],
					power: "5d6 + 6 + Level",
					penalty: -4
				}
			]
		},
		breathe: {
			effect: "Allows the target to breathe underwater as if they were on land.",
			target: "1 within range",
			range: 30,
			spellResistance: {
				passEffect: "No effect",
				failEffect: "Spell activates"
			},
			benefits: {
				communication: "Can speak underwater, but not audible beyond immediate proximity.",
				resistance: "+4 bonus to resistance checks against negative effects from water-related elements"
			},
			effectivenessScore: [
				{
					range: [10, 19],
					duration: "6 rounds"
				},
				{
					range: [20, 29],
					duration: "10 minutes"
				},
				{
					range: [30, 500],
					duration: "1 hour"
				}
			]
		},
		callRain: {
			effect: "Manipulates weather to cause rain with varying effects based on effectiveness.",
			area: "Cylinder centered on a chosen point",
			range: 30,
			spellMaintenance: "Effect lasts as long as the caster maintains the spell.",
			effectivenessScore: [
				{
					range: [10, 14],
					height: "2m, radius 3m",
					effect: "Drizzle. Extinguishes small flames. Spells with fire attribute suffer -2 penalty."
				},
				{
					range: [15, 19],
					height: "3m, radius 5m",
					effect: "Medium rainfall. -1 penalty on all intelligence checks and resistance checks."
				},
				{
					range: [20, 24],
					height: "20m, radius 10m",
					effect: "Heavy rainfall. Requires a strength resistance check each round. Failure results in 1 point of fatigue."
				},
				{
					range: [25, 29],
					height: "50m, radius 15m",
					effect: "Downpour. Obstructs vision with a -4 penalty for poor vision."
				},
				{
					range: [30, 500],
					height: "100m, radius 20m",
					effect: "Intense rainfall. Complete vision blockage. -2 penalty to intelligence checks and resistance checks, with 2 points of fatigue on failed end-of-round resistance check."
				}
			]
		},
		catsEye: {
			effect: "Enhances the caster's visual capabilities for 10 minutes.",
			target: "Caster's eyes (left eye, right eye, or both)",
			duration: "10 minutes",
			bonus: "Higher scores stack with lower scores.",
			effectivenessScore: [
				{
					range: [10, 14],
					effect: "Gain Darkvision (Beginner)."
				},
				{
					range: [15, 19],
					effect: "Gain +1 bonus to hit checks from increased kinetic vision."
				},
				{
					range: [20, 24],
					effect: "Gain Darkvision (Intermediate). Ability to ignore flashes of light and distractions."
				},
				{
					range: [25, 29],
					effect: "Gain +2 bonus to hit checks and dodge checks."
				},
				{
					range: [30, 500],
					effect: "Gain Darkvision (Expert). Gain +4 bonus to perception checks and resistance against disguises, magical illusions, and hallucinations. Can see through magical darkness."
				}
			]
		},
		controlSpirits: {
			effect: "Summon 1 Spirit within Range: Reach and put it to use. The type of spirit summoned depends on the effectiveness score.",
			target: "1 Spirit",
			range: 5,
			duration: "Varies based on spirit type",
			effectivenessScore: [
				{
					range: [10, 19],
					effects: "Caster can summon a spirit (p. 583). Duration: 1 Hour."
				},
				{
					range: [20, 29],
					effects: "Caster can summon either a spirit or a free spirit (p. 584). Duration: Free spirit lasts for 10 Minutes; Spirit lasts for 1 Hour."
				},
				{
					range: [30, 500],
					effects: "Caster can summon either a spirit, a free spirit, or a greater spirit (p. 584). Duration: Greater spirit lasts for 6 Rounds; Free spirit lasts for 10 Minutes; Spirit lasts for 1 Hour."
				}
			],
			additionalNotes: "Summoned spirits act immediately or can receive commands telepathically from the caster. Spirits are able to perform simple tasks and support the caster in various ways such as engaging enemies or defending the caster. A spirit's action can be as simple as 'attack that goblin over there or attack the enemy who attacked ally A.' Spirits return to their own plane after the spell's duration unless commanded to stay longer by the caster under certain conditions."
		},
		darkness: {
			area: "Sphere, see Radius in Score",
			range: 30,
			effectivenessScore: [
				{
					range: [10, 14],
					radius: "5m",
					darkness: "Normal"
				},
				{
					range: [15, 19],
					radius: "10m",
					darkness: "Normal"
				},
				{
					range: [20, 24],
					radius: "10m",
					darkness: "Magical darkness"
				},
				{
					range: [25, 29],
					radius: "15m",
					darkness: "Magical darkness"
				},
				{
					range: [30, 500],
					radius: "20m",
					darkness: "Magical darkness"
				}
			],
			notes: "This spell plunges an area into darkness based on the effectiveness score. No light can pass through the darkness, magical or not. Characters inside cannot see outside, and those outside cannot see inside. Characters with Darkvision face penalties unless they are in magical darkness. The spell lasts as long as the caster maintains concentration."
		},
		fallingControl: {
			target: 'All',
			area: "Sphere, 10m Radius",
			range: 10,
			effectivenessScore: [
				{
					range: [10, 19],
					effects: "Decrease falling speed by up to half or accelerate it by up to 1.5x."
				},
				{
					range: [20, 29],
					effects: "Decrease falling speed by down to 1/10 or accelerate it by up to 2x."
				},
				{
					range: [30, 500],
					effects: "Completely stop falling speed or accelerate it by 3x. In these states, the target takes a -2 penalty to all checks except knowledge and resistance checks."
				}
			],
			notes: "This spell manipulates gravity on a target within a 10m radius, allowing the caster to slow down or speed up their rate of descent as described. It can be used as a free action to save someone from falling, applying intelligence reflex as the basic score of the spell use check with a -2 penalty on the final score. The spell lasts as long as the caster maintains concentration."
		},
		fear: {
			target: 'All',
			area: "Sphere, 10m Radius",
			range: 60,
			effectivenessScore: [
				{
					range: [10, 14],
					effects: "Targets trip over their own feet out of fear and are unable to approach the caster.",
					duration: "1 round"
				},
				{
					range: [15, 19],
					effects: "Targets take a -2 penalty to all checks except resistance checks.",
					duration: "3 rounds"
				},
				{
					range: [20, 29],
					effects: "Targets will attempt to flee. For the duration of the effect, they will attempt to get as far from the battlefield as possible.",
					duration: "6 rounds"
				},
				{
					range: [30, 500],
					effects: "Targets take a -2 penalty to all checks except resistance checks (for a total of a -4 penalty).",
					duration: "10 minutes"
				}
			],
			notes: "This spell creates an illusion of a swarm of locusts, inducing fear in targets within its area. Even if targets move outside the area, the effects persist for their full duration unless a spell resistance check is passed."
		},
		firebolt: {
			target: "1 target",
			range: 100,
			effectivenessScore: [
				{
					range: [5, 9],
					power: "3d6 + Shaman Level"
				},
				{
					range: [10, 14],
					power: "4d6 + Shaman Level"
				},
				{
					range: [15, 19],
					power: "5d6 + Shaman Level"
				},
				{
					range: [20, 24],
					power: "6d6 + Shaman Level"
				},
				{
					range: [25, 29],
					power: "8d6 + Shaman Level"
				},
				{
					range: [30, 500],
					power: "10d6 + Shaman Level"
				}
			],
			notes: "Launches an arrow of flame at a target, dealing fire damage. If the target passes a spell resistance check, the damage is halved before being reduced further by armor."
		},
		heatWave: {
			target: "All within Area",
			range: "20m, 10m, 5m",
			effectivenessScore: [
				{
					range: [10, 19],
					power: {
						"20m": "1d6 + Shaman Level",
						"10m": "2d6 + Shaman Level",
						"5m": "3d6 + Shaman Level"
					}
				},
				{
					range: [20, 29],
					power: {
						"20m": "2d6 + Shaman Level",
						"10m": "3d6 + Shaman Level",
						"5m": "4d6 + Shaman Level"
					}
				},
				{
					range: [30, 500],
					power: {
						"20m": "3d6 + Shaman Level",
						"10m": "4d6 + Shaman Level",
						"5m": "5d6 + Shaman Level"
					}
				}
			],
			notes: "This spell causes areas of increasing proximity to the caster to experience varying levels of heat damage, from mild at 20m to severe at 5m. The spell requires maintenance, and resistance checks may halve the damage before it is modified by armor."
		},
		illuminate: {
			target: 'All',
			area: "Sphere, see Radius in Score",
			range: 30,
			duration: "6 rounds",
			effectivenessScore: [
				{
					range: [5, 9],
					radius: "10m",
					effect: "Light illuminates a 10m area. Transparent characters and objects also glow, making their presence evident."
				},
				{
					range: [10, 19],
					radius: "20m",
					effect: "Illuminates a 20m area. All melee and ranged attacks against any affected targets suffer a -2 penalty on their hit checks."
				},
				{
					range: [20, 29],
					radius: "30m",
					effect: "Illuminates a 30m area. All melee and ranged attacks against any affected targets now suffer a -4 penalty on their hit checks."
				},
				{
					range: [30, 500],
					radius: "60m",
					effect: "Targets shine with a brilliant light, illuminating a 60m area. No one can look at the targets directly, and they cannot be targeted by spells. They also suffer a -8 penalty on hit checks."
				}
			],
			notes: "This spell scatters luminescent powder that illuminates the area with a varying intensity depending on the effectiveness score. It affects visibility and hit chances for targets within the illuminated area."
		},
		invisible: {
			target: 1,
			range: 1
		},
		kindle: {
			target: 1,
			range: 1
		},
		powerBall: {
			target: 'All',
			area: 3,
			range: 30
		},
		snare: {
			area: "Circle, see Radius in Score",
			range: 60,
			effectivenessScore: [
				{
					range: [10, 19],
					radius: "10m",
					duration: "3 rounds",
					effect: "Changes the ground to sludge. Characters moving through must pass a resistance check every 5m or fall prone."
				},
				{
					range: [20, 29],
					radius: "10m",
					duration: "6 rounds",
					effect: "Same as above."
				},
				{
					range: [30, 39],
					radius: "15m",
					duration: "6 rounds",
					effect: "Extended area with the same effects as previous scores."
				},
				{
					range: [40, 500],
					radius: "20m",
					duration: "10 minutes",
					effect: "Largest area and longest duration with the same movement penalties."
				}
			],
			notes: "This spell converts ground within the specified radius into sludge, making movement challenging and causing characters to risk falling prone. The effect is temporary and the ground will revert to normal after the spell's duration ends."
		},
		spiritWall: {
			area: 20,
			lifeForce: 50,
			armorScore: 10,
			fire: {
				damage: "2d6 + Level",
				duration: "6 Rounds"
			},
			water: {
				duration: "6 Rounds"
			},
			earth: {
				duration: "10 Rounds"
			},
			wind: {
				duration: "6 Rounds"
			}
		},
		stoneBlast: {
			area: "Sphere, see Radius in Score",
			range: 30,
			effectivenessScore: [
				{
					range: [10, 14],
					radius: "3m",
					power: "2d6 + Level"
				},
				{
					range: [15, 19],
					radius: "5m",
					power: "2d6 + 3 + Level"
				},
				{
					range: [20, 24],
					radius: "5m",
					power: "3d6 + 3 + Level"
				},
				{
					range: [25, 29],
					radius: "10m",
					power: "3d6 + 6 + Level"
				},
				{
					range: [30, 39],
					radius: "15m",
					power: "4d6 + 6 + Level"
				},
				{
					range: [40, 500],
					radius: "20m",
					power: "5d6 + 9 + Level"
				}
			],
			notes: "This spell causes a burst of stone and earth energy, dealing damage within a defined radius. The damage type is primarily blunt and is determined by the caster's shaman level and the effectiveness score. Targets may halve the damage with successful resistance checks."
		},
		stupor: {
			area: "Sphere, see Radius in Score",
			range: 60,
			effectivenessScore: [
				{
					range: [10, 14],
					radius: "5m",
					penalty: -1
				},
				{
					range: [15, 19],
					radius: "10m",
					penalty: -2
				},
				{
					range: [20, 24],
					radius: "15m",
					penalty: -2
				},
				{
					range: [25, 29],
					radius: "15m",
					penalty: -3
				},
				{
					range: [30, 500],
					radius: "20m",
					penalty: -4
				}
			],
			notes: "This spell creates a mystical mist that induces stupor. Characters within or entering the mist must succeed on a strength resistance check or suffer penalties and potentially fall asleep. The spell's effects last as long as the caster maintains concentration."
		},
		tailWind: {
			target: 1,
			area: "5m Radius",
			range: 1,
			effectivenessScore: [
				{
					range: [5, 9],
					duration: "3 hours"
				},
				{
					range: [10, 19],
					duration: "6 hours"
				},
				{
					range: [20, 29],
					duration: "1 day"
				},
				{
					range: [30, 500],
					duration: "3 days"
				}
			],
			notes: "This spell hastens the speed of a vehicle and anyone walking alongside it within a 5m radius, multiplying their movement by 1.5. The effect's duration is determined by the effectiveness score. The spell has no effect if the target passes a spell resistance check."
		},
		thunderbolt: {
			target: 1,
			range: 30,
			effectivenessScore: [
				{
					range: [10, 14],
					power: "3d6 + 4 + Shaman Level"
				},
				{
					range: [15, 19],
					power: "4d6 + 4 + Shaman Level"
				},
				{
					range: [20, 24],
					power: "4d6 + 6 + Shaman Level"
				},
				{
					range: [25, 29],
					power: "5d6 + 6 + Shaman Level"
				},
				{
					range: [30, 500],
					power: "7d6 + 4 + Shaman Level"
				}
			],
			notes: "This spell fires an arrow of lightning that deals wind damage. If the target's spell resistance check score is at least 4 points lower than the spell use check for Thunderbolt, the target is paralyzed until their next turn ends. Damage is halved before reducing it with armor score if the target passes a spell resistance check."
		},
		tunnel: {
			range: 1,
			duration: "10 Minutes"
		},
		waterWalk: {
			range: 30,
			effectivenessScore: [
				{
					range: [10, 19],
					duration: "6 rounds"
				},
				{
					range: [20, 29],
					duration: "10 minutes"
				},
				{
					range: [30, 500],
					duration: "1 hour"
				}
			],
			notes: "This spell grants the target the ability to walk on the surface of water as if on solid land. The target will not sink, regardless of weight, and can move and act normally on the water's surface. If underwater, the target is immediately ejected from it. The spell has no effect if the target passes a spell resistance check."
		},
		weathering: {
			target: 1,
			type: "item",
			range: 5,
			effectivenessScore: [
				{
					range: [5, 9],
					timeMultiplier: "10x"
				},
				{
					range: [10, 19],
					timeMultiplier: "60x"
				},
				{
					range: [20, 29],
					timeMultiplier: "300x"
				},
				{
					range: [30, 500],
					timeMultiplier: "3,000x"
				}
			],
			notes: "This spell accelerates time for one non-living object within reach, causing it to experience time at an accelerated rate. This acceleration has no effect on living creatures or anything with a mind. The duration and specific effects as time progresses are left to the GM's discretion, based on the context and what the caster is attempting to achieve. The spell lasts as long as the caster maintains it."
		},
		whirlwind: {
			target: 'All',
			range: 30,
			area: "Sphere with a radius of 5m from a center point",
			effectivenessScore: [
				{
					range: [15, 19],
					power: "2d6 + 2 + level"
				},
				{
					range: [20, 29],
					power: "2d6 + 4 + level"
				},
				{
					range: [30, 39],
					power: "3d6 + 4 + level"
				},
				{
					range: [40, 500],
					power: "4d6 + 4 + level"
				}
			],
			notes: "This spell creates a whirlwind blade that inflicts wind damage on all targets within the specified area. If a target's spell resistance check fails by 8 or more compared to the caster's spell check, they suffer a critical hit according to standard critical hit tables. The damage is halved if the target succeeds their spell resistance check before being further reduced by armor."
		}
	},
	wordsofTruePower: {
		disintegrationRay: {
			target: 'All',
			roundsRequired: 3,
			range: 100,
			area: "Straight line; conical shape in water",
			effectivenessScore: [
				{
					range: [20, 29],
					power: "5d6 + 14 + Level"
				},
				{
					range: [30, 39],
					power: "5d6 + 14 + Level"
				},
				{
					range: [40, 49],
					power: "5d6 + 20 + Level"
				},
				{
					range: [50, 500],
					power: "5d6 + 30 + Level"
				}
			],
			notes: "This spell emits a ray that disintegrates matter, dealing light attribute damage. If the target is not a creature, the damage is doubled before any resistances. If the target is a creature and fails their resistance check by 4 or more, it also destroys the target's armor, rendering it unusable unless repaired by a craftsman. In areas with water, the ray takes a conical shape and targets within the water gain a +4 bonus to resist this spell."
		},
		nuclearExplosion: {
			range: 60,
			effectivenessScore: [
				{
					range: [25, 34],
					radius: "10m",
					damage: "5d6 + 10 + Level"
				},
				{
					range: [35, 44],
					radius: "15m",
					damage: "7d6 + 10 + Level"
				},
				{
					range: [45, 54],
					radius: "20m",
					damage: "10d6 + 10 + Level"
				},
				{
					range: [55, 500],
					radius: "30m",
					damage: "10d6 + 20 + Level"
				}
			]
		},
		beastMind: {
			target: {
				casting: 'self',
				telepathy: '1 Creature'
			},
			duration: '10 Minutes',
		},
		big: {
			target: "1 Creature",
			range: 30,
			effectivenessScore: [
				{
					range: [10, 14],
					physicalModifier: "1.5x",
					powerArmorScoreModifier: "+2",
					expandedReach: "No Change",
					duration: "3 rounds"
				},
				{
					range: [15, 19],
					physicalModifier: "2x",
					powerArmorScoreModifier: "+3",
					expandedReach: "No Change",
					duration: "3 rounds"
				},
				{
					range: [20, 29],
					physicalModifier: "3x",
					powerArmorScoreModifier: "+5",
					expandedReach: "10m",
					duration: "6 rounds"
				},
				{
					range: [30, 39],
					physicalModifier: "5x",
					powerArmorScoreModifier: "+7",
					expandedReach: "15m",
					duration: "6 rounds"
				},
				{
					range: [40, 500],
					physicalModifier: "10x",
					powerArmorScoreModifier: "+10",
					expandedReach: "20m",
					duration: "10 minutes"
				}
			],
		},
		big: {
			target: '1 Creature',
			range: 30,
			effectivenessScore: [
				{
					range: [10, 14],
					physicalModifier: "1.5x",
					powerArmorScoreModifier: "+2",
					expandedReach: "No Change",
					duration: "3 rounds"
				},
				{
					range: [15, 19],
					physicalModifier: "2x",
					powerArmorScoreModifier: "+3",
					expandedReach: "No Change",
					duration: "3 rounds"
				},
				{
					range: [20, 29],
					physicalModifier: "3x",
					powerArmorScoreModifier: "+5",
					expandedReach: "10m",
					duration: "6 rounds"
				},
				{
					range: [30, 39],
					physicalModifier: "5x",
					powerArmorScoreModifier: "+7",
					expandedReach: "15m",
					duration: "6 rounds"
				},
				{
					range: [40, 500],
					physicalModifier: "10x",
					powerArmorScoreModifier: "+10",
					expandedReach: "20m",
					duration: "10 minutes"
				}
			],
			notes: "Target becomes giant, receiving bonuses to physical attributes and penalties to technique. Physical changes affect movement speed and capabilities. Duration depends on effectiveness score."
		},
		blastWind: {
			area: "Line within 60m radius",
			range: 60,
			target: 'All',
			effectivenessScore: [
				{
					range: [5, 14],
					effects: "Anything light without a mind to resist, not fixed to something, or otherwise susceptible to wind blows to the ending point."
				},
				{
					range: [15, 19],
					effects: "Perform a magic attack that deals 2d6 + Sorcerer Level points of wind damage. If a target passes a spell resistance check, the damage is halved before reducing it with armor score."
				},
				{
					range: [20, 24],
					effects: "If a target fails the spell resistance check, they are knocked prone and are moved 5m along the wind’s path."
				},
				{
					range: [25, 29],
					effects: "The magic attack’s power becomes 4d6 + Sorcerer Level."
				},
				{
					range: [30, 500],
					effects: "Person-sized objects are blown to the end point. This doesn’t happen if the object passes its spell resistance check."
				}
			],
			notes: "The caster indicates a starting point and an ending point within a 60m radius, creating a gust of wind. The wind blows everything along its path unless obstructed. Effects from higher scores stack with those from lower ones."
		},
		blizzard: {
			area: "Cone up to 20m long, 10m wide at the widest point",
			range: 20,
			target: "All",
			effectivenessScore: [
				{
					range: [20, 24],
					power: "3d6 + 2 + Sorcerer Level",
					penalty: -2
				},
				{
					range: [25, 29],
					power: "3d6 + 4 + Sorcerer Level",
					penalty: -2
				},
				{
					range: [30, 34],
					power: "3d6 + 6 + Sorcerer Level",
					penalty: -3
				},
				{
					range: [35, 39],
					power: "4d6 + 6 + Sorcerer Level",
					penalty: -3
				},
				{
					range: [40, 500],
					power: "5d6 + 6 + Sorcerer Level",
					penalty: -4
				}
			],
			notes: "Performs a magic attack that combines water and wind damage. The caster is the point of origin. Any targets who fail a spell resistance check take a penalty to all checks except resistance checks for 3 rounds."
		},
		breathe: {
			area: "Target: 1 within Range",
			range: 30,
			effectivenessScore: [
				{
					range: [10, 19],
					duration: "6 rounds"
				},
				{
					range: [20, 29],
					duration: "10 minutes"
				},
				{
					range: [30, 500],
					duration: "1 hour"
				}
			],
			notes: "Allows the target to breathe underwater. The target can speak, but their voice will not carry outside their immediate area. No water-attribute damage can affect the target, and they gain a +4 bonus against any negative effects from water-related elements like rain or snow."
		},
		charisma: {
			area: "Target: 1 within Range",
			range: 60,
			effectivenessScore: [
				{
					range: [10, 19],
					duration: "3 minutes",
					notes: "The target sees the caster as a friend. They will stop doubting the caster’s actions without reason and will accommodate the caster as long as doing so doesn’t clearly go against their own interests or beliefs."
				},
				{
					range: [20, 29],
					duration: "10 minutes",
					notes: "The target sees the caster as a close friend or employer. They will attempt to obey the caster so long as doing so clearly doesn’t endanger their life or put them at some kind of disadvantage."
				},
				{
					range: [30, 500],
					duration: "1 hour",
					notes: "The target sees the caster as a lover or family member and will treat them as they would someone precious to them. Depending on their personality, they may prioritize their caster’s life over their own."
				}
			],
			notes: "Instills the target with feelings towards the caster based on the spell's effectiveness score. If the target passes a spell resistance check, the spell has no effect. If the caster and target are currently in combat against each other, the target automatically passes spell resistance checks against this spell."
		},
		clumsy: {
			target: 1,
			range: 60
		},
		confuse: {
			area: "Sphere within Range",
			range: 30,
			effectivenessScore: [
				{
					range: [10, 14],
					radius: "3m",
				},
				{
					range: [15, 19],
					radius: "5m",
				},
				{
					range: [20, 24],
					radius: "10m",
				},
				{
					range: [25, 29],
					radius: "15m",
				},
				{
					range: [30, 500],
					radius: "20m",
				}
			],
			notes: "This spell confuses the minds of all targets within a specified radius based on the effectiveness score. The effect lasts as long as the caster maintains spell maintenance. Targets within the spell's range can’t distinguish friend from foe and must choose their targets randomly from all available allies and enemies."
		},
		controlAnimal: {
			target: '1 Creature',
			range: 60
		},
		counterSpell: {
			one: {
				target: 'All',
				area: '20m Radius',
				bonus: 2,
				duration: '6 Rounds'
			},
			two: {
				target: 1,
				range: 30,
				bonus: -2
			}
		},
		createGiant: {
			area: "Reach of the caster",
			type: "Giant",
			effectivenessScore: [
				{
					range: [20, 24],
					maxLevel: 5,
					duration: "2 rounds"
				},
				{
					range: [25, 29],
					maxLevel: 6,
					duration: "3 rounds"
				},
				{
					range: [30, 39],
					maxLevel: 7,
					duration: "6 rounds"
				},
				{
					range: [40, 500],
					maxLevel: 9,
					duration: "6 rounds"
				}
			],
			notes: "The caster creates a giant with a level not greater than the Max Level based on the effectiveness score. The giant follows the caster's commands, which can be willed silently. The caster may command the giant to attack enemies or defend. The giant disappears after the specified duration or can be dismissed at any time by the caster."
		},
		createGoblin: {
			area: 5,
			intelligence: "Command-based",
			effectivenessScore: [
				{
					range: [10, 14],
					quantity: 1,
					duration: "3 rounds"
				},
				{
					range: [15, 19],
					quantity: 1,
					duration: "6 rounds"
				},
				{
					range: [20, 24],
					quantity: 2,
					duration: "6 rounds"
				},
				{
					range: [25, 29],
					quantity: 3,
					duration: "10 minutes"
				},
				{
					range: [30, 500],
					quantity: 4,
					duration: "10 minutes"
				}
			],
			notes: "Create Quantity goblins within Area: Reach of the caster. The intelligence of these created goblins changes to command-based. The caster, starting on their next turn, can give orders to the goblins they create; thus, the goblins are able to start acting from the next round. However, they can still make dodge checks, resistance checks, and initiative checks before that. The caster, on their turn, can use a free action to give an order to the goblins they created. This command does not have to be spoken; it can simply be willed. However, the command must be simple, such as attack that goblin over there or attack the enemy who attacked ally A. They cannot carry out complex commands (the GM should decide what counts as complex). The goblins will attempt to faithfully carry out their orders to the best of their ability. If the caster has learned Leadership (Intermediate) or higher, they can have the goblins act at the same point in the turn order as them; in addition, the caster can have the goblins grant their support effect to the caster or to one specific character the caster indicates. The created goblins exist for Duration, then vanish. The caster can make their created goblins disappear at any time."
		},
		deflectMissile: {
			area: "Sphere",
			target: 1,
			range: 60,
			effectivenessScore: [
				{
					range: [10, 14],
					radius: "5m",
					duration: "6 rounds"
				},
				{
					range: [15, 19],
					radius: "10m",
					duration: "6 rounds"
				},
				{
					range: [20, 24],
					radius: "15m",
					duration: "10 minutes"
				},
				{
					range: [25, 29],
					radius: "20m",
					duration: "10 minutes"
				},
				{
					range: [30, 500],
					radius: "30m",
					duration: "1 hour"
				}
			],
			notes: "Produce a magical force field of Area: Sphere with a radius based on the effectiveness score centered on Target: 1 within Range: 60m. If the target resists this spell, it will not take effect. All arrows and bolts that enter the force field from outside it are blocked and do not enter. Arrows and bolts refer to any physical arrow or bolt fired from a ranged weapon, including stone bullets, arrows, bolts, or darts from a dart gun. This does not include weapons thrown by hand or spells like Firebolt. If it is unclear whether something would be affected by this spell, the GM should make the decision. The force field lasts for Duration."
		},
		disgust: {
			target: 1,
			range: 30,
			effectivenessScore: [
				{
					range: [10, 14],
					effects: "Take a -4 penalty to initiative. It can't go below 0.",
					duration: "3 rounds"
				},
				{
					range: [15, 19],
					effects: "Also take a -4 penalty on checks for active actions.",
					duration: "6 rounds"
				},
				{
					range: [20, 29],
					effects: "The target will also attempt to flee if combat looks unfavorable for them. Until the spell ends, they will try and distance themselves from the battlefield.",
					duration: "6 rounds"
				},
				{
					range: [30, 500],
					effects: "Also take a -8 penalty on all checks and initiative.",
					duration: "10 minutes"
				}
			],
			notes: "Target within Range: 30m loses the will to fight. They suffer Effects for Duration. Effects granted by higher effectiveness scores stack with those of lower scores. The GM should decide finer details of the spell based on the situation. If the target passes a spell resistance check, this spell has no effect."
		},
		enchantFire: {
			target: "1 Object",
			range: 30,
			duration: '6 Rounds'
		},
		enchantWeapon: {
			target: "1 Object",
			range: 1,
			duration: "1 Hour",
			effectivenessScore: [
				{
					range: [10, 19],
					modifierScore: "+1"
				},
				{
					range: [20, 29],
					modifierScore: "+2"
				},
				{
					range: [30, 500],
					modifierScore: "+3"
				}
			],
			notes: "Imbue Target: 1 Object in Range: Touch with magic power, adding Modifier Score to its hit modifier and power. This lasts for Duration: 1 Hour. Any melee and ranged attacks made with a targeted weapon are treated as magic attacks. However, for ranged weapons, only add the modifier score to the hit modifier, not the power. When targeting an arrow or bolt, you can add the modifier score to both the hit modifier and the power, so long as you use that arrow or bolt in a ranged attack. If the owner of the target object passes a spell resistance check, the spell has no effect."
		},
		fireball: {
			uuid: 'Compendium.gs.spells.Item.nncOCc9yzHm0WEcX',
			range: 60,
			target: "All",
			area: "Sphere, see Radius",
			effectivenessScore: [
				{
					range: [10, 14],
					radius: "2m",
					power: "2d6 + Level"
				},
				{
					range: [15, 19],
					radius: "3m",
					power: "3d6 + Level"
				},
				{
					range: [20, 24],
					radius: "5m",
					power: "4d6 + Level"
				},
				{
					range: [25, 29],
					radius: "10m",
					power: "5d6 + Level"
				},
				{
					range: [30, 500],
					radius: "10m",
					power: "7d6 + Level"
				}
			],
			notes: "Cause a ball of fire to explode within Range: 60m, causing a magic attack that deals Power points of fire damage to Target: All within the Area: Sphere with a Radius determined by the effectiveness score. In addition, a target at the center of the explosion takes +1d6 more damage. If the target passes a spell resistance check, the damage they receive is halved before reducing it with armor score."
		},
		firebolt: {
			target: 1,
			range: 100,
			effectivenessScore: [
				{
					range: [5, 9],
					power: "3d6 + Level"
				},
				{
					range: [10, 14],
					power: "4d6 + Level"
				},
				{
					range: [15, 19],
					power: "5d6 + Level"
				},
				{
					range: [20, 24],
					power: "6d6 + Level"
				},
				{
					range: [25, 29],
					power: "8d6 + Level"
				},
				{
					range: [30, 500],
					power: "10d6 + Level"
				}
			],
			notes: "Launch an arrow of flame at Target: 1 within Range: 100m, performing a magic attack that deals Power points of fire damage. If the target passes a spell resistance check, the damage they receive is halved before reducing it with armor score."
		},
		float: {
			target: "Self",
			effectivenessScore: [
				{
					range: [10, 19],
					movementSpeed: "5m"
				},
				{
					range: [20, 29],
					movementSpeed: "10m"
				},
				{
					range: [30, 39],
					movementSpeed: "30m"
				},
				{
					range: [40, 500],
					movementSpeed: "50m"
				}
			],
			notes: "Caster becomes light enough to float on the wind, and they can freely move through the air at a Movement Speed determined by the effectiveness score. This effect lasts for as long as the caster uses spell maintenance."
		},
		forceField: {
			effect: "Creates a wall made of force that can change shape according to the caster's wishes.",
			area: "Up to 100 square meters, shape encompassing a 30m radius from the caster",
			characteristics: "The wall is invisible, can overlap with other objects, obstacles, or characters but not completely seal them unless specified by the GM. Possible to make a small opening.",
			effectivenessScore: [
				{
					range: [15, 19],
					durability: 15
				},
				{
					range: [20, 24],
					durability: 20
				},
				{
					range: [25, 29],
					durability: 25
				},
				{
					range: [30, 39],
					durability: 30
				},
				{
					range: [40, 49],
					durability: 40
				},
				{
					range: [50, 500],
					durability: 50
				}
			],
			behavior: "Separates inside from outside, stops character movement, weapon-based attacks, and magic attacks like Fireball or Magic Missile. Disappears if takes damage equal to durability.",
			maintenance: "Remains as long as caster uses spell maintenance.",
			notes: "The force field remains stable for as long as the caster uses spell maintenance. If targeted by attacks or spells that deal damage, it will disappear if the damage equals or exceeds its durability as per effectiveness score."
		},
		foresight: {
			target: {
				casting: "Self",
				result: "1 Question"
			}
		},
		gambit: {
			target: 1,
			range: 1,
			duration: "10 Minutes",
			effectivenessScore: [
				{
					range: [5, 9],
					radius: "1m",
					damage: "3d6 + Level"
				},
				{
					range: [10, 14],
					radius: "3m",
					damage: "3d6 + Level"
				},
				{
					range: [15, 19],
					radius: "5m",
					damage: "3d6 + Level"
				},
				{
					range: [20, 29],
					radius: "10m",
					damage: "3d6 + Level"
				},
				{
					range: [30, 500],
					radius: "15m",
					damage: "3d6 + Level"
				}
			],
			notes: "The caster can perform a ranged attack by throwing the small stone they filled with magical energy. On impact, whether with an enemy or with the ground if it misses, the stone will explode, dealing bludgeoning damage to all within a sphere with radius determined by the effectiveness score. If a target passes a spell resistance check, they reduce the damage by half before applying their armor score. If the target of the ranged attack is a creature, failing a spell resistance check will cause them to be surprised by the noise and bright light. Until the end of the next round, they take a -2 penalty on all checks. This spell can be used as a free action."
		},
		haste: {
			target: 1,
			range: 30,
			effectivenessScore: [
				{
					range: [15, 19],
					modifierScore: "+1"
				},
				{
					range: [20, 24],
					modifierScore: "+2"
				},
				{
					range: [25, 29],
					modifierScore: "+3"
				},
				{
					range: [30, 34],
					modifierScore: "+4"
				},
				{
					range: [35, 39],
					modifierScore: "+5"
				},
				{
					range: [40, 500],
					modifierScore: "+6"
				}
			],
			notes: "Doubles the movement speed of Target: 1 within Range: 30m and grants them a Modifier Score bonus to the final score on all checks, including initiative checks. Starting from the following round, if their initiative is 13 or more as a result of this effect, they can take another turn that round, with that additional turn having an initiative of 12 less. This effect lasts as long as the caster uses spell maintenance. If the target passes a spell resistance check, this spell has no effect."
		},
		imitation: {
			effect: "Create illusory treasures worth about 1,000 gold coins",
			range: 1,
			effectivenessScore: [
				{
					range: [15, 19],
					duration: "10 minutes"
				},
				{
					range: [20, 29],
					duration: "1 hour"
				},
				{
					range: [30, 500],
					duration: "6 hours"
				}
			],
			notes: "Those who find value in the false treasures must compare check scores (p. 128): their psyche resistance check score against the total spell use check score for Imitation. Those who win this check see the illusions for what they are. However, if they fail, they do not realize the dubiousness of the situation and believe the treasures are real and wish to obtain them. If the target fails the psyche resistance check, they are fully convinced by the illusion and may be manipulated accordingly. This can include forcing someone who wants the treasures to accept demands or potentially attacking the caster if the demands are too extreme. The illusion disappears when the Duration expires or when the caster moves at least 100 meters away. If the target passes a spell resistance check, the spell has no effect."
		},
		interpreter: {
			target: 'self',
			duration: '10 Minutes'
		},
		light: {
			target: "1 Object",
			range: 1,
			area: "Radius 30m",
			effectivenessScore: [
				{
					range: [5, 14],
					duration: "1 hour"
				},
				{
					range: [15, 29],
					duration: "6 hours"
				},
				{
					range: [30, 500],
					duration: "1 day"
				}
			],
			notes: "Causes the target object to glow or produces a floating orb of light at touch. The caster can decide the intensity of the light before casting. The orb can move up to 20m per round but has no physical effect on anything and won’t receive any damage even if it touches something harmful. When producing an orb, the caster takes a -5 penalty on their spell use check. The light illuminates up to a 30m radius and lasts for a duration determined by the effectiveness score."
		},
		lightning: {
			effect: "Fires a bolt of lightning in a line from the caster",
			target: "All in Area",
			range: 100,
			effectivenessScore: [
				{
					range: [15, 19],
					power: "2d6 + 4 + Level"
				},
				{
					range: [20, 24],
					power: "3d6 + 2 + Level"
				},
				{
					range: [25, 29],
					power: "3d6 + 4 + Level"
				},
				{
					range: [30, 34],
					power: "4d6 + 4 + Level"
				},
				{
					range: [35, 39],
					power: "5d6 + 4 + Level"
				},
				{
					range: [40, 500],
					power: "6d6 + 6 + Level"
				}
			],
			notes: "This attack deals an amount of wind damage determined by the effectiveness score in a straight line up to 100m that hits all targets in its path. If the target passes a spell resistance check, the damage is halved before reducing it with armor score."
		},
		lock: {
			target: "One Door, Lid, or Any Other Object",
			range: 30,
			effectivenessScore: [
				{
					range: [5, 14],
					duration: "3 rounds"
				},
				{
					range: [15, 19],
					duration: "6 rounds"
				},
				{
					range: [20, 29],
					duration: "10 minutes"
				},
				{
					range: [30, 39],
					duration: "3 hours"
				},
				{
					range: [40, 500],
					duration: "12 hours"
				}
			],
			notes: "Makes the target object become unopenable and increases its resistance to destruction by ten times. The GM should make decisions regarding means of destruction. The spell's effects last for the duration determined by the effectiveness score, but if there was already a locking mechanism or something like it, then even after the effect lapses, it remains locked."
		},
		mageHand: {
			target: "Self",
			duration: "6 rounds",
			effects: [
				{
					range: [10, 19],
					description: "The mage hand may be utilized from close distance up to 10 meters for one-handed actions such as attacking with a dagger, utilizing Range: Touch spells, and passing items. Since the hand is invisible, it gives a -4 penalty to basehanded attack parries and defense."
				},
				{
					range: [20, 29],
					description: "Perform two-handed actions with the mage hand, but with a -2 penalty. You may add your sorcerer level to the power of unarmed attacks and weapon power effect and increasing its power by 4 for barehanded attacks. Its unarmed attack is treated as magical and ignores half armor score."
				},
				{
					range: [30, 500],
					description: "You can apply your sorcerer level to manipulation checks using the mage hand. You can also make the mage hand into gigantic, giving it the Bind weapon effect and increasing its power by 4 for barehanded attacks. In addition, you can perform movement obstruction checks and assist with movement obstruction (and resistance) for allies within range of the mage hand. If the caster interferes with the movement, you can add sorcerer level instead of warrior level to the check. In such cases, the obstructer determines the end position of the move."
				}
			],
			notes: "Creates a hand of energy that can be manipulated at will. The capabilities of the mage hand depend on the effectiveness score, which determines the range of actions and the power of the hand. All effects obtained with a higher effectiveness score include all lower effectiveness score effects, though the number of parries you gain will not change. The hand is only singular, so the caster should have a third hand."
		},
		mageShield: {
			area: "Target: Plate-Shaped Object",
			range: "Caster's inventory",
			effectivenessScore: [
				{
					range: [10, 19],
					modifier: "+2"
				},
				{
					range: [20, 29],
					modifier: "+3"
				},
				{
					range: [30, 500],
					modifier: "+4"
				}
			],
			notes: "The caster can treat any plate-shaped object as a magical shield for 10 minutes. The target must be something without a will of its own and must be in the caster's inventory or money. If the target is a shield, add a Modifier Score determined by its effectiveness score to the shield’s block modifier and block score. If the target is not a shield, it is treated as having the same data as a buckler. This shield attaches to the back of the caster's hand or to their arm, so they don’t need to hold it and can still do things like dual wield. However, if they have another shield, they can only use 1 of them for block checks. The target gains Effects: Treat this shield as proper equipment for a sorcerer. Additionally, you can add your sorcerer level to block checks using this shield."
		},
		magicFog: {
			area: "100m Radius, 5m height"
		},
		magicMissile: {
			target: 1,
			range: 60,
			power: "1d6 + 1 * Quantity",
			effectivenessScore: [
				{
					range: [10, 14],
					quantity: 1
				},
				{
					range: [15, 19],
					quantity: 2
				},
				{
					range: [20, 29],
					quantity: 3
				},
				{
					range: [30, 500],
					quantity: 4
				}
			],
			notes: "Produces a quantity of energy arrows that cannot be dodged or resisted and are not affected by armor score. The caster decides how many arrows to shoot at which targets after producing them, but must decide on all targets before calculating damage. Each arrow deals 1d6+1 points of damage."
		},
		mindReading: {
			target: 1,
			range: 30,
			effectivenessScore: [
				{
					range: [10, 19],
					effects: "The caster can read the target’s thoughts and feelings from the instant the spell is cast."
				},
				{
					range: [20, 29],
					effects: "After reading the target’s thoughts and feelings, the caster can ask 1 question and know the answer the target thinks in response."
				},
				{
					range: [30, 500],
					effects: "The caster can record the target’s thoughts or memories at the time the spell was cast. If desired, they can read any part of the target’s memories for Duration: 10 minutes and simulate responses to specific situations."
				}
			],
			notes: "If the target passes a spell resistance check, the spell has no effect. If the target is sentient or is a kind of existence completely different from the caster, the target gains a +4 bonus on their spell resistance check against this spell."
		},
		otherSelf: {
			area: 5,
			duration: "1 Day"
		},
		panic: {
			area: "Sphere, Radius 15m",
			range: 30,
			effectivenessScore: [
				{
					range: [10, 14],
					effects: "The fear causes the target to lose their confidence. They take a −2 penalty on all checks except resistance checks.",
					duration: "1 round"
				},
				{
					range: [15, 19],
					effects: "The target also takes a −2 penalty on all checks made for active actions. This is a −4 penalty in total.",
					duration: "3 rounds"
				},
				{
					range: [20, 29],
					effects: "The target also attempts to flee for the duration of the spell.",
					duration: "6 rounds"
				},
				{
					range: [30, 500],
					effects: "For the first round they are afflicted by this spell, the target is unable to move or take action, and all their checks, except for resistance checks, automatically fail.",
					duration: "6 rounds"
				}
			],
			notes: "This spell creates a sphere of fear. The fear lasts as long as the caster uses spell maintenance. If the target passes a spell resistance check, the spell has no effect on them. Even if a target leaves the spell’s initial area of effect, they will still be under the spell’s effects for as long as spell maintenance is active. GM should decide the finer details of the spell based on the situation."
		},
		quicksand: {
			area: "Sphere, see Radius",
			range: 30,
			effectivenessScore: [
				{
					range: [10, 19],
					radius: "3m"
				},
				{
					range: [20, 29],
					radius: "5m"
				},
				{
					range: [30, 39],
					radius: "10m"
				},
				{
					range: [40, 500],
					radius: "15m"
				}
			],
			notes: "Changes the ground into magical quicksand that swallows any small animals or items that fall to the ground. When a character enters the quicksand or begins their turn in it, they must make a spell resistance check. If they fail, their legs are trapped, and they receive a −2 penalty on all checks each round until they escape or the spell ends. Exiting the quicksand reduces the penalty by 2 each time they try. A character can help another within the quicksand to reduce the penalty or exit quicker. Once all penalties are lost, characters regain the ability to move. This effect lasts as long as the caster maintains concentration. After the effects are lost, any creatures or objects that the quicksand swallowed will slowly be pushed back aboveground."
		},
		selfVision: {
			range: 5,
			target: 1,
			duration: '6 Rounds'
		},
		senseRisk: {
			target: "Self",
			effectivenessScore: [
				{
					range: [5, 14],
					duration: "6 rounds"
				},
				{
					range: [15, 29],
					duration: "10 minutes"
				},
				{
					range: [30, 500],
					duration: "1 hour"
				}
			],
			notes: "When this spell is active, the caster will immediately know of any imminent dangers such as traps or ambushes and understand what those dangers entail. The spell's effect and duration depend on the effectiveness score achieved when casting."
		},
		sleep: {
			area: "Sphere, see Radius",
			range: 60,
			effectivenessScore: [
				{
					range: [10, 14],
					radius: "5m"
				},
				{
					range: [15, 19],
					radius: "10m"
				},
				{
					range: [20, 24],
					radius: "15m"
				},
				{
					range: [25, 29],
					radius: "20m"
				},
				{
					range: [30, 500],
					radius: "30m"
				}
			],
			notes: "This spell causes all targets within the affected area to fall asleep unless they pass a spell resistance check. Those affected fall prone and cannot move or perform actions, except resistance checks. If awoken by significant stimulation or damage, targets immediately wake up. This effect lasts as long as the caster maintains spell maintenance."
		},
		slow: {
			area: "Sphere",
			radius: 30,
			effectivenessScore: [
				{
					range: [15, 19],
					penalty: "-2"
				},
				{
					range: [20, 24],
					penalty: "-3"
				},
				{
					range: [25, 29],
					penalty: "-4"
				},
				{
					range: [30, 39],
					penalty: "-5"
				},
				{
					range: [40, 49],
					penalty: "-6"
				},
				{
					range: [50, 500],
					penalty: "-7"
				}
			],
			notes: "Targets within the affected area lose half their movement speed and suffer a penalty to all checks made. If a target’s initiative goes below 0 as a result of this spell, they are completely stopped for that round, unable to make any movement or action. Flying characters lose their flight ability and fall 3 meters. The effect lasts as long as the caster maintains spell maintenance. This spell has no effect if the target passes a resistance check."
		},
		slowFall: {
			target: 'All',
			area: "Sphere",
			radius: 10,
			range: 30
		},
		spiderWeb: {
			area: "Sphere with Radius based on the effectiveness score centered on a point within Range: 60m",
			effectivenessScore: [
				{
					range: [10, 14],
					radius: "3m",
					duration: "3 rounds"
				},
				{
					range: [15, 19],
					radius: "5m",
					duration: "3 rounds"
				},
				{
					range: [20, 24],
					radius: "10m",
					duration: "6 rounds"
				},
				{
					range: [25, 29],
					radius: "15m",
					duration: "6 rounds"
				},
				{
					range: [30, 500],
					radius: "30m",
					duration: "10 minutes"
				}
			],
			notes: "This spell creates a sticky web that adheres to any surface, trapping any characters who enter. Trapped characters are unable to move or make melee attacks and suffer a −2 penalty to all fitness checks, manipulation checks, movement checks, and other checks involving movement. They can escape by performing an escape check. The web is weak to fire; fire damage or a main action to burn it will destroy the web."
		},
		stoneWall: {
			area: "20m from the caster",
			effectivenessScore: [
				{
					range: [15, 19],
					durability: "50",
					duration: "3 rounds"
				},
				{
					range: [20, 24],
					durability: "50",
					duration: "6 rounds"
				},
				{
					range: [25, 29],
					durability: "100",
					duration: "6 rounds"
				},
				{
					range: [30, 500],
					durability: "200",
					duration: "10 minutes"
				}
			],
			notes: "The wall is 5m tall, 10m wide, and 50cm thick. It cannot overlap with other objects and is opaque and solid. It has an armor score of 10. If it takes damage from attacks or magic and the damage isn't a critical failure, it accumulates a wound count. If the wound count reaches the wall's durability, the wall is destroyed. After the duration, the wall crumbles and turns into earth."
		},
		strengthBoost: {
			target: "Self",
			effectivenessScore: [
				{
					range: [10, 19],
					modifier: "+2",
					duration: "10 minutes"
				},
				{
					range: [20, 29],
					modifier: "+4",
					duration: "10 minutes"
				},
				{
					range: [30, 500],
					modifier: "+6",
					duration: "10 minutes"
				}
			],
			notes: "This spell increases the caster's strength and consequently their life force for a duration of 10 minutes."
		},
		transparent: {
			target: "Self",
			modifier: -6
		},
		unlock: {
			target: "Door, Lid, or Other Similar Object",
			range: 10,
			effectivenessScore: [
				{
					range: [10, 19],
					effects: "Open a door. If it's locked, it becomes unlocked."
				},
				{
					range: [20, 29],
					effects: "If a physical trap or the like was set on the lock, it will not trigger."
				},
				{
					range: [30, 500],
					effects: "You can undo magically closed locks and traps as well. It may not work with certain spells."
				}
			],
			notes: "Releases the lock or similar mechanism of a target within 10 meters. The caster can choose to open the target at the same time as the spell takes effect. The effects of higher effectiveness scores include those of lower ones. The GM can decide on more specific details for the situation."
		},
		vision: {
			range: 30,
			effectivenessScore: [
				{
					range: [5, 9],
					size: "Up to the size of a personal item"
				},
				{
					range: [10, 19],
					size: "Up to the size of a person"
				},
				{
					range: [20, 29],
					size: "Up to a size you could easily fit 5-6 people inside"
				},
				{
					range: [30, 39],
					size: "Up to the size of a large room"
				},
				{
					range: [40, 500],
					size: "Up to the size of a small house"
				}
			],
			notes: "The caster creates and controls an illusion that is both visible and audible. The size of the illusion is determined by the effectiveness score. Observers of the illusion must make a spell resistance check to discern its nature. If they pass, they recognize it as an illusion; if they fail, they believe it is real."
		},
		weatherControl: {
			area: "3km Radius from the caster",
			duration: "1 hour",
			effectivenessScore: [
				{
					range: [15, 19],
					effects: "Can do things found in nature, such as turn clear weather to fair, make rain fall from large clouds, and calm storms."
				},
				{
					range: [20, 29],
					effects: "Can do clearly unnatural things, like turn fair skies to clouds, cool hot days, and stop heavy rains."
				},
				{
					range: [30, 500],
					effects: "Can do crazy things, such as make snow fall on a hot, humid day; turn storms to fair weather; and call lightning down from clear skies."
				}
			],
			notes: "This spell allows the caster to control the weather within a 3km radius. The degree of control depends on the effectiveness score, with more dramatic changes possible at higher scores. After the spell's duration, the weather returns to its normal pattern."
		}
	}
}
