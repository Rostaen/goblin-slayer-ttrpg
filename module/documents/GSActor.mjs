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
            "sham": systemData.levels.classes.shaman
        };

        // Setting Character Spell Resistance
        systemData.spellRes = systemData.levels.adventurer + systemData.abilities.calc.pr + this._getSkillBonus("Spell Resistance");

        // Getting character skills
        for(const [id, skill] of Object.entries(actorSkills)){
            // Switching on skills to save processing time
            //console.log("===> For Loop Skill Check", skill.name);
            switch(skill.name){
                case "Anticipate":
                    systemData.skills.adventurer = { ...systemData.skills.adventurer, anticipate: skill.system.value }; break;
                case "Hardiness": // Setting 2x LifeForce + any Skills
                    hardinessBonus = this._hardinessSkillCall(skill.name); break;
                case "Perseverance": // Setting EX Fatigue
                    this._perserveranceSkillCall(systemData); break;
                case "Armor: Cloth":
                case "Armor: Light":
                case "Armor: Heavy":
                    this._armorSkillCall("armor", systemData, skill.name); break;
                case "Shields":
                    this._armorSkillCall("shield", systemData); break;
                case "Draconic Heritage":
                    this._armorSkillCall("lizardman", systemData); break;
                case "Darkvision":
                    this._updateDarkVision(skill, systemData); break;
                case "Bonus Spells: Words of True Power":
                case "Bonus Spells: Miracles":
                case "Bonus Spells: Ancestral Dragon Arts":
                case "Bonus Spells: Spirit Arts":
                    this._bonusSpellsKnownSkillCall(skill); break;
                case "Magical Talent":
                    this.system.spellUse.max += skill.system.value; break;
                case "Long-Distance Movement":
                    let moveBonus = 0;
                    if(skill.system.value === 2)
                        moveBonus += 2;
                    else if(skill.system.value === 3)
                        moveBonus += 4;
                    systemData.modMove += moveBonus;
                    break;
            }
        }

        // Adding initiative to character with possible bonus
        systemData.init = systemData.skills.adventurer?.anticipate ? `2d6+${systemData.skills.adventurer.anticipate}` : `2d6`;

        // Setting Life Force
        systemData.lifeForce.double = systemData.lifeForce.current + hardinessBonus;
        systemData.lifeForce.max = (systemData.lifeForce.current + hardinessBonus) * 2;

        // Setting Spell Use Scores
        // TODO: Add in any spell skills that alter this amount per caster class
        for(let [id, score] of Object.entries(systemData.spellUse.scores)){
            let calcScore = 0;
            if(id === "sorc"){
                calcScore = systemData.levels.classes.sorcerer + systemData.abilities.calc.if;
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
        const armor = actorData.items.find(item => item.type === 'armor');
        if(armor){
            if(armor.system.heavy.value && (this.system.abilities.calc.se + this._getSkillBonus('Encumbered Action')) >= armor.system.heavy.y){
                movePen += Math.floor(parseInt(armor.system.move, 10) / 2);
            }else
                movePen += parseInt(armor.system.move, 10);
        }
        systemData.modMove += movePen;

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

    }
}
