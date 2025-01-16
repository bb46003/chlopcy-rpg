import { dzieciak } from "../actors/dzieciak.mjs";
import { naszywka } from "../items/naszywka.mjs";
import { tykacz } from "../actors/tykacz.mjs";

export function registerSheets() {
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("chlopcy", dzieciak, {
      types: ["dzieciak"],
      makeDefault: true,
    });
    Actors.registerSheet("chlopcy", tykacz, {
      types: ["tykacz"],
      makeDefault: true,
    });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("chlopcy", naszywka, {
      types: ["naszywki_przody"],
      makeDefault: true,
    });
}