import { registerSheets } from "./setup/register-sheets.mjs";
import { registerHandlebarsHelpers } from "./setup/handlebars.mjs";
import { preloadHandlebarsTemplates } from "./setup/templates.mjs";
import { CHLOPCYCONFIG } from "./config.mjs";
import * as chlopcyChat from "./chat/roll-mod.mjs"
import { uzycieWiezi } from "./dialog/uzycie-wiezi.mjs";
import { chlopcyActor } from "./actors/actors.mjs";

Hooks.once("init", async function () {
    
    registerSheets();
    registerHandlebarsHelpers();    
    console.log("System \"Chłopcy RPG\" został poprawnie załadowany");
    CONFIG.CHLOPCYCONFIG = CHLOPCYCONFIG;
   
    game.chlopcy = {uzycieWiezi}
    CONFIG.Actor.documentClass = chlopcyActor;
    //CONFIG.Scene.documentClass = chlopcyScena
    return preloadHandlebarsTemplates();
  });
  
Hooks.on("renderChatLog", chlopcyChat.addChatListeners);

Hooks.on('preCreateScene', (scene) => {
  scene.updateSource({
    tokenVision: false, 
    fog:{
      exploration:false
    },
       grid:{
        type: CONST.GRID_TYPES.GRIDLESS
      }
    })
});
