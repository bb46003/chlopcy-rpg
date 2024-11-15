export class dzieciak extends ActorSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
          classes: ["chlopcy", "sheet", "actor", "character", "dialog-button"],
          template: "systems/chlopcy/tameplates/actor/dzieciak.hbs",
          width: 800,
          height: 960,
          
        });
      }
      async getData() {
        const source = super.getData();
        const actorData = this.actor.toObject(false);
       
        const context = {
          actor: actorData,
          editable: this.isEditable,
          items: this.actor.items,
          limited: this.actor.limited,
          options: this.options,
          owner: this.actor.isOwner,
          source: source.system,
          system: actorData.system,
          type: this.actor.type,
          useKgs: this.actor.useKgs,
        };
        const {
          bajker
        } = CONFIG.CHLOPCYCONFIG;
        Object.assign(context, { 
          bajker
        })
        
    async function enrich(html) {
      if (html) {
        return await TextEditor.enrichHTML(html, {
          secrets: context.actor.isOwner,
          async: true,
        });
      } else {
        return html;
      }
    }

    context.system.opis_postaci = await enrich(context.system.equipment);
    context.system.szczesliwe_mysli = await enrich(context.system.equipment);
    context.system.sprzet_osobisty = await enrich(context.system.equipment);
    

    
        return context
      }
}