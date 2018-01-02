function Cross(dependencies) {
	const settings = () => {
		String.prototype.replaceAll = function (search, replacement) {
			var target = this;
			return target.replace(new RegExp(search, 'g'), replacement);
		};

		String.prototype.capitalize = function () {
			return this.replace(/\b\w/g, l => l.toUpperCase());
		}
	}

	const normalizePort = (val) => {
		var port = parseInt(val, 10);

		if (isNaN(port)) {
			// named pipe
			return val;
		}

		if (port >= 0) {
			// port number
			return port;
		}

		return false;
	}

	const idGenerator = (length, prefix) => {
		// Convert it to base 36 (numbers + letters), and grab the first 9 characters
		// after the decimal.
		return (prefix == undefined ? 'video-' : prefix) + Math.random().toString(36).substr(2, (length == undefined ? 5 : length));
	}

	const throwError = function (message) {
		if (message) {
			return { success: false, message: message, result: null };
		}
		else {
			return { success: false, message: 'Something was wrong while you make this action', result: null };
		}
	}

	const throwSuccess = function (data, message) {
		if (message) {
			return {
				success: true,
				message: message,
				result: data
			}
		}
		else {
			return {
				success: true,
				message: 'Operation completed succesfuly',
				result: data
			}
		}
	}

	const propertyIsValid = function (property) {
		if (property) {
			if (property.success === true) {
				return true;
			}
			else {
				return false;
			}
		}
		else {
			return false;
		}
	}

	const sendBadRequest = function (req, res) {
		res.render('maintenanceView', null);
	}

	const randomStringGenerator = function (length, prefix) {
		// Convert it to base 36 (numbers + letters), and grab the first 9 characters
		// after the decimal.
		return (prefix == undefined ? 'key-' : prefix) + Math.random().toString(36).substr(2, (length == undefined ? 5 : length));
	}

	const stringToAscii = function (input) {
		var result = [];
		for (var key in input) {
			if (input.hasOwnProperty(key)) {
				result.push(input[key].charCodeAt());
			}
		}
		return result;
	}

	return {
		Settings: settings,
		NormalizePort: normalizePort,
		IDGenerator: idGenerator,
		ThrowError: throwError,
		ThrowSuccess: throwSuccess,
		PropertyIsValid: propertyIsValid,
		SendBadRequest: sendBadRequest,
		randomStringGenerator: randomStringGenerator,
		stringToAscii:stringToAscii,
	}
}

module.exports = Cross;