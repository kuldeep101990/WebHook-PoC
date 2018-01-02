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
		compile(script, source, destination);
	}

	const compile = (script, source, destination) => {
		var child = spawn("powershell.exe",[`${dependencies.root}/lib/tokenization/generator.ps1`, `-Script ${dependencies.root}/lib/tokenization/${script}.ps1 -Image ${dependencies.root}/lib/tokenization/${source}.jpg -Out ${dependencies.root}/lib/tokenization/output/${destination}.png -Web`]);
		child.stdout.on("data",function(data){
			console.log("Powershell Data: " + data);
		});
		child.stderr.on("data",function(data){
			console.log("Powershell Errors: " + data);
		});
		child.on("exit",function(){
			console.log("Powershell Script finished");
		});
		child.stdin.end();
	}

	return {
		get: get,
		refresh: refresh,
	}
}

module.exports = token;