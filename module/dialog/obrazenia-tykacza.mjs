export class obrazeniaTykacza extends foundry.applications.api.DialogV2 {
    constructor(daneAktywnychTykaczy, htmlContent, combatants) {
        const options = {
            window: { title: "Przydziel osiągi tykaczy" },
            content: htmlContent,
            buttons: [
                {
                    action: "ok",
                    label: "OK",
                    callback: html => {
                        console.log(html);
                    }
                },
                {
                    action: "anuluj",
                    label: "Anuluj"
                }
            ]
        };
        super(options);
        this.daneAktywnychTykaczy = daneAktywnychTykaczy;
        this.combatants = combatants
    }

_onRender() {
    const itemQuantities = this.element.querySelectorAll('.toggle-section')
    for (const input of itemQuantities) {
        input.addEventListener("click", (e) => { this.otworzSekcje(e) })
    }
    const combatants = this.combatants; 
    const tykacze = this.daneAktywnychTykaczy; 
    for (const [tykaczId, tykacz] of Object.entries(tykacze)) {
        const pozostaleOsiagi = tykacz.pozostaleOsiagi;
        const perCombatant = Math.floor(pozostaleOsiagi / combatants.size);
        const isOdd = pozostaleOsiagi % 2 !== 0;

        const zdjeteOsiagi = tykacz.zdjeteOsiagi;
        const isEmpty = !zdjeteOsiagi || Object.keys(zdjeteOsiagi).length === 0;
        let allSame = false;
        if (!isEmpty) {
            const values = Object.values(zdjeteOsiagi);
            allSame = values.every(v => v === values[0]);
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
            const selectId = `select-${tykaczId}-${combatant.id}`;
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
        if (target.classList.contains("hidden")) {
            target.classList.remove("hidden");
            button.textContent = button.textContent.replace("▶", "▼");
        } 
        else {
            target.classList.add("hidden");
            button.textContent = button.textContent.replace("▼", "▶");
        }
    }

}
