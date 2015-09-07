/**
 * The UI_ComboBox is a mutation input between a UI_TextBox, and a
 * UI_DropDown. The user can input some text in the textbox, and a
 * helper dropdown will be shown below the input, from where the user
 * can pick a value.
 *
 * Sample UI_ComboBoxes:
 *
 * ![combobox](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_ComboBox.png "UI_ComboBox")
 *
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
			height: $I.number('UI.UI_ComboBox/option.height')
		},
		font: {
			family: $I.string('UI.UI_ComboBox/font.family'),
			size: $I.number('UI.UI_ComboBox/font.size'),
			color: $I.string('UI.UI_ComboBox/font.color.normal'),
			selectedColor: $I.string('UI.UI_ComboBox/font.color.selected')
		},
		background: {
			selected: $I.string('UI.UI_ComboBox/background.selected')
		},
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
	 * whether the autocompleter is case sensitive or not. this property also affects the
	 * strict mode property.
	 */
	public caseSensitive: boolean = false;

	/**
	 * whether to fire the change event only if the value is
	 * included in the this.strings, or each time a user input is done.
	 */
	public strictMode: boolean = false;

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
	 * Sentinel, in order to not fire the change event twice
	 */
	protected _prevFiredValue: string = '';

	/**
	 * The this.value returned value.
	 */
	protected _prevFiredChangedValue: string = '';

	/**
	 * The substring which was inputed by the user when the suggestions were computed
	 */
	protected _autoSuggestionString: string = '';

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

	/**
	 * gets or sets the value of the control.
	 */
	get value(): string {
		return this._prevFiredChangedValue;
	}

	set value( newVal: string ) {
		newVal = String(newVal || '') || '';
		if ( newVal != this._prevFiredChangedValue ) {
			this._value = this._prevFiredChangedValue = this._prevFiredValue = newVal;
			this._dom.input.value = newVal;
		}
	}

	/**
	 * gets or sets the list of strings from which the control renders it's listbox
	 * options. if the control is expanded in the moment of the setter, the listbox
	 * values are automatically expanded. this is usefull for ajax-calls.
	 */
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

		this._strings.sort(function(a,b) {
			var al = a.toLowerCase(),
				bl = b.toLowerCase();

			return al == bl
				? 0
				: (al > bl ? 1 : -1);
		});

		this.filterFirst(this.expanded);
	}

	/**
	 * gets or sets the read-only state of the control.
	 */
	get readOnly(): boolean {
		return this._readOnly;
	}

	set readOnly( on: boolean ) {
		on = !!on;
		if ( on != this._readOnly ) {
			this._readOnly = on;
			this._dom.input.readOnly = on;
			if ( !on && this.expanded ) {
				this.expanded = false;
			}
		}
	}

	/**
	 * setups the list of suggestion strings that are rendered in the control
	 * dropdown.
	 */
	private filterFirst( autoExpand: boolean = true ): boolean {
		
		var value: string = this._dom.input.value,
			valueLength: number = value.length,
			i: number,
			len: number = this._strings.length,
			str: string;

		if ( !this.caseSensitive ) {
			value = value.toLowerCase();
		}

		this._suggestedStrings.splice(0, this._suggestedStrings.length);
		this._autoSuggestionString = value;

		for (i = 0; i < len; i++ ) {
			if ( !value ) {
				this._suggestedStrings.push(this._strings[i]);
			} else {
				
				str = !this.caseSensitive
					? this._strings[i].toLowerCase()
					: this._strings[i];

				if ( str.indexOf( value ) > -1 ) {
					this._suggestedStrings.push(this._strings[i]);
				}

			}
		}

		this._selectedIndex = -1;

		if (autoExpand) {
			this.expanded = this._suggestedStrings.length > 0;
		}

		return this._suggestedStrings.length > 0;

	}

	/**
	 * gets or sets the expanded state of the control. if the expanded state is set
	 * to TRUE, a listbox is rendered above or below the control, from which the user
	 * can choose values.
	 */
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
				if (this._suggestedStrings && this._suggestedStrings.length) {
					this._open();
				} else {
					return;
				}
			}

			this._dom.expander.className = 'expander ' + UI_ComboBox._theme.expander[ on ? 'expanded' : 'collapsed' ] + ( this.disabled ? ' disabled' : '' );

		} else {

			if ( on ) {

				this._open();

			}

		}
	}

	/**
	 * closes the overlay of the control if it's opened.
	 */
	protected _close() {

		if (this._overlay) {
			this._overlay.close();
			this._overlay = null;
		}

	}

	/**
	 * overlay rendering.
	 */
	protected _renderOverlay() {

		if (!this._overlay) {
			return;
		}

		var ctx: UI_Canvas_ContextMapper = this._overlay.ctx,
			optWidth: number,
			optStart: number,
			optLength: number,
			optEnd: number,
			yTop: number,
			i: number,
			scrollTop: number = ctx.scrollTop,
			logicalHeight: number = ctx.logicalHeight,
			length: number = this._suggestedStrings.length;

		ctx.beginPaint();

		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, ctx.width, ctx.height);

		// paint options.
		optWidth = ctx.clientWidth;

		optStart = ~~(scrollTop / UI_ComboBox._theme.option.height);
		optLength = ~~(ctx.height / UI_ComboBox._theme.option.height) + UI_ComboBox._theme.option.height * ~~!!(ctx.height % UI_ComboBox._theme.option.height);
		optEnd = optStart + optLength;
		optEnd = optEnd >= length ? length - 1 : optEnd;

		yTop = -(scrollTop % UI_ComboBox._theme.option.height);

		ctx.font = UI_ComboBox._theme.font.size + 'px ' + "'" + UI_ComboBox._theme.font.family + "'";
		ctx.textBaseline = "middle";

		for (i = optStart; i <= optEnd; i++) {

			if (i == this._selectedIndex) {
				ctx.fillStyle = UI_ComboBox._theme.background.selected;
				ctx.fillRect(0, yTop, optWidth, UI_DropDown._theme.option.height);
			}

			ctx.fillStyle = UI_ComboBox._theme.font[i == this._selectedIndex ? 'selectedColor' : 'color'];

			//ctx.fillText(ctx.dotDotDot(this._suggestedStrings[i], optWidth - 4), 2, yTop + ~~(UI_ComboBox._theme.option.height / 2));
			ctx.fillTextSearchBoldedStyle(this._suggestedStrings[i], this._autoSuggestionString, false, 2, yTop + ~~(UI_ComboBox._theme.option.height / 2));

			yTop += UI_ComboBox._theme.option.height;
		}

		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1;
		ctx.rect(0, 0, ctx.width, ctx.height - 1);
		ctx.stroke();

		ctx.endPaint();


	}

	/**
	 * if the control is in an expanded state, this function scrolls the selected option
	 * if needed in order to make it visible
	 */
	protected scrollIntoIndex( index: number ) {
		
		if (!this._overlay) {
			return;
		}

		if (index <= 0) {
			this._overlay.scrollTop = 0;
		} else {
			var optionLogicalY1 = (index) * UI_ComboBox._theme.option.height,
				optionLogicalY2 = (index + 1) * UI_ComboBox._theme.option.height;

			if (optionLogicalY1 < this._overlay.scrollTop) {
				this._overlay.scrollTop = optionLogicalY1;
			} else
				if (optionLogicalY2 > this._overlay.scrollTop + this._overlay.clientHeight) {
					this._overlay.scrollTop = optionLogicalY2 - this._overlay.clientHeight;
				}

		}

	}

	/**
	 * "opens" the control, making visible it's overlay listbox. if the control is allready
	 * expanded, a close / reopen is made.
	 */
	protected _open( updateJustOverlaySize: boolean = false ) {

		if ( this._overlay ) {
			this._close();
		}

		var numRows: number = this._suggestedStrings.length,
			overlayHeight: number = Math.min(10, numRows) * UI_ComboBox._theme.option.height + 2,
			logicalHeight: number = numRows * UI_ComboBox._theme.option.height + 2,
			
			rect: ClientRect = this._root.getBoundingClientRect(),
			placement: IWindow;

		placement = UI_Screen.get.getBestPlacementDropDownStyle({
			x: rect.left,
			y: rect.top,
			width: rect.width,
			height: rect.height
		}, {
			"width": this.clientRect.width,
			"height": overlayHeight
		}, 1);

		this._overlay = UI_Screen.get.createWindow(
			placement.x, placement.y,
			placement.width, placement.height,
			null,
			numRows * UI_ComboBox._theme.option.height
		);

		this._overlay.overflowY = EClientScrollbarOverflow.AUTO;

		(function(me: UI_ComboBox) {

			me._overlay.on( 'render', function() {
				me._renderOverlay();
			});


			me._overlay.ignoreKeyboardInput = true;

			me._overlay.on('mousemove', function(x: number, y: number) {

				var newSelectedIndex: number = ~~(y / UI_ComboBox._theme.option.height);

				if (newSelectedIndex >= numRows) {
					newSelectedIndex = numRows - 1;
				}

				if (newSelectedIndex != me._selectedIndex) {
					me._selectedIndex = newSelectedIndex;
					UI_Screen.get.render();
				}

			});

			me._overlay.on('click', function(x: number, y: number) {

				var newSelectedIndex: number = ~~(y / UI_ComboBox._theme.option.height);

				if (newSelectedIndex >= numRows) {
					return;
				}

				me._selectedIndex = newSelectedIndex;

				me._dom.input.value = me._value = me._suggestedStrings[me._selectedIndex];
				Utils.dom.selectText(me._dom.input, 0, me._dom.input.value.length);

				me.expanded = false;

				me.fireChangeIfNeeded();

			});

			me._overlay.on('scroll', function(wheelX, wheelY) {

				if (wheelY != 0) {
					me._overlay.scrollTop += wheelY;
					UI_Screen.get.render();
				}

			});

			var onScreenClick = function(evt: Utils_Event_Mouse) {
				if ([me._dom.input, me._root, me._dom.expander].indexOf(evt.target) > -1) {
					return;
				}

				UI_Screen.get.off('mousedown', onScreenClick);
				me.expanded = false;
			}

			UI_Screen.get.on('mousedown', onScreenClick);

		})(this);

		this.scrollIntoIndex(this._selectedIndex);

		UI_Screen.get.render();
	}

	/**
	 * handles a user keyboard event.
	 */
	protected handleKeyboardKey( ev: Utils_Event_Keyboard ) {

		var needPrevent: boolean = this.disabled || this.readOnly,
			needRender: boolean = false,
			needResync: boolean = false,
			needSelect: boolean = false,
			changed: boolean = false;

		if (!needPrevent) {

			switch (ev.code) {

				case Utils.keyboard.KB_ESC:

					if (this.expanded) {
						this.expanded = false;
						needPrevent = true;
					}

					break;

				case Utils.keyboard.KB_HOME:

					if ( !ev.shiftKey && !ev.altKey && !ev.ctrlKey && this.expanded && this._suggestedStrings && this._suggestedStrings.length ) {
						this._selectedIndex = 0;
						needResync = true;
						needSelect = true;
						needRender = true;;
						needPrevent = true;
						changed = true;
					}

					break;

				case Utils.keyboard.KB_END:

					if (!ev.shiftKey && !ev.altKey && !ev.ctrlKey && this.expanded && this._suggestedStrings && this._suggestedStrings.length) {
						this._selectedIndex = this._suggestedStrings.length - 1;
						needResync = true;
						needSelect = true;
						needRender = true;
						needPrevent = true;
						changed = true;
					}

					break;

				case Utils.keyboard.KB_UP:

					if (!ev.shiftKey && !ev.altKey && !ev.ctrlKey && this.expanded && this._suggestedStrings && this._suggestedStrings.length) {

						if ( this._selectedIndex == -1 ) {
							this._selectedIndex = this._suggestedStrings.length - 1;
						} else {
							this._selectedIndex--;
							if ( this._selectedIndex < 0 ) {
								this._selectedIndex = this._suggestedStrings.length - 1;
							}
						}

						needResync = true;
						needSelect = true;
						needRender = true;
						needPrevent = true;
						changed = true;
					}

					break;

				case Utils.keyboard.KB_DOWN:

					if (!ev.shiftKey && !ev.altKey && !ev.ctrlKey && this.expanded && this._suggestedStrings && this._suggestedStrings.length) {

						if ( this._selectedIndex == -1 ) {
							this._selectedIndex = 0;
						} else {
							this._selectedIndex++;
							if ( this._selectedIndex >= this._suggestedStrings.length ) {
								this._selectedIndex = 0;
							}
						}

						needResync = true;
						needSelect = true;
						needRender = true;
						needPrevent = true;
						changed = true;
					}

					break;

				case Utils.keyboard.KB_ENTER:

					if ( !ev.shiftKey && !ev.altKey && !ev.ctrlKey ) {
						
						if ( this.expanded && this._selectedIndex > -1 ) {
							this.expanded = false;
						}

						needPrevent = true;

						changed = true;
					}

					break;

				case Utils.keyboard.KB_F4:
					
					if ( !ev.shiftKey && !ev.altKey && !ev.ctrlKey ) {

						this.expanded = !this.expanded;
						needPrevent = true;

					}

			}

		}

		if ( needPrevent ) {
			ev.preventDefault();
			ev.stopPropagation();
			ev.handled = true;
		}

		if ( needSelect ) {
			this._dom.input.value = this._suggestedStrings[this._selectedIndex];
			Utils.dom.selectText(this._dom.input, 0, this._dom.input.value.length);
		}

		if ( needRender ) {
			
			if ( needResync ) {
				this.scrollIntoIndex(this._selectedIndex);
			}

			UI_Screen.get.render();
		}

		if ( changed ) {
			this._value = this._dom.input.value;
			this.fireChangeIfNeeded();
		}

	}

	/**
	 * fires a change event if needed.
	 */
	protected fireChangeIfNeeded() {
		if ( this._prevFiredValue == this._value || ( !this.caseSensitive && this._prevFiredValue.toLowerCase() == this._value.toLowerCase() )) {
			return;
		}
		
		this._prevFiredValue = this._value;

		var index: number,
			lcValue: string,
			len: number,
			i: number;

		if ( this.strictMode === false ) {
			this._prevFiredChangedValue = this._value;
			this.fire('change');
		} else {
			if ( this.caseSensitive ) {
				if ( this._strings.indexOf( this._value ) > -1 ) {
					this._prevFiredChangedValue = this._value;
					this.fire('change');
				}
			} else {

				lcValue = this._value.toLowerCase();

				for (i = 0, len = this._strings.length; i < len; i++ ) {
					if ( lcValue == this._strings[i].toLowerCase() ) {
						this._prevFiredChangedValue = this._value;
						this.fire('change');
						return;
					}
				}

			}
		}

	}

	/**
	 * setups various events on the control.
	 */
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

			me.onDOMEvent(me._dom.expander, EEventType.CLICK, function(ev: Utils_Event_Mouse) {

				if ( me.disabled || me.readOnly || me.expanded ) {
					return;
				}

				me.expanded = true;

			}, true);

			me.onDOMEvent(me._dom.input, EEventType.KEY_DOWN, function(ev: Utils_Event_Keyboard) {
				me.handleKeyboardKey(ev);
			}, true);

			me.onDOMEvent( me._dom.input, EEventType.INPUT, function( ev: Utils_Event_Generic ) {
				if ( !me.disabled && !me.readOnly ) {
					me._value = me._dom.input.value;
					me.fire( 'text-changed' );
				}
			}, true );

			me.on('disabled', function( on: boolean ) {
				me._dom.input.disabled = on;
			} );

			me.on('text-changed', function() {
				me.filterFirst();
				me._value = me._dom.input.value;
				me.fireChangeIfNeeded();
			});

			me.on('disabled', function(on: boolean) {
				if ( on && me.expanded ) {
					me.expanded = false;
				}

				if ( on ) {
					Utils.dom.addClass(me._dom.expander, 'disabled');
				} else {
					Utils.dom.removeClass(me._dom.expander, 'disabled');
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
		},
		{
			"name": "caseSensitive",
			"type": "boolean"
		},
		{
			"name": "strictMode",
			"type": "boolean"
		}
	]
} );