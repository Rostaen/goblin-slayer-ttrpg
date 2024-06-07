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

    // Updating Armor Score with Armor:XX skill bonus level
    // Currently, only the top level armor will have this score applied to it if skill is present
    _armorSkillCall(){
        // TODO: Update for future "equipped" status.
        const armorValues = {
            cloth: this._getSkillBonus("Armor: Cloth"),
            light: this._getSkillBonus("Armor: Light"),
            heavy: this._getSkillBonus("Armor: Heavy"),
        };
        // If value is truthy
        if(armorValues.cloth || armorValues.light || armorValues.heavy){
            let armorWorn = this.items.filter(item => item.type.toLowerCase() === "armor");
            // Is armor presently being worn?
            if (armorWorn) {
                if (armorValues.cloth > 0) armorWorn[0].system.score += armorValues.cloth;
                else if (armorValues.light > 0) armorWorn[0].system.score += armorValues.light;
                else if (armorValues.heavy > 0) armorWorn[0].system.score += armorValues.heavy;
            }
        }
    }

    // Adding bonus spells known based on skill level
    _bonusSpellsKnownSkillCall(skill){
        const skillValue = skill.system.value;
        const spellDomain = skill.name.split(": ")[1];
        console.log("---> Check made values:", skillValue, spellDomain);
        switch(spellDomain.toLowerCase()){
            case "words of true power":
            case "words":
            case "true power":
                this.system.spellUse.totalSpellsKnown.sorc += skillValue;
                break;
            case "miracles":
            case "miracle":
                this.system.spellUse.totalSpellsKnown.prie += skillValue;
                break;
            case "ancestral dragon arts":
            case "dragon arts":
                this.system.spellUse.totalSpellsKnown.dPri += skillValue;
                break;
            case "spirit arts":
                this.system.spellUse.totalSpellsKnown.sham += skillValue;
                break;
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
        let moveMod = 0, rollMod = 0, lifeForceDeduction = 0;

        const updateAbilities = (primaryModifier, secondaryModifier) => {
            for (const id in systemData.abilities.primary){
                systemData.abilities.primary[id] += primaryModifier;
            }
            for (const id in systemData.abilities.secondary){
                systemData.abilities.secondary[id] += secondaryModifier;
            }
            this.update({
                'system.abilities.primary': systemData.abilities.primary,
                'system.abilities.secondary': systemData.abilities.secondary
            });
        };

        const updateMove = (apply, factor) => {
            moveMod = apply ? Math.floor(systemData.move / factor) : systemData.move * factor;
            if(apply && systemData.move % factor !== 0){
                this.setFlag('gs', 'rank2Decimal', 0.5);
            }else if(!apply){
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
        };

        const updateLifeForce = (apply, factor) => {
            lifeForceDeduction = apply ? Math.floor(systemData.lifeForce.current / factor) : systemData.lifeForce.current * factor;
            if(apply && systemData.lifeForce.current % factor !== 0){
                this.setFlag('gs', 'rank3LifeForce', -1);
            } else if(!apply){
                const lifeForceFlag = this.getFlag('gs', 'rank3LifeForce');
                if(lifeForceFlag){
                    lifeForceDeduction += 1;
                    this.unsetFlag('gs', 'rank3LifeForce');
                }
            }
            this.update({
                'system.fatigue.fatigueMod': rollMod,
                'system.lifeForce.current': lifeForceDeduction
            })
        };

        switch (rank) {
            case "rank1":
                updateAbilities(apply ? -1 : 1, apply ? -1 : 1);
                break;
            case "rank2":
                rollMod = apply ? -2 : 0;
                updateMove(apply, 2);
                break;
            case "rank3":
                rollMod = apply ? -3 : -2;
                updateLifeForce(apply, 2);
                break;
            case "rank4":
                rollMod = apply ? -4 : -3;
                if(apply){
                    ui.notifications.warn(`Warning: You are now unconscious until your fatigue drops to rank 3 or less!`);
                    if(!this.getFlag('gs', 'rank4RollMod')){
                        this.setFlag('gs', 'rank4Unconscious', -1);
                        this.setFlag('gs', 'rank4RollMod', -1);
                    }
                }else{
                    this.unsetFlag('gs', 'rank4RollMod');
                }
                this.update({
                    'system.fatigue.fatigueMod': rollMod
                });
                break;
            case "rank5":
                if (apply) {
                    this.setFlag('gs', 'rank5Death', -1);
                    ui.notifications.error(`Sadly, you have succumbed to your wounds and can no longer fight. Rest in peace ${this.name}...`);
                    // TODO: add in disable JS here and well as changing skills and other areas to 0.
                } else {
                    this.unsetFlag('gs', 'rank5Death');
                }
                break;
        }
    }

    _checkFatigue(){
        const fatigue = this.system.fatigue;
        const ranks = [
            { rank: fatigue.rank1, flag: 'fatigueRank1', minMaxCount: 6, label: 'rank1' },
            { rank: fatigue.rank2, flag: 'fatigueRank2', minMaxCount: 5, label: 'rank2' },
            { rank: fatigue.rank3, flag: 'fatigueRank3', minMaxCount: 4, label: 'rank3' },
            { rank: fatigue.rank4, flag: 'fatigueRank4', minMaxCount: 3, label: 'rank4' },
            { rank: fatigue.rank5, flag: 'fatigueRank5', minMaxCount: 2, label: 'rank5' }
        ];

        const flags = {
            fatigueRank1: this.getFlag('gs', 'fatigueRank1'),
            fatigueRank2: this.getFlag('gs', 'fatigueRank2'),
            fatigueRank3: this.getFlag('gs', 'fatigueRank3'),
            fatigueRank4: this.getFlag('gs', 'fatigueRank4'),
            fatigueRank5: this.getFlag('gs', 'fatigueRank5'),
            rank4Unconscious: this.getFlag('gs', 'rank4Unconscious')
        };

        // Iterrate over fatigue to update min to/from max
        const updateFatigueMin = (rank, count) => {
            rank.min = 0;
            for (let i = 1; i <= count; i++){
                if (rank.marked[i]) rank.min += 1;
            }
        };

        // Checking over fatigue and applying negative modifiers as needed
        for(const { rank, flag, minMaxCount, label } of ranks ){
            updateFatigueMin(rank, minMaxCount);
            if(rank.min == rank.max && !flags[flag]){
                this.setFlag('gs', flag, -1);
                this._applyAbilityScoreFatigueMods(true, label);
            }else if(rank.min < rank.max && flags[flag]){
                this.unsetFlag('gs', flag);
                this._applyAbilityScoreFatigueMods(false, label);
            }
        }

        // Special case to remove unconscious when rank 4 fully cleared
        if(fatigue.rank4.min === 0 && flags.rank4Unconscious){
            this.unsetFlag('gs', 'rank4Unconscious');
            ui.notifications.info(`You are no longer unconscious and may act normally again.`);
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

        // TODO: Set a value for a non-existing field for max spells for each spell system
        systemData.spellUse.totalSpellsKnown = {
            "sorc": systemData.levels.classes.sorcerer,
            "prie": systemData.levels.classes.priest,
            "dPri": systemData.levels.classes.dragon,
            "sham": systemData.levels.classes.shaman
        };

        // Checking Flags for character sheet changes
        //this._checkFlags();

        // Setting Character Spell Resistance
        systemData.spellRes = systemData.levels.adventurer + systemData.abilities.calc.pr + this._getSkillBonus("Spell Resistance");

        // Getting character skills
        const actorSkills = this.items.filter(item => item.type === 'skill');
        for(const [id, skill] of Object.entries(actorSkills)){
            // Switching on skills to save processing time
            // console.log("===> For Loop Skill Check", skill.name);
            switch(skill.name){
                case "Hardiness": // Setting 2x LifeForce + any Skills
                    hardinessBonus = this._hardinessSkillCall(); break;
                case "Perseverance": // Setting EX Fatigue
                    this._perserveranceSkillCall(systemData); break;
                case "Armor: Cloth":
                case "Armor: Light":
                case "Armor: Heavy":
                    this._armorSkillCall(); break;
                case "Bonus Spells: Words of True Power":
                case "Bonus Spells: Miracles":
                case "Bonus Spells: Ancestral Dragon Arts":
                case "Bonus Spells: Spirit Arts":
                    this._bonusSpellsKnownSkillCall(skill); break;
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
