import chlopcy_Utility from "../utility.mjs";

export class obrazeniaTykacza extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    window: { title: "Przydziel osiągi tykaczy" },
    template: "systems/chlopcy/tameplates/dialog/obrazenia-tykacza.hbs",
  };

  constructor(daneAktywnychTykaczy, combatants) {
    super(daneAktywnychTykaczy, combatants);
    this.daneAktywnychTykaczy = daneAktywnychTykaczy;
    this.combatants = combatants;
  }

  async getData() {
    try {
      return {
        daneAktywnychTykaczy: this.daneAktywnychTykaczy,
        combatants: Array.from(this.combatants),
      };
    } catch (e) {
      console.error("getData error:", e);
      return {};
    }
  }

  async _renderHTML() {
    try {
      return await chlopcy_Utility.renderTemplate(this.options.template, {
        tykacze: Object.values(this.daneAktywnychTykaczy),
        combatants: this.combatants,
      });
    } catch (e) {
      console.error("_renderHTML error:", e);
      throw e;
    }
  }

  async _replaceHTML(result, html) {
    html.innerHTML = result;
  }

  _onRender() {
    const itemQuantities = this.element.querySelectorAll(".toggle-section");
    for (const input of itemQuantities) {
      input.addEventListener("click", (e) => {
        this.otworzSekcje(e);
      });
    }
    const combatants = this.combatants;
    const tykacze = this.daneAktywnychTykaczy;
    for (const [tykaczId, tykacz] of Object.entries(tykacze)) {
      const pozostaleOsiagi = tykacz.pozostaleOsiagi;
      const perCombatant = Math.round(pozostaleOsiagi / combatants.size);
      const zdjeteOsiagi = tykacz.zdjeteOsiagi;
      const isEmpty = !zdjeteOsiagi || Object.keys(zdjeteOsiagi).length === 0;
      let allSame = false;
      if (!isEmpty) {
        const values = Object.values(zdjeteOsiagi);
        allSame = values.every((v) => v === values[0]);
      }

      let combatantWithExtra = null;
      if (isEmpty || allSame) {
        combatantWithExtra = combatants.values().next().value; // first combatant
      } else {
        let lowestValue = Infinity;
        for (const combatant of combatants) {
          const value = zdjeteOsiagi[combatant.actorId] ?? 0;
          if (value < lowestValue) {
            lowestValue = value;
            combatantWithExtra = combatant;
          }
        }
      }

      for (const combatant of combatants) {
        const selectId = `auto-${tykaczId}-${combatant.id}`;
        const selectElement = this.element.querySelector(`#${selectId}`);
        let value = perCombatant;
        if (selectElement) {
          if (perCombatant * combatants.size > pozostaleOsiagi) {
            value =
              combatant === combatantWithExtra
                ? perCombatant - 1
                : perCombatant;
          }
          if (perCombatant * combatants.size < pozostaleOsiagi) {
            value =
              combatant === combatantWithExtra
                ? perCombatant + 1
                : perCombatant;
          }
          selectElement.innerHTML = "";
          for (let i = 0; i <= value; i++) {
            const option = document.createElement("option");
            option.value = i.toString();
            option.textContent = i.toString();
            selectElement.appendChild(option);
          }
          selectElement.value = value.toString();
        }
      }
      const elements = document.querySelectorAll(
        `[id^="auto-${tykaczId}"], [id^="manual-${tykaczId}"]`,
      );

      for (const input of elements) {
        input.addEventListener("change", (e) => {
          this.upateDostepnyDmg(e, tykacz, elements);
        });
      }
      const przyciskWpierdolu = this.element.querySelector(".rozdaj-wpierdol");
      przyciskWpierdolu.addEventListener(
        "click",
        async () => await this.rozdajWpierdol(),
      );
    }
  }
  async upateDostepnyDmg(e, tykacz, elements) {
    const dostepneOsiagi = tykacz.pozostaleOsiagi;
    const wybraneOsiagi = e.currentTarget.value;
    const pozostałeOsiągi = dostepneOsiagi - wybraneOsiagi;
    const isOdd = pozostałeOsiągi % 2 !== 0;
    const elementsArray = Array.from(elements);
    const pozostaleSelektory = elementsArray.filter((el) => {
      if (el === e.currentTarget) return false;
      const hiddenSection = el.closest("section.hidden");
      if (hiddenSection) return false;
      return true;
    });
    let dostępneOsiągi = pozostałeOsiągi / pozostaleSelektory.length;
    if (isOdd) {
      dostępneOsiągi = Math.ceil(pozostałeOsiągi / pozostaleSelektory.length);
    }
    pozostaleSelektory.forEach((selectElement) => {
      const wybranaWartosc = selectElement.value;
      selectElement.innerHTML = "";
      for (let i = 0; i <= dostępneOsiągi; i++) {
        const option = document.createElement("option");
        option.value = i.toString();
        option.textContent = i.toString();
        selectElement.appendChild(option);
        selectElement.value = wybranaWartosc;
      }
    });
    this.aktywujPrzyciskRozdaniaWpierdolu(
      e.target.parentNode.parentNode.parentElement,
    );
  }

  async otworzSekcje(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const button = event.currentTarget;
    const targetSelector = button.dataset.target;
    const target = this.element.querySelector(targetSelector);
    const isHidden = target.classList.contains("hidden");
    if (isHidden) {
      target.classList.remove("hidden");
      button.textContent = button.textContent.replace("▶", "▼");
      const allButtons = this.element.querySelectorAll("button[data-target]");
      this.aktywujPrzyciskRozdaniaWpierdolu(target);
      allButtons.forEach((btn) => {
        if (btn === button) return;

        const section = this.element.querySelector(btn.dataset.target);
        if (!section.classList.contains("hidden")) {
          section.classList.add("hidden");
          btn.textContent = btn.textContent.replace("▼", "▶");
        }
      });
    } else {
      target.classList.add("hidden");
      button.textContent = button.textContent.replace("▼", "▶");
    }
    const allSection = document.querySelectorAll(".toggle-content");
    const disableButton = Array.from(allSection).every((section) =>
      section.classList.contains("hidden"),
    );
    const przyciskWpierdolu = this.element.querySelector(".rozdaj-wpierdol");
    const jestNieAktywny = przyciskWpierdolu.hasAttribute("disabled");
    if (disableButton && !jestNieAktywny) {
      przyciskWpierdolu.setAttribute("disabled", "");
    }
  }

  async aktywujPrzyciskRozdaniaWpierdolu(element) {
    const tykacze = element.querySelectorAll(".pojedynczy-tykacz");
    let aktywujPrzycisk = false;
    tykacze.forEach((tykacz) => {
      const pozostaleOsiagi = Number(tykacz.dataset.pozostaleosiagi);
      const combatants = tykacz.querySelectorAll(".dzieciak-name");
      let rozdawnyWpierdol = 0;
      combatants.forEach((dzieciak) => {
        const select = dzieciak.querySelector("select");
        rozdawnyWpierdol += Number(select.value);
      });
      if (rozdawnyWpierdol === pozostaleOsiagi) {
        aktywujPrzycisk = true;
      } else {
        aktywujPrzycisk = false;
      }
    });
    const przyciskWpierdolu = this.element.querySelector(".rozdaj-wpierdol");
    const jestNieAktywny = przyciskWpierdolu.hasAttribute("disabled");
    if (aktywujPrzycisk && jestNieAktywny) {
      przyciskWpierdolu.removeAttribute("disabled");
    }
    if (!aktywujPrzycisk) {
      przyciskWpierdolu.setAttribute("disabled", "");
    }
  }

  async rozdajWpierdol() {
    const allSection = document.querySelectorAll(".toggle-content");
    const visibleSections = Array.from(allSection).filter(
      (section) => !section.classList.contains("hidden"),
    );
    const tykacze = visibleSections[0].querySelectorAll(".pojedynczy-tykacz");
    tykacze.forEach(async (tykacz) => {
      const tykazNazwa = tykacz.dataset.tykacznazwa;
      const combatants = tykacz.querySelectorAll(".dzieciak-name");
      combatants.forEach(async (dzieciak) => {
        const select = dzieciak.querySelector("select");
        const zadanyWpierdol = Number(select.value);
        if (zadanyWpierdol !== 0) {
          const dzieciakID = select.dataset.dzieciakid;
          const dzieciakActor = await game.actors.get(dzieciakID);
          const aktualneZdrowie = Number(dzieciakActor.system.zdrowie.aktualne);
          let noweZdrowie = aktualneZdrowie - zadanyWpierdol;
          if (noweZdrowie < 0) {
            noweZdrowie = 0;
          }
          await dzieciakActor.update({
            ["system.zdrowie.aktualne"]: noweZdrowie,
          });
          let content = game.i18n.format("chlopcy.czat.zadanyWpierdol", {
            tykacz: tykazNazwa,
            dzieciak: dzieciakActor.name,
            zadanyWpierdol: zadanyWpierdol,
            aktualneZdrowie: aktualneZdrowie,
            noweZdrowie: noweZdrowie,
          });
          if (noweZdrowie === 0) {
            content +=
              `<br>` + game.i18n.localize("chlopcy.dialog.testTwardziela");
            content += `<button class="test-twardziela" data-actorid="${dzieciakID}">${game.i18n.localize("chlopcy.czat.testTwardziela")}</button>`;
          }
          const chatData = {
            user: game.user?._id,
            content: content,
          };
          await ChatMessage.create(chatData);
        }
      });
    });
    this.close();
  }
}
