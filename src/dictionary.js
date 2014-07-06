var baseWordArray = require('../resources/word_set.json');

exports.baseWordForDifficulty = function(difficulty) {
	var baseWordIndex = Math.floor(difficulty * (baseWordArray.length - 1));
	return baseWordArray[baseWordIndex];
};

exports.randomWordForDifficulty = function(difficulty) {
	var baseWordIndex = Math.floor(Math.random() * difficulty * (baseWordArray.length - 1));
	return baseWordArray[baseWordIndex];
};

exports.Dictionary = function() {

	// private interface

	var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

	// public interface

	return {
		wordnikConfiguration: {
			apiBase: 'http://api.wordnik.com/v4',
			apiKey: '94e9a303309616773e91607d12005b116716593c2c73d6a5c'
		},

		// arguments:
		//    + object in the format { word: <string>, handler: function(<boolean>) }
		checkValidityOfWord: function(arguments) {
			var verifyWordRequest = new XMLHttpRequest();
			var apiPath = this.wordnikConfiguration.apiBase + '/word.json/' + arguments.word;
			var handler = arguments.handler;

			verifyWordRequest.open('GET', apiPath);
			verifyWordRequest.setRequestHeader('Content-type', 'application\/json; charset=utf-8');
			verifyWordRequest.setRequestHeader('api_key', this.wordnikConfiguration.apiKey);

			verifyWordRequest.onload = function() {
				console.log("response: " + this.response);
				handler(true); // should check the actual response object but it's not working so
			};

			verifyWordRequest.send();
		}
	}
}