/**
 * This is a Date Picker control, allowing the user to input dates.
 */
class UI_DateBox extends UI implements IFocusable, IInput {

	/**
	 * Theme imported from css/constraint.ui file
	 */
	public static _theme = {
		defaults: {
			width: $I.number('UI.UI_DateBox/defaults.width'),
			height: $I.number('UI.UI_DateBox/defaults.height')
		},
		expander: {
			collapsed: $I.string('UI.UI_DateBox/expander.collapsed'),
			expanded:  $I.string('UI.UI_DateBox/expander.expanded' )
		}
	};

	/**
	 * Creates a digit group, restricting the user to input only values specific to a
	 * part of a date.
	 */
	public static createDigitGroup( date: EDatePart, owner: UI_Event ): UI_DateBox_DigitGroup {
		switch ( date ) {
			case EDatePart.DAY:
				return new UI_DateBox_DigitGroup( 1, 31, 'DD', '', EDatePart.DAY, owner );
				break;
			case EDatePart.MONTH:
				return new UI_DateBox_DigitGroup( 1, 12, 'MM', '', EDatePart.MONTH, owner );
				break;
			case EDatePart.YEAR:
				return new UI_DateBox_DigitGroup( 1, 2999, 'YYYY', '', EDatePart.YEAR, owner );
				break;
			case EDatePart.HOUR:
				return new UI_DateBox_DigitGroup( 0, 23, 'hh', '', EDatePart.HOUR, owner );
				break;
			case EDatePart.MINUTE:
				return new UI_DateBox_DigitGroup( 0, 59, 'mm', '', EDatePart.MINUTE, owner );
				break;
			case EDatePart.SECOND:
				return new UI_DateBox_DigitGroup( 0, 59, 'ss', '', EDatePart.SECOND, owner );
				break;
			case EDatePart.UNIX_TIMESTAMP:
	 		case EDatePart.MILLISECONDS:
	 			throw new Error( 'The UI_DateBox control does not support this date format' );
	 			break;
		}
	}

	/**
	 * The DOM nodes the Date Picker control is using.
	 */
	protected _dom = {
		view: Utils.dom.create( 'div', 'view' ),
		expander: Utils.dom.create( 'div', 'expander' ),
		icon: Utils.dom.create( 'div', UI_DateBox._theme.expander.collapsed )
	};

	/**
	 * Focusable mixin dependencies 
	 */
	public active: boolean;
	public tabIndex: number = 0;
	public includeInFocus: boolean = true;
	public wantTabs: boolean = true;

	/**
	 * By default, the user presses UP / DOWN to increment / decrement the date digit groups.
	 * When placing the DateBox control inside of a PropertyGrid control, the UP / DOWN keys
	 * change their roles, in order to allow the user to navigate through the Property Grid control.
	 * Set this value to FALSE in order to ignore the UP / DOWN arrows on the date control.
	 */
	public    keyIncrement: boolean = true;

	/**
	 * The format of the date
	 */
	protected _displayFormat: string = null;
	
	/**
	 * Groups of date parts that are used together to represent the date,
	 * according to it's display format.
	 */
	protected _groups: UI_DateBox_DigitGroup[] = [];

	/**
	 * The index of the group in which the user is inputting values.
	 */
	protected _currentGroup: number = 0;

	/**
	 * Minimum allowed date.
	 */
	protected _minDate: Date = null;

	/**
	 * Maximum allowed date.
	 */
	protected _maxDate: Date = null;

	/**
	 * The date picker instance, that is rendered on UI_Screen, when the user
	 * is clicking on the expand arrow, or is hitting F4.
	 */
	protected _picker: UI_DateBox_Picker;

	/**
	 * Input constructor
	 */
	constructor( owner: UI ) {
		super( owner, [ 'IFocusable', 'IInput' ], Utils.dom.create( 'div', 'ui UI_DateBox' ) );

		this._root.appendChild( this._dom.view );
		this._root.appendChild( this._dom.expander );
		this._dom.expander.appendChild( this._dom.icon );

		this.width = UI_DateBox._theme.defaults.width;
		this.height= UI_DateBox._theme.defaults.height;

		this.displayFormat = Utils.date.DEFAULT_TIMESTAMP_FORMAT;

		this._setupEvents_();
	}

	/**
	 * Gets / sets the format of the date in it's input.
	 */
	get displayFormat(): string {
		return this._displayFormat;
	}

