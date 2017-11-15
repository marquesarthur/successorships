let Lib = (function() {

	function removeFromArray(array, item) {
		let index = array.indexOf(item);
		if (index >= 0) {
			array.splice(index, 1);
		}
	}

	return {
		removeFromArray: removeFromArray
	};

}());