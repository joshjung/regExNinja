regexEngine = require('./regExGen.js');

words = ["regular", "expression", "ninja"];

var stdin = process.stdin, stdout = process.stdout;
var diff = 0;

stdin.resume();
process.stdin.setEncoding('utf8');

var getDifficulty = function (callback)
{
    stdout.write("Difficulty (0.0 - 1.0): ");

    stdin.once("data", function(data) 
    {
        diff = parseFloat(data.toString());
        console.log("Setting difficulty to " + diff);
        callback();
    });
}

var test = function() 
{
    var i = Math.floor(Math.random() * words.length);
    var whichWord = words[i];

    var regEx = new regexEngine.RegExGenerator(diff).generate(whichWord);

    console.log("Original Word: " + whichWord);
    console.log("Regular Expression: " + regEx);
    console.log("Matches: " + whichWord.replace(new RegExp(regEx), "success"));
}

var promptUser = function ()
{
    stdin.resume();
    stdout.write("q to quit: ");
    
    stdin.once("data", function(data) 
    {
        console.log(data);

        if (data.toString().trim() != "q")
        {
            test();
            promptUser();
        }
        else
        {
            process.exit();
        }
    });
}

getDifficulty(promptUser);
