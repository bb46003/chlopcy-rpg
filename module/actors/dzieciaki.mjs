export class dzieciak extends ActorSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
          classes: ["chlopcy", "sheet", "actor", "character", "dialog-button"],
          template: "systems/chlopcy/templates/dzieciak.hbs",
          width: 800,
          height: 960,
          
        });
      }
}