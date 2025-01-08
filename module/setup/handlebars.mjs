export function registerHandlebarsHelpers() {
    Handlebars.registerHelper({
      eq: (v1, v2) => v1 === v2,
      ne: (v1, v2) => v1 !== v2,
      lt: (v1, v2) => v1 < v2,
      gt: (v1, v2) => v1 > v2,
      lte: (v1, v2) => v1 <= v2,
      gte: (v1, v2) => v1 >= v2,
      and() {
        return Array.prototype.every.call(arguments, Boolean);
      },
      or() {
        return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
      },
      range:(v1, v2, v3)=> checkRange(v1, v2, v3)
    });
    Handlebars.registerHelper("lowercase", function (str) {
      return str.toLowerCase();
    });
}
function checkRange(v1, v2, v3){

  const ouput = (v1 >= v2)&&(v1 <= v3)
  console.log(ouput)
  return ouput
}

Handlebars.registerHelper("localizeWithParams", function (key, options) {
  return game.i18n.format(key, options.hash);
});
Handlebars.registerHelper('getWartosc', function(actor, actorID) {
  return actor.system.wiezi[actorID] ? actor.system.wiezi[actorID].wartosc : null;
});
Handlebars.registerHelper('zakres', function(start, end) {
  var result = [];
  const ends = Number(end)
  for (var i = start; i <= ends; i++) {
    result.push(i);
  }
  return result;
});