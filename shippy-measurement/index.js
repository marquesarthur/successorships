const express = require('express');
const bodyParser = require("body-parser");
const fs = require('fs');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json({limit: '50mb'}));

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

// Writes the events that happened in a shippy client/server
app.post('/', (req, res) => {
	let batch = req.body.id || "00";
	let clientId = req.body.clientId;
	let data = req.body.log;
	try {
		if (typeof clientId === 'undefined' && clientId === null) {
			res.status(500).send({error: 'Unable to save file'});
			return;
		}

		if (typeof data === 'undefined' && data === null) {
			res.status(500).send({error: 'Unable to save file'});
			return;
		}

		console.log('Client disconnected', clientId);
		let file = './input/shippy_log_' + clientId.toString() + '_' + batch.toString() + '.json';
		fs.writeFileSync(file, JSON.stringify(data));

		res.status(200).send({msg: "Data stored"});
	} catch (err) {
		res.status(500).send({error: 'Unable to save file'});
	}
});

// Creates a simple server that receives files and stores them into an input folder
app.listen(4321, () => {
	console.log('Data will be stored once clients disconnect');
});