export class GSActor extends Actor {
    prepareData(){
        super.prepareData();
    }

    prepareBaseData(){

    }

    prepareDerivedData(){
        const actorData = this;
        const systemData = actorData.system;
        const flags = actorData.flags.gs || {};

        this._prepareCharacterData(actorData);
    }

    _prepareCharacterData(actorData){
        const systemData = actorData.system;
        const type = actorData.type

        if(type !== 'character') return;

        // Setting up character ability scores
        for(const [keyP, scoreP] of Object.entries(systemData.abilities.primary)){
            for(const [keyS, scoreS] of Object.entries(systemData.abilities.secondary)){
                const calcString = keyP.substring(0,1) + keyS.substring(0,1);
                const calcScore = scoreP + scoreS;
                systemData.abilities.calc[calcString] = calcScore;
            }
        }

        // Setting Character Spell Resistance
        // TODO: Learn how to add the Spell Resistance skill from Skills to character sheet data
        systemData.spellRes = systemData.levels.adventurer + systemData.abilities.calc.pr;

        // Setting 2x LifeForce + any Skills
        // TODO: Learn how to add the Hardiness skill from Skills to character sheet data
        systemData.lifeForce.max = systemData.lifeForce.current * 2;

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

    }
}
