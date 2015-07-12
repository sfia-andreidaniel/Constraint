class SalvageBlockVar extends SalvageBlock {
	
	protected varName: string = '';
	protected isEsc: boolean = false;
	protected decimals: number = null;
	protected helpers: string[] = null;

	constructor( varName: string, escaped: boolean = false, decimals: number = null, helpers: string[] = null ) {
		super( );
		this.varName = varName;
		this.isEsc = escaped;
		this.decimals = decimals;
		this.helpers = helpers;
	}

	public parse( context: SalvageContext ): string {
		var result: string = '',
		    i: number = 0,
		    len: number = 0;
		
		result = Salvage.toSTRING( context.getByPath( this.varName ), this.decimals );

		if ( this.helpers ) {
			for ( i=0, len = this.helpers.length; i<len; i++ ) {
				result = Salvage.callHelper( this.helpers[i], result );
			}
		}

		if ( this.isEsc ) {
			result = Salvage.toSTRINGSAFE( result );
		}

		return result;
	}

}