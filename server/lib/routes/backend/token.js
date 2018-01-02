function token(dependencies) {
	const spawn = dependencies.spawn;

    /**
     * Status
     * 
     * route to show message (GET http://<<URL>>/api/Status)
     */
	const get = function (req, res) {
		res.json({ success: true, message: 'API is online' });
	}

	const refresh = (req, res) => {
		var script = 'example';
		var source = '01';
		var destination = '01';
		compile(script, source, destination, function (data) {
			res.json({ success: data.hasError, data: '\n' + data.result });
		});
	}

	const compile = (script, source, destination, next) => {
		var result = `${dependencies.root}/lib/tokenization/Invoke-PSImage.ps1 `+ `-Script ${dependencies.root}/lib/tokenization/${script}.ps1 -Image ${dependencies.root}/lib/tokenization/images/${source}.jpg -Out ${dependencies.root}/lib/tokenization/images/output/${destination}.png -Web`;
		var hasError = false;
		
		//var child = spawn("powershell.exe",[`${dependencies.root}/lib/tokenization/Invoke-PSImage.ps1`, `-Script ${dependencies.root}/lib/tokenization/${script}.ps1 -Image ${dependencies.root}/lib/tokenization/images/${source}.jpg -Out ${dependencies.root}/lib/tokenization/images/output/${destination}.png -Web`]);
		var child = spawn('powershell.exe', [`${dependencies.root}/lib/tokenization/example.ps1`]);
		child.stdout.on("data", function (data) {
			result += data;
		});
		child.stderr.on("data", function (data) {
			result += data;
			hasError = true;
		});
		child.on("exit", function () {
			next({ result: result, hasError: hasError });
		});
		child.stdin.end();
	}

	return {
		get: get,
		refresh: refresh,
	}
}

module.exports = token;