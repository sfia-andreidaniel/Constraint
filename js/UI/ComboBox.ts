/**
 * The UI_ComboBox is a mutation input between a UI_TextBox, and a
 * UI_DropDown. The user can input some text in the textbox, and a
 * helper dropdown will be shown below the input, from where the user
 * can pick a value.
 */

class UI_ComboBox extends UI implements IFocusable, IInput {

	/**
	 * Input theme
	 */
	public static _theme = {
		defaults: {
			width: $I.number('UI.UI_ComboBox/defaults.width'),
			height: $I.number('UI.UI_ComboBox/defaults.height')
		},
		expander: {
			expanded: $I.string('UI.UI_ComboBox/expander.expanded'),
			collapsed: $I.string('UI.UI_ComboBox/expander.collapsed')
		},
		option: {
			height: $I.number('UI.UI_Combobox/option.height')
		}
	};

	/**
	 * DOM nodes of UI_ComboBox
	 */
	protected _dom: any = {
		input: Utils.dom.create('input'),
		expander: Utils.dom.create('div', 'expander ' + UI_ComboBox._theme.expander.collapsed )
	};

	/**
	 * @implemented by MFocusable
	 */
	public active: boolean; // the active is overrided by the MFocusable mixin

	/**
	 * @implemented by MFocusable
	 */
	public wantTabs: boolean = false;

	/**
	 * @implemented by MFocusable
	 */
	public tabIndex: number = 0;

	/**
	 * @implemented by MFocusable
	 */
	public includeInFocus: boolean = true;

	/**
	 * @implemented by MFocusable
	 */
	public accelerators: string;

	/**
	 * The list with possible values
	 */
	protected _strings: string[] = [];

	/**
	 * The strings that match the suggestions of the autocompleter.
	 */
	protected _suggestedStrings: string[] = [];

	/**
	 * The raw string value of the input
	 */
	protected _value: string = '';

	/**
	 * whether the autocompleter is case sensitive or not
	 */
	public caseSensitive: boolean = false;

	/**
	 * whether the user can write inside this input
	 */
	protected _readOnly: boolean = false;

	/**
	 * returns the selected index.
	 */
	protected _selectedIndex: number = -1;

	/** 
	 * A virtual window in the screen, where we paint the overlay of the dropdown with it's options 
	 */
	protected _overlay: UI_Screen_Window = null;

	/**
	 * Creates a new ComboBox
	 */
	constructor( owner: UI ) {
		
		super(owner, ['IFocusable'], Utils.dom.create( 'div', 'ui UI_ComboBox' ));
		
		this._setupEvents_();

		if ( this._width == 0 ) {
			this.width = UI_ComboBox._theme.defaults.width;
		}

		if ( this._height == 0 ) {
			this.height = UI_ComboBox._theme.defaults.height;
		}
	}

	get value(): string {
		return this._value;
	}

	set value( newVal: string ) {
		newVal = String(newVal || '') || '';
		if ( newVal != this._value ) {
			this._value = newVal;
			this._dom.value.textContent = newVal;
		}
	}

	get strings(): string[] {
		return this._strings;
	}

	set strings( vals: string[] ) {
		
		vals = vals || [];
		
		var i: number = 0,
			len: number = vals.length,
			value: string;

		this._strings.splice(0, this._strings.length);

		for (i = 0; i < len; i++ ) {
			value = String(vals[i]) || '';
			if ( value ) {
				this._strings.push(value);
			}
		}
	}

	get readOnly(): boolean {
		return this._readOnly;
	}

	set readOnly( on: boolean ) {
		on = !!on;
		if ( on != this._readOnly ) {
			this._readOnly = on;
			this._dom.input.readOnly = on;
		}
	}

	private filterFirst(): boolean {
		
		var value: string = this._dom.input.value,
			valueLength: number = value.length,
			i: number,
			len: number = this._strings.length,
			str: string;

		if ( !this.caseSensitive ) {
			value = value.toLowerCase();
		}

		this._suggestedStrings.splice(0, this._suggestedStrings.length);

		for (i = 0; i < len; i++ ) {
			if ( !value ) {
				this._suggestedStrings.push(this._strings[i]);
			} else {
				
				str = !this.caseSensitive
					? this._strings[i].toLowerCase()
					: this._strings[i];

				if ( str.indexOf( value ) > -1 ) {
					this._suggestedStrings.push(str);
				}

			}
		}

		this._selectedIndex = -1;

		this.expanded = this._suggestedStrings.length > 0;

		return this._suggestedStrings.length > 0;

	}

	get expanded(): boolean {
		return !!this._overlay;
	}

	set expanded(on: boolean) {
		
		on = !!on;
		
		if ( on != this.expanded ) {
			if ( !on ) {
				if ( this._overlay ) {
					this._close();
				}
			} else {
				this._open( true );
			}

			this._dom.expander.className = 'expander ' + UI_ComboBox._theme.expander[ on ? 'expanded' : 'collapsed' ] + ( this.disabled ? ' disabled' : '' );

		} else {

			if ( on ) {

				this._open(true);

			}

		}
	}

	protected _close() {

		this._overlay.close();
		this._overlay = null;

	}

	protected _open( updateJustOverlaySize: boolean = false ) {

	}

	protected _setupEvents_() {

		this._dom.input.setAttribute('type', 'text');
		this._root.appendChild(this._dom.input);

		this._root.appendChild(this._dom.expander);

		(function(me) {

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
					me.fire( 'text-changed' );
				}
			}, true );

			me.on('disabled', function( on: boolean ) {
				me._dom.input.disabled = on;
			} );

			me.on('text-changed', function() {
				if ( me.filterFirst() ) {
					me._value = me._dom.input.value;
				}
			});

		})(this);

	}

}

Mixin.extend('UI_ComboBox', 'MFocusable');

Constraint.registerClass( {
	"name": "UI_ComboBox",
	"extends": "UI",
	"properties": [
		{
			"name": "value",
			"type": "string"
		},
		{
			"name": "active",
			"type": "boolean"
		},
		{
			"name": "wantTabs",
			"type": "boolean"
		},
		{
			"name": "tabIndex",
			"type": "boolean"
		},
		{
			"name": "includeInFocus",
			"type": "boolean"
		},
		{
			"name": "accelerators",
			"type": "string"
		},
		{
			"name": "readOnly",
			"type": "boolean"
		},
		{
			"name": "strings",
			"type": "string[]"
		}
	]
} );