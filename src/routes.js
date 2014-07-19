/*-----------------------------------------------------
  Routes
-----------------------------------------------------*/

module.exports = function(app) {
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
}