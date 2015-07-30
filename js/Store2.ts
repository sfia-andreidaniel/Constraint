class Store2 extends UI_Event {

	private _autoID      : number = 0;
	private _id          : string = null;
	private _items       : Store2_Item[] = [];
	private _length      : number = 0;
	private _map         : Store_Map;
	private _wr_locks    : number = 0;
	private _rd_locks    : number = 0;
	
	public  $sorter : ( a: any, b: any ) => number = null;

	constructor( uniqueKeyName: string ) {
		super();
		this._id   = uniqueKeyName || null;
		this._map  = new Store_Map();
	}

	get autoID(): number {
		return ++this.autoID;
	}

	set sorter( options: ISortOption[] ) {
		this.$sorter = options ? Store_Sorter.create( options ) : null;
		/* sort items */
		this.sort();
	}

	protected sort() {
		if ( this.$sorter ) {
			
			this._items.sort( function( a: Store2_Item, b: Store2_Item ): number {
				return a.compare(b);
			});

			this.requestChange();
		}
	}

	public lock( write: boolean ) {
		if ( write ) {
			this._wr_locks++;
			this._rd_locks++;
		} else {
			this._rd_locks++;
		}
	}

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

	public insert( data: any ): Store2_Item {
		
		var id: any,
		    i: number = 0,
		    index: number = null;

		if ( this._id === null ) {

			id = this.autoID;

		} else {

			id = data && data[ this._id ] ? data[ this._id ] : null;

			if ( id === null ) {
				throw new Error( 'Failed to read $id property "' + this._id + '" from item' );
			}

		}

		if ( this._map.has( id ) ) {
			throw new Error( 'Duplicate primary key: ' + id );
		}

		var item = new Store2_Item( data, this, id );

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

		if ( this._wr_locks == 0 )
		this.requestChange();

		return item;

	}

	protected pivotInsert( left: number, right: number, item: Store2_Item ): number {
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

	public itemAt( index: number ): Store2_Item {
		if ( this._wr_locks > 0 ) {
			throw new Error( 'Store is locked for writing!' );
		}
		if ( index < 0 || index > this._length - 1 ) {
			throw new Error( 'Index out of bounds' );
		} else {
			return this._items[index];
		}
	}

	public getElementById( id: any ) {
		return this._map.has( id ) ? this._map.get(id) : null;
	}

	protected requestChange() {
		//console.log( 'request-change' );
	}

	// length is imutable
	get length(): number {
		return this._length;
	}

}