	set displayFormat( format: string ) {
		
		var i: number,
		    len: number;

		format = format || Utils.date.DEFAULT_DATE_FORMAT;

		if ( !/^(YYYY|MM|DD|hh|mm|ss)/.test( format ) ) {
			throw new Error( 'Invalid date format' );
		}

		if ( format != this._displayFormat ) {
			this._displayFormat = format;

			// remove groups nodes from parent container.
			for ( i=0, len = this._groups.length; i<len; i++ ) {
				this._groups[i].free();
				this._groups[i].node.parentNode.removeChild( this._groups[i].node );
			}

			// setup date groups
			this._groups = [];

			while ( format.length ) {
				switch ( true ) {
					case /^YYYY/.test( format ):
						this._groups.push( UI_DateBox.createDigitGroup( EDatePart.YEAR, this ) );
						format = format.substr(4);
						break;
					case /^MM/.test(format):
						this._groups.push( UI_DateBox.createDigitGroup( EDatePart.MONTH, this ) );
						format = format.substr(2);
						break;
					case /^DD/.test(format):
						this._groups.push( UI_DateBox.createDigitGroup( EDatePart.DAY, this ) );
						format = format.substr(2);
						break;
					case /^hh/.test( format ):
						this._groups.push( UI_DateBox.createDigitGroup( EDatePart.HOUR, this ) );
						format = format.substr(2);
						break;
					case /^mm/.test( format ):
						this._groups.push( UI_DateBox.createDigitGroup( EDatePart.MINUTE, this ) );
						format = format.substr(2);
						break;
					case /^ss/.test( format ):
						this._groups.push( UI_DateBox.createDigitGroup( EDatePart.SECOND, this ) );
						format = format.substr(2);
						break;
					default:
						if ( this._groups.length ) {
							this._groups[ this._groups.length - 1 ].ending += format[0];
						}
						format = format.substr(1);
						break;
				}
			}

			// append groups nodes.
			for ( i=0, len = this._groups.length; i<len; i++ ) {
				this._dom.view.appendChild( this._groups[i].node );
			}

			for ( i = 1, len = this._groups.length; i<len; i++ ) {
				this._groups[i].index = i;
			}

			this.currentGroup = 0;
		}
	}

