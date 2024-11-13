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
    }