const fs = require('fs');
const path = require('path');

let {Extractor} = require('./extractor');
let {Utils} = require('./utils');

function writeResultToCSV(key, result, folderPath) {
	let fileName = key + '.csv';
	let csv = result.join('\n');

	let filePath = path.join(folderPath, fileName);
	fs.writeFileSync(filePath, csv);
}

function aggregate(folderPath) {
	let inputFolder = fs.readdirSync(folderPath);
	let result = [];
	let total = 0;

	inputFolder.forEach((fileName) => {
		let filePath = path.join(folderPath, fileName);
		let file = fs.readFileSync(filePath, 'utf8');

		try {
			let data = JSON.parse(file);
			console.log(data.length);
			total += data.length;
			result.push.apply(result, data);
		} catch (err) {
			// do nothing ??
		}
	});

	let sorted = Utils.chronologicallySort(result);
	return sorted;
}

function getEvents(log, folderPath) {

	return new Promise((fullfil, reject) => {
		let promises = [];
		for (let key of Object.keys(Extractor.events)) {
			let extractEvents = Extractor.events[key];
			let p = extractEvents(log).then((result) => {
				writeResultToCSV(key, result, folderPath);
			}).catch((err) => {
				// do nothing ??
			});
			promises.push(p);
		}

		Promise.all(promises).then(() => {
			fullfil('done');
		}).catch((err) => {
			console.log(err);
			reject('error');
		});
	});
}

exports.Analysis = {
	aggregate,
	getEvents
};