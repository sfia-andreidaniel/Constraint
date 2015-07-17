class UI_Padding {

	protected _left: number = 0;
	protected _right: number = 0;
	protected _bottom: number = 0;
	protected _top: number = 0;	

	protected _owner: UI = null;

	constructor( owner: UI ) {
		this._owner = owner;
	}

	get left(): number {
		return this._left;
	}

	set left( v: number ) {
		v = ~~v;
		if ( v < 0 )
			v = 0;
		if ( v != this._left ) {
			this._left = v;
			this.requestRepaint();
		}
	}

	get right(): number {
		return this._right;
	}

	set right( v: number ) {
		v = ~~v;
		if ( v < 0 )
			v = 0;
		if ( v != this._right ) {
			this._right = v;
			this.requestRepaint();
		}

	}

	get top(): number {
		return this._top;
	}

	set top( v: number ) {
		v = ~~v;
		if ( v < 0 )
			v = 0;
		if ( v != this._top ) {
			this._top = v;
			this.requestRepaint();
		}
	}

	get bottom(): number {
		return this._bottom;
	}

	set bottom( v: number ) {
		v = ~~v;
		if ( v < 0 )
			v = 0;
		if ( v != this._bottom ) {
			this._bottom = v;
			this.requestRepaint();
		}

	}

	protected requestRepaint() {
		if ( this._owner ) {
			this._owner.onRepaint();
		}
	}
}