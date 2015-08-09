/// <reference path="DateBox/DigitGroup.ts" />
/// <reference path="DateBox/Picker.ts" />

class UI_DateBox extends UI implements IFocusable {

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

	protected _dom = {
		view: Utils.dom.create( 'div', 'view' ),
		expander: Utils.dom.create( 'div', 'expander' ),
		icon: Utils.dom.create( 'div', UI_DateBox._theme.expander.collapsed )
	};

	// Focusable mixin dependencies
	public active: boolean;
	public tabIndex: number = 0;
	public includeInFocus: boolean = true;
	public wantTabs: boolean = true;

	protected _displayFormat: string = null;
	protected _groups: UI_DateBox_DigitGroup[] = [];
	protected _currentGroup: number = 0;

	protected _minDate: Date = null;
	protected _maxDate: Date = null;

	protected _picker: UI_DateBox_Picker;

	constructor( owner: UI ) {
		super( owner, [ 'IFocusable' ], Utils.dom.create( 'div', 'ui UI_DateBox' ) );

		this._root.appendChild( this._dom.view );
		this._root.appendChild( this._dom.expander );
		this._dom.expander.appendChild( this._dom.icon );

		this.width = UI_DateBox._theme.defaults.width;
		this.height= UI_DateBox._theme.defaults.height;

		this.displayFormat = Utils.date.DEFAULT_TIMESTAMP_FORMAT;

		this._setupEvents_();
	}

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

	public getDatePart( part: EDatePart ): number {
		var i: number,
			len: number = this._groups.length,
			d: Date;

		for (i = 0; i < len; i++ ) {
			if ( this._groups[i].datePart == part && this._groups[i].value !== null ) {
				return this._groups[i].value - ( part == EDatePart.MONTH ? 1 : 0 );
			}
		}

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

	}

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
			default:
				this._minDate = Utils.date.parse( String(date || ''), this._displayFormat );
				break;
		}
	}

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
			default:
				this._maxDate = Utils.date.parse( String(date || ''), this._displayFormat );
				break;
		}
	}

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

	get valid(): boolean {
		return this.invalid == EInvalidDate.NONE;
	}

	private dateStr(): string {
		var result: string = '';
		for ( var i=0, len = this._groups.length; i<len; i++ ) {
			result += this._groups[i].toString();
		}
		return result;
	}

	protected get expanded(): boolean {
		return !!this._picker;
	}

	protected set expanded( expanded: boolean ) {
		expanded = !!expanded;
		if ( expanded != this.expanded ) {
			if ( expanded ) {
				this._picker = new UI_DateBox_Picker( this );
			} else {
				this._picker.close();
			}

			this._dom.icon.className = UI_DateBox._theme.expander[ expanded ? 'expanded' : 'collapsed' ];
		}
	}

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

			me.on( 'keydown', function( ev ) {

				if ( me.disabled ) {
					return;
				}

				if ( !me._groups.length ) {
					return;
				}

				var code = ev.keyCode || ev.charCode,
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
						me._groups[ me.currentGroup ].decrement();
						break;

					case Utils.keyboard.KB_DOWN:
						me._groups[ me.currentGroup ].increment();
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

						var chr: string = Utils.keyboard.eventToString( ev );

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
				me.expanded = false;
			} );

			me.on( 'overlay-closed', function() {
				me._picker = undefined;
				me._dom.icon.className = UI_DateBox._theme.expander.collapsed;
			} );

			me._dom.expander.addEventListener( 'mousedown', function( ev ) {
				if ( me.disabled ){ 
					return;
				}

				if ( !me.active ) {
					me.active = true;
				}

				ev.stopPropagation();

				me.expanded = true;

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