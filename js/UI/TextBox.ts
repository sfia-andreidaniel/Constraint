/**
 * The UI_TextBox is a single-line text control, that allows the user to input text.
 *
 * Sample UI_TextBox controls:
 *
 * Normal UI_TextBox, where user can write into:
 *
 * ![textbox](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_TextBox.png "UI_TextBox")
 *
 * Disabled UI_TextBox, where user cannot write:
 *
 * ![textbox1](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_TextBox-disabled.png "UI_TextBox disabled")
 *
 * A password UI_TextBox, where the user can input a password:
 *
 * ![textbox2](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_TextBox-password.png "UI_TextBox password")
 *
 */
class UI_TextBox extends UI implements IFocusable, IInput {

	public static _theme = {
		defaultWidth: $I.number('UI.UI_TextBox/defaultWidth'),
		defaultHeight: $I.number('UI.UI_TextBox/defaultHeight')
	};

	public active: boolean;
	public wantTabs: boolean = false;
	public tabIndex: number = 0;
	public includeInFocus: boolean = true;

	protected _dom = {
		input: Utils.dom.create('input')
	};

	protected _password: boolean = false;

	constructor( owner: UI ) {
		
		super( owner, [ 'IFocusable', 'IInput' ], Utils.dom.create('div', 'ui UI_TextBox') );

		this.__initDom__();

		this.width = UI_TextBox._theme.defaultWidth;
		this.height= UI_TextBox._theme.defaultHeight;

	}

	get placeholder(): string {
		return this._dom.input.placeholder;
	}

	set placeholder( placeholder: string ) {
		this._dom.input.placeholder = String( placeholder || '' );
	}

	get value(): string {
		return this._dom.input.value;
	}

	set value( v: string ) {
		this._dom.input.value = String( v || '' );
	}

	get readOnly(): boolean {
		return this._dom.input.readOnly;
	}

	set readOnly( on: boolean ) {
		this._dom.input.readOnly = !!on;
	}

	get password(): boolean {
		return this._password;
	}

	set password( on: boolean ) {
		on = !!on;
		if ( on != this._password ) {
			this._password = on;
			this._dom.input.setAttribute( 'type', on ? 'password' : 'text' );
		}
	}

	protected __initDom__() {
		
		this._dom.input.setAttribute('type', 'text');
		this._root.appendChild( this._dom.input );

		( function( me ) {

			me.on( 'focus', function() {
				if ( !me.disabled ) {
					setTimeout( function() {
						me._dom.input.focus();
					}, 1);
				}
			} );

			me.on( 'blur', function() {
				me._dom.input.blur();
			} );

			me.onDOMEvent( me._dom.input, EEventType.MOUSE_DOWN, function( ev: Utils_Event_Mouse ) {
				ev.stopPropagation();
			}, true );

			me.onDOMEvent( me._dom.input, EEventType.FOCUS, function( ev: Utils_Event_Generic ) {
				if ( me.form.activeElement != me ) {
					me.active = true;
				}
				Utils.dom.selectText( me._dom.input, 0 );
			}, true );

			me.onDOMEvent( me._dom.input, EEventType.BLUR, function( ev: Utils_Event_Generic ) {
				if ( me.form.activeElement == me ) {
					me.active = false;
				}
			}, true);

			me.onDOMEvent( me._dom.input, EEventType.INPUT, function( ev: Utils_Event_Generic ) {
				if ( !me.disabled && !me.readOnly ) {
					me.fire( 'change' );
				}
			}, true );

			me.on('disabled', function( on: boolean ) {
				me._dom.input.disabled = on;
			} );


		} )( this );
	}

}

Mixin.extend( 'UI_TextBox', 'MFocusable' );

Constraint.registerClass( {
	"name": "UI_TextBox",
	"extends": "UI",
	"properties": [
		{
			"name": "active",
			"type": "boolean"
		},
		{
			"name": "tabIndex",
			"type": "number"
		},
		{
			"name": "value",
			"type": "string"
		},
		{
			"name": "readOnly",
			"type": "boolean"
		}
	]
} );
