class Store_Strings extends Store {
	
	protected _caseSensitive: boolean = false;

	constructor( values: string[] ) {
		super( values );
	}

	public create( payload: string ): Store_Item {
		return new Store_Item_String( payload, this.autoIncrement, this );
	}

	public compare( a: Store_Item, b: Store_Item ): number {
		var lcA: string, lcB: string;
		if ( this._caseSensitive ) {
			lcA = String( a.data || '' );
			lcB = String( b.data || '' );
		} else {
			lcA = String( a.data || '' ).toLowerCase();
			lcB = String( b.data || '' ).toLowerCase();
		}

		return lcA == lcB ? 0 : ( lcA < lcB ? -1 : 1 );
	}

	get caseSensitive(): boolean {
		return this._caseSensitive;
	}

	set caseSensitive( sensitive: boolean ) {
		sensitive = !!sensitive;
		if ( sensitive != this._caseSensitive ) {
			this._caseSensitive = sensitive;
			this.ensureSorted();
		}
	}

}