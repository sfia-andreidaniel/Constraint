class UI_CheckBox extends UI implements IFocusable, IInput {
	
	public static _theme = {
		"defaultWidth": $I.number('UI.UI_CheckBox/width'),
		"defaultHeight": $I.number('UI.UI_CheckBox/height')
	};

	protected _dom = {
		"input"  : Utils.dom.create( 'div', 'input icon ui' ),
		"caption": Utils.dom.create( 'div', 'caption' )
	};

	public active: boolean;
	public wantTabs: boolean = false;
	public tabIndex: number = 0;
	public includeInFocus: boolean = true;

	protected _caption: string = 'CheckBox';
	protected _value: boolean = false;
	protected _triState: boolean = false;

	constructor( owner: UI ) {
		super( owner, [ 'IFocusable', 'IInput' ], Utils.dom.create('div', 'ui UI_CheckBox v-false' ) );
		this._root.appendChild( this._dom.input );
		this._root.appendChild( this._dom.caption );
		this._dom.caption.appendChild( document.createTextNode( this._caption ) );

		this.width = UI_CheckBox._theme.defaultWidth;
		this.height= UI_CheckBox._theme.defaultHeight;

		this._initDom_();
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
		if ( newOne !== null ) {
			newOne = !!newOne;
		}
		if ( newOne !== this._value ) {
			switch ( newOne ) {
				case null:
					Utils.dom.removeClasses( this._root, [ 'v-true', 'v-false' ] );
					Utils.dom.addClass( this._root, 'v-null' );
					this._value = null;
					break;
				case true:
					Utils.dom.removeClasses( this._root, [ 'v-null', 'v-false' ] );
					Utils.dom.addClass( this._root, 'v-true' );
					this._value = true;
					break;
				case false:
					Utils.dom.removeClasses( this._root, [ 'v-true', 'v-null' ] );
					Utils.dom.addClass( this._root, 'v-false' );
					this._value = false;
					break;
			}
		}
	}

	public click() {
		if ( !this.disabled ) {
			
			switch ( this.value ) {
				case null:
					this.value = true;
					break;
				case true:
					this.value = false;
					break;
				case false:
					this.value = this._triState ? null : true;
					break;
				
			}
			
			this.fire( 'click' );
			this.fire( 'change' );
		}

	}

	protected _initDom_() {
		( function( me ) {
			
			me._root.addEventListener( 'click', function( e ){
					me.click();
			}, false );

			me.on( 'keydown', function( ev ) {
				var code = ev.keyCode || ev.charCode;
				if ( code == 32 ) {
					me.click();
				}
			} );

		} )( this );
	}

	get triState(): boolean {
		return this._triState;
	}

	set triState( on: boolean ) {
		on = !!on;
		if ( on != this._triState ) {
			
			this._triState = on;

			if ( !on && this._value === null ) {
				this.value = false;
			}
		}
	}


}

Mixin.extend( 'UI_CheckBox', 'MFocusable' );

Constraint.registerClass( {
	"name": "UI_CheckBox",
	"extends": "UI",
	"properties": [
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
		},
		{
			"name": "triState",
			"type": "boolean"
		}
	]
});