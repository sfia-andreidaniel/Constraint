/// <reference path="DateBox/DigitGroup.ts" />

class UI_DateBox extends UI implements IFocusable {

	public static _theme = {
		defaults: {
			width: $I.number('UI.UI_DateBox/defaults.width'),
			height: $I.number('UI.UI_DateBox/defaults.height')
		},
		expander: {
			collapsed: $I.string('UI.UI_DateBox/expander.collapsed'),
			expander:  $I.string('UI.UI_DateBox/expander.expanded' )
		}
	};

	public static createDigitGroup( date: EDatePart ): UI_DateBox_DigitGroup {
		switch ( date ) {
			case EDatePart.DAY:
				return new UI_DateBox_DigitGroup( 1, 31, 'DD', '', EDatePart.DAY );
				break;
			case EDatePart.MONTH:
				return new UI_DateBox_DigitGroup( 1, 12, 'MM', '', EDatePart.MONTH );
				break;
			case EDatePart.YEAR:
				return new UI_DateBox_DigitGroup( 1, 2999, 'YYYY', '', EDatePart.YEAR );
				break;
			case EDatePart.HOUR:
				return new UI_DateBox_DigitGroup( 0, 23, 'hh', '', EDatePart.HOUR );
				break;
			case EDatePart.MINUTE:
				return new UI_DateBox_DigitGroup( 0, 59, 'mm', '', EDatePart.MINUTE );
				break;
			case EDatePart.SECOND:
				return new UI_DateBox_DigitGroup( 0, 59, 'ss', '', EDatePart.SECOND );
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
		icon: Utils.dom.create( 'div', UI_DateBox._theme.expander.collapsed ),
		input: Utils.dom.create( 'input' )
	};

	// Focusable mixin dependencies
	public active: boolean;
	public wantTabs: boolean = false;
	public tabIndex: number = 0;
	public includeInFocus: boolean = true;

	protected _displayFormat: string = null;
	protected _groups: UI_DateBox_DigitGroup[] = [];
	protected _currentGroup: number = 0;

	constructor( owner: UI ) {
		super( owner, [ 'IFocusable' ], Utils.dom.create( 'div', 'ui UI_DateBox' ) );

		this._root.appendChild( this._dom.view );
		this._dom.input.setAttribute('type', 'text' );
		this._dom.view.appendChild( this._dom.input );
		this._root.appendChild( this._dom.expander );
		this._dom.expander.appendChild( this._dom.icon );

		this.width = UI_DateBox._theme.defaults.width;
		this.height= UI_DateBox._theme.defaults.height;

		this.displayFormat = Utils.date.DEFAULT_DATE_FORMAT;
		this._dom.input.value = this.displayFormat;

		this._setupEvents_();
	}

	get displayFormat(): string {
		return this._displayFormat;
	}

	set displayFormat( format: string ) {
		
		format = format || Utils.date.DEFAULT_DATE_FORMAT;
		
		if ( !/^(YYYY|MM|DD|hh|mm|ss)/.test( format ) ) {
			throw new Error( 'Invalid date format' );
		}

		if ( format != this._displayFormat ) {
			this._displayFormat = format;
			this._dom.input.value = this._dom.input.value.substr(0, this._displayFormat );
			this._dom.input.maxLength = this._displayFormat.length;

			// setup date groups
			this._groups = [];

			while ( format.length ) {
				switch ( true ) {
					case /^YYYY/.test( format ):
						this._groups.push( UI_DateBox.createDigitGroup( EDatePart.YEAR ) );
						format = format.substr(4);
						break;
					case /^MM/.test(format):
						this._groups.push( UI_DateBox.createDigitGroup( EDatePart.MONTH ) );
						format = format.substr(2);
						break;
					case /^DD/.test(format):
						this._groups.push( UI_DateBox.createDigitGroup( EDatePart.DAY ) );
						format = format.substr(2);
						break;
					case /^hh/.test( format ):
						this._groups.push( UI_DateBox.createDigitGroup( EDatePart.HOUR ) );
						format = format.substr(2);
						break;
					case /^mm/.test( format ):
						this._groups.push( UI_DateBox.createDigitGroup( EDatePart.MINUTE ) );
						format = format.substr(2);
						break;
					case /^ss/.test( format ):
						this._groups.push( UI_DateBox.createDigitGroup( EDatePart.SECOND ) );
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

			for ( var i = 1, len = this._groups.length; i<len; i++ ) {
				this._groups[i].index = this._groups[ i-1 ].index + this._groups[ i - 1 ].length + this._groups[ i - 1 ].ending.length;
			}

			this._currentGroup = 0;
		}
	}

	get readOnly(): boolean {
		return this._dom.input.readOnly;
	}

	set readOnly( on: boolean ) {
		this._dom.input.readOnly = !!on;
	}

	get valid(): boolean {
		
		var result: boolean,
		    i: number,
		    len: number = this._groups.length,
		    date: string = '',
		    dateObj: Date;

		for ( i=0; i<len; i++ ) {
			if ( !this._groups[i].valid ) {
				return false;
			}
			date += this._groups[i].toString();
		}

		// syntactically we're ok, check if date is parsable
		if ( !( dateObj = Utils.date.parse( date, this._displayFormat ) ) ) {
			return false;
		} else {
			return true;
		}

	}

	private dateStr(): string {
		var result: string = '';
		for ( var i=0, len = this._groups.length; i<len; i++ ) {
			result += this._groups[i].toString();
		}
		return result;
	}

	private updateInput() {
		this._dom.input.value = this.dateStr();

		var selStart: number = this._groups[ this._currentGroup ] ? this._groups[ this._currentGroup ].index : 0,
		    selLen  : number = this._groups[ this._currentGroup ] ? this._groups[ this._currentGroup ].length : 0;

		if ( selLen == 0 ) {
			return;
		} else {

			Utils.dom.selectText( this._dom.input, selStart, selLen );

		}

	}

	private setActiveGroupByCaretPosition( position: number ) {
		
		if ( position ) {

			if ( position >= this._displayFormat.length ) {
				this._currentGroup = this._groups.length - 1;
			} else {

				for ( var i=0, len = this._groups.length; i<len; i++ ) {
					if ( position >= this._groups[i].index && position <= this._groups[i].index + this._groups[i].length + this._groups[i].ending.length ) {
						this._currentGroup = i;
						return;
					}
				}
			}
		}
	}

	protected _setupEvents_() {

		( function( me ) {

			me.on( 'focus', function() {
				if ( !me.disabled ) {
					me._dom.input.focus();
				}
				Utils.dom.removeClass( me._root, 'invalid' );
			} );

			me.on( 'blur', function() {
				me._dom.input.blur();
			} );

			me._dom.input.addEventListener( 'mousedown', function( ev ) {
				ev.stopPropagation();
			}, true );

			me._dom.input.addEventListener( 'focus', function( ev ) {
				if ( me.form.activeElement != me ) {
					me.active = true;
				}
				me.updateInput();
			}, true );

			me._dom.input.addEventListener('input', function( ev ) {
				if ( !me.disabled && !me.readOnly ) {
					me.fire( 'change' );
				}
			}, true );

			me.on('disabled', function( on: boolean ) {
				me._dom.input.disabled = on;
			} );

			me.on( 'keydown', function( ev ) {

				if ( me.disabled ) {
					return;
				}

				if ( !me._groups[ me._currentGroup ] ) {
					return;
				}

				var code = ev.keyCode || ev.charCode,
				    update: boolean = false;

				switch ( code ) {
					case Utils.keyboard.KB_DELETE:
						update = me._groups[ me._currentGroup ].addChar( null );
						break;

					case Utils.keyboard.KB_LEFT:
						me._currentGroup--;
						if ( me._currentGroup == -1 ) {
							me._currentGroup = me._groups.length - 1;
						}
						update = true;
						break;

					case Utils.keyboard.KB_UP:
						me._groups[ me._currentGroup ].decrement();
						update = true;
						break;

					case Utils.keyboard.KB_DOWN:
						me._groups[ me._currentGroup ].increment();
						update = true;
						break;

					case Utils.keyboard.KB_RIGHT:
						me._currentGroup++;
						if ( me._currentGroup >= me._groups.length ) {
							me._currentGroup = 0;
						}
						update = true;
						break;

					default:

						var chr: string = Utils.keyboard.eventToString( ev );

						if ( chr && chr.length == 1 ) {

							update = me._groups[ me._currentGroup ].addChar( chr );

							if ( chr == me._groups[ me._currentGroup ].ending.substr(0,1) && !update ) {
								me._currentGroup++;
								if ( me._currentGroup >= me._groups.length ) {
									me._currentGroup = 0;
								}
								update = true;
							}

						}

						
						break;
				}

				if ( update ) {
					me.updateInput();
				}

				ev.stopPropagation();
				ev.preventDefault();

			}, true );

			me._dom.input.addEventListener( 'mouseup', function() {
				if ( me.disabled ) {
					return;
				}

				var caretPosition = Utils.dom.getCaretPosition( me._dom.input );

				me.setActiveGroupByCaretPosition( caretPosition );

				setTimeout( function() {
					me.updateInput();
				}, 1 );
			}, false );

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