import { registerSheets } from "./setup/register-sheets.mjs";
import { registerHandlebarsHelpers } from "./setup/handlebars.mjs";
import { preloadHandlebarsTemplates } from "./setup/templates.mjs";
import { CHLOPCYCONFIG } from "./config.mjs";
import * as chlopcyChat from "./chat/roll-mod.mjs";
import { uzycieWiezi } from "./dialog/uzycie-wiezi.mjs";
import { chlopcyActor } from "./actors/actors.mjs";
import { zegarTykacza } from "./apps/zegary.mjs";
import { SocketHandler } from "./socketHandler.mjs";
import chlopcy_Utility from "./utility.mjs";
import { obrazeniaTykacza } from "./dialog/obrazenia-tykacza.mjs";

Hooks.once("init", async function () {
  CONFIG.CHLOPCYCONFIG = CHLOPCYCONFIG;
  const generation = game.release.generation;
  CHLOPCYCONFIG.Actors =
    generation < 13 ? Actors : foundry.documents.collections.Actors;
  CHLOPCYCONFIG.ActorSheet =
    generation < 13 ? ActorSheet : foundry.appv1.sheets.ActorSheet;
  CHLOPCYCONFIG.Items =
    generation < 13 ? Items : foundry.documents.collections.Items;
  CHLOPCYCONFIG.ItemSheet =
    generation < 13 ? ItemSheet : foundry.appv1.sheets.ItemSheet;
  registerSheets(CONFIG.CHLOPCYCONFIG);
  game.settings.register("chlopcy", "combarTrackerX", {
    name: "Selected Folders",
    scope: "client",
    type: Number,
    config: false,
  });
  game.settings.register("chlopcy", "combarTrackerY", {
    name: "Selected Folders",
    scope: "client",
    type: Number,
    config: false,
  });
  registerHandlebarsHelpers();
  console.log('System "Chłopcy RPG" został poprawnie załadowany');

  game.chlopcy = { uzycieWiezi, zegarTykacza };
  CONFIG.Actor.documentClass = chlopcyActor;
  game.chlopcy.zegarTykacza.socketHandler = new SocketHandler();
  if (game.i18n.lang !== "pl") {
    game.i18n.lang = "pl";
  }
  return preloadHandlebarsTemplates(generation);
});
Hooks.on("renderChatLog", chlopcyChat.addChatListeners);

Hooks.on("preCreateScene", (scene) => {
  scene.updateSource({
    tokenVision: false,
    fog: {
      exploration: false,
    },
    grid: {
      type: CONST.GRID_TYPES.GRIDLESS,
    },
  });
});
Hooks.on("ready", async () => {
  const tykacze = game.actors.filter((actor) => actor.type === "tykacz");
  tykacze.forEach(async (tykacz) => {
    if (tykacz.system?.aktywny) {
      const nowyTykacz = new zegarTykacza(tykacz);
      nowyTykacz.render(true);
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
          }
        }

        game.combats.apps[0].renderPopout(true);
      }
    }
  });
});
Hooks.on("renderCombatTracker", async (dialog) => {
  let combatApp;
  if (game.release.generation < 13) {
    combatApp = game.combats.apps[0]._popout;
    if (combatApp !== undefined && dialog.isPopout) {
      const windowSize = window.innerWidth;
      const combatAppSize = combatApp.position.width;
      const sideBar = ui.sidebar.position.width;
      const newLeftPosition = windowSize - combatAppSize - sideBar + 10;
      combatApp.position.top = 0;
      combatApp.position.left = newLeftPosition;
    }
  } else {
    combatApp = game.combats.apps[0].popout;
    if (combatApp !== undefined && dialog.isPopout) {
      const windowSize = window.innerWidth;
      const combatAppSize = combatApp?.element?.clientWidth || 0;
      const sideBar = ui.sidebar.element.clientWidth;
      const newLeftPosition = windowSize - combatAppSize - sideBar - 10;
      combatApp.setPosition({ top: 0, left: newLeftPosition });
      game.settings.set("chlopcy", "combarTrackerX", newLeftPosition);
      game.settings.set("chlopcy", "combarTrackerY", 0);
    }
  }
  if (dialog.options.id === "combat-popout" && dialog.viewed === null) {
    dialog.close();
  }
});

Hooks.on("collapseSidebar", async (sidebar, colaps) => {
  let combatApp = game.combats.apps[0].popout;
  const initialX = game.settings.get("chlopcy", "combarTrackerX");
  const initialY = game.settings.get("chlopcy", "combarTrackerY");
  const combatAppX = combatApp?.element?.offsetLeft;
  const combatAppY = combatApp?.element?.offsetTop;
  if (initialX === combatAppX && initialY === combatAppY) {
    if (combatApp !== undefined) {
      const windowSize = window.innerWidth;
      const combatAppSize = combatApp?.element?.clientWidth || 0;
      let sideBarWidth = sidebar.element.clientWidth;
      if (sideBarWidth === 48) {
        sideBarWidth = 348;
      } else {
        sideBarWidth = 48;
      }
      const newLeftPosition = windowSize - combatAppSize - sideBarWidth - 10;
      combatApp.setPosition({ top: 0, left: newLeftPosition });
      game.settings.set("chlopcy", "combarTrackerX", newLeftPosition);
      game.settings.set("chlopcy", "combarTrackerY", 0);
    }
  }
});

Hooks.on("renderzegarTykacza", async () => {
  const zegary = document.querySelectorAll(".zegar");
  if (zegary.length > 1) {
    const topOffset = zegary[zegary.length - 2].offsetTop;
    const lasCientHeight = zegary[zegary.length - 2].clientHeight;
    const h1FontSize = parseFloat(getComputedStyle(document.body).fontSize);
    const totalOffsetInEm = (topOffset + lasCientHeight + 10) / h1FontSize;
    const newElement = zegary[zegary.length - 1];
    newElement.style.position = "absolute";
    newElement.style.left = "1em"; // Assuming the same left position
    newElement.style.top = `${totalOffsetInEm}em`;
  }
});
Hooks.on("combatRound", async () => {
  if (game.user.isGM) {
    const tykacze = game.actors.filter((actor) => actor.type === "tykacz");
    let daneAktywnychTykaczy = {};
    tykacze.forEach(async (tykacz) => {
      if (tykacz.system?.aktywny) {
        daneAktywnychTykaczy[tykacz.id] = {
          ["zdjeteOsiagi"]: tykacz.flags["chlopcy"],
          ["pozostaleOsiagi"]: tykacz.system.pozostaleOsiagi,
          ["nazwa"]: tykacz.name,
          ["tykaczID"]: tykacz.id,
        };
      }
    });
    if (Object.keys(daneAktywnychTykaczy).length > 0) {
      const combatants = game.combat?.combatants ?? [];
      const html = await chlopcy_Utility.renderTemplate(
        "systems/chlopcy/tameplates/dialog/obrazenia-tykacza.hbs",
        {
          tykacze: Object.values(daneAktywnychTykaczy),
          combatants: combatants,
        },
      );
      const dialog = new obrazeniaTykacza(
        daneAktywnychTykaczy,
        html,
        combatants,
      );
      dialog.render(true);
    }
  }
});
