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

class $I {

	public static _root_: Constraint = null;

	public static _get_( path: string, defVal: string = 'null' ): any {
		/* The path is in format Scope/Scope/Scope/PropertyName */
		var match: string[] = /^(.*)\/([^\/])+$/.exec( path );
		if ( !match ) {
			throw Error( 'Bad $I (nclude) path ' + JSON.stringify( path ) + '!' );
		}
		var seg: string = match[1],
		    prop: string = match[2],
		    scope: Constraint_Scope = $I._root_.$scope(seg);

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

		return defVal;
	}

	public static number( path: string ): number {
		return <number>$I._get_( path, 'null' );
	}

	public static string( path: string ): string {
		return <string>$I._get_( path, 'null' );
	}

	public static color( path: string ): UI_Color {
		return <UI_Color>$I._get_( path, 'null' );
	}

	public static _parse_( str: string ) {

		return str['replace']( /\$I\.(number|string|color)\(\'([^\']+)\'\)/g, function( substr: string, ...matches: any[] ): string {
			switch ( matches[ 0 ] ) {
				case 'number':
					return $I.number( matches[1] ) + ' /* ' + matches[1] + ' */';
					break;
				case 'string':
					return $I.string( matches[1] ) + ' /* ' + matches[1] + ' */';
					break;
				case 'color':
					return $I.color( matches[1] ) + ' /* ' + matches[1] + ' */';
					break;
			}
		});

	}

}