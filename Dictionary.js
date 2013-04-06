var Dictionary = function() {

  // private interface

  var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
  var baseWordArray = require('./resources/word_set.json');

  // public interface

  return {
    wordnikConfiguration: {
      apiKey: '94e9a303309616773e91607d12005b116716593c2c73d6a5c'
    },

    // arguments:
    //    + difficulty: decimal number in the range 0.0-1.0
    baseWordForDifficulty: function(difficulty) {
      var baseWordIndex = Math.floor(difficulty * (baseWordArray.length - 1));
      return baseWordArray[baseWordIndex];
    },

    // arguments:
    //    + object in the format { word: <string>, handler: function(<boolean>) }
    checkValidityOfWord: function(arguments) {
      var verifyWordRequest = new XMLHttpRequest();
      var apiPath = 'http://api.wordnik.com/word.json/' + arguments.word;
      var handler = arguments.handler;

      console.log(apiPath);

      verifyWordRequest.open('GET', apiPath);
      verifyWordRequest.setRequestHeader('Content-type', 'application\/json');
      verifyWordRequest.setRequestHeader('api_key', this.wordnikConfiguration.apiKey);
      
      verifyWordRequest.onload = function() {
        console.log("response: " + this.response);
        handler(true);
      };

      verifyWordRequest.send();
    }
  }
}

exports.Dictionary = Dictionary;