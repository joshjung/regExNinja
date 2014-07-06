var app = angular.module('regExNinja', [])

app.service('regExNinjaService', function() {
	var self = this;
	var _game = undefined,
		_player = undefined,
		_log = [];

	this.control = undefined;

	this.pushLog = function(val) {
		_log.push(_log.length + ':' + val);

		console.log('log: ', _log);

		if (self.control) {
			self.control.$scope.serverLog.list = _log
			self.control.$scope.$apply();
		}
	};

	this.__defineSetter__('game', function(val) {
		_game = val;

		if (self.control) {
			angular.extend(self.control.$scope.game, val);
			self.control.$scope.$apply();
		}
	});

	this.__defineGetter__('game', function() {
		return _game;
	});

	this.__defineSetter__('player', function(val) {
		_player = val;
	});

	this.__defineGetter__('player', function() {
		return _player;
	});

	this.socket = io.connect('http://localhost');

	this.socket.on('game', function(data) {
		self.game = data;
	});

	this.socket.on('log', function(data) {
		self.pushLog(data);
	});

	this.socket.on('joinAccept', function(data) {
		self.control.$scope.loggedIn = true;
		self.control.$scope.$apply();
	});
});

app.controller('regExNinjaController', function($scope, regExNinjaService) {
	var self = regExNinjaService.control = this;
	this.$scope = $scope;
	this.$scope.loggedIn = false;
	this.$scope.game = {
		guid: '',
		diff: 0
	};

	regExNinjaService.player = this.$scope.player = {
		name: undefined,
		nameProposed: ''
	}

	this.$scope.serverLog = {
		list: []
	};

	this.$scope.startGame = function(event) {
		console.log('starting as ' + self.$scope.player.nameProposed);
		regExNinjaService.socket.emit('join', regExNinjaService.player);
	}
})

app.run(function(regExNinjaService) {
	console.log('running!');
});