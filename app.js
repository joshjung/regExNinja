var express = require('express.io'),
	app = express(),
	regexEngine = require('./regExGen.js');

app.listen(process.env.PORT || 3000);

words = ["regular", "expression", "ninja"];

var i = Math.floor(Math.random() * words.length);
var whichWord = words[i];

var regEx = regexEngine.generateRegExFrom(whichWord, 0.5, 0);

console.log("Original Word: " + whichWord);
console.log("Regular Expression: " + regEx);
console.log("Matches: " + whichWord.replace(new RegExp(regEx), "success"));


app.get('/', function (req, res) {
	res.send("hello Express");
});
