class SalvageBlockEach extends SalvageBlock {
	
	private _raw: string = '';
	private cd: string[] = [];
	private keyName: string = null;

	protected children: SalvageBlock[] = [];

	constructor( condition: string[], contents: string, keyName: string = null ) {
		super( );

		this.cd = condition;
		this.keyName = keyName;

		this._raw = Salvage.parseBlocks( contents, this.children, this );
	}

	get type(): string {
		return 'each';
	}

	get unconsumedRawText(): string {
		var out = this._raw;
		this._raw = ''; // free mem
		return out;
	}

	private makeKey( value: string ): any {
		var o = {};
		o[ this.keyName ] = value;
		return o;
	}

	public parse( context: SalvageContext ): string {

		var out: string[] = [],
		    ctx: SalvageContext = context.cd( this.cd ),
		    root: any = ctx.get(null),
		    i, j: number = 0,
		    len, n: number,
		    keys: string[] = [],
		    item: SalvageContext,
		    n = this.children.length;

		if ( !Salvage.isEMPTY( root ) ) {

			keys = Salvage.keys( root );
			len = keys.length;

			for ( i=0; i<len; i++ ) {

				item = this.keyName === null 
					? new SalvageContext( root[ keys[i] ], ctx.cd(['..']) )
					: new SalvageContext( root[ keys[i] ], ctx.cd(['..']), this.makeKey( keys[i] ) );

				for ( j=0; j<n; j++ ) {

					out.push( this.children[j].parse( item ) );
				}

			}

		}

		return out.join( '' );

	}


}