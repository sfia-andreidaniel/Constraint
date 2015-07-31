class Store_Cursor {

	protected skip   : number = 0;
	protected limit  : number = null;

	protected store: Store;
	
	constructor( store: Store, totalItems: number, skip: number = 0, limit: number = null ) {
		this.store = store;

		if ( skip < 0 ) {
			skip = totalItems + skip;
		}

		if ( skip < 0 ) {
			throw new Error( 'Index out of bounds' );
		}

		if ( limit === null ) {
			limit = totalItems - skip;
		} else {
			if ( limit + skip >= totalItems ) {
				limit = totalItems - skip;
			}
		}

		this.skip = skip;
		this.limit= limit;
	}

	public each( callback: ( index: number ) => void ): Store {

		var cursor: Store2_Item,
		    i: number,
		    len: number;

		for ( i = this.skip, len = this.skip + this.limit; i < len; i++ ) {
			cursor = this.store.itemAt( i );
			callback.call( cursor, i );
		}

		return this.store;

	}
}