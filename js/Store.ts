class Store extends UI_Event {

	// an auto increment id value, that is used when the name of the unique key of the
	// objects of the store is null.
	private   _autoID      : number = 0;
	
	// the name of the unique key in the objects in the store.
	protected _id          : string = null;

	// the place where we store the items in the store.
	protected _items       : Store_Item[] = [];
	
	// length of the store. we use the length separately, because accessing the
	// this._items.length is much slower.
	protected _length      : number = 0;

	// the map that is used for storing the unique key bindings
	protected _map         : Store_Map;

	// number of write locks
	private   _wr_locks    : number = 0;

	// number of read locks
	private   _rd_locks    : number = 0;

	// a throttler that is limiting the number of "change" to a rate of 1ms.
	private   _onchanged     : UI_Throttler;
	private   _onmetachanged : UI_Throttler;

	// we keep tracking on the keys that were updated on the store, in order
	// to fire the sorting before actually firing the "change" event in this map.
	// also, when an insertion is made, we set the "__insertion__" property
	// to true in this map.
	// this way, we avoid unnecesarry sorting.
	protected   _sorting     : Store_Map;
	
	// the function that is used for sorting.
	public  $sorter : ( a: any, b: any ) => number = null;

	// the fields that are afecting the sorting.
	private $sortFields: ISortOption[];

	// @uniqueKeyName: the name of the "id" key.
	constructor( uniqueKeyName: string = "id" ) {
		super();
		this._id      = uniqueKeyName || null;
		this._map     = new Store_Map();
		this._sorting = new Store_Map();
		
		( function( me ) {
			me._onchanged = new UI_Throttler( function() { me.onBeforeChange(); }, 1 );
			me._onmetachanged = new UI_Throttler( function() { me.fire('meta-changed'); }, 1 );
		} )( this );

	}

	public fire( eventName: string, ...args ) {
		if ( [ 'change', 'meta-changed', 'before-change', 'death' ].indexOf( eventName ) == -1 ) {
			throw new Error('Bad store event ' + eventName );
		} else
		super.fire( eventName, args );
	}

	// returns the next auto-id increment
	get autoID(): number {
		return ++this.autoID;
	}

	set sorter( options: ISortOption[] ) {
		this.$sorter = options ? Store_Sorter.create( this.$sortFields = options ) : ( this.$sortFields = null );
		/* sort items */
		this.sort();
	}

	get readable(): boolean {
		return this._wr_locks == 0;
	}

	get readLocks(): number {
		return this._rd_locks;
	}

	get writable(): boolean {
		return this._rd_locks == 0 && this._wr_locks == 0;
	}

	get writeLocks(): number {
		return this._wr_locks;
	}

	get items(): Store_Item[] {
		return this._items;
	}

	get isTree(): boolean {
		return false;
	}

	// sorts the rows in the store.
	protected sort( requestChange: boolean = true ) {
		if ( this.$sorter && this._length ) {
			
			this._items.sort( function( a: Store_Item, b: Store_Item ): number {
				return a.compare(b);
			});

			if ( requestChange )
				this.requestChange();
		}
	}

	// locks the store ( write-true for writing, otherwise for reading)
	public lock( write: boolean ) {
		if ( write ) {
			this._wr_locks++;
			this._rd_locks++;
		} else {
			this._rd_locks++;
		}
	}

	// unlocks the store.
	// @write - true: unlocks from writing
	// @write - false: unlocks from reading
	public unlock( write: boolean ) {
		if ( write ) {
			if ( this._wr_locks > 0 ) {
				this._wr_locks--;
				if ( this._wr_locks == 0 ) {
					/* Do sorting @ this point */
					if ( this.$sorter ) {
						this.sort();
					}
				}
			}
		}
		if ( this._rd_locks > 0 ) {
			this._rd_locks--;
		}
	}

	// inserts data in the store. returns an instance of the
	// item.
	public insert( data: any ): Store_Item {
		
		var id: any,
		    i: number = 0,
		    index: number = null;

		if ( this._id === null ) {

			id = this.autoID;

		} else {

			id = ( data && Store_Map.validKey( data[ this._id ] ) ) ? data[ this._id ] : null;

			if ( id === null ) {
				throw new Error( 'Failed to read $id property "' + this._id + '" from item' );
			}

		}

		if ( this._map.has( id ) ) {
			throw new Error( 'Duplicate primary key: ' + id );
		}

		var item = new Store_Item( data, this, id );

		this._map.set( id, item );

		if ( this.$sorter && this._wr_locks == 0 ) {

			index = this.pivotInsert( 0, this._length - 1, item );

		}

		if ( index === null ) {
			this._items.push( item );
		} else {
			this._items.splice( index, 0, item );
		}

		this._length++;

		this._sorting.set( '__insertion__', true );

		if ( this._wr_locks == 0 )
		this.requestChange();

		return item;

	}

	// @items:            an array containing the items for the store.
	// @isNested:         indicating that the structure is a nested one.
	//                    This argument is used by Store_Tree class, and
	//                    ignored by the Store class.
	// @childrenKeyName:  indicating the name of the "children" array
	//                    of the nested structure.

	public setItems( items: any, fromNested: boolean = false, childrenKeyName: string = 'children' ) {
		items = items || [];

		var i: number,
		    len: number = ~~items.length;

		this.clear();

		if ( len ) {
			this.lock(true);

			for ( i=0; i<len; i++ ) {
				this.insert( items[i] );
			}

			this.unlock(true);
		}

		this.requestChange();
	}

	// used to determine where to insert the item in the store
	protected pivotInsert( left: number, right: number, item: Store_Item ): number {
		if ( left >= right ) {
			return left;
		} else {
			var mid: number = ~~( ( left + right ) / 2 ),
			    cmp: number = this._items[mid].compare( item );

			if ( cmp == 0 ) {
				return mid;
			} else {
				if ( cmp < 0 ) {
					return this.pivotInsert( left, mid - 1, item );
				} else {
					return this.pivotInsert( mid + 1, right, item );
				}
			}

		}
	}

	// returns the item @ position index in the store.
	public itemAt( index: number ): Store_Item {
		if ( this._wr_locks > 0 ) {
			throw new Error( 'Store is locked for writing!' );
		}
		if ( index < 0 || index > this._length - 1 ) {
			throw new Error( 'Index out of bounds' );
		} else {
			return this._items[index];
		}
	}

	// removes an item from the store. note that if you want
	// to remove all items from the store, the "clear" method
	// is much way faster.
	public remove( item: Store_Item ): Store_Item {
		
		if ( this.writable ) {
			
			var index: number = this._items.indexOf( item );
			
			if ( index > -1 ) {

				this._items.splice( index, 1 );
				this._length--;

				item.die();

				this.requestChange();
			}

			return item;

		} else {
		
			throw new Error('delete failed: Store is not writable at this point' );
		
		}
	}

	public removeUniqueId( id: any ) {
		this._map.delete(id);
	}

	public getElementById( id: any ): Store_Item {
		return this._map.has( id ) ? <Store_Item>this._map.get(id) : null;
	}

	public requestUpdate( $id: any, propertyName?: string ) {
		if ( propertyName && this.$sortFields ) {
			this._sorting.set( propertyName, true );
		}
	}

	public requestChange() {
		this._onchanged.run();
	}

	public requestMetaChange() {
		this._onmetachanged.run();
	}

	public clear() {
		this.lock(true);
		this.walk( function( index: number ): ETraverseSignal { this.die(); return 0; } );
		this._items.splice( 0, this._length );
		this._length = 0;
		this.unlock(true);
		this.requestChange();
	}

	protected onBeforeChange() {
		
		var needSorting: boolean = false;

		if ( this._sorting.has( '__insertion__' ) ) {
			needSorting = true;
			//console.log( 'sorting because of insertion' );
		} 

		else
		
		if ( this.$sortFields && this._sorting.size ) {
			// find out if the affected fields that were changed require sorting...
			var ns: boolean = false,
			    i: number,
			    len: number;
			
			for ( i=0, len=this.$sortFields.length; i<len; i++ ) {
				if ( this.$sortFields[i].name && this._sorting.has( this.$sortFields[i].name ) ) {
					needSorting = true;
					//console.log( 'sorting because of updating' );
					break;
				}
			}

		}

		if ( needSorting ) {
			this._sorting.clear();
			this.sort( false );
		}

		this.fire( 'change' );
	}

	public walk( 
		callback 	: FTraversor,
		skip 		: number = 0, 
		limit 		: number = null, 
		aggregator 	: FAggregator = null
	): Store {
		var cursor = new Store_Cursor( this, this.length, skip, limit );
		return cursor.each( callback, aggregator );
	}

	public createQueryView( query: FTraversor ): Store_View {
		return new Store_View( this, query );
	}

	public getItemIndexById( itemId: any ): number {
		var result: number = -1;
		this.walk( function( index ): ETraverseSignal {
			if ( this.id == itemId ) {
				result = index;
				return ETraverseSignal.STOP;
			}
		} );
		return result;
	}

	// length is imutable
	get length(): number {
		return this._length;
	}

}