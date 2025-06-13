export class obrazeniaTykacza extends foundry.applications.api.DialogV2 {
  constructor(daneAktywnychTykaczy, htmlContent, combatants) {
    const options = {
      window: { title: 'Przydziel osiągi tykaczy' },
      content: htmlContent,
      buttons: [
        {
          action: 'ok',
          label: 'OK',
          callback: (html) => {
            console.log(html);
          },
        },
        {
          action: 'anuluj',
          label: 'Anuluj',
        },
      ],
    };
    super(options);
    this.daneAktywnychTykaczy = daneAktywnychTykaczy;
    this.combatants = combatants;
  }

  _onRender() {
    const itemQuantities = this.element.querySelectorAll('.toggle-section');
    for (const input of itemQuantities) {
      input.addEventListener('click', (e) => {
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
          selectElement.innerHTML = '';
          for (let i = 0; i <= value; i++) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.textContent = i.toString();
            selectElement.appendChild(option);
          }
          selectElement.value = value.toString();
        }
      }
      const elements = document.querySelectorAll(
        `[id^="auto-${tykaczId}"], [id^="manual-${tykaczId}"]`
      );

      for (const input of elements) {
        input.addEventListener('change', (e) => {
          this.upateDostepnyDmg(e, tykacz, elements);
        });
      }
    }
  }

  async otworzSekcje(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const button = event.currentTarget;
    const targetSelector = button.dataset.target;
    const target = this.element.querySelector(targetSelector);
    const isHidden = target.classList.contains('hidden');
    if (isHidden) {
      target.classList.remove('hidden');
      button.textContent = button.textContent.replace('▶', '▼');
      const allButtons = this.element.querySelectorAll('button[data-target]');
      allButtons.forEach((btn) => {
        if (btn === button) return;

        const section = this.element.querySelector(btn.dataset.target);
        if (!section.classList.contains('hidden')) {
          section.classList.add('hidden');
          btn.textContent = btn.textContent.replace('▼', '▶');
        }
      });
    } else {
      target.classList.add('hidden');
      button.textContent = button.textContent.replace('▼', '▶');
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
      const hiddenSection = el.closest('section.hidden');
      if (hiddenSection) return false;
      return true;
    });
    let dostępneOsiągi = pozostałeOsiągi / pozostaleSelektory.length;
    if (isOdd) {
      dostępneOsiągi = Math.ceil(pozostałeOsiągi / pozostaleSelektory.length);
    }
    pozostaleSelektory.forEach((selectElement) => {
      const wybranaWartosc = selectElement.value;
      selectElement.innerHTML = '';
      for (let i = 0; i <= dostępneOsiągi; i++) {
        const option = document.createElement('option');
        option.value = i.toString();
        option.textContent = i.toString();
        selectElement.appendChild(option);
        selectElement.value = wybranaWartosc;
      }
    });
  }
}
