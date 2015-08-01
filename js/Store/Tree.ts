class Store_Tree extends Store {

	private _parent: string = null;
	private _leaf  : string = null;
	
	constructor( uniqueKeyName: string = "id", parentKeyName: string = "parent", leafKeyName: string = "isLeaf" ) {
		super( uniqueKeyName );

		if ( !uniqueKeyName ) {
			throw new Error( 'Invalid arugments: The Store_Tree requires a valid keyName' );
		}

		if ( !parentKeyName ) {
			throw new Error( 'Invalid arguments: The Store_Tree requires a valid parentKeyName' );
		} else {
			this._parent = parentKeyName;
		}

		if ( !leafKeyName ) {
			throw new Error( 'Invalid arguments: The Store_Tree requires a valid leafKeyName' );
		} else {
			this._leaf = leafKeyName;
		}
	}

	// The "insert" method is altered...
	public insert( data: any ): Store_Item {
		// We're returning a <Store2_Node> actually
		var id: any,
		    parent: any,
		    leaf: boolean,
		    i: number = 0,
		    index: number = null,
		    result: Store_Node;

		id = ( data && data[ this._id ] ) ? ( data[ this._id ] || null ) : null;

		if ( id === null ) {
			throw new Error('Missing $id property "' + this._id + '" from data.' );
		}

		parent = Store_Map.validKey( data[ this._parent ] ) ? data[ this._parent ] || null : null;

		leaf = !!data[ this._leaf ];

		// strict checking
		if ( this._map.has( id ) ) {
			throw new Error('Duplicate unique key: ' + id );
		}

		if ( parent !== null ) {
			
			if ( !this._map.has( parent ) ) {
				throw new Error('Parent id "' + parent + '" was not found!' );
			}
			
			result = new Store_Node( data, this, id, <Store_Node>this.getElementById( parent ), leaf );
			
			this._map.get( parent ).appendChild( result );

		} else {

			result = new Store_Node( data, this, id, null, leaf );

			if ( this.$sorter && this.writeLocks == 0 ) {
				index = this.pivotInsert( 0, this._length - 1, result );
			}

			if ( index === null ) {
				this._items.push( result );
			} else {
				this._items.splice( index, 0, result );
			}

			this._sorting.set( '__insertion__', true );

			this._length++;
		}

		this._map.set( id, result );

		if ( this.writeLocks == 0 ) {
			this.requestChange();
		}

		return result;

	}

	protected sort( requestChange: boolean = true, recursive: boolean = true ) {
		
		super.sort( !recursive );

		/* set the $lastChild on nodes */
		for ( var i=0, len = this._length; i<len; i++ ) {
			(<Store_Node>this._items[i]).$lastChild = i == len - 1;
		}

		if ( this.$sorter && this._length && recursive ) {
			
			for ( var i=0; i<this._length; i++ ) {
				(<Store_Node>this._items[i]).sort( false, true );
			}

			if ( requestChange ) {
				this.requestChange();
			}
		}
	}

	public walk( 
		callback   : FTraversor, 
		skip 	   : number = 0, 
		limit 	   : number = null,
		aggregator : FAggregator = null
	): Store {
		var cursor = new Store_Cursor_Tree( this, this.lengthDepth, skip, limit );
		return cursor.each( callback, aggregator );
	}

	get isTree(): boolean {
		return true;
	}


	get lengthDepth(): number {
		return this._map.size;
	}

	public setItems( items: any, fromNested: boolean = false, childrenKeyName: string = 'children' ) {
		if ( fromNested ) {

			var result: any[],
			    i: number,
			    len: number;

			if ( items ) {

				if ( items instanceof Global.env['Array'] ) {

					if ( items.length ) {
					
						result = Store_Tree.unnest( items[0], this._id, this._parent, childrenKeyName, this._leaf );

						for ( i=1, len = items.length; i<len; i++ ) {
							result = Utils.arrayMerge( result, Store_Tree.unnest( items[i], this._id, this._parent, childrenKeyName, this._leaf ), true );
						}

						super.setItems( result );

					} else result = [];

					super.setItems( result );

				} else {

					super.setItems( Store_Tree.unnest( items, this._id, this._parent, childrenKeyName, this._leaf ) );

				}

			}

		} else {

			super.setItems( items, false );
		
		}

	}

	public static unnest( data: any, idKeyName: string = 'id', parentKeyName: string = 'parent', childrenKeyName: string = 'children', leafKeyName: string = 'isLeaf' ): any[] {

		var result: any[] = [],
		    autoId: number = 0;

		function traverse( item: any, parentValue: any = null ) {
			if ( !item ) {
				return;
			}

			var row = Utils.ObjectExclude( [ idKeyName, childrenKeyName, leafKeyName ], item ),
			    i: number,
			    len: number;

			row[ idKeyName ] = typeof item[ idKeyName ] != 'undefined' && Store_Map.validKey( item[ idKeyName ] ) ? item[ idKeyName ] : ++autoId;
			row[ parentKeyName ] = parentValue;

			result.push( row );

			if ( typeof item[ childrenKeyName ] != 'undefined' && ( len = item[ childrenKeyName ].length ) ) {
				for ( i=0; i<len; i++ ) {
					traverse( item[ childrenKeyName ][ i ], row[ idKeyName ] );
				}
			} else {
				row[ leafKeyName ] = true;
			}

		}

		traverse( data );

		return result;

	}

}