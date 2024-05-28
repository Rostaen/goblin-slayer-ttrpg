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

    _checkFlags() {
        const flags = this.flags.gs;
        if (!flags) return;
        console.log("Check Flags", flags);

        if (flags.reduceAbilityScores) {

        }
        if (flags.revertAbilityScores) {

        }
    }

    // Apply or revert fatigue modifiers
    _applyAbilityScoreFatigueMods(apply, rank) {
        const systemData = this.system;

        switch(rank){
            case "rank1":
                for (const id in systemData.abilities.primary)
                    apply ? systemData.abilities.primary[id] -= 1 : systemData.abilities.primary[id] += 1;
                for (const id in systemData.abilities.secondary)
                    apply ? systemData.abilities.secondary[id] -= 1 : systemData.abilities.secondary[id] += 1;
                this.update({
                    'system.abilities.primary': systemData.abilities.primary,
                    'system.abilities.secondary': systemData.abilities.secondary
                });
                break;
            case "rank2":
                let moveMod;
                let rollMod;
                if(apply){
                    rollMod = -2;
                    moveMod = systemData.move / 2;
                    if(moveMod % 1 != 0){
                        moveMod = Math.floor(moveMod);
                        this.setFlag('gs', 'rank2Decimal', 0.5);
                    }
                }else{
                    rollMod = 0;
                    moveMod = systemData.move * 2;
                    const decimalFlag = this.getFlag('gs', 'rank2Decimal');
                    if(decimalFlag){
                        moveMod += 1;
                        this.unsetFlag('gs', 'rank2Decimal');
                    }
                }
                this.update({
                    'system.fatigue.fatigueMod': rollMod,
                    'system.move': moveMod
                });
                break;
            case "rank3":
                // let lifeForceDeduction;
                // if(apply){
                //     rollMod = -3;
                //     lifeForceDeduction = systemData.lifeForce.current / 2;
                //     if(lifeForceDeduction % 1 != 0){
                //         lifeForceDeduction = Math.floor(lifeForceDeduction);
                //         this.setFlag('gs', 'rank3LifeForce');
                //     }
                // }else{
                //     rollMod = -2;
                //     lifeForceDeduction = systemData.lifeForce.current * 2;
                //     const lifeForceFlag = this.getFlag('gs', 'rank3LifeForce');
                //     if(lifeForceFlag){
                //         lifeForceDeduction += 1;
                //         this.unsetFlag('gs', 'rank3LifeForce');
                //     }
                // }
                // this.update({
                //     'system.fatigue.fatigueMod': rollMod,
                //     'system.lifeForce.current': lifeForceDeduction
                // });
                break;
        }
    }

    _checkFatigue(){
        const fatigue = this.system.fatigue;
        const rank1 = fatigue.rank1;
        const rank2 = fatigue.rank2;
        const rank3 = fatigue.rank3;
        const rank4 = fatigue.rank4;
        const rank5 = fatigue.rank5;
        const rank1Flag = this.getFlag('gs', 'fatigueRank1');
        const rank2Flag = this.getFlag('gs', 'fatigueRank2');
        const rank3Flag = this.getFlag('gs', 'fatigueRank3');
        const rank4Flag = this.getFlag('gs', 'fatigueRank4');
        const rank5Flag = this.getFlag('gs', 'fatigueRank5');

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

        if(rank1.min == rank1.max && !rank1Flag){
            this.setFlag('gs', 'fatigueRank1', -1);
            this._applyAbilityScoreFatigueMods(true, "rank1");
        }else if(rank1.min < rank1.max && rank1Flag){
            this.unsetFlag('gs', 'fatigueRank1');
            this._applyAbilityScoreFatigueMods(false, "rank1");
        }
        if(rank2.min == rank2.max && !rank2Flag){
            this.setFlag('gs', 'fatigueRank2', -1);
            this._applyAbilityScoreFatigueMods(true, "rank2");
        }else if(rank2.min < rank2.max && rank2Flag){
            this.unsetFlag('gs', 'fatigueRank2');
            this._applyAbilityScoreFatigueMods(false, "rank2");
        }
        if(rank3.min == rank3.max && !rank3Flag){
            this.setFlag('gs', 'fatigueRank3', -1);
            this._applyAbilityScoreFatigueMods(true, "rank3");
        }else if(rank3.min < rank3.max && rank3Flag){
            this.unsetFlag('gs', 'fatigueRank3');
            this._applyAbilityScoreFatigueMods(false, "rank3");
        }
        if(rank4.min == rank4.max && !rank4Flag){
            this.setFlag('gs', 'fatigueRank4', -1);
            this._applyAbilityScoreFatigueMods(true, "rank4");
        }else if(rank4.min < rank4.max && rank4Flag){
            this.unsetFlag('gs', 'fatigueRank4');
            this._applyAbilityScoreFatigueMods(false, "rank4");
        }
        if(rank5.min == rank5.max && !rank5Flag){
            this.setFlag('gs', 'fatigueRank5', -1);
            this._applyAbilityScoreFatigueMods(true, "rank5");
        }
    }

    _prepareCharacterData(actorData){
        const systemData = actorData.system;
        const type = actorData.type;
        let hardinessBonus = 0;

        if(type !== 'character') return;

        // Setting up character calculated ability scores
        for(const [keyP, scoreP] of Object.entries(systemData.abilities.primary)){
            for(const [keyS, scoreS] of Object.entries(systemData.abilities.secondary)){
                const calcString = keyP.substring(0,1) + keyS.substring(0,1);
                const calcScore = scoreP + scoreS;
                systemData.abilities.calc[calcString] = calcScore;
            }
        }

                // Checking Flags for character sheet changes
        //this._checkFlags();

        // Setting Character Spell Resistance
        systemData.spellRes = systemData.levels.adventurer + systemData.abilities.calc.pr + this._getSkillBonus("Spell Resistance");

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

        // Check Fatigue Levels
        this._checkFatigue();

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
        // TODO: Add in skill modifiers
        let movePen = systemData.move;
        const armor = actorData.items.filter(item => item.type === 'armor');
        if(armor.length){
            movePen += parseInt(armor[0].system.move, 10);
        }
        systemData.modMove = movePen;

    }

    _prepareMonsterData(actorData){
        if(actorData.type !== 'monster') return;

    }
}
