var guid = require('guid');

var Game = function() {};

Game.prototype = {
	players: [],
	name: '',
	owner: undefined,
	guid: '',
	state: 'lobby',
	updateSockets: function(server) {
		for (var i = 0; i < this.players.length; i++) {
			var player = this.players[i];
			var socket = server.sockets.byPlayerName[player.name];
			console.log('game updateSockets for ' + player.name + " on " + socket.id);
			socket.emit('game', this);
		}
	}
};

var Player = function() {};

Player.prototype = {
	name: '',
	socket: undefined
};

module.exports = function(io) {
	/*-----------------------------------------------------
   Init
  -----------------------------------------------------*/
	var self = this;

	this.sockets = {
		list: [],
		byId: {},
		byPlayerName: {}
	};

	this.io = io;

	this.games = {
		list: [],
		byOwner: {},
		byName: {},
		byGuid: {},
		bySocketId: {}
	};

	this.players = {
		list: [],
		bySocketId: {},
		byName: {}
	};

	this.log = function(socket, val) {
		socket.emit('log', val);
	};

	this.addPlayer = function(_player, socket) {
		var player = new Player();

		player.name = _player.nameProposed;

		this.sockets.byPlayerName[player.name] = socket;

		this.players.list.push(player);
		this.players.bySocketId[socket.id] = player;
		this.players.byName[player.name] = player;
	};

	this.addGame = function(_game, socket) {
		var game = new Game();

		game.name = _game.nameProposed;
		game.owner = players.bySocketId[socket.id];
		game.players = [game.owner];
		game.guid = guid.raw();
		game.state = 'lobby';

		this.games.list.push(game);
		this.games.byName[game.name] = game;
		this.games.byOwner[game.owner.name] = game;
		this.games.byGuid[game.guid] = game;
		this.games.bySocketId[socket.id] = game;

		game.updateSockets(self);
		self.updateSockets();
	};

	this.joinGame = function(player, game) {
		game.players.push(player);
		games.bySocketId[this.sockets.byPlayerName[player.name].id] = game;
		game.updateSockets(self);
		self.updateSockets();
	};

	this.destroyGame = function(game) {
		self.games.list.splice(this.games.list.indexOf(game), 1);
		delete this.games.byGuid[game.guid];
		self.updateSockets();
	}

	this.playerDisconnect = function(socket) {
		self.sockets.list.splice(self.sockets.list.indexOf(socket), 1);
		var player = self.players.bySocketId[socket.id];
		var game = games.bySocketId[socket.id];
		if (game) {
			game.players.splice(game.players.indexOf(player), 1);

			if (game.players.length == 0) {
				self.destroyGame(game);
			}

			game.owner = game.players[0];

			game.updateSockets(self);
			self.updateSockets();
		}
	}

	/*-----------------------------------------------------
   Socket IO
  -----------------------------------------------------*/
	io.on('connection', function(socket) {
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
				self.addPlayer(player, socket);
			}
		});

		socket.on('disconnect', function() {
			self.log(socket, 'Disconnection: ' + socket.id, socket);

			self.playerDisconnect(socket);
		});

		socket.on('newGame', function(game) {
			self.log(socket, 'New Game Requested: ' + game.nameProposed, socket);
			self.addGame(game, socket);
		});

		socket.on('joinGame', function(gameGuid) {
			var player = self.players.bySocketId[socket.id];
			var game = self.games.byGuid[gameGuid];
			self.log(socket, 'Player ' + player.name + ' attempting to join ' + game.name);

			self.joinGame(player, game);
		});
	});

	/*-----------------------------------------------------
   Socket Interval Updates (game list)
  -----------------------------------------------------*/
	this.updateSockets = function() {
		for (var i = 0; i < self.sockets.list.length; i++) {
			var socket = self.sockets.list[i];
			socket.emit('games', {
				list: self.games.list.map(function(game) {
					return {
						name: game.name,
						owner: game.owner,
						guid: game.guid,
						players: game.players.map(function(player) {
							return player.name;
						})
					};
				})
			});
		}
	}

	this.updateSockets();
	setInterval(this.updateSockets, 5000);
}