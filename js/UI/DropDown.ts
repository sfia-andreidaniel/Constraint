/**
 * The UI_DropDown class is the standard <select> HTML 5 imput implementation. The difference between
 * the html5 <select> and the UI_DropDown input, is that the options of the UI_DropDown input stores
 * it's options in memory, without creating DOM nodes, allowing the user to manipulate a larger set
 * of options (100.000 ?).
 *
 * The expanded overlay of the UI_DropDown is rendered on the UI_Screen canvas, allowing everything
 * to work and move smooth.
 *
 * A standard UI_DropDown input:
 *
 * ![dropdown](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_DropDown.png "UI_DropDown")
 *
 * A disabled UI_DropDown input:
 *
 * ![dropdown-disabled](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_DropDown-disabled.png "UI_DropDown disabled")
 *
 * An expanded UI_DropDown input:
 *
 * ![dropdown-expanded](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_DropDown-expanded.png "UI_DropDown expanded")
 *
 */
class UI_DropDown extends UI implements IFocusable, IInput {

	/** 
	 * DropDown theme 
	 */
	public static _theme = {
		option: {
			height: $I.number('UI.UI_DropDown/option.height')
		},
		font: {
			family: $I.string('UI.UI_DropDown/font.family'),
			size:   $I.number('UI.UI_DropDown/font.size'),
			color:  $I.string('UI.UI_DropDown/font.color.normal'),
			selectedColor: $I.string('UI.UI_DropDown/font.color.selected')
		},
		background: {
			selected: $I.string('UI.UI_DropDown/background.selected')
		},
		defaults: {
			width: $I.number('UI.UI_DropDown/defaults.width'),
			height: $I.number('UI.UI_DropDown/defaults.height')
		},
		expander: [
			$I.string('UI.UI_DropDown/expander.collapsed'),
			$I.string('UI.UI_DropDown/expander.expanded')
		]
	};

	/** 
	 * The only 3 DOM nodes of the dropdown :)
	 */
	protected _dom = {
		view: Utils.dom.create('div', 'view'),
		expander: Utils.dom.create('div','ui expander'),
		icon: Utils.dom.create('div')
	};

	/** 
	 * Array with options of the dropdown. 
	 */
	protected _options: IOption[]    = [];

	/** 
	 * Total number of options of the dropdown 
	 */
	protected _length: number = 0;

	/** 
	 * The selected index 
	 */
	protected _selectedIndex: number = -1;

	/** 
	 * Whether the dropdown is expanded or not 
	 */
	protected _expanded: boolean = false;

	/** 
	 * A virtual window in the screen, where we paint the overlay of the dropdown with it's options 
	 */
	protected _overlay: UI_Screen_Window = null;

	/** 
	 * When the overlay of the select is opened, we don't change it's original
	 * selected index, but a copy of it.
	 */
	private   _overlaySelectedIndex : number = -1;

	/**
	 * TRUE if the dropdown is the focused element in it's form.
	 */
	public    active: boolean; // the active is overrided by the MFocusable mixin

	/**
	 * Whether the dropdown handles by itself the TAB key (true), or the TAB key
	 * focuses the next focusable element in it's form
	 */
	public    wantTabs: boolean = false;

	/**
	 * Focus order ( in form )
	 */
	public    tabIndex: number = 0;

	/**
	 * Whether the dropdown is included in the focus cycle of it's form or not.
	 */
	public    includeInFocus: boolean = true;

	/**
	 * By default, the user presses UP / DOWN to navigate inside the dropdown values.
	 * When placing the DropDown control inside of a PropertyGrid control, the UP / DOWN keys
	 * change their roles, in order to allow the user to navigate through the Property Grid control.
	 * Set this value to FALSE in order to ignore the UP / DOWN arrows on the DropDown control.
	 */
	public    keyIncrement: boolean = true;


