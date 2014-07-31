var debug = require('debug')('hash');
/*-----------------------------------------------*\
 * hash
\*-----------------------------------------------*/
var Hash = function(keys) {
	this.map = {};
	this.list = [];

	this.keyFields = keys;

	this.__defineGetter__('all', function() {
		return this.list;
	});
};

Hash.prototype = {
	add: function(obj) {
		debug('adding: ' + obj);
		for (var key in this.keyFields) {
			key = this.keyFields[key];
			debug('key: ' + key);
			var inst = this.find(obj, key);
			if (inst) {
				if (this.map[inst]) {
					throw Error('Hash key ' + obj[key] + ' already exists');
				}

				debug('mapping ' + inst + ' -> ' + obj);

				this.map[inst] = obj;
			}
		}

		this.list.push(obj);
	},
	addMap: function(key, obj) {
		this.map[key] = obj;
	},
	get: function(key) {
		return this.map[key];
	},
	has: function(key) {
		return !!this.map[key];
	},
	remove: function(obj) {
		for (var key in this.keyFields) {
			var inst = this.find(obj, key);
			if (inst) {
				delete map[inst];
			}
		}

		this.list.splice(this.list.indexOf(obj), 1);
	},
	find: function(obj, path) {
		if (typeof path === 'string') {
			return obj[path];
		}

		// else assume array.
		while (path.length && obj) {
			obj = obj[path.shift()];
		}

		return obj;
	}
};

module.exports = Hash;