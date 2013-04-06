var express     = require('express.io'),
    app         = express().http().io(),
	  regexEngine = require('./regExGen.js'),
    Dictionary  = require('./Dictionary.js').Dictionary;

// app instance vars

var dictionary = new Dictionary();

// app configuration

app.listen(process.env.PORT || 3000);

// routes

app.get('/', function (req, res) {
	res.send("hello Express");
});

// test code

words = ["regular", "expression", "ninja"];

var i = Math.floor(Math.random() * words.length);
var whichWord = words[i];

console.log(whichWord);

var regEx = regexEngine.generateRegExFrom(whichWord, 0);

console.log("Original Word: " + whichWord);
console.log("Regular Expression: " + regEx);
console.log("Matches: " + whichWord.replace(new RegExp(regEx), "success"));

console.log(dictionary.baseWordForDifficulty(0.8));
dictionary.checkValidityOfWord({ word: 'face', handler: function(isValid) {
  console.log(isValid ? 'legit' : 'illegit');
}});
