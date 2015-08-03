/**
 * The Store_Cursor is the base class used to "walk" stores.
 *
 * By walking we understand "visiting" each item of the tree.
 *
 * The Store_Cursor is using a callback on it's "each" method, which should return
 * an ETraverseSignal value. Depending on the returned value of the callback, you can
 * configure some behaviours of the walk mechanism.
 *
 * If the return of the callback is ETraverseSignal.AGGREGATE, the "each" method of
 * the cursor calls the optional "aggregator" callback with the item as it's argument.
 *
 */
class Store_Cursor {

	/**
	 * Skip first <skip> items
	 */
	protected skip   : number = 0;

	/**
	 * Stop walking after <limit> items.
	 */
	protected limit  : number = null;

	/**
	 * The store we're walking.
	 */
	protected store: Store;
	

	/**
	 * Class constructor.
	 *
	 * @param totalItems - The total number of items in the store. This is needed, because using
	 *        the length property of a store on nested stores would return only the total number
	 *        of the items in the store root.
	 */
	constructor( store: Store, totalItems: number, skip: number = 0, limit: number = null ) {
		this.store = store;

		if ( skip < 0 ) {
			skip = totalItems + skip;
		}

		if ( skip < 0 ) {
			throw new Error( 'Index out of bounds' );
		}

		if ( limit === null ) {
			limit = totalItems - skip;
		} else {
			if ( limit + skip >= totalItems ) {
				limit = totalItems - skip;
			}
		}

		this.skip = skip;
		this.limit= limit;
	}

	/**
	 * The forEach implementation of the cursor.
	 *
	 * @param callback - Callback to call to each item in the store when it's visited.
	 *        **The item is placed in the "this" ** context of the callback.
	 *
	 * @param aggregator - If the callback is returning ETraverseSignal.AGGREGATE, then
	 *        **aggregator** callback  is called with the **item as argument**.
	 * 
	 */
	public each( callback: ( index: number ) => ETraverseSignal, aggregator?: ( item: Store_Item ) => void ): Store {

		var cursor: Store_Item,
		    i: number,
		    len: number,
		    signal: ETraverseSignal;

		for ( i = this.skip, len = this.skip + this.limit; i < len; i++ ) {
			cursor = this.store.itemAt( i );
			signal = ~~callback.call( cursor, i );
			if ( signal == ETraverseSignal.STOP ) {
				break;
			} else
			if ( signal == ETraverseSignal.AGGREGATE && aggregator ) {
				aggregator( cursor );
			}
		}

		return this.store;

	}
}