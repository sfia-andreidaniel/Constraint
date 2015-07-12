/// <reference path="main.ts" />
/// <reference path="node.d.ts" />

try {

	var fs = require( 'fs' ),
	    f = process.argv[2];

	if ( !f ) {
		throw Error( 'Usage: constraint.js <file_name>' );
	}

	f = fs.readFileSync( f );

	if ( !f ) {
		throw Error( "File empty: " + process.argv[2] );
	}

	fs.writeFileSync( 'test.js', 'var constraint = new Constraint(' + JSON.stringify( f + '' ) + '); var compiled; console.log( compiled = constraint.compile() );' );

} catch ( err ) {

	console.log( "\n\nERROR: " + err + "\n\n" );

	throw err;

}