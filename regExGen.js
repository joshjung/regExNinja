words = ["regular", "expression", "ninja"];

String.prototype.repeat = function( num )
{
    return new Array( num + 1 ).join( this );
}

function fisherYates ( myArray ) {
    var i = myArray.length, j, tempi, tempj;

    if ( i == 0 ) return false;

    while ( --i ) 
    {
        j = Math.floor( Math.random() * ( i + 1 ) );
        tempi = myArray[i];
        tempj = myArray[j];
        myArray[i] = tempj;
        myArray[j] = tempi;
    }
}

var generateRegExFrom = function(word, depth) 
{
    this.result = {regEx: "", originalWord: word, curWord: word, curSlice: word};
    this.depth = depth;

    this.regEx_none = function(wordPiece, depth)
    {
        return wordPiece;
    }

    this.regEx_dot = function(wordPiece, depth)
    {
        return ".".repeat(wordPiece.length);
    }

    this.regEx_orRecurse = function(wordPiece, depth)
    {
        if (depth > 0)
        {
            return 0;
        }

        var ors = [generateRegExFrom(wordPiece), generateRegExFrom(wordPiece)];

        fisherYates(ors);

        return "(" + ors[0] + "|" + ors[1] + ")";
    }

    this.regExGenerators = [this.regEx_none, this.regEx_dot, regEx_orRecurse];

    this.genRegExSlice = function(result)
    {
        result.curRegExSlice = 0;

        //We keep looping until we find a slice that works. In some cases a random
        //reg ex slice generator may fail (for example if the depth is too deep)
        while (result.curRegExSlice == 0)
        {
            var typeOfSlice = Math.floor(Math.random() * this.regExGenerators.length);
            result.curRegExSlice = regExGenerators[typeOfSlice](result.curSlice, this.depth);
        }
       
        result.regEx += (result.curRegExSlice);
    }

    this.popRandomLettersFrom = function(result)
    {
        var count = (result.curWord.length > 2) ? Math.floor(Math.random() * (result.curWord.length - 2)) + 1 : result.curWord.length;
       
        result.curSlice = result.curWord.substr(0, count);
        result.curWord = result.curWord.substr(count);       

        genRegExSlice(result);

        return result;
    }    

    while (result.curWord.length)
    {
        this.result = this.popRandomLettersFrom(this.result);
    }

    return this.result.regEx;
}

var i = Math.floor(Math.random() * words.length);
var whichWord = words[i];

console.log(whichWord);

var regEx = generateRegExFrom(whichWord, 0);

console.log("Original Word: " + whichWord);
console.log("Regular Expression: " + regEx);
console.log("Matches: " + whichWord.replace(new RegExp(regEx), "success"));
