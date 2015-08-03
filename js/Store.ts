/**
 * The Store class is the base class for all the collections types. It implements
 * a list of objects, sorting mechanisms, etc.
 */
class Store extends UI_Event {

	/** an auto increment id value, that is used when the name of the unique key of the
	  * objects of the store is null.
	  */ 
	private   _autoID      : number = 0;
	
	/**
	 * the name of the unique key in the objects in the store.
	 */
	protected _id          : string = null;

	/**
	 * the place where we store the items in the store.
	 */
	protected _items       : Store_Item[] = [];
	
	/**
	 * length of the store. we use the length separately, because accessing the
	 * this._items.length is much slower.
	 */ 
	protected _length      : number = 0;

	/**
	 * the map that is used for storing the unique key bindings
	 */
	protected _map         : Store_Map;

	/**
	 * number of write locks
	 */
	private   _wr_locks    : number = 0;

	/**
	 * number of read locks
	 */
	private   _rd_locks    : number = 0;

	/**
	 * a throttler that is limiting the number of "change" event fires to a rate of 1ms.
	 */
	private   _onchanged     : UI_Throttler;

	/**
	 * a throttler that is limiting the number of "meta-changed" event fires to a rate of 1ms.
	 */
	private   _onmetachanged : UI_Throttler;

	/** 
	 * we keep tracking on the keys that were updated on the store, in order
	 * to fire the sorting before actually firing the "change" event in this map.
	 * also, when an insertion is made, we set the "__insertion__" property
	 * to true in this map.
	 * this way, we avoid unnecesarry sorting.
	 */
	protected   _sorting     : Store_Map;
	
	/**
	 * the function that is used for sorting. this function is generated automatically
	 * by the setter called "sorter", so you should not set this property directly.
	 */
	public  $sorter : ( a: any, b: any ) => number = null;

	/**
	 * the fields that are afecting the sorting.
	 */
	private $sortFields: ISortOption[];

	/**
	 * Store constructor.
	 * @param uniqueKeyName The name of the "id" key in the objects the store holds.
	 *                       If this key is NULL, an auto-increment id will be used.
	 */
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

	/**
	 * returns the next auto-id increment
	 */
	get autoID(): number {
		return ++this.autoID;
	}

	/**
	 * Sets the sorter.
	 * 
	 * Example: 
	 *
	 *    mystore.**sorter** = [ { "name": "name", "type": "string", "asc": true }, { "name": "age", "type": "int", "asc": false } ];
	 *
	 */
	set sorter( options: ISortOption[] ) {
		this.$sorter = options ? Store_Sorter.create( this.$sortFields = options ) : ( this.$sortFields = null );
		/* sort items */
		this.sort();
	}

	/**
	 * Returns if the store is readable or not. You can place a lock on
	 * the store using the "lock" method.
	 */
	get readable(): boolean {
		return this._wr_locks == 0;
	}

	/**
	 * Returns the number of "read only" locks from the store
	 */
	get readLocks(): number {
		return this._rd_locks;
	}

	/** 
	 * Returns if the store is writable or not. You can place a lock
	 * on the store using the "lock" method
	 */
	get writable(): boolean {
		return this._rd_locks == 0 && this._wr_locks == 0;
	}

	/**
	 * Returns the number of write locks on the store.
	 */
	get writeLocks(): number {
		return this._wr_locks;
	}

	/**
	 * Returns the items of the store. On recursive stores (trees), this property
	 * returns only the items from the root.
	 */
	get items(): Store_Item[] {
		return this._items;
	}

	/**
	 * Returns weather the store is a "tree" or not.
	 */
	get isTree(): boolean {
		return false;
	}

	/**
	 * sorts the rows in the store. if the store is a tree, only the root options
	 * are sorted.
	 */
	protected sort( requestChange: boolean = true ) {
		if ( this.$sorter && this._length ) {
			
			this._items.sort( function( a: Store_Item, b: Store_Item ): number {
				return a.compare(b);
			});

			if ( requestChange )
				this.requestChange();
		}
	}

	/**
	 * locks the store for reading or writing ( write-true for writing, otherwise for reading)
	 * @param write if you lock the store for writing, a read-lock is automatically placed.
	 */
	public lock( write: boolean ) {
		if ( write ) {
			this._wr_locks++;
			this._rd_locks++;
		} else {
			this._rd_locks++;
		}
	}

