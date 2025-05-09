export class chlopcyActor extends Actor {
    /** @override */
    async _preCreate(data, options, user) {
   
       await super._preCreate(data, options, user);
       
      if(this.type === "dzieciak"){
         await this.updateSource({
           "prototypeToken.actorLink": true,
         })
       }
     }

    /** @override */
    async _onUpdate(data, options, user) {
      await super._onUpdate(data, options, user);
      if(this.type === "dzieciak" && (data.hasOwnProperty("name") ||data.hasOwnProperty("img") )){
          const actorName = data.name ?? this.name;
          const actorImg = data.img ?? this.img;
          game.socket.emit("system.chlopcy", {
            type: "aktualizacjaOpisuWięzi",
            sourceActor: this,
            actorImg: actorImg,
            actorName: actorName
          });
        }
      }
    
}