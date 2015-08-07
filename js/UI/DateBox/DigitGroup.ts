class UI_DateBox_DigitGroup {
	
	private _value: number = null;
	private _active: boolean = false;
	public  index: number = 0;

	private _dom = {
		node: Utils.dom.create('div','group'),
		value: Utils.dom.create('span', 'value'),
		ending: Utils.dom.create('span', 'ending')
	};

	constructor( private minValue: number, private maxValue: number, private mask: string, public _ending: string, public datePart: EDatePart, public owner: UI_Event ) {
		this._dom.node.appendChild(this._dom.value);
		this._dom.node.appendChild(this._dom.ending);
		this.value = null;
		( function( me ) {
			me._dom.value.addEventListener('mousedown', function() {
				me.owner.fire( 'focus-group', me.index );
			} );
			me._dom.value.addEventListener('mousewheel', function( ev ) {
				me.owner.fire( 'wheel-group', ( ev.deltaY || -ev.wheelDeltaY ) < 0 ? -1 : 1, me.index );
			}, false );
		} )( this );
	}

	get node(): HTMLDivElement {
		return this._dom.node;
	}

	get ending(): string {
		return this._ending;
	}

	set ending( ending: string ) {
		this._dom.ending.textContent = this._ending = String( ending || '' );
	}

	get value(): number {
		return this._value;
	}

	set value( v: number ) {
		this._value = v == null ? null : ~~v;
		this._dom.value.textContent = String( this._value === null ? this.mask : Utils.string.pad( this._value, this.mask.length, '0', EStrPadding.LEFT ) );
	}

	get active(): boolean {
		return this._active;
	}

	set active( on: boolean ) {
		on = !!on;
		
		if ( on != this._active ) {
			
			this._active = on;

			switch ( on ) {
				case true:
					Utils.dom.addClass( this._dom.value, 'on' );
					break;
				default:
					Utils.dom.removeClass( this._dom.value, 'on' );
					break;
			}
		}
	}

	public toString(): string {
		return ( 
				this.value === null 
					? this.mask 
					: Utils.string.pad( this.value, this.mask.length, '0', EStrPadding.LEFT ) 
				) 
				+ this.ending;
	}

	get valid(): boolean {
		return this.value !== null 
				&& this.value >= this.minValue 
				&& this.value <= this.maxValue;
	}

	get length(): number {
		return this.mask.length;
	}

	public increment() {
		if ( this.value === null ) {
			this.value = this.minValue;
		} else {
			this.value++;
			if ( this.value > this.maxValue ) {
				this.value = this.minValue;
			}
		}
	}

	public decrement() {
		if ( this.value === null ) {
			this.value = this.maxValue;
		} else {
			this.value--;
			if ( this.value < this.minValue ) {
				this.value = this.maxValue;
			}
		}
	}

	public addChar( ch: string ): boolean {
		
		var i: number = ~~ch,
		    value: number;

		if ( ch == null ) {
			this.value = null;
			return true;
		} else {
			if ( !/[\d]/.test(ch) ) {
				return false;
			}
			value = this.value;

			value = ( value || 0 ) * 10 + i;
			while ( value > this.maxValue ) {
				value = parseInt( value.toString().substr(1) );
				if ( value == 0 ) {
					break;
				}
			}

			this.value = value;

			return true;
		}

	}

	public setValue( value: number ) {
		this.value = value === null ? null : ~~value;
	}

}