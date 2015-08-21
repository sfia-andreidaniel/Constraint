// Main library file.
class Constraint {

	public static tokens = {
		// matches: "$foo ", "fooApplication ", with no white spaces before
		"tok_identifier": {
			"regex": /^([a-z_\$]([a-z_\$\d]+)?)/i,
			"return": 1
		},
		// the same as tok_identifier, but matches an optional identifier
		"tok_optional_identifier": {
			"regex": /^([a-z_\$]([a-z_\$\d]+)?)?/i,
			"return": 1
		},
		// matches standard html colors by their name
		"type_color_named": {
			"regex": /^(aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen)/,
			"return": 1
		},
		// matches "#fff", "#fd235a", "#ff325352"
		"type_color_hex": {
			"regex": /^(\#([a-f\d]{8}|[a-f\d]{6}|[a-f\d]{3}))/,
			"return": 1
		},
		// matches "rgb(231,231, 13)"
		"type_color_rgb": {
			"regex": /^rgb\(([\s]+)?([\d]+)([\s]+)?\,([\s]+)?([\d]+)([\s]+)?\,([\s]+)?([\d]+)([\s]+)?\)/,
			"return": 0
		},
		// matches "rgba( 1, 213, 21, 13 )"
		"type_color_rgba": {
			"regex": /^rgba\(([\s]+)?([\d]+)([\s]+)?\,([\s]+)?([\d]+)([\s]+)?\,([\s]+)?([\d]+)([\s]+)?\,([\s]+)?([\d\.]+)([\s]+)?\)/,
			"return": 0
		},
		"type_anchor": {
			"regex": /^((([a-zA-Z_\$]([a-zA-Z_\$\d]+)?)([\s]+))?(center|middle)|((([a-zA-Z_\$]([a-zA-Z_\$\d]+)?)[\s]+)?(top|left|right|bottom)[\s]+((\-)?[\d]+)))/,
			"return": 0
		},
		// matches yes, no, true, false
		"type_boolean": {
			"regex": /^(yes|no|true|false)/,
			"return": 0
		},
		"type_null": {
			"regex": /^null/i,
			"return": 0
		},
		// obvious, this matches a number
		"type_number": {
			"regex": /^(\-)?([\d]([\d]+)?(\.[\d]([\d]+))?|\.[\d]([\d]+)?)/,
			"return": 0
		},
		"type_subst": {
			"regex": /^\$([a-z\_\$]([a-z\_\$\d]+))/i,
			"return": 1
		},
		// this matches = string enclosed in simple "'" signs.
		"type_string": {
			"regex": /^('[^'\n\r]+')+/,
			"return": 0
		},
		// this matches an enum type. Enum types should be written in uppercase, and contain only uppercase letters
		// and eventually underscores.
		"type_enum": {
			"regex": /^[A-Z\_]+/,
			"return": 0
		},
		// date format is:
		// date( date_string [ ; date_format ] ), using [a-zA-Z0-9/\:-] in both date_string and both date_format
		"type_date": {
			"regex": /^date\((?:[ ]+)?([a-zA-Z\d\:\/\-\+ ]+?((?:[ ]+)?;(?:[ ]+)?(?:[a-zA-Z\d\:\-\/ ]+?))?)(?:[ ]+)?\)/,
			"return": 1
		},
		// matches any json structure
		"type_json": {
			"regex": /^<\!\[JSON\[([\s]+)?([\s\S\r\n]+?)([\s]+)?\]\]\>/,
			"return": 2
		},
		// matches: 
		"tok_resource": {
			"regex": /^(([a-zA-Z\$_]([a-zA-Z\d_\$]+)?)+)[\s]+from[\s]+'(([^']+|'')+)'([\s]+([\d]+(x[\d]+|\:(x|y))([\s]+)?)+)?(disabled)?([\s]+)?;/,
			"return": 0
		},
		// this matches a white space.
		"tok_white_space": {
			"regex": /^[\s]+/,
			"return": 0
		},
		// this matches an optional white space.
		"tok_white_space_opt": {
			"regex": /^([\s]+)?/,
			"return": 0
		},
		// this matches a comment
		"tok_comment": {
			"regex": /^(\/\/[^\n\r]+|\/\*[\s\S\r\n]+?\*\/)/,
			"return": 0
		},
		"tok_at": {
			"regex": /^@/,
			"return": 0
		},
		"tok_block_start": {
			"regex": /^\{/,
			"return": 0
		},
		"tok_block_end": {
			"regex": /^\}/,
			"return": 0
		},
		"tok_array_start": {
			"regex": /^\[/,
			"return": 0
		},
		"tok_array_end": {
			"regex": /^\]/,
			"return": 0
		},
		"tok_coma": {
			"regex": /^\,/,
			"return": 0
		},
		"tok_declare": {
			"regex": /^\$declare/,
			"return": 0
		},
		"tok_awaits": {
			"regex": /^\$awaits/,
			"return": 0
		},
		"tok_await_type": {
			"regex": /^(resource)/,
			"return": 1
		},
		"tok_attrib": {
			"regex": /^\:/,
			"return": 0
		},
		"tok_instruction_end": {
			"regex": /^\;/,
			"return": 0
		},
		"tok_eof": {
			"regex": /$/,
			"return": 0
		}
	};

	public static flows = {
		
		"end_of_file": {
			"flow": [
				"tok_eof"
			]
		},

		"white_space": {
			"flow": [
				"tok_white_space"
			]
		},
		
		"white_space_opt": {
			"flow": [
				"tok_white_space_opt"
			]
		},
		
		"comment": {
			"flow": [
				"tok_comment"
			]
		},

		"declaration": {
			"flow": [
				"tok_declare",
				"tok_white_space",
				"tok_identifier",
				"tok_white_space_opt",
				"tok_attrib",
				"tok_white_space_opt",
				"type_color_named|type_color_hex|type_color_rgba|type_color_rgb|type_string|type_number|type_boolean|type_anchor|type_null|type_enum|type_date|type_json",
				"tok_instruction_end"
			]
		},
		
		"assignment": {
			"flow": [
				"tok_identifier",
				"tok_white_space_opt",
				"tok_attrib",
				"tok_white_space_opt",
				"type_color_named|type_color_hex|type_color_rgba|type_color_rgb|type_string|type_number|type_boolean|type_anchor|type_subst|type_null|type_enum|type_date|type_json",
				"tok_white_space_opt",
				"tok_instruction_end"
			]
		},
		
		"object_assignment": {
			"flow": [
				"tok_identifier",
				"tok_white_space_opt",
				"tok_attrib",
				"tok_white_space_opt",
				"tok_block_start",
				"@children",
				"tok_block_end",
				"tok_instruction_end"
			],
			"children": [
				"white_space",
				"comment",
				"assignment",
				"object_assignment",
				"array_assignment"
			]
		},

		"type_anonymous_primitive": {
			"flow": [
				"type_color_named|type_color_hex|type_color_rgba|type_color_rgb|type_string|type_number|type_boolean|type_anchor|type_subst|type_null|type_enum|type_date|type_json"
			]
		},

		"type_anonymous_object_assignment": {
			"flow": [
				"tok_white_space_opt",
				"tok_identifier",
				"tok_white_space_opt",
				"tok_attrib",
				"tok_white_space_opt",
				"@children",
				"tok_white_space_opt",
				"tok_instruction_end"
			],
			"children": [
				"type_anonymous_primitive",
				"type_anonymous_object"
			],
			"childNum": 1
		},

		"type_anonymous_object": {
			"flow": [
				"tok_block_start",
				"tok_white_space_opt",
				"@children",
				"tok_white_space_opt",
				"tok_block_end",
				"tok_white_space_opt"
			],
			"children": [
				"type_anonymous_object_assignment"
			]
		},

		"array_literal": {
			"flow": [
				"type_color_named|type_color_hex|type_color_rgba|type_color_rgb|type_string|type_number|type_boolean|type_anchor|type_null|type_enum|type_date|type_json"
			]
		},

		"array_separator": {
			"flow": [
				"tok_white_space|tok_coma"
			]
		},

		"array_assignment": {
			"flow": [
				"tok_identifier",
				"tok_white_space_opt",
				"tok_attrib",
				"tok_white_space_opt",
				"tok_array_start",
				"@children",
				"tok_array_end",
				"tok_instruction_end"
			],
			"children": [
				"array_separator",
				"array_literal",
				"type_anonymous_object"
			]
		},

		"resource_file": {
			"flow": [
				"tok_resource"
			]
		},

		"awaits": {
			"flow": [
				"tok_white_space_opt",
				"tok_awaits",
				"tok_white_space",
				"tok_await_type",
				"tok_white_space",
				"tok_identifier",
				"tok_white_space_opt",
				"tok_instruction_end"
			]
		},

		"scope": {
			"flow": [
				"tok_white_space_opt",
				"tok_at",
				"tok_identifier",
				"tok_white_space",
				"tok_optional_identifier",
				"tok_white_space_opt",
				"tok_block_start",
				"@children",
				"tok_white_space_opt",
				"tok_block_end",
				"tok_instruction_end"
			],
			"children": [
				"comment",
				"declaration",
				"assignment",
				"object_assignment",
				"array_assignment",
				"scope",
				"white_space",
				"resource_file",
				"awaits"
			]
		},

		"document": {
			"flow": [
				"tok_white_space_opt",
				"@children",
				"tok_eof"
			],
			"children": [
				"scope",
				"white_space",
				"comment"
			]
		}
	}

	public static defs: IClass[] = [];

	public static classRegistered( className: string ): boolean {
		for ( var i=0, len = Constraint.defs.length; i<len; i++ ) {
			if ( Constraint.defs[i].name == className ) {
				return true;
			}
		}

		return false;
	}

	public static registerClass( def: IClass ) {
		if ( Constraint.classRegistered( def.name ) ) {
			throw Error( 'Class "' + def.name + '" is allready registered!' );
		}
		if ( def.extends ) {
			if ( !Constraint.classRegistered( def.extends ) ) {
				throw Error( 'Class "' + def.name + '" extends class "' + def.extends + '", but such class was not registered!' );
			}
		}
		Constraint.defs.push( def );
	}

	public static getClassByName( className: string ): IClass {
		for ( var i=0, len = Constraint.defs.length; i<len; i++ ) {
			if ( Constraint.defs[i].name == className ) {
				return Constraint.defs[i];
			}
		}
		return null;
	}

	public static getClassPropertyType( className: string, propertyName: string ): string {
		var def: IClass = Constraint.getClassByName( className );

		if ( !def ) {
			return null;
		}

		for ( var i=0, len = def.properties.length; i<len; i++ ) {
			if ( def.properties[i].name == propertyName ) {
				return def.properties[i].type;
			}
		}

		if ( def.extends ) {
			return Constraint.getClassPropertyType( def.extends, propertyName );
		} else {
			return null;
		}
	}

	public static classAcceptsChild( className: string, childType: string ) {
		var def: IClass = Constraint.getClassByName( className );

		if ( !def ) {
			return true;
		}

		if ( typeof def.acceptsOnly != 'undefined' ) {
			return def.acceptsOnly && def.acceptsOnly.indexOf( childType ) > -1;
		} else {
			return true;
		}
	}

	// should be null after parse.
	// if non null, returns the line on which compiler encountered error.
	public line: number = null;
	public buffer: string = '';
	public scope: Constraint_Scope = null;
	public error: string = '';
	public strict: boolean = false;

	constructor( buffer: string, strict: boolean = false ) {
		this.buffer = buffer;
		this.strict = strict;
	}

	public getBuffer( startingFrom: number = 0 ): string {
		return !startingFrom
			? this.buffer
			: this.buffer.substr( startingFrom );
	}

	public consume( amount: number ) {
		var sub = this.buffer.substr( 0, amount );
		this.buffer = this.buffer.substr( amount );
		for ( var i=0, len = sub.length; i<len; i++ ) {
			if ( sub[i] == '\n' ) {
				this.line++;
			}
		}
		return this.buffer;
	}

	// Makes the current UI_Dialog to await for a specific async event.
	public awaits( awaitType: string, awaitValue: string ) {
		this.scope.awaits( awaitType, awaitValue );
	}

	// creates a scope inside the current scope with the name "n", and type "t" and returns it.
	// the scope changes.
	public pushs( t: string, n: string ) {
		this.scope = this.scope.pushScope( t, n );
	}

	// pops one scope level up
	public pops() {
		this.scope = this.scope.popScope();
	}

	public pusho( k: string ) {
		this.scope.pushObjectKey( k );
	}

	public popo() {
		this.scope.popObjectKey();
	}

	// @alias of this.scope.assign( k, v )
	public asgn( k: string, v: ITokenResult ) {
		this.scope.assign( k, v );
	}

	public resource( v: ITokenResult ) {
		this.scope.addResource( v );
	}

	public decl( prop: string, val: ITokenResult ) {
		this.scope.declare( prop, val );
	}

	public arstart( arrayName: string ) {
		this.scope.arrayStart( arrayName );
	}

	public arpush( value: ITokenResult ) {
		this.scope.arrayPush( value );
	}

	public arpushliteral( value: any ) {
		this.scope.arrayPushLiteral( value );
	}

	public arend() {
		this.scope.arrayEnd();
	}

	public pushanon() {
		this.scope.pushAnonymousObject();
	}

	public popanon(): any {
		return this.scope.popAnonymousObject();
	}

	public pushanonprop( propName: string ) {
		this.scope.pushAnonymousProp( propName );
	}

	public pushanonprim( token: ITokenResult ) {
		this.scope.pushAnonymousPrimitive( token );
	}

	public compile(): Constraint_Scope {

		this.scope = new Constraint_Scope( null, '', 'document', this.strict );
		this.line = 1;
		this.error = null;
		
		var doc = Constraint_Flow.create( 'document' ),
		    masterScope: Constraint_Scope = this.scope;
		
		try {
			var len =  doc.compile( this );
			this.consume( len );
			
			if ( this.buffer )
				throw Error( 'Unexpected remaining buffer!' );

			return this.scope = masterScope;
		} catch ( err ) {
			this.error = '@line: ' + this.line + ': ' + err;
			throw SyntaxError( this.error );
		}

	}

	public $scope( scopeName: string ): Constraint_Scope {
		return typeof this.scope.global[ scopeName ] == 'undefined'
			? null
			: this.scope.global[ scopeName ];
	}

	// Returns the list of all the scopes.
	get $scopes(): string[] {
		var out = [];
		for ( var k in this.scope.global ) {
			if ( this.scope.global.hasOwnProperty(k) ) {
				out.push( k );
			}
		}
		return out;
	}

}