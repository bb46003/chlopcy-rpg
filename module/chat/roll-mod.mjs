export function addChatListeners(_app, html, _data) {
    html.on("click", "[class^='fas fa-dice-'], .fa-coin", dodajKM);
    html.on("click", ".rectangle", dzialanieTagow);

}

export async function dodajKM(ev){
  
    ev.stopPropagation();
    ev.preventDefault();
    const KM = ev.target.attributes[1].value  
    const messageElement = ev.target.closest(".chat-message");
    const messageId = messageElement.getAttribute("data-message-id");
    const msg = game.messages.get(messageId);
    const KB = msg.rolls[0]._total
    const RKM = await new Roll(KM).evaluate();
    const wynikRKM = RKM.total;
 
    const addResult = KB + wynikRKM;
    const subResult = Math.abs(KB-wynikRKM); 
    const RDT = Math.abs(10 - addResult) <= Math.abs(10 - subResult) ? addResult : subResult;
    const rollingData = msg.system;
    const actor = msg.system.actor;
    rollingData.rolls.splice(1, 0, RKM);
    const rolls =  msg.rolls;
    const kKM = KM.replace(/d/g, "k");
    const kKB = msg.rolls[0]._formula.replace(/d/g, "k");
    const tekstKB = game.i18n.format("chlopcy.czat.wynik_KB", { kKB });
    const tekstKM = game.i18n.format("chlopcy.czat.wynik_KM", { kKM });

    const  osiagi = await sprawdzRDT(rollingData,RDT,KB)
    const template = await renderTemplate(
        "systems/chlopcy/tameplates/chat/rdt.hbs",
        {rollingData:rollingData, osiagi:osiagi, KB:KB, KM:wynikRKM, RDT:RDT, tekstKB:tekstKB, tekstKM:tekstKM},
      );

      rollingData.KM = wynikRKM;

      const chatData = {
        user: game.user?._id,
        speaker: ChatMessage.getSpeaker({ actor }),
        rolls: rolls,
        content: template,
        system: rollingData
    }
    await RKM.toMessage(chatData);
          
        }
