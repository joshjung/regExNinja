RegExGenerator  = require('./RegExGenerator.js');
Dictionary      = require('./Dictionary.js');

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
        if (isNaN(diff))
        {
            diff = 1.0;
        }

        console.log("Setting difficulty to " + diff);
        callback();
    });
}

var test = function() 
{
    var whichWord = Dictionary.randomWordForDifficulty(diff);

    var regEx = new RegExGenerator.RegExGenerator(diff).generate(whichWord);

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
