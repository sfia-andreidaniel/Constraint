class Store_View extends Store {

	protected _query: FTraversor;
	protected _owner: Store;

	protected _isListening: boolean;
	
	// these two callbacks are binded to the master store.
	protected _changeFunc: ()      => void = null;
	protected _metaChangeFunc: ()  => void = null;
	protected _treeChangeFunc: ()  => void = null;

	constructor( owner: Store, query: FTraversor ) {
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

	protected pivotInsert( left: number, right: number,item: Store_Item ): number {
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
		throw new Error( 'Command not supported on views' );
	}

	public requestMetaChange() {
		throw new Error( 'Command not supported on views' );
	}

	protected onBeforeChange() {
		console.log( 'onbeforechange...' );
	}

	// starts listening to the store for events
	public listen() {

		if ( this._isListening )
			return;

		( function( self ) {

			self._changeFunc = function() {
				self.update();
			}

			self._metaChangeFunc = function(  ) {
				self.update(true);
			}

			self._treeChangeFunc = function() {
				self.update(true);
			}

		} )( this );

		this._owner.on( 'change', this._changeFunc );
		this._owner.on( 'meta-changed', this._metaChangeFunc );
		this._owner.on( 'tree-changed', this._treeChangeFunc );

		this._isListening = true;

		this.update();

	}

	public stopListening() {
		if ( !this._isListening ) {
			return;
		}

		this._owner.off( 'change', this._changeFunc );
		this._owner.off( 'meta-changed', this._metaChangeFunc );
		this._owner.off( 'tree-changed', this._treeChangeFunc );

		this._metaChangeFunc = undefined;
		this._changeFunc = undefined;
		this._treeChangeFunc = undefined;
		
		this._isListening = false;
	}

	private update( force: boolean = false ) {
		
		if ( !this.readable ) {
			return;
		}

		this.fire( 'before-update' );
		
		var _oldLength: number = this._length,
		    _nowIndex: number = 0,
		    fireChange: boolean = false;

		this._length = 0;
		this._map.clear();

		( function( self ) {

			function aggregate( item: Store_Item ) {

				self._map.set( item.id, item );

				if ( item != self._items[ self._length ] ) {
					self._items[ self._length ] = item;
					fireChange = true;
				}

				self._length++;

			}

			self._owner.walk( self._query, 0, null, aggregate );

		} )( this );
			
		if ( this._length != _oldLength || fireChange || force ) {
			this._items.length = this._length;
			this.fire( 'change' );
		}
	}

	public canEditProperty( item: Store_Item, propertyName: string ): boolean {
		return this._owner.canEditProperty( item, propertyName );
	}

}