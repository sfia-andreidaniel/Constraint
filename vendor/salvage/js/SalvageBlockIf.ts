class SalvageBlockIf extends SalvageBlock {
	
	private _condition: string[] = null;

	private _raw: string = '';
	private _else: boolean = false;

	protected ifchildren: SalvageBlock[] = [];
	protected elsechildren: SalvageBlock[] = [];

	constructor( condition: string[], contents: string ) {
		super( );

		this._condition = condition;

		var children: SalvageBlock[] = [];

		this._raw = Salvage.parseBlocks( contents, children, this );

		if ( children.indexOf( null ) == -1 ) {
			this.ifchildren = children;
		} else {
			this.ifchildren = children.slice( 0, children.indexOf( null ) );
			this.elsechildren= children.slice( children.indexOf( null ) + 1 );
		}
	}

	public onParseElse() {
		if ( this._else ) {
			throw "Multiple else clauses cannot be added inside of an 'if' clause!";
		}
		this._else = true;
	}

	get type(): string {
		return 'if';
	}

	get unconsumedRawText(): string {
		var result = this._raw; this._raw = '';
		return result;
	}

	public parse( context: SalvageContext ): string {

		var out = [],
		    data: any = context.get( this._condition ),
		    i: number =0,
		    len: number;

		if ( ( Salvage.isPrimitive( data ) && !!( data ) ) || ( Salvage.isComplex( data ) && !Salvage.isEMPTY( data ) ) ) {

			for ( i=0, len = this.ifchildren.length; i<len; i++ ) {
				out.push( this.ifchildren[i].parse( context ) );
			}

		} else {

			for ( i=0, len = this.elsechildren.length; i<len; i++ ) {
				out.push( this.elsechildren[i].parse( context ) );
			}

		}

		return out.join( '' );

	}

}