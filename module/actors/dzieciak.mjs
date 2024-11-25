import rzutDoTarczy from "../roll/rolling.mjs";

export class dzieciak extends ActorSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
          classes: ["chlopcy", "sheet", "actor", "character", "dialog-button"],
          template: "systems/chlopcy/tameplates/actor/dzieciak.hbs",
          width: 800,
          height: 960,
          tabs: [
            {
              navSelector: ".sheet-tabs",
              contentSelector: ".sheet-body",
              initial: "glowna",
            },
          ],
          
        });
      }
      async getData() {
        const source = super.getData();
        const actorData = this.actor.toObject(false);
       
        const context = {
          actor: actorData,
          editable: this.isEditable,
          items: this.actor.items,
          limited: this.actor.limited,
          options: this.options,
          owner: this.actor.isOwner,
          source: source.system,
          system: actorData.system,
          type: this.actor.type,
          useKgs: this.actor.useKgs,
        };
        const {
          bajker
        } = CONFIG.CHLOPCYCONFIG;
        Object.assign(context, { 
          bajker
        })
        
    async function enrich(html) {
      if (html) {
        return await TextEditor.enrichHTML(html, {
          secrets: context.actor.isOwner,
          async: true,
        });
      } else {
        return html;
      }
    }

    context.system.opis_postaci = await enrich(context.system.equipment);
    context.system.szczesliwe_mysli = await enrich(context.system.equipment);
    context.system.sprzet_osobisty = await enrich(context.system.equipment);
    

    
        return context
      }

      async activateListeners(html) {
        super.activateListeners(html);

        html.on("change", ".kostki-pyłek", (ev) =>this.dawkiPylku(ev));
        html.on("change", ".cecha-wartosc", (ev) =>this.wartoscTagu(ev));
        html.on("change", ".stan", (ev) =>this.zmianaStanu(ev));
        html.on("change", ".bangarang", (ev) =>this.zmianaBangarang(ev));
        html.on("change", ".xp", (ev) =>this.zmianaXp(ev));
        html.on("change", ".sakwy-checkbo", (ev) =>this.zmianaSakwy(ev));
        html.on("click", ".cecha", (ev) => this.rzut(ev));
      }

      async dawkiPylku(ev){
        ev.preventDefault(); 
       
        const id = Number(ev.target.labels[0].id);
        const val = ev.target.checked;
        let updateData = {};
        if (val){
        for(let i=1; i<=id; i++){
          updateData[`system.pylek.${i}`]= val
         
        }
      }
        else{
          for(let i=id; i<=6; i++){
          updateData[`system.pylek.${i}`]=val
          }
        

        }
        this.actor.update(updateData)
        
      }
      async wartoscTagu(ev){
        const target = ev.target.checked;
        const tagName = ev.target.parentNode.attributes[1].nodeValue;
        let value = this.actor[tagName];
        if(target){
         value = Number(ev.target.value);
        }
        else{
          value = Number(ev.target.value)-1;
        }
       await this.actor.update({[`${tagName}`]:value})
      }
      async zmianaStanu(ev){
        const target = ev.target.checked;
        let  value = Number(ev.target.value);
        if(target){
          await this.actor.update({["system.stan"]:value})
         }
         else{
           value = Number(ev.target.value)-1;
           await this.actor.update({["system.stan"]:value})
         }
      }
      async zmianaBangarang(ev){
        const target = ev.target.checked;
        let  value = Number(ev.target.value);
        const ID = ev.target.id;
        if(target){
          await this.actor.update({[`system.bangarang.${ID}`]:value})
         }
         else{
           value = Number(ev.target.value)-1;
           await this.actor.update({[`system.bangarang.${ID}`]:value})
         }
      }
      async zmianaXp(ev){
        const target = ev.target.checked;
        let  value = Number(ev.target.value);
        if(target){
          await this.actor.update({["system.xp"]:value})
         }
         else{
           value = Number(ev.target.value)-1;
           await this.actor.update({["system.xp"]:value})
         }    
      }
      async zmianaSakwy(ev){
        const target = ev.target.checked;
        let  value = Number(ev.target.value);
        if(target){
          await this.actor.update({["system.sakwy"]:value})
         }
         else{
           value = Number(ev.target.value)-1;
           await this.actor.update({["system.sakwy"]:value})
         }    
      }

      async rzut(ev){
       const cecha = ev.target.innerHTML.toLowerCase()
        const roll = new rzutDoTarczy(this.actor, cecha);
        roll.preRollDialog()
      }
    }