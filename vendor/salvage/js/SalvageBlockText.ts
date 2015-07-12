class SalvageBlockText extends SalvageBlock {
	
	private _text: string = '';

	constructor( ) {
		super( );
	}

	public append( character: string ) {
		this._text = this._text + character;
	}

	get type(): string {
		return 'text';
	}

	public parse( ctx: SalvageContext ): string {
		return this._text;
	}


}