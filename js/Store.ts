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
	
	private _autoId: number = 0;
	private _items: Store_Item[] = [];
	private _length: number = 0;

	constructor( values: any[] = null ) {
		super();
		this.setItems( values || [] );
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
		this.fire( 'change' );
	}

	get length(): number {
		return this._length;
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
				this.fire( 'change' );
				return;
			}
		}
	}

	public remove( id: any ) {
		for ( var i=0; i<this._length; i++ ) {
			if ( this._items[i].id == id ) {
				this._items.splice( i, 1 );
				this._length--;
				this.fire( 'remove', id );
				this.fire( 'change' );
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
			this.fire( 'change' );
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
			this.fire( 'change' );
		} else {
			throw new Error( 'Index out of bounds: ' + index );
		}
	}

}