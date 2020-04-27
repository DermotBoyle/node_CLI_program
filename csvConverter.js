#!/usr/bin/env node
var csv = require("csvtojson/v2");
var path = require("path");
var fs = require("fs");
var through2 = require("through2");
var args = require("minimist")(process.argv.slice(2), {
	boolean: ["help"],
	string: ["file"]
});

var BASE_PATH = path.resolve(process.env.BASE_PATH || __dirname);
var listOfSales = {};
let finalResultFigures = [];
let content;

//***REGEX FOR PARSING PROFIT DATA */

let breakWord = /([A-Z]+)/gi;

let regex = /((-|\+)\d*(%|€))/g;
let plusEuro = /\+\d*€/;
let minusEuro = /\-\d*€/;
let plusPercent = /\+\d*%/;
let minusPercent = /\-\d*%/;

let removePlusPercent = /(\+|%)/g;
let removeMinusPercent = /(\-|%)/g;
let removeMinusEuro = /(\-|€)/g;
let removePlusEuro = /(\+|€)/g;

//CREATE READABLE STREAMS

if (args.help) {
	printHelp();
} else if (args.file[0]) {
	//**CREATE READ STREAM */
	let stream = fs.createReadStream(path.join(BASE_PATH, args.file[0]));
	processFile(stream);

	//**READ AND PARSE FILE */
	var path = fs.readFile(path.join(BASE_PATH, args.file[1]), function read(
		err,
		data
	) {
		if (err) {
			printHelp();
		}
		content = JSON.parse(data);
		getProfits(content);
	});
} else {
	error("incorrect command", true);
}

//***ERROR FUNCTION */
function error(msg, includeHelp = false) {
	console.log(msg);
	if (includeHelp) {
		console.log("");
		printHelp();
	}
}

//**PROCESS SALES LIST THAT MATCHES PRICING SCHEMA OR PASS TO WILDCARD */
function getProfits(content) {
	let categories = content.categories;

	Object.keys(listOfSales).forEach(function (key) {
		let nameAndCostArray = key.split(breakWord);
		let name = nameAndCostArray[1];
		let cost = nameAndCostArray[2];
		let quantity = listOfSales[key];
		if (categories.hasOwnProperty(name)) {
			updateValue(name, cost, categories[name], quantity);
		} else {
			updateWildCard(name, cost, categories["*"], quantity);
		}
	});

	//**FS CREATE FILE AND PRINT */

	finalResultFigures = JSON.stringify(finalResultFigures);

	fs.writeFile("result.JSON", finalResultFigures, function (err) {
		if (err) throw err;
		console.log("file successfully created");
	});
}

//***IF ONLY ONE PROCESS IS TO BE APPLIED TO FIGURE */

function getTotalSingleProcess(name, value, process, quantity, resultLength) {
	let cost;
	switch (true) {
		case plusEuro.test(process):
			let plusEurScheme = process.replace(removePlusEuro, "");
			plusEurScheme = Number(plusEurScheme);
			let profitPlusEur = quantity * plusEurScheme;
			if (resultLength < 2) {
				finalResultFigures.push({ [name]: profitPlusEur });
			}
			return profitPlusEur;

		case minusEuro.test(process):
			let minusEurScheme = process.replace(removeMinusEuro, "");
			minusEurScheme = "-" + minusEurScheme;
			minusEurScheme = Number(minusEurScheme);
			let profitMinusEur = quantity * minusEurScheme;
			if (resultLength < 2) {
				finalResultFigures.push({ [name]: profitMinusEur });
			}
			return profitMinusEur;

		case plusPercent.test(process):
			let plusPercentProcess = process.replace(removePlusPercent, "");
			cost = Number(value);
			plusPercentProcess = Number(plusPercentProcess);
			let plusTotalQuantityCost = cost * quantity;
			let profitPercentPlus =
				(plusTotalQuantityCost / 100) * plusPercentProcess;
			if (resultLength < 2) {
				finalResultFigures.push({ [name]: profitPercentPlus });
			}
			return profitPercentPlus;

		case minusPercent.test(process):
			let minusPercentProcess = process.replace(removeMinusPercent, "");
			cost = Number(value);
			minusPercentProcess = "-" + minusPercentProcess;
			minusPercentProcess = Number(minusPercentProcess);
			let totalQuantityCost = cost * quantity;
			let profitPercentMinus = (totalQuantityCost / 100) * minusPercentProcess;
			if (resultLength < 2) {
				finalResultFigures.push({
					[name]: profitPercentMinus
				});
			}
			return profitPercentMinus;
	}
}

