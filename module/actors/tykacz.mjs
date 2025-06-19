import { zegarTykacza } from "../apps/zegary.mjs";

const BaseActorSheet =
  typeof foundry?.appv1?.sheets?.ActorSheet !== "undefined"
    ? foundry.appv1.sheets.ActorSheet
    : ActorSheet;

export class tykacz extends BaseActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["chlopcy"],
      template: "systems/chlopcy/tameplates/actor/tykacz.hbs",
      width: 500,
      height: "auto",
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
      } else {
        return html;
      }
    }
    context.system.opis = await enrich(context.system.opis);
    return context;
  }

  async activateListeners(html) {
    super.activateListeners(html);
    chlopcy_Utility.addHtmlEventListener(
      html,
      "click",
      ".uruchom-tykacz",
      (ev) => this.uruchomZegar(ev),
    );
  }
  async uruchomZegar(ev) {
    const target = ev.target;
    let id = target.id;
    if (target.id === "") {
      const closestButton = target.closest("button");
      id = closestButton.id;
    }
    const actor = await game.actors.get(id);

    zegarTykacza.initialise(actor);
    await actor.update({ ["system.aktywny"]: true });
    game.socket.emit("system.chlopcy", {
      type: "renderZegarTykacza",
      actor: actor,
    });
    actor.sheet.close();
  }
}
