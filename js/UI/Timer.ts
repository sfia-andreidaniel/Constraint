class UI_Timer extends UI_Event {
	
	protected _running: boolean;
	private _tickId: number = 0;

	constructor( protected _frequency: number = 1 ) {
		super();
		this._running = false;
	}

	private tick( nextTick: number ) {
		
		if ( this._tickId == nextTick && this._running ) {
			
			this.fire('tick');
			this._tickId++;

			(function(me) {
				setTimeout(function() {
					me.tick(me._tickId);
				}, me._frequency);
			})(this);
		}
	}

	get running(): boolean {
		return this._running;
	}

	set running( on: boolean ) {
		on = !!on;
		if ( on != this._running ) {
			this._running = on;
			this._tickId++;
			if ( this._running ) {
				this.tick(this._tickId);
			}
		}
	}

	get frequency(): number {
		return this._frequency;
	}

	set frequency( frequency: number ) {

		frequency = ~~frequency;

		if ( frequency <= 0 ) {
			throw new Error('Frequency of a timer cannot be less or equal to 0');
		}

		this._frequency = frequency;
	}

}