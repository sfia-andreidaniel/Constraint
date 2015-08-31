class UI_Div extends UI implements IFocusable {
	
	public active: boolean; // the active is overrided by the MFocusable mixin
	public wantTabs: boolean = false;
	public tabIndex: number = 0;
	public includeInFocus: boolean = true;

	constructor( owner: UI ) {
		super( owner, null, Utils.dom.create('div', 'ui UI_Div' ) );
		this._setupEvents_();
	}

	protected _setupEvents_() {
		( function( me ){

			me.onDOMEvent( me._root, EEventType.CLICK, function( ev: Utils_Event_Mouse ) {
				if ( !me.disabled )
					me.fire( 'click' );
			} );

		} )( self );
	}
}

Mixin.extend( 'UI_Div', 'MFocusable' );

Constraint.registerClass({
	"name": "UI_Div",
	"extends": "UI",
	"properties": [
	]
});