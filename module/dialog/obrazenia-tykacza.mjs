import chlopcy_Utility from "../utility.mjs";
 

export class obrazeniaTykacza extends Dialog {
     constructor(daneAktywnychTykaczy) {
        super(daneAktywnychTykaczy);
        (this.daneAktywnychTykaczy = daneAktywnychTykaczy)          
    }
    async activateListeners(html) {
        super.activateListeners(html);
        chlopcy_Utility.addHtmlEventListener(html,"change", ".wartosc-uzytych-wiezi", (event) => this.dostosujWartoscWiezi(event));
        chlopcy_Utility.addHtmlEventListener(html,"change", ".typ-uzytych-wiezi", (event) => this.dostosujWartoscWieziTyp(event));
        chlopcy_Utility.addHtmlEventListener(html,"click",".toggle-section", (event) => this.otworzSekcje(event))

    }
    
    async showDialog() {
    const combatants = game.combat?.combatants ?? [];
    const html = await chlopcy_Utility.renderTemplate("systems/chlopcy/tameplates/dialog/obrazenia-tykacza.hbs", {
        tykacze: Object.values(this.daneAktywnychTykaczy),
        combatants: combatants
    });

    new obrazeniaTykacza({
        title: "Przydziel osiągi tykaczy",
        content: html,
        buttons: {
            ok: {
                label: "OK",
                callback: html => {
                // tutaj logika pobierania danych
                }
            },
            cancel: {
                label: "Anuluj"
            }
           
            
        },
        default: "ok"
    }).render(true);

    }
    async otworzSekcje(html){
            const targetSelector = this.dataset.target;
            const target = html.find(targetSelector);
            target.toggleClass("hidden");
            this.textContent = (target.hasClass("hidden") ? "▶" : "▼") + this.textContent.slice(1);
        
    }
}