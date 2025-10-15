import chlopcy_Utility from "../utility.mjs";

export class KoniecSesji extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    classes: ["chlopcy", "koniec-sesji"],
    window: { 
      title: "chlopcy.dialog.pytania_konca_sesji"
    },
    actions: {
      xp:  KoniecSesji.#onXP,
    },
    template: "systems/chlopcy/tameplates/dialog/koniec-sesji.hbs",
  };

  /** Render main dialog HTML */
  async _renderHTML() {
    return await chlopcy_Utility.renderTemplate(this.options.template);
  }

  async _replaceHTML(result, html) {
    html.innerHTML = result;
  }

  /** Handles the XP gain logic */
   static async #onXP() {
    if(game.user !== undefined){
    let actor = game.user.character;
    // --- Step 1: if user has no assigned actor, open selection dialog ---
    if (!actor) {
      const avaliableActors = game.actors
        .filter(a => a.type === "dzieciak" && (a.ownership[game.user._id] === 3 || a.ownership["default"] === 3))
        .map(a => ({ name: a.name, id: a.id }));
        this.element.style.display = "none"


      actor = await this._selectActorDialog(avaliableActors);
      if (!actor) return; // user cancelled selection
    }

    // --- Step 2: count selected checkboxes for XP gain ---
    const selectedGainXP = this.element.querySelectorAll('input[type="checkbox"]');
    let gainXP = 0;
    selectedGainXP.forEach(el => { if (el.checked) gainXP++; });

    // --- Step 3: update actor XP and show chat message ---
    const oldXP = Number(actor.system.xp) || 0;
    const newXP = oldXP + gainXP;

    const dialogMessage = game.i18n.format("chlopcy.chat.zyskaneXP", {
      name: actor.name,
      oldxp: oldXP,
      gainxp: gainXP,
      newxp: newXP,
    });

    await ChatMessage.create({
      user: game.user.id,
      content: `<span>${dialogMessage}</span>`,
    });

    await actor.update({ "system.xp": newXP });
    this.close()
}
  }

  /** Helper: show dialog to choose owned actor */
  async _selectActorDialog(avaliableActors) {
    const dialogContent = await chlopcy_Utility.renderTemplate(
      "systems/chlopcy/tameplates/dialog/wybierz-dzieciaka.hbs",
      { avaliableActors }
    );

    // Return a Promise that resolves once user picks an actor or cancels
    return new Promise((resolve) => {
      const selectActor = new foundry.applications.api.DialogV2({
        window: { title: game.i18n.localize("chlopcy.dialog.wybierz_aktor") },
        content: dialogContent,
        buttons: [
          {
            action: "select",
            label: game.i18n.localize("chlopcy.dialog.wybierz_dzieciaka"),
            default: true,
            callback: async (html) => {
              const actor = await this.wybieramDzieciaka(html);
              resolve(actor);
            },
          }
        ],
      });
      selectActor.render(true);
    });
  }

  /** Helper: extract chosen actor from dialog HTML */
  async wybieramDzieciaka(html) {
    const select = html.currentTarget.querySelector(".wybranyDzieciak");
    if (!select) return null;
    const actorID = select.value;
    return await game.actors.get(actorID);
  }
}
