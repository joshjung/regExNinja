/*-----------------------------------------------*\
 * modules
\*-----------------------------------------------*/
var guid = require('guid');
var debug = require('debug')('game');

/*-----------------------------------------------*\
 * Game
\*-----------------------------------------------*/
var Game = function(server, owner, name) {
	this.server = server;
	this.name = name;
	this.owner = owner;
	this.players = [game.owner];
	this.guid = guid.raw();
	this.state = 'lobby';

	updateSockets();
};

Game.prototype = {
	//---------------------
	// variables
	//---------------------
	players: [],
	name: '',
	owner: undefined,
	guid: '',
	state: 'lobby',
	server: undefined,
	//---------------------
	// methods
	//---------------------
	updateSockets: function() {
		for (var i = 0; i < this.players.length; i++) {
			var player = this.players[i];
			var socket = this.server.sockets.byPlayerName[player.name];
			debug('game updateSockets for ' + player.name + " on " + socket.id);
			socket.emit('game', this);
		}
	},
	addPlayer: function(player) {
		this.players.push(player);
		this.updateSockets();
	},
	removePlayer: function(player) {
		this.players.splice(this.players.indexOf(player), 1);

		this.owner = this.players[0];

		this.updateSockets();
	},
	destroy: function() {
		debug('destroying game' + this.name);
	},
	serialize: function() {
		return {
			name: this.name,
			owner: this.owner,
			guid: this.guid,
			players: this.players.map(function(player) {
				return player.name;
			})
		}
	}
};

module.exports = Game;