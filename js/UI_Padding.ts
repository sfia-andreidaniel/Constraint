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

	get right(): number {
		return this._right;
	}

	get top(): number {
		return this._top;
	}

	get bottom(): number {
		return this._bottom;
	}
}