class Utils_Event_Unbinder {
	
	private _removed: boolean;
	public onRemove: () => void = null;

	constructor( private eventTarget: any, private eventName: string, private eventCallback: (e: any) => void, private eventPhase: boolean ) {
	}

	get removed(): boolean {
		return !!this._removed;
	}

	get target(): any {
		return this.eventTarget || undefined;
	}

	get name(): string {
		return this.eventName;
	}

	get callback(): ( e: any ) => void {
		return this.eventCallback;
	}

	get phase(): boolean{
		return this.eventPhase;
	}

	public remove() {
		if ( !this.removed ) {
			this.eventTarget.removeEventListener(this.eventName, this.eventCallback, this.eventPhase);
			this.eventTarget = undefined;
			this._removed = true;
			if ( this.onRemove ) {
				this.onRemove();
				this.onRemove = undefined;
			}
		}
	}
}