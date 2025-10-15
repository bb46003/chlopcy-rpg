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
import { KoniecSesji } from "./dialog/koniec-sesji.mjs";

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

  game.chlopcy = { uzycieWiezi, zegarTykacza, KoniecSesji };
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
  if (game.user.isGM) {
    const macroKey = "chlopcy.koniec_sesji";
    const localizedNames = [];

    // cache translations so we don't re-fetch next time
    if (!game.chlopcyLangCache) game.chlopcyLangCache = {};

    for (const langDef of game.system.languages) {
      if (!langDef?.path) continue;

      try {
        if (!game.chlopcyLangCache[langDef.lang]) {
          const response = await fetch(langDef.path);
          game.chlopcyLangCache[langDef.lang] = await response.json();
        }

        const translationSet = await game.chlopcyLangCache[langDef.lang];
        const localized = await foundry.utils.getProperty(
          translationSet,
          macroKey,
        );
        if (localized) localizedNames.push(localized);
      } catch (err) {
        console.warn(`Failed to load translations for ${langDef.lang}:`, err);
      }
    }
    console.log(localizedNames)
    // find GM users
    const gmUsers = game.users.filter((u) => u.isGM);
    const gmMacros = game.macros.filter((m) =>
      gmUsers.some((u) => m.ownership[u.id] === 3 || m.ownership.default === 3),
    );

    // find any GM macro whose name matches any localized name
    let macro = gmMacros.find((m) => localizedNames.includes(m.name));

    if (!macro) {
      // fallback name in current language
      const macroName = game.i18n.localize(macroKey);
      macro = await Macro.create({
        name: macroName,
        type: "script",
        img: "icons/svg/door-open-outline.svg",
        command: `
          const activeUsers = game.users.filter((u) => u.active && !u.isGM);
          activeUsers.forEach(user =>{
          game.socket.emit("system.chlopcy", {
                type: "rozdajXp",
                user: user._id})
            })
          ui.notifications.info(
            game.i18n.localize("chlopcy.ui.wysłanoZapytanieOXP"),
          );`,
      });

      // assign to first empty slot
      const hotbarMacros = game.user.getHotbarMacros();
      const emptySlot = hotbarMacros.findIndex((h) => !h.macro);

      if (emptySlot === -1) {
        console.warn("No empty hotbar slot available for End Session macro!");
      } else {
        await game.user.assignHotbarMacro(macro, emptySlot + 1);
      }
    }
  }
});
Hooks.on("renderCombatTracker", async (dialog) => {
  let combatApp;
  if (game.release.generation < 13) {
    combatApp = game.combats.apps[0]._popout;
    if (combatApp !== undefined && dialog.popOut) {
      const windowSize = window.innerWidth;
      const combatAppSize = combatApp.position.width;
      const sideBar = ui.sidebar.position.width;
      const newLeftPosition = windowSize - combatAppSize - sideBar - 20;
      combatApp.setPosition({ top: 0, left: newLeftPosition });
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
      const dialog = new obrazeniaTykacza(daneAktywnychTykaczy, combatants);
      dialog.render(true);
    }
  }
});
