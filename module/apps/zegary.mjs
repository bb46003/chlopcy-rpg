export class zegarTykacza extends Application {
    constructor(tykacz) {
      if (zegarTykacza._instance && !zegarTykacza.closed && zegarTykacza._instance.data.id === options.id) {
        throw new Error(`Home Score instance with ID "${options.id}" is already open!`);
      }
  
      super(tykacz);
  
      zegarTykacza._instance = this;
      zegarTykacza.closed = true;
  
      this.data = {tykacz};
    }
  
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ["chlopcy"],
        height: "200",
        id: "zegar-tykacza-app",
        popOut: false,
        resizable: false,
        template: "systems/chlopcy/tameplates/app/zegar-tykacza.hbs",
        title: "Zegar Tykacza",
        width: "auto",
      });
    }
  
  getData() {
    super.getData();
    const data = this.data
    return data
  }
}