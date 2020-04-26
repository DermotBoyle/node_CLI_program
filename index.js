#!/usr/bin/env node
var path = require("path");
var util = require("util");
var fs = require("fs");
var Transform = require("stream").Transform;
var csv = require("csvtojson/v2");

var args = require("minimist")(process.argv.slice(2), {
	boolean: ["help", "in", "out"],
	string: ["file"]
});

var BASE_PATH = path.resolve(process.env.BASE_PATH || __dirname);
var OUTFILE = path.join(BASE_PATH, "out.json");

if (args.help) {
	printHelp();
} else if (args.in || args._.includes("-")) {
	processFile(process.stdin);
} else if (args.file) {
	let stream = fs.createReadStream(path.join(BASE_PATH, args.file));
	processFile(stream)
		.then(function () {
			console.log("complete!");
		})
		.catch(error);
} else {
	error("Incorrect command", true);
}

function error(msg, includeHelp = false) {
	console.log(msg);
	if (includeHelp) {
		console.log("");
		printHelp();
	}
}

async function processFile(inStream) {
	var outStream = inStream;

	// var csvStream = new Transform({
	// 	transform(chunk, enc, cb) {
	// 		this.push();
	// 		cb();
	// 	}
	// });

	var targetStream;

	outStream = outStream.pipe(csv().pipe(targetStream));

	if (args.out) {
		targetStream = process.stdout;
	} else {
		targetStream = fs.createWriteStream(OUTFILE);
	}

	outStream.pipe(targetStream);
}
