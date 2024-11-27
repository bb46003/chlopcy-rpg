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
    const rolls = msg.rolls.push(RKM)
    const kKM = KM.replace(/d/g, "k");
    const kKB = msg.rolls[0]._formula.replace(/d/g, "k");
    const tekstKB = game.i18n.format("chlopcy.czat.wynik_KB", { kKB });
    const tekstKM = game.i18n.format("chlopcy.czat.wynik_KM", { kKM });
    let osiagi = ""
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
    const template = await renderTemplate(
        "systems/chlopcy/tameplates/chat/rdt.hbs",
        {rollingData:rollingData, osiagi:osiagi, KB:KB, KM:wynikRKM, RDT:RDT, tekstKB:tekstKB, tekstKM:tekstKM},
      );



      const chatData = {
        user: game.user?._id,
        speaker: ChatMessage.getSpeaker({ actor }),
        roll: rolls,
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
    const wartoscTagu = rollingData.wartoscTagu;
}
      
     
  