	/**
	 * Constructor. Creates a new UI_DropDown.
	 */
	constructor( owner: UI ) {
		super( owner, [ 'IFocusable', 'IInput' ], Utils.dom.create( 'div', 'ui UI_DropDown' ) );
		
		this._root.appendChild( this._dom.view );
		this._root.appendChild( this._dom.expander );
		this._dom.expander.appendChild( this._dom.icon );

		this.width = UI_DropDown._theme.defaults.width;
		this.height= UI_DropDown._theme.defaults.height;

		this._dom.icon.className = UI_DropDown._theme.expander[0];

		this._setupEvents_();
	}

	/**
	 * Returns the total number of options in the DropDown
	 */
	get length(): number {
		return this._length;
	}

	/**
	 * Gets / Sets the options of the dropdown
	 */
	get options(): IOption[] {
		return this._options;
	}

	/**
	 * Adds an option at position index. If index is null,
	 * insertion is made at end.
	 *
	 * If index is negative, insertion is made starting from the end.
	 */
	public addOption( option: IOption, index: number = null ) {

		var destinationIndex: number = index == null
			? this._length
			: ( index < 0 ? this._length - index - 2 : index ),

			needIncrementSelectedIndex: boolean
				= this._selectedIndex > -1 && destinationIndex <= this._selectedIndex;

		if ( destinationIndex < 0 || destinationIndex > this._length ) {
			throw new Error('Index ' + index + ' is out of bounds' );
		}

		if ( !option || typeof option.value == 'undefined' || typeof option.text == 'undefined' ) {
			throw new Error('The addOption argument expects an IOption object.');
		}

		this._options.splice( destinationIndex, 0, { "value": option.value, "text": option.text } );
		this._length++;

		if ( needIncrementSelectedIndex ) {
			this._selectedIndex++;
		}

		if ( this.expanded ) {
			this.expanded = false;
		}
	}

	/** 
	 * Removes the option from position index. If index is a negative value, the option is
	 * removed from the end.
	 *
	 */
	public removeOption( index: number = null ) {

		var removeIndex: number = index === null
			? this._length - 1
			: ( index < 0 ? this._length - index - 2 : index ),

			needDecrementSelectedIndex: boolean
				= this._selectedIndex > -1 && removeIndex <= this._selectedIndex;

		if ( removeIndex < 0 || removeIndex >= this._length ) {
			throw new Error( 'Index ' + index + ' is out of bounds' );
		}

		this._options.splice( removeIndex, 1 );
		this._length--;

		if ( needDecrementSelectedIndex ) {
			if ( this._selectedIndex == removeIndex ) {
				this.selectedIndex = -1;
			} else {
				this._selectedIndex--;
			}
		}

		if ( this.expanded ) {
			this.expanded = false;
		}

	}

	set options( options: IOption[] ) {
		options = options || [];
		
		this._options.splice( 0, this.length );
		this._length = 0;

		var i: number = 0,
		    len: number = options.length;

		this._selectedIndex = -1;

		for ( i=0; i<len; i++ ) {
			
			this._options.push( {
				value: options[i].value || '',
				text : options[i].text || options[i].value || ''
			} );

			if ( options[i].selected || i == 0 ) {
				this._selectedIndex = i;
			}

			this._length++;

		}

		if ( this._selectedIndex != -1 ) {
			this._dom.view.textContent = String( this._options[ this._selectedIndex ].text || '' );
		}

		this.onRepaint();
	}

	/**
	 * Gets / Sets the selected index of the dropdown. Invalid values on setter will be treated
	 * as -1.
	 */
	get selectedIndex(): number {
		return this._selectedIndex;
	}

	set selectedIndex( index: number ) {
		if ( index < -1 || index >= this._options.length ) {
			index = -1;
		}
		if ( index != this._selectedIndex ) {
			this._selectedIndex = index;
			this._dom.view.textContent = String( this._selectedIndex < 0 ? '' : this._options[ index ].text || '' );
			this.fire( 'change' );
		}
	}

