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
			spi: "gs.gear.spells.spi"
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
			sham: "gs.actor.character.sham"
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
