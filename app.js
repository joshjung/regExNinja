/*-----------------------------------------------------
  REGEXNINJA
-----------------------------------------------------*/

/*-----------------------------------------------------
  constants
-----------------------------------------------------*/
var PORT = process.env.PORT || 8080;

/*-----------------------------------------------------
  modules
-----------------------------------------------------*/
var debug = require('debug')('server'),
	http = require('http'),
	connect = require('connect'),
	express = require('express'),
	app = express(),
	server = require('http').Server(app),
	Routes = require('./src/routes'),
	routes = new Routes(app, express, server),
	RegExGenerator = require('regexgenerator'),
	Dictionary = require('./src/dictionary.js').Dictionary,
	GameServer = new require('./src/server');

/*-----------------------------------------------------
  Server Startup
-----------------------------------------------------*/
server.listen(PORT);
console.log("Server started on http://localhost:" + PORT);

var gameServer = new GameServer();
gameServer.start(routes.io);