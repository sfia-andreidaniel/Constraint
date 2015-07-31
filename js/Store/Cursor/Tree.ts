class Store_Cursor_Tree extends Store_Cursor {
	
	private _visited: Store_Map;

	constructor( store: Store_Tree, totalItems: number, skip: number = 0, limit: number = null ) {
		super( <Store>store, totalItems, skip, limit );
		this._visited = new Store_Map();
	}

	public each( callback: ( index: number ) => void ): Store {

		var index: number = 0,
		    jump   : number = this.skip,
		    skip   : number = this.skip,
		    called : number = 0,
		    limit  : number = this.limit;

		function traverse( arr: Store_Node[] ) {
			
			var i: number,
			    len: number;

			for ( i=0, len = arr.length; i<len; i++ ) {
				
				// fast forward?
				if ( jump >= ( arr[i].lengthDepth + 1 ) ) {

					index += ( arr[i].lengthDepth + 1 );
					jump  -= ( arr[i].lengthDepth + 1 );
				
					//console.log( 'fast forward: ', arr[i].lengthDepth + 1, 'jumped = ', jump, 'index = ', index );

				} else {
					
					if ( called < limit ) {

						if ( jump == 0 ) {
							callback.call( arr[i], index );
							index++;
							called++;
						} else {
							jump--;
							index++;
							//console.log( 'slow forward: ', arr[i].lengthDepth + 1, 'jumped = ', jump, 'index = ', index );
						}

						if ( called > limit ) {
							//console.log( 'called > limit: ', called, limit );
							return;
						}

						if ( arr[i].length ) {
							traverse( arr[i].childNodes );
						}

						if ( called > limit ) {
							//console.log( 'called > limit: ', called, limit );
							return;
						}

					} else {
						//console.log( 'else?' );
						return;
					}
				}
			}

		}

		traverse( <Store_Node[]>this.store.items );

		return this.store;

	}
}