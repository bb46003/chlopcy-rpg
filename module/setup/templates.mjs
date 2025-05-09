export const preloadHandlebarsTemplates = async function (generation) {
   const templates= [
        "systems/chlopcy/tameplates/actor/tab/cechy.hbs",
        "systems/chlopcy/tameplates/actor/tab/cechy-check-box.hbs",
        "systems/chlopcy/tameplates/actor/tab/tagi-check-box.hbs",
        "systems/chlopcy/tameplates/actor/tab/pylek.hbs",
        "systems/chlopcy/tameplates/actor/tab/sprzet-osobisty.hbs",
        "systems/chlopcy/tameplates/actor/tab/sakwy.hbs",
        "systems/chlopcy/tameplates/actor/tab/nowe-szlify.hbs",
        "systems/chlopcy/tameplates/actor/section/glowna.hbs",
        "systems/chlopcy/tameplates/actor/section/kurta-i-wspomnienia.hbs",
        "systems/chlopcy/tameplates/actor/section/wiezi.hbs",
        "systems/chlopcy/tameplates/chat/partial/cecha-dice.hbs",
        "systems/chlopcy/tameplates/chat/partial/tag-mod.hbs",
        "systems/chlopcy/tameplates/chat/partial/uzyte-wiezi.hbs",
        "systems/chlopcy/tameplates/actor/section/opis.hbs"
    ];
    if (generation < 13) {
        return loadTemplates(templates);
    }
    return foundry.applications.handlebars.loadTemplates(templates);
}