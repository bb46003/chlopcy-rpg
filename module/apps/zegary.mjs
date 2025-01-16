export class zegarTykacza extends Application {
    constructor(options = { id }) {
      if (zegarTykacza._instance && !zegarTykacza.closed && zegarTykacza._instance.data.id === options.id) {
        throw new Error(`Home Score instance with ID "${options.id}" is already open!`);
      }
  
      super(options);
  
      zegarTykacza._instance = this;
      zegarTykacza.closed = true;
  
      this.data = { id: options.id };
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
  }
  