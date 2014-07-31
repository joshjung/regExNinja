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
			console.log('Connection made', data);

			self.guid = data.guid;

			self.socket.emit('join', self.player);
		});

		self.socket.on('game', function(data) {
			self.game = data;
			console.log('game received', data);
		});

		self.socket.on('log', function(data) {
			self.pushLog(data);
		});

		self.socket.on('games', function(data) {
			console.log('games list received', data);
			self.games = data;
		});
	}
});

app.run(function(regExNinjaService, $http) {
	console.log('run');

	$http({
		method: 'GET',
		url: '/session'
	}).success(function(data, status, headers, config) {
		console.log('/session:', data);
		regExNinjaService.player.name = data.playerName;

		regExNinjaService.setupSocket();
	}).error(function(data, status, headers, config) {
		console.log('error', data);
	});
});

app.controller('regExNinjaController', function($scope, $http, regExNinjaService) {
	var service = regExNinjaService;
	var self = regExNinjaService.control = this;
	this.$scope = $scope;

	this.reset = function(apply) {
		this.$scope.loggedIn = function() {
			return self.$scope.player && self.$scope.player.name !== undefined;
		};

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
		$http({
			method: 'GET',
			url: '/login/' + self.$scope.player.nameProposed
		}).success(function(data, status, headers, config) {
			var player = data.player;
			service.player.name = player.name;

			if (service.socket) {
				service.socket.socket.reconnect();
			} else {
				service.setupSocket();
			}
		}).error(function(data, status, headers, config) {
			console.log('error', data);
		});
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