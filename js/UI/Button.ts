class UI_Button extends UI implements IFocusable {
	
	public static _theme = {
		"defaultWidth": $I.number('UI.UI_Button/width'),
		"defaultHeight": $I.number('UI.UI_Button/height')
	};

	protected _dom = {
		"caption" : UI_Dom.create( 'div', 'caption' ),
		"icon"    : UI_Dom.create( 'div', 'icon' )
	};

	protected _caption: string = 'Button';
	protected _icon: string = null;
	protected _textAlign: EAlignment = EAlignment.CENTER;

	public    active: boolean; // the active is overrided by the MFocusable mixin
	public    wantTabs: boolean = false;
	public    tabIndex: number = 0;

	constructor ( owner: UI ) {
		
		super( owner, [ 'IFocusable' ], UI_Dom.create( 'div', 'ui UI_Button ta-center' ) );

		this._root.appendChild( this._dom.caption );
		this._dom.caption.appendChild( document.createTextNode( this._caption ) );
		this._root.appendChild( this._dom.icon );

		this.width = UI_Button._theme.defaultWidth;
		this.height = UI_Button._theme.defaultHeight;

		this._initDom_();
	}

	get caption(): string {
		return this._caption;
	}

	set caption( cap: string ) {
		cap = String( cap || '' );
		if ( cap != this._caption ) {
			this._caption = cap;
			this._dom.caption.innerHTML = '';
			this._dom.caption.appendChild( document.createTextNode( cap ) );
		}
	}

	get icon(): string {
		return this._icon;
	}

	set icon( name: string ) {
		name = String( name || '' ) || null;
		if ( name != this._icon ) {
			this._icon = name;
		}
	}

	protected _initDom_() {
		( function( me ) {
			me._root.addEventListener( 'click', function( e ){
				if ( !me.disabled ) {
					me.fire( 'click' );
				}
			}, false );
		} )( this );
	}

}

Mixin.extend( 'UI_Button', 'MFocusable' );

Constraint.registerClass( {
	"name": "UI_Button",
	"extends": "UI",
	"properties": [
		{
			"name": "caption",
			"type": "string"
		},/* 
		{
			"name": "icon",
			"type": "string"
		}, */
		{
			"name": "active",
			"type": "boolean"
		},
		{
			"name": "tabIndex",
			"type": "number"
		},
		{
			"name": "active",
			"type": "boolean"
		}
	]
} );
