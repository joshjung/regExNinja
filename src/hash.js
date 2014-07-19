/*-----------------------------------------------*\
 * hash
\*-----------------------------------------------*/
var Hash = function(keys) {
	var map = {},
		list = [];

	this.keyFields = keys;

	this.__defineGetter__('all', function() {
		return list;
	});
};

Hash.prototype = {
	add: function(obj) {
		for (var key in this.keyFields) {
			var inst = this.find(obj, key);
			if (inst) {
				if (map[inst]) {
					throw Error('Hash key ' + obj[key] + ' already exists');
				}

				map[inst] = obj;
			}
		}

		list.push(obj);
	},
	addMap: function(key, obj) {
		map[key] = obj;
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

		list.splice(list.indexOf(obj), 1);
	},
	find: function(obj, path) {
		if (typeof path === 'string') {
			return obj[path];
		}

		// else assume array.
		while (path.length) {
			obj = obj[path.shift()];
		}

		return obj;
	}
};

module.exports = Hash;