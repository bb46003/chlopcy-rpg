export class naszywka extends ItemSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
          classes: ["naszywki_przody"],
          template: "systems/chlopcy/tameplates/item/naszywka.hbs",
          width: 500,
          height: 400          
        });
      }
      async getData() {
        const source = super.getData();
        const itemData = this.item.toObject(false);
        const context = {
          actor: actorData,
          editable: this.isEditable,
          limited: this.actor.limited,
          options: this.options,
          owner: this.actor.isOwner,
          source: source.system,
          system: itemData.system,
          type: this.actor.type,
          useKgs: this.actor.useKgs,
        };       
        
        return context
    }

}