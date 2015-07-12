/// <reference path="main.ts" />
/// <reference path="node.d.ts" />
/// <reference path="../vendor/salvage/js/build.ts" />

try {

	var fs = require( 'fs' ),
		os = require('os'),
	    srcFile = process.argv[2],
	    destDir = process.argv[3] || null,
	    justForm= process.argv[4] || null,
	    buffer;

	if ( !srcFile ) {
		throw Error( 'Usage: constraint <constraint_src_file> <app_directory> [<form_name>]' );
	}

	buffer = fs.readFileSync( srcFile );

	if ( !buffer ) {
		throw Error( "File empty, non-existent or non-readable: " + srcFile );
	}

	var constraint = new Constraint( buffer + '' );

	constraint.compile();

	// Fetch all the Forms from the compiled file, and dump them.
	var scopes = constraint.$scopes,
	    forms = [];

	for ( var i=0, len = scopes.length; i<len; i++ ) {
		if ( constraint.$scope( scopes[i] ).$type == 'UI_Form' ) {
			forms.push( constraint.$scope( scopes[i] ) );
		}
	}

	console.log( '* Found ', forms.length, ' forms in "' + srcFile + '"' );

	if ( forms.length == 0 ) {
		process.exit();
	}

	if ( destDir === null ) {
		console.log( '* Second argument of the compiler not present. Auto-determining target dir.');
		destDir = srcFile.replace(/\.[^\.]+$/g, '' );
		if ( destDir == srcFile ) {
			destDir = srcFile + "_app";
		}
	}

	console.log( "* Placing compiled files in folder '" + destDir + "'" );

	if ( !fs.existsSync( destDir ) ) {
		try {
			fs.mkdirSync( destDir );
			console.log( '* Directory "' + destDir + '" successfully created' );
		} catch (err) {
			throw Error( 'Failed to create directory: ' + destDir );
		}
	}

	var app = {
		"forms": []
	};

	for ( var i=0, len = forms.length; i<len; i++ ) {

		( function( form ) {

			if ( justForm && form._name != justForm ) {
				console.log( '* Skipping ' + form._name + '...' );
				return;
			}

			var frm = {
				"name": form.$name,
				"properties": [],
				"compileDate": ( new Date() ).toString(),
				"userName": os.hostname(),
				"version": process.version
			};

			var scopes = form.$scopes,
			    data;

			for ( var i=0, len = scopes.length; i<len; i++ ) {
				frm.properties.push({
					"name": scopes[i].$name,
					"type": scopes[i].$type,
					"in":   scopes[i].$parentName == form.$name ? null : scopes[i].$parentName,
					"properties": scopes[i].$properties
				});
			}

			app.forms.push( frm );

		} )( forms[i] );

	}

	var salvage = new Salvage( fs.readFileSync( 'js/compiler/form.salvage' ) + '' );

	for ( var i=0, len = app.forms.length; i<len; i++ ) {
		console.log( salvage.parse( app.forms[i] ) );
		//console.log( JSON.stringify( app.forms[i], undefined, 4 ) );
	}

	//console.log( JSON.stringify( app, undefined, 4 ) );

	//fs.writeFileSync( 'test.js', 'var constraint = new Constraint(' + JSON.stringify( f + '' ) + '); var compiled; console.log( compiled = constraint.compile() );' );

} catch ( err ) {

	console.log( "\nERROR: " + err );

}