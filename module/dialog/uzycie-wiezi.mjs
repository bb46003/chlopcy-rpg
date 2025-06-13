import chlopcy_Utility from '../utility.mjs';

export class uzycieWiezi extends Dialog {
  constructor(rollingData, msg, actor, id) {
    super(rollingData, msg, actor, id);
    (this.rollingData = rollingData),
      (this.msg = msg),
      (this.actor = actor),
      (this.buttonID = id);
  }

  async activateListeners(html) {
    super.activateListeners(html);
    chlopcy_Utility.addHtmlEventListener(
      html,
      'change',
      '.wartosc-uzytych-wiezi',
      (event) => this.dostosujWartoscWiezi(event)
    );
    chlopcy_Utility.addHtmlEventListener(
      html,
      'change',
      '.typ-uzytych-wiezi',
      (event) => this.dostosujWartoscWieziTyp(event)
    );
  }

  async pokazDostepneWiezi(rollingData, msg, actor, id) {
    const allActors = game.actors.filter((actor) => actor.type === 'dzieciak');
    const matchingActors = [];
    const actorId = actor._id;
    allActors.forEach((actor) => {
      if (actor.system.wiezi?.[actorId]) {
        const wartosc = actor.system.wiezi[actorId].wartosc;
        if (wartosc !== 0) {
          matchingActors.push(actor);
        }
      }
    });
    const templateData = {
      actorID: actorId,
      matchingActors: matchingActors,
      rollingData: rollingData,
      pustyTag: game.i18n.localize('chlopcy.bez_tagu'),
    };

    const dialogTemplate = await chlopcy_Utility.renderTemplate(
      'systems/chlopcy/tameplates/dialog/uzyj-wiezi.hbs',
      templateData
    );
    new uzycieWiezi({
      data: { rollingData, msg, actor, id },
      title: game.i18n.localize('chlopcy.dialog.dostepneWiezi'),
      content: dialogTemplate,
      buttons: {
        use: {
          label: game.i18n.localize('chlopcy.dialog.uzyj'),
          callback: async (html) => {
            await this.modyfikujDaneRzutu(rollingData, msg, actor, id, html);
          },
        },
      },
      default: game.i18n.localize('chlopcy.dialog.uzyj'),
    }).render(true);
  }
  async dostosujWartoscWiezi(event) {
    const rollingData = this.data.data.rollingData;
    const target = event.target.value;
    const wartoscTagu = rollingData.wartoscTagu;
    const wartoscCechy = rollingData.wartoscCechy;
    const inneWiezi = document.querySelectorAll('.wartosc-uzytych-wiezi');
    const typWiezi = document.querySelectorAll('.typ-uzytych-wiezi');
    const targetID = event.target.id;
    const typWieziTarget = Array.from(typWiezi).find(
      (selektor) => selektor.id === targetID
    );
    typWiezi.forEach((wiez, index) => {
      if (wiez.value === typWieziTarget.value) {
        const innaWiezTegoSamegoTypu = inneWiezi[index];
        const wybranaWartosc = Number(innaWiezTegoSamegoTypu.value);
        if (wiez.value === '1' && wiez.id !== targetID) {
          const dopuszczalnaWartoscWiezi = 6 - target - wartoscCechy;
          innaWiezTegoSamegoTypu.innerHTML = '';
          for (let i = 0; i <= dopuszczalnaWartoscWiezi; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i === wybranaWartosc) {
              option.selected = true;
            }
            innaWiezTegoSamegoTypu.appendChild(option);
          }
        }
        if (wiez.value === '2' && wiez.id !== targetID) {
          const dopuszczalnaWartoscWiezi = 6 - target - wartoscTagu;
          innaWiezTegoSamegoTypu.innerHTML = '';
          for (let i = 0; i <= dopuszczalnaWartoscWiezi; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i === wybranaWartosc) {
              option.selected = true;
            }
            innaWiezTegoSamegoTypu.appendChild(option);
          }
        }
      } else {
        if (wiez.value === '1' && wiez.id !== targetID) {
          const dopuszczalnaWartoscWiezi = 6 - wartoscCechy;
          const innaWiez = inneWiezi[index];
          const wybranaWartosc = Number(innaWiez.value);
          innaWiez.innerHTML = '';
          for (let i = 0; i <= dopuszczalnaWartoscWiezi; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i === wybranaWartosc) {
              option.selected = true;
            }
            innaWiez.appendChild(option);
          }
        }
        if (wiez.value === '2' && wiez.id !== targetID) {
          const dopuszczalnaWartoscWiezi = 6 - wartoscTagu;
          const innaWiez = inneWiezi[index];
          const wybranaWartosc = Number(innaWiez.value);
          innaWiez.innerHTML = '';
          for (let i = 0; i <= dopuszczalnaWartoscWiezi; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i === wybranaWartosc) {
              option.selected = true;
            }
            innaWiez.appendChild(option);
          }
        }
      }
    });
  }
  async dostosujWartoscWieziTyp(event) {
    const rollingData = this.data.data.rollingData;
    const target = Number(event.target.value);
    let wartosc;
    if (target === 2) {
      wartosc = rollingData.wartoscTagu;
    }
    if (target === 1) {
      wartosc = rollingData.wartoscCechy;
    }
    const postacZwiezami = event.target.id;
    const actor = game.actors.get(postacZwiezami);
    const actorID = rollingData.actor._id;
    const wartoscWiezi = actor.system.wiezi[actorID]
      ? actor.system.wiezi[actorID].wartosc
      : null;

    const KM = rollingData.KM;
    const tag = rollingData.wartoscTagu;
    let dopuszczalnaWartoscWiezi;
    let wartoscSelektora;
    if (KM === 0 && tag === 0) {
      dopuszczalnaWartoscWiezi = 6 - wartosc;
      if (dopuszczalnaWartoscWiezi >= wartoscWiezi) {
        wartoscSelektora = wartoscWiezi;
      } else {
        wartoscSelektora = dopuszczalnaWartoscWiezi;
      }
    }
    if (KM !== 0 && tag !== 0) {
      dopuszczalnaWartoscWiezi = 6 - wartoscSelektora;
      if (dopuszczalnaWartoscWiezi >= wartoscWiezi) {
        wartoscWiezi;
      } else {
        wartoscSelektora = dopuszczalnaWartoscWiezi;
      }
    }
    if (KM === 0 && tag !== 0) {
      dopuszczalnaWartoscWiezi = 6 - wartosc;
      if (dopuszczalnaWartoscWiezi >= wartoscWiezi) {
        wartoscSelektora = wartoscWiezi;
      } else {
        wartoscSelektora = dopuszczalnaWartoscWiezi;
      }
    }
    const selektory = document.querySelectorAll('select');
    const selektorWartosci = Array.from(selektory).find(
      (selektor) => selektor.id === postacZwiezami
    );
    selektorWartosci.innerHTML = '';

    for (let i = 0; i <= wartoscSelektora; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = i;
      selektorWartosci.appendChild(option);
    }
    const WieziWartosc = document.querySelectorAll('.wartosc-uzytych-wiezi');
    const typWiezi = document.querySelectorAll('.typ-uzytych-wiezi');
    const targetID = event.target.id;
    const inneWieziWartoscFiltered = Array.from(WieziWartosc).filter(
      (selektor) => selektor.id !== targetID
    );
    const inneWieziTypFiltered = Array.from(typWiezi).filter(
      (selektor) => selektor.id !== targetID
    );
    const typWieziTarget = event.target.value;
    let wartoscWieziTarget = Array.from(WieziWartosc).find(
      (selektor) => selektor.id === targetID
    )[0];
    let wartoscInnychWiezi = 0;
    inneWieziWartoscFiltered.forEach((wiez, index) => {
      const typWiezi = inneWieziTypFiltered[index].value;
      if (typWiezi === typWieziTarget) {
        wartoscInnychWiezi += Number(wiez.value);
      }
    });
    if (typWieziTarget === '1') {
      wartoscSelektora = 6 - wartoscInnychWiezi - rollingData.wartoscCechy;
    }
    if (typWieziTarget === '2') {
      wartoscSelektora = 6 - wartoscInnychWiezi - rollingData.wartoscTagu;
    }
    if (wartoscInnychWiezi !== 0) {
      wartoscWieziTarget = Array.from(WieziWartosc).find(
        (selektor) => selektor.id === targetID
      );
      wartoscWieziTarget.innerHTML = '';
      for (let i = 0; i <= wartoscSelektora; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        wartoscWieziTarget.appendChild(option);
      }
    }
  }

  async modyfikujDaneRzutu(rollingData, msg, actor, id, html) {
    const typyWiezi = document.querySelectorAll('.typ-uzytych-wiezi');
    const wartosciWiezi = document.querySelectorAll('.wartosc-uzytych-wiezi');
    let modyfikatoCechy = 0;
    let modyfikatorTagu = 0;
    let uzyteWiezi = {};
    typyWiezi.forEach((typ, index) => {
      if (typ.value === '1') {
        modyfikatoCechy += Number(wartosciWiezi[index].value);
      }
      if (typ.value === '2') {
        modyfikatorTagu += Number(wartosciWiezi[index].value);
      }
      if (wartosciWiezi[index].value !== '0') {
        const actor = game.actors.get(typ.id);
        const wartosc = wartosciWiezi[index].value;
        uzyteWiezi = { [typ.id]: { name: actor.name, wartosc: wartosc } };
      }
    });

    rollingData.wartoscCechy += modyfikatoCechy;
    rollingData.wartoscTagu += modyfikatorTagu;
    const kDKM = rollingData?.rolls[2]?.formula.replace(/d/g, 'k');
    let tesktDKM = '';
    if (kDKM !== undefined) {
      tesktDKM = game.i18n.format('chlopcy.czat.wynik_DKM', { kDKM });
    }
    const kKB = rollingData.rolls[0].formula.replace(/d/g, 'k');
    const formulaKM = rollingData?.rolls[1]?.formula;
    let tekstKM = '';
    if (formulaKM !== undefined) {
      tekstKM = game.i18n.format('chlopcy.czat.wynik_KM', { kKM: formulaKM });
    }
    let tekstKB = game.i18n.format('chlopcy.czat.wynik_KB', { kKB });

    const template = await chlopcy_Utility.renderTemplate(
      'systems/chlopcy/tameplates/chat/rdt.hbs',
      {
        rollingData: rollingData,
        osiagi: rollingData.osiagi,
        KB: rollingData.KB,
        KM: rollingData.KM,
        RDT: rollingData.RDT,
        tekstKB: tekstKB,
        tekstKM: tekstKM,
        tekstDKM: tesktDKM,
        DKM: rollingData.DKM,
        uzytyTag: rollingData.uzytyTag,
        uzyteWiezi: uzyteWiezi,
      }
    );

    const chatData = {
      user: game.user?._id,
      speaker: ChatMessage.getSpeaker({ actor }),
      content: template,
      system: rollingData,
    };
    await ChatMessage.create(chatData);
    await this.usunWiezy(document, rollingData);
  }

  async usunWiezy(document, rollingData) {
    const wartosciWiezi = document.querySelectorAll('.wartosc-uzytych-wiezi');
    const celWieziID = rollingData.actor._id;
    wartosciWiezi.forEach(async (wiez) => {
      if (wiez.value !== '0') {
        const actor = game.actors.get(wiez.id);
        const nowaWartosc = String(
          actor.system.wiezi[celWieziID].wartosc - Number(wiez.value)
        );
        const updateData = {
          [`system.wiezi.${celWieziID}.wartosc`]: nowaWartosc,
        };
        if (actor.ownership[game.user.id] === 3) {
          await actor.update(updateData);
        } else {
          game.socket.emit('system.chlopcy', {
            type: 'aktualizacjaWiezi',
            updateData: updateData,
            actor: actor,
          });
        }
      }
    });
  }
}
