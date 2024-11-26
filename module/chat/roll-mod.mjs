export function addChatListeners(_app, html, _data) {
    html.on("click", "[class^='fas fa-dice-'], .fa-coin", dodajKM);

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
    if(RDT === 10){
        osiagi = game.i18n.localize("chlopcy.rzut.trzy_osiagi");        
    }
    else if(RDT === 9 || RDT === 11) {
        osiagi = game.i18n.localize("chlopcy.rzut.dwa_osiagi")
    }
    else if (RDT === 8 || RDT === 12){
        osiagi = game.i18n.localize("chlopcy.rzut.jeden_osiag")
    }
    else{
        osiagi = game.i18n.localize("chlopcy.rzut.brak_osiagow")
    }
    if((RDT < 8 || RDT>12) && KB === 20 ){
        osiagi = game.i18n.localize("chlopcy.rzut.pech")
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
      
     
  

