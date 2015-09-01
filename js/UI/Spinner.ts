/**
 * The UI_Spinner control is the cross-browser implementation of a
 * input type="number" of HTML5. It allows the user to input a numeric value,
 * based on some rules / and / or restrictions.
 *
 * UI_Spinner samples:
 *
 * A normal UI_Spinner control:
 *
 * ![spinner1](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_Spinner.png "UI_Spinner")
 *
 * A disabled UI_Spinner control:
 *
 * ![spinner2](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_Spinner-disabled.png "UI_Spinner disabled")
 *
 */
class UI_Spinner extends UI implements IFocusable, IInput {

	public static _theme = {
		defaults: {
			width: 	   $I.number('UI.UI_Spinner/defaults.width'),
			height:    $I.number('UI.UI_Spinner/defaults.height')
		},
		background: {
			enabled:   $I.string('UI.UI_Spinner/background.enabled'),
			disabled:  $I.string('UI.UI_Spinner/background.disabled'),
			inactive:  $I.string('UI.UI_Spinner/background.inactive')
		},
		border: {
			color:     $I.string('UI.UI_Spinner/border.color')
		},
		buttons: {
			decrement: $I.string('UI.UI_Spinner/buttons.decrement'),
			increment: $I.string('UI.UI_Spinner/buttons.increment')
		}
	};

	/** IFocusable properties 
	 */
	public    active: boolean; // the active is overrided by the MFocusable mixin
	public    wantTabs: boolean = false;
	public    tabIndex: number = 0;
	public    includeInFocus: boolean = true;

	protected _min: number = null;
	protected _max: number = null;
	protected _step: number = 1;
	protected _precision: number = 2;

	protected _incrementer: UI_Timer;
	protected _decrementer: UI_Timer;

	public    keyIncrement: boolean = true;

	protected _dom = {
		input: Utils.dom.create('input'),
		spinUp: Utils.dom.create('div', 'decrement'),
		spinDn: Utils.dom.create('div', 'increment')
	};

	constructor( owner: UI ) {
		super(owner, ['IFocusable', 'IInput'], Utils.dom.create('div', 'ui UI_Spinner'));
		this.width = UI_Spinner._theme.defaults.width;
		this.height= UI_Spinner._theme.defaults.height;
		this._initDom_();
		this.value = 0;
	}
	
	get min(): number {
		return this._min;
	}

	set min( min: number ) {
		if ( min !== 0 ) min = parseFloat( String( min || '' ) );
		if ( !isNaN( min ) ) {
			this._min = min;
		} else {
			this._min = null;
		}
	}

	get max(): number {
		return this._max;
	}

	set max( max: number ) {
		if ( max !== 0 ) max = parseFloat( String( max || '' ) );
		if ( !isNaN( max ) ) {
			this._max = max;
		} else {
			this._max = null;
		}
	}

	get step(): number {
		return this._step;
	}

	set step( step: number ) {
		step = parseFloat( String( step || '' ) );
		if ( isNaN( step ) ) {
			this._step = 1;
		} else {
			this._step = Math.abs( step );
		}
	}

	get value(): number {
		var v = parseFloat( this._dom.input.value );
		if ( !isNaN( v ) ) {
			return v;
		} else {
			return null;
		}
	}

	set value( value: number ) {
		
		value = parseFloat( String( value ) );
		
		if ( isNaN( value ) ) {
			this._dom.input.value = '';
		} else {
			this._dom.input.value = String( value );
		}
	}

	get precision(): number {
		return this._precision;
	}

	set precision( maxDigits: number ) {
		maxDigits = Math.abs( ~~maxDigits );
		this._precision = maxDigits;
	}

	protected doStep( direction: number ) {
		
		var v: number = this.value,
		    min: number = this.min,
		    max: number = this.max;
		
		if ( direction > 0 ) {
			if ( v === null ) {
				if ( min === null ) {
					v = 0;
				} else {
					v = min;
				}
			} else {
				v += this.step;
			}
		} else {
			if ( v === null ) {
				if ( max === null ) {
					v = 0;
				} else {
					v = max;
				}
			} else {
				v -= this.step;
			}
		}

		if ( min !== null && v < min ) {
			v = min;
		}

		if ( max !== null && v > max ) {
			v = max;
		}

		this.value = parseFloat( v.toFixed(this._precision) );

		this.fire( 'change' );
	}

	get readOnly(): boolean {
		return this._dom.input.readOnly;
	}

	set readOnly( on: boolean ) {
		this._dom.input.readOnly = !!on;
	}

