let regex = /((-|\+)\d?(%|€))/g;

let plus = /\./g;

let symbols = "21.000.643€";

let cost = symbols.replace(/\./g, "");
cost = cost.replace(/,/, ".");
cost = cost.replace(/€/, "");
cost = Number(cost);
