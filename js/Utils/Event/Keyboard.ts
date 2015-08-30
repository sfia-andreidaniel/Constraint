class Utils_Event_Keyboard extends Utils_Event_Generic {

	constructor( e: KeyboardEvent, unbinder: Utils_Event_Unbinder = null ) {
		super(e, unbinder);
	}

	get code(): number {
		return this.event.keyCode || this.event.charCode;
	}

	get keyName(): string {
		return Utils_Keyboard.eventToString(this.event);
	}

}