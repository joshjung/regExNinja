/*-----------------------------------------------*\
 * modules
\*-----------------------------------------------*/
var guid = require('guid');
var debug = require('debug')('game');

/*-----------------------------------------------*\
 * Game
\*-----------------------------------------------*/
var Game = function(server, owner, name) {
	debug('NEW GAME CONSTRUCTOR: ' + owner + ' ' + name);
	this.server = server;
	this.name = name;
	this.owner = owner;
	this.players = [this.owner];
	this.guid = guid.raw();
	this.state = 'lobby';
};

Game.prototype = {
	//---------------------
	// variables
	//---------------------
	players: [],
	name: '',
	owner: undefined,
	guid: '',
	state: 'none',
	server: undefined,
	//---------------------
	// methods
	//---------------------
	start: function() {
		this.state = 'lobby';
		this.updateSockets();
	},
	updateSockets: function() {
		for (var i = 0; i < this.players.length; i++) {
			var player = this.players[i],
				socket = player.socket;
			debug('game updateSockets for ' + player.name + " on " + socket.id);
			socket.emit('game', this.serialize());
		}
	},
	addPlayer: function(player) {
		if (!player) {
			throw Error('oops player isn\'t defined');
		}
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
			ownerName: this.owner.name,
			guid: this.guid,
			state: this.state,
			players: this.players.map(function(player) {
				return player.name;
			})
		}
	}
};

module.exports = Game;