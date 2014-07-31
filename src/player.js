/*-----------------------------------------------*\
 * Player
\*-----------------------------------------------*/
var Player = function(name, socket) {
	this.name = name;
	this.socket = socket;
};

Player.prototype = {
	name: '',
	socket: undefined
};

module.exports = Player;