	/**
	 * Returns the corresponding value of the option located at selectedIndex,
	 * or NULL if the selected index is -1.
	 */
	get value(): any {
		if ( this._selectedIndex == -1 ) {
			return null;
		} else {
			return this._options[ this._selectedIndex ].value;
		}
	}

	/**
	 * Sets the selected index to the first option whose value is "value",
	 * or -1 if an option with those value is not found.
	 */
	set value( value: any ) {
		var i: number;

		if ( this._length == 0 ) {
			return;
		}

		for ( i=0; i<this._length; i++ ) {
			if ( this._options[i].value == value ) {
				this.selectedIndex = i;
				return;
			}
		}

		this.selectedIndex = -1;
	}

	/**
	 * Internal. Whether the dropdown is expanded or not.
	 */
	protected get expanded(): boolean {
		return this._expanded;
	}

	/**
	 * Internal. Whether the dropdown is expanded or not.
	 */
	protected set expanded( expanded: boolean ) {
		expanded = !!expanded;
		
		if ( expanded != this._expanded ) {
			this._expanded = expanded;
			this._dom.icon.className = UI_DropDown._theme.expander[ ~~this._expanded ];

			if ( this._expanded ) {
				this._open();
			} else {
				this._close();
			}

		}
	}

	/**
	 * Public read-only alias of expanded property
	 */
	get isExpanded(): boolean {
		return this.expanded;
	}

	/**
	 * Overlay canvas renderer. Renders the dropdown's overlay.
	 */
	protected _renderOverlay() {
		
		if ( !this._overlay ) {
			return;
		}

		var ctx      : UI_Canvas_ContextMapper = this._overlay.ctx,
		    optWidth : number,
		    optStart : number,
		    optLength: number,
		    optEnd   : number,
		    yTop     : number,
		    i        : number,
		    scrollTop: number = ctx.scrollTop,
		    logicalHeight: number = ctx.logicalHeight;

		ctx.beginPaint();

		ctx.fillStyle = 'white';
		ctx.fillRect( 0, 0, ctx.width, ctx.height );

		// paint options.
		optWidth = ctx.clientWidth;

		optStart = ~~( scrollTop / UI_DropDown._theme.option.height );
		optLength = ~~( ctx.height / UI_DropDown._theme.option.height ) + UI_DropDown._theme.option.height * ~~!!( ctx.height % UI_DropDown._theme.option.height );
		optEnd = optStart + optLength;
		optEnd = optEnd >= this._length ? this._length - 1 : optEnd;

		yTop = -(scrollTop % UI_DropDown._theme.option.height );

		ctx.font = UI_DropDown._theme.font.size + 'px ' + UI_DropDown._theme.font.family;
		ctx.textBaseline = "middle";

		for ( i = optStart; i<= optEnd; i++ ) {
			if ( i == this._overlaySelectedIndex ) {
				ctx.fillStyle = UI_DropDown._theme.background.selected;
				ctx.fillRect( 0, yTop, optWidth, UI_DropDown._theme.option.height );
			}

			ctx.fillStyle = UI_DropDown._theme.font[ i == this._overlaySelectedIndex ? 'selectedColor' : 'color' ];

			ctx.fillText( ctx.dotDotDot( this._options[ i ].text, optWidth - 4 ), 2, yTop + ~~( UI_DropDown._theme.option.height / 2 ) );

			yTop += UI_DropDown._theme.option.height;
		}

		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1;
		ctx.rect( 0, 0, ctx.width, ctx.height-1 );
		ctx.stroke();


		ctx.endPaint();

	}

	/**
	 * Internal. Scrolls the overlay's scrollTop, in order to make visible
	 * in it's viewport the option at position index.
	 */
	protected scrollIntoIndex( index: number ) {

		if ( !this._overlay ) {
			return;
		}

		if ( index <= 0 ) {
			this._overlay.scrollTop = 0;
		} else {
			var optionLogicalY1 = ( index ) * UI_DropDown._theme.option.height,
			    optionLogicalY2 = ( index + 1 ) * UI_DropDown._theme.option.height;

			if ( optionLogicalY1 < this._overlay.scrollTop ) {
				this._overlay.scrollTop = optionLogicalY1;
			} else
			if ( optionLogicalY2 > this._overlay.scrollTop + this._overlay.clientHeight ) {
				this._overlay.scrollTop = optionLogicalY2 - this._overlay.clientHeight;
			}

		}
	}

	/**
	 * Internal. Opens the DropDown.
	 */
	protected _open() {
		
		var rect: ClientRect = this._root.getBoundingClientRect(),
		    winHeight: number,
		    placement: IWindow;

		if ( this._overlay || !this._length || !rect ) {
			return;
		}

		winHeight = Math.min( this._length, 10 ) * UI_DropDown._theme.option.height;

		placement = UI_Screen.get.getBestPlacementDropDownStyle( {
			x      : rect.left,
			y      : rect.top,
			width  : rect.width,
			height : rect.height
		}, {
			"width": this.clientRect.width,
			"height": winHeight
		}, 1 );

		this._overlaySelectedIndex = this._selectedIndex;

		this._overlay = UI_Screen.get.createWindow( 
			placement.x, placement.y, 
			placement.width, placement.height, 
			null, 
			this._length * UI_DropDown._theme.option.height
		);

		this._overlay.overflowY = EClientScrollbarOverflow.AUTO;

		( function( me ) {

			me._overlay.on( 'render', function() {
				me._renderOverlay();
			} );

			me._overlay.on( 'keydown', function( evt: Utils_Event_Keyboard ) {
				me.fire( 'keydown', evt );
			} );

			me._overlay.on( 'mousemove', function( x: number, y: number ) {
				
				var newSelectedIndex: number = ~~( y / UI_DropDown._theme.option.height );

				if ( newSelectedIndex >= me._length ) {
					newSelectedIndex = me._length - 1;
				}

				if ( newSelectedIndex != me._overlaySelectedIndex ) {
					me._overlaySelectedIndex = newSelectedIndex;
					UI_Screen.get.render();
				}

			} );

			me._overlay.on( 'click', function( x: number, y: number ) {

				var newSelectedIndex: number = ~~( y / UI_DropDown._theme.option.height );

				if ( newSelectedIndex >= me._length ) {
					return;
				}

				me.selectedIndex = newSelectedIndex;

				me.expanded = false;

			} );

			me._overlay.on( 'scroll', function( wheelX, wheelY ) {
				
				if ( wheelY != 0 ) {
					me._overlay.scrollTop += wheelY;
					UI_Screen.get.render();
				}

			} );

			var onScreenClick = function( evt ) {
				if ( [ me._dom.view, me._root, me._dom.expander ].indexOf( evt.target || evt.srcElement ) > -1 ) {
					return;
				}
				UI_Screen.get.off( 'mousedown', onScreenClick );
				me.expanded = false;
			}

			UI_Screen.get.on( 'mousedown', onScreenClick );

		} )( this );

		this.scrollIntoIndex( this._overlaySelectedIndex );

		UI_Screen.get.render();

	}

	/**
	 * Internal. Closes the dropdown.
	 */
	protected _close() {

		if ( this._overlay ) {
			this._overlay.close();
			this._overlay = undefined;
		}

	}

