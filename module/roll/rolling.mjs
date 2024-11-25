export  default class rzutDoTarczy {

    constructor(actor, cecha) {
        this.actor = actor;
        this.cecha = cecha;

    }

    async preRollDialog(){

        const actor = this.actor;
        const cecha = this.cecha;
        const stan = this. actor.system.stan;
        const tagi = actor.system.tagi;
      
        const tagiNazwy = Object.values(tagi)
        .filter(tag => tag.opis !== "") // Exclude invalid options
        .map(tag => ({
          label: tag.opis,
          value: tag.wartosc
        }));
        console.log(cecha)
        const html = await renderTemplate( "systems/chlopcy/tameplates/dialog/pytanie-o-tag.hbs", {tagi:tagiNazwy, stan:stan})
        const label = game.i18n.localize("TABLE.Roll");          
        const preroll = new Dialog({
            title: game.i18n.localize("chlopcy.wybierz_tag"),
            content: html,
            buttons: { 
                roll: { 
                    label: label,
                    callback: async () => {
                        const tagi = document.querySelector(".wybrany-tag")
                        let wybranyTag = null;
                        if(tagi !== null){
                            wybranyTag = tagi.querySelector("option:checked");
                        }
                        
                        await this.prepareRollingData(actor, cecha, stan, wybranyTag);
                    }
                },
                cancel: {
                    label: "Anuluj"
                }
            },
            default: "roll" 
        });
            preroll.render(true,{height:230});
         
    }
        
async prepareRollingData(actor, cecha, stan, wybranyTag){
    const pyłek = actor.system.pod_wplywem_pylku;
    let KB = "";
    if(pyłek){
        KB = "2d10";
    }
    else{
        KB = "1d20"
    }
    let wartoscTagu = 0;
    let nazwaTagu = "";
    if(wybranyTag !== null){    
        wartoscTagu = Number(wybranyTag.value);
        nazwaTagu = wybranyTag.textContent;
    }
   const nazwaCechy = game.i18n.localize(`chlopcy.${cecha}`);
   const wartoscCechy = actor.system.cechy[cecha].wartosc;

    const rollingData = {
        KB: KB,
        cecha: nazwaCechy,
        wartoscCechy: wartoscCechy,
        stan: stan,
        tag: nazwaTagu,
        wartoscTagu: wartoscTagu,
        actor: actor
    }
    this.roll(rollingData)
}
async roll(rollingData){
    const RKB = await new Roll(rollingData.KB).evaluate();
    const wynikKB = RKB.total;
    let osiagi = ""
    if(wynikKB === 10){
        osiagi = game.i18n.localize("chlopcy.rzut.BANGARANG");        
    }
    else if(wynikKB === 9 || wynikKB === 11) {
        osiagi = game.i18n.localize("chlopcy.rzut.dwa_osiagi")
    }
    else if (wynikKB === 8 || wynikKB === 12){
        osiagi = game.i18n.localize("chlopcy.rzut.jeden_osiag")
    }
    else if (wynikKB === 20){
        osiagi = game.i18n.localize("chlopcy.rzut.klopoty")
    }
    else{
        osiagi = game.i18n.localize("chlopcy.rzut.brak_osiagow")
    }
    const kKB = rollingData.KB.replace(/d/g, "k");
    const tekstKB = game.i18n.format("chlopcy.czat.wynik_KB", {kKB: kKB });
    console.log(kKB, tekstKB)
    const actor = rollingData.actor;
    const template = await renderTemplate(
        "systems/chlopcy/tameplates/chat/rdt.hbs",
        {rollingData:rollingData, osiagi:osiagi, KB:wynikKB, tekstKB:tekstKB, KM:0},
      );

    const chatData = {
        user: game.user?._id,
        speaker: ChatMessage.getSpeaker({ actor }),
        roll: RKB,
        content: template,
        system: rollingData
    }
    await RKB.toMessage(chatData);
    

    }
}
    