//**GET TOTAL IF MULTIPLE PROCESSES TO BE APPLIED */

function getTotalMultipleProcess(name, value, process, quantity) {
	let result = process.match(regex);

	let firstRes = getTotalSingleProcess(name, value, result[0], quantity);

	let secondRes = getTotalSingleProcess(name, value, result[1], quantity);

	let finalVal = firstRes + secondRes;

	finalResultFigures.push({ [name]: finalVal });
}

//**CREACT FINAL FIGURES OBJECT FOR PRINTING */
function updateValue(name, value, process, quantity) {
	let resultLength = process.match(regex);
	resultLength = resultLength.length;

	if (resultLength < 2) {
		getTotalSingleProcess(name, value, process, quantity, resultLength);
	} else {
		getTotalMultipleProcess(name, value, process, quantity, resultLength);
	}
}

function updateWildCard(name, value, process, quanity) {
	let resultLength = process.match(regex);
	resultLength = resultLength.length;

	if (resultLength < 2) {
		getTotalSingleProcess(name, value, process, quanity, resultLength);
	} else {
		getTotalMultipleProcess(name, value, process, quantity, resultLength);
	}
}

//****STREAM FOR LARGE CSV FILES -- LOADS IN CHUNKS */

function processFile(instream) {
	// Parse large csv with stream / pipe (low mem consumption)
	var outStream = instream;
	//	const writeStream = fs.createWriteStream(OUTFILE);
	var parseJsonStream = through2({ objectMode: true }, function (
		chunk,
		enc,
		callback
	) {
		this.push(chunk);
		callback();
	});

	parseJsonStream.on("end", function () {
		console.log("end  - - - - - - - - of - - - - - - - - - stream");
	});

	// Convert a csv file with csvtojson
	parseJsonStream.on("data", function (data) {
		var result = JSON.parse(data);

		let cost = result.COST.replace(/\./g, "");
		cost = cost.replace(/,/, ".");
		cost = cost.replace(/€/, "");
		cost = Number(cost);

		let nameCost = result.CATEGORY + cost;

		//DOES OBJECT ALREADY EXIST IF YES ADD VALUS, OTHERWISE CREATE NEW //

		if (listOfSales.hasOwnProperty(nameCost)) {
			var quantity = result.QUANTITY;
			quantity = quantity.replace(/\./g, "");
			quantity = Number(quantity);
			quantity = listOfSales[nameCost] + quantity;
			return (listOfSales[nameCost] = quantity);
		} else {
			var quantity = result.QUANTITY;
			quantity = quantity.replace(/\./g, "");
			quantity = Number(quantity);
			return (listOfSales[nameCost] = quantity);
		}
	});

	//**PARSE CSV TO JSON, CHANGE DEFAULT DELIMITER TO ; */
	outStream = outStream.pipe(csv({ delimiter: ";" })).pipe(parseJsonStream);

	var targetStream = process.stdout;
	outStream.pipe(targetStream);
}

//**HELP COMMANDS */

function printHelp(params) {
	console.log("------ CSV CONVERTER USAGE -------");
	console.log("");
	console.log(
		"./csvConverter --file={VENTAS FILENAME}  --file={PRECIOS FILENAME}"
	);
	console.log("");
	console.log("--file={FILENAME}                process this file");
	console.log("");
}
