class Store_Item_Object extends Store_Item {
	
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


}