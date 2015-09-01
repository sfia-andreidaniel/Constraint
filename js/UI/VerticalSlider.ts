/**
 * An UI_VerticalSlider is an input from which the user can select a value from
 * a range of values by dragging or using it's keyboard arrows.
 *
 * Representation of a standard UI_VerticalSlider:
 *
 * ![slider2](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_VerticalSlider-active.png "UI_VerticalSlider")
 *
 * A disabled UI_VerticalSlider input:
 *
 * ![slider](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_VerticalSlider-disabled.png "UI_VerticalSlider disabled")
 *
 */

class UI_VerticalSlider extends UI implements IInput, IFocusable {
	
	public static _theme = {
		defaults: {
			width: $I.number('UI.UI_Slider/defaults.width'),
			height: $I.number('UI.UI_Slider/defaults.height')
		},
		thumb: {
			size: 10
		}
	};

	public    active: boolean; // the active is overrided by the MFocusable mixin
	public    wantTabs: boolean = false;
	public    tabIndex: number = 0;
	public    includeInFocus: boolean = true;

	protected orientation: EOrientation = EOrientation.VERTICAL;

	protected _min: number = 0;
	protected _max: number = 100;
	protected _steps: number = 100;
	protected _value: number = 0;
	protected _thumbPosition: number = 0;

	protected _dom = {
		thumb: Utils.dom.create( 'div', 'thumb' )
	};

	constructor( owner: UI ) {
	    super( owner, [ 'IInput', 'IFocusable' ], Utils.dom.create('div', 'ui UI_Slider') );
	    this._root.appendChild( this._dom.thumb );
	    this._initDom_();
	    this._setupKeyboard_();
	    this._setupMouse_();
	}

	/**
	 * Returns the size of the track, without the size of the thumb
	 */
	get trackSize(): number {
		return this.clientRect.height - UI_VerticalSlider._theme.thumb.size;
	}

	/**
	 * Returns the minimum legal value of the input
	 */
	get min(): number {
		return this._min;
	}

	set min( value: number ) {
		value = ~~value;
		if ( value != this._min ) {
			this._min = value;
			this.value = this.value;
		}
	}

	/**
	 * Returns the maximum legal value of the input
	 */
	get max(): number {
		return this._max;
	}

	set max( value: number ) {
		value = ~~value;
		if ( value != this._max ) {
			this._max = value;
			this.value = this.value;
		}
	}

	/**
	 * Returns the total number of divisions in which the range (min..max) should be divided. The step value
	 * of the input is computed according to total number of steps.
	 */
	get steps(): number {
		return this._steps;
	}

	set steps( steps: number ) {
		steps = ~~steps;
		if ( steps < 1 ) {
			steps = 1;
		}
		if ( steps != this._steps ) {
			this._steps = steps;
			this.onRepaint();
		}
	}

	/**
	 * Returns the size of a single step.
	 */
	get stepSize(): number {
		return Math.abs( ( this.max - this.min ) / this.steps );
	}

	/**
	 * Returns the value of the input
	 */
	get value(): number {
		return ~~this._value;
	}

	set value( value: number ) {
		value = parseFloat( String( value ) );

		if ( isNaN( value ) )
			value = this._min;
		
		if ( value < this._min ) {
			value = this._min;
		}
		
		if ( value > this._max ) {
			value = this._max;
		}

		if ( value != this._value ) {
			this._value = value;
			// compute the thumb position in percents.
			this.onRepaint();
		}
	}

	/**
	 * Returns the current step position of the input
	 */
	get step(): number {
		return ( ( this._value - this._min ) / ( ( this._max - this._min ) / this._steps ) );
	}

	set step( step: number ) {
		step = ~~step;
		this.value = this._min + this.stepSize * step;
	}

	/**
	 * Internal.
	 */
	protected set thumbPosition( pos: number ) {
		this._dom.thumb.style.marginTop = ~~pos + "px";
		this._thumbPosition = ~~pos;
	}

