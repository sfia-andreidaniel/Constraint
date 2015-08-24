class UI_Icon extends UI {

	private _icon             = Utils.dom.create('div');
	private _resource: string = '';

	constructor( owner: UI ) {
		super( owner, null, Utils.dom.create('div', 'ui UI_Icon' ) );
		this._root.appendChild( this._icon );
	}

	get resource(): string {
		return this._resource;
	}

	set resource( uiResource: string ) {
		if ( uiResource != this._resource ) {
			this._resource = String( uiResource ) || null;
			this._icon.className = '';
			if ( this._resource ) {
				this._icon.className = UI_Resource.createSprite( uiResource ).cssClasses;
			}
		}
	}

}