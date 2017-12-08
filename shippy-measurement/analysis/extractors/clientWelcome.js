let {Utils} = require('../utils');

function extractClientWelcome(log) {

	let eventsOfInterest = ['shippy_become_client_begin', 'shippy_client_received_welcome', 'shippy_client_received_stateupdate'];

	return new Promise((fullfil, reject) => {
		try {
			let filtered = log.filter((e) => {
				return eventsOfInterest.includes(e.event);
			});

			let events = Utils.chronologicallySort(filtered);
			let header = 'client_welcome,', eventBegin = ['shippy_become_client_begin'],
				eventEnds = ['shippy_client_received_stateupdate'];

			let result = ['event,time,pkgSize,numSuccessors'];
			for (let idx = 0; idx < events.length; idx++) {
				let current = events[idx];
				if (eventBegin.includes(current.event)) {
					let nextIdx = idx + 1;
					while (nextIdx < events.length) {
						let next = events[nextIdx];
						if (eventEnds.includes(next.event) && typeof current.source !== 'undefined' && typeof next.tempID !== 'undefined' && next.tempID === current.source) {
							let elapsedTime = (next.timestamp - current.timestamp) / 1000;
							result.push(header + elapsedTime + ',' + next.pkgSize + ',' + next.numSuccessors);
							break;
						} else {
							nextIdx += 1;
						}
					}
				}
			}

			fullfil(result);
		} catch (err) {
			console.log(err);
			fullfil([]);
		}
	});
}

module.exports = {
	extract: extractClientWelcome
};