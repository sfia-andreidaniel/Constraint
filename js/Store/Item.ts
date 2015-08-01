class Store_Item {
	
	protected data      : any;
	protected $store    : Store;
	protected $id       : any;
	private   $dead     : boolean;
	private   $selected : boolean = false;

	constructor( data: any, store: Store, $id: any ) {
		this.data = data;
		this.$store = store;
		this.$id = $id;
	}

	public compare( otherItem: Store_Item ): number {
		return this.$store.$sorter ? this.$store.$sorter( this.data, otherItem.data ) : 1;
	}

	get id(): any {
		return this.$id;
	}

	get selected(): boolean {
		return this.$selected;
	}

	set selected( selected: boolean ) {
		selected = !!selected;
		if ( selected != this.$selected ) {
			this.$selected = selected;
			if ( !this.$dead ) {
				this.$store.requestMetaChange();
			}
		}
	}

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

	public set( propertyName?: string, value?: any ) {
		if ( this.$dead ) {
			throw new Error( 'Item is in garbage collection state!' );
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

	get dead(): boolean {
		return !!this.$dead;
	}

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

	public remove(): Store_Item {
		if ( !this.$dead ) {
			
			this.$store.remove( this );

		}

		return this;
	}
}