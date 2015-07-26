class Store_NestedObjects extends Store_NamedObjects {
	
	constructor( values: INestable[] ) {
		super( values );
		this.sorted = true;
	}

	public create( payload: INestable ): Store_Item {
		return new Store_Item_NestableObject( payload, this );
	}

	public compare( a: Store_Item_NestableObject, b: Store_Item_NestableObject ): number {
		
		var aName: string = this.caseSensitive ? a.data.name : a.data.name.toLowerCase(),
		    bName: string = this.caseSensitive ? b.data.name : b.data.name.toLowerCase();

		if ( a.depth == b.depth ) {

			if ( a.parentId == b.parentId ) {

				return aName == bName
					? 0
					: ( aName < bName ? -1 : 1 );

			} else {

				return this.compare( a.parent, b.parent );

			}

		} else {

			if ( b.contains( a ) ) {
				return 1;
			} else {
			
				// a and b are on different levels

				if ( a.depth < b.depth ) {

					return this.compare( a, b.getParentByDepth( a.depth ) );

				} else {

					return this.compare( a.getParentByDepth( b.depth ), b );
				
				}

			}

		}
	}
}