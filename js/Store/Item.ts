class Store_Item {

	protected _data: any;
	protected _id: any;
	protected _owner: Store;

	constructor( payload: any, _id: any, owner: Store ) {
		this._data = payload;
		this._id = _id;
		this._owner = owner;
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
		this._owner.fire( 'update', this._id );
		this._owner.fire( 'change' );
	}


}