import { registerSheets } from "./setup/register-sheets.mjs";
import { registerHandlebarsHelpers } from "./setup/handlebars.mjs";
import { preloadHandlebarsTemplates } from "./setup/templates.mjs";
import { CHLOPCYCONFIG } from "./config.mjs";
import * as chlopcyChat from "./chat/roll-mod.mjs"

Hooks.once("init", async function () {
    
    registerSheets();
    registerHandlebarsHelpers();    
    console.log("System \"Chłopcy RPG\" został poprawnie załadowany");
    CONFIG.CHLOPCYCONFIG = CHLOPCYCONFIG;
    return preloadHandlebarsTemplates();

  });
  
Hooks.on("renderChatLog", chlopcyChat.addChatListeners);