export class GSItem extends Item {
    chatTemplate = {
        "weapon": "systems/gs/templates/partials/items/weapon-card.hbs",
        "armor": "systems/gs/templates/partials/items/armor-card.hbs",
        "item": "systems/gs/templates/partials/items/item-card.hbs"
        // And so on...
    }

    preparedData(){

    }
    getRollData(){

    }
    async roll(){
        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker()
        };

        let cardData = {
            ...this.data,
            owner: this.actor.id
        };

        chatData.content = await renderTemplate(this.chatTemplate[this.type], cardData);
        chatData.roll = true;
        return ChatMessage.create(chatData);
    }
}
