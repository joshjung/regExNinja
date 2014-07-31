/*-----------------------------------------------------
  constants
-----------------------------------------------------*/
var SID_KEY = 'session.sid';

/*-----------------------------------------------------
  modules
-----------------------------------------------------*/
var debug = require('debug')('routes'),
	io = require('socket.io'),
	guid = require('guid');

/*-----------------------------------------------------
  Routes
-----------------------------------------------------*/
module.exports = function(app, express, server) {
	var cookieParser = express.cookieParser('very secret cookie string'),
		sessionStore = new express.session.MemoryStore();

	this.io = io.listen(server);
	this.io.set('authorization', function(data, callback) {
		debug('setting up authorization cookieParser');

		if (!data.headers.cookie) {
			return callback('socket.io: No cookie transmitted.', false);
		}

		cookieParser(data, {}, function(parseErr) {
			debug('parsing cookie');

			if (parseErr) {
				return callback('Error parsing cookies.', false);
			}

			var sidCookie = (data.secureCookies && data.secureCookies[SID_KEY]) ||
				(data.signedCookies && data.signedCookies[SID_KEY]) ||
				(data.cookies && data.cookies[SID_KEY]);

			console.log('Loading session from sessionStore for sid: ' + sidCookie);

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

	app.configure(function() {
		debug('express app configuring');

		app.use(cookieParser);
		app.use(express.session({
			store: sessionStore,
			key: SID_KEY
		}));
	});

	app.use(express.static('public'));
	app.use(express.static('node_modules'));

	app.get('/', function(req, res) {
		res.sendfile(__dirname + '/index.html');
	});

	app.get('/login/:id', function(req, res) {
		debug('login');

		req.session.playerName = req.params.id;
		req.session.isLogged = true;

		res.send(200, JSON.stringify({
			player: {
				name: req.session.playerName,
				guid: guid.raw()
			}
		}));

		debug('session: ' + JSON.stringify(req.session, null, 4));

		debug('player ' + req.session.playerName + ' logging in');
	});

	app.get('/session', function(req, res) {
		debug('/session requested');
		debug(req.session);

		if (req.session) {
			res.send(200, {
				name: req.session.playerName,
				guid: guid.raw()
			});
		} else {
			res.send(200, 'fail');
		}
	});

	app.get('/logout', function(req, res) {
		req.session.playerName = undefined;
		req.session.isLogged = false;
		res.send(200, JSON.stringify({
			logout: true
		}));
		debug('player logging out');
	});

	app.use(function(req, res, next) {
		debug(req.originalUrl);
		res.send(404, 'Sorry can\'t find that!');
	});
};