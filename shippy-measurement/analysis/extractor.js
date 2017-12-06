let serverRecovery = require("./extractors/serverRecovery");
let messageRTT = require("./extractors/messageRTT");
let clientWelcome = require("./extractors/clientWelcome");

// Defines a map of events to be extracted from the log files and an extract function
// The extract funtion will process the logs and filter the events of interest
const events = {
	serverRecovery: serverRecovery.extract,
	messageRTT: messageRTT.extract,
	clientWelcome: clientWelcome.extract
};

exports.Extractor = {
	events
};