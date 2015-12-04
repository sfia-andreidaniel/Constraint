class Utils_Event_Generic {

	private _handled: boolean;

	constructor( protected event: any, protected _unbinder: Utils_Event_Unbinder ) {
	}

	/**
	 * Did the event was handled?
	 */
	get handled(): boolean {
		return !!this._handled;
	}

	/**
	 * Sets weather the event was handled or not. If the event was previously
	 * handled, this property becomes imutable.
	 */
	set handled( on: boolean ) {
		on = !!on;
		if ( !!!this._handled ) {
			if ( on != !!this._handled ) {
				this._handled = on;
			}
		}
	}

	get removed(): boolean {
		return this._unbinder ? this._unbinder.removed : null;
	}

	get ctrlKey(): boolean {
		return !!this.event.ctrlKey;
	}

	get altKey(): boolean {
		return !!this.event.altKey;
	}

	get shiftKey(): boolean {
		return !!this.event.shiftKey;
	}

	get target(): HTMLElement {
		return this.event.target || this.event.srcElement || null;
	}

	public remove(): Utils_Event_Generic {
		if ( this._unbinder ) {
			this._unbinder.remove();
		}

		return this;
	}

	public abort() {
		this.preventDefault();
		this.stopPropagation();
	}

	public preventDefault() {
		try {
			this.event.preventDefault();
		} catch(e) {}
	}

	public stopPropagation() {
		try {
			this.event.stopPropagation();
		} catch(e) {}
	}

	public get originalEvent(): any {
		return this.event;
	}

}