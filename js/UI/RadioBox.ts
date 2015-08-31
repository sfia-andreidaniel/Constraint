class UI_RadioBox extends UI implements IFocusable, IInput {
	
	public static _theme = {
		"defaultWidth": $I.number('UI.UI_RadioBox/width'),
		"defaultHeight": $I.number('UI.UI_RadioBox/height')
	};

	protected _dom = {
		"input"  : Utils.dom.create( 'div', 'input icon ui' ),
		"caption": Utils.dom.create( 'div', 'caption' )
	};

	public active: boolean;
	public wantTabs: boolean = false;
	public tabIndex: number = 0;
	public includeInFocus: boolean = true;

	protected _caption: string = 'RadioBox';
	protected _value: boolean = false;
	protected _group: string = null;

	constructor( owner: UI ) {
		super( owner, [ 'IFocusable', 'IInput' ], Utils.dom.create('div', 'ui UI_RadioBox v-false' ) );
		this._root.appendChild( this._dom.input );
		this._root.appendChild( this._dom.caption );
		this._dom.caption.appendChild( document.createTextNode( this._caption ) );

		this.width = UI_RadioBox._theme.defaultWidth;
		this.height= UI_RadioBox._theme.defaultHeight;

		this._initDom_();
	}

	get group(): string {
		return this._group;
	}

	set group( name: string ) {
		name = String( name || '' ) || null;
		if ( name !== this._group ) {
			this._group = name;
		}
	}

	get siblings(): UI_RadioBox[] {
		var result = [],
			focusable: UI[];

		if ( this.form ) {
			
			focusable = this.form.focusComponents;

			for ( var i=0, len = focusable.length; i<len; i++ ) {
				if ( focusable[i] instanceof UI_RadioBox ) {
					if ( ( <UI_RadioBox>focusable[i] ).group == this.group && focusable[i] != this ) {
						result.push( <UI_RadioBox>focusable[i] );
					}
				}
			}
		}
		return result;
	}

	get caption(): string {
		return this._caption;
	}

	set caption( newOne: string ) {
		newOne = String( newOne || '' );
		if ( newOne != this._caption ) {
			this._dom.caption.innerHTML = '';
			this._dom.caption.appendChild( document.createTextNode( this._caption = newOne ) );
		}
	}

	get value(): boolean {
		return this._value;
	}

	set value( newOne: boolean ) {
		newOne = !!newOne;

		if ( newOne !== this._value ) {
			switch ( newOne ) {
				case true:
					Utils.dom.removeClass( this._root, 'v-false' );
					Utils.dom.addClass( this._root, 'v-true' );
					this._value = true;
					break;
				case false:
					Utils.dom.removeClass( this._root, 'v-true' );
					Utils.dom.addClass( this._root, 'v-false' );
					this._value = false;
					break;
			}
		}
	}

	public click() {

		var siblings: UI_RadioBox[];

		if ( !this.disabled ) {

			siblings = this.siblings;

			for ( var i=0, len = siblings.length; i<len; i++ ) {
				if ( siblings[i].value == true ) {
					siblings[i].value = false;
				}
			}

			this.value = true;

			this.fire( 'change' );

		}

	}

	protected _initDom_() {
		( function( me ) {
			
			me.onDOMEvent( me._root, EEventType.CLICK, function( e: Utils_Event_Mouse ) {
				me.fire( 'click' );
			}, false );

			me.on( 'keydown', function( ev: Utils_Event_Keyboard ) {
				var code = ev.code;
				if ( code == Utils.keyboard.KB_SPACE || code == Utils.keyboard.KB_ENTER ) {
					me.fire( 'click' );
				}
			} );

			me.on( 'click', function() {
				me.click();
			} );

		} )( this );
	}


}

Mixin.extend( 'UI_RadioBox', 'MFocusable' );

Constraint.registerClass( {
	"name": "UI_RadioBox",
	"extends": "UI",
	"properties": [
		{
			"name": "group",
			"type": "string"
		},
		{
			"name": "value",
			"type": "boolean"
		},
		{
			"name": "caption",
			"type": "string"
		},
		{
			"name": "tabIndex",
			"type": "number"
		},
		{
			"name": "wantTabs",
			"type": "number"
		},
		{
			"name": "active",
			"type": "boolean"
		}
	]
});