	/**
	 * Internal.
	 */
	private moveThumb( byDelta: number ): number {
		
		var step: number,
		    prevThumbPosition: number = this._thumbPosition;

		this._thumbPosition += byDelta;

		step = Math.round( this._thumbPosition / ( this.trackSize / this.steps ) );

		this.step = step;

		return this._thumbPosition - prevThumbPosition;

	}

	/**
	 * @Overrides UI.onRepaint. Overriding is needed in order to position the thumb in the input.
	 */
	public onRepaint(): boolean {
		if ( super.onRepaint() ) {
			// place the thumb
			this.thumbPosition = this.trackSize / this.steps * this.step;
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Setups keyboard events. Internal.
	 */
	protected _setupKeyboard_() {
		( function( me ) {

			me.on( 'keydown', function( ev: Utils_Event_Keyboard ) {
				if ( me.disabled ) {
					return;
				}

				var code: number = ev.code;

				switch ( code ) {
					case Utils.keyboard.KB_LEFT:
						if ( me.orientation == EOrientation.HORIZONTAL ) {
							me.step--;
							me.fire( 'change' );
						}
						break;
					case Utils.keyboard.KB_RIGHT:
						if ( me.orientation == EOrientation.HORIZONTAL ) {
							me.step++;
							me.fire( 'change' );
						}
						break;
					case Utils.keyboard.KB_UP:
						if ( me.orientation == EOrientation.VERTICAL ) {
							me.step--;
							me.fire( 'change' );
						}
						break;
					case Utils.keyboard.KB_DOWN:
						if ( me.orientation == EOrientation.VERTICAL ) {
							me.step++;
							me.fire( 'change' );
						}
						break;
					case Utils.keyboard.KB_HOME:
						me.value = me.min;
						me.fire( 'change' );
						break;
					case Utils.keyboard.KB_END:
						me.value = me.max;
						me.fire( 'change' );
						break;

				}

			} );

		} )( this );
	}

	/**
	 * Setups mouse events. Internal.
	 */
	protected _setupMouse_() {
		
		( function( me ) {

			var point: IPoint = {
				x: 0,
				y: 0
			};

			me.onDOMEvent( me._dom.thumb, EEventType.MOUSE_DOWN, function( ev: Utils_Event_Mouse ) {

				if ( me.disabled || ev.which != 1 ) {
					return;
				}

				var mouseMove: Utils_Event_Unbinder = me.onDOMEvent( document.body, EEventType.MOUSE_MOVE, function( ev: Utils_Event_Mouse ) {
					
					var x: number = ev.page.x,
					    y: number = ev.page.y,
					    deltaX: number = x - point.x,
					    deltaY: number = y - point.y,
					    delta: number = me.orientation == EOrientation.HORIZONTAL ? deltaX : deltaY;

					if ( delta == 0 || me.disabled ) {
						return;
					}

					if ( delta = me.moveThumb( delta ) ) {
						if ( me.orientation == EOrientation.HORIZONTAL ) {
							point.x += delta;
						} else {
							point.y += delta;
						}
						me.fire( 'change' );
					}

				}, true );
				
				me.onDOMEvent( document.body, EEventType.MOUSE_UP, function( ev: Utils_Event_Mouse ) {
					mouseMove.remove();
					mouseMove = undefined;
				}, true, true );

				point = ev.page;

			}, true );

		} )( this );

	}

	/**
	 * Initializez the input according to it's defaults.
	 */
	protected _initDom_() {
		this.width = UI_VerticalSlider._theme.defaults.width;
		this.height= UI_VerticalSlider._theme.defaults.height;
	}

}

Mixin.extend( 'UI_VerticalSlider', 'MFocusable' );

Constraint.registerClass( {
	"name": "UI_VerticalSlider",
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
			"name": "min",
			"type": "number"
		},
		{
			"name": "max",
			"type": "number"
		},
		{
			"name": "steps",
			"type": "number"
		},
		{
			"name": "step",
			"type": "number"
		}
	]
} );