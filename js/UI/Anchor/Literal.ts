class UI_Anchor_Literal {
	
	private _literal: IAnchor;

	constructor( anchorDef: IAnchor ) {
		this._literal = anchorDef;
	}

	public static create( def: IAnchor ): UI_Anchor_Literal {
		return new UI_Anchor_Literal( def );
	}

	get def(): IAnchor {
		return this._literal;
	}

	public toLiteral(): string {
		return 'UI_Anchor_Literal.create(' + JSON.stringify( this._literal ) + ')';
	}

	public toString(): string {
		return JSON.stringify( this._literal );
	}

}