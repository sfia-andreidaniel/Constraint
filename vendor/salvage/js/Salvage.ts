class Salvage {

	protected children: SalvageBlock[] = [];
	private   exception: string = null;

	constructor( contents: string ) {
		// Parse all blocks.
		// For special blocks, instantiate special children

		try {
			Salvage.parseBlocks( contents, this.children );
		} catch ( error ) {
			this.exception = error + '';
		}

	}

	public parse( context: any ): string {

		if ( this.exception !== null ) {
			return Salvage.toSTRINGSAFE( this.exception );
		} else {

			var out: string[] = [],
			    i: number = 0,
			    len: number = this.children.length,
			    ctx = new SalvageContext( context );

			for ( i=0; i<len; i++ ) {
				out.push( this.children[i].parse( ctx ) );
			}

			return out.join( '' );

		}
	}

	public static HELPERS = [
		{
			"name": "upper",
			"func": function( s ): string {
				return String( s || '' ).toUpperCase();
			}
		},
		{
			"name": "lower",
			"func": function( s ): string {
				return String( s || '' ).toLowerCase();
			}
		}
	];

	public static callHelper( helperName: string, onValue: string ): string {
		for ( var i=0, len = Salvage.HELPERS.length; i<len; i++ ) {
			if ( Salvage.HELPERS[i].name == helperName ) {
				return Salvage.HELPERS[i].func( onValue );
			}
		}
		throw "Bad helper name: " + helperName;
	}

	public static ENTITIES = [
		{
			"type": "var",
			"expr": /^\{\{([\s]+)?([a-z\d\.\[\]\/_\$]+)([\s]+)?(\:([\s]+)?([\d]+)([\s]+)?)?((([\s]+)?\|([\s]+)?([a-z\d_\$]+))+)?([\s]+)?\}\}/i,
			"match": 2
		},
		{
			"type": "rawVar",
			"expr": /^\{\{\{([\s]+)?([a-z\d\.\[\]\/_\$]+)([\s]+)?(\:([\s]+)?([\d]+)([\s]+)?)?((([\s]+)?\|([\s]+)?([a-z\d_\$]+))+)?([\s]+)?\}\}\}/i,
			"match": 2
		},
		{
			"type": "if",
			"expr": /^\{\{([\s]+)?#if[\s]+([a-z\d\.\[\]\/_\$]+)([\s]+)?\}\}/i,
			"match": 2
		},
		{
			"type": "unless",
			"expr": /^\{\{([\s]+)?#unless[\s]+([a-z\d\.\[\]\/_\$]+)([\s]+)?\}\}/i,
			"match": 2
		},
		{
			"type": "else",
			"expr": /^\{\{([\s]+)?#else([\s]+)?\}\}/i,
			"match": 0
		},
		{
			"type": "end",
			"expr": /^\{\{([\s]+)?#end([\s]+)?\}\}/i,
			"match": 0
		},
		{
			"type": "each",
			"expr": /^\{\{([\s]+)?#each([\s]+)(([a-z\$\_]+([a-z\$\_\d]+)?)[\s]+in[\s]+)?([a-z\d\.\[\]\/_\$]+)([\s]+)?\}\}/i,
			"match": 6
		},
		{
			"type": "with",
			"expr": /^\{\{([\s]+)?#with[\s]+([a-z\d\.\[\]\/_\$]+)([\s]+)?\}\}/i,
			"match": 2
		},
		{
			"type": "comment",
			"expr": /^\{\{\!--[\s\S]+?--\}\}/i,
			"match": 0
		}
	];

	public static isPrimitive( value: any ): boolean {
		return Salvage.isNULL   ( value ) ||
		       Salvage.isSTRING ( value ) ||
		       Salvage.isBOOLEAN( value ) ||
		       Salvage.isNUMBER ( value );
	}

	public static isNULL( value: any ): boolean {
		return value === null || value == void 0;
	}

	public static isSTRING( value: any ): boolean {
		return typeof value == 'string';
	}

	public static isBOOLEAN( value: any ): boolean {
		return value === true || value === false;
	}

	public static isNUMBER( value ): boolean {
		return !isNaN( value ) && isFinite( value ) && ( value * 1 ) === value ? true : false;
	}

	public static isComplex( value: any ): boolean {
		return Salvage.isARRAY( value ) || Salvage.isOBJECT( value );
	}

	public static isARRAY( value: any ): boolean {
		return Salvage.isOBJECT( value ) && Salvage.isNUMBER( value.length ) ? true : false;
	}

	public static isOBJECT( value: any ): boolean {
		return typeof value == 'object' && value && typeof value.prototype == 'undefined' ? true : false;
	}

	public static keys( value: any ): string[] {

		var len: number,
			i: number,
			k: string,
		    result: string[] = null;

		if ( Salvage.isARRAY( value ) ) {
			result = [];
			for ( var i=0, len = ~~(value['length']); i<len; i++ ) {
				result.push( String(i) );
			}
		} else
		if ( Salvage.isOBJECT( value ) ) {
			result = [];
			for ( k in value ) {
				if ( value.hasOwnProperty( k ) && value.propertyIsEnumerable( k ) ) {
					result.push( k );
				}
			}
		}

		return result;
	}

	public static isEMPTY( value: any ): boolean {
		return Salvage.keys( value ).length == 0;
	}

	public static toSTRING( value: any, decimals: number = null, thousandSeparator = '', decimalSeparator = '.' ): string {

		var sub: string[],
		   keys: string[],
			  v: string,
		      i: number = 0,
		    len: number = 0,
		 result: string = '',
		isFloat: boolean = false,
   	   decParts: string,
   	    matches: string[];

		switch ( true ) {
			case Salvage.isNULL( value ):
				result = 'null';
				break;
			
			case Salvage.isSTRING( value ):
				result = String( value );
				break;

			case Salvage.isBOOLEAN( value ):
				result = !!(value) ? 'true' : 'false';
				break;
			
			case Salvage.isNUMBER( value ):
				
				result = ( isFloat = Math.round( value ) != value )
					? ( decimals === null ? String( value ) : ( decimals === 0 ? String( parseInt( value ) ) : value.toFixed(decimals) ) ) // is float
					: String(value);

				if ( isFloat && ( decimalSeparator != '.' || thousandSeparator != '' ) ) {

					keys = result.split( '.' );

					decParts = '';

					while ( matches = /([\d]{3}$)/.exec( keys[0] ) ) {
						decParts = keys[0].length > 3
							? thousandSeparator + matches[ 1 ] + decParts
							: matches[1] + decParts;
						keys[0] = keys[0].replace( /[\d]{3}$/, '' );
					}

					if ( keys[0].length )
						decParts = decParts.length ? keys[0] + decParts : keys[0];

					result = keys[1] ? decParts + decimalSeparator + keys[1] : decParts;

				}

				break;
			
			case Salvage.isARRAY( value ):

				if ( value.length ) {
					sub = [];
					for ( i=0, len = ~~value.length; i<len; i++ ) {
						v = Salvage.toSTRING( value[i], decimals, thousandSeparator, decimalSeparator );
						if ( v != '' ) {
							sub.push(v);
						}
					}
					result = sub.length ? '[ ' + sub.join( ', ' ) + ']' : '';
				} else {
					result = '';
				}

				break;

			case Salvage.isOBJECT( value ):
				keys = Salvage.keys( value );
				if ( keys.length ) {
					sub = [];
					for ( i=0, len = keys.length; i<len; i++ ) {
						v = Salvage.toSTRING( value[ keys[i] ], decimals, thousandSeparator, decimalSeparator  );
						if ( v != '' ) {
							sub.push( keys[i] + ': ' + v );
						}
					}
					result = sub.length ? '[ ' + sub.join( ', ' ) + ']' : '';
				} else {
					result = '';
				}

				break;

			default:
				result = '';
				break;
		}

		return result;

	}

	public static toSTRINGSAFE( value: any, decimals: number = null, thousandSeparator = '', decimalSeparator = '.' ): string {
		return Salvage.toSTRING( value, decimals, thousandSeparator, decimalSeparator ).replace(/"/, '&quot;' ).replace(/>/g, '&gt;' ).replace(/</g, '&lt;' );
	}

	public static getHELPERS( helpersList: string = null ) {
		
		helpersList = String( helpersList || '').replace( /(^[\s\|]+|[\s\|]+$)/g, '');

		if ( !helpersList.length ) {
			return null;
		}

		var out: string[] = helpersList.split(/[\s\|]+/),
		    i: number, j: number, len: number, n: number = Salvage.HELPERS.length,
		    good: boolean;

		if ( out.length ) {

			for ( i=0, len = out.length; i<len; i++ ) {

				good = false;

				for ( j=0; j<n; j++ ) {
					if ( Salvage.HELPERS[j].name == out[i] ) {
						good = true;
						break;
					}
				}

				if ( !good ) {
					throw "Invalid helper name: " + JSON.stringify( out[i] );
				}
			}
		}

		return out.length ? out : null;
	}

	public static parseBlocks( contents: string, destination: SalvageBlock[] = [], ownerBlock: SalvageBlock = null ): string {

		var lastBlock: SalvageBlock = null,
		    raw: string = contents || '',
		    i: number = 0,
		    entities: number = Salvage.ENTITIES.length,
		    isText: boolean = false,
		    entityType: string = '',
		    matches: string[] = [],
		    matchIndex: number = 0,
		    decimals: number,
		    helpers: string[] = null;

		while ( true ) {

			isText = true;
			entityType = '';
			matchIndex = 0;

			for ( i=0; i<entities; i++ ) {

				matches = Salvage.ENTITIES[i].expr.exec( raw );

				if ( matches ) {
					// good. we found an entity.

					entityType = Salvage.ENTITIES[i].type;
					matchIndex = Salvage.ENTITIES[i].match;
					isText = false;

					break;

				}

			}

			if ( !isText ) {

				switch ( entityType ) {

					case 'end':

						if ( !ownerBlock || [ 'if', 'each', 'with', 'unless' ].indexOf( ownerBlock.type ) == -1 ) {
							throw "An 'end' block can be placed only after an 'if', 'unless', 'each', or 'with' block!";
						}

						// flush end
						raw = raw.substr( matches[0].length );

						return raw;

						break;

					case 'var':
					case 'rawVar':

						decimals = ( matches[6] || '').length
							? ~~matches[6]
							: null;

						helpers = Salvage.getHELPERS( matches[8] );

						raw = raw.substr( matches[0].length );
						destination.push( lastBlock = new SalvageBlockVar( matches[ matchIndex ] /* varname */, entityType == 'var' /* escaped */, decimals, helpers ) );

						break;

					case 'if':

						raw = raw.substr( matches[0].length );
						destination.push( lastBlock = new SalvageBlockIf( SalvageContext.parsePATH( matches[ matchIndex ] ) /* condition */, raw ) );
						raw = lastBlock.unconsumedRawText;

						break;

					case 'unless':
						raw = raw.substr( matches[0].length );
						destination.push( lastBlock = new SalvageBlockIf( SalvageContext.parsePATH( matches[ matchIndex ] ) /* condition */, raw, true ) );
						raw = lastBlock.unconsumedRawText;

						break;

					case 'with':

						raw = raw.substr( matches[0].length );
						destination.push( lastBlock = new SalvageBlockContext( SalvageContext.parsePATH( matches[ matchIndex ] ) /* condition */, raw ) );
						raw = lastBlock.unconsumedRawText;

						break;

					case 'else':

						raw = raw.substr( matches[0].length );

						if ( !ownerBlock || ownerBlock.type != 'if' )
							throw "An 'else' block can be placed only inside of an 'if' block!";

						(<SalvageBlockIf>ownerBlock).onParseElse();

						// put a NULL block delimiter
						destination.push( null );
						lastBlock = null;

						break;

					case 'each':
						raw = raw.substr( matches[0].length );
						destination.push( lastBlock = new SalvageBlockEach(SalvageContext.parsePATH( matches[ matchIndex ] ) /* condition */, raw, matches[4] || null ) );
						raw = lastBlock.unconsumedRawText;

						break;

					case 'comment':

						// comments are ignored from the start in the loading mechanism.
						raw = raw.substr( matches[0].length );
						break;

					default:
						throw 'Bad entity type: ' + entityType;

				}

			} else {

				if ( raw.length ) {

					if ( lastBlock && lastBlock.type == 'text' ) {
						(<SalvageBlockText>lastBlock).append( raw[0] ); //good.
					} else {
						destination.push( lastBlock = new SalvageBlockText() );
						(<SalvageBlockText>lastBlock).append( raw[0] ); //good.
					}

					raw = raw.substr(1);

				} else {

					break; // break main loop

				}

			}


		}

		return raw;

	}

}