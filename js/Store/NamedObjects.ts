class Store_NamedObjects extends Store_Objects {

	protected _caseSensitive: boolean = true;

	constructor( values: INameable[] ) {
		super( values );
		this.allowDuplicates = false;
	}

	public create( payload: INameable ): Store_Item {
		return new Store_Item_NamedObject( payload, this );
	}

	public compare( a: Store_Item_NamedObject, b: Store_Item_NamedObject ) {
		var lcA: string, lcB: string;
		if ( this._caseSensitive ) {
			lcA = String( a.data.name || '' );
			lcB = String( b.data.name || '' );
		} else {
			lcA = String( a.data.name || '' ).toLowerCase();
			lcB = String( b.data.name || '' ).toLowerCase();
		}
		return lcA == lcB
			? 0
			: ( lcA < lcB ? -1 : 1 );
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