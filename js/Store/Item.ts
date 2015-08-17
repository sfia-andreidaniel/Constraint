/**
 * This is the base class for the items that are stored inside of Store collections.
 * 
 * The Store_Item is a wrapper class for the elements inside of the store, which
 * decorates them with properties like "selected", "visible", "id", "parent", etc.
 *
 */

class Store_Item {
	
	/**
	 * The raw data of the item. Use "set" and "get" methods to modify this data.
	 */
	protected data      : any;

	/**
	 * The store that owns this item
	 */
	protected $store    : Store;

	/**
	 * The unique ID of this item in it's store
	 */
	protected $id       : any;

	/**
	 * Weather the item is dead, meaning that it's in a garbage-collection state
	 */
	private   $dead     : boolean;

	/**
	 * Is this item "selected"? This property is meaningfull when rendering the item
	 * inside of a grid for example.
	 */
	private   $selected : boolean = false;


	/**
	 * Creates a new item
	 */
	constructor( data: any, store: Store, $id: any ) {
		this.data = data;
		this.$store = store;
		this.$id = $id;
	}

	/**
	 * Compares this item with another item, based on the store comparing function.
	 */
	public compare( otherItem: Store_Item ): number {
		return this.$store.$sorter ? this.$store.$sorter( this.data, otherItem.data ) : 0;
	}

	/**
	 * Returns the unique id of this item in it's store. This property is imutable.
	 */
	get id(): any {
		return this.$id;
	}

	/**
	 * Returns weather this item is in a "selected" state, in terms of UI. This property
	 * is meaningfull to renderers.
	 */
	get selected(): boolean {
		return this.$selected;
	}

	/**
	 * Sets the selected state of this item. Property meaningfull for UI "renderers" only.
	 */
	set selected( selected: boolean ) {
		selected = !!selected;
		if ( selected != this.$selected ) {
			this.$selected = selected;
			if ( !this.$dead ) {
				this.$store.requestMetaChange();
			}
		}
	}

	/**
	 * Returns the property called <propertyName> from the item raw's data.
	 */
	public get( propertyName?: string ): any {
		if ( this.$dead ) {
			throw new Error( 'read failed: Item is in garbage collection state!' );
		}

		if ( this.$store.readable ) {
			return !propertyName ? this.data
				: ( this.data ? this.data[ propertyName ] : null );
		} else {
			throw new Error('write failed: Store is not readable at this point');
		}
	}

	/**
	 * Set the value of the <propertyName> to <value> in this item's raw data.
	 *
	 * @param propertyName - optional. If null, all the raw data is replaced to <value>
	 */
	public set( propertyName?: string, value?: any ) {
		if ( this.$dead ) {
			throw new Error( 'Item is in garbage collection state!' );
		}

		if ( propertyName ) {
			this.$store.fire( 'before-change', this, propertyName );
		}

		if ( this.$store.writable ) {
			if ( this.data && !this.data.prototype ) {
				// it's object
				if ( propertyName ) {
					
					if ( value !== null && value !== undefined ) {
						this.data[ propertyName ] = value;
					} else {
						delete this.data[ propertyName ];
					}
				} else {
					// attempting to replace the whole object with another object
					throw new Error('Value is imutable');
				}
			} else {
				// data not an object
				if ( propertyName ) {
					throw new Error( 'Value is imutable' );
				} else {
					if ( value !== undefined ) {
						this.data = value;
					} else {
						throw new Error( 'Value is imutable' );
					}
				}
			}
			this.$store.requestUpdate( this.$id, propertyName );
			this.$store.requestChange();
		} else {
			throw new Error('Store is not writable at this point');
		}
	}

	/**
	 * Returns TRUE when the node is dead (in the garbage-collection phase). After the
	 * node is dead, any attempt to read or write inside it's raw data will throw an exception.
	 * After the item is marked as dead, it's unique ID constraint will be removed from the
	 * store also.
	 */
	get dead(): boolean {
		return !!this.$dead;
	}

	/**
	 * Kills this node, and free it's unique id constraint from it's store.
	 */
	public die() {
		var ptrStore = this.$store;

		if ( !this.$dead ) {
			this.$store.removeUniqueId( this.$id );
			this.$dead = true;
			this.$store = undefined;

			ptrStore.fire('death', this.$id);
			ptrStore.requestChange();
		}
	}

	/**
	 * Physically removes the node from it's master store, if the item
	 * is not allready dead.
	 */
	public remove(): Store_Item {
		if ( !this.$dead ) {
			this.$store.remove( this );
		}
		return this;
	}
}