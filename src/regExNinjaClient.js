var app = angular.module('regExNinja', [])

app.service('regExNinjaService', function() {
	var self = this;

	this.control = undefined;

	//--------------------------
	// pushLog
	//--------------------------
	this.pushLog = function(val) {
		console.log('log: ', val);

		self.control.$scope.serverLog.list.push(val);
		self.control.$scope.$apply();
	};

	//--------------------------
	// game
	//--------------------------
	this.__defineSetter__('game', function(val) {
		angular.extend(self.control.$scope.game, val);
		self.control.$scope.$apply();
	});

	this.__defineGetter__('game', function() {
		return self.control.$scope.game;
	});

	//--------------------------
	// player
	//--------------------------
	this.__defineGetter__('player', function() {
		return self.control.$scope.player;
	});

	//--------------------------
	// games
	//--------------------------
	this.__defineSetter__('games', function(val) {
		angular.extend(self.control.$scope.games, val);
		self.control.$scope.$apply();
	});

	this.__defineGetter__('games', function() {
		return self.control.$scope.games;
	});

	this.setupSocket = function() {
		self.socket = io.connect('http://localhost');

		self.socket.on('connectionAccept', function(data) {
			self.guid = data.guid;
			if (self.control) {
				self.control.reset(true);
			}
		});

		self.socket.on('game', function(data) {
			self.game = data;
		});

		self.socket.on('log', function(data) {
			self.pushLog(data);
		});

		self.socket.on('joinAccept', function(data) {
			self.control.$scope.loggedIn = true;
			self.player.name = self.player.nameProposed;
			self.control.$scope.$apply();
		});

		self.socket.on('games', function(data) {
			console.log('games list received', data);
			self.games = data;
		});
	}
});

app.run(function(regExNinjaService) {
	regExNinjaService.setupSocket();
});

app.controller('regExNinjaController', function($scope, regExNinjaService) {
	var self = regExNinjaService.control = this;
	this.$scope = $scope;

	this.reset = function(apply) {
		this.$scope.loggedIn = false;
		this.$scope.game = {
			guid: '',
			diff: 0,
			state: undefined
		};

		this.$scope.games = {
			list: []
		};

		regExNinjaService.player = this.$scope.player = {
			name: undefined,
			nameProposed: ''
		}

		this.$scope.serverLog = {
			list: []
		};

		if (apply) {
			this.$scope.$apply();
		}
	}

	this.reset(false);

	this.$scope.startGame = function(event) {
		console.log('starting as ' + self.$scope.player.nameProposed);
		regExNinjaService.socket.emit('join', regExNinjaService.player);
	}

	this.$scope.btnNewGame_clickHandler = function(event) {
		self.$scope.newGame = true;
	}

	this.$scope.btnAddNewGame_clickHandler = function(event) {
		console.log('attempting new game');
		self.$scope.newGame = false;
		regExNinjaService.socket.emit('newGame', regExNinjaService.game);
		regExNinjaService.game.nameProposed = '';
	}

	this.$scope.btnJoinGame_clickHandler = function(event) {
		console.log('joining ' + event.currentTarget.id);
		regExNinjaService.socket.emit('joinGame', event.currentTarget.id);
	}

	this.$scope.btnGameList_clickHandler = function(event) {
		self.$scope.newGame = false;
	}
})

app.run(function(regExNinjaService) {
	console.log('running!');
});