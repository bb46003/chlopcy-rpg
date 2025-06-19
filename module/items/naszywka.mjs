const BaseItemSheet =
  typeof foundry?.appv1?.sheets?.ItemSheet !== "undefined"
    ? foundry.appv1.sheets.ItemSheet
    : ItemSheet;

export class naszywka extends BaseItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["naszywki_przody"],
      template: "systems/chlopcy/tameplates/item/naszywka.hbs",
      width: 500,
      height: 400,
    });
  }
  async getData() {
    const source = super.getData();
    const itemData = this.item.toObject(false);
    const context = {
      item: itemData,
      editable: this.isEditable,
      limited: this.item.limited,
      options: this.options,
      owner: this.item.isOwner,
      source: source.system,
      system: itemData.system,
      type: this.item.type,
      useKgs: this.item.useKgs,
    };

    return context;
  }
}
