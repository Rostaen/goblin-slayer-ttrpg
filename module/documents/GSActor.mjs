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

    // Used to add player skills to respective locations in their sheet and rolls
    _getSkillBonus(skillName){
        const skill = this.items.filter(item => item.name.toLowerCase() === skillName.toLowerCase());
        //console.log("What skill am I looking at?", skill);
        if(skill.length){
            return parseInt(skill[0].system.value, 10);
        } else return 0;
    }

    // Update character with Hardiness Skill
    _hardinessSkillCall(){
        // TODO: Update charater sheet for entered HP and a new life force disabled to reflect skill bonus;
        let skillBonus = this._getSkillBonus("Hardiness");
        if(skillBonus <= 4) skillBonus *= 5;
        else if(skillBonus = 5) skillBonus = 30;
        return skillBonus;
    }

    // Update character fatigue with EX checkboxes
    _perserveranceSkillCall(systemData){
        let perseverance = this._getSkillBonus("Perseverance");
        for(let rank = 1; rank <= perseverance; rank++){
            systemData.fatigue[`rank${rank}`].ex = 1; // allowing an extra fatigue point
            systemData.fatigue[`rank${rank}`].max += 1; // updating max fatigue +1
        }
    }

    // Function to initialize original ability scores if not already set for Fatigue changes
    async _initOriginalAbilities(){
        const originalPrimary = this.getFlag('gs', 'originalPrimaryAbilities');
        const originalSecondary = this.getFlag('gs', 'originalSecondaryAbilities');

        if(!originalPrimary || !originalSecondary){
            console.log(">>> Checking this 1", this);
            await this.setFlag('gs', 'originalPrimaryAbilities', duplicate(this.system.abilities.primary));
            await this.setFlag('gs', 'originalSecondaryAbilities', duplicate(this.system.abilities.secondary));
            console.log(">>> Checking this 2", this);
        }
    }

    // Apply or revert fatigue modifiers
    async applyFatigueModifiers(apply){
        const originalPrimary = this.getFlag('gs', 'originalPrimaryAbilities');
        const originalSecondary = this.getFlag('gs', 'originalSecondaryAbilities');
        const systemData = this.system;

        for (const id in systemData.abilities.primary) {
            apply ? systemData.abilities.primary[id] -= 1 : systemData.abilities.primary[id] = originalPrimary[id];
        }
        for (const id in systemData.abilities.secondary) {
            apply ? systemData.abilities.secondary[id] -= 1 : systemData.abilities.secondary[id] = originalSecondary[id];
        }

        await this.update({
            'system.abilities.primary': systemData.abilities.primary,
            'system.abilities.secondary': systemData.abilities.secondary
        });
    }

    // Handle fatigue logic
    async handleFatigue(){
        await this._initOriginalAbilities();

        const systemData = this.system;

        // Checking Fatigue scores
        const rank1 = systemData.fatigue.rank1;
        const rank2 = systemData.fatigue.rank2;
        const rank3 = systemData.fatigue.rank3;
        const rank4 = systemData.fatigue.rank4;
        const rank5 = systemData.fatigue.rank5;

        // Update the fatigue min values based on marked properties
        const updateFatigueMin = (rank, count) => {
            for (let i = 1; i <= count; i++) {
                if (rank.marked[i]) rank.min += 1;
            }
        };

        updateFatigueMin(rank1, 6);
        updateFatigueMin(rank2, 5);
        updateFatigueMin(rank3, 4);
        updateFatigueMin(rank4, 3);
        updateFatigueMin(rank5, 2);

        // Check for rank1 fatigue and apply or revert modifiers
        if (rank1.min >= rank1.max) {
            await this.applyFatigueModifiers(true); // Apply modifiers
        } else if (rank1.min < rank1.max) {
            await this.applyFatigueModifiers(false); // Revert modifiers if previously applied
        }
    }

    async _prepareCharacterData(actorData){
        const systemData = actorData.system;
        const type = actorData.type;
        let hardinessBonus = 0;

        if(type !== 'character') return;

        // Getting character skills
        const actorSkills = this.items.filter(item => item.type === 'skill');
        for(const [id, skill] of Object.entries(actorSkills)){
            // Switching on skills to save processing time
            // console.log("===> For Loop Skill Check", skill);
            switch(skill.name){
                case "Hardiness": // Setting 2x LifeForce + any Skills
                    hardinessBonus = this._hardinessSkillCall(); break;
                case "Perseverance": // Setting EX Fatigue
                    this._perserveranceSkillCall(systemData); break;
            }
        }

        // Setting Life Force
        systemData.lifeForce.double = systemData.lifeForce.current + hardinessBonus;
        systemData.lifeForce.max = (systemData.lifeForce.current + hardinessBonus) * 2;

        // Setting Character Spell Resistance
        systemData.spellRes = systemData.levels.adventurer + systemData.abilities.calc.pr + this._getSkillBonus("Spell Resistance");

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
        // TODO: Add in skill modifiers
        let movePen = systemData.move;
        const armor = actorData.items.filter(item => item.type === 'armor');
        if(armor.length){
            movePen += parseInt(armor[0].system.move, 10);
        }
        systemData.modMove = movePen;

        // Checking Fatigue scores
        //await this.handleFatigue();

        // Setting up character calculated ability scores
        for(const [keyP, scoreP] of Object.entries(systemData.abilities.primary)){
            for(const [keyS, scoreS] of Object.entries(systemData.abilities.secondary)){
                const calcString = keyP.substring(0,1) + keyS.substring(0,1);
                const calcScore = scoreP + scoreS;
                systemData.abilities.calc[calcString] = calcScore;
            }
        }

    }

    _prepareMonsterData(actorData){
        if(actorData.type !== 'monster') return;

    }
}
