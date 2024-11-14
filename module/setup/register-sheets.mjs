import { dzieciak } from "../actors/dzieciak.mjs";

export function registerSheets() {
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("chlopcy", dzieciak, {
      types: ["dzieciak"],
      makeDefault: true,
    });

}