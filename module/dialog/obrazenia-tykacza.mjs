export class obrazeniaTykacza extends foundry.applications.api.ApplicationV2 {
   static DEFAULT_OPTIONS = {
        window: { title: "Przydziel osiągi tykaczy" },
        template: "systems/chlopcy/tameplates/dialog/obrazenia-tykacza.hbs", // ✅ fix spelling
        buttons: [
            {
                action: "ok",
                label: "OK",
                callback: (html) => {
                    console.log("OK clicked", html);
                }
            },
            {
                action: "anuluj",
                label: "Anuluj"
            }
        ]
    };


    constructor(daneAktywnychTykaczy, combatants) {
        super(daneAktywnychTykaczy,combatants);
        this.daneAktywnychTykaczy = daneAktywnychTykaczy;
        this.combatants = combatants;
    }

    async getData() {
        try {
            return {
                daneAktywnychTykaczy: this.daneAktywnychTykaczy,
                combatants: Array.from(this.combatants) // convert Collection to Array
            };
        } catch (e) {
            console.error("getData error:", e);
            return {};
        }
    }

    async _renderHTML() {
        try {
            return await renderTemplate(this.options.template, { tykacze: Object.values(this.daneAktywnychTykaczy), combatants: this.combatants});
        } catch (e) {
            console.error("_renderHTML error:", e);
            throw e;
        }
    }

    async _replaceHTML(result, html) {
        html.innerHTML = result;
    }

_onRender() {
    const itemQuantities = this.element.querySelectorAll('.toggle-section')
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

        for (const combatant of combatants) {
            const selectId = `select-${tykaczId}-${combatant.id}`
            const selectElement = this.element.querySelector(`#${selectId}`);
            if (selectElement) {
                if (isOdd && combatant === combatantWithExtra) {
                    selectElement.value = (perCombatant + 1).toString();
                } else {
                    selectElement.value = perCombatant.toString();
                }
            }
        }
    }
  }

    async otworzSekcje(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const button = event.currentTarget;
        const targetSelector = button.dataset.target;
        const target = this.element.querySelector(targetSelector);

        if (!target) return;

        const isHidden = target.classList.contains("hidden");
        target.classList.toggle("hidden", !isHidden);
        button.textContent = isHidden
            ? button.textContent.replace("▶", "▼")
            : button.textContent.replace("▼", "▶");
    }
}
