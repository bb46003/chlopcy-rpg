import chlopcy_Utility from "../utility.mjs";

export default class rzutDoTarczy {
  constructor(actor, cecha) {
    this.actor = actor;
    this.cecha = cecha;
  }

  async preRollDialog() {
    const actor = this.actor;
    const cecha = this.cecha;
    const stan = this.actor.system.stan;
    const tagi = actor.system.tagi;

    const tagiNazwy = Object.values(tagi)
      .filter((tag) => tag.opis !== "")
      .map((tag) => ({
        label: tag.opis,
        value: tag.wartosc,
      }));
    const naszywki = actor.items
      .filter((item) => item.type === "naszywki_przody")
      .map((naszywka) => ({nazwa: naszywka.name, bonus:naszywka.system.bonus}))
      console.log(naszywki)
    const html = await chlopcy_Utility.renderTemplate(
      "systems/chlopcy/tameplates/dialog/pytanie-o-tag.hbs",
      { tagi: tagiNazwy, stan: stan, naszywki: naszywki },
    );
    const label = game.i18n.localize("TABLE.Roll");
    const preroll = new foundry.applications.api.DialogV2({
      window: { title: game.i18n.localize("chlopcy.wybierz_tag") },
      content: html,
      buttons: [
        {
          action: "roll",
          label: label,
          callback: async () => {
            const tagi = document.querySelector(".wybrany-tag");
            const przedmiot = document.querySelector(".nazwa-przedmiotu").value;
            const dodatkoweOsiagi = Number(
              document.querySelector(".dodatkowe-osiagi-liczba").value,
            );
            let wybranyTag = null;
            if (tagi !== null) {
              wybranyTag = tagi.querySelector("option:checked");
            }

            await this.prepareRollingData(
              actor,
              cecha,
              stan,
              wybranyTag,
              przedmiot,
              dodatkoweOsiagi,
            );
          },
          default: true,
        },
        {
          action: "anuluj",
          label: "Anuluj",
        },
      ],
    });
    preroll.render(true, { height: 230 });
  }

  async prepareRollingData(
    actor,
    cecha,
    stan,
    wybranyTag,
    przedmiot,
    dodatkoweOsiagi,
  ) {
    const pyłek = actor.system.pod_wplywem_pylku;
    let KB = "";
    if (pyłek) {
      KB = "2d10";
    } else {
      KB = "1d20";
    }
    let wartoscTagu = 0;
    let nazwaTagu = "";
    if (wybranyTag !== null) {
      wartoscTagu = Number(wybranyTag.value);
      nazwaTagu = wybranyTag.textContent;
    }
    const nazwaCechy = game.i18n.localize(`chlopcy.${cecha}`);
    const wartoscCechy = actor.system.cechy[cecha].wartosc;

    const rollingData = {
      KB: KB,
      cecha: nazwaCechy,
      wartoscCechy: wartoscCechy,
      stan: stan,
      tag: nazwaTagu,
      wartoscTagu: wartoscTagu,
      actor: actor,
      pylek: actor.system.pod_wplywem_pylku,
      przedmiot: przedmiot,
      dodatkoweOsiagi: dodatkoweOsiagi,
      KM: 0,
      DKM: 0,
      osiagi: "",
      iloscOsiagow: 0,
      wykorzystaneOsiagi: false,
    };
    this.roll(rollingData);
  }
  async roll(rollingData) {
    const RKB = await new Roll(rollingData.KB).evaluate();
    const wynikKB = RKB.total;
    let osiagi = "";
    let liczbaOsiagow = 0;
    if (rollingData.przedmiot === "") {
      if (wynikKB === 10) {
        liczbaOsiagow = 3;
        osiagi = game.i18n.localize("chlopcy.rzut.BANGARANG");
      } else if (wynikKB === 9 || wynikKB === 11) {
        liczbaOsiagow = 2;
        osiagi = game.i18n.localize("chlopcy.rzut.dwa_osiagi");
      } else if (wynikKB === 8 || wynikKB === 12) {
        liczbaOsiagow = 1;
        osiagi = game.i18n.localize("chlopcy.rzut.jeden_osiag");
      } else if (wynikKB === 20) {
        osiagi = game.i18n.localize("chlopcy.rzut.klopoty");
      } else {
        osiagi = game.i18n.localize("chlopcy.rzut.brak_osiagow");
      }
    } else {
      if (wynikKB === 10) {
        const iloscOsiagow = String(3 + rollingData.dodatkoweOsiagi);
        liczbaOsiagow = iloscOsiagow;
        osiagi = game.i18n.localize("chlopcy.rzut.BANGARANG");
      } else if (wynikKB === 9 || wynikKB === 11) {
        const iloscOsiagow = String(2 + rollingData.dodatkoweOsiagi);
        liczbaOsiagow = iloscOsiagow;
        osiagi = game.i18n.format("chlopcy.rzut.wiele_osiagów", {
          iloscOsiagow: iloscOsiagow,
        });
      } else if (wynikKB === 8 || wynikKB === 12) {
        const iloscOsiagow = String(1 + rollingData.dodatkoweOsiagi);
        liczbaOsiagow = iloscOsiagow;
        if (iloscOsiagow == 2) {
          osiagi = game.i18n.localize("chlopcy.rzut.dwa_osiagi");
        } else {
          osiagi = game.i18n.format("chlopcy.rzut.wiele_osiagów", {
            iloscOsiagow: iloscOsiagow,
          });
        }
      } else if (wynikKB === 20) {
        osiagi = game.i18n.localize("chlopcy.rzut.klopoty");
      } else {
        osiagi = game.i18n.localize("chlopcy.rzut.brak_osiagow");
      }
    }
    const kKB = rollingData.KB.replace(/d/g, "k");
    const tekstKB = game.i18n.format("chlopcy.czat.wynik_KB", { kKB: kKB });
    rollingData.rolls = [RKB];
    rollingData.KB = wynikKB;
    rollingData.RDT = wynikKB;
    rollingData.plusMinus1 = false;
    rollingData.osiagi = osiagi;
    rollingData.iloscOsiagow = liczbaOsiagow;
    const actor = rollingData.actor;
    const template = await chlopcy_Utility.renderTemplate(
      "systems/chlopcy/tameplates/chat/rdt.hbs",
      {
        rollingData: rollingData,
        osiagi: osiagi,
        KB: wynikKB,
        RDT: wynikKB,
        tekstKB: tekstKB,
        KM: 0,
      },
    );

    const chatData = {
      user: game.user?._id,
      speaker: ChatMessage.getSpeaker({ actor }),
      roll: RKB,
      content: template,
      system: rollingData,
    };
    await RKB.toMessage(chatData);
  }
}
