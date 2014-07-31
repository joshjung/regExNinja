/*-----------------------------------------------*\
 * Player
\*-----------------------------------------------*/
var Player = function(name, socket, guid) {
	this.name = name;
	this.guid = guid;
	this.socket = socket;
};

Player.prototype = {
	name: '',
	guid: '',
	socket: undefined
};

module.exports = Player;