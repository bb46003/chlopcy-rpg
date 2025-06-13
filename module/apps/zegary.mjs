import chlopcy_Utility from '../utility.mjs';

export class zegarTykacza extends Application {
  static instances = new Map();
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
      osiagiZegar: osiagiZegar,
      czasZegar: czasZegar,
    };

    zegarTykacza.instances.set(this.id, this);
  }

  static get defaultOptions() {
    const randomId = String(foundry.utils.randomID());
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['chlopcy'],
      height: 200,
      id: 'zegar-tykacza-app-' + randomId,
      popOut: false,
      resizable: false,
      template: 'systems/chlopcy/tameplates/app/zegar-tykacza.hbs',
      title: 'Zegar Tykacza',
      width: 'auto',
    });
  }

  static async initialise(tykacz) {
    const instance = new zegarTykacza(tykacz);
    instance.render(true);
    let walka;
    if (tykacz.system.jestPrzeciwnikiem) {
      if (game.user.isGM) {
        if (game.combats.size === 0) {
          walka = await Combat.create();
          await walka.update({
            active: true,
            round: 1,
            turn: 0,
          });

          await this.dodajPostacieDowalki(walka);
          game.combats.apps[0].renderPopout(true);
        }
      }
    }
  }

  getData() {
    const data = super.getData();
    return {
      ...data,
      ...this.data,
    };
  }
  static async dodajPostacieDowalki(walka) {
    const dzieciaki = game.actors.filter((actor) => actor.type === 'dzieciak');
    const template = await chlopcy_Utility.renderTemplate(
      'systems/chlopcy/tameplates/dialog/wybierz-dziaciaki-do-walki.hbs',
      { dzieciaki: dzieciaki }
    );
    const tytul = game.i18n.localize('chlopcy.dialog.wyborDzieciakiDoWalki');
    const d = new Dialog({
      title: tytul,
      content: template,
      buttons: {
        dodaj: {
          label: game.i18n.localize('chlopcy.dialog.dodajDoWalki'),
          callback: async () => {
            const wybraneDzieciaki = Array.from(
              document.querySelectorAll('.wybrany-dzieciak')
            ).filter((input) => input.checked);
            let i = 1;
            const combatants = wybraneDzieciaki
              .map((input) => {
                let actor = game.actors.get(input.value);
                if (!actor) return null;
                const combatant = {
                  actorId: actor.id,
                  name: actor.name,
                  initiative: i,
                  hidden: false,
                };
                i++;
                return combatant;
              })
              .filter((c) => c !== null);
            await walka.createEmbeddedDocuments('Combatant', combatants);
          },
        },
      },
      render: (html) => {
        html.on('change', '.wybrany-dzieciak', (event) => {
          const checkboxes = html
            .find('.wybrany-dzieciak')
            .not('[value="all"]');
          if (event.target.value === 'all') {
            checkboxes.prop('checked', event.target.checked);
          }
        });
      },
      style: {
        height: 'auto',
      },
    });
    d.render(true);
  }

  activateListeners(html) {
    super.activateListeners(html);

    chlopcy_Utility.addHtmlEventListener(
      html,
      'click',
      '.nazwa-zegar i.fas.fa-window-close',
      (ev) => this.closeApp(ev)
    );
    chlopcy_Utility.addHtmlEventListener(
      html,
      'click',
      '.osiagi i.fa.fa-minus.osiagi',
      (ev) => this.zmiejszOsiagi(ev)
    );
    chlopcy_Utility.addHtmlEventListener(
      html,
      'click',
      '.czas-trwania i.fa.fa-minus.czas',
      (ev) => this.zmiejszCzas(ev)
    );
    chlopcy_Utility.addHtmlEventListener(
      html,
      'click',
      '.osiagi i.fa.fa-plus.osiagi',
      (ev) => this.zwiekszOsiagi(ev)
    );
  }

  async closeApp(ev) {
    if (this.data?.tykacz) {
      await this.data.tykacz.update({ ['system.aktywny']: false });
    }

    game.socket.emit('system.chlopcy', {
      type: 'zamknijZegarTykacza',
      tykacz: this.data?.tykacz,
    });
    zegarTykacza.instances.delete(this.id);
    this.close();
    const przeciwnikExists = [...zegarTykacza.instances.values()].some(
      (instance) => instance.data?.tykacz?.system.jestPrzeciwnikiem
    );

    if (!przeciwnikExists) {
      await game.combat?.endCombat();
      await game.combats.apps[0]._popout?.close();
    }
  }
  async zmiejszOsiagi(ev) {
    const obecnyTykacz = this;
    const obecnieOsiagi = this.data.osiagiZegar;
    const tykacz = obecnyTykacz.data.tykacz;
    const noweOsiagi = obecnieOsiagi - 1;
    obecnyTykacz.data.osiagiZegar = noweOsiagi;
    tykacz.update({ ['system.pozostaleOsiagi']: noweOsiagi });
    const container = obecnyTykacz.element;
    if (container) {
      container.find('.osiagi-input').val(noweOsiagi);
    }
    if (noweOsiagi === 0) {
      this.closeApp(ev);
    }
    game.socket.emit('system.chlopcy', {
      type: 'zmniejszOsiagiZegara',
      noweOsiagi: noweOsiagi,
      tykacz: this.data?.tykacz,
    });
  }
  async zmiejszCzas(ev) {
    const obecnyTykacz = this;
    const obecnyCzas = this.data.czasZegar;
    const tykacz = obecnyTykacz.data.tykacz;
    const nowyCzas = obecnyCzas - 1;
    obecnyTykacz.data.czasZegar = nowyCzas;
    tykacz.update({ ['system.pozostalyCzas']: nowyCzas });
    const container = obecnyTykacz.element;
    if (container) {
      container.find('.czas-trwania-input').val(nowyCzas);
    }
    if (nowyCzas === 0) {
      this.closeApp(ev);
    }
    game.socket.emit('system.chlopcy', {
      type: 'zmniejszCzasZegara',
      nowyCzas: nowyCzas,
      tykacz: this.data?.tykacz,
    });
  }
  async zwiekszOsiagi(ev) {
    const obecnyTykacz = this;
    const obecnieOsiagi = this.data.osiagiZegar;
    const tykacz = obecnyTykacz.data.tykacz;
    const noweOsiagi = obecnieOsiagi + 1;
    obecnyTykacz.data.osiagiZegar = noweOsiagi;
    tykacz.update({ ['system.pozostaleOsiagi']: noweOsiagi });
    const container = obecnyTykacz.element;
    if (container) {
      container.find('.osiagi-input').val(noweOsiagi);
    }
    if (noweOsiagi === 0) {
      this.closeApp(ev);
    }
    game.socket.emit('system.chlopcy', {
      type: 'zmniejszOsiagiZegara',
      noweOsiagi: noweOsiagi,
      tykacz: this.data?.tykacz,
    });
  }
}
