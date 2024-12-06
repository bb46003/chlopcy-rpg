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
    rollingData.rolls[1] = RKM; 
    const actor = msg.system.actor;
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
        case 3:
            if(rollingData.KM === 0){
                ui.notifications.warn(game.i18n.localize("chlopcy.ui.najpierw_użyjKM"))
            }
            else{
                dodatkowaKM(rollingData, msg, actor)
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
            const iloscOsiagow = (3 + rollingData.dodatkoweOsiagi);
            osiagi = game.i18n.format("chlopcy.rzut.wiele_osiagów",{iloscOsiagow:iloscOsiagow}) 
        }
        else if(RDT === 9 || RDT === 11) {
            const iloscOsiagow = (2 + rollingData.dodatkoweOsiagi);
            osiagi = game.i18n.format("chlopcy.rzut.wiele_osiagów",{iloscOsiagow:iloscOsiagow})
        }
        else if (RDT === 8 || RDT === 12){
            const iloscOsiagow = (1 + rollingData.dodatkoweOsiagi);
            if(iloscOsiagow == 2){
                osiagi = game.i18n.localize("chlopcy.rzut.dwa_osiagi") 
            }
            else{
                osiagi = game.i18n.format("chlopcy.rzut.wiele_osiagów",{iloscOsiagow:iloscOsiagow}) 
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
    rollingData.wykorzystsnytag = 1;
    let tekstKM, tesktDKM ="";
    const kKB = formulaKB.replace(/d/g, "k");
    let RDT = nowaKB.total;
    let osiagi =await sprawdzRDT(rollingData,RDT,nowaKB)
    if(rollingData.KM !== 0 && rollingData.DKM === 0){
        const formulaKM = rollingData.rolls[1].formula;;
        const kKM = formulaKM.replace(/d/g, "k");
        const wynikRKM = rollingData.rolls[1].total
        tekstKM = game.i18n.format("chlopcy.czat.wynik_KM", { kKM });
        const addResult = nowaKB.total + wynikRKM;
        const subResult = Math.abs(nowaKB.total-wynikRKM); 
        RDT = Math.abs(10 - addResult) <= Math.abs(10 - subResult) ? addResult : subResult;
        osiagi =await sprawdzRDT(rollingData,RDT,nowaKB.total)
    }
    else if(rollingData.DKM !== 0){
        const kKM = rollingData.rolls[1].formula.replace(/d/g, "k");
        const KM = rollingData.rolls[1].total
        tekstKM = game.i18n.format("chlopcy.czat.wynik_KM", { kKM });
        const kDKM = rollingData.rolls[2].formula.replace(/d/g, "k");
        const DKM =  rollingData.rolls[2].total
        tesktDKM = game.i18n.format("chlopcy.czat.wynik_DKM", { kDKM });
        const combinations = [
            { expression: `KB + KM + DKM`, result: nowaKB.total + KM + DKM },
            { expression: `KB + KM - DKM`, result: nowaKB.total + KM - DKM },
            { expression: `KB - KM + DKM`, result: nowaKB.total - KM + DKM },
            { expression: `KB - KM - DKM`, result: nowaKB.total - KM - DKM },
        ];
        RDT = combinations[0].result;
        let smallestDifference = Math.abs(RDT - 10);

        combinations.forEach(combination => {
            const difference = Math.abs(combination.result - 10);
            if (difference < smallestDifference) {
                RDT = combination.result;
                smallestDifference = difference;
            }
        });
        osiagi =await sprawdzRDT(rollingData,RDT,nowaKB.total)
    }

    let tekstKB = game.i18n.format("chlopcy.czat.wynik_KB", { kKB});
    let rolls = msg.rolls;
    if (rollingData.wartoscTagu !==5){
        rollingData.tag = ""
        rollingData.wartoscTagu = 0
    }
    if(rollingData.wartoscTagu ===5){
        rollingData.wartoscTagu = 4
    }
    const template = await renderTemplate(
        "systems/chlopcy/tameplates/chat/rdt.hbs",
        {rollingData:rollingData, osiagi:osiagi, KB:nowaKB.total, KM:rollingData.KM, RDT:RDT, tekstKB:tekstKB, tekstKM:tekstKM, tekstDKM:tesktDKM, DKM:rollingData.DKM},
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
    if(rollingData.rolls.length <3){
    const formulaKM = rollingData.rolls[1].formula;
    const nowaKM =  await new Roll(formulaKM).evaluate();
    const wynikRKM = nowaKM.total;
    rollingData.KM = nowaKM.total;
    rollingData.rolls[1] = nowaKM;
    rollingData.wykorzystsnytag = 2;
    const KB = rollingData.rolls[0].total;
    let tekstKM ="";
    const kKB = rollingData.rolls[0].formula.replace(/d/g, "k");
    tekstKM = game.i18n.format("chlopcy.czat.wynik_KM", { kKM:formulaKM });
    const addResult = KB + wynikRKM;
    const subResult = Math.abs(KB-wynikRKM); 
    let RDT = Math.abs(10 - addResult) <= Math.abs(10 - subResult) ? addResult : subResult;
    let osiagi =await sprawdzRDT(rollingData,RDT, KB);
    let tekstKB = game.i18n.format("chlopcy.czat.wynik_KB", { kKB});
    let rolls = msg.rolls;
    if (rollingData.wartoscTagu !==5){
        rollingData.tag = ""
        rollingData.wartoscTagu = 0
    }
    if(rollingData.wartoscTagu ===5){
        rollingData.wartoscTagu = 4
    }
    const tesktDKM = "";
    const DKM = rollingData.DKM;
    const template = await renderTemplate(
        "systems/chlopcy/tameplates/chat/rdt.hbs",
        {rollingData:rollingData, osiagi:osiagi, KB:KB, KM:wynikRKM, RDT:RDT, tekstKB:tekstKB, tekstKM:tekstKM, tekstDKM:tesktDKM, DKM:DKM},
      );
    const chatData = {
        user: game.user?._id,
        speaker: ChatMessage.getSpeaker({ actor }),
        rolls: rolls,
        content: template,
        system: rollingData
    };
    await nowaKM.toMessage(chatData);
}
else{
    const formulaKM = rollingData.rolls[1].formula.replace(/^1d/, "d");
    const formulaDKM = rollingData.rolls[2].formula.replace(/^1d/, "d");
    console.log(formulaDKM, formulaKM)
    const html = await renderTemplate("systems/chlopcy/tameplates/dialog/przerzut-dla-wielu-KM.hbs", {formulaKM:formulaKM, formulaDKM:formulaDKM });
    const tutyl =game.i18n.localize("chlopcy.dialog.wybierz_KM_do_przerzutu")
    const d= new Dialog({
        title: tutyl,
        content: html,
        buttons: {},
        render: (html) => {
            // Attach the click handler properly
            html.on("click", "[class^='fas fa-dice-'], .fa-coin", (event) => przerzutWybranejKM( rollingData, event, d));
            
        }
    });
    d.render(true)
}
}

async function dodatkowaKM(rollingData, msg, actor) {
    const html = await renderTemplate("systems/chlopcy/tameplates/dialog/dodatkowaKM.hbs", { rollingData: rollingData });
    const tutyl = game.i18n.localize("chlopcy.dialog.naglowek_dodatkowa_KM");

    const d= new Dialog({
        title: tutyl,
        content: html,
        buttons: {},
        render: (html) => {
            // Attach the click handler properly
            html.on("click", "[class^='fas fa-dice-'], .fa-coin", (event) => efektDodatkowejKM( rollingData, event, d));
            
        }
    });
    d.render(true)
}

async function efektDodatkowejKM(rollingData, event, d) {
    event.stopPropagation();
    event.preventDefault();
    const actor = rollingData.actor;
    const nowaKM = event.target.attributes[1].value
    const KM = rollingData.KM;
    const KB = rollingData.KB;

    const dodatkowyRKM = await new Roll(nowaKM).evaluate();
    rollingData.rolls[2] = dodatkowyRKM;
    const DKM = dodatkowyRKM.total;
    rollingData.DKM = DKM;     
    const combinations = [
        { expression: `KB + KM + DKM`, result: KB + KM + DKM },
        { expression: `KB + KM - DKM`, result: KB + KM - DKM },
        { expression: `KB - KM + DKM`, result: KB - KM + DKM },
        { expression: `KB - KM - DKM`, result: KB - KM - DKM },
    ];
    let RDT = combinations[0].result;
    let smallestDifference = Math.abs(RDT - 10);

    combinations.forEach(combination => {
        const difference = Math.abs(combination.result - 10);
        if (difference < smallestDifference) {
            RDT = combination.result;
            smallestDifference = difference;
        }
    });

    const  osiagi = await sprawdzRDT(rollingData,RDT,KB)
    const kDKM = dodatkowyRKM.formula.replace(/d/g, "k");
    const tesktDKM = game.i18n.format("chlopcy.czat.wynik_DKM", { kDKM });
    if (rollingData.wartoscTagu !==5){
        rollingData.tag = ""
        rollingData.wartoscTagu = 0
    }
    if(rollingData.wartoscTagu ===5){
        rollingData.wartoscTagu = 4
    }
    const kKB = rollingData.rolls[0].formula.replace(/d/g, "k");
    const formulaKM = rollingData.rolls[1].formula;
    const tekstKM = game.i18n.format("chlopcy.czat.wynik_KM", { kKM:formulaKM });
    let tekstKB = game.i18n.format("chlopcy.czat.wynik_KB", { kKB});
    const template = await renderTemplate(
        "systems/chlopcy/tameplates/chat/rdt.hbs",
        {rollingData:rollingData, osiagi:osiagi, KB:KB, KM:KM, RDT:RDT, tekstKB:tekstKB, tekstKM:tekstKM, tekstDKM:tesktDKM, DKM:DKM},
      );
      rollingData.RDT = RDT
      const chatData = {
        user: game.user?._id,
        speaker: ChatMessage.getSpeaker({ actor }),
        content: template,
        system: rollingData
    }
    await dodatkowyRKM.toMessage(chatData);
    d.close()
}

async function  przerzutWybranejKM(rollingData,event ,d ) {
    event.stopPropagation();
    event.preventDefault();
    const actor = rollingData.actor;
    const nowaKM = event.target.attributes[1].value;
    console.log(nowaKM)




    d.close()
    
}