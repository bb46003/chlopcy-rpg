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

    context.system.opis_postaci = await enrich(context.system.opis_postaci);
    context.system.szczesliwe_mysli = await enrich(context.system.szczesliwe_mysli);
    //context.system.sprzet_osobisty = await enrich(context.system.sprzet_osobisty);
    

    
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
        html.on("click", ".dodaj-wiezi", (ev) => this.dodajWięzi(ev));
        html.on("change", ".wartosc-wiezi", (ev) =>this.wartoscWiezi(ev));
        html.on("click", ".usun-wiez", (ev) => this.usunWięzi(ev));
        html.on("click",".top-section-label-bangarang", (ev) => this.uzyjPunktowBANGARANG(ev))
        html.on("change", ".znaczniki-plecow input[type='checkbox']", (ev) => this.zmianaNaszywekPlecy(ev))
        html.on("click", '[data-tab="kurta-i-wspomnienia"]', (ev) => this.dynamicznyStyl(ev))

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
        await this.actor.update(updateData)
        
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
      async dodajWięzi(ev){
        const actor = this.actor;
        const othersActors = game.actors.filter(actorX => (actorX.type === "dzieciak")&&(actorX !== actor));
        const dialogTemplate = await renderTemplate("systems/chlopcy/tameplates/dialog/dodaj-wiezi.hbs",{othersActors:othersActors});
        const tytul = game.i18n.localize("chlopcy.dialog.wybierz_postac_do_wiezi")
        const d= new Dialog({
          title: tytul,
          content: dialogTemplate,
          buttons: "",
          render: (html) => {
              html.on("click", ".dodaj-do-katy-wiezi", (event) => this.dodajPostacDoWiezi(event));
              
          }
      });
      await d.render(true)

        
      }
      async dodajPostacDoWiezi(event){
        event.preventDefault()
        const actor = this.actor;
        const target =event.target.closest(".dodaj-postac").id;
        const actorZWiezi = game.actors.get(target)
        const updateData = {
          [`system.wiezi.${target}`]: {
              name: actorZWiezi.name,
              wartosc: 0,
              img: actorZWiezi.img,
          }
        };
       await actor.update(updateData)
      }
      async wartoscWiezi(ev){
        const target = ev.target.parentNode.parentElement.id
        const wartoscWiezi = ev.target.value;
        const actor = this.actor;
        const updateData = {
          [`system.wiezi.${target}`]: {
              wartosc: wartoscWiezi,

          }
        };
        await actor.update(updateData)
      }
      async usunWięzi(ev){
        const target = ev.target; // Get the parentNode of the target
        const closestElement = target.closest('.postac-z-wiezami');
        const ID = closestElement.id
        const actor = this.actor;
        let wiezi = actor.system.wiezi;
        delete wiezi[ID];
        let updateData = {
          [`system.wiezi`]: null
        };
        await actor.update(updateData)
        updateData = {
          [`system.wiezi`]: wiezi
        };
        await actor.update(updateData)
  


      }
      async uzyjPunktowBANGARANG(ev){
        const typ = ev.currentTarget.innerText.toLowerCase();
        const typOrignial = ev.currentTarget.innerText;
        const actor = this.actor;

      
            const obecnaWartsc = actor.system.bangarang[typ];
            if(obecnaWartsc >= 3){
              const nowaWartosc = obecnaWartsc - 3;
              const updateData = {[`system.bangarang.${typ}`]:nowaWartosc};
              await actor.update(updateData)
              const content = game.i18n.format("chlopcy.czat.uzytoBangarang",{typ:typOrignial});
              const chatData = {
                user: game.user?._id,
                speaker: ChatMessage.getSpeaker({ actor }),
                content: content,
            }
            await ChatMessage.create(chatData);
            }
            else{
              ui.notifications.warn(game.i18n.localize("chlopcy.ui.nieMaszWystarczajacoBANGARANG"));
            }
        
      }
      async zmianaNaszywekPlecy(ev) {
        const target = ev.currentTarget;
        const jestZaznaczony = target.checked;
        const parentContainer = target.closest('.znaczniki-plecow');
        const checkboxes = Array.from(parentContainer.querySelectorAll('input[type="checkbox"]'));
        const targetIndex = checkboxes.indexOf(target);
        let updateData = {};
        let wartosc
        checkboxes.forEach((cb, index) => {
          if(index <= targetIndex && jestZaznaczony === true){
            wartosc = jestZaznaczony;
          }
          else if(index > targetIndex && jestZaznaczony === false) {
            wartosc = jestZaznaczony;   
          }
          else if(index <= targetIndex && jestZaznaczony === false){
            wartosc = cb.checked
          }
          else if(index > targetIndex && jestZaznaczony === true) {
            wartosc = !jestZaznaczony;   
          }
          if(cb.name === "system.plecy.lokacja" && wartosc === false){
            updateData["system.plecy.lokacja-text"] = ""; 
          }
          
          updateData[cb.name] = wartosc; 
        });
        
        const actor = this.actor;     
        await actor.update(updateData);
    }
    
    
      async dynamicznyStyl(ev){
        const przody = document.querySelector('.przody');
        const plecy = document.querySelector('.plecy');
        const przodyWysokosc = przody.offsetHeight;
        const plecyWysokosc = plecy.offsetHeight;
        const maxWysokosc = Math.max(przodyWysokosc, plecyWysokosc);
        if(plecyWysokosc === maxWysokosc){
          plecy.style.borderLeft = '1px dashed black';
        }
        else{
          przody.style.borderRight = '1px dashed black';
        }
      }
    }