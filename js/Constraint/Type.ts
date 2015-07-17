/// <reference path="../node.d.ts" />
/// <reference path="Enum.ts" />
/// <reference path="../UI/Anchor/Literal.ts" />
class Constraint_Type {

	public static create( from: ITokenResult, inContext: Constraint_Scope, inPropertyType: string = null, strict: boolean = false ): any {
		var matches: string[];

		switch ( from.type ) {
			
			case 'type_number':
				return from.result.indexOf( '.' ) >= 0
					? parseFloat( from.result )
					: parseInt( from.result );
				break;
			
			case 'type_color_hex':
			case 'type_color_rgba':
			case 'type_color_rgb':
			case 'type_color_named':
				return UI_Color.create( from.result.replace( /[\s]+/g, '' ) );
				break;
			
			case 'type_string':
				return from.result.substr( 1, from.result.length - 2 )
					.replace( /\\n/g, '\n' )
					.replace( /\\r/g, '\r' )
					.replace( /\\t/g, '\t' )
					.replace( /''/g,  '\'' );
				break;

			case 'type_boolean':
				return ['yes', 'true'].indexOf( from.result.toLowerCase() ) >= 0
					? true
					: false;
				break;

			case 'type_subst':
				return inContext.getConstantValue( from.result );
				break;

			case 'type_anchor':
				return Constraint_Type.createAnchorDef( from, inContext );
				break;

			case 'type_null':
				return null;
				break;

			case 'type_enum':
				if ( inPropertyType == 'constant' ) {
					throw Error( 'You are not allowed to use the enum type on declarations' );
				} else {
					if ( matches = /^enum\:([a-zA-Z_\$]([a-zA-Z_\$\d]+)?)$/.exec( inPropertyType ) ) {
						
						var enumType: any = eval( matches[1] );

						if ( typeof enumType != 'undefined' && enumType ) {
							
							if ( typeof enumType[ from.result ] == 'undefined' ) {
								throw Error( 'Enum value "' + from.result + '" is not declared in enum type "' + matches[1] + '"' );
							} else {
								return Constraint_Enum.create( enumType[ from.result ], matches[1] + '.' + from.result );
							}

						} else {
							// enum type not found
							if ( !strict ) {
								console.warn( 'Enum type "' + matches[1] + '" is not declared! Returning NULL for value ' + from.result );
							} else {
								throw Error( 'STRICT MODE: Enum type "' + matches[1] + '" is not declared!' );
							}

						}

					} else {
						if ( !strict ) {
							console.warn('WARNING: Mapping enum value "' + from.result + '" to NULL!' );
							return null;
						} else {
							throw Error( 'STRICT MODE: You declared a property which points to an undefined enum type!' );
						}
					}
				}
				break;

			default:
				throw Error( 'Unknown type: ' + from.type );
				break;
		}
	}

	public static createAnchorDef( from: ITokenResult, inContext: Constraint_Scope ) {
		var parts = from.result.split( ' ' ),
		    result: IAnchor = {
		    	"target": parts[0],
		    	"alignment": ( function( str ) {
		    		switch ( str ) {
		    			case 'top':
		    				return EAlignment.TOP;
		    				break;
		    			case 'left':
		    				return EAlignment.LEFT;
		    				break;
		    			case 'right':
		    				return EAlignment.RIGHT;
		    				break;
		    			case 'bottom':
		    				return EAlignment.BOTTOM;
		    				break;
		    			case 'center':
		    			case 'middle':
		    				return EAlignment.CENTER;
		    				break;
		    			default:
		    				throw Error( 'Bad alignment: ' + str );
		    				break;
		    		}
		    	})( parts[1].toLowerCase() )
		    };

		if ( result.target == '$parent' ) {
			result.target = null;
		}

		if ( result.alignment != EAlignment.CENTER ) {
			result.distance = parseInt( parts[2] );
		}

		result['align'] = parts[1].toLowerCase();

		if ( !inContext.UIElementExists( result.target ) ) {
			throw Error( "UI Element called " + JSON.stringify( result.target ) + " doesn't exist or is not accessible from this element!") ;
		}

		if ( !inContext.UINestingOk( result.target ) ) {
			throw Error( 'UI Element called ' + JSON.stringify( result.target ) + " is referencing an element outside it's UI scope!" );
		}

		return UI_Anchor_Literal.create( result );
	}
}