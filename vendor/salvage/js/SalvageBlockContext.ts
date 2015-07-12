class SalvageBlockContext extends SalvageBlock {
	
	private _raw: string = '';
	private cd: string[] = [];

	protected children: SalvageBlock[] = [];

	constructor( condition: string[], contents: string ) {
		super( );

		this.cd = condition;

		this._raw = Salvage.parseBlocks( contents, this.children, this );
	}

	get type(): string {
		return 'with';
	}

	get unconsumedRawText(): string {
		var out = this._raw;
		this._raw = ''; // free mem
		return out;
	}

	public parse( context: SalvageContext ): string {

		var out: string[] = [],
		    ctx: SalvageContext = context.cd( this.cd ),
		    i: number = 0,
		    len: number = this.children.length;

		for ( i=0; i<len; i++ ) {

			out.push( this.children[i].parse( ctx ) );
		
		}

		return out.join( '' );

	}


}