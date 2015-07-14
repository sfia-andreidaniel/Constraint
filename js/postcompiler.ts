/// <reference path="node.d.ts" />
/// <reference path="types.ts" />
/// <reference path="UI_Color.ts" />
/// <reference path="$I.ts" />

var fs = require( 'fs' ),
    srcFile = process.argv[2] || '',
    uiFile = process.argv[3] ? process.argv[3] : 'css/constraint.ui',
    nostub = ( process.argv[4] || '' ) == '--nostub';

try {

	if ( !srcFile )
		throw Error("Nothing to post-compile.");

	var contents = fs.readFileSync( srcFile ) + '';

	if ( !contents )
		throw Error("File empty or error reading " + JSON.stringify( srcFile ) );

	$I._offline_ = false;
	$I._root_ = new Constraint( fs.readFileSync( uiFile ) + '', false );

	try {

		$I._root_.compile();

	} catch (ERR) {
		throw Error( "Failed to compile css/constraint.ui file: " + ERR );
	}

	contents = $I._parse_( contents );

	if ( nostub ) {
		contents = contents.split('var ____END_OF_STUB____ = undefined;')[1];
	}

	fs.writeFileSync( srcFile, contents );

	console.log( '* Postcompiled: ', srcFile );

} catch (Error) {

	console.log( "Error: " + Error + "\n" );
	process.exit( 1 );

}