function token(dependencies) {
	const spawn = dependencies.spawn;
	const imgur = dependencies.imgur;
	const _console = dependencies.console;

	/**
	 * Status
	 *
	 * route to show message (GET http://<<URL>>/api/Status)
	 */
	const get = function (req, res) {
		res.json({
			success: true,
			message: "API is online"
		});
	};

	const refresh = (req, res) => {
		var script = "example";
		var source = "01";
		var destination = "01";
		compile(script, source, destination, function (data) {
			if (data.hasError === false) {
				imgur
					.uploadFile(`${dependencies.root}/lib/tokenization/images/output/${destination}.png`)
					.then(function (json) {
						var token = data.result.replace("http://example.com/evil.png", json.data.link);
						_console.success('Token generation', token);
						res.json({
							success: !data.hasError,
							data: token
						});
					})
					.catch(function (err) {
						_console.error(err.message);
						res.json({
							success: false,
							data: null,
							message: "Something was wrong while uploading token"
						});
					});
			} else {
				res.json({
					success: false,
					data: null,
					message: "Something was wrong while creating token"
				});
			}
		});
	};

	const compile = (script, source, destination, next) => {
		var scriptTemplate = "function Invoke-Token{%key='my:key';%iv='my:iv';Write-Host %('Key: ' + %key);Write-Host %('IV: ' + %iv);} ";
		var result = ``;
		var hasError = false;
		var token = tokenGenerator();
		var child = spawn("powershell.exe", [
			`Import-Module ${dependencies.root}/lib/tokenization/Invoke-PSImage.ps1; Invoke-PSImage`,
			`-Script "${(scriptTemplate.replace('my:key', token.key)).replace('my:iv', token.iv)}" -Image ${dependencies.root}/lib/tokenization/images/${source}.jpg -Out ${dependencies.root}/lib/tokenization/images/output/${destination}.png -Web`
		]);
		//var child = spawn('powershell.exe', [`${dependencies.root}/lib/tokenization/example.ps1`]); // first test
		child.stdout.on("data", function (data) {
			result += data;
		});
		child.stderr.on("data", function (data) {
			result += data;
			hasError = true;
		});
		child.on("exit", function () {
			next({
				result: result,
				hasError: hasError
			});
		});
		child.stdin.end();
	};

	const tokenGenerator = () => {
		return {
			key : keyGenerator(),
			iv : ivGenerator()
		}
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

	const keyGenerator = function () {
		return stringToAscii(randomStringGenerator(12)).join(':');
	}

	const ivGenerator = function () {
		return stringToAscii(randomStringGenerator(10, 'keyiv-')).join(':');
	}

	return {
		get: get,
		refresh: refresh
	};
}

module.exports = token;