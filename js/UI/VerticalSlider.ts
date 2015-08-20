class UI_VerticalSlider extends UI implements IControl, IFocusable {
	
	public    active: boolean; // the active is overrided by the MFocusable mixin
	public    wantTabs: boolean = false;
	public    tabIndex: number = 0;
	public    includeInFocus: boolean = true;

	protected orientation: EOrientation = EOrientation.VERTICAL;

	protected _dom = {
		
	};

	constructor( owner: UI ) {
	    super( owner, [ 'IControl', 'IFocusable' ], Utils.dom.create('div', 'ui UI_Slider') );
	}



}

Mixin.extend( 'UI_VerticalSlider', 'MFocusable' );

Constraint.registerClass( {
	"name": "UI_VerticalSlider",
	"extends": "UI",
	"properties": [
		{
			"name": "active",
			"type": "boolean"
		},
		{
			"name": "tabIndex",
			"type": "number"
		}
	]
} );