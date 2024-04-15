export const preloadHandlebarsTemplates = async function() {
    return loadTemplates([
        "systems/gs/templates/actors/partials/character/sidebar.hbs",
        "systems/gs/templates/actors/partials/character/stats.hbs",
        "systems/gs/templates/actors/partials/character/items.hbs",
        "systems/gs/templates/actors/partials/character/features.hbs",
        "systems/gs/templates/actors/partials/character/spells.hbs",
        "systems/gs/templates/actors/partials/character/description.hbs",
        "systems/gs/templates/actors/partials/character/effects.hbs",
    ]);
}
