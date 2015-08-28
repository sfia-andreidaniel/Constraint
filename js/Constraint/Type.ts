/// <reference path="Enum.ts" />
/// <reference path="../UI/Anchor/Literal.ts" />
/// <reference path="../UI/Resource/Literal.ts" />
/// <reference path="../Utils/Date.ts" />
/// <reference path="../Utils/String.ts" />


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

			case 'type_date':

				matches = from.result.replace( /(([ ]+)?\;([ ]+)?)/g, ';' ).replace( /(^[ ]+|[ ]+$)/g, '' ).split( ';' );

				if ( !matches[1] ) {
					matches.length = 1;
				}

				return ( matches.length == 2 ? Utils_Date.create( matches[0], matches[1] ) : Utils_Date.create( matches[0] ) ).toTimestamp();

				break;

			case 'type_json':

				try {
					return JSON.parse( from.result );
				} catch ( error ) {
					throw new SyntaxError( 'Failed to parse JSON data: ' + error );
				}

				break;

			default:
				throw Error( 'Unknown type: ' + from.type + JSON.stringify( from ) );
				break;
		}
	}

	public static createResourceDef( from: IResourceDef ): UI_Resource_Literal {
		return UI_Resource_Literal.create( from );
	}

	public static createAnchorDef( from: ITokenResult, inContext: Constraint_Scope ): UI_Anchor_Literal {
		var str: string = from.result,
		    result: IAnchor = {
		    	"alignment": null,
		    	"target": null
		    },
		    matches: string[];

		if ( str == 'center' || str == 'half' ) {
			result.alignment = str == 'center' ? EAlignment.CENTER : EAlignment.HALF;
			return UI_Anchor_Literal.create( result );
		} else {

		    matches = Constraint.tokens.type_anchor.regex.exec( str );

		    switch ( true ) {
		    	case (matches[6] == 'center' || matches[6] == 'half') && ( !!matches[3] ):
		    	     result.alignment = matches[6] == 'center' ? EAlignment.CENTER : EAlignment.HALF;
		    	     result.target    = matches[3];

		    	     break;

		    	case ( !!matches[11] && [ 'left', 'right', 'top', 'bottom' ].indexOf( matches[11] ) >= 0 && !isNaN( parseInt(matches[12]) )):
		    		 result.distance = parseInt(matches[12]);
		    		 result.target = !!matches[9] ? matches[9] : null;
		    		 switch ( matches[11] ) {
		    		 	case 'left':
		    		 		result.alignment = EAlignment.LEFT;
		    		 		break;
		    		 	case 'right':
		    		 		result.alignment = EAlignment.RIGHT;
		    		 		break;
		    		 	case 'top':
		    		 		result.alignment = EAlignment.TOP;
		    		 		break;
		    		 	case 'bottom':
		    		 		result.alignment = EAlignment.BOTTOM;
		    		 		break;
		    		 	case 'half':
		    		 		result.alignment = EAlignment.HALF;
		    		 		break;
		    		 }

		    		 break;

		    	default:
		    		throw Error( JSON.stringify( matches, undefined, 4 ) );
		    		break;
		    }

		}

		if ( !inContext.UIElementExists( result.target ) ) {
			throw Error( "UI Element called " + JSON.stringify( result.target ) + " doesn't exist or is not accessible from this element!") ;
		}

		if ( !inContext.UINestingOk( result.target ) ) {
			throw Error( 'UI Element called ' + JSON.stringify( result.target ) + " is referencing an element outside it's UI scope!" );
		}

		return UI_Anchor_Literal.create( result );
	}
}