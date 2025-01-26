export class zegarTykacza extends Application {
  static instances = new Map(); // Static Map to store instances

  constructor(tykacz) {
    super();

  


    // Initialize instance data
    const osiagiZegar = (tykacz?.system.pozostaleOsiagi > 0) 
    ? tykacz?.system.pozostaleOsiagi 
    : tykacz?.system.osiagi;
    const czasZegar = (tykacz?.system.pozostalyCzas > 0)
    ? tykacz?.system.pozostalyCzas
    : tykacz?.system.czasTrwania
    this.data = {
      tykacz,
      osiagiZegar,
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
    html.on("click",".osiagi i.fa.fa-minus.osiagi", (ev)=>this.zmiejszOsiagi(ev))
    html.on("click",".czas-trwania i.fa.fa-minus.czas", (ev)=>this.zmiejszCzas(ev))
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
    const obecnieOsiagi = this.data.osiagiZegar;
    const tykacz = obecnyTykacz.data.tykacz;
    const noweOsiagi = obecnieOsiagi -1;
    obecnyTykacz.data.osiagiZegar = noweOsiagi;
    tykacz.update({["system.pozostaleOsiagi"]:noweOsiagi});
    const container = obecnyTykacz.element; 
    if (container) {
      container.find(".osiagi-input").val(noweOsiagi);
    }
    if(noweOsiagi === 0){
      this.closeApp(ev)
    }
    game.socket.emit("system.chlopcy", {
      type: "zmniejszOsiagiZegara",
      noweOsiagi: noweOsiagi,
      tykacz: this.data?.tykacz,
    });    
  }
  async zmiejszCzas(ev){
    const obecnyTykacz = this;
    const obecnyCzas = this.data.czasZegar;
    const tykacz = obecnyTykacz.data.tykacz;
    const nowyCzas = obecnyCzas -1;
    obecnyTykacz.data.czasZegar = nowyCzas;
    tykacz.update({["system.pozostalyCzas"]:nowyCzas});
    const container = obecnyTykacz.element; 
    if (container) {
      container.find(".czas-trwania-input").val(nowyCzas);
    }
    if(nowyCzas === 0){
      this.closeApp(ev)
    }
    game.socket.emit("system.chlopcy", {
      type: "zmniejszCzasZegara",
      nowyCzas: nowyCzas,
      tykacz: this.data?.tykacz,
    });    
  }
}

export class zegarTykaczaSocketHandler{
    constructor() {
    this.identifier = "system.chlopcy" 
    this.registerSocketEvents()
  }
  registerSocketEvents() {
    game.socket.on("system.chlopcy", async (data) => {
      let tykacz, zegar,container;
      const tykaczArray = Array.from(game.chlopcy.zegarTykacza.instances.values()); 
      switch(data.type){
        case "renderZegarTykacza":
          const actor = data.actor;
          if (actor) {
            zegarTykacza.initialise(actor);
          }
        break;
    
        case "zamknijZegarTykacza":
      
          tykacz = data.tykacz
          zegar = tykaczArray.find((element) => element.data.tykacz._id === tykacz._id);         
          if (zegar) {          
            zegar.close(); 
          }     
        break;

        case "zmniejszOsiagiZegara":
              const noweOsiagi = data.noweOsiagi;
              tykacz = data.tykacz
              zegar = tykaczArray.find((element) => element.data.tykacz._id === tykacz._id);
              container = zegar.element; 
              if (container) {
                container.find(".osiagi-input").val(noweOsiagi);
              }
        break;

        case "zmniejszCzasZegara":
          const nowyCzas = data.nowyCzas;
          tykacz = data.tykacz
          zegar = tykaczArray.find((element) => element.data.tykacz._id === tykacz._id);
          container = zegar.element; 
              if (container) {
                container.find(".czas-trwania-input").val(nowyCzas);
              }

      }
      

    })
    
  }
}
