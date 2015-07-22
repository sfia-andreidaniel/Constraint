class UI_MenuBar extends UI implements IFocusable {

	// IFocusable interface
	public    active: boolean; // the active is overrided by the MFocusable mixin
	public    wantTabs: boolean = false;
	public    tabIndex: number = 0;
	public    includeInFocus: boolean = false;

	constructor( owner: UI ) {
		super( owner, [ 'IFocusable' ], UI_Dom.create( 'div', 'ui UI_MenuBar' ) );
	}

	public insert( child: UI ): UI {

		var i: number,
		    len: number;

		if ( !child )
			throw Error( 'Cannot insert a NULL element.' );

		switch ( true ) {

			case child instanceof UI_MenuItem:

				super.insert( child );
				this._root.appendChild( (<UI_MenuItem>child).menuBarNode );
				return child;

				break;

			default:

				console.warn( 'UI_MenuBar supports only UI_MenuItem children!');

				return child;

				break;

		}
	}


}

Mixin.extend( 'UI_MenuBar', 'MFocusable' );