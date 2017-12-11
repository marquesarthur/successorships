let {Utils} = require('../utils');

function extractMessageRTT(log) {
	let eventsOfInterest = ['shippy_client_received_stateupdate', 'shippy_client_call_remove', 'shippy_client_call_add'];



	return new Promise((fullfil, reject) => {
		try {
			let filtered = log.filter((e) => {
				return eventsOfInterest.includes(e.event);
			});

			let events = Utils.chronologicallySort(filtered);
			let header = 'rtt', eventEnds = ['shippy_client_received_stateupdate'];

			let result = ['event,operation,time,pkgSize,numSuccessors,version'];
			for (let idx = 0; idx < events.length; idx++) {
				let current = events[idx];
				if (current.event.includes('shippy_client_call_')) {
					let operation = current.event.split('_').pop();
					let nextIdx = idx + 1;
					while (nextIdx < events.length) {
						let next = events[nextIdx];
						if (eventEnds.includes(next.event) && next.source === current.source) {
							let elapsedTime = (next.timestamp - current.timestamp) ;
							result.push(header + ',' + operation + ',' + elapsedTime + ',' +
								next.pkgSize + ',' + next.numSuccessors + ',' +
								next.version
							);
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
	extract: extractMessageRTT
};