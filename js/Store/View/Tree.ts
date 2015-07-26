class Store_View_Tree extends Store_View {
	
	constructor( owner: Store_NamedObjects ) {
		super( owner, function( node: Store_Item_NestableObject ) {
			return node.visible;
		} );
	}

	protected onBeforeChange() {
		/* We need to build the tree guidelines each time
		   before the tree changes.
		 */

		
	}

}