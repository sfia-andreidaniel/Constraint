class Store_View extends Store {

	protected _query: ( item: Store_Item ) => boolean;
	protected _owner: Store;
	private   _updater: UI_Throttler;
	private   _metaChanged: UI_Throttler;

	constructor( owner: Store, query: ( item: Store_Item ) => boolean ) {
	    super( null );
	    this._owner = owner;
	    this._query = query;
	    this._setupEvents_();
	}

	public create( payload: any ): Store_Item {
		throw new Error( 'Store_View cannot create items' );
	}

	public setItems( values: any[] ) {
		// cannot set items
	}

	public insert( payload: any ): any {
		throw new Error( 'Store_View cannot insert items' );
	}

	public update( id: any, payload: any ) {
		throw new Error( 'Store_View cannot update items' );
	}

	public remove( id: any ) {
		throw new Error( 'Store_View cannot remove items' );
	}

	public removeAt( index: number ): any {
		throw new Error( 'Store_View cannot remove items' );
	}

	public updateAt( index: number, payload: any ) {
		throw new Error( 'Store_View cannot update items' );
	}

	public insertAt( index: number, payload: any ) {
		throw new Error( 'Store_View cannot insert items' );
	}

	private requestUpdate() {
		this._updater.run();
	}

	private requestMetaChange() {
		this._metaChanged.run();
	}

	private updateItems() {

		var diff: Store_Item[] = [],
		       i: number = 0,
		       len: number = this._owner.length,
		       thisLen: number = 0,
		       item: Store_Item,
		       updated: boolean = false;

		for ( i=0; i < len; i++ ) {
			if ( this._query( item = this._owner.itemAt( i ) ) ) {
				thisLen++;
				diff.push( item )
			}
		}

		if ( thisLen != this._length ) {
			this.fire( 'before-change' );
			this._items = diff;
			this._length = thisLen;
			updated = true;
		} else {
			for ( i=0; i<thisLen; i++ ) {
				if ( this._items[i] != diff[i] ) {
					this.fire( 'before-change' );
					this._items = diff;
					updated = true;
					break;
				}
			}
		}

		if ( updated ) {
			this.onBeforeChange();
			this.fire('change');
		}

	}

	private updateMetaChangeItems() {
		this.onBeforeMetaChange();
		this.fire( 'meta-changed' );
	}

	protected onBeforeChange() {

	}

	protected onBeforeMetaChange() {

	}

	protected _setupEvents_() {
		( function( master, me ) {

			me._updater = new UI_Throttler( function() {
				me.updateItems();
			}, 20 );

			me._metaChanged = new UI_Throttler( function() {
				me.updateMetaChangeItems();
			}, 20 );

			master.on( 'change', function() {
				me.requestUpdate();
			} );

			master.on( 'ready', function() {
				me.requestUpdate();
				me.fire( 'ready' );
			});

			master.on( 'insert', function() {
				me.requestUpdate();
			} );

			master.on( 'update', function() {
				me.requestUpdate();
			} );

			master.on( 'remove', function() {
				me.requestUpdate();
			} );

			master.on( 'change', function() {
				me.requestUpdate();
			} );

			master.on( 'meta-changed', function() {
				me.requestMetaChange();
			} );

		})( this._owner, this );
	}
}