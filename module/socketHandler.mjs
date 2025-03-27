import { zegarTykacza } from "./apps/zegary.mjs";

export class SocketHandler{
    constructor() {
    this.identifier = "system.chlopcy" 
    this.registerSocketEvents()
  }
  registerSocketEvents() {
    game.socket.on("system.chlopcy", async (data) => {
      let wybranyTykacz, zegar,container;
      const tykaczArray = Array.from(game.chlopcy.zegarTykacza.instances.values()); 
      switch(data.type){
        case "renderZegarTykacza":
          let actor = data.actor;
          if (actor) {
            zegarTykacza.initialise(actor);
            if(actor.system.jestPrzeciwnikiem){
              game.combats.apps[0].renderPopout(true)           
            }
          }
        break;
    
        case "zamknijZegarTykacza":
      
        wybranyTykacz = data.tykacz
          zegar = tykaczArray.find((element) => element.data.tykacz._id === wybranyTykacz._id);         
          if (zegar) {          
            zegar.close();
            await game.combats.apps[0]._popout?.close()
            zegarTykacza.instances.delete(zegar.id); 
            if(game.user.isGM){
              if (data?.tykacz) {
                const tykaczActor= game.actors.get(wybranyTykacz._id)
                await tykaczActor.update({ ["system.aktywny"]: false });                
                if (data?.tykacz.system.jestPrzeciwnikiem){
                  await game.combat.endCombat();
                }
              }
            }
          }     
        break;

        case "zmniejszOsiagiZegara":
              const noweOsiagi = data.noweOsiagi;
              wybranyTykacz = data.tykacz
              zegar = tykaczArray.find((element) => element.data.tykacz._id === wybranyTykacz._id);
             if(game.user.isGM){
              const tykaczActor= game.actors.get(wybranyTykacz._id)
              if(noweOsiagi <= 0){
                game.socket.emit("system.chlopcy", {
                  type: "zamknijZegarTykacza",
                  tykacz: wybranyTykacz,
                });
                tykaczActor.update({["system.pozostaleOsiagi"]:0});
              }
              else{
  
                tykaczActor.update({["system.pozostaleOsiagi"]:noweOsiagi})
                zegar.data.osiagiZegar = noweOsiagi
              }
              
             }
            
              zegar = tykaczArray.find((element) => element.data.tykacz._id === wybranyTykacz._id);
              zegar.data.osiagiZegar = noweOsiagi
                container = zegar.element; 
                if (container) {
                    container.find(".osiagi-input").val(noweOsiagi);
                }
              
               
                  
        break;

        case "zmniejszCzasZegara":
          const nowyCzas = data.nowyCzas;
          wybranyTykacz = data.tykacz
          zegar = tykaczArray.find((element) => element.data.tykacz._id === wybranyTykacz._id);
          container = zegar.element; 
              if (container) {
                container.find(".czas-trwania-input").val(nowyCzas);
              }
        break;

        case "aktualizacjaWiezi":
          const actorID = data.actor._id;
         let actorToUpdate = await game.actors.get(actorID)
          const updateData = data.updateData
          if(actorToUpdate.ownership[game.user.id] === 3){
            await actorToUpdate.update(updateData)
            }   
      }
    }) 
  }
}
