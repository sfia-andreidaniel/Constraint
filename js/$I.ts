/* The class $I is used to link the framework theme ui file inside the
   generated javascript code with typescript.

   A post-compile process is made inside the make file, which replaces all
   the INC.{type} with the values parsed from the file.

*/

/// <reference path="Constraint.ts" />
/// <reference path="Constraint_Token.ts" />
/// <reference path="Constraint_Token_Or.ts" />
/// <reference path="Constraint_Flow.ts" />
/// <reference path="Constraint_Scope.ts" />
/// <reference path="Constraint_Type.ts" />
/// <reference path="FS_File.ts" />

class $I {

	public static _root_: Constraint = null;
	public static _offline_: boolean = true;
	public static _namespace_: string = '';

	public static _get_( path: string ): any {

		if ( $I._offline_ ) {
			return null;
		}

		/* The path is in format Scope/Scope/Scope/PropertyName */
		var match: string[] = /^(.*)\/([^\/]+)$/.exec( path );
		if ( !match ) {
			throw Error( 'Bad $I (nclude) path ' + JSON.stringify( path ) + '!' );
		}
		var seg: string = match[1],
		    prop: string = match[2],
		    scopes: Constraint_Scope[] = $I._root_.scope.$scopes,
		    i: number = 0,
		    len: number = scopes.length,
		    scope: Constraint_Scope = null;

		for ( i=0; i<len; i++ ) {
			if ( scopes[i].name == seg ) {
				scope = scopes[i];
				break;
			}
		}

		if ( scope === null )
			throw Error( 'Scope ' + JSON.stringify( seg ) + ' was not found in "css/constraint.ui" file.' );

		// fetch through scope properties, and if any property name
		// matches the "prop" name, return it.
		// otherwise, return the defVal.

		var properties = scope.$properties;

		for ( var i=0, len = properties.length; i<len; i++ ) {
			if ( properties[i].name == prop ) {
				return properties[i]['literal']
					? properties[i].value
					: properties[i]['valueJSON'];
			}
		}

		throw Error('Symbol ' + JSON.stringify( path ) + ' not found!' );
	}

	public static number( path: string ): number {
		return <number>$I._get_( path );
	}

	public static string( path: string ): string {
		return <string>$I._get_( path );
	}

	public static color( path: string ): UI_Color {
		return <UI_Color>$I._get_( path );
	}

	public static _parse_( str: string ) {

		var resolved: any = {},
		    files: any = {};

		return str
			.replace( /\{\$R[\s]+([a-zA-Z\/\\\.\-_\$\s]+)([\s]+)?\}/g, function( substr: string, ...matches: any[] ): string {
				return files[ matches[0] ] || ( files[ matches[0] ] = FS_File.create( matches[0] ).open().contents );
			} )
			.replace( /\$I\.(number|string|color)\(\'([^\']+)\'\)/g, function( substr: string, ...matches: any[] ): string {
				
				var result: string,
				    subst: any;

				switch ( matches[ 0 ] ) {
					case 'number':
						result = ( subst = resolved[ matches[1] ] || ( resolved[ matches[1] ] = $I.number( matches[1] ) ) );
						break;
					case 'string':
						result = ( subst = resolved[ matches[1] ] || ( resolved[ matches[1] ] = $I.string( matches[1] ) ) );
						break;
					case 'color':
						result = ( subst = resolved[ matches[1] ] || ( resolved[ matches[1] ] = $I.color( matches[1] ) ) );
						break;
				}

				return result;
			})
			
			.replace( /((\$\{([a-zA-Z_\d\.]+)\})|(\{\$N ([a-zA-Z_\d\.]+)\}))/g, function( substr: string, ...matches: any[] ): string {

				if ( matches[4] ) {
					// namespace command
					$I._namespace_ = matches[4];
					return '/* Namespace: ' + matches[4] + '*/';
				} else {
					//console.log( matches );
					return $I._get_( $I._namespace_ + '/' + matches[2] );
				}

			});

	}

}