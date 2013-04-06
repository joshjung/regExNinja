words = ["regular", "expression", "ninja"];

String.prototype.repeat = function( num )
{
    return new Array( num + 1 ).join( this );
}

var generateRegExFrom = function(word) {
    this.result = {regEx: "", originalWord: word, curWord: word, curSlice: word};

    this.regEx_none = function(wordPiece)
    {
        return wordPiece;
    }

    this.regEx_dot = function(wordPiece)
    {
        return ".".repeat(wordPiece.length);
    }

    this.regExGenerators = [this.regEx_dot, this.regEx_none];

    this.genRegExSlice = function(result)
    {
        var typeOfSlice = Math.floor(Math.random() * this.regExGenerators.length);
        result.regEx += regExGenerators[typeOfSlice](result.curSlice);
    }

    this.popRandomLettersFrom = function(result)
    {
        var count = (result.curWord.length > 2) ? Math.floor(Math.random() * (result.curWord.length - 2)) + 1 : result.curWord.length;
       
        console.log("splicing: " + count);

        result.curSlice = result.curWord.substr(0, count);
        result.curWord = result.curWord.substr(count);       

        genRegExSlice(result);

        console.log(result);

        return result;
    }    

    while (result.curWord.length)
    {
        this.result = this.popRandomLettersFrom(this.result);
    }
}

var i = Math.floor(Math.random() * words.length);
var whichWord = words[i];

console.log(whichWord);

generateRegExFrom(whichWord);
