class Store_Objects extends Store {

	constructor( values: IIdentifiable[] ) {
		super( values );
		this.allowDuplicates = false;
	}

	public create( payload: IIdentifiable ): Store_Item {
		return new Store_Item_Object( payload, this );
	}

	public compare( a: Store_Item_Object, b: Store_Item_Object ) {
		return a.id == b.id
			? 0
			: -1;
	}

	public ensureNoDuplicates() {
		var i: number,
		    j: number;
		
		if  ( this._length > 1 ) {

			for ( i=0; i < this._length; i++ ) {
				for ( j=0; j < this._length; j++ ) {
					if ( i != j && this._items[i].id == this._items[j].id ) {
						throw new Error( 'Duplicate items not allowed in this store!' );
					}
				}
			}
		}
	}


}