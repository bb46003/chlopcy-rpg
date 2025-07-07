import chlopcy_Utility from "../utility.mjs";

export class zegarTykacza extends foundry.applications.api.ApplicationV2 {
  static instances = new Map();
  static DEFAULT_OPTIONS = {
    form: {
      preventEscapeClose: true,
    },
  };
  constructor(tykacz) {
    super();

    const osiagiZegar =
      tykacz?.system.pozostaleOsiagi > 0
        ? tykacz?.system.pozostaleOsiagi
        : tykacz?.system.osiagi;
    const czasZegar =
      tykacz?.system.pozostalyCzas > 0
        ? tykacz?.system.pozostalyCzas
        : tykacz?.system.czasTrwania;

    this.data = {
      tykacz,
      osiagiZegar,
      czasZegar,
    };

    zegarTykacza.instances.set(this.id, this);
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "zegar-tykacza-app-" + foundry.utils.randomID(),
      classes: ["chlopcy"],
      popOut: false,
      width: "auto",
      height: "auto",
      template: "systems/chlopcy/templates/app/zegar-tykacza.hbs",
    });
  }

  async render(force = false, options = {}) {
    await super.render(force, options);
    const el = this.element;
    const header = el.querySelector("header.window-header");
    if (header) header.remove();
    const menu = el.querySelector("menu.controls-dropdown");
    if (menu) menu.remove();
    const contentSection = el.querySelector("section.window-content");
    if (contentSection) {
      contentSection.style.padding = "0px";
    }
    el.classList.add("zegar-tykacza-dom");
    if (game.user.isGM) {
      this.dodajAktywneListiery(el);
    }
    let uiLeft;
    let rect;
    if (game.release.generation < 13) {
      uiLeft = document.querySelector(
        ".main-controls.app.control-tools.flexcol",
      );
      const children = Array.from(uiLeft.children);
      const visibleChildren = children.filter((el) => el.offsetParent !== null);
      const lastElement = visibleChildren[visibleChildren.length - 1];
      rect = lastElement.getBoundingClientRect();
    } else {
      uiLeft = document.querySelector(".faded-ui");
      const children = Array.from(uiLeft.children);
      const visibleChildren = children.filter((el) => el.offsetParent !== null);
      const lastElement = visibleChildren[0].lastElementChild;
       rect = lastElement;
    }

    let offsetTop;
    if (game.release.generation < 13) {
      offsetTop = rect.top + 50;
    } else {
      offsetTop = rect.offsetTop + 50;
    }
    const zegary = document.querySelectorAll(".zegar");

    if (zegary.length !== 1) {
      for (let i = 1; i < zegary.length; i++) {
        const zegar = zegary[i - 1];
        offsetTop += zegar.clientHeight;
      }
      offsetTop += 10;
    }

    this.setPosition({ top: offsetTop, left: 20 });
    this.element.style.zIndex = 0;
  }

  async _renderHTML() {
    try {
      const html = await chlopcy_Utility.renderTemplate(
        "systems/chlopcy/tameplates/app/zegar-tykacza.hbs",
        {
          tykacz: this.data.tykacz,
        },
      );
      return html;
    } catch (e) {
      console.error("_renderHTML error:", e);
      throw e;
    }
  }

  async _replaceHTML(result, html) {
    html.innerHTML = result;
  }

  getData() {
    const data = super.getData();
    return {
      ...data,
      ...this.data,
    };
  }
  async close(options = {}) {
    if (options.closeKey) {
      return false;
    }
    return super.close(options);
  }

  dodajAktywneListiery(html) {
    const zamknięcie = html.querySelector(".nazwa-zegar i.fas.fa-window-close");
    zamknięcie.addEventListener("click", (ev) => this.closeApp(ev));
    const minusOsiągi = html.querySelector(".osiagi i.fa.fa-minus.osiagi");
    minusOsiągi.addEventListener("click", (ev) => this.zmiejszOsiagi(ev));
    const minusCzas = html.querySelector(".czas-trwania i.fa.fa-minus.czas");
    if (minusCzas) {
      minusCzas.addEventListener("click", (ev) => this.zmiejszCzas(ev));
    }
    const plusOsiagi = html.querySelector(".osiagi i.fa.fa-plus.osiagi");
    plusOsiagi.addEventListener("click", (ev) => this.zwiekszOsiagi(ev));
  }

  async closeApp(ev) {
    if (this.data?.tykacz) {
      await this.data.tykacz.update({ ["system.aktywny"]: false });
    }

    game.socket.emit("system.chlopcy", {
      type: "zamknijZegarTykacza",
      tykacz: this.data?.tykacz,
    });

    zegarTykacza.instances.delete(this.id);
    this.close();
    const przeciwnikExists = [...zegarTykacza.instances.values()].some(
      (instance) => instance.data?.tykacz?.system.jestPrzeciwnikiem,
    );
    if (!przeciwnikExists) {
      await game.combat?.endCombat();
      await game.combats.apps[0]?._popout?.close();
    }
  }

  async zmiejszOsiagi(ev) {
    const noweOsiagi = this.data.osiagiZegar - 1;
    this.data.osiagiZegar = noweOsiagi;
    await this.data.tykacz.update({ ["system.pozostaleOsiagi"]: noweOsiagi });
    this.element.querySelector(".osiagi-input").value = noweOsiagi;
    if (noweOsiagi <= 0) this.closeApp(ev);
    game.socket.emit("system.chlopcy", {
      type: "zmniejszOsiagiZegara",
      noweOsiagi,
      tykacz: this.data?.tykacz,
    });
  }

  async zwiekszOsiagi(ev) {
    const noweOsiagi = this.data.osiagiZegar + 1;
    this.data.osiagiZegar = noweOsiagi;
    await this.data.tykacz.update({ ["system.pozostaleOsiagi"]: noweOsiagi });
    this.element.querySelector(".osiagi-input").value = noweOsiagi;
    game.socket.emit("system.chlopcy", {
      type: "zmniejszOsiagiZegara",
      noweOsiagi,
      tykacz: this.data?.tykacz,
    });
  }

  async zmiejszCzas(ev) {
    const nowyCzas = this.data.czasZegar - 1;
    this.data.czasZegar = nowyCzas;
    await this.data.tykacz.update({ ["system.pozostalyCzas"]: nowyCzas });
    this.element.querySelector(".czas-trwania-input").value = nowyCzas;
    if (nowyCzas <= 0) this.closeApp(ev);
    game.socket.emit("system.chlopcy", {
      type: "zmniejszCzasZegara",
      nowyCzas,
      tykacz: this.data?.tykacz,
    });
  }

  static async initialise(tykacz) {
    const instance = new zegarTykacza(tykacz);
    await instance.render(true);
    if (
      tykacz.system.jestPrzeciwnikiem &&
      game.user.isGM &&
      game.combats.size === 0
    ) {
      const walka = await Combat.create();
      await walka.update({ active: true, round: 1, turn: 0 });
      await this.dodajPostacieDowalki(walka);
      game.combats.apps[0].renderPopout(true);
    }
  }

  static async dodajPostacieDowalki(walka) {
    const dzieciaki = game.actors.filter((actor) => actor.type === "dzieciak");
    const template = await chlopcy_Utility.renderTemplate(
      "systems/chlopcy/tameplates/dialog/wybierz-dziaciaki-do-walki.hbs",
      {
        dzieciaki,
      },
    );
    const tytul = game.i18n.localize("chlopcy.dialog.wyborDzieciakiDoWalki");
    const dodajPostacieDoWaki = new foundry.applications.api.DialogV2({
      window: { title: tytul },
      content: template,
      buttons: [
        {
          action: "dodaj",
          label: game.i18n.localize("chlopcy.dialog.dodajDoWalki"),
          callback: async () => {
            const wybraneDzieciaki = Array.from(
              document.querySelectorAll(".wybrany-dzieciak"),
            ).filter((i) => i.checked);
            const combatants = wybraneDzieciaki
              .map((input, i) => {
                const actor = game.actors.get(input.value);
                return actor
                  ? {
                      actorId: actor.id,
                      name: actor.name,
                      initiative: i + 1,
                      hidden: false,
                    }
                  : null;
              })
              .filter(Boolean);
            await walka.createEmbeddedDocuments("Combatant", combatants);
          },
          default: true,
        },
      ],
    });

    dodajPostacieDoWaki.render(true);
    setTimeout(() => {
      const element = dodajPostacieDoWaki.element;
      const checkboxAll = element.querySelector(
        '.wybrany-dzieciak[value="all"]',
      );
      if (!checkboxAll) return;
      checkboxAll.addEventListener("change", (event) => {
        const checkboxes = element.querySelectorAll(
          '.wybrany-dzieciak:not([value="all"])',
        );
        const isChecked = event.target.checked;
        checkboxes.forEach((cb) => {
          cb.checked = isChecked;
        });
      });
    }, 0);
  }
}
