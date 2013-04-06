require ("fs");
require ("./lib/framework.js");

/**
 * Generates a regular expression for a given word.
 *
 * @param word The word to gen for.
 * @param diff The difficulty (from 0 -  1)
 * @param depth The current depth if a recursion has occurred.
 */
exports.generateRegExFrom = function(word, diff, depth) 
{
    this.result = {regEx: "", originalWord: word, curWord: word, curSlice: word};
    this.depth = depth;

    this.regEx_none = function(wordPiece, diff, depth)
    {
        return wordPiece;
    }

    this.regEx_dot = function(wordPiece, diff, depth)
    {
        return ".".repeat(wordPiece.length);
    }

    this.regEx_plus = function(wordPiece, diff, depth)
    {
        return "(" + wordPiece + ")+";
    }

    this.regEx_orRecurse = function(wordPiece, diff, depth)
    {
        if (depth > 0)
        {
            return 0;
        }
      
        // From 2 - 5 depending on difficulty 
        var count = Math.ceil(diff * 4) + 1;

        var ors = [];
       
        for (var i = 0; i < count; i++)
        {
            ors.push(exports.generateRegExFrom(wordPiece, depth+1));
        } 

        fisherYates(ors);

        return "(" + ors.join("|") + ")";
    }

    this.regExGenerators = [this.regEx_none, this.regEx_dot, this.regEx_plus, this.regEx_orRecurse];

    this.genRegExSlice = function(result)
    {
        result.curRegExSlice = 0;

        //We keep looping until we find a slice that works. In some cases a random
        //reg ex slice generator may fail (for example if the depth is too deep)
        while (result.curRegExSlice == 0)
        {
            var typeOfSlice = Math.floor(Math.random() * this.regExGenerators.length * diff);
            result.curRegExSlice = this.regExGenerators[typeOfSlice](result.curSlice, this.depth);
        }
       
        result.regEx += (result.curRegExSlice);
    }

    this.popRandomLettersFrom = function(result)
    {
        var count = (result.curWord.length > 2) ? Math.floor(Math.random() * (result.curWord.length - 2)) + 1 : result.curWord.length;
       
        result.curSlice = result.curWord.substr(0, count);
        result.curWord = result.curWord.substr(count);       

        this.genRegExSlice(result);

        return result;
    }    

    while (this.result.curWord.length)
    {
        this.result = this.popRandomLettersFrom(this.result);
    }

    return this.result.regEx;
}