export async function dzialanieTagow(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    const messageElement = ev.target.closest(".chat-message");
    const messageId = messageElement.getAttribute("data-message-id");
    const msg = game.messages.get(messageId);
    const rollingData = msg.system;
    const actor = msg.system.actor;
    const id = Number(ev.target.id);

    switch (id){

        case 1:
            przerzutKB(rollingData, msg, actor)
            break;
        case 2:
            if(rollingData.KM === 0){
                ui.notifications.warn(game.i18n.localize("chlopcy.ui.najpierw_użyjKM"))
            }
            else{
                przerzutKM(rollingData, msg, actor)
            }
            break;



            

    }
    
}
      
 async function sprawdzRDT(rollingData,RDT,KB){
    let osiagi = "";
    if(rollingData.przedmiot === ""){
        if(RDT === 10){
            osiagi = game.i18n.localize("chlopcy.rzut.trzy_osiagi");        
        }
        else if(RDT === 9 || RDT === 11) {
            osiagi = game.i18n.localize("chlopcy.rzut.dwa_osiagi")
        }
        else if (RDT === 8 || RDT === 12){
            osiagi = game.i18n.localize("chlopcy.rzut.jeden_osiag")
        }
        else if (KB === 20 && (RDT >12 || RDT < 8) ){
            osiagi = game.i18n.localize("chlopcy.rzut.pech")
        }
        
        else{
            osiagi = game.i18n.localize("chlopcy.rzut.brak_osiagow")
        }
        if(KB===20 && (RDT <=12 || RDT >= 8)){
            osiagi+=game.i18n.localize("chlopcy.rzut.masz_komplikacje")
        }
        }
    else{
        if(RDT === 10){
            const iloscOsiagow = String(3 + rollingData.dodatkoweOsiagi);
            osiagi = game.i18n.localize("chlopcy.rzut.wiele_osiagów",{iloscOsiagow:iloscOsiagow}) 
        }
        else if(RDT === 9 || RDT === 11) {
            const iloscOsiagow = String(2 + rollingData.dodatkoweOsiagi);
            osiagi = game.i18n.localize("chlopcy.rzut.wiele_osiagów",{iloscOsiagow:iloscOsiagow})
        }
        else if (RDT === 8 || RDT === 12){
            const iloscOsiagow = String(1 + rollingData.dodatkoweOsiagi);
            if(iloscOsiagow == 2){
                osiagi = game.i18n.localize("chlopcy.rzut.dwa_osiagi") 
            }
            else{
                osiagi = game.i18n.localize("chlopcy.rzut.wiele_osiagów",{iloscOsiagow:iloscOsiagow}) 
            }
            
        }       
        else if (KB === 20 && (RDT >12 || RDT < 8) ){
            osiagi = game.i18n.localize("chlopcy.rzut.klopoty")
        }
        else{
            osiagi = game.i18n.localize("chlopcy.rzut.brak_osiagow")
        }
        if(KB===20){
            osiagi+=game.i18n.localize("chlopcy.rzut.masz_komplikacje")
        }

    }
    return osiagi
 }     

 async function przerzutKB(rollingData, msg, actor) {
    
    const formulaKB = rollingData.rolls[0].formula;
            const nowaKB =  await new Roll(formulaKB).evaluate();
            rollingData.rolls[0]=nowaKB;
            rollingData.KB = nowaKB.total;
            let tekstKM ="";
            const kKB = formulaKB.replace(/d/g, "k");
            let RDT = nowaKB.total;
            let osiagi =await sprawdzRDT(rollingData,RDT,nowaKB)
            if(rollingData.KM !== 0){
            const formulaKM = rollingData.rolls[1].formula;;
            const kKM = formulaKM.replace(/d/g, "k");
            const wynikRKM = rollingData.rolls[1].total
            tekstKM = game.i18n.format("chlopcy.czat.wynik_KM", { kKM });
            const addResult = KB + wynikRKM;
            const subResult = Math.abs(KB-wynikRKM); 
            RDT = Math.abs(10 - addResult) <= Math.abs(10 - subResult) ? addResult : subResult;
            osiagi =await sprawdzRDT(rollingData,RDT,nowaKB)

            }
           let tekstKB = game.i18n.format("chlopcy.czat.wynik_KB", { kKB});
            msg.rolls[0] = nowaKB;
            let rolls = msg.rolls;
            if (rollingData.wartoscTagu !==5){
                rollingData.tag = ""
                rollingData.wartoscTagu = 0
            }
            if(rollingData.wartoscTagu !==5){
                rollingData.wartoscTagu = 4
            }

            const template = await renderTemplate(
                "systems/chlopcy/tameplates/chat/rdt.hbs",
                {rollingData:rollingData, osiagi:osiagi, KB:rollingData.KB, KM:rollingData.KM, RDT:RDT, tekstKB:tekstKB, tekstKM:tekstKM},
              );
              const chatData = {
                user: game.user?._id,
                speaker: ChatMessage.getSpeaker({ actor }),
                rolls: rolls,
                content: template,
                system: rollingData
              }
              await nowaKB.toMessage(chatData)
        

    
 }
 async function przerzutKM(rollingData, msg, actor) {
    
    const formulaKM = rollingData.rolls[1].formula;
    const nowaKM =  await new Roll(formulaKM).evaluate();
    const wynikRKM = nowaKM.total;
    rollingData.KM = nowaKM.total;
    rollingData.rolls[1] = nowaKM;
    const KB = rollingData.rolls[0].total;
    let tekstKM ="";
    const kKB = rollingData.rolls[0].formula.replace(/d/g, "k");
    tekstKM = game.i18n.format("chlopcy.czat.wynik_KM", { formulaKM });
    const addResult = KB + wynikRKM;
            const subResult = Math.abs(KB-wynikRKM); 
            let RDT = Math.abs(10 - addResult) <= Math.abs(10 - subResult) ? addResult : subResult;
            let osiagi =await sprawdzRDT(rollingData,RDT, KB)

        
            let tekstKB = game.i18n.format("chlopcy.czat.wynik_KB", { kKB});
            msg.rolls[1] = nowaKM;
            let rolls = msg.rolls;
            if (rollingData.wartoscTagu !==5){
                rollingData.tag = ""
                rollingData.wartoscTagu = 0
            }
            if(rollingData.wartoscTagu !==5){
                rollingData.wartoscTagu = 4
            }

            const template = await renderTemplate(
                "systems/chlopcy/tameplates/chat/rdt.hbs",
                {rollingData:rollingData, osiagi:osiagi, KB:rollingData.KB, KM:rollingData.KM, RDT:RDT, tekstKB:tekstKB, tekstKM:tekstKM},
              );
              const chatData = {
                user: game.user?._id,
                speaker: ChatMessage.getSpeaker({ actor }),
                rolls: rolls,
                content: template,
                system: rollingData
              }
              await nowaKM.toMessage(chatData)
        

    
 }
  

