import { registerSheets } from "./setup/register-sheets.mjs";
import { registerHandlebarsHelpers } from "./setup/handlebars.mjs";
import { preloadHandlebarsTemplates } from "./setup/templates.mjs";
import { CHLOPCYCONFIG } from "./config.mjs";
import * as chlopcyChat from "./chat/roll-mod.mjs"
import { uzycieWiezi } from "./dialog/uzycie-wiezi.mjs";
import { chlopcyActor } from "./actors/actors.mjs";
import { zegarTykacza } from "./apps/zegary.mjs";
import {SocketHandler} from "./socketHandler.mjs"

Hooks.once("init", async function () {
    
    registerSheets();
    registerHandlebarsHelpers();    
    console.log("System \"Chłopcy RPG\" został poprawnie załadowany");
    CONFIG.CHLOPCYCONFIG = CHLOPCYCONFIG;
   
    game.chlopcy = {uzycieWiezi, zegarTykacza}
    CONFIG.Actor.documentClass = chlopcyActor;
    game.chlopcy.zegarTykacza.socketHandler = new SocketHandler()
    if (game.i18n.lang !== "pl") {
      game.i18n.lang = "pl";
  }
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
Hooks.on("ready", async ()=>{ 
  const tykacze = game.actors.filter(actor => actor.type === "tykacz");
  tykacze.forEach(async tykacz => {
    if(tykacz.system?.aktywny){
      const nowyTykacz = new zegarTykacza(tykacz);
      nowyTykacz.render(true)
      if(tykacz.system.jestPrzeciwnikiem){
        if(game.user.isGM){
          
          if(game.combats.size === 0){
          walka = await Combat.create()
          await walka.update({
            active:true,
            round: 1, 
            turn: 0 });
        
        await this.dodajPostacieDowalki(walka)
          
          }
        }
        
        game.combats.apps[0].renderPopout(true)
          let combatApp = game.combats.apps[0]._popout; 
          const windowSize = window.innerWidth; 
          const combatAppSize = combatApp.position.width; 
          const sideBar = ui.sidebar.position.width; 
          const newLeftPosition = windowSize - combatAppSize - sideBar + 10;
          combatApp.position.top =  0;
          combatApp.position.left =  newLeftPosition 
      }    
    }
   })
});

  
  

Hooks.on("renderzegarTykacza",async()=>{
  const zegary = document.querySelectorAll(".zegar");
  if(zegary.length >1){
    const topOffset = zegary[zegary.length-2].offsetTop;
    const lasCientHeight = zegary[zegary.length-2].clientHeight;
    const h1FontSize = parseFloat(getComputedStyle(document.body).fontSize);
    const totalOffsetInEm = ((topOffset+lasCientHeight+10)/h1FontSize);
    const newElement = zegary[zegary.length-1]
    newElement.style.position = 'absolute';
    newElement.style.left = '1em'; // Assuming the same left position
    newElement.style.top = `${totalOffsetInEm}em`; 
  }
})





