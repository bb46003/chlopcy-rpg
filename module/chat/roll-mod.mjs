import { uzycieWiezi } from "../dialog/uzycie-wiezi.mjs"
import { zegarTykacza } from "../apps/zegary.mjs";

export function addChatListeners(_app, html, _data) {
    html.on("click", "[class^='fas fa-dice-'], .fa-coin", dodajKM);
    html.on("click", ".rectangle", dzialanieTagow);

}

async function dodajKM(ev){
  
    ev.stopPropagation();
    ev.preventDefault();
    const KM = ev.target.attributes[1].value  
    const messageElement = ev.target.closest(".chat-message");
    const messageId = messageElement.getAttribute("data-message-id");
    const msg = game.messages.get(messageId).system;
    let KB = msg.KB;
    const RKM = await new Roll(KM).evaluate();
    const wynikRKM = RKM.total;
    let addResult, subResult, subResult2, addResult2, RDT ;
    if(msg.plusMinus1){
        addResult = KB + wynikRKM + 1;
        subResult = Math.abs(KB-wynikRKM) +1;
        addResult2 = KB + wynikRKM - 1;
        subResult2 = Math.abs(KB-wynikRKM) - 1; 
        const results = [addResult, subResult, addResult2, subResult2];
        RDT = results.reduce((closest, current) => 
            Math.abs(current - 10) < Math.abs(closest - 10) ? current : closest
        );
        
    }
    else{
        addResult = KB + wynikRKM;
        subResult = Math.abs(KB-wynikRKM); 
        RDT = Math.abs(10 - addResult) <= Math.abs(10 - subResult) ? addResult : subResult;
    }
    const rollingData = msg
     rollingData.rolls[1] = RKM; 
    const actor = msg.actor;
    const rolls =  msg.rolls;
    const kKM = KM.replace(/d/g, "k");
    const kKB = msg.rolls[0].formula.replace(/d/g, "k");
    const tekstKB = game.i18n.format("chlopcy.czat.wynik_KB", { kKB });
    const tekstKM = game.i18n.format("chlopcy.czat.wynik_KM", { kKM });
    rollingData.KM = wynikRKM;
    const  {osiagi, iloscOsiagow} = await sprawdzRDT(rollingData,RDT,KB)
    rollingData.RDT = RDT;
    rollingData.osiagi = osiagi;
    rollingData.iloscOsiagow = iloscOsiagow;
    const template = await renderTemplate(
        "systems/chlopcy/tameplates/chat/rdt.hbs",
        {rollingData:rollingData, osiagi:osiagi, KB:KB, KM:wynikRKM, RDT:RDT, tekstKB:tekstKB, tekstKM:tekstKM, uzytyTag:rollingData.uzytyTag},
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

async function dzialanieTagow(ev) {
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
            przerzutKB(rollingData, msg, actor, id);
            break;
        case 2:
            if(rollingData.KM === 0){
                ui.notifications.warn(game.i18n.localize("chlopcy.ui.najpierw_użyjKM"));
            }
            else{
                przerzutKM(rollingData, msg, actor, id);
            }
            break;
        case 3:
            if(rollingData.KM === 0){
                ui.notifications.warn(game.i18n.localize("chlopcy.ui.najpierw_użyjKM"));
            }
            else{
                dodatkowaKM(rollingData, msg, actor, id);
            }
            break;
        case 4:
            dodajOdejmijJeden(rollingData,msg, actor, id);
            break;
        case 6:
            uzyjWiezji(rollingData,msg, actor, id);
        case 7:
            dodajXP(actor,rollingData);
            break;
        case 8:
            zdejmijOsiagiTykacza(actor, rollingData, id)
            break;


            

    }
    
}
      
async function sprawdzRDT(rollingData,RDT,KB){
    let osiagi = "";
    let iloscOsiagow = 0;
    if(rollingData.przedmiot === ""){
        if(RDT === 10){
            osiagi = game.i18n.localize("chlopcy.rzut.trzy_osiagi"); 
            iloscOsiagow = 3       
        }
        else if(RDT === 9 || RDT === 11) {
            osiagi = game.i18n.localize("chlopcy.rzut.dwa_osiagi");
            iloscOsiagow = 2;
        }
        else if (RDT === 8 || RDT === 12){
            osiagi = game.i18n.localize("chlopcy.rzut.jeden_osiag")
            iloscOsiagow = 1;
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
            iloscOsiagow = (3 + rollingData.dodatkoweOsiagi);
            osiagi = game.i18n.format("chlopcy.rzut.wiele_osiagów",{iloscOsiagow:iloscOsiagow}) 
        }
        else if(RDT === 9 || RDT === 11) {
            iloscOsiagow = (2 + rollingData.dodatkoweOsiagi);
            osiagi = game.i18n.format("chlopcy.rzut.wiele_osiagów",{iloscOsiagow:iloscOsiagow})
        }
        else if (RDT === 8 || RDT === 12){
            iloscOsiagow = (1 + rollingData.dodatkoweOsiagi);
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
            osiagi = game.i18n.localize("chlopcy.rzut.brak_osiagow");
            
        }
        if(KB===20){
            osiagi+=game.i18n.localize("chlopcy.rzut.masz_komplikacje");
         
        }

    }
    return {osiagi, iloscOsiagow} 
}     

async function przerzutKB(rollingData, msg, actor, id) {
    let iloscOsiagow = 0;
    rollingData.uzytyTag = id;
    const formulaKB = rollingData.rolls[0].formula;
    const nowaKB =  await new Roll(formulaKB).evaluate();
    rollingData.rolls[0]=nowaKB;
    rollingData.KB = nowaKB.total;
    rollingData.wykorzystsnytag = 1;
    let tekstKM, tesktDKM ="";
    const kKB = formulaKB.replace(/d/g, "k");
    let RDT = nowaKB.total;
    osiagi =await sprawdzRDT(rollingData,RDT,nowaKB)
    if(rollingData.KM !== 0 && rollingData.DKM === 0){
        const formulaKM = rollingData.rolls[1].formula;;
        const kKM = formulaKM.replace(/d/g, "k");
        const wynikRKM = rollingData.rolls[1].total
        tekstKM = game.i18n.format("chlopcy.czat.wynik_KM", { kKM });
        const addResult = nowaKB.total + wynikRKM;
        const subResult = Math.abs(nowaKB.total-wynikRKM); 
        RDT = Math.abs(10 - addResult) <= Math.abs(10 - subResult) ? addResult : subResult;
        ({ osiagi, iloscOsiagow }  =await sprawdzRDT(rollingData,RDT,nowaKB.total))
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
        ({ osiagi, iloscOsiagow }  =await sprawdzRDT(rollingData,RDT,nowaKB.total))
    }
    if(rollingData.plusMinus1){
        let addResult = RDT + 1;
        let subResult = RDT - 1; 
        RDT = Math.abs(10 - addResult) <= Math.abs(10 - subResult) ? addResult : subResult;
        ({ osiagi, iloscOsiagow } = await sprawdzRDT(rollingData, RDT, nowaKB.total));
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
    rollingData.RDT = RDT;
    rollingData.osiagi = osiagi;
    rollingData.iloscOsiagow = iloscOsiagow;
    const template = await renderTemplate(
        "systems/chlopcy/tameplates/chat/rdt.hbs",
        {rollingData:rollingData, osiagi:osiagi, KB:nowaKB.total, KM:rollingData.KM, RDT:RDT, tekstKB:tekstKB, tekstKM:tekstKM, tekstDKM:tesktDKM, DKM:rollingData.DKM, uzytyTag:rollingData.uzytyTag},
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

async function przerzutKM(rollingData, msg, actor, id) {   
    if(rollingData.rolls.length <3){
    const formulaKM = rollingData.rolls[1].formula;
    const nowaKM =  await new Roll(formulaKM).evaluate();
    const wynikRKM = nowaKM.total;
    rollingData.KM = nowaKM.total;
    rollingData.rolls[1] = nowaKM;
    const KB = rollingData.rolls[0].total;
    let tekstKM ="";
    const kKB = rollingData.rolls[0].formula.replace(/d/g, "k");
    tekstKM = game.i18n.format("chlopcy.czat.wynik_KM", { kKM:formulaKM });
    const addResult = KB + wynikRKM;
    const subResult = Math.abs(KB-wynikRKM); 
    let RDT = Math.abs(10 - addResult) <= Math.abs(10 - subResult) ? addResult : subResult;
    let osiagi;
    let iloscOsiagow;
    ({osiagi, iloscOsiagow} =await sprawdzRDT(rollingData,RDT, KB));
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
    rollingData.uzytyTag = id;
    if(rollingData.plusMinus1){
        let addResult = RDT + 1;
        let subResult = RDT - 1; 
        RDT = Math.abs(10 - addResult) <= Math.abs(10 - subResult) ? addResult : subResult;
        osiagi =await sprawdzRDT(rollingData,RDT,KB)
    }
    rollingData.RDT = RDT;
    rollingData.osiagi = osiagi;
    rollingData.iloscOsiagow = iloscOsiagow;
    const template = await renderTemplate(
        "systems/chlopcy/tameplates/chat/rdt.hbs",
        {rollingData:rollingData, osiagi:osiagi, KB:KB, KM:wynikRKM, RDT:RDT, tekstKB:tekstKB, tekstKM:tekstKM, tekstDKM:tesktDKM, DKM:DKM, uzytyTag:rollingData.uzytyTag},
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
    const html = await renderTemplate("systems/chlopcy/tameplates/dialog/przerzut-dla-wielu-KM.hbs", {formulaKM:formulaKM, formulaDKM:formulaDKM });
    const tutyl =game.i18n.localize("chlopcy.dialog.wybierz_KM_do_przerzutu")
    const d= new Dialog({
        title: tutyl,
        content: html,
        buttons: "",
        render: (html) => {
            // Attach the click handler properly
            html.on("click", "[class^='fas fa-dice-'], .fa-coin", (event) => przerzutWybranejKM( rollingData, event, d, id));
            
        }
    });
    d.render(true)
}
}

async function dodatkowaKM(rollingData, msg, actor, id) {
    const html = await renderTemplate("systems/chlopcy/tameplates/dialog/dodatkowaKM.hbs", { rollingData: rollingData });
    const tutyl = game.i18n.localize("chlopcy.dialog.naglowek_dodatkowa_KM");

    const d= new Dialog({
        title: tutyl,
        content: html,
        buttons: "",
        render: (html) => {
            // Attach the click handler properly
            html.on("click", "[class^='fas fa-dice-'], .fa-coin", (event) => efektDodatkowejKM( rollingData, event, d, id));
            
        }
    });
    d.render(true)
}

async function efektDodatkowejKM(rollingData, event, d, id) {
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

    let  {osiagi,iloscOsiagow} = await sprawdzRDT(rollingData,RDT,KB)
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
    rollingData.uzytyTag = id;
    if(rollingData.plusMinus1){
        let addResult = RDT + 1;
        let subResult = RDT - 1; 
        RDT = Math.abs(10 - addResult) <= Math.abs(10 - subResult) ? addResult : subResult;
        ({osiagi, iloscOsiagow} =await sprawdzRDT(rollingData,RDT,KB))
    }
    rollingData.RDT = RDT;
    rollingData.osiagi = osiagi;
    rollingData.iloscOsiagow = iloscOsiagow;
    const template = await renderTemplate(
        "systems/chlopcy/tameplates/chat/rdt.hbs",
        {rollingData:rollingData, osiagi:osiagi, KB:KB, KM:KM, RDT:RDT, tekstKB:tekstKB, tekstKM:tekstKM, tekstDKM:tesktDKM, DKM:DKM, uzytyTag:rollingData.uzytyTag},
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

async function  przerzutWybranejKM(rollingData,event ,d, id) {
    event.stopPropagation();
    event.preventDefault();
    const actor = rollingData.actor;
    let formulaKM = event.target.attributes[1].value;
    const przerzuconaKM =  await new Roll(formulaKM).evaluate();
    const rzutyKM = rollingData.rolls;
    if(rzutyKM[1].formula === przerzuconaKM.formula){
        rollingData.rolls[1] = przerzuconaKM;
    }
    else{
        rollingData.rolls[2] = przerzuconaKM;
    }

    const KB = rollingData.rolls[0].total;
    const KM = rollingData.rolls[1].total;
    const DKM = rollingData.rolls[2].total;
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

    const  {osiagi,iloscOsiagow} = await sprawdzRDT(rollingData,RDT,KB)
    const kDKM = rollingData.rolls[2].formula.replace(/d/g, "k");
    const tesktDKM = game.i18n.format("chlopcy.czat.wynik_DKM", { kDKM });
    if (rollingData.wartoscTagu !==5){
        rollingData.tag = ""
        rollingData.wartoscTagu = 0
    }
    if(rollingData.wartoscTagu ===5){
        rollingData.wartoscTagu = 4
    }
    const kKB = rollingData.rolls[0].formula.replace(/d/g, "k");
    formulaKM = rollingData.rolls[1].formula;
    const tekstKM = game.i18n.format("chlopcy.czat.wynik_KM", { kKM:formulaKM });
    let tekstKB = game.i18n.format("chlopcy.czat.wynik_KB", { kKB});
    rollingData.uzytyTag = id;
    rollingData.RDT = RDT;
    rollingData.osiagi = osiagi;
    rollingData.iloscOsiagow = iloscOsiagow;
    const template = await renderTemplate(
        "systems/chlopcy/tameplates/chat/rdt.hbs",
        {rollingData:rollingData, osiagi:osiagi, KB:KB, KM:KM, RDT:RDT, tekstKB:tekstKB, tekstKM:tekstKM, tekstDKM:tesktDKM, DKM:DKM, uzytyTag:rollingData.uzytyTag},
      );
      rollingData.RDT = RDT
      const chatData = {
        user: game.user?._id,
        speaker: ChatMessage.getSpeaker({ actor }),
        content: template,
        system: rollingData
    }
    await przerzuconaKM.toMessage(chatData);
    
    d.close()
    
}

async function dodajOdejmijJeden(rollingData,msg, actor, id) {
    let RDT = rollingData.RDT;
    const plus1 = (RDT + 1)
    const minus1 = (RDT - 1)
    const closerTo10 = Math.abs(plus1 - 10) < Math.abs(minus1 - 10) ? plus1 : minus1;
    rollingData.RDT = closerTo10; 
    RDT = rollingData.RDT;
    const KB = rollingData.KB;
    const KM = rollingData.KM
    const DKM = rollingData.DKM;
    const kDKM = rollingData?.rolls[2]?.formula.replace(/d/g, "k");
    let tesktDKM = "";
    if(kDKM !== undefined){
    tesktDKM = game.i18n.format("chlopcy.czat.wynik_DKM", { kDKM });
    }
    if (rollingData.wartoscTagu !==5){
        rollingData.tag = ""
        rollingData.wartoscTagu = 0
    }
    if(rollingData.wartoscTagu ===5){
        rollingData.wartoscTagu = 4
    }
    const kKB = rollingData.rolls[0].formula.replace(/d/g, "k");
    const formulaKM = rollingData?.rolls[1]?.formula;
    let tekstKM = "";
    if(formulaKM !== undefined){
        tekstKM = game.i18n.format("chlopcy.czat.wynik_KM", { kKM:formulaKM });
    }
    let tekstKB = game.i18n.format("chlopcy.czat.wynik_KB", { kKB});
    rollingData.uzytyTag = id;
    const  {osiagi, iloscOsiagow} = await sprawdzRDT(rollingData,RDT,KB)
    rollingData.RDT = RDT
    rollingData.plusMinus1 = true;
    rollingData.osiagi = osiagi;
    rollingData.iloscOsiagow = iloscOsiagow;
    const template = await renderTemplate(
        "systems/chlopcy/tameplates/chat/rdt.hbs",
        {rollingData:rollingData, osiagi:osiagi, KB:KB, KM:KM, RDT:RDT, tekstKB:tekstKB, tekstKM:tekstKM, tekstDKM:tesktDKM, DKM:DKM, uzytyTag:rollingData.uzytyTag},
      );
     
      const chatData = {
        user: game.user?._id,
        speaker: ChatMessage.getSpeaker({ actor }),
        content: template,
        system: rollingData
    }
    ChatMessage.create(chatData);
}

async function  uzyjWiezji(rollingData,msg, actor, id){
        
    const uzycieW = new uzycieWiezi(rollingData,msg, actor, id)
    uzycieW.pokazDostepneWiezi(rollingData,msg, actor, id)
}

async function dodajXP(actor, rollingData) {
    const obecneXP = actor.system.xp;
    const noweXP = obecneXP + 1;
    const updateData = {['system.xp']:noweXP}
    const actor2 = game.actors.get(actor._id);
    await actor2.update(updateData);
    const KB = rollingData.KB
    const content = game.i18n.format("chlopcy.czat.zdobylesXP", {KB})
    const chatData = {
        user: game.user?._id,
        speaker: ChatMessage.getSpeaker({ actor2 }),
        content: content
    }
    await ChatMessage.create(chatData);
    rollingData.dodanoXP = true;
    const kDKM = rollingData?.rolls[2]?.formula.replace(/d/g, "k");
    let tesktDKM = "";
    if(kDKM !== undefined){
        tesktDKM = game.i18n.format("chlopcy.czat.wynik_DKM", { kDKM });
    }
    const kKB = rollingData.rolls[0].formula.replace(/d/g, "k");
    const formulaKM = rollingData?.rolls[1]?.formula;
    let tekstKM = "";
    if(formulaKM !== undefined){
        tekstKM = game.i18n.format("chlopcy.czat.wynik_KM", { kKM:formulaKM });
    }
    let tekstKB = game.i18n.format("chlopcy.czat.wynik_KB", { kKB});
    const template = await renderTemplate(
        "systems/chlopcy/tameplates/chat/rdt.hbs",
        {rollingData:rollingData, osiagi:rollingData.osiagi, KB:rollingData.KB, KM:rollingData.KM, RDT:rollingData.RDT, tekstKB:tekstKB, tekstKM:tekstKM, tekstDKM:tesktDKM, DKM:rollingData.DKM, uzytyTag:rollingData.uzytyTag, uzyteWiezi: undefined},
    ); 
    const chatData2 = {
        user: game.user?._id,
        speaker: ChatMessage.getSpeaker({ actor2 }),
        content: template,
        system: rollingData
    }
    await ChatMessage.create(chatData2);
}

async function zdejmijOsiagiTykacza(actor, rollingData, id) {
    const tykaczArray = Array.from(game.chlopcy.zegarTykacza.instances.values()); 
    if(tykaczArray.length > 1){
        game.socket.emit("")
    }
    else{
        const tykacz = tykaczArray[0]
        const obecneOsiagiTykacza = tykacz.data.osiagiZegar;
        const pozostaleOsiagiTykacza = obecneOsiagiTykacza - rollingData.iloscOsiagow;
        console.log(obecneOsiagiTykacza,pozostaleOsiagiTykacza,rollingData.iloscOsiagow, tykacz)
        const activeGMs = game.users.filter(user => user.active && user.isGM);

        if (activeGMs.length > 0) {
            if(pozostaleOsiagiTykacza >0){
                const container = tykacz.element; 
                    if (container) {
                        container.find(".osiagi-input").val(pozostaleOsiagiTykacza);
                    }       
                game.socket.emit("system.chlopcy", {
                    type: "zmniejszOsiagiZegara",
                    noweOsiagi: pozostaleOsiagiTykacza,
                    tykacz: tykacz.data.tykacz
                });
            }
            else{
                game.socket.emit("system.chlopcy", {
                    type: "zamknijZegarTykacza",
                    tykacz: tykacz.data.tykacz
                  });
            }
        }
        else{
            const uwaga = game.i18n.localize("chlopcy.ui.mastaMusiBycObecnyZebyZmieniacTykacz")
            ui.notifications.warn(uwaga);

        }    
    }
}