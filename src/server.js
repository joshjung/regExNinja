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

	this.sockets = new Hash(['id']);
	this.games = new Hash([
		['owner', 'name'], 'name', 'guid', ['owner', 'socket', 'id']
	]);
	this.players = new Hash([
		['socket', 'id'], 'name'
	]);
};

Server.prototype = {
	//---------------------
	// methods
	//---------------------
	start: function(io) {
		debug('Starting RegExNinja socket server');
		this.io = io;
		this.io.on('connection', this.socket_connectionHandler.bind(this));
		setInterval(this.updateSockets.bind(this), 5000);
		this.updateSockets();
	},
	log: function(socket, val) {
		debug('socket: ' + socket.id, val);
		socket.emit('log', val);
	},
	newPlayerForSocket: function(playerProposed, socket) {
		var player = new Player(playerProposed.nameProposed, socket);
		this.players.add(player);
		this.sockets.addMap(player.name, socket);
	},
	newGame: function(proposedGame, socket) {
		debug('newGame: ' + socket.id);
		debug('newGame: ', this.players);

		this.games.add(new Game(this, this.players.get(socket.id), proposedGame.nameProposed));

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

		this.updateSockets();
	},
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
				this.destroyGame(game);
			}

			this.updateSockets();
		}
	},
	socket_connectionHandler: function(socket) {
		var self = this;
		this.log(socket, 'New Connection ' + socket.id);

		this.sockets.add(socket);

		socket.emit('connectionAccept', {
			guid: guid.raw()
		});

		socket.on('join', function(player) {
			self.log(socket, 'Player accepted: ' + player.nameProposed);
			socket.emit('joinAccept', {
				accept: true,
				socketId: socket.id
			});
			self.newPlayerForSocket(player, socket);
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
		debug('updating all sockets with game list');
		var games = {
			list: this.games.all.map(function(game) {
				return game.serialize();
			})
		};

		for (var i = 0; i < this.sockets.all.length; i++) {
			this.sockets.all[i].emit('games', games);
		}
	}
};

/*-----------------------------------------------*\
 * exports
\*-----------------------------------------------*/
module.exports = Server;