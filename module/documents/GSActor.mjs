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
        systemData.spellRes = systemData.levels.adventurer + systemData.abilities.calc.pr + this._getSkillBonus("Spell Resistance");

        // Getting character skills
        for(const [_, skill] of Object.entries(actorSkills)){
            //console.log("===> For Loop Skill Check", skill.name);
            const skillValue = skill.system.value;
            switch(skill.name){
                case "Anticipate": case "First Aid": case "Handiwork": case "Lucky": case "Observe": case "Sixth Sense": case 'Strengthened Immunity':
                case "Armor: Cloth": case "Armor: Light": case "Armor: Heavy": case "Shields": case "Encumbered Action": case 'Guard': case 'Martial Arts':
                case "Piercing Attack": case "Weapons: One-Handed Swords": case "Weapons: Two-Handed Swords": case "Weapons: Axes": case "Weapons: Spears":
                case "Weapons: Maces": case "Weapons: Staves": case "Weapons: Close-Combat": case "Weapons: Throwing Weapons": case "Weapons: Bows":
                case "Enchance Spells: Power": case 'Spell Expertise: Attack Spells': case 'Spell Expertise: Imbuement Spells':
                case 'Spell Expertise: Creation Spells': case 'Spell Expertise: Control Spells': case 'Spell Expertise: Healing Spells':
                case 'Spell Expertise: General Spells':
                    this._setSkill('adventurer', skill.name, skillValue); break;
                case 'Alert': case 'Slice Attack':
                    this._setCritRanges(skill, skillValue); break;
                case 'Tactical Movement': case 'Parry': case 'Provoke':
                    this._setSkill('adventurer', skill.name, skillValue - 1); break;
                case 'Rampart':
                    this._setSkill('adventurer', skill.name, skillValue + 1); break;
                case "Healing Affinity": case 'Slip Behind': case 'Monster Knowledge':
                    this._setSkill('adventurer', skill.name, skillValue * 2); break;
                case "Defensive":
                    systemData.skills.adventurer = { ...systemData.skills.adventurer, defensive: this._getDefSkillValue(skill.name) }; break;
                case "Hardiness":
                    hardinessBonus = this._hardinessSkillCall(skill.name); break;
                case "Binding Attack":
                    this._setSkill('adventurer', skill.name, (skillValue + 1) * -1); break;
                case "Burst of Strength":
                    this._setBoS(skill, skillValue); break;
                case "Curved Shot":
                    this._setSkill('adventurer', skill.name, skillValue <= 4 ? (skillValue + 1) * -1 : -5); break;
                case "Dual Wielding":
                    this._setDualWield(skill, skillValue); break;
                case "Iron Fist":
                    this._setIronFirst(skill, skillValue); break;
                case "Mow Down":
                    this._setMowDown(skill, skillValue); break;
                case "Rapid Fire":
                    this._setRapidFire(skill, skillValue); break;
                case "Snipe":
                    this._setSnipe(skill, skillValue); break;
                case "Strong Blow: Bludgeon": case "Strong Blow: Slash":
                    this._setStrongBlow(skill, skillValue); break;
                case "Master of Fire": case "Master of Water": case "Master of Wind": case "Master of Earth": case "Master of Life":
                    this._setCriticals(skill, skillValue); break;
                case "Perseverance":
                    this._perserveranceSkillCall(systemData); break;
                case "Darkvision":
                    this._updateDarkVision(skill, systemData); break;
                case "Bonus Spells: Words of True Power": case "Bonus Spells: Miracles":case "Bonus Spells: Ancestral Dragon Arts": case "Bonus Spells: Spirit Arts": case "Bonus Spells: Necromancy":
                    this._bonusSpellsKnownSkillCall(skill); break;
                case "Magical Talent":
                    this.system.spellUse.max += skillValue; break;
                case "Stealth":
                    if(skillValue >= 3)
                        this._setSkill('adventurer', skill.name + 'ToHit', skillValue - 2);
                    this._setSkill('adventurer', skill.name, skillValue); break;
                case "Draconic Heritage": case "Long-Distance Movement": case 'Appraisal': case 'Artisan: Smithing': case 'Artisan: Needlework':
                case 'Artisan: Carpentry': case 'Artisan: Leatherworking': case 'Artisan: Metal-Carving': case 'Cooking': case 'Craftsmanship':
                case 'Criminal Knowledge': case 'Etiquette':
                    this._setSkill('general', skill.name, skillValue); break;
                case 'Beloved of the Fae':
                    this._setBeloved(skill, skillValue);
                case 'Cool and Collected':
                    this._setCoolAndCollected(skill, skillValue);
            }
        }

        // Adding HP Value if one doesn't exist
        if(!systemData.lifeForce.value)
            systemData.lifeForce.value = 0;

        // Adding initiative to character with possible bonus
        systemData.init = systemData.skills.adventurer?.anticipate ? `2d6+${systemData.skills.adventurer.anticipate}` : `2d6`;

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

    _setSkill(skillType, skillName, value){
        if(skillType === 'general')
            if (value === 3)
                skillName === 'Draconic Heritage' ? value + 0 : value++;
        this.system.skills[skillType][skillName] = value;
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

    _setCritRanges(skill, skillValue){
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
        adventurerSkills[skill.name] = { success: successScore, failure: failureScore };
    }

    _setBoS(skill, skillValue){
        const adventurerSkills = this.system.skills.adventurer;
        let bonus = skillValue;
        let fatigueBonus = 1;
        if (skillValue > 2) {
            bonus = skillValue === 3 ? '1d3' : '1d6';
            if (skillValue <= 4)
                fatigueBonus = 2;
        }
        adventurerSkills[skill.name] = { bonus, fatigueBonus };
    }

    _setDualWield(skill, skillValue){
        const adventurerSkills = this.system.skills.adventurer;
        let skillConfig = { single: -2, double: -4 };
        if (skillValue === 1) {
            skillConfig = { single: -4, double: 0 };
        } else if (skillValue === 2) {
            skillConfig = { single: -4, double: -6 };
        } else if (skillValue === 3) {
            skillConfig = { single: -3, double: -6 };
        } else if (skillValue === 4) {
            skillConfig = { single: -3, double: -5 };
        }
        adventurerSkills[skill.name] = skillConfig;
    }

    _setIronFirst(skill, skillValue){
        const adventurerSkills = this.system.skills.adventurer;
        const adjustedValue = skillValue <= 2 ? skillValue : skillValue + (skillValue - 2);
        adventurerSkills[skill.name] = adjustedValue;
    }

    _setMowDown(skill, skillValue){
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
        adventurerSkills[skill.name] = skillConfig;
    }

    _setRapidFire(skill, skillValue){
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
        adventurerSkills[skill.name] = skillConfig;
    }

    _setSnipe(skill, skillValue){
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
        adventurerSkills[skill.name] = skillConfig;
    }

    _setStrongBlow(skill, skillValue){
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
        adventurerSkills[skill.name] = str;
    }

    _setCriticals(skill, skillValue){
        const adventurerSkills = this.system.skills.adventurer;
        const bonuses = { critical: 9, dmgRecover: 4 };
        if(skillValue <=2)
            bonuses = { critical: 11, dmgRecover: skillValue === 1 ? 0 : 1 };
        else if(skillValue <= 4)
            bonuses = { critical: 10, dmgRecover: skillValue === 3 ? 2 : 3 };
        adventurerSkills[skill.name] = bonuses;
    }

    _setBeloved(skill, skillValue){
        const adventurerSkills = this.system.skills.adventurer;
        adventurerSkills[skill.name] = skillValue - 1;
    }

    _setCoolAndCollected(skill, skillValue){
        const adventurerSkills = this.system.skills.adventurer;
        let skillConfig = { bonus: 4, mentalResist: 2 };
        const skillMapping = {
            1: { bonus: 1, mentalResist: 0 },
            2: { bonus: 2, mentalResist: 1 }
        }
        if(skillMapping[skillValue])
            skillConfig = skillMapping[skillValue];
        adventurerSkills[skill.name] = skillConfig;
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
     * Update character fatigue with EX checkboxes
     * The method updates the skill value of the Perseverance skill and gives the character more fatigue to work with before exiting the game world.
     * @param {JSON} systemData JSON object of the current actor set to this.actor.system
     */
    _perserveranceSkillCall(systemData){
        let skillValue = this._getSkillBonus("Perseverance");
        systemData.skills.adventurer = { perseverance: skillValue };
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
        systemData.skills.general = { ...systemData.skills.general, darkVision: skillValue };
    }

    _prepareMonsterData(actorData){
        if(actorData.type !== 'monster') return;

        try{
            if(!actorData.system.lifeForce.value)
                actorData.system.lifeForce.value = actorData.system.lifeForce.min;
        }catch(err){
            console.error("GS _prepareMonsterData |", err);
        }
    }
}
