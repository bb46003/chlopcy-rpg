export default class chlopcy_Utility {
  static addHtmlEventListener(html, eventNames, selector, eventHandler) {
    const container = html.jquery ? html[0] : html; // jQuery in version <= 12, DOM in version >= 13

    for (const eventName of eventNames.split(' ')) {
      const wrappedHandler = (e) => {
        if (!e.target) return;
        const target = e.target.closest(selector);
        if (target) {
          eventHandler.call(target, e);
        }
      };
      container.addEventListener(eventName, wrappedHandler);
    }
  }

  static async renderTemplate(path, data) {
    if (game.release.generation > 12) {
      return foundry.applications.handlebars.renderTemplate(path, data);
    } else {
      return renderTemplate(path, data);
    }
  }
}
