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

        this._prepareCharacterData(systemData);
    }

    _prepareCharacterData(systemData){

    }
}
