/* The store class is the base class for all the collections of the UI.

   The store collection implements a basic CRUD system for storing collections
   in the memory.

   The store emits 4 events:
   		"ready"  => (         ) when all the items are loaded
   		"insert" => ( id: any ) when an item has been inserted
   		"update" => ( id: any ) when an item has been updated
   		"remove" => ( id: any ) when an item has been removed
   		"change" => () whenever somethings changes in the store

 */
class Store extends UI_Event {
	
	private   _autoId: number = 0;
	protected _items: Store_Item[] = [];
	protected _length: number = 0;
	protected _allowDuplicates: boolean = true;
	protected _sorted: boolean = false;

	private   _changeThrottler: UI_Throttler;

	constructor( values: any[] = null ) {
		super();

		( function( me ) {
			
			me._changeThrottler = new UI_Throttler( function() {
				me.fire( 'change' );
			}, 100 );

			me.on( 'insert', function() {
				if ( me._sorted ) {
					me.ensureSorted();
				}
			} );

			me.on( 'update', function() {
				if ( me._sorted ) {
					me.ensureSorted();
				}
			} );

			me.on( 'ready', function() {
				if ( me._sorted ) {
					me.ensureSorted();
				}
			} );

		} )( this );

		this.setItems( values || [] );
	}

	public createQueryView( query: ( item: Store_Item ) => boolean ): Store_View {
		return new Store_View( this, query );
	}

	public onChange() {
		this._changeThrottler.run();
	}

	get autoIncrement(): number {
		this._autoId++;
		return this._autoId;
	}

	public create( payload: any ): Store_Item {
		return new Store_Item( payload, this.autoIncrement, this );
	}

	public setItems( values: any[] ) {
		this._items = [];
		this._length = values.length;

		for ( var i=0, len = values.length; i<len; i++ ) {
			this._items.push( this.create( values[i] ) );
		}

		this.fire( 'ready' );
		this.onChange();
	}

	get length(): number {
		return this._length;
	}

	public getElementById( id: any ): Store_Item {
		
		if ( id === null ) {
			return null;
		} else {
			for ( var i=0; i< this._length; i++ ) {
				if ( this._items[i].id == id ) {
					return this._items[i];
				}
			}
			return null;
		}
	}

	public insert( payload: any ): any {

		var item: Store_Item;

		this._items.push( item = this.create( payload ) );
		this._length++;

		this.fire( 'insert', item.id );
		this.fire( 'change' );
		return item.id;
	}

	public update( id: any, payload: any ) {
		for ( var i=0; i<this._length; i++ ) {
			if ( this._items[i].id == id ) {
				this._items[i].data = payload;
				this.fire( 'update', id );
				this.onChange();
				return;
			}
		}
	}

	public remove( id: any ) {
		
		var ptr: Store_Item;

		for ( var i=0; i<this._length; i++ ) {
			if ( this._items[i].id == id ) {
				ptr = this._items[i];
				this._items.splice( i, 1 );
				this._length--;
				this.fire( 'remove', id );
				this.onChange();
				ptr.onRemove();
				return;
			}
		}
	}

	// returns the item at index @index
	public itemAt( index: number ): Store_Item {
		if ( index >= 0 && index < this._length ) {
			return this._items[index];
		} else {
			throw new Error( 'Index out of bounds: ' + index );
		}
	}

	// removes the item at index @index
	public removeAt( index: number ): any {
		var ptr: Store_Item;
		
		if ( index >= 0 && index < this._length ) {
			ptr = this._items[ index ];
			this._items.splice( index, 1 );
			this._length--;
			this.fire( 'remove', ptr.id );
			this.onChange();
			ptr.onRemove();
			return ptr.id;
		} else {
			throw new Error( 'Index out of bounds: ' + index );
		}
	}

	// updates the item at index @index
	public updateAt( index: number, payload: any ) {
		if ( index >= 0 && index < this._length ) {
			this._items[index].data = payload;
		} else {
			throw new Error( 'Index out of bounds: ' + index );
		}
	}

	public insertAt( index: number, payload: any ) {
		if ( index >= 0 && index <= this._length ) {
			var item: Store_Item;
			this._length++;
			this._items.splice( index, 0, item = this.create( payload ) );
			this.fire( 'insert', item.id );
			this.onChange();
		} else {
			throw new Error( 'Index out of bounds: ' + index );
		}
	}

	public compare( a: Store_Item, b: Store_Item ): number {
		return -1;
	}

	public ensureNoDuplicates() {
		var i: number,
		    j: number;
		
		if  ( this._length > 1 ) {

			for ( i=0; i < this._length; i++ ) {
				for ( j=0; j < this._length; j++ ) {
					if ( i != j && this.compare( this._items[i].data, this._items[j].data ) == 0 ) {
						throw new Error( 'Duplicate items not allowed in this store!' );
					}
				}
			}
		}
	}

	// Ensures the store stays sorted always.
	public ensureSorted() {
		if ( this._sorted && this._length > 1 ) {
			
			var oldIdList: any[] = [],
			    i: number;

			for ( i = 0; i < this._length; i++ ) {
				oldIdList.push( this._items[i].id );
			}

			( function( me ) {
				me._items.sort( function( a,b ) { return me.compare( a, b ); } );
			} )( this );
			

			for ( i = 0; i < this._length; i++ ) {
				if ( oldIdList[i] != this._items[i].id ) {
					this.onChange();
					return;
				}
			}

		}
	}

	// Weather the store allows duplicates or not
	get allowDuplicates(): boolean {
		return this._allowDuplicates;
	}

	set allowDuplicates( allow: boolean ) {

		allow = !!allow;
		
		if ( allow != this._allowDuplicates ) {
			
			if ( !allow ) {
				this.ensureNoDuplicates();
			}

			this._allowDuplicates = allow;
		}
	}

	// Getter setter for setting the "always sorted" flag.
	get sorted(): boolean {
		return this._sorted;
	}

	set sorted( sorted: boolean ) {
		sorted = !!sorted;
		if ( sorted != this._sorted ) {
			this._sorted = sorted;
			this.ensureSorted();
		}
	}

}