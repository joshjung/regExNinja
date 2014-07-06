var guid = require('guid');

var Game = function() {};

Game.prototype = {
	players: [],
	name: '',
	owner: undefined,
	guid: '',
	state: 'lobby'
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
		byId: {}
	};

	this.io = io;

	this.games = {
		list: [],
		byOwner: {},
		byName: {}
	};

	this.players = {
		list: [],
		bySocketId: {},
		byName: {}
	};

	this.log = function(socket, val) {
		console.log(val);
		socket.emit('log', val);
	};

	this.addPlayer = function(_player, socket) {
		var player = new Player();

		player.name = _player.nameProposed;

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

		console.log(game);

		socket.emit('game', game);
	};

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
			self.sockets.list.splice(self.sockets.list.indexOf(socket), 1);
		});

		socket.on('newGame', function(game) {
			self.log(socket, 'New Game Requested: ' + game.nameProposed, socket);
			self.addGame(game, socket);
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
						players: game.players.map(function(player) {
							return player.name;
						})
					};
				})
			});
		}
	}

	setInterval(this.updateSockets, 5000);
}