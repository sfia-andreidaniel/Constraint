/**
 * Class that is used by the .ui files parser ( Constraint ) to handle the language syntax.
 */
class Constraint_Token {

	protected def: IToken = null;
	public    name: string = 'token';

	constructor( def: IToken, tokenName: string ) {
		this.def = def;
		this.name = tokenName;
	}

	public static create( tokenStr: string ): Constraint_Token {
		var parts: string[] = tokenStr.split( '|' ),
		    out: Constraint_Token[] = null,
		    tokName: string;
		
		if ( parts.length > 1 ) {
			out = [];
			for ( var i=0, len = parts.length; i<len; i++ ) {
				out.push( Constraint_Token.create( parts[i] ) )
			}
			return new Constraint_Token_Or( out );
		} else {
			
			tokName = parts[0];

			if ( typeof Constraint.tokens[ tokName ] == 'undefined' ) {
				console.warn( 'token: ' + tokName + ' doesn\'t exist!' );
				throw Error( 'Token "' + tokName + '" is not defined!' );
			}

			return new Constraint_Token( Constraint.tokens[ tokName ], tokName );

		}
	}

	// executes a token. if execution fails, returns null.
	// otherwise returns { "result": value, "length": number }
	public exec( s: string ): ITokenResult {
		
		var matches: string[] = this.def.regex.exec( s );
		
		if ( !matches ) {
		
			return null;
		
		} else {
		
			return {
				"result": matches[ this.def['return'] ],
				"length": matches[0].length,
				"type": this.name
			};
		
		}
	}

}