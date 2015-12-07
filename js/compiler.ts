/// <reference path="main.ts" />
/// <reference path="node.d.ts" />
/// <reference path="../vendor/salvage/js/build.ts" />


try {

	var fs = require('fs'),
		os = require('os'),
		srcFile = null,
		destDir = null,
		justForm = null,
		includePath = null,
		make = false,
		spawn = require('child_process').spawn,

		buffer,
		matches: string[] = [],
		events: any = {},
		i: number,
		len: number;

	// READ EVENTS FILES
	try {

		var files: string[] = fs.readdirSync('./js/compiler/stdevents');

		for (i = 0, len = files.length; i < len; i++ ) {
			if ( /.json$/i.test( files[i] ) ) {
				Constraint.registerClassEvents(files[i].replace(/\.json$/gi, ''), JSON.parse(
					fs.readFileSync('./js/compiler/stdevents/' + files[i])
				));
			}
		}

	} catch(e) {
		console.log('Failed to read compiler events from disk. Compilation aborted!');
		throw e;
	}

	for (var i = 2, len = process.argv.length; i < len; i++) {
		switch (true) {
			case !!(matches = /^\-\-src\:(.*)$/.exec(process.argv[i])):
				srcFile = matches[1];
				break;
			case !!(matches = /^\-\-project\-dir\:(.*)$/.exec(process.argv[i])):
				destDir = matches[1];
				break;
			case !!(matches = /^\-\-form\:(.*)$/.exec(process.argv[i])):
				justForm = matches[1];
				break;
			case !!(matches = /^\-\-http-include-path\:(.*)$/.exec(process.argv[i])):
				includePath = matches[1];
				break;
			case process.argv[i] == '--make':
				make = true;
				break;
			default:
				throw new Error('Invalid argument: ' + JSON.stringify(process.argv[i]));
		}
	}

	if (!srcFile) {
		throw Error('Usage: \nconstraint --src:source_file\n\t[--project-dir:project_dir]\n\t[--form:form_name]\n\t[--http-include-path:path]');
	}

	buffer = fs.readFileSync(srcFile);

	if (!buffer) {
		throw Error("File empty, non-existent or non-readable: " + srcFile);
	}

	var constraint = new Constraint(buffer + '', true);

	constraint.compile();

	// Fetch all the Forms from the compiled file, and dump them.
	var scopes = constraint.$scopes,
		forms = [],
		resources = [];

	for (var i = 0, len = scopes.length; i < len; i++) {
		if (constraint.$scope(scopes[i]).$type == 'UI_Form') {
			console.log('* Found form: ' + JSON.stringify(constraint.$scope(scopes[i]).name));
			forms.push(constraint.$scope(scopes[i]));
		} else
			if (constraint.$scope(scopes[i]).$type == 'UI_Resource') {
				console.log('* Found resource: ' + JSON.stringify(constraint.$scope(scopes[i]).name));
				resources.push(constraint.$scope(scopes[i]));
			}
	}

	console.log('* Found ', forms.length, ' forms in "' + srcFile + '"');

	if (forms.length == 0 && resources.length == 0) {
		console.log('* Nothing to build. Exiting now.');
		process.exit();
	}

	if (destDir === null) {
		destDir = srcFile.replace(/\.[^\.]+$/g, '');
		if (destDir == srcFile) {
			destDir = srcFile + "_app";
		}
	}

	if (!fs.existsSync(destDir)) {
		try {
			fs.mkdirSync(destDir);
			console.log('* Directory "' + destDir + '" successfully created');
		} catch (err) {
			throw Error('Failed to create directory: ' + destDir);
		}
	}

	if (!includePath) {
		includePath = srcFile.replace(/\.[^\.]+/g, '');
	}

	console.log('* Include path : ' + JSON.stringify(includePath));
	console.log('* Project dir  : ' + JSON.stringify(destDir));

	var app = {
		"forms": [],
		"resources": []
	};

	var constraintLibPath = JSON.stringify(fs.realpathSync('./js/main.ts')),
		writeFiles = [];

	for (var i = 0, len = resources.length; i < len; i++) {
		(function(resource) {

			var res = {
				"name": resource.$name,
				"files": "",
				"props": resource.$properties
			},
				ext: string[];

			for (var k = 0, n = res.props.length; k < n; k++) {
				res.props[k].file = destDir + '/' + res.props[k].value.file;

				res.props[k].exists = fs.existsSync(res.props[k].file);

				if (!res.props[k].exists) {
					throw new Error('Failed to build resource "' + res.name + '.res" : file ' + res.props[k].file + ' was not found');
				}

				//ext = /\.(png|svg)$/.exec( res.props[k].file );
				ext = /\.(png)$/.exec(res.props[k].file);
				if (!ext) {
					throw new Error('Files from resources can have only ".png" extension!')
				}

				console.log('adding file: ', res.props[k].file)

				res.props[k].data = fs.readFileSync(res.props[k].file).toString('base64');
				res.props[k].data = res.props[k].name + ' '
					+ JSON.stringify(res.props[k].value.versions)
					+ (res.props[k].value.disabled ? ' disabled' : '')
					+ ' ' + 'data:' + (ext[1] == 'png' ? 'image/png' : 'image/svg+xml') + ';base64,' + res.props[k].data;

				res.files += (res.props[k].data + "\n\n");

			}

			res.props = null;

			app.resources.push(res);

		})(resources[i]);
	}

	for (var i = 0, len = forms.length; i < len; i++) {

		(function(form) {

			var frm = {
				"name": form.$name,
				"properties": [],
				"compileDate": (new Date()).toString(),
				"userName": os.hostname(),
				"version": process.version,
				"constraintLibPath": constraintLibPath,
				"fileName": form.$name + '.ts',
				"childProperties": form.$properties,
				"anonymousCode": [],
				"awaits": form.$awaits ? JSON.stringify(form.$awaits) : null,
				"methods": form.$methods,
				"localMethods": form.methods
			};

			if (justForm && form._name != justForm) {

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

			for (var i = 0, len = scopes.length; i < len; i++) {
				frm.properties.push({
					"name": scopes[i].$name,
					"type": scopes[i].$type,
					"in": scopes[i].parent == form ? null : scopes[i].$parentName,
					"properties": scopes[i].$properties,
					"anonymous": scopes[i].$anonymous,
					"methods": scopes[i].methods || []
				});

			}

			/* BUILD ANONYMOUS CODE */

			for (var i = 0, len = scopes.length; i < len; i++) {
				if (scopes[i].$anonymous && scopes[i].parentOwnName) {
					frm.anonymousCode.push(scopes[i].$anonymousStub(scopes[i].parent === form ? 'form' : 'form.' + scopes[i].parentOwnName, 12));
				}
			}

			app.forms.push(frm);

		})(forms[i]);

	}

	var salvage = new Salvage(fs.readFileSync('js/compiler/form.salvage') + '');

	function patchFile(destinationFile, withBuffer, fileName, ensureMethods: string[]) {

		ensureMethods = ensureMethods || [];

		var contents = fs.readFileSync(destinationFile) + '',
			matchesSrc: string[] = [],
			matchesDest: string[] = [],
			regexpDest: RegExp,
			methodName: string; // convert to string.
	

		contents = contents.replace(/\}([\s]+)?$/, '');

		while (matchesSrc = /\/\* \$hint\: ([a-z\d\-\$A-Z_]+) \*\/([\s\S]+?)\/\* \$hint\: end \*\//.exec(withBuffer)) {

			if (!/^method\-[a-zA-Z\d\_\$]+/.test(matchesSrc[1])) {

				//console.log( 'do hint: ', matchesSrc[1] );

				regexpDest = new RegExp('\\/\\* \\$hint\\: ' + matchesSrc[1].replace(/\-/g, '\\-') + ' \\*\\/([\\s\\S]+?)\\/\\* \\$hint\\: end \\*\\/');

				if (!(matchesDest = regexpDest.exec(contents))) {
					throw Error('Failed to find hint ' + JSON.stringify(matchesSrc[1]) + ' in target file: ' + JSON.stringify(destinationFile));
				} else {
					contents = contents.replace(matchesDest[0], matchesSrc[0]);
					withBuffer = withBuffer.replace(matchesSrc[0], '');
				}

			} else {

				methodName = matchesSrc[1].substr(7); // 'method-abas' -> 'abas'

				if (ensureMethods.indexOf(methodName) > -1) {

					regexpDest = new RegExp('\\/\\* \\$hint\\: ' + matchesSrc[1].replace(/\-/g, '\\-') + ' \\*\\/([\\s\\S]+?)\\/\\* \\$hint\\: end \\*\\/');

					if (!(matchesDest = regexpDest.exec(contents))) {
						contents = contents + '\n    ' + matchesSrc[0] + '\n\n';
					}

				} else {
					// append a new method called "methodName" in the destination form
				
					//console.log( 'patch add: ', methodName );
				}

				withBuffer = withBuffer.replace(matchesSrc[0], '');

			}

		}

		contents = contents.replace(/[\s]+$/g, '');

		contents = contents + '\n}';

		//console.log( contents );
		writeFiles.push({
			"path": destinationFile,
			"data": contents,
			"method": "patch",
			"fileName": fileName
		});

	}

	function writeFile(destinationFile, withBuffer, fileName) {

		writeFiles.push({
			"path": destinationFile,
			"data": withBuffer,
			"method": "create",
			"fileName": fileName
		});

	}

	var destFile: string = '';

	for (var i = 0, len = app.forms.length; i < len; i++) {
		// console.log( salvage.parse( app.forms[i] ) );
		// console.log( JSON.stringify( app.forms[i], undefined, 4 ) );

		if (fs.existsSync(destFile = (destDir + '/' + app.forms[i].fileName))) {
			patchFile(destFile, salvage.parse(app.forms[i]), app.forms[i].fileName, app.forms[i].methods);
		} else {
			writeFile(destFile, salvage.parse(app.forms[i]), app.forms[i].fileName);
		}

	}

	for (var i = 0, len = app.resources.length; i < len; i++) {
		writeFile(destDir + '/' + app.resources[i].name + '.res', app.resources[i].files, app.resources[i].name + '.res');
	}

	// Generate a main.ts file.

	var mainTs = {
		"constraintLibPath": constraintLibPath,
		"files": [],
		"resources": []
	};

	for (var i = 0, len = writeFiles.length; i < len; i++) {

		if (/\.ts$/.test(writeFiles[i].fileName)) {

			mainTs.files.push({
				"name": JSON.stringify(writeFiles[i].fileName)
			});

		}

		if (/\.res$/.test(writeFiles[i].fileName)) {

			mainTs.resources.push({
				"url": JSON.stringify(includePath + '/' + writeFiles[i].fileName),
				"name": JSON.stringify(writeFiles[i].fileName.replace(/\.res$/, ''))
			});

		}
	}

	salvage = new Salvage(fs.readFileSync('js/compiler/main.salvage') + '');

	writeFiles.push({
		"path": destDir + '/main.ts',
		"data": salvage.parse(mainTs),
		"method": "create",
		"fileName": "main.ts"
	});

	salvage = new Salvage(fs.readFileSync('js/compiler/Makefile.salvage') + '');

	writeFiles.push({
		"path": destDir + '/Makefile',
		"data": salvage.parse({
			"postcompiler": '"' + fs.realpathSync('js/postcompiler.ts').replace(/(["\s'$`\\])/g, '\\$1') + '"',
			'uifile': '"' + fs.realpathSync('css/constraint.ui').replace(/(["\s'$`\\])/g, '\\$1') + '"'
		}),
		"method": "create",
		"fileName": "Makefile"
	});

	// BUILD RESOURCES.


	// FLUSH FILES.
	for (var i = 0, len = writeFiles.length; i < len; i++) {
		if (writeFiles[i].method != 'ignore') {
			console.log('* ', writeFiles[i].method, ' file: "' + writeFiles[i].path + '": ', fs.writeFileSync(writeFiles[i].path, writeFiles[i].data) || 'Ok');
		} else {
			console.log('* ', writeFiles[i].method, ' file: "' + writeFiles[i].path + '": Ok');
		}
	}

	if (!make) {

		console.log('OK. Type "make" inside the folder "' + destDir + '" to build the project.');
		process.exit(0);

	} else {

		process.stdout.write('* Running "make": ');

		// Make the project.
		var makeProcess = spawn('make', [], {
			"cwd": destDir
		});

		var stdout: string = '',
			stderr: string = '';

		makeProcess.stdout.on('data', function(data) {
			stdout += data;
		});

		makeProcess.stderr.on('data', function(data) {
			stderr += data;
			process.stderr.write(data);
		});

		makeProcess.on('close', function(code) {
			if (code) {
				process.stdout.write('FAILED\n\n' + stderr + '\n\n' + stdout + '\n\n');
			} else {
				process.stdout.write('SUCCESS\n');
			}
		})

	}

} catch (err) {

	console.log("\nERROR. " + err);

}

