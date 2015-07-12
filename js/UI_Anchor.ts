class UI_Anchor {
	protected _target: UI = null;
	protected _owner: UI = null;

	protected _alignment: EAlignment = null;
	protected _distance: number;


	constructor( owner: UI ) {
		this._owner = owner;
	}
}