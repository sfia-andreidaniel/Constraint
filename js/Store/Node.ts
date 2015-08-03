/**
 * The Store_Node class represents a nested item structure. It is used in the
 * Store_Tree class as it's item type.
 * 
 * The programmer should not use the properties starting with $ ( e.g. $parent ) directly,
 * but use the accessor properties, as those are triggering appropriate events on setters.
 *
 */
class Store_Node extends Store_Item {

	/**
	 * The parent of the node
	 */
	protected $parent 	     : Store_Node;

	/**
	 * Weather this node is a leaf node ( cannot have children ) or not
	 */
	protected $leaf 	     : boolean;

	/**
	 * Total number of direct children of this node
	 */
	protected $length  	     : number = 0;

	/**
	 * The direct children of this node
	 */
	protected $children      : Store_Node[];

	/**
	 * The depth of this node
	 */
	protected $depth 	     : number = 1;

	/**
	 * Total number of children, including sub-nodes
	 */
	protected $totalChildren : number = 0;

	/**
	 * Weather this node is collapsed or not
	 */
	protected $collapsed     : boolean = true;

	/**
	 * Weather this node is visible or not when rendered in a tree.
	 */
	protected $visible       : number = 0;

	/**
	 * Property needed when computing node connectors which is 
	 * set to TRUE if the node is the last sibling of it's parent, and
	 * to FALSE otherwise.
	 */
	public    $lastChild     : boolean = false;


	/**
     * Constructor. Creates a new node.
     */
	constructor( data: any, store: Store_Tree, $id: any, $parent: Store_Node = null, $leaf: boolean = false ) {
		super( data, store, $id );
		this.$parent = $parent || null;
		this.$leaf = !!$leaf;
	}

	/**
	 * Appends a new node inside this node. If this node is a leaf node, an exception
	 * will be thrown. The method is called by the Store_Tree, and should not be used
	 * directly by the programmer.
	 */
	protected appendChild( node: Store_Node ): Store_Node {
		
		if ( this.$leaf ) {
			throw new Error( 'Destination node #' + this.$id + ' is a leaf, and doesn\'t support child nodes' );
		}
		
		return this.attach( node );

	}

	/**
	 * Method called by the "move" method, right before the node is moved to another parent.
	 */
	protected dettach( node: Store_Node ): Store_Node {

		var index: number,
		    i: number;

		if ( ( index = this.$children.indexOf( node ) ) > -1 ) {

			this.$length--;
			this.$children.splice( index, 1 );
			this.updateDepthLength( -( 1 + node.lengthDepth ) );

			if ( this.$length ) {
				this.$children[ this.$length -  1].$lastChild = true;
			}

		} else {
			throw new Error( 'Node is not attached to the root' );
		}

		return node;
	}

	/**
	 * Method called by the "move" method, right after the node is moved to another parent.
	 */
	protected attach( node: Store_Node ): Store_Node {
		var index: number = null;

		if ( this.$length == 0 ) {
			this.$children = [];
		}

		if ( ( this.$store.$sorter || ( <Store_Tree>this.$store ).sortLeafsLast ) && this.$store.readLocks == 0 ) {
			index = this.pivotInsert( 0, this.$length - 1, node );
		}

		this.$length++;

		if ( index === null ) {
			this.$children.push( node );
		} else {
			this.$children.splice( index, 0, node );
		}

		this.updateLastChildProperty();

		node.depth = this.depth + 1;

		this.updateDepthLength( node.lengthDepth + 1 );

		return node;
	}

	/**
	 *  Moves this node into another parent. You must use this to move nodes
	 *  inside the nodes of the same store. If you remove the node, the node
	 *  will be marked as "dead" and become inoperative.
     *
	 *  Null value to newParent is also valid, meaning that you want to make this
	 *  node a root node.
     *
	 *  This is an atomic operation iside of the store.
	 */
	public move( newParent: Store_Node ) {

		newParent = newParent || null;

		if ( this.$parent == newParent )
			return;

		if ( newParent ) {

			if ( newParent.isLeaf ) {
				throw new Error('Destination parent is a leaf, and cannot accept children.' );
			}

			if ( this.contains( newParent ) ) {
				throw new Error('Cannot move a tree node inside of a child node, it would result in recursion.' );
			}

			if ( newParent.$store != this.$store ) {
				throw new Error('The move command allows moving nodes inside of the same store only!' );
			}

			if ( this.$parent ) {

				this.$parent.dettach( this );
				newParent.attach( this );	

			} else {

				(<Store_Tree>this.$store)['dettach']( this );
				newParent.attach( this );
			}

		} else {

			if ( this.$parent ) {
				this.$parent.dettach( this );
				
			}

			(<Store_Tree>this.$store)['attach']( this );
		}

		this.$parent = newParent;

		this.$store.triggerInsertionFlag();

		if ( this.$store.writeLocks == 0 ) {
			this.$store.requestChange();
		}

		this.$store.fire( 'tree-changed' );

	}

	/**
	 *  Weather this node contains a sub-node or not. Indirect sub-nodes are
	 *  also working to test with this function.
	 */
	public contains( node: Store_Node ): boolean {

		return node && node.idPath.indexOf( this.$id ) > -1;

	}

	/**
	 * Used to determine the position where to insert a direct sub-node. Uses the store
	 * sorting function.
	 */
	protected pivotInsert( left: number, right: number, item: Store_Item ): number {
		if ( left >= right ) {
			return left;
		} else {
			var mid: number = ~~( ( left + right ) / 2 ),
			    cmp: number = this.$children[mid].compare( item );

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

	/**
	 * Returns the depth of the node. 
	 */
	get depth(): number {
		return this.$depth;
	}

	/**
	 * Sets the depth of the node. Should not be used directly
	 */
	set depth( amount: number ) {

		var diff: number = this.$depth - ~~amount,
		    i: number;

		if ( diff != 0 ) {
			this.$depth -= diff;
			if ( this.$length > 0 ) {
				for ( i=0; i<this.$length; i++ ) {
					this.$children[i].depth -= diff;
				}
			}
		}
	}

	/**
	 * Returns the number of direct child nodes of this node.
	 */
	get length(): number {
		return this.$length;
	}

	/**
	 * Returns the number of direct or indirect child nodes of this node.
	 */
	get lengthDepth(): number {
		return this.$totalChildren;
	}

	/**
	 * Returns a list with all direct child nodes of this node
	 */
	get childNodes(): Store_Node[] {
		return this.$children;
	}

	/**
	 * Returns weather this node is a leaf or not.
	 */
	get isLeaf(): boolean {
		return this.$leaf;
	}

	/**
	 * Returns weather this node is in a collapsed state or not.
	 * The collapsed property is the opposite of the expanded property.
	 */
	get collapsed(): boolean {
		if ( this.$collapsed ) {
			return true;
		} else {
			if ( this.$parent ) {
				return this.$parent.collapsed;
			} else {
				return false;
			}
		}
	}

	/**
	 * Sets the collapsed state of this node. If this node is a leaf node,
	 * the operation is ignored.
	 */
	set collapsed( on: boolean ) {
		on = !!on;
		if ( !this.$leaf && on != this.$collapsed ) {
			this.$collapsed = on;
			if ( !on && this.visible ) {
				this.sort( true, true );
			}
			if ( !this.dead ) {
				this.$store.requestMetaChange();
			}
		}
	}

	/**
	 * Returns a list with the id's of the parent nodes, upto the root parent
	 */
	get idPath(): any[] {
		var result: any[] = [],
		    cursor = this.$parent;
		
		while ( cursor ) {
			result.push( cursor.id );
			cursor = cursor.$parent;
		}

		return result;
	}

	/**
	 * Returns the expanded state of the node. The expanded state is the opposite
	 * state of the "collapsed" state.
	 */
	get expanded(): boolean {
		return !this.collapsed;
	}

	/**
	 * Sets the expanded state of the node. The expanded state is the opposite state
	 * of the "collapsed" state.
	 */
	set expanded( on ) {
		this.collapsed = !!!on;
	}

	/**
	 * Returns the visibility of a node. This property is needed in order to determine
	 * if the node should be rendered by a view or not.
	 */
	get visible(): boolean {
		if ( !this.$parent ) {
			return true;
		} else {
			var cursor = this.$parent;
			while ( cursor ) {
				if ( cursor.$collapsed ) {
					return false;
				}
				if ( !cursor.$parent ) 
					break;
				cursor = cursor.$parent;
			}
			return true;
		}
	}

	/**
	 * Returns the direct parent of a node. If the node is a root node, null will be returned.
	 */
	get parentNode(): Store_Node {
		return this.$parent;
	}

	/**
	 * Returns an array with the connectors of this node that should be painted when the node is
	 * displayed in a view.
	 */
	get connectors(): number [] {
		return this.computeConnectors( true );
	}

	/**
	 * Sets the $lastChild property of the last node to true inside of the direct children of this
	 * node. SHould not be called by the programmer
	 */
	protected updateLastChildProperty() {
		for ( var i=0; i<this.$length; i++ ) {
			this.$children[i].$lastChild = ( i == this.$length - 1 );
		}
	}

	/**
	 * Computes the connectors of this node. This is called internally, so it should not be called
	 * by programmer.
	 *
	 * CONNECTORS MEANING
	 * 
     *  0           1           2          3
	 *	            |           |__        |__
	 *		        |           |
	 * 
	 *  4           5           6          7
     *  |           |           |          |
	 *  + --        - --        + --       - --
     *  |           |
	 *
	 */
	protected computeConnectors( forMyself: boolean ): number[] {
		var result: number[],
		    depth: number;

		result = !this.$parent ? [] : this.$parent.computeConnectors(false);

		result.push( this.$lastChild ? 0 : 1 );

		if ( forMyself ) {
			depth = this.$depth - 1;

			result[ depth ] = this.$leaf ? ( this.$lastChild ? 3 : 2 ) : ( this.$lastChild ? ( this.$collapsed ? 6 : 7 ) : ( this.$collapsed ? 4 : 5 ) );
		}

		return result;
	}

	/**
	 * Updates the value of the "depth" property with a relative amount. This is called
	 * when the node is moved into another parent. The updateDepth length propagates to
	 * the sub-nodes of this node also, in order to ensure everything is correctly updated.
	 */
	public updateDepthLength( withRelativeAmount: number ) {
		if ( withRelativeAmount ) {
			this.$totalChildren += withRelativeAmount;
			if ( this.$parent ) {
				this.$parent.updateDepthLength( withRelativeAmount );
			}
		}
	}

	/**
	 * Sorts the direct child nodes of this node, then recursive calls "sort" on the children
	 * of this node, IF the child nodes are visible.
	 */
	public sort( requestChange: boolean = true, recursive: boolean = true ) {
		if ( ( this.$store.$sorter || (<Store_Tree>this.$store).sortLeafsLast ) && this.$length > 0 ) {
			
			this.$children.sort( function( a: Store_Node, b: Store_Node ): number {
				return a.compare(b);
			});

			for ( var i=0, len = this.$children.length; i<len; i++ ) {
				this.$children[i].$lastChild = i == len - 1;
				if ( recursive && this.$children[i].visible ) {
					this.$children[i].sort( false, true );
				}
			}

			if ( requestChange ) {
				this.$store.requestChange();
			}

		}
	}

	/**
	 * Removes this child from it's parent. Calls "die". After removal, node is marked in garbage
	 * collection state, and reading / writing will become impossible by using the "get" and "set" methods.
	 */
	public remove(): Store_Item {

		if ( !this.dead ) {
			if ( this.$store.writable ) {
				
				if ( !this.$parent ) {
					// deallocate sub children
					for ( var i=this.$length-1; i>=0; i-- ) {
						this.$children[i].remove();
					}
					return super.remove();
				} else {
					// we're removing from it's parent child nodes, not
					// from the store root node.

					// deallocate sub children
					for ( var i=this.$length-1; i>=0; i-- ) {
						this.$children[i].remove();
					}

					// deallocate myself
					this.updateDepthLength( -1 );

					this.$parent.$children.splice( this.$parent.$children.indexOf( this ), 1 );

					this.$parent.$length--;

					this.die();
				}
			} else {
				throw new Error( 'remove failed: Store is not writable at this point' );
			}
		}
	}

	/**
	 * Compares this node with another node.
	 */
	public compare( otherItem: Store_Item ): number {
		if ( (<Store_Tree>this.$store ).sortLeafsLast ){

			var $oIsLeaf: boolean = (<Store_Node>otherItem).isLeaf;

			if ( this.$leaf == $oIsLeaf ) {
				return super.compare( otherItem );
			} else {
				return ~~this.$leaf - ~~$oIsLeaf;
			}

		} else {
			return super.compare( otherItem );
		}
	}

}