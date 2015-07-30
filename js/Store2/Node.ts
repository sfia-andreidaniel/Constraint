class Store2_Node extends Store2_Item {

/*  // Inherited from Store2_Item
	public    data   : any;
	protected $store : Store2;
	protected $id    : any;
	private   $dead  : boolean;

 */
	protected $parent: Store2_Node;
	protected $leaf: boolean;
	protected $length: number = 0;
	protected $children: Store2_Node[];
	protected $depth: number = 1;
	protected $totalChildren: number = 0;
	protected $collapsed: boolean = true;
	protected $visible: number = 0;

	constructor( data: any, store: Store2_Tree, $id: any, $parent: Store2_Node = null, $leaf: boolean = false ) {
		super( data, store, $id );
		this.$parent = $parent || null;
		this.$leaf = !!$leaf;
	}

	public appendChild( node: Store2_Node ): Store2_Node {
		
		var index: number = null;

		if ( this.$leaf ) {
			throw new Error( 'Destination node #' + this.$id + ' is a leaf, and doesn\'t support child nodes' );
		}
		
		if ( this.$length == 0 ) {
			this.$children = [];
		}

		if ( this.$store.$sorter && this.$store.readLocks == 0 ) {
			index = this.pivotInsert( 0, this.$length - 1, node );
		}

		this.$length++;

		if ( index === null ) {
			this.$children.push( node );
		} else {
			this.$children.splice( index, 0, node );
		}

		node.depth = this.depth + 1;

		this.updateDepthLength( node.lengthDepth + 1 );

		return node;

	}

	protected pivotInsert( left: number, right: number, item: Store2_Item ): number {
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

	get depth(): number {
		return this.$depth;
	}

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

	get length(): number {
		return this.$length;
	}

	get lengthDepth(): number {
		return this.$totalChildren;
	}

	get childNodes(): Store2_Node[] {
		return this.$children;
	}

	get isLeaf(): boolean {
		return this.$leaf;
	}

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

	set collapsed( on: boolean ) {
		on = !!on;
		if ( on != this.$collapsed ) {
			this.$collapsed = on;
		}
	}

	get expanded(): boolean {
		return !this.collapsed;
	}

	set expanded( on ) {
		this.collapsed = !!!on;
	}

	get visible(): boolean {
		if ( this.$parent ) {
			return true;
		} else {
			var cursor = this.$parent;
			while ( cursor ) {
				if ( !cursor.$parent ) {
					return true;
				}
				if ( cursor.$collapsed ) {
					return false;
				}
				cursor = cursor.$parent;
			}
		}
	}

	get parentNode(): Store2_Node {
		return this.$parent;
	}

	public updateDepthLength( withRelativeAmount: number ) {
		if ( withRelativeAmount ) {
			this.$totalChildren += withRelativeAmount;
			if ( this.$parent ) {
				this.$parent.updateDepthLength( withRelativeAmount );
			}
		}
	}

	public sort( requestChange: boolean = true, recursive: boolean = true ) {
		if ( this.$store.$sorter && this.$length > 0 ) {
			
			this.$children.sort( function( a: Store2_Node, b: Store2_Node ): number {
				return a.compare(b);
			});

			if ( recursive ) {
				for ( var i=0; i<this.$length; i++ ) {
					this.$children[i].sort( false, true );
				}
			}

			if ( requestChange ) {
				this.$store.requestChange();
			}

		}
	}

	public remove(): Store2_Item {

		if ( !this.dead ) {

			if ( !this.$parent ) {
				return super.remove();
			} else {
				// we're removing from it's parent child nodes, not
				// from the store root node.
				if ( this.$store.writable ) {

					// deallocate sub children
					for ( var i=0, len = this.$length; i<len; i++ ) {
						this.$children[i].remove();
					}

					// deallocate myself
					this.updateDepthLength( -1 );

					this.$parent.$children.splice( this.$parent.$children.indexOf( this ), 1 );

					this.$parent.$length--;

					this.die();

				} else {
					throw new Error( 'remove failed: Store is not writable at this point' );
				}
			}

		}
	}
}