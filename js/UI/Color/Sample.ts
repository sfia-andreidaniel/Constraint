class UI_Color_Sample extends UI {
	
	private _dom = {
		inner: Utils.dom.create('div', 'inner')
	};

	private _color: UI_Color;

	constructor( owner: UI ) {
	    super( owner, null, Utils.dom.create( 'div', 'ui UI_Color_Sample' ) );
	    this._root.appendChild( this._dom.inner );
	    
	    this._color = UI_Color.create('black');
	    
	    this.updateColor();
	}

	get color(): string {
		return this._color.toString();
	}

	set color( color: string ) {
		
		color = String( color || '' ) || null;

		var o: UI_Color;

		if ( color ) {

			o = UI_Color.create( color );

			this._color.red   = o.red;
			this._color.green = o.green;
			this._color.blue  = o.blue;
			this._color.alpha = o.alpha;
		} else {
			this._color.red =
			this._color.green =
			this._color.blue = 
			this._color.alpha = 0;
		}

		this.updateColor();
	}

	protected updateColor() {
		this._dom.inner.style.backgroundColor = this._color.toString();
	}

}