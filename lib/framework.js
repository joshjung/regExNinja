String.prototype.repeat = function( num )
{
    return new Array( num + 1 ).join( this );
}

exports.fisherYates = function ( myArray ) {
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