	protected _initDom_() {
		this._dom.input.setAttribute('type', 'text');
		this._root.appendChild( this._dom.input );
		this._root.appendChild( this._dom.spinUp );
		this._root.appendChild( this._dom.spinDn );
		this._dom.spinUp.appendChild( Utils.dom.create('div', UI_Spinner._theme.buttons.decrement ) );
		this._dom.spinDn.appendChild( Utils.dom.create('div', UI_Spinner._theme.buttons.increment ) );

		( function( me ) {

			me.onDOMEvent( me._dom.input, EEventType.MOUSE_DOWN, function( evt: Utils_Event_Mouse ) {
				evt.stopPropagation();
			}, true );

			me.onDOMEvent( me._dom.input, EEventType.FOCUS, function( evt: Utils_Event_Generic ) {
				if ( me.disabled ) {
					return;
				}

				Utils.dom.selectText( me._dom.input, 0 );

				if ( !me.active ) {
					me.active = true;
				}

			}, true );

			me.onDOMEvent( me._dom.input, EEventType.BLUR, function( evt: Utils_Event_Generic ) {
				if ( me.form.disabled ) {
					return;
				}
				if ( me.active ) {
					me.form.activeElement = null;
				}
			}, true );

			me.on( 'blur', function() {
				me._dom.input.blur();
			} );

			me.on( 'focus', function() {
				setTimeout(function(){
					me._dom.input.focus();
				}, 1);
			} );

			me.on( 'disabled', function( on ) {
				if ( on ) {
					Utils.dom.addClass( me._dom.spinUp.firstChild, 'disabled' );
					Utils.dom.addClass( me._dom.spinDn.firstChild, 'disabled' );
				} else {
					Utils.dom.removeClass( me._dom.spinUp.firstChild, 'disabled' );
					Utils.dom.removeClass( me._dom.spinDn.firstChild, 'disabled' );
				}
				me._dom.input.disabled = on;
			} );

			me._incrementer = new UI_Timer( 520 );
			me._decrementer = new UI_Timer( 520 );

			me._incrementer.on( 'tick', function() {
				me.doStep( 1 );
				// some acceleration
				if ( me._incrementer.frequency > 20 ) {
					me._incrementer.frequency -= 100;
				}
			} );

			me._decrementer.on( 'tick', function() {
				me.doStep( -1 );
				// some acceleration
				if ( me._decrementer.frequency > 20 ) {
					me._decrementer.frequency -= 100;
				}
			} );

			me.onDOMEvent( me._dom.spinUp, EEventType.MOUSE_DOWN, function( ev: Utils_Event_Mouse ) {
				if ( !me.disabled ) {
					me._decrementer.running = true;
					me.onDOMEvent( document.body, EEventType.MOUSE_UP, function( ev: Utils_Event_Mouse ) {
						me._decrementer.running = false;
						me._incrementer.running = false;
						me._decrementer.frequency = 520;
						me._incrementer.frequency = 520;
					}, true, true );
				}
			}, true );

			me.onDOMEvent( me._dom.spinDn, EEventType.MOUSE_DOWN, function( ev: Utils_Event_Mouse ) {
				if ( !me.disabled ) {
					me._incrementer.running = true;
					me.onDOMEvent( document.body, EEventType.MOUSE_UP, function( ev: Utils_Event_Mouse ) {
						me._decrementer.running = false;
						me._incrementer.running = false;
						me._decrementer.frequency = 520;
						me._incrementer.frequency = 520;
					}, true, true );
				}
			}, true );

			me.on( 'keydown', function( ev: Utils_Event_Keyboard ) {
				
				if ( me.disabled ) {
					return;
				}

				var code = ev.code,
				    key: string,
				    caretPosition: number,
				    strValue: string[],
				    newValue: string,
				    newNumber: number;

				switch ( code ) {
					case Utils.keyboard.KB_UP:
						if ( me.keyIncrement || ( ev.ctrlKey || ev.altKey || ev.shiftKey ) ) {
							me.doStep(-1);
							ev.preventDefault();
						}
						break;
					case Utils.keyboard.KB_DOWN:
						if ( me.keyIncrement || ( ev.ctrlKey || ev.altKey || ev.shiftKey ) ) {
							me.doStep(1);
							ev.preventDefault();
						}
						break;
					default:
						key = ev.keyName;
						caretPosition = Utils.dom.getCaretPosition( me._dom.input );
						
						if ( /^[\d\+\-\.]/.test( key ) && key.length == 1 ) {
							
							strValue = ( me._dom.input.value || '' ).split('');
							strValue.splice( caretPosition || 0, 0, key );
							newValue = strValue.join('');

							if ( !Utils.number.isFloat( newValue ) && ['.','+', '-' ].indexOf( newValue ) == -1 ) {
								ev.preventDefault();
								ev.stopPropagation();
								ev.handled = true;
							}

						} else {
							if ( key.length == 1 )
								ev.preventDefault();
						}

						

						break;
				}
			}, true );

			me.onDOMEvent( me._dom.input, EEventType.INPUT, function( ev: Utils_Event_Generic ) {

				if ( !me.disabled && !me.readOnly ) {
					
					// fix the precision.
					var t = me._dom.input.value.split('.');
					
					if ( t.length == 2 ) {
						if ( t[1].length > me._precision || me._precision == 0 ) {
							t[1] = t[1].slice( 0, me._precision );
							me._dom.input.value = t[1].length ? t[0] + '.' + t[1] : t[0];
						}
					}

					me.fire( 'change' );
				}
			}, true );

			me.onDOMEvent( me._root, EEventType.MOUSE_WHEEL, function( ev: Utils_Event_Mouse ) {
				if ( me.active && !me.readOnly && !me.disabled ) {
					me.doStep( ev.delta.y > 0 ? 1 : -1 );
					ev.preventDefault();
					ev.stopPropagation();
					ev.handled = true;
				}
			}, true );


		} )( this );
	}

}

Mixin.extend('UI_Spinner', 'MFocusable');

Constraint.registerClass( {
	"name": "UI_Spinner",
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
			"type": "number"
		},
		{
			"name": "readOnly",
			"type": "boolean"
		},
		{
			"name": "min",
			"type": "number"
		},
		{
			"name": "max",
			"type": "number"
		},
		{
			"name": "step",
			"type": "number"
		},
		{
			"name": "readOnly",
			"type": "boolean"
		}
	]
} );
