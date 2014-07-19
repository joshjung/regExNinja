/*-----------------------------------------------*\
 * modules
\*-----------------------------------------------*/
var guid = require('guid'),
	debug = require('debug')('server'),
	Game = require('./game'),
	Player = require('./player'),
	Hash = require('./hash');

/*-----------------------------------------------*\
 * Server
\*-----------------------------------------------*/
var Server = function(io) {
	debug('Server()');

	var self = this;

	this.io = io;

	this.sockets = new Hash(['id', ['player', 'name']]);
	this.games = new Hash([
		['owner', 'name'], 'name', 'guid', ['owner', 'socket', 'id']
	]);
	this.players = new Hash([
		['socket', 'id'], 'name'
	]);

	io.on('connection', socket_connectionHandler);

	this.updateSockets();
	setInterval(this.updateSockets, 5000);
};

Server.prototype = {
	//---------------------
	// methods
	//---------------------
	log: function(socket, val) {
		debug('socket: ' + socket.id, val);
		socket.emit('log', val);
	},
	newPlayerForSocket: function(playerProposed, socket) {
		var player = new Player();

		player.name = playerProposed.nameProposed;

		this.sockets.byPlayerName[player.name] = socket;

		this.players.list.push(player);
		this.players.bySocketId[socket.id] = player;
		this.players.byName[player.name] = player;
	},
	newGame: function(proposedGame, socket) {
		games.add(new Game(this, players.get(socket.id), proposedGame.nameProposed));

		this.updateSockets();
	},
	addPlayerToGame: function(player, game) {

		game.addPlayer(player);
		games.addMap(player.socket.id, game);

		this.updateSockets();
	},
	destroyGame: function(game) {
		game.destroy();

		this.games.remove(game);

		self.updateSockets();
	}
	//---------------------
	// events
	//---------------------
	socket_disconnectedHandler: function(socket) {
		var player = this.players.get(socket.id),
			game = this.games.get(socket.id);

		this.log(socket, 'Disconnection: ' + socket.id, socket);

		this.sockets.remove(socket);

		if (game) {
			game.removePlayer(player);

			if (game.players.length == 0) {
				self.destroyGame(game);
			}

			self.updateSockets();
		}
	},
	socket_connectionHandler: function(socket) {
		self.log(socket, 'New Connection ' + socket.id);

		sockets.list.push(socket);
		sockets.byId[socket.id] = socket;

		socket.emit('connectionAccept', {
			guid: guid.raw()
		});

		socket.on('join', function(player) {
			self.log(socket, 'Player attempt log in: ' + player.nameProposed);

			if (self.players.hasOwnProperty(player.nameProposed)) {
				self.log(socket, 'Player declined: ' + player.nameProposed);
				socket.emit('joinDecline', {
					accept: false,
					reason: 'Name already taken'
				});
			} else {
				self.log(socket, 'Player accepted: ' + player.nameProposed);
				socket.emit('joinAccept', {
					accept: true,
					socketId: socket.id
				});
				self.newPlayerForSocket(player, socket);
			}
		});

		socket.on('disconnect', function() {
			self.socket_disconnectedHandler(socket);
		});

		socket.on('newGame', function(game) {
			self.log(socket, 'New Game Requested: ' + game.nameProposed, socket);
			self.newGame(game, socket);
		});

		socket.on('addPlayerToGame', function(gameGuid) {
			var player = self.players.bySocketId[socket.id];
			var game = self.games.byGuid[gameGuid];
			self.log(socket, 'Player ' + player.name + ' attempting to join ' + game.name);

			self.addPlayerToGame(player, game);
		});
	},
	updateSockets: function() {
		var games = {
			list: this.games.list.map(function(game) {
				return game.serialize();
			})
		};

		for (var i = 0; i < self.sockets.all.length; i++) {
			self.sockets.all[i].emit('games', games);
		}
	}
}
/*-----------------------------------------------*\
 * exports
\*-----------------------------------------------*/
module.exports =

module.exports = Server;