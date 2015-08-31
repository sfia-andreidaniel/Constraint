class UI_Button extends UI implements IFocusable {
	
	public static _theme = {
		"defaultWidth": $I.number('UI.UI_Button/width'),
		"defaultHeight": $I.number('UI.UI_Button/height')
	};

	protected _dom = {
		"caption" : Utils.dom.create( 'div', 'caption' ),
		"icon"    : Utils.dom.create( 'div', 'icon' )
	};

	protected _caption: string = 'Button';
	protected _icon: string = null;
	protected _textAlign: EAlignment = EAlignment.CENTER;

	public    active: boolean; // the active is overrided by the MFocusable mixin
	public    wantTabs: boolean = false;
	public    tabIndex: number = 0;
	public    includeInFocus: boolean = true;
	public    accelerators: string;

	constructor ( owner: UI ) {
		
		super( owner, [ 'IFocusable' ], Utils.dom.create( 'div', 'ui UI_Button ta-center' ) );

		this._root.appendChild( this._dom.caption );
		this._root.appendChild( Utils.dom.create( 'div', 'focus-ring' ) );
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
			
			me.onDOMEvent( me._root, EEventType.CLICK, function( ev: Utils_Event_Mouse ) {
				if ( !me.disabled ) {
					me.fire( 'click' );
				}
			}, false );

			me.on( 'keydown', function( ev: Utils_Event_Keyboard ) {

				var code = ev.code;

				if ( !me.disabled && ( code == Utils.keyboard.KB_SPACE || code == Utils.keyboard.KB_ENTER ) ) {
					me.fire( 'click' );
				}

			} );

			me.on( 'accelerators-changed', function() {

				if ( this._accelerators ) {

					for ( var i=0, len = this._accelerators.length; i<len; i++ ) {
						if ( ( this._accelerators[i].keyAsString == 'enter' || this._accelerators[i].keyAsNumber == 13 ) && this._accelerators[i].action == 'click' ) {
							Utils.dom.addClass( this._root, 'default-button' );
							return;
						}
					}

				}

				Utils.dom.removeClass( this._root, 'default-button' );

			} );

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
		}
	]
} );
