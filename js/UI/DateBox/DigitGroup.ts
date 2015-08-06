class UI_DateBox_DigitGroup {
	
	private value: number = null;
	public  index: number = 0;

	constructor( private minValue: number, private maxValue: number, private mask: string, public ending: string, public datePart: EDatePart ) {}

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
		
		var i: number = ~~ch;

		if ( ch == null ) {
			this.value = null;
			return true;
		} else {
			if ( !/[\d]/.test(ch) ) {
				return false;
			}
			this.value = ( this.value || 0 ) * 10 + i;
			while ( this.value > this.maxValue ) {
				this.value = parseInt( this.value.toString().substr(1) );
				if ( this.value == 0 ) {
					break;
				}
			}
			return true;
		}

	}

	public setValue( value: number ) {
		this.value = value === null ? null : ~~value;
	}

}