	/**
	 * Used to test if the actual format of the date contains a specific
	 * date part (e.g. month, day, hour, etc).
	 */
	public hasDatePart( part: EDatePart ): boolean {
		var i: number,
		    len: number = this._groups.length;

		for ( i=0; i<len; i++ ) {
			if ( this._groups[i].datePart == part ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Returns a specific date part value from the input
	 */
	public getDatePart( part: EDatePart, absoluteValue: boolean = true ): number {
		var i: number,
			len: number = this._groups.length,
			d: Date;

		for (i = 0; i < len; i++ ) {
			if ( this._groups[i].datePart == part && this._groups[i].value !== null ) {
				return this._groups[i].value - ( part == EDatePart.MONTH ? 1 : 0 );
			}
		}

		if ( absoluteValue ) {

			d = new Date();

			switch ( part ) {
				case EDatePart.YEAR:
					return d.getFullYear();
					break;
				case EDatePart.MONTH:
					return d.getMonth();
					break;
				case EDatePart.DAY:
					return d.getDate();
					break;
				case EDatePart.HOUR:
					return d.getHours();
					break;
				case EDatePart.MINUTE:
					return d.getMinutes();
					break;
				case EDatePart.SECOND:
					return d.getSeconds();
					break;
				default:
					return null;
					break;
			}

		} else {

			return null;

		}

	}

	/**
	 * Sets the value of a specific date part of the input.
	 */
	public setDatePart( part: EDatePart, value: number ) {
		var i: number,
			len: number = this._groups.length;
		for (i = 0; i < len; i++ ) {
			if ( this._groups[i].datePart == part ) {
				this._groups[i].value = value;
			}
		}
	}

	/**
	 * Gets/Sets the index of the current date part group in which the user is
	 * typing.
	 */
	get currentGroup(): number {
		return this._currentGroup;
	}

	set currentGroup( index: number ) {
		index = ~~index;
		
		if ( index < 0 || index >= this._groups.length ) {
			throw new Error('Invalid group index' );
		}
		
		this._currentGroup = index;

		for ( var i=0, len = this._groups.length; i<len; i++ ) {
			this._groups[i].active = index == i;
		}
	}

	/**
	 * Returns or sets the date from the input in text format.
	 */
	get text(): string {
		var result: string = '',
		    i: number,
		    len: number = this._groups.length;
		for ( i=0; i<len; i++ ) {
			result += this._groups[i].toString();
		}
		return result;
	}

	set text( dateText: string ) {
		this.value = String( dateText );
	}

	/**
	 * Gets / Sets the minimum allowed date that the user is able
	 * to input / select.
	 */
	get minDate(): any {
		return this._minDate;
	}

	set minDate( date: any ) {
		switch ( true ) {
			case date === null || !!!date:
				this._minDate = date;
				break;
			case date instanceof Date:
				this._minDate = date;
				break;
			case date === Math.round(date):
				this._minDate = new Date();
				this._minDate.setTime(date);
				break;
			default:
				this._minDate = Utils.date.parse( String(date || ''), this._displayFormat );
				break;
		}
		if ( this._minDate ) {
			this._minDate.setHours(0);
			this._minDate.setMinutes(0);
			this._minDate.setSeconds(0);
		}
	}

	/**
	 * Gets / Sets the maximum allowed date that the user is able to input
	 * or select.
	 */
	get maxDate(): any {
		return this._maxDate;
	}

	set maxDate( date: any ) {
		switch ( true ) {
			case date === null || !!!date:
				this._maxDate = date;
				break;
			case date instanceof Date:
				this._maxDate = date;
				break;
			case date === Math.round(date):
				this._maxDate = new Date();
				this._maxDate.setTime(date);
				break;
			default:
				this._maxDate = Utils.date.parse( String(date || ''), this._displayFormat );
				break;
		}
		if ( this._maxDate ) {
			this._maxDate.setHours(23);
			this._maxDate.setMinutes(59);
			this._maxDate.setSeconds(59);
		}
	}

	/**
	 * Used to test / get the reason for which the date is invalid in the input.
	 */
	get invalid(): EInvalidDate {

		if ( this.text == this._displayFormat ) {
			return EInvalidDate.NONE;
		}
		
		var result: boolean,
		    i: number,
		    len: number = this._groups.length,
		    date: string = '',
		    dateObj: Date;


		for ( i=0; i<len; i++ ) {
			if ( !this._groups[i].valid ) {
				return EInvalidDate.DATE_ERROR;
			}
			date += this._groups[i].toString();
		}

		// syntactically we're ok, check if date is parsable
		if ( !( dateObj = Utils.date.parse( date, this._displayFormat ) ) ) {
			return EInvalidDate.DATE_ERROR;
		} else {
			
			if ( this._minDate && this._minDate.getTime() > dateObj.getTime() ) {
				return EInvalidDate.DATE_TOO_SMALL;
			}

			if ( this._maxDate && this._maxDate.getTime() < dateObj.getTime() ) {
				return EInvalidDate.DATE_TOO_BIG;
			}

			return EInvalidDate.NONE;
		}

	}

	/**
	 * Returns or sets the value of the control, in window.Date format.
	 * 
	 * A NULL value is returned if the date is invalid.
	 */
	get value(): any {
		
		if ( this.valid ) {
			return Utils.date.parse( this.text, this._displayFormat );
		} else {
			return null;
		}
	}

	set value( value: any ) {

		var result: Date,
		    i: number,
		    len: number = this._groups.length,
		    nowText = this.text;

		switch ( true ) {
			case !!!value:
				result = null;
				break;
			case value instanceof Date:
				result = value;
				break;
			default:
				result = Utils.date.parse( String( value || '' ), this._displayFormat );
				break;
		}

		for ( i=0; i<len; i++ ) {
			if ( result === null ) {
				this._groups[i].value = null;
			} else {
				switch ( this._groups[i].datePart ) {
					case EDatePart.DAY:	
						this._groups[i].value = result.getDate();
						break;
					case EDatePart.MONTH:
						this._groups[i].value = result.getMonth() + 1;
						break;
					case EDatePart.YEAR:
						this._groups[i].value = result.getFullYear();
						break;
					case EDatePart.HOUR:
						this._groups[i].value = result.getHours();
						break;
					case EDatePart.MINUTE:
						this._groups[i].value = result.getMinutes();
						break;
					case EDatePart.SECOND:
						this._groups[i].value = result.getSeconds();
						break;
				}
			}
		}

		if ( nowText != this.text )
			this.fire( 'text-changed' );
	}

	/**
	 * Returns true if the date from the control is valid, and false
	 * otherwise.
	 */
	get valid(): boolean {
		return this.invalid == EInvalidDate.NONE;
	}

	/**
	 * Returns the string literal value of the date represented by the input.
	 */
	private dateStr(): string {
		var result: string = '';
		for ( var i=0, len = this._groups.length; i<len; i++ ) {
			result += this._groups[i].toString();
		}
		return result;
	}

	/**
	 * Gets / sets the expanded state of the date control. When the expanded
	 * state is true, a date picker is rendered below the date control, allowing
	 * the user to "pick" a date from a calendar.
	 */
	protected get expanded(): boolean {
		return !!this._picker;
	}

	protected set expanded( expanded: boolean ) {

		if ( !this.hasDatePart(EDatePart.YEAR) && !this.hasDatePart(EDatePart.MONTH) && !this.hasDatePart(EDatePart.DAY)) {
			expanded = false;
		}

		expanded = !!expanded;

		if ( expanded != this.expanded ) {
			if ( expanded ) {
				this._picker = new UI_DateBox_Picker( this );
				Utils.dom.addClass(this._root, 'expanded');
			} else {
				this._picker.close();
				Utils.dom.removeClass(this._root, 'expanded');
			}

			this._dom.icon.className = UI_DateBox._theme.expander[ expanded ? 'expanded' : 'collapsed' ];
		}
	}

	/**
	 * Prepares / binds all events of the date control, making it ready
	 * for usage.
	 */
	protected _setupEvents_() {

		( function( me ) {

			me.on( 'focus-group', function( groupIndex: number ) {
				if ( !me.disabled ) {
					me.currentGroup = groupIndex;
				}
			} );

			me.on( 'wheel-group', function( delta: number, groupIndex: number ) {
				if ( !me.disabled && me.active ) {
					if ( delta > 0 ) {
						me._groups[ groupIndex ].increment();
					} else {
						me._groups[ groupIndex ].decrement();
					}

					me.fire( 'text-changed' );
				}
			} );

			me.on( 'blur', function() {
				me.expanded = false;
			} );

			me.on( 'keydown', function( ev: Utils_Event_Keyboard ) {

				if ( me.disabled ) {
					return;
				}

				if ( !me._groups.length ) {
					return;
				}

				var code = ev.code,
				    update: boolean,
				    nowText: string = me.text;

				switch ( code ) {
					case Utils.keyboard.KB_DELETE:
					case Utils.keyboard.KB_BACKSPACE:
						me._groups[ me.currentGroup ].addChar( null );
						break;

					case Utils.keyboard.KB_LEFT:

						if ( me.currentGroup > 0 ) {
							me.currentGroup--;
						} else {
							me.currentGroup = me._groups.length - 1;
						}

						break;

					case Utils.keyboard.KB_UP:
						if ( me.keyIncrement || ( !me.keyIncrement && ( ev.ctrlKey || ev.altKey || ev.shiftKey ) ) ) {
							me._groups[ me.currentGroup ].decrement();
						}
						break;

					case Utils.keyboard.KB_DOWN:
						if ( me.keyIncrement || ( !me.keyIncrement && ( ev.ctrlKey || ev.altKey || ev.shiftKey ) ) ) {
							me._groups[ me.currentGroup ].increment();
						}
						break;

					case Utils.keyboard.KB_RIGHT:
						if ( me.currentGroup < this._groups.length - 1 ) {
							me.currentGroup++;
						} else {
							me.currentGroup = 0;
						}
						break;

					case Utils.keyboard.KB_TAB:

						if ( !ev.shiftKey ) {

							if ( me.currentGroup < this._groups.length - 1 ) {
								me.currentGroup++;
							} else {
								UI_DialogManager.get.focusNextElement( true );
							}

						} else {

							if ( me.currentGroup > 0 ) {
								me.currentGroup--;
							} else {
								UI_DialogManager.get.focusPreviousElement( true );
							}

						}

						break;

					case Utils.keyboard.KB_F4:
						this.expanded = !this.expanded;
						break;

					default:

						var chr: string = ev.keyName;

						if ( chr && chr.length == 1 ) {

							update = me._groups[ me._currentGroup ].addChar( chr );

							if ( chr == me._groups[ me.currentGroup ].ending.substr(0,1) && !update ) {
								if ( me.currentGroup < this._groups.length - 1 ) {
									me.currentGroup++;
								} else {
									me.currentGroup = 0;
								}
							}
						}
						break;
				}

				if ( nowText != me.text ) {
					me.fire( 'text-changed' );
				}

			}, true );

			var _cTime: number = null;

			me.on( 'text-changed', function() {

				var d = <Date>me.value,
				    a: number = d === null ? null : d.getTime();

				if ( a !== _cTime ) {
					_cTime = a;
					me.fire( 'change' );
				}

			} );

			me.on( 'disabled', function( on: boolean ) {

				if ( on ) {
					Utils.dom.addClass( me._dom.icon, 'disabled' );
				} else {
					Utils.dom.removeClass( me._dom.icon, 'disabled' );
				}

				me.expanded = false;
			} );

			me.on( 'overlay-closed', function() {
				me._picker = undefined;
				me._dom.icon.className = UI_DateBox._theme.expander.collapsed;
				Utils.dom.removeClass(this._root, 'expanded');
			} );

			me.onDOMEvent( me._dom.expander, EEventType.MOUSE_DOWN, function( ev: Utils_Event_Mouse ) {
				
				if ( me.disabled ){ 
					return;
				}

				if ( !me.active ) {
					me.active = true;
				}

				ev.stopPropagation();

				me.expanded = true;

				ev.handled = true;

			}, true );

		} )( this );

	}

}

Mixin.extend( 'UI_DateBox', 'MFocusable' );

Constraint.registerClass({
	"name": "UI_DateBox",
	"extends": "UI",
	"properties": [

	]
});