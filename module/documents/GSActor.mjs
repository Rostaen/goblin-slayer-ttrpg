export class GSActor extends Actor {
    prepareData(){
        super.prepareData();
    }

    prepareBaseData(){

    }

    prepareDerivedData(){
        super.prepareDerivedData();
        const actorData = this;
        const systemData = actorData.system;
        const flags = actorData.flags.gs || {};

        this._prepareCharacterData(actorData);
        this._prepareMonsterData(actorData);
    }

    _prepareCharacterData(actorData){
        const systemData = actorData.system;
        const type = actorData.type;
        let hardinessBonus = 0;

        // Removing existing object if present
        // if(systemData.lifeForce.min)
        //     delete systemData.lifeForce.min;

        // Updating lifeforce value if wounds applied
        if(systemData.lifeForce.wounds){
            systemData.lifeForce.value = systemData.lifeForce.value - systemData.lifeForce.wounds;
            if(systemData.lifeForce.value <= 0){
                systemData.lifeForce.value = 0;
            }
        }

        if(type !== 'character') return;

        const actorSkills = this.items.filter(item => item.type === 'skill');

        // Setting up character calculated ability scores
        for(const [keyP, scoreP] of Object.entries(systemData.abilities.primary)){
            for(const [keyS, scoreS] of Object.entries(systemData.abilities.secondary)){
                const calcString = keyP.substring(0,1) + keyS.substring(0,1);
                const calcScore = scoreP + scoreS;
                systemData.abilities.calc[calcString] = calcScore;
            }
        }

        // TODO: Set a value for a non-existing field for max spells for each spell system
        systemData.spellUse.totalSpellsKnown = {
            "sorc": systemData.levels.classes.sorcerer,
            "prie": systemData.levels.classes.priest,
            "dPri": systemData.levels.classes.dragon,
            "sham": systemData.levels.classes.shaman,
            "necro": systemData.levels.classes.necro
        };

        // Setting Character Spell Resistance
        systemData.spellRes = systemData.levels.adventurer + systemData.abilities.calc.pr + this._getSkillBonus("Spell Resistance") + (this._getSkillBonus('Veil of Darkness') - 1);

        // Getting character skills
        for(const skill of actorSkills){
            //console.log("===> For Loop Skill Check", skill);
            const skillValue = skill.system.value;
            const skillName = skill.name;
            if(skillValue){
                switch(skillName){
                    case "Anticipate": case "First Aid": case "Handiwork": case "Lucky": case "Observe": case "Sixth Sense": case 'Strengthened Immunity':
                    case "Armor: Cloth": case "Armor: Light": case "Armor: Heavy": case "Shields": case "Encumbered Action": case 'Guard': case 'Martial Arts':
                    case "Piercing Attack": case "Weapons: One-Handed Swords": case "Weapons: Two-Handed Swords": case "Weapons: Axes": case "Weapons: Spears":
                    case "Weapons: Maces": case "Weapons: Staves": case "Weapons: Close-Combat": case "Weapons: Throwing Weapons": case "Weapons: Bows":
                    case "Enchance Spells: Power": case 'Spell Expertise: Attack Spells': case 'Spell Expertise: Imbuement Spells':
                    case 'Spell Expertise: Creation Spells': case 'Spell Expertise: Control Spells': case 'Spell Expertise: Healing Spells':
                    case 'Spell Expertise: General Spells': case 'Dungeon Knowledge': case 'Spell Ritual': case 'Magical Talent':
                        this._setSkill('adventurer', skillName, skillValue); break;
                    case 'Alert': case 'Slice Attack':
                        this._setCritRanges(skillName, skillValue); break;
                    case 'Tactical Movement': case 'Parry': case 'Provoke':
                        this._setSkill('adventurer', skillName, skillValue - 1); break;
                    case 'Rampart':
                        this._setSkill('adventurer', skillName, skillValue + 1); break;
                    case "Healing Affinity": case 'Slip Behind': case 'Monster Knowledge': case 'Penetrating Spells':
                        this._setSkill('adventurer', skillName, skillValue * 2); break;
                    case "Defensive":
                        systemData.skills.adventurer[skillName] = this._getDefSkillValue(skillName); break;
                    case "Hardiness":
                        hardinessBonus = this._hardinessSkillCall(skillName); break;
                    case "Binding Attack":
                        this._setSkill('adventurer', skillName, (skillValue + 1) * -1); break;
                    case "Burst of Strength":
                        this._setBoS(skillName, skillValue); break;
                    case "Curved Shot":
                        this._setSkill('adventurer', skillName, skillValue <= 4 ? (skillValue + 1) * -1 : -5); break;
                    case "Dual Wielding":
                        this._setDualWield(skillName, skillValue); break;
                    case "Iron Fist":
                        this._setIronFirst(skillName, skillValue); break;
                    case "Mow Down":
                        this._setMowDown(skillName, skillValue); break;
                    case "Rapid Fire":
                        this._setRapidFire(skillName, skillValue); break;
                    case "Snipe":
                        this._setSnipe(skillName, skillValue); break;
                    case "Strong Blow: Bludgeon": case "Strong Blow: Slash":
                        this._setStrongBlow(skillName, skillValue); break;
                    case "Master of Fire": case "Master of Water": case "Master of Wind": case "Master of Earth": case "Master of Life":
                        this._setCriticals(skillName, skillValue); break;
                    case 'Gorilla Tactics':
                        this._setGorillaTactics(skillName, skillValue); break;
                    case 'Biological Knowledge':
                        this._setBiologicalKnowledge(skillName, skillValue); break;
                    case 'Moving Chant':
                        this._setMovingChant(skillName, skillValue); break;
                    case 'Multiple Chants':
                        this._setMultipleChants(skillName, skillValue); break;
                    case 'Poisoner':
                        this._setPoisoner(skillName, skillValue); break;
                    case 'Shieldsman':
                        this._setShieldsman(skillName, skillValue); break;
                    case 'Passing Through':
                        this._setPassingThrough(skillName, skillValue); break;
                    case "Perseverance":
                        systemData.skills.adventurer[skillName] = skillValue; break;
                    case "Darkvision":
                        this._updateDarkVision(skill, systemData); break;
                    case "Bonus Spells: Words of True Power": case "Bonus Spells: Miracles":case "Bonus Spells: Ancestral Dragon Arts": case "Bonus Spells: Spirit Arts": case "Bonus Spells: Necromancy":
                        this._bonusSpellsKnownSkillCall(skill); break;
                    case "Stealth":
                        if(skillValue >= 3)
                            this._setSkill('adventurer', skillName + 'ToHit', skillValue - 2);
                        this._setSkill('adventurer', skillName, skillValue); break;
                    case "Draconic Heritage": case "Long-Distance Movement": case 'Appraisal': case 'Artisan: Smithing': case 'Artisan: Needlework':
                    case 'Artisan: Carpentry': case 'Artisan: Leatherworking': case 'Artisan: Metal-Carving': case 'Cooking': case 'Craftsmanship':
                    case 'Criminal Knowledge': case 'Etiquette': case 'General Knowledge': case 'Labor': case 'Leadership': case 'Meditate':
                    case 'Negotiate: Persuade': case 'Negotiate: Tempt': case 'Negotiate: Intimidate': case 'No Preconceptions': case 'Perform: Sing':
                    case 'Perform: Play': case 'Perform: Dance': case 'Perform: Street Perform': case 'Perform: Act': case 'Production: Farming': case 'Production: Fishing':
                    case 'Production: Logging': case 'Production: Mining': case 'Research': case 'Riding': case 'Survivalism': case 'Theology': case 'Worship':
                    case 'Cartography': case 'Herbalist': case 'Miner': case 'Taming': case 'Nurse': case 'Torture':
                        this._setSkill('general', skillName, skillValue); break;
                    case 'Beloved of the Fae':
                        this._setBeloved(skillName, skillValue); break;
                    case 'Cool and Collected':
                        this._setCoolAndCollected(skillName, skillValue); break;
                    case 'Fait: Supreme God': case 'Fait: Earth Mother': case 'Fait: Trade God': case 'Fait: God of Knowledge': case 'Fait: Valkyrie':
                    case 'Fait: Ancestral Dragon':
                        this._setFaith(skillName, skillValue); break;
                    case 'Magical Perception':
                        this._setMagicalPerception(skillName, skillValue); break;
                    case 'Sacrament of Forgiveness':
                        this._setSacrament(skillName, skillValue); break;
                    case 'Veil of Darkness':
                        this._setVeil(skillName, skillValue); break;
                    case 'Shell and Claws': case 'Wild Beastman':
                        this._setShellAndClaws(skillName, skillValue); break;
                    case 'Wall Walker':
                        this._setWallWalker(skillName, skillValue); break;
                    case 'Environmental Adaptation':
                        this._setEnvironmentalAdaptation(skillName, skillValue); break;
                    case 'Beast Worship':
                        this._setBeastWorship(skillName, skillValue); break;
                    case "Beast's Eyes":
                        this._setBeastEyes(skillName, skillValue); break;
                    case 'Underwater Aptitude':
                        this.system.skills.general[skillName] = skillValue--;
                    case 'Inject Poison':
                        this._setInjectPoison(skillName, skillValue); break;
                    case 'Horns': case 'Flight':
                        this._setHorns(skillName, skillValue); break;
                    case "Bird's Eyes":
                        this._setBirdsEyes(skillName, skillValue); break;
                    case 'Mucus':
                        this._setMucus(skillName, skillValue); break;
                }
            }
        }

        // Adding HP Value if one doesn't exist
        if(!systemData.lifeForce.value)
            systemData.lifeForce.value = 0;

        // Adding initiative to character with possible bonus
        systemData.init = systemData.skills.adventurer?.Anticipate ? `2d6+${systemData.skills.adventurer.Anticipate}` : `2d6`;

        // Setting Life Force
        systemData.lifeForce.double = systemData.lifeForce.current + hardinessBonus;
        systemData.lifeForce.max = (systemData.lifeForce.current + hardinessBonus) * 2;

        // Setting Spell Use Scores
        // TODO: Add in any spell skills that alter this amount per caster class
        if(!systemData.spellUse.scores.necro)
            systemData.spellUse.scores.necro = 0;
        for(let [id, score] of Object.entries(systemData.spellUse.scores)){
            let calcScore = 0;
            if(id === "sorc"){
                calcScore = systemData.levels.classes.sorcerer + systemData.abilities.calc.if;
            }else if(id === "necro"){
                calcScore = systemData.levels.classes.necro + systemData.abilities.calc.if;
            }else{
                calcScore = systemData.abilities.calc.pf;
                switch(id){
                    case "prie": calcScore += systemData.levels.classes.priest; break;
                    case "dPri": calcScore += systemData.levels.classes.dragon; break;
                    case "sham": calcScore += systemData.levels.classes.shaman; break;
                    default: console.error("Error in Score Spell Use switch statement", score, id); break;
                }
            }
            systemData.spellUse.scores[id] = calcScore;
        }

        // Setting Base Hit Scores
        for(let [typeId, hitScore] of Object.entries(systemData.attacks.totals)){
            // Ensure systemData.attacks.totals[typeId] is an object
            if(typeof systemData.attacks.totals[typeId] !== 'object'){
                systemData.attacks.totals[typeId] = {}; // Initialized as an empty object
            }
            // Getting Technique Focus score for all martial classes to hit with weapons
            let techFocus = systemData.abilities.calc.tf;

            // Cycling through classes to get levels and modify scores with skills
            for(let [classId, level] of Object.entries(systemData.levels.classes)){
                let calcScore = 0;

                if(typeId === 'melee' && (classId === 'fighter' || classId === 'monk' || classId === 'scout')){
                    calcScore = techFocus + level; // Add skill bonuses here
                }else if(typeId === 'throw' && (classId === 'monk' || classId === 'ranger' || classId === 'scout')){
                    calcScore = techFocus + level; // Add skill bonuses here
                }else if(typeId === 'projectile' && classId === 'ranger'){
                    calcScore = techFocus + level; // Add skill bonuses here
                }else{
                    continue; // Skipping unneeded classes
                }

                // Assigning the calculated score to the object
                systemData.attacks.totals[typeId][classId] = calcScore;
            }
        }

        // Setting Dodge Scores
        if(typeof systemData.defense.dodge.mods !== 'object'){
            systemData.defense.dodge.mods = {};
        }
        let techReflex = systemData.abilities.calc.tr;
        for(let [classId, level] of Object.entries(systemData.levels.classes)){
            let calcScore = 0;

            if(classId === 'fighter' || classId === 'monk' || classId === 'scout'){
                calcScore = techReflex + level;
            }else{
                continue; // Skipping unneeded classes
            }

            systemData.defense.dodge.mods[classId] = calcScore;
            systemData.defense.block.mods[classId] = calcScore;
        }

        // Setting Modified Movement
        // Skill Long-Distance movement is affecting modfiers above
        let movePen = systemData.move;
        const armor = actorData.items.find(i => i.type === 'armor');
        if(armor){
            if(armor.system.heavy.value && (this.system.abilities.calc.se + this._getSkillBonus('Encumbered Action')) >= armor.system.heavy.y){
                movePen += Math.floor(parseInt(armor.system.move, 10) / 2);
            }else
                movePen += parseInt(armor.system.move, 10);
        }
        const items = actorData.items.filter(i => i.type === 'item');
        if(items)
            for(let i of items)
                movePen += i.system.movePen;
        systemData.modMove += movePen;

    }

    _setSkill(skillType, skillName, skillValue){
        if(skillType === 'general')
            if (skillValue === 3)
                skillName === 'Draconic Heritage' ? skillValue + 0 : skillValue++;
        this.system.skills[skillType][skillName] = skillValue;
    }

    /**
     * Used to add player skills to respective locations in their sheet and rolls
     * @param {string} skillName Name of the skill to search for
     * @returns Int value of skill level
     */
    _getSkillBonus(skillName){
        const skill = this.items.find(i => i.name.toLowerCase() === skillName.toLowerCase());
        if(skill)
            return parseInt(skill.system.value, 10);
        else return 0;
    }

    _setCritRanges(skillName, skillValue){
        const adventurerSkills = this.system.skills.adventurer;
        let successScore = 9;
        let failureScore = 3;
        if (skillValue === 1 || skillValue === 2) {
            successScore = 11;
            failureScore = skillValue === 1 ? 5 : 4;
        } else if (skillValue === 3 || skillValue === 4) {
            successScore = 10;
            failureScore = skillValue === 3 ? 4 : 3;
        }
        adventurerSkills[skillName] = { success: successScore, failure: failureScore };
    }

    _setBoS(skillName, skillValue){
        const adventurerSkills = this.system.skills.adventurer;
        let bonus = skillValue;
        let fatigueBonus = 1;
        if (skillValue > 2) {
            bonus = skillValue === 3 ? '1d3' : '1d6';
            if (skillValue <= 4)
                fatigueBonus = 2;
        }
        adventurerSkills[skillName] = { bonus, fatigueBonus };
    }

    _setDualWield(skillName, skillValue){
        const adventurerSkills = this.system.skills.adventurer;
        let skillConfig = { single: -2, double: -4 };
        const skillMapping = {
            1: { single: -4, double: 0 },
            2: { single: -4, double: -6 },
            3: { single: -3, double: -6 },
            4: { single: -3, double: -5 }
        };
        if (skillMapping[skillValue]) {
            skillConfig = skillMapping[skillValue];
        }
        adventurerSkills[skillName] = skillConfig;
    }

    _setIronFirst(skillName, skillValue){
        const adventurerSkills = this.system.skills.adventurer;
        const adjustedValue = skillValue <= 2 ? skillValue : skillValue + (skillValue - 2);
        adventurerSkills[skillName] = adjustedValue;
    }

    _setMowDown(skillName, skillValue){
        const adventurerSkills = this.system.skills.adventurer;
        let skillConfig = { penalty: -4, addPenalty: -1, targets: 5};
        const skillMapping = {
            1: { penalty: -4, addPenalty: 0, targets: 2 },
            2: { penalty: -4, addPenalty: -2, targets: 3 },
            3: { penalty: -4, addPenalty: -2, targets: 4 },
            4: { penalty: -4, addPenalty: -2, targets: 5 }
        };
        if (skillMapping[skillValue]) {
            skillConfig = skillMapping[skillValue];
        }
        adventurerSkills[skillName] = skillConfig;
    }

    _setRapidFire(skillName, skillValue){
        const adventurerSkills = this.system.skills.adventurer;
        let skillConfig = { numOfAttacks: 3, numOfTargets: 3, mainTargets: -0.5, altTargets: -0.5 }
        const skillMapping = {
            1: { numOfAttacks: 2, numOfTargets: 1, mainTargets: -1, altTargets: -1 },
            2: { numOfAttacks: 2, numOfTargets: 2, mainTargets: -1, altTargets: -1 },
            3: { numOfAttacks: 2, numOfTargets: 2, mainTargets: -0.5, altTargets: -1 },
            4: { numOfAttacks: 2, numOfTargets: 2, mainTargets: -0.5, altTargets: -0.5 }
        }
        if(skillMapping[skillValue])
            skillConfig = skillMapping[skillValue];
        adventurerSkills[skillName] = skillConfig;
    }

    _setSnipe(skillName, skillValue){
        const adventurerSkills = this.system.skills.adventurer;
        let skillConfig = { hitPower: 12, range: 2, crit: 10 };
        const skillMapping = {
            1: { hitPower: 4, range: 1, crit: 12 },
            2: { hitPower: 6, range: 1.5, crit: 12 },
            3: { hitPower: 8, range: 1.5, crit: 11 },
            4: { hitPower: 10, range: 2, crit: 11 }
        }
        if(skillMapping[skillValue])
            skillConfig = skillMapping[skillValue];
        adventurerSkills[skillName] = skillConfig;
    }

    _setStrongBlow(skillName, skillValue){
        const adventurerSkills = this.system.skills.adventurer;
        let str = this.system.abilities.primary.str;
        if(skillValue === 1)
            str = Math.round(str * 0.25);
        else if(skillValue === 2)
            str = Math.round(str * 0.5);
        else if(skillValue === 3)
            str = Math.round(str * 1);
        else if(skillValue === 4)
            str = Math.round(str * 1.5);
        else if(skillValue === 5)
            str = Math.round(str * 2);
        adventurerSkills[skillName] = str;
    }

    _setCriticals(skillName, skillValue){
        const adventurerSkills = this.system.skills.adventurer;
        const bonuses = { critical: 9, dmgRecover: 4 };
        if(skillValue <=2)
            bonuses = { critical: 11, dmgRecover: skillValue === 1 ? 0 : 1 };
        else if(skillValue <= 4)
            bonuses = { critical: 10, dmgRecover: skillValue === 3 ? 2 : 3 };
        adventurerSkills[skillName] = bonuses;
    }

    _setBeloved(skillName, skillValue){
        const adventurerSkills = this.system.skills.general;
        adventurerSkills[skillName] = skillValue - 1;
    }

    _setCoolAndCollected(skillName, skillValue){
        const adventurerSkills = this.system.skills.general;
        let skillConfig = { bonus: 4, mentalResist: 2 };
        const skillMapping = {
            1: { bonus: 1, mentalResist: 0 },
            2: { bonus: 2, mentalResist: 1 }
        }
        if(skillMapping[skillValue])
            skillConfig = skillMapping[skillValue];
        adventurerSkills[skillName] = skillConfig;
    }

    _setFaith(skillName, skillValue){
        const adventurerSkills = this.system.skills.general;
        if(skillValue === 1)
            adventurerSkills[skillName] = -4;
        else if(skillValue === 2)
            adventurerSkills[skillName] = -2;
        else
            adventurerSkills[skillName] = 0;
    }

    _setMagicalPerception(skillName, skillValue){
        const adventurerSkills = this.system.skills.general;
        if(skillValue === 1)
            skillValue = 30;
        else if(skillValue === 2)
            skillValue = 60;
        else
            skillValue = 120;
        adventurerSkills[skillName] = skillValue;
    }

    _setSacrament(skillName, skillValue){
        const adventurerSkills = this.system.skills.general;
        let skillConfig = { bonus: 2, general: 3 };
        const skillMapping = {
            1: { bonus: 0, general: 1 },
            2: { bonus: 1, general: 2 }
        }
        if(skillMapping[skillValue])
            skillConfig = skillMapping[skillValue];
        adventurerSkills[skillName] = skillConfig;
    }

    _setVeil(skillName, skillValue){
        const adventurerSkills = this.system.skills.general;
        let skillConfig = { bonus: 3, spellResist: 2 };
        const skillMapping = {
            1: { bonus: 1, spellResist: 0 },
            2: { bonus: 2, spellResist: 1 }
        }
        if(skillMapping[skillValue])
            skillConfig = skillMapping[skillValue];
        adventurerSkills[skillName] = skillConfig;
    }

    _setShellAndClaws(skillName, skillValue){
        const adventurerSkills = this.system.skills.general;
        adventurerSkills[skillName] = { armor: skillValue, unarmed: skillValue };
    }

    _setWallWalker(skillName, skillValue){
        const adventurerSkills = this.system.skills.general;
        const movement = this.system.modMove;
        if(skillValue === 1)
            skillValue = Math.round(movement * 0.25);
        else if(skillValue === 2)
            skillValue = Math.round(movement * 0.5);
        else
            skillValue = movement;
        adventurerSkills[skillName] = skillValue;
    }

    _setEnvironmentalAdaptation(skillName, skillValue){
        const adventurerSkills = this.system.skills.general;
        let skillConfig = { main: 4, other: -1 };
        const skillMapping = {
            1: { main: 2, other: -2 },
            2: { main: 3, other: -2 }
        }
        if(skillMapping[skillValue])
            skillConfig = skillMapping[skillValue];
        adventurerSkills[skillName] = skillConfig;
    }

    _setBeastWorship(skillName, skillValue){
        const adventurerSkills = this.system.skills.general;
        if(skillValue === 3)
            skillValue++;
        adventurerSkills[skillName] = skillValue * -1;
    }

    _setBeastEyes(skillName, skillValue){
        const adventurerSkills = this.system.skills.general;
        if(skillValue === 1)
            skillValue = 10;
        else if(skillValue === 2)
            skillValue = 30;
        else
            skillValue = 60;
        adventurerSkills[skillName] = skillValue;
    }

    _setInjectPoison(skillName, skillValue){
        const adventurerSkills = this.system.skills.general;
        let skillConfig = { deadly: '1d6+3', paralysis: { dmg: '1d6', penalty: -2 } };
        const skillMapping = {
            1: { deadly: '1d3', paralysis: '1d3' },
            2: { deadly: '1d3+3', paralysis: { dmg: '1d3', penalty: -1 } }
        }
        if(skillMapping[skillValue])
            skillConfig = skillMapping[skillValue];
        adventurerSkills[skillName] = skillConfig;
    }

    _setHorns(skillName, skillValue){
        const adventurerSkills = this.system.skills.general;
        adventurerSkills[skillName] = (skillValue * 2) - 2;
    }

    _setBirdsEyes(skillName, skillValue){
        const adventurerSkills = this.system.skills.general;
        let skillConfig = { bonus: 4, visiblity: -4 };
        const skillMapping = {
            1: { bonus: 1, visiblity: 0 },
            2: { bonus: 2, visiblity: -2 }
        }
        if(skillMapping[skillValue])
            skillConfig = skillMapping[skillValue];
        adventurerSkills[skillName] = skillConfig;
    }

    _setMucus(skillName, skillValue){
        const adventurerSkills = this.system.skills.general;
        let skillConfig = { bonus: -3, rounds: 6 };
        const skillMapping = {
            1: { bonus: 0, rounds: 3 },
            2: { bonus: -2, rounds: 3 }
        }
        if(skillMapping[skillValue])
            skillConfig = skillMapping[skillValue];
        adventurerSkills[skillName] = skillConfig;
    }

    _setGorillaTactics(skillName, skillValue){
        const adventurerSkills = this.system.skills.adventurer;
        const str = this.system.abilities.primary.str;
        let skillConfig = { str: str * 1, bonus: 4 };
        const skillMapping = {
            1: { str: Math.round(str * 0.25), bonus: 0 },
            2: { str: Math.round(str * 0.5), bonus: 0 },
            3: { str: Math.round(str * 0.5), bonus: 1 },
            4: { str: str * 1, bonus: 3 }
        }
        if(skillMapping[skillValue])
            skillConfig = skillMapping[skillValue];
        adventurerSkills[skillName] = skillConfig;
    }

    _setBiologicalKnowledge(skillName, skillValue){
        const adventurerSkills = this.system.skills.adventurer;
        let skillConfig = { checks: 5, bonus: 5 };
        const skillMapping = {
            1: { checks: 1, bonus: 0 },
            2: { checks: 2, bonus: 1 },
            3: { checks: 3, bonus: 2 },
            4: { checks: 4, bonus: 3 }
        }
        if(skillMapping[skillValue])
            skillConfig = skillMapping[skillValue];
        adventurerSkills[skillName] = skillConfig;
    }

    _setMovingChant(skillName, skillValue){
        const adventurerSkills = this.system.skills.adventurer;
        if(skillValue <= 3)
            skillValue++;
        else if(skillValue === 4)
            skillValue + 2;
        else
            skillValue = 10;
        adventurerSkills[skillName] = skillValue;
    }

    _setMultipleChants(skillName, skillValue){
        const adventurerSkills = this.system.skills.adventurer;
        let skillConfig = { numOfSpells: 2, threeSpells: -4, twoSpells: 0 };
        const skillMapping = {
            1: { numOfSpells: 2, threeSpells: 0, twoSpells: -8 },
            2: { numOfSpells: 2, threeSpells: 0, twoSpells: -4 },
            3: { numOfSpells: 3, threeSpells: -4, twoSpells: -4 },
            4: { numOfSpells: 3, threeSpells: -4, twoSpells: -2 }
        }
        if(skillMapping[skillValue])
            skillConfig = skillMapping[skillValue];
        adventurerSkills[skillName] = skillConfig;
    }

    _setPoisoner(skillName, skillValue){
        const adventurerSkills = this.system.skills.adventurer;
        if(skillValue > 2)
            skillValue = (skillValue - 1) * 2;
        adventurerSkills[skillName] = skillValue;
    }

    _setShieldsman(skillName, skillValue){
        const adventurerSkills = this.system.skills.adventurer;
        let skillConfig = { critBlock: 9, bonusRange: 6, bonusBlock: 3 };
        const skillMapping = {
            1: { critBlock: 11, bonusRange: 13, bonusBlock: 2 },
            2: { critBlock: 11, bonusRange: 9, bonusBlock: 2 },
            3: { critBlock: 10, bonusRange: 8, bonusBlock: 2 },
            4: { critBlock: 10, bonusRange: 7, bonusBlock: 2 }
        }
        if(skillMapping[skillValue])
            skillConfig = skillMapping[skillValue];
        adventurerSkills[skillName] = skillConfig;
    }

    _setPassingThrough(skillName, skillValue){
        const adventurerSkills = this.system.skills.adventurer;
        let skillConfig = { bonus: 6, bonusToOthers: 4 };
        const skillMapping = {
            1: { bonus: 2, bonusToOthers: 0 },
            2: { bonus: 3, bonusToOthers: 0 },
            3: { bonus: 4, bonusToOthers: 0 },
            4: { bonus: 5, bonusToOthers: 3 }
        }
        if(skillMapping[skillValue])
            skillConfig = skillMapping[skillValue];
        adventurerSkills[skillName] = skillConfig;
    }

    /**
     * Simple string to return the skill value the character has for the Defensive Skill to be saved.
     * @param {string} skillName The Defensive skill name string
     * @returns 1d3/6(+1 or 2)
     */
    _getDefSkillValue(skillName){
        let defSkillValue = this._getSkillBonus(skillName);
        switch(defSkillValue){
            case 1: defSkillValue = '1d3'; break;
            case 2: defSkillValue = '1d3+1'; break;
            case 3: defSkillValue = '1d6'; break;
            case 4: defSkillValue = '1d6+1'; break;
            case 5: defSkillValue = '1d6+2'; break;
        }
        return defSkillValue;
    }

    /**
     * Update character with Hardiness Skill
     * @param {string} skillName Name of the skill to find
     * @returns Int value returned based on skill value and amount from book, 5 being a special case
     */
    _hardinessSkillCall(skillName){
        let skillBonus = this._getSkillBonus(skillName);
        if(skillBonus <= 4) skillBonus *= 5;
        else if(skillBonus = 5) skillBonus = 30;
        return skillBonus;
    }

    /**
     * Simple method to save the armor bonus applied to armor, shields, or from Lizardman ancestry.
     * @param {string} type Either armor, shield, lizardman
     * @param {JSON} systemData The character JSON object to manipulate data
     * @param {*} type Either "Armor: Cloth/Light/Heavy" and only used with armor skill search
     */
    _armorSkillCall(type, systemData, armorType = ""){
        if(type === 'armor'){
            const armorStyle = armorType.split(": ");
            systemData.skills.adventurer = { ...systemData.skills.adventurer, [`armor${armorStyle[1]}`]: this._getSkillBonus(armorType) };
        }else if(type === 'shield')
            systemData.skills.adventurer = { ...systemData.skills.adventurer, shieldAC: this._getSkillBonus('Shields') };
        else if(type === 'lizardman')
            systemData.skills.general = { ...systemData.skills.general, lizardman: this._getSkillBonus('Draconic Heritage') };
    }

    /**
     * Updates the amount of spells know for a given school of spell casting.
     * @param {string} skill Determines which casting school to update for: "Words of True Power", "Ancestral Dragon", "Miracles", "Spirit Arts"
     */
    _bonusSpellsKnownSkillCall(skill){
        const skillValue = skill.system.value;
        const spellDomain = skill.name.split(": ")[1];
        switch(spellDomain.toLowerCase()){
            case "sorcerer":
            case "words of true power":
            case "words":
            case "true power":
                this.system.spellUse.totalSpellsKnown.sorc += skillValue;
                break;
            case "priest":
            case "miracles":
            case "miracle":
                this.system.spellUse.totalSpellsKnown.prie += skillValue;
                break;
            case "dragon priest":
            case "ancestral dragon arts":
            case "dragon arts":
                this.system.spellUse.totalSpellsKnown.dPri += skillValue;
                break;
            case "shaman":
            case "spirit":
            case "spirit arts":
                this.system.spellUse.totalSpellsKnown.sham += skillValue;
                break;
            case "necro":
            case "necromancy":
            case "necromancer":
                this.system.spellUse.totalSpellsKnown.necro += skillValue;
        }
    }

    /**
     * A simple method to update the darkvision range of the character from the skill rank to the actor's general skill location.
     * Other calulations for this are done in the GSActorSheet prepareCharacterData(...) function.
     * @param {JSON} skill JSON object of the skill with all associated data
     * @param {JSON} actorData The object data of the currect actor to update information too
     */
    _updateDarkVision(skill, systemData){
        let skillValue = skill.system.value;
        switch(skillValue){
            case 1: skillValue = 60; break;
            case 2: skillValue = 120; break;
            case 3: skillValue = 600; break;
            default: skillValue = 0;
        }
        systemData.skills.general[skill.name] = skillValue;
    }

    _prepareMonsterData(actorData){
        if(actorData.type !== 'monster') return;

        // try{
        //     if(!actorData.system.lifeForce.value)
        //         actorData.system.lifeForce.value = actorData.system.lifeForce.min;
        // }catch(err){
        //     console.error("GS _prepareMonsterData |", err);
        // }
    }
}
