let {Utils} = require('../utils');

function extractClientWelcome(log) {

	let eventsOfInterest = ['shippy_become_client_begin', 'shippy_client_received_welcome',];

	return new Promise((fullfil, reject) => {
		try {
			let filtered = log.filter((e) => {
				return eventsOfInterest.includes(e.event);
			});

			let events = Utils.chronologicallySort(filtered);
			let header = 'client_welcome,', eventBegin = ['shippy_become_client_begin'],
				eventEnds = ['shippy_client_received_welcome'];

			let result = ['event,time,pkgSize'];
			for (let idx = 0; idx < events.length; idx++) {
				let current = events[idx];
				if (eventBegin.includes(current.event)) {
					let nextIdx = idx + 1;
					while (nextIdx < events.length) {
						let next = events[nextIdx];
						if (eventEnds.includes(next.event) && next.from === current.source) {
							let elapsedTime = (next.timestamp - current.timestamp) / 1000;
							result.push(header + elapsedTime + ',' + next.pkgSize);
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