export class obrazeniaTykacza extends foundry.applications.api.DialogV2 {
    constructor(daneAktywnychTykaczy, htmlContent) {
        const options = {
            window: { title: "Przydziel osiągi tykaczy" },
            content: htmlContent,
            buttons: [
                {
                    action: "ok",
                    label: "OK",
                    callback: html => {
                        console.log(html);
                    }
                },
                {
                    action: "anuluj",
                    label: "Anuluj"
                }
            ]
        };
        super(options);
        this.daneAktywnychTykaczy = daneAktywnychTykaczy;
    }

    _onRender() {
        const itemQuantities = this.element.querySelectorAll('.toggle-section')
        for (const input of itemQuantities) {
            input.addEventListener("click", (e) => { this.otworzSekcje(e)})
        }
    }
    async otworzSekcje(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const button = event.currentTarget; 
        const targetSelector = button.dataset.target;
        const target = this.element.querySelector(targetSelector);
        if (target.classList.contains("hidden")) {
            target.classList.remove("hidden");
            button.textContent = button.textContent.replace("▶", "▼");
        } 
        else {
            target.classList.add("hidden");
            button.textContent = button.textContent.replace("▼", "▶");
        }
    }

}
