import { dzieciak } from "../actors/dzieciak.mjs";
import { naszywka } from "../items/naszywka.mjs";
import { tykacz } from "../actors/tykacz.mjs";

export function registerSheets(CHLOPCYCONFIG) {

  
  CHLOPCYCONFIG.Actors.unregisterSheet("core", CHLOPCYCONFIG.ActorSheet);
  CHLOPCYCONFIG.Actors.registerSheet("chlopcy", dzieciak, {
      types: ["dzieciak"],
      makeDefault: true,
    });
    CHLOPCYCONFIG.Actors.registerSheet("chlopcy", tykacz, {
      types: ["tykacz"],
      makeDefault: true,
    });
    CHLOPCYCONFIG.Items.unregisterSheet("core", CHLOPCYCONFIG.ItemSheet);
    CHLOPCYCONFIG.Items.registerSheet("chlopcy", naszywka, {
      types: ["naszywki_przody"],
      makeDefault: true,
    });
}