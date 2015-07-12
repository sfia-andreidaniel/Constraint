class Constraint_Token_Or extends Constraint_Token {
	
	protected members: Constraint_Token[] = null;

	constructor( members: Constraint_Token[] ) {
		super( null, '' );

		this.members = members;

		this.name    = 'token_or(' + ( function() {

			var out: string[] = [];

			for ( var i=0, len = members.length; i<len; i++ ) {
				out.push( members[i].name );
			}

			return out.join(',') || 'null';

		} )() + ')';
	}

	public exec( s: string ): ITokenResult {
		var result: ITokenResult;

		for ( var i=0, len = this.members.length; i<len; i++ ) {
			if ( result = this.members[i].exec( s ) ) {
				return result;
			}
		}
		return null;
	}
}