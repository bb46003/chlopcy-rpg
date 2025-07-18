import rzutDoTarczy from "../roll/rolling.mjs";
import chlopcy_Utility from "../utility.mjs";

const BaseActorSheet =
  typeof foundry?.appv1?.sheets?.ActorSheet !== "undefined"
    ? foundry.appv1.sheets.ActorSheet
    : ActorSheet;

export class dzieciak extends BaseActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["chlopcy", "sheet", "actor", "character", "dialog-button"],
      template: "systems/chlopcy/tameplates/actor/dzieciak.hbs",
      width: 800,
      height: 960,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "glowna",
        },
      ],
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
    const { bajker } = CONFIG.CHLOPCYCONFIG;
    Object.assign(context, {
      bajker,
    });

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

    context.system.opis_postaci = await enrich(context.system.opis_postaci);
    context.system.szczesliwe_mysli = await enrich(
      context.system.szczesliwe_mysli,
    );
    //context.system.sprzet_osobisty = await enrich(context.system.sprzet_osobisty);

    return context;
  }

  async activateListeners(html) {
    super.activateListeners(html);

    chlopcy_Utility.addHtmlEventListener(
      html,
      "change",
      ".kostki-pyłek",
      (ev) => this.dawkiPylku(ev),
    );
    chlopcy_Utility.addHtmlEventListener(html, "click", "label.inside", (ev) =>
      this.dawkiPylku(ev),
    );
    chlopcy_Utility.addHtmlEventListener(
      html,
      "change",
      ".cecha-wartosc",
      (ev) => this.wartoscTagu(ev),
    );
    chlopcy_Utility.addHtmlEventListener(html, "change", ".stan", (ev) =>
      this.zmianaStanu(ev),
    );
    chlopcy_Utility.addHtmlEventListener(html, "change", ".bangarang", (ev) =>
      this.zmianaBangarang(ev),
    );
    chlopcy_Utility.addHtmlEventListener(html, "change", ".xp", (ev) =>
      this.zmianaXp(ev),
    );
    chlopcy_Utility.addHtmlEventListener(
      html,
      "change",
      ".sakwy-checkbo",
      (ev) => this.zmianaSakwy(ev),
    );
    chlopcy_Utility.addHtmlEventListener(html, "click", ".cecha", (ev) =>
      this.rzut(ev),
    );
    chlopcy_Utility.addHtmlEventListener(html, "click", ".dodaj-wiezi", (ev) =>
      this.dodajWięzi(ev),
    );
    chlopcy_Utility.addHtmlEventListener(
      html,
      "change",
      ".wartosc-wiezi",
      (ev) => this.wartoscWiezi(ev),
    );
    chlopcy_Utility.addHtmlEventListener(html, "click", ".usun-wiez", (ev) =>
      this.usunWięzi(ev),
    );
    chlopcy_Utility.addHtmlEventListener(
      html,
      "click",
      ".top-section-label-bangarang",
      (ev) => this.uzyjPunktowBANGARANG(ev),
    );
    chlopcy_Utility.addHtmlEventListener(
      html,
      "change",
      ".znaczniki-plecow input[type='checkbox']",
      (ev) => this.zmianaNaszywekPlecy(ev),
    );
    chlopcy_Utility.addHtmlEventListener(
      html,
      "click",
      '[data-tab="kurta-i-wspomnienia"]',
      (ev) => this.dynamicznyStyl(ev),
    );
    chlopcy_Utility.addHtmlEventListener(
      html,
      "click",
      "button.usun-nazywke",
      (ev) => this.usunNaszywki(ev),
    );
    chlopcy_Utility.addHtmlEventListener(
      html,
      "click",
      "a#label-przody",
      (ev) => this.dodajNaszywkę(ev),
    );
    chlopcy_Utility.addHtmlEventListener(
      html,
      "click contextmenu",
      ".naszywka-przody-obrazek",
      (ev) => this.owtorzNaszywke(ev),
    );
    chlopcy_Utility.addHtmlEventListener(
      html,
      "click",
      '[data-action="roll-dice"]',
      (ev) => this.rzutNaPylek(ev),
    );
    chlopcy_Utility.addHtmlEventListener(
      html,
      "click",
      '[for="uzycie_pylku"]',
      (ev) => this.uzyciePylku(ev),
    );
    chlopcy_Utility.addHtmlEventListener(
      html,
      "click",
      ".top-section-label-twardziel",
      (ev) => this.rzutNaTwardziela(ev),
    );
  }

  async _onDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add("drag-over");
  }
  async _onDragLeave(event) {
    event.currentTarget.classList.remove("drag-over");
  }
  async _onDrop(event) {
    event.preventDefault();
    const data = event.dataTransfer;
    if (data) {
      const droppedItem = JSON.parse(data.getData("text/plain"));

      const droppedType = droppedItem.type;
      if (droppedType === "Item") {
        const itemUUID = droppedItem.uuid;
        const item = await fromUuid(itemUUID);
        const itemData = item.toObject();
        const actor = this.actor;
        await actor.createEmbeddedDocuments("Item", [itemData]);
        await actor.update();
      }
    }
  }
  async dawkiPylku(ev) {
    ev.preventDefault();
    const id = Number(ev.currentTarget.outerText);
    let targetId = ev.target.id;
    let val = document.querySelector(
      `input[type="checkbox"]#${CSS.escape(targetId)}`,
    ).checked;
    let updateData = {};
    const currentPylek = this.actor.system.pylek[id];

    for (let i = 1; i <= 6; i++) {
      if (i < id && val === currentPylek) {
        updateData[`system.pylek.${i}`] = true;
      } else {
        updateData[`system.pylek.${i}`] = false;
      }
      if (i === id) {
        updateData[`system.pylek.${i}`] = !currentPylek;
      }
    }

    await this.actor.update(updateData);
  }
  async rzutNaPylek(ev) {
    ev.preventDefault();
    let roll = new Roll("1d6");
    await roll.evaluate();
    let dawkiPyłku = this.actor.system.pylek;
    let obecnieZaznaczonaDawka = Math.max(
      ...Object.entries(dawkiPyłku)
        .filter(([_, value]) => value === true)
        .map(([key]) => Number(key)),
      0,
    );
    let content = "";
    const czasDzialania = roll.total;
    let kolejnaDawka;
    if (obecnieZaznaczonaDawka + 1 >= 6) {
      kolejnaDawka = 6;
    } else {
      kolejnaDawka = obecnieZaznaczonaDawka + 1;
    }
    await this.actor.update({ [`system.pylek.${kolejnaDawka}`]: true });
    dawkiPyłku = this.actor.system.pylek;
    obecnieZaznaczonaDawka = Math.max(
      ...Object.entries(dawkiPyłku)
        .filter(([_, value]) => value === true)
        .map(([key]) => Number(key)),
      0,
    );
    if (obecnieZaznaczonaDawka >= czasDzialania) {
      let efekt = "";
      switch (czasDzialania) {
        case 1:
        case 2:
          efekt = game.i18n.localize("chlopcy.przytkanie");
          break;
        case 3:
        case 4:
          efekt = game.i18n.localize("chlopcy.krwawienie");
          break;
        case 5:
        case 6:
          efekt = game.i18n.localize("chlopcy.odciecie");
          break;
      }

      content = game.i18n.format("chlopcy.czat.przyjeciepylkuZEfektem", {
        actor: this.actor.name,
        efekt: efekt,
        czasDzialania: czasDzialania,
      });
    } else {
      content = game.i18n.format("chlopcy.czat.przyjeciepylkuBezEfektu", {
        actor: this.actor.name,
        czasDzialania: czasDzialania,
      });
    }

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: game.user.character }),
      flavor: content,
    });
  }
  async uzyciePylku(ev) {
    const checkbox = document.getElementById("uzycie_pylku");
    this.actor.update({ ["system.pod_wplywem_pylku"]: !checkbox.checked });
  }
  async wartoscTagu(ev) {
    const target = ev.target.checked;
    const tagName = ev.target.parentNode.attributes[1].nodeValue;
    let value = this.actor[tagName];
    if (target) {
      value = Number(ev.target.value);
    } else {
      value = Number(ev.target.value) - 1;
    }
    await this.actor.update({ [`${tagName}`]: value });
  }
  async zmianaStanu(ev) {
    const target = ev.target.checked;
    let value = Number(ev.target.value);
    if (target) {
      await this.actor.update({ ["system.stan"]: value });
    } else {
      value = Number(ev.target.value) - 1;
      if (value === 0) {
        value = 1;
      }
      await this.actor.update({ ["system.stan"]: value });
    }
  }
  async zmianaBangarang(ev) {
    const target = ev.target.checked;
    let value = Number(ev.target.value);
    const ID = ev.target.id;
    if (target) {
      await this.actor.update({ [`system.bangarang.${ID}`]: value });
    } else {
      value = Number(ev.target.value) - 1;
      await this.actor.update({ [`system.bangarang.${ID}`]: value });
    }
  }
  async zmianaXp(ev) {
    const target = ev.target.checked;
    let value = Number(ev.target.value);
    if (target) {
      await this.actor.update({ ["system.xp"]: value });
    } else {
      value = Number(ev.target.value) - 1;
      await this.actor.update({ ["system.xp"]: value });
    }
  }
  async zmianaSakwy(ev) {
    const target = ev.target.checked;
    let value = Number(ev.target.value);
    if (target) {
      await this.actor.update({ ["system.sakwy"]: value });
    } else {
      value = Number(ev.target.value) - 1;
      await this.actor.update({ ["system.sakwy"]: value });
    }
  }
  async rzut(ev) {
    const cecha = ev.target.innerHTML.toLowerCase();
    const roll = new rzutDoTarczy(this.actor, cecha);
    roll.preRollDialog();
  }
  async dodajWięzi(ev) {
    const actor = this.actor;
    const othersActors = game.actors.filter(
      (actorX) => actorX.type === "dzieciak" && actorX !== actor,
    );
    const dialogTemplate = await chlopcy_Utility.renderTemplate(
      "systems/chlopcy/tameplates/dialog/dodaj-wiezi.hbs",
      { othersActors: othersActors },
    );
    const tytul = game.i18n.localize("chlopcy.dialog.wybierz_postac_do_wiezi");
    const d = new Dialog({
      title: tytul,
      content: dialogTemplate,
      buttons: "",
      render: (html) => {
        chlopcy_Utility.addHtmlEventListener(
          html,
          "click",
          ".dodaj-do-katy-wiezi",
          (event) => this.dodajPostacDoWiezi(event),
        );
      },
    });
    await d.render(true);
  }
  async dodajPostacDoWiezi(event) {
    event.preventDefault();
    const actor = this.actor;
    const target = event.target.closest(".dodaj-postac").id;
    const actorZWiezi = game.actors.get(target);
    const updateData = {
      [`system.wiezi.${target}`]: {
        name: actorZWiezi.name,
        wartosc: 0,
        img: actorZWiezi.img,
      },
    };
    await actor.update(updateData);
  }
  async wartoscWiezi(ev) {
    const target = ev.target.parentNode.parentElement.id;
    const wartoscWiezi = ev.target.value;
    const actor = this.actor;
    const updateData = {
      [`system.wiezi.${target}`]: {
        wartosc: wartoscWiezi,
      },
    };
    await actor.update(updateData);
  }
  async usunWięzi(ev) {
    const target = ev.target; // Get the parentNode of the target
    const closestElement = target.closest(".postac-z-wiezami");
    const ID = closestElement.id;
    const actor = this.actor;
    let wiezi = actor.system.wiezi;
    delete wiezi[ID];
    let updateData = {
      [`system.wiezi`]: null,
    };
    await actor.update(updateData);
    updateData = {
      [`system.wiezi`]: wiezi,
    };
    await actor.update(updateData);
  }
  async uzyjPunktowBANGARANG(ev) {
    const typ = ev.currentTarget.innerText.toLowerCase();
    const typOrignial = ev.currentTarget.innerText;
    const actor = this.actor;

    const obecnaWartsc = actor.system.bangarang[typ];
    if (obecnaWartsc >= 3) {
      const nowaWartosc = obecnaWartsc - 3;
      const updateData = { [`system.bangarang.${typ}`]: nowaWartosc };
      await actor.update(updateData);
      const content = game.i18n.format("chlopcy.czat.uzytoBangarang", {
        typ: typOrignial,
      });
      const chatData = {
        user: game.user?._id,
        speaker: ChatMessage.getSpeaker({ actor }),
        content: content,
      };
      await ChatMessage.create(chatData);
    } else {
      ui.notifications.warn(
        game.i18n.localize("chlopcy.ui.nieMaszWystarczajacoBANGARANG"),
      );
    }
  }
  async zmianaNaszywekPlecy(ev) {
    const target = ev.currentTarget;
    const jestZaznaczony = target.checked;
    const parentContainer = target.closest(".znaczniki-plecow");
    const checkboxes = Array.from(
      parentContainer.querySelectorAll('input[type="checkbox"]'),
    );
    const targetIndex = checkboxes.indexOf(target);
    let updateData = {};
    let wartosc;
    checkboxes.forEach((cb, index) => {
      if (index <= targetIndex && jestZaznaczony === true) {
        wartosc = jestZaznaczony;
      } else if (index > targetIndex && jestZaznaczony === false) {
        wartosc = jestZaznaczony;
      } else if (index <= targetIndex && jestZaznaczony === false) {
        wartosc = cb.checked;
      } else if (index > targetIndex && jestZaznaczony === true) {
        wartosc = !jestZaznaczony;
      }
      if (cb.name === "system.plecy.lokacja" && wartosc === false) {
        updateData["system.plecy.lokacja-text"] = "";
      }

      updateData[cb.name] = wartosc;
    });

    const actor = this.actor;
    await actor.update(updateData);
  }
  async dynamicznyStyl(ev) {
    const przody = document.querySelector(".przody");
    const plecy = document.querySelector(".plecy");
    const przodyWysokosc = przody.offsetHeight;
    const plecyWysokosc = plecy.offsetHeight;
    const maxWysokosc = Math.max(przodyWysokosc, plecyWysokosc);
    if (plecyWysokosc === maxWysokosc) {
      plecy.style.borderLeft = "1px dashed black";
    } else {
      przody.style.borderRight = "1px dashed black";
    }
  }
  async usunNaszywki(ev) {
    const button = ev.target;
    const ID = button.id;
    const item = await this.actor.items.get(ID);

    const innerText = game.i18n.format("chlopcy.dialog.usunNaszywke", {
      name: item.name,
    });
    const d = new Dialog({
      title: game.i18n.format("chlopcy.dialog.usunNaszywkeTytul", {
        name: item.name,
      }),
      content: `
            <p>${innerText}</p>
          `,
      buttons: {
        delete: {
          label: game.i18n.localize("Delete"),
          callback: async () => {
            await this.actor.deleteEmbeddedDocuments("Item", [ID]);
          },
        },

        cancel: {
          label: game.i18n.localize("Cancel"),
          callback: () => {
            ui.notifications.info("Deletion canceled.");
          },
        },
      },
      default: "cancel",
      close: () => {},
    });
    d.render(true);
  }
  async dodajNaszywkę(ev) {
    console.log(ev);
  }
  async owtorzNaszywke(ev) {
    const id = ev.target.id;
    const actor = this.actor;
    const item = actor.items.get(id);
    if (ev.type === "contextmenu") {
      item.sheet.render(true);
    }
  }
  async rzutNaTwardziela(ev) {
    const actor = this.actor;
    const obecnyTwardziel = actor.system.twardziel.aktualne;
    const rzutNaTwardziela = new Roll("1d8");
    await rzutNaTwardziela.evaluate();
    const wynikRzutu = rzutNaTwardziela.total;
    let content;
    if (wynikRzutu <= obecnyTwardziel) {
      content = game.i18n.localize("chlopcy.czat.pozytywnyWynikTwardziela");
      rzutNaTwardziela.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: actor.name }),
        flavor: content,
      });
    } else {
      content = game.i18n.localize("chlopcy.czat.negatywnyWynikTwardziela");
      rzutNaTwardziela.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: actor.name }),
        flavor: content,
      });
      await actor.update({ ["system.stan"]: actor.system.stan + 1 });
    }
  }
}
