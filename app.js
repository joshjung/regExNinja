/*-----------------------------------------------------
  REGEXNINJA
-----------------------------------------------------*/

var port = 8080;

var http = require('http');
var connect = require('connect');
var express = require('express');
var app = express();
var cookieParser = express.cookieParser('very secret cookie string');
var sessionStore = new express.session.MemoryStore();
var server = require('http').Server(app);
var io = require('socket.io');
var RegExGenerator = require('regexgenerator');
var Dictionary = require('./src/dictionary.js').Dictionary;
var EXPRESS_SID_KEY = 'session.sid';

/*-----------------------------------------------------
  Server Startup
-----------------------------------------------------*/

app.configure(function() {
	app.use(cookieParser);
	app.use(express.session({
		store: sessionStore,
		cookie: {
			httpOnly: true
		},
		key: EXPRESS_SID_KEY
	}))
});

server.listen(8080);
io = io.listen(server);
var game = new require('./src/regExNinjaServer')(io);

io.set('authorization', function(data, callback) {
	if (!data.headers.cookie) {
		return callback('No cookie transmitted.', false);
	}

	cookieParser(data, {}, function(parseErr) {
		if (parseErr) {
			return callback('Error parsing cookies.', false);
		}

		var sidCookie = (data.secureCookies && data.secureCookies[EXPRESS_SID_KEY]) ||
			(data.signedCookies && data.signedCookies[EXPRESS_SID_KEY]) ||
			(data.cookies && data.cookies[EXPRESS_SID_KEY]);

		console.log('Loading session from sessionStore: ' + sidCookie);

		sessionStore.load(sidCookie, function(err, session) {
			if (err || !session || session.isLogged !== true) {
				return callback('not logged in!');
			} else {
				console.log('Session Loaded.');

				data.session = session;

				callback(null, true);
			}
		});
	});
});

console.log("Server started on http://localhost:" + 8080);

/*-----------------------------------------------------
  Exposed Directories
-----------------------------------------------------*/
app.use(express.static('src'));
app.use(express.static('node_modules'));

/*-----------------------------------------------------
  Routes
-----------------------------------------------------*/
app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
});

app.get('/login/:id', function(req, res) {
	req.session.playerName = req.params.id;
	req.session.isLogged = true;
	console.log(req);
	res.send(200, JSON.stringify({
		player: {
			name: req.session.playerName
		}
	}));
	console.log('player ' + req.session.playerName + ' logging in');
});

app.get('/session', function(req, res) {
	console.log('/session requested');
	console.log(req.session);

	res.send(200, {
		playerName: req.session.playerName
	});
});

app.get('/logout', function(req, res) {
	req.session.playerName = undefined;
	req.session.isLogged = false;
	res.send(200, JSON.stringify({
		logout: true
	}));
	console.log('player logging out');
});

app.use(function(req, res, next) {
	console.log(req.originalUrl);
	res.send(404, 'Sorry can\'t find that!');
});