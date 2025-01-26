export class zegarTykacza extends Application {
  static instances = new Map(); // Static Map to store instances

  constructor(tykacz) {
    super();

  


    // Initialize instance data
    const osizagiZegar = (tykacz?.system.pozostaleOsiagi > 0) 
    ? tykacz?.system.pozostaleOsiagi 
    : tykacz?.system.osiagi;
    const czasZegar = (tykacz?.system.pozostalyCzas > 0)
    ? tykacz?.system.pozostalyCzas
    : tykacz?.system.czasTrwania
    this.data = {
      tykacz,
      osizagiZegar,
      czasZegar,
    };

    // Store the instance in the Map
    zegarTykacza.instances.set(this.id, this);
  }

  static get defaultOptions() {
    const randomId = String(foundry.utils.randomID());
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["chlopcy"],
      height: 200,
      id: "zegar-tykacza-app-"+randomId,
      popOut: false,
      resizable: false,
      template: "systems/chlopcy/tameplates/app/zegar-tykacza.hbs",
      title: "Zegar Tykacza",
      width: "auto",
    });
  }

  static async initialise(tykacz) {
      const instance = new zegarTykacza(tykacz);
      instance.render(true);
  }

  getData() {
    const data = super.getData();
    return {
      ...data,
      ...this.data,
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.on("click", ".nazwa-zegar i.fas.fa-window-close", (ev) =>
      this.closeApp(ev)
    );
    html.on("click",".osiagi i.fa.fa-minus", (ev)=>this.zmiejszOsiagi(ev))
  }

  async closeApp(ev) {
    if (this.data?.tykacz) {
      await this.data.tykacz.update({ ["system.aktywny"]: false });
    }
    zegarTykacza.instances.delete(this.id); 
    this.close();
    game.socket.emit("system.chlopcy", {
      type: "zamknijZegarTykacza",
      tykacz: this.data?.tykacz,
    });
  }
  async zmiejszOsiagi(ev){
    const obecnyTykacz = this;
    const obecnieOsiagi = this.data.osizagiZegar;
    const tykacz = obecnyTykacz.data.tykacz;
    const noweOsiagi = obecnieOsiagi -1;
    obecnyTykacz.data.osizagiZegar = noweOsiagi;
    tykacz.update({["system.pozostaleOsiagi"]:noweOsiagi});
    const container = obecnyTykacz.element; 
    if (container) {
      container.find(".osiagi-input").val(noweOsiagi);
    }
    if(noweOsiagi === 1){
      this.closeApp(ev)
    }
    
  }
}

export class zegarTykaczaSocketHandler{
    constructor() {
    this.identifier = "system.chlopcy" 
    this.registerSocketEvents()
  }
  registerSocketEvents() {
    game.socket.on("system.chlopcy", async (data) => {
      if (data.type === "renderZegarTykacza") {
        const actor = data.actor;
        if (actor) {
          zegarTykacza.initialise(actor);
        }
      }
    });
    game.socket.on("system.chlopcy", (data)=>{
      if (data.type === "zamknijZegarTykacza") {
        const tykaczArray = Array.from(game.chlopcy.zegarTykacza.instances.values()); 
        const tykacz = data.tykacz
        const zegar = tykaczArray.find((element) => element.data.tykacz._id === tykacz._id); // Find the matching element
        
        if (zegar) {
          
          zegar.close(); // Close the found instance
        } else {
        
        }
      }
      

    })
  }
}