	/**
	 * When the user press the "UP" / "DOWN" arrow keys, we call this function
	 * in order to change the index relative from it's position with a -1 or +1.
	 *
	 * @param relative - number, -1 or +1 handled.
	 */
	protected changeIndex( relativeIncrement: number ) {
		relativeIncrement = relativeIncrement || 0;

		if ( !relativeIncrement || !this._length ) {
			return;
		}

		var reference: number = this.expanded ? this._overlaySelectedIndex : this._selectedIndex,
			cursor: number = reference == -1
			? ( relativeIncrement > 0 ? 0 : this._length - 1 )
			: reference,
			circular: number[] = Utils.circular.createMap( 0, this._length-1, cursor, relativeIncrement < 0 ).slice(0,1),
			i: number = 0;

		if ( this.expanded ) {
			this._overlaySelectedIndex = circular[0];
			this.scrollIntoIndex( this._overlaySelectedIndex );
			UI_Screen.get.render();
		} else {
			this.selectedIndex = circular[0];
		}
	}

	/**
	 * Internal. Binds appropriated events on the dropdown.
	 */
	protected _setupEvents_() {

		( function( me ) {

			me.on( 'keydown', function( ev: Utils_Event_Keyboard ) {

				if ( me.disabled ) {
					return;
				}

				var code = ev.code;

				switch ( code ) {

					case Utils.keyboard.KB_SPACE:
					case Utils.keyboard.KB_F4:
						this.expanded = !this.expanded;
						break;

					case Utils.keyboard.KB_UP:
						if ( this.keyIncrement || this.expanded || ( !this.keyIncrement && ( ev.ctrlKey || ev.altKey || ev.shiftKey ) ) ) {
							this.changeIndex( -1 );
						}
						break;

					case Utils.keyboard.KB_DOWN:
						if ( this.keyIncrement || this.expanded || ( !this.keyIncrement && ( ev.ctrlKey || ev.altKey || ev.shiftKey ) ) ) {
							this.changeIndex( +1 );
						}
						break;

					case Utils.keyboard.KB_ENTER:

						if ( this.expanded ) {
							this.expanded = false;
							this.selectedIndex = this._overlaySelectedIndex;
						} else {
							this.expanded = true;
						}

						break;

					case Utils.keyboard.KB_ESC:
						this.expanded = false;
						break;

					case Utils.keyboard.KB_HOME:

						if ( this.length ) {
							if ( this.expanded ) {
								this._overlaySelectedIndex = 0;
								this.scrollIntoIndex(0);
								this._overlay.render();
							} else {
								this.selectedIndex = 0;
							}

						}

						break;

					case Utils.keyboard.KB_END:

						if ( this.length ) {
							if ( this.expanded ) {
								this._overlaySelectedIndex = this.length - 1;
								this.scrollIntoIndex(this.length - 1);
								this._overlay.render();
							} else {
								this.selectedIndex = this.length - 1;
							}
						}

						break;

				}

			} );

			me.onDOMEvent( me._root, EEventType.MOUSE_WHEEL, function( ev: Utils_Event_Mouse ) {
				if ( !me.active || me.disabled ) {
					return;
				}

				if ( ev.delta.y != 0 ) {

					if ( ev.delta.y < 0 ) {
						me.changeIndex( -1 );
					} else {
						me.changeIndex( 1 );
					}

				}

				ev.preventDefault();
				ev.stopPropagation();
				ev.handled = true;
			} );

			me.onDOMEvent( me._root, EEventType.MOUSE_DOWN, function( evt: Utils_Event_Mouse ) {

				if ( me.disabled || me.expanded || evt.which != 1 ) {
					return;
				}

				me.expanded = true;

			}, false );

			me.on( 'disabled', function( on: boolean ) {
				if ( on ) {
					Utils.dom.addClass( me._dom.icon, 'disabled' );
					me.expanded = false;
				} else {
					Utils.dom.removeClass( me._dom.icon, 'disabled' );
				}
			} );

			me.on( 'blur', function() {
				me.expanded = false;
			} );

		} )( this );

	}

}

Mixin.extend( 'UI_DropDown', 'MFocusable' );

Constraint.registerClass( {
	"name": "UI_DropDown",
	"extends": "UI",
	"properties": [
		{
			"name": "options",
			"type": "IOption[]"
		},
		{
			"name": "selectedIndex",
			"type": "number"
		}
	]
});