/**
 * Timer class, which emits a "tick" event on a specified time interval in miliseconds.
 * This class can be used for animations and other timed stuff.
 */
class UI_Timer extends UI_Event {
	
	protected _running: boolean;
	private _tickId: number = 0;

	/**
	 * @param _frequency - The frequency in miliseconds on which the timer should emit the "tick" event.
	 */
	constructor( protected _frequency: number = 1 ) {
		super();
		this._running = false;
	}

	/**
	 * Emits the tick. Internal.
	 */
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

	/**
	 * Returns true if the timer is running ( is emitting the "tick" event )
	 */
	get running(): boolean {
		return this._running;
	}

	/**
	 * Pauses or unpauses the timer.
	 * @param on - when true, timer is running, when false - timer is paused.
	 */
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

	/**
	 * Returns the frequency in miliseconds on which the timer is emitting the "tick".
	 */
	get frequency(): number {
		return this._frequency;
	}

	/**
	 * Sets the frequency in miliseconds of the timer.
	 */
	set frequency( frequency: number ) {

		frequency = ~~frequency;

		if ( frequency <= 0 ) {
			throw new Error('Frequency of a timer cannot be less or equal to 0');
		}

		this._frequency = frequency;
	}

}