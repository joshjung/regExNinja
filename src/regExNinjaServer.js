var guid = require('guid');

var Game = function() {

};

Game.prototype = {

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
		byOwnerGUID: {}
	};

	this.players = {
		list: [],
		byGUID: {},
		bySocketId: {}
	};

	this.log = function(socket, val) {
		console.log(val);
		socket.emit('log', val);
	}

	/*-----------------------------------------------------
   Socket IO
  -----------------------------------------------------*/
	io.on('connection', function(socket) {
		self.log(socket, 'New Connection ' + socket.id);

		sockets.list.push(socket);
		sockets.byId[socket.id] = socket;

		socket.emit('game', {
			guid: guid.raw(),
			diff: 0
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
					accept: true
				});
			}
		});

		socket.on('disconnect', function() {
			self.log(socket, 'Disconnection: ', socket);
			self.sockets.splice(self.sockets.indexOf(socket), 1);
		});
	});
}