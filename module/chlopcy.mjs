import { registerSheets } from "./setup/register-sheets.mjs";
import { registerHandlebarsHelpers } from "./setup/handlebars.mjs";

Hooks.once("init", async function () {
    
    registerSheets();
    registerHandlebarsHelpers();    
    console.log("System \"Chłopcy RPG\" został poprawnie załadowany");
    return preloadHandlebarsTemplates();

  });