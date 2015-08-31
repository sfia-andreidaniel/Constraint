class Utils_Event_Keyboard extends Utils_Event_Generic {

	public static createFrom( ev: any ): Utils_Event_Keyboard {
		ev = ev || {};
		ev.keyCode = typeof ev.keyCode == 'undefined' ? null : ev.keyCode;
		ev.charCode = typeof ev.charCode == 'undefined' ? null : ev.charCode;
		ev.ctrlKey = typeof ev.ctrlKey == 'undefined' ? false : ev.ctrlKey;
		ev.altKey = typeof ev.altKey == 'undefined' ? false : ev.altKey;
		ev.shiftKey = typeof ev.shiftKey == 'undefined' ? false : ev.shiftKey;
		ev.preventDefault = ev.preventDefault || function() {};
		ev.stopPropagation = ev.stopPropagation || function() {};
		return new Utils_Event_Keyboard( <KeyboardEvent>ev, null );
	}

	constructor( e: any, unbinder: Utils_Event_Unbinder = null ) {
		super(e, unbinder);
	}

	get code(): number {
		return this.event.keyCode || this.event.charCode;
	}

	get keyName(): string {
		return Utils_Keyboard.eventToString(this.event);
	}

}