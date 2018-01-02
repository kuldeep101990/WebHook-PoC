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
const imgur = require("imgur");
const aesjs = require('aes-js');
const request = require('request');

console.log(` Server:  ${config.ServerName}`);
console.log(` version: ${config.ServerVersion}`);
console.log(" ------------------------------------");

/**
 * Configuration
 */
const cross = require("./core/cross")({ config: config });
cross.Settings();

var dependencies = {
	express: express,
	config: config,
	app: app,
	path: path,
	http: http,
	bodyParser: bodyParser,
	jwt: jwt,
	colors: colors,
	cross: cross,
	root: __dirname,
	isJsonString: str => {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	},
	spawn: spawn,
	imgur: imgur,
	aesjs: aesjs,
	request: request,
};

console.log(dependencies.colors.green(" Server: ") + "Libs imported");

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json()); // support json encoded bodies

/**
 * Initialize all app
 */
const mainServer = require("./core/main")(dependencies);

mainServer.Initialize(() => {
	/**
	 * Launching server
	 */
	console.log(
		`${dependencies.colors.cyan(" Server: ")}http://localhost:${
		dependencies.config.ServerPort
		}`
	);
});

/**
 * Listening on port
 */
app.listen(
	cross.NormalizePort(process.env.PORT || dependencies.config.ServerPort)
);
