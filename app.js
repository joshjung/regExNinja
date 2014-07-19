/*-----------------------------------------------------
  REGEXNINJA
-----------------------------------------------------*/

/*-----------------------------------------------------
  constants
-----------------------------------------------------*/
var PORT = process.env.PORT || 8080,
	SID_KEY = 'session.sid';

/*-----------------------------------------------------
  modules
-----------------------------------------------------*/
var http = require('http'),
	connect = require('connect'),
	express = require('express'),
	app = express(),
	routes = require('./src/routes')(app, express),
	cookieParser = express.cookieParser('very secret cookie string'),
	sessionStore = new express.session.MemoryStore(),
	server = require('http').Server(app),
	io = require('socket.io'),
	RegExGenerator = require('regexgenerator'),
	Dictionary = require('./src/dictionary.js').Dictionary,
	GameServer = new require('./src/server');

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
		key: SID_KEY
	}));
});

server.listen(PORT);
console.log("Server started on http://localhost:" + PORT);

io = io.listen(server);
io.set('authorization', function(data, callback) {
	if (!data.headers.cookie) {
		return callback('No cookie transmitted.', false);
	}

	cookieParser(data, {}, function(parseErr) {
		if (parseErr) {
			return callback('Error parsing cookies.', false);
		}

		var sidCookie = (data.secureCookies && data.secureCookies[SID_KEY]) ||
			(data.signedCookies && data.signedCookies[SID_KEY]) ||
			(data.cookies && data.cookies[SID_KEY]);

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

var gameServer = new GameServer();
gameServer.start(io);