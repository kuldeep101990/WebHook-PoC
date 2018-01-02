function token(dependencies) {
	const cross = dependencies.cross;
	const spawn = dependencies.spawn;
	const imgur = dependencies.imgur;
	const aesjs = dependencies.aesjs;
	const _console = dependencies.console;

	const getPublicKeyPair = function (req, res) {
		if (publicKeyPair) {
			res.json({
				success: true,
				result: publicKeyPair,
				message: 'Public Key Pair'
			})
		}
		else {
			res.json({
				success: false,
				result: null,
				message: 'Something was wrong while getting public data'
			})
		}
	}

	const getSignedPrivateKeyPair = function (req, res) {
		if (signedPrivateKeyPair) {
			res.json({
				success: true,
				result: signedPrivateKeyPair,
				message: 'Signed Private Key Pair'
			})
		}
		else {
			res.json({
				success: false,
				result: null,
				message: 'Something was wrong while getting public data'
			})
		}
	}

	const getUnsignedPrivateKeyPair = function () {
		if (unsignedPrivateKeyPair) {
			return {
				success: true,
				data: unsignedPrivateKeyPair,
				message: 'Unsigned Private Key Pair'
			}
		}
		else {
			return {
				success: false,
				data: null,
				message: 'Something was wrong while getting public data'
			};
		}
	}

	const refresh = (req, res) => {
		let imageName = Math.floor((Math.random() * 5) + 1) + '';

		compile(imageName, imageName, function (data) {
			if (data.hasError === false) {
				imgur
					.uploadFile(`${dependencies.root}/lib/tokenization/images/output/${imageName}.png`)
					.then(function (json) {
						var token = data.result.replace("[OUTPUT]", json.data.link);

						token = obfuscation(token);

						token = encryptWithPublicSign(token);
						signedPrivateKeyPair = token;
						_console.success('Token generation', token);

						res.json({
							success: true,
							data: token,
							message: 'Token generated succesfuly'
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

	const compile = (source, destination, next) => {
		var scriptTemplate = "function Invoke-Token{%key='my:key';%iv='my:iv';Write-Host %('Key: ' + %key);Write-Host %('IV: ' + %iv);} ";
		var result = ``;
		var hasError = false;
		var token = tokenGenerator();
		privateKeyPair = token;

		var child = spawn("powershell.exe", [
			`Import-Module ${dependencies.root}/lib/tokenization/Invoke-PSImage.ps1; Invoke-PSImage`,
			`-Script "${(scriptTemplate.replace('my:key', token.key)).replace('my:iv', token.iv)}" -Image ${dependencies.root}/lib/tokenization/images/${source}.jpg -Out ${dependencies.root}/lib/tokenization/images/output/${destination}.png -Web`
		]);

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
			key: keyGenerator(),
			iv: ivGenerator()
		}
	}

	const keyGenerator = function () {
		return cross.stringToAscii(cross.randomStringGenerator(12)).join(':');
	}

	const ivGenerator = function () {
		return cross.stringToAscii(cross.randomStringGenerator(10, 'keyiv-')).join(':');
	}

	const obfuscation = function (input) {
		return input
			.replaceAll('a', '2oBv')
			.replaceAll('A', 'kl')
			.replaceAll('b', 'lm48X')
			.replaceAll('c', 'RT')
			.replaceAll('New', '&X49')
			.replaceAll('imgur', '<x')
			.replaceAll('Text', '!ñL')
			.replaceAll('http', 'lLm2873Y')
			.replaceAll('System', '##Yu')
			.replaceAll('Byte', 'yw#e')
			.replaceAll('GetString', '¿qwv')
			.replaceAll('ssem', '34PMd¿')
			.replaceAll('wing', '!#¡')
			.replaceAll('Bit', 'myf¿!')
			.replaceAll('Type', '¨')
			.replaceAll('Client', ',;,')
			.replaceAll('Open', 'tdN8849m')
			.replaceAll('//', '__')
			.replaceAll('png', '..99Do.')
			.replaceAll('fore', 'o-pJ#')
			.replaceAll('in', 'ak998NM')
			.replaceAll('Floor', 'lL65k')
			.replaceAll('IEX', 'aDf]')
			.replaceAll('SCII', 'po,')
			.replaceAll('GetPixel', 'F80]93')
			.replaceAll('Net', 'iU467p')
			.replaceAll(' ', '2P#Bv');
	}

	const encryptWithPublicSign = function (input) {
		console.log('publicKeyPair', publicKeyPair);
		var textBytes = aesjs.utils.utf8.toBytes(input);
		var aesOfb = new aesjs.ModeOfOperation.ofb(publicKeyPair.key.split(':').map((value) => { return +value }), publicKeyPair.iv.split(':').map((value) => { return +value }));
		var encryptedBytes = aesOfb.encrypt(textBytes);
		var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
		return encryptedHex;
	}

	const encryptWithPrivateSign = function (input) {
		var textBytes = aesjs.utils.utf8.toBytes(input);
		var aesOfb = new aesjs.ModeOfOperation.ofb(privateKeyPair.key.split(':').map((value) => { return +value }), privateKeyPair.iv.split(':').map((value) => { return +value }));
		var encryptedBytes = aesOfb.encrypt(textBytes);
		var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
		return encryptedHex;
	}

	const isAllowed = function (req, res) {
		res.json({ result: encryptWithPrivateSign(JSON.stringify({ success: true, message: 'You are allowed to use this webhook', result: true })) });
	}

	const publicKeyPair = tokenGenerator();
	var unsignedPrivateKeyPair = {};
	var signedPrivateKeyPair = {};

	return {
		getPublicKeyPair: getPublicKeyPair,
		getSignedPrivateKeyPair: getSignedPrivateKeyPair,
		getUnsignedPrivateKeyPair: getUnsignedPrivateKeyPair,
		refresh: refresh,
		isAllowed: isAllowed,
		encryptWithPrivateSign: encryptWithPrivateSign
	};
}

module.exports = token;