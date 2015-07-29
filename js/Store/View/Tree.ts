class Store_View_Tree extends Store_View {
	
	constructor( owner: Store_NamedObjects, customQuery?: ( node: Store_Item_NestableObject ) => boolean ) {
		super( owner, customQuery || function( node: Store_Item_NestableObject ) {
			return node.visible;
		} );
	}

	public connectorsAt( index: number ): number[] {
		return (<Store_Item_NestableObject>this.itemAt(index)).connectors;
	}

	private lookAhead( startIndex: number, parentId: any, depth: number ): boolean {
		var i: number,
		    len: number = this.length;

		for ( i = startIndex; i<len; i++ ) {
			
			if ( (<Store_Item_NestableObject>this.itemAt(i)).depth < depth ) {
				// If we encounter a depth smaller than the depth of the item, we don't search further
				return false;
			} else

			if ( (<Store_Item_NestableObject>this.itemAt(i)).parentId == parentId ) {
				return true;
			}
		}

		return false;
	}

	private setLength( a: any[], newLength: number, newValue: () => any ) {
		var len: number = a.length;
		if ( len > newLength ) {
			a.splice( newLength, len - newLength );
		} else {
			while ( len < newLength ) {
				a.push( newValue() );
				len++;
			}
		}
	}

	private clonePen( pen: number[], toDest: number[] ) {
		
		var i: number = 0,
		    len: number = pen.length;

		this.setLength( toDest, len, () => 0 );

		for ( i=0; i<len; i++ ) {
			toDest[ i ] = pen[ i ];
		}

	}

	protected onBeforeMetaChange() {
		this.onBeforeChange();
	}

	protected onBeforeChange() {
		/* We need to build the tree connectors each time
		   before the tree changes.
		*/

		var pen          : number[] = [],
		    penLength    : number =  0,
		    currentDepth : number = -1,
		    i            : number,
		    len          : number = this.length,
		    item         : Store_Item_NestableObject,
		    depthChanged : boolean;

		for ( i=0; i<len; i++ ) {

			item = <Store_Item_NestableObject>this.itemAt( i );

			depthChanged = item.depth != currentDepth;

			if ( depthChanged ) {

				this.setLength( pen, item.depth + 1, () => 0 );

				currentDepth = item.depth;

			}

			pen[ currentDepth ] = this.lookAhead( i + 1, item.parentId, item.depth ) ? 1 : 0;

			this.clonePen( pen, item.connectors );

			switch ( item.connectors[ currentDepth ] ) {

				case 0:

					// No drawing from this point

					if ( item.isLeaf ) {

						item.connectors[ currentDepth ] = 3;
					
					} else {

						if ( item.collapsed ) {
							item.connectors[ currentDepth ] = 6;
						} else {
							item.connectors[ currentDepth ] = 7;
						}

					}

					break;

				case 1:

					if ( item.isLeaf ) {

						item.connectors[ currentDepth ] = 2;

					} else {

						if ( item.collapsed ) {
							item.connectors[ currentDepth ] = 4;
						} else {
							item.connectors[ currentDepth ] = 5;
						}

					}

					break;
			}

		}
	
	}

	protected _setupEvents_() {
		super._setupEvents_();
		( function( me ) {
			me._owner.on( 'before-collapse', function( node: Store_Item_NestableObject ) {
				if ( me._query( node ) ) {
					me.fire( 'before-collapse', node );
				}
			} );
			me._owner.on( 'before-expand',   function( node: Store_Item_NestableObject ) {
				if ( me._query( node ) ) {
					me.fire( 'before-expand', node );
				}
			} );
			me._owner.on( 'collapse', 		 function( node: Store_Item_NestableObject ) {
				if ( me._query( node ) ) {
					me.fire( 'collapse', node );
				}
			} );
			me._owner.on( 'expand',          function( node: Store_Item_NestableObject ) {
				if ( me._query( node ) ) {
					me.fire( 'expand', node );
				}
			} );
		} )( this );
	}

}