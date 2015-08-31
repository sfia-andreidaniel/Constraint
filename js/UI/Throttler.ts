/**
 * The UI_Throttler class is used to limit a function call to one single call, in a specified
 * time interval given in miliseconds. Throttlers are usefull on UI painting, in order to limit
 * anchors computing and other heavy computational stuff.
 */
class UI_Throttler extends UI_Event {
	
	/**
	 * Last Date.now() time the throttler function has been executed.
	 */
	public  lastRun: number = 0;

	/**
	 * Next Date.now() time the function is allowed to be executed again.
	 */
	public  nextRun: number = null;

	/**
	 * The interval that we're using to limit the throttler function call
	 */
	public  frequency: number = 1;

	/**
	 * The callback that is throttled.
	 */
	public  callback: ( ...args ) => void = null;

	/**
	 * Constructor.
	 * @param callbackFunction - The function that the throttler is limiting.
	 * @param frequency - The interval of time ( in milliseconds ) that the throttler is limiting the function to one single call.
	 */
	constructor( callbackFunction: ( ...args ) => void, frequency: number = 1 ) {
		super();

		this.frequency = frequency;
		this.nextRun = null;
		this.lastRun = Date.now();
		this.callback = callbackFunction;

	}

	/**
	 * Indirectly runs the throttler callback function, filtering the calls to once per throttler frequency.
	 */
	public run(): void {
		var now: number = 0,
		    self = this;

		if ( this.nextRun != null ) {
			// a run is already scheduled in the future.
			return;

		} else {
			now = Date.now();
			
			this.lastRun += this.frequency;

			if ( this.lastRun < now ) {
				// run immediately
				this.lastRun = now;
				this.nextRun = this.lastRun + this.frequency;

				setTimeout( function() {
					self.callback();
					self.nextRun = null;
				}, this.nextRun - this.lastRun );
				

			} else {
				// run in the future
				this.nextRun = this.lastRun + this.frequency;

				setTimeout( function() {
					self.callback();
					self.nextRun = null;
				}, this.nextRun - this.lastRun );
			}

		}
	}

}