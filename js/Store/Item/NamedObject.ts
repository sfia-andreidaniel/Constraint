class Store_Item_NamedObject extends Store_Item_Object {
	
	constructor( payload: INameable, owner: Store ) {
		super( payload, owner );
	}

	get data(): any {
		return this._data;
	}

	set data( payload: any ) {
		payload = payload || {};
		
		payload.id = this._id;
		payload.name = String(payload.name || '');

		this._data = payload;
		this.onUpdate();
		this.onChange();
	}

	get name(): string {
		return this._data.name;
	}

	set name( name: string ) {
		if ( name != this._data.name ) {
			this._data.name = String( name || '' );
			this.onUpdate();
			this.onChange();
		}
	}

}