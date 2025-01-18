import { zegarTykacza } from "../apps/zegary.mjs";

export class tykacz extends ActorSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
          classes: ["chlopcy"],
          template: "systems/chlopcy/tameplates/actor/tykacz.hbs",
          width: 500,
          height: "auto"
          
        });
    }
    async getData() {
        const source = super.getData();
        const actorData = this.actor.toObject(false);
        const context = {
          actor: actorData,
          editable: this.isEditable,
          limited: this.actor.limited,
          options: this.options,
          owner: this.actor.isOwner,
          source: source.system,
          system: actorData.system,
          type: this.actor.type,
          useKgs: this.actor.useKgs,
        };       
        async function enrich(html) {
            if (html) {
                return await TextEditor.enrichHTML(html, {
                secrets: context.actor.isOwner,
                async: true,
            });
            } 
            else {
                return html;
            }
        }
        context.system.opis = await enrich(context.system.opis);  
        return context
    }

    async activateListeners(html) {
        super.activateListeners(html);
        html.on("click",".uruchom-tykacz", (ev) => this.uruchomZegar(ev))
    }
    async uruchomZegar(ev){
        const target = ev.target;
        const actor = game.actors.get(target.id);
        const nowyTykacz = new zegarTykacza(actor);
        nowyTykacz.render(true)
    }
}