class Store_View extends Store {

	protected _query: ( item: Store_Item ) => boolean;
	protected _owner: Store;
	private   _updater: UI_Throttler;
	private   _metaChanged: UI_Throttler;

	protected _isListening: boolean;
	
	// these two callbacks are binded to the master store.
	protected _changeFunc: ()      => void = null;
	protected _metaChangeFunc: ()  => void = null;


	constructor( owner: Store, query: ( item: Store_Item ) => boolean ) {
	    super( null );
	    this._owner = owner;
	    this._query = query;
	    
	    this.listen();
	}

	get readable(): boolean {
		return this._owner.readable;
	}

	get writable(): boolean {
		return this._owner.writable;
	}

	get autoID(): number {
		throw new Error('Function not supported by views');
	}

	get readLocks(): number {
		return this._owner.readLocks;
	}

	get writeLocks(): number {
		return this._owner.writeLocks;
	}

	protected sort( requestChange: boolean = true ) {
		throw new Error('Views does not support sorting');
	}

	public lock( write: boolean ) {
		this._owner.lock( write );
	}

	public unlock( write: boolean ) {
		this._owner.unlock( write );
	}

	public insert( data: any ): Store_Item {
		throw new Error( 'Views does not support insertion. Insert the items in their master store instead.' );
	}

	protected pivotInsert( left: number, right: number,item: Store_Item ) {
		throw new Error( 'Cannot compute pivot insertion' );
	}

	public itemAt(index: number): Store_Item {
		if ( index < 0 || index > this._length - 1 ) {
			throw new Error( 'Index out of bounds' );
		} else {
			return this._items[index];
		}
	}

	public remove( item: Store_Item ): Store_Item {
		throw new Error('Items cannot be removed from views' );
	}

	public removeUniqueId( id: any ) {
		throw new Error( 'Function not supported on views' );
	}

	public getElementById( id: any ): Store_Item {
		return super.getElementById( id );
	}

	public requestUpdate( $id: any, propertyName?: string ) {
		throw new Error( 'Views cannot request updates.' );
	}

	public requestChange() {
		super.requestChange();
	}

	public requestMetaChange() {
		super.requestMetaChange();
	}

	protected onBeforeChange() {
		console.log( 'onbeforechange...' );
	}

	public walk( callback: ( index: number ) => void, skip: number = 0, limit: number = null ): Store {
		return super.walk( callback, skip, limit );
	}

	public createQueryView( query: ( item: Store_Item ) => boolean ): Store_View {
		throw new Error('Views cannot create sub-views (or should?)' );
	}

	// starts listening to the store for events
	public listen() {

		if ( this._isListening )
			return;

		

	}


}