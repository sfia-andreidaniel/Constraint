class Store_Item {

	protected _data: any;
	protected _id: any;
	protected _owner: Store;
	protected _dead: boolean;
	protected _selected: boolean;


	constructor( payload: any, _id: any, owner: Store ) {
		this._data = payload;
		this._id = _id;
		this._owner = owner;
	}

	public onChange() {
		if ( !this._dead ) {
			this._owner.onChange();
		}
	}

	public onUpdate() {
		if ( !this._dead ) {
			this._owner.fire( 'update', this._id );
		}
	}

	public onMetaChanged() {
		if ( !this._dead ) {
			this._owner.fire( 'meta-changed' );
		}
	}

	public onRemove() {
		this.die();
	}

	// Returns the item unique id
	get id(): any {
		return this._id;
	}

	get data(): any {
		return this._data;
	}

	set data( payload: any ) {

		this._data = payload;

		if ( !this._dead ) {
			this.onUpdate();
			this.onChange();
		}
	}

	public die() {
		this._dead = true;
	}

	get selected(): boolean {
		return !!this._selected;
	}

	set selected( selected: boolean ) {
		selected = !!selected;
		if ( selected != this._selected ) {
			this._selected = selected;
			this.onMetaChanged();
		}
	}

}