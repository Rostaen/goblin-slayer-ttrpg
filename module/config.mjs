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
			sorc: "gs.actor.character.sorc",
			prie: "gs.actor.character.prie",
			dPri: "gs.actor.character.dPri",
			sham: "gs.actor.character.sham",
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
			range: 5,
			area: 'cylinder, 10m height, 5m radius',
			target: 'all',
			effectiveScore: [
				{ range: [20, 24], power: '5d6 + level' },
				{ range: [25, 29], power: '6d6 + level' },
				{ range: [30, 39], power: '6d6 + 5 + level' },
				{ range: [40, 500], power: '6d6 + 10 + level' }
			]
		},
		bezor: {
			target: 'self'
		},
		camouflage: {
			duration: '1 Hour',
			target: 'self'
		},
		charge: {
			range: '3 x Caster Movement',
			target: 'all',
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
				target: 'all',
				area: 'Cone, 30m Length, 10m Base Radius',
				effectiveScore: [
					{ range: [10, 19], power: '4d6 + level' },
					{ range: [20, 29], power: '6d6 + level' },
					{ range: [30, 39], power: '8d6 + level' },
					{ range: [40, 500], power: '10d6 + level' },
				]
			},
			lightning: {
				target: 'all',
				area: 'Line, 60m',
				effectiveScore: [
					{ range: [10, 19], power: '2d6 + 2 + level' },
					{ range: [20, 29], power: '3d6 + 4 + level' },
					{ range: [30, 39], power: '5d6 + 4 + level' },
					{ range: [40, 500], power: '7d6 + 6 + level' },
				]
			},
			ice: {
				target: 'all',
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
				target: 'all',
				area: 'Cone, 20m Length, 20m Base Radius',
				duration: '3 Rounds',
				effectiveScore: [
					{ range: [10, 19], power: '2d6 + 2 + level', damage: '1d6'},
					{ range: [20, 29], power: '4d6 + level', damage: '1d6'},
					{ range: [30, 39], power: '5d6 + level', damage: '2d6'},
					{ range: [40, 500], power: '6d6 + level', damage: '3d6'},
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
			target: 'all',
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
			target: 'all',
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
	miracles: {
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
			target: 'all',
			area: 100,
			duration: '10 Minutes'
		},
		steadfast: {
			target: 1,
			range: 30,
			duration: '12 Rounds',
			effectiveScore: [
				{ range: [10, 14], modifier: 3, recovery: 2 },
				{ range: [15, 19], modifier: 4, recovery: 2 },
				{ range: [20, 29], modifier: 4, recovery: 3 },
				{ range: [30, 39], modifier: 5, recovery: 3 },
				{ range: [40, 500], modifier: 6, recovery: 4 },
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
			target: 'all',
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
				{ range: [5, 9], power: '2d6 + Level' },
				{ range: [10, 14], power: '3d6 + Level' },
				{ range: [15, 19], power: '3d6 + 5 + Level' },
				{ range: [20, 24], power: '4d6 + 5 + Level' },
				{ range: [25, 29], power: '4d6 + 10 + Level' },
				{ range: [30, 500], power: '5d6 + 15 + Level' },
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
				{ range: [10, 19], radius: 10},
				{ range: [20, 29], radius: 15},
				{ range: [30, 500], radius: 20},
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
				{ range: [10, 19], recovery: '1d3'},
				{ range: [20, 29], recovery: '1d3 + 1'},
				{ range: [30, 500], recovery: '1d3 + 2'},
			]
		}
	},
	necromancy: {
		wickedCurse: {
			target: 1,
			range: 30,
		},
		aging: {
			target: 'all',
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
			target: 'all',
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
			target: 'all',
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
			target: 'all',
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
		}
	}
}
