export const preloadHandlebarsTemplates = async function() {
    return loadTemplates([
        "systems/gs/templates/actors/partials/character/sidebar.hbs",
        "systems/gs/templates/actors/partials/character/stats.hbs",
        "systems/gs/templates/actors/partials/character/items.hbs",
        "systems/gs/templates/actors/partials/character/skills.hbs",
        "systems/gs/templates/actors/partials/character/spells.hbs",
        "systems/gs/templates/actors/partials/character/description.hbs",
        "systems/gs/templates/actors/partials/character/effects.hbs",
        "systems/gs/templates/items/partials/item-card.hbs",
        "systems/gs/templates/items/partials/weapon-card.hbs",
        "systems/gs/templates/items/partials/armor-card.hbs",
        "systems/gs/templates/items/partials/shield-card.hbs",
    ]);
}
