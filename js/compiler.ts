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

	var constraint = new Constraint( buffer + '', true );

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

	var constraintLibPath = JSON.stringify( fs.realpathSync( './js/main.ts' ) ),
	    writeFiles = [];

	for ( var i=0, len = forms.length; i<len; i++ ) {

		( function( form ) {

			var frm = {
				"name": form.$name,
				"properties": [],
				"compileDate": ( new Date() ).toString(),
				"userName": os.hostname(),
				"version": process.version,
				"constraintLibPath": constraintLibPath,
				"fileName": form.$name + '.ts',
				"childProperties": form.$properties
			};

			if ( justForm && form._name != justForm ) {
				
				writeFiles.push({
					"path": destDir + '/' + frm.fileName,
					"method": "ignore",
					"data": null,
					"fileName": frm.fileName
				});

				return;
			}

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

	function patchFile( destinationFile, withBuffer, fileName ) {
		var contents = fs.readFileSync( destinationFile ) + '',
		    matchesSrc: string[] = [],
		    matchesDest: string[] = [],
		    regexpDest: RegExp; // convert to string.
		
		while ( matchesSrc = /\/\* \$hint\: ([a-z\d\-]+) \*\/([\s\S]+?)\/\* \$hint\: end \*\//.exec( withBuffer ) ) {
			regexpDest = new RegExp('\\/\\* \\$hint\\: ' + matchesSrc[1].replace(/\-/g, '\\-' ) + ' \\*\\/([\\s\\S]+?)\\/\\* \\$hint\\: end \\*\\/' );

			if ( !( matchesDest = regexpDest.exec( contents ) ) ) {
				throw Error( 'Failed to find hint ' + JSON.stringify( matchesSrc[1] ) + ' in target file: ' + JSON.stringify( destinationFile ) );
			} else {
				contents = contents.replace( matchesDest[0], matchesSrc[0] );
				withBuffer = withBuffer.replace( matchesSrc[0], '' );
			}
		}

		//console.log( contents );
		writeFiles.push({
			"path": destinationFile,
			"data": contents,
			"method": "patch",
			"fileName": fileName
		});

	}

	function writeFile( destinationFile, withBuffer, fileName ) {
		
		writeFiles.push({
			"path": destinationFile,
			"data": withBuffer,
			"method": "create",
			"fileName": fileName
		});

	}

	var destFile: string = '';

	for ( var i=0, len = app.forms.length; i<len; i++ ) {
		// console.log( salvage.parse( app.forms[i] ) );
		// console.log( JSON.stringify( app.forms[i], undefined, 4 ) );

		if ( fs.existsSync( destFile = ( destDir + '/' + app.forms[i].fileName ) ) ) {
			patchFile( destFile, salvage.parse( app.forms[i] ), app.forms[i].fileName );
		} else {
			writeFile( destFile, salvage.parse( app.forms[i] ), app.forms[i].fileName );
		}

	}

	// Generate a main.ts file.

	var mainTs = {
			"constraintLibPath": constraintLibPath,
			"files": []
		};

	for ( var i=0, len = writeFiles.length; i < len; i++ ) {
		mainTs.files.push({
			"name": JSON.stringify( writeFiles[i].fileName )
		});
	}

	salvage = new Salvage( fs.readFileSync( 'js/compiler/main.salvage' ) + '' );

	writeFiles.push({
		"path": destDir + '/main.ts',
		"data": salvage.parse( mainTs ),
		"method": "create",
		"fileName": "main.ts"
	});

	salvage = new Salvage( fs.readFileSync( 'js/compiler/Makefile.salvage' ) + '' );

	writeFiles.push({
		"path": destDir + '/Makefile',
		"data": salvage.parse( {
			"postcompiler": '"' + fs.realpathSync( 'js/postcompiler.ts' ).replace(/(["\s'$`\\])/g,'\\$1')+'"',
			'uifile'      : '"' + fs.realpathSync( 'css/constraint.ui' ).replace(/(["\s'$`\\])/g,'\\$1')+'"'
		} ),
		"method": "create",
		"fileName": "Makefile"
	});

	console.log( "* Placing compiled files in folder '" + destDir + "'" );

	// FLUSH FILES.
	for ( var i=0, len = writeFiles.length; i<len; i++ ) {
		if ( writeFiles[i].method != 'ignore' ) {
			console.log( '* ', writeFiles[i].method, ' file: "' + writeFiles[i].path + '": ', fs.writeFileSync( writeFiles[i].path, writeFiles[i].data ) || 'Ok' );
		} else {
			console.log( '* ', writeFiles[i].method, ' file: "' + writeFiles[i].path + '": Ok' );
		}
	}

	console.log( 'Compilation completed. Type "make" inside the folder "' + destDir + '" to build the project.' );

} catch ( err ) {

	console.log( "\nERROR: " + err );

}