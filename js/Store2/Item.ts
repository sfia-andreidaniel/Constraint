class Store2_Item {
	
	public    data  : any;
	protected $store : Store2;
	protected $id   : any;

	constructor( data: any, store: Store2, $id: any ) {
		this.data = data;
		this.$store = store;
		this.$id = $id;
	}

	public compare( otherItem: Store2_Item ): number {
		return this.$store.$sorter ? this.$store.$sorter( this.data, otherItem.data ) : 1;
	}

	public get( propertyName: string ): any {
		return this.data ? this.data[ propertyName ] : undefined;
	}

	public set( propertyName: string, value: any ) {
		
	}
}