/*-----------------------------------------------------
  REGEXNINJA
-----------------------------------------------------*/
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var RegExGenerator = require('regexgenerator');
var Dictionary = require('./src/dictionary.js').Dictionary;
var players = [];
var game = new require('./src/regExNinjaServer')(io);

/*-----------------------------------------------------
  Server Startup
-----------------------------------------------------*/
server.listen(8080);

/*-----------------------------------------------------
  Exposed Directories
-----------------------------------------------------*/
app.use(express.static('src'));
app.use(express.static('node_modules'));

/*-----------------------------------------------------
  Routes
-----------------------------------------------------*/
app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
});

app.use(function(req, res, next) {
	console.log(req.originalUrl);
	res.send(404, 'Sorry can\'t find that!');
});

// app instance vars

// var dictionary = new Dictionary();

// // test code

// words = ["regular", "expression", "ninja"];

// var i = Math.floor(Math.random() * words.length);
// var whichWord = words[i];

// var regEx = new RegExGenerator.RegExGenerator(1.0).generate(whichWord);

// console.log("Original Word: " + whichWord);
// console.log("Regular Expression: " + regEx);
// console.log("Matches: " + whichWord.replace(new RegExp(regEx), "success"));

// console.log(dictionary.baseWordForDifficulty(0.8));
// dictionary.checkValidityOfWord({
// 	word: 'face',
// 	handler: function(isValid) {
// 		console.log(isValid ? 'legit' : 'illegit');
// 	}
// });