	/**
	 * unlocks the store.
	 * @write - true: unlocks from writing
	 * @write - false: unlocks from reading
	 */
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

	/** 
	 * inserts data in the store. returns an instance of the
	 * item.
	 */
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

	/**
	 * Sets the items of the store. 
	 *
	 * @param items            an array containing the items for the store.
	 * @param isNested         indicating that the structure is a nested one.
	 *                         This argument is used by Store_Tree class, and
	 *                         ignored by the Store class.
	 * @param childrenKeyName  indicating the name of the "children" array
	 *                         of the nested structure.
	 */

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

	/**
	 * used to determine where to insert a new item in the store
	 */
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

	/**
	 * returns the item @ position index in the store. if the store is a tree,
	 * this returns only the item from the root of the store, it doesn't search
	 * inside sub-nodes.
	 */
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

	/**
	 * removes an item from the store. note that if you want
	 * to remove all items from the store, the "clear" method
	 * is much way faster.
	 */
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

	/**
	 * Removes the constraint for the id in the store, in order to be able
	 * to insert other item with the same id. Should not be used by the programmer,
	 * it is used by internal mechanisms.
	 */
	public removeUniqueId( id: any ) {
		this._map.delete(id);
	}

	/**
	 * Returns the element wich has the id <id>. The id key name is took
	 * from the constructor initialization.
	 */
	public getElementById( id: any ): Store_Item {
		return this._map.has( id ) ? <Store_Item>this._map.get(id) : null;
	}

	/**
	 * schedule a "change" event to be fired, because the store
	 * item with id $id's property <propertyName> was changed.
	 */
	public requestUpdate( $id: any, propertyName?: string ) {
		if ( propertyName && this.$sortFields ) {
			this._sorting.set( propertyName, true );
		}
	}

	/**
	 * runs the "change" event throttler.
	 * should not be used by programmer, but by internal mechanisms.
	 */
	public requestChange() {
		this._onchanged.run();
	}

	/**
	 * Runs the "meta-change" event throttler.
	 * should not be used by programmer, but by internal mechanisms.
	 */
	public requestMetaChange() {
		this._onmetachanged.run();
	}

	/**
	 * When an insertion is made in the store, we set a special flag in the store,
	 * telling it that a sort is needed to be made before firing the "change" event.
	 */
	public triggerInsertionFlag() {
		this._sorting.set( '__insertion__', true );
	}

	/**
	 * Kills all the items in the store, and removes them.
	 *
	 */
	public clear() {
		this.lock(true);
		this.walk( function( index: number ): ETraverseSignal { this.die(); return 0; } );
		this._items.splice( 0, this._length );
		this._length = 0;
		this.unlock(true);
		this.requestChange();
	}

	/**
	 * Internal method that is called before firing the "change" event.
	 */
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

	/**
	 * Walks the store.
	 *
	 * @param callback function( index ): ETraverseSignal. A function that is called for each item.
	 *                 the element that is traversed is in the "this" context.
	 *
	 * @param skip     skips the first <skip> elements. negative values are allowed, which means
	 *                 that the walk is done from the last <skip> elements.
	 *
	 * @param limit    limit the results to <limit> occurences
	 *
	 *
	 * @param aggregator function( item ): void. A function that is called automatically by the traversor
	 *                 if the @callback function returns value AGGREGATE.
	 *
	 */

	public walk( 
		callback 	: FTraversor,
		skip 		: number = 0, 
		limit 		: number = null, 
		aggregator 	: FAggregator = null
	): Store {
		var cursor = new Store_Cursor( this, this.length, skip, limit );
		return cursor.each( callback, aggregator );
	}

	/**
	 * Creates a sub-store of the store. This is usefull if you want to create a sub-collection
	 * based on some filter mechanisms
	 *
	 * @param query   function( index ): ETraverseSignal -> must return ETraverseSignal.AGGREGATE
	 *                for items that will be included in the sub-query.
	 */

	public createQueryView( query: FTraversor ): Store_View {
		return new Store_View( this, query );
	}

	/**
	 * Returns the "real" item index based on a item id. If the store is of type "tree", it
	 * returns the 2d index in the store.
	 */
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

	/**
	 * Returns the number of items in the store. If the store is a tree, the length property
	 * returns only the number of the items from the root of the store.
	 */
	get length(): number {
		return this._length;
	}

}