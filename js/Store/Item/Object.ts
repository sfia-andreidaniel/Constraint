class Store_Item_Object extends Store_Item {
	
	protected _selected: boolean;

	constructor( payload: IIdentifiable, owner: Store ) {
		super( payload, payload.id, owner );
	}

	get data(): any {
		return this._data;
	}

	set data( payload: any ) {
		payload = payload || {};
		payload.id = this._id;

		this._data = payload;
		this._owner.fire( 'update', this._id );
		this._owner.onChange();
	}

	get selected(): boolean {
		return !!this._selected;
	}

	set selected( selected: boolean ) {
		selected = !!selected;
		if ( selected != this._selected ) {
			this._selected = selected;
			if ( !this._dead ) {
				this._owner.fire('meta-changed');
			}
		}
	}



}