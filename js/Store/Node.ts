class Store_Node extends Store_Item {

/*  // Inherited from Store2_Item
	public    data   : any;
	protected $store : Store2;
	protected $id    : any;
	private   $dead  : boolean;

 */
	protected $parent 	     : Store_Node;
	protected $leaf 	     : boolean;
	protected $length  	     : number = 0;
	protected $children      : Store_Node[];
	protected $depth 	     : number = 1;
	protected $totalChildren : number = 0;
	protected $collapsed     : boolean = true;
	protected $visible       : number = 0;
	public    $lastChild     : boolean = false;

	constructor( data: any, store: Store_Tree, $id: any, $parent: Store_Node = null, $leaf: boolean = false ) {
		super( data, store, $id );
		this.$parent = $parent || null;
		this.$leaf = !!$leaf;
	}

	public appendChild( node: Store_Node ): Store_Node {
		
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

	get childNodes(): Store_Node[] {
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
		if ( !this.$leaf && on != this.$collapsed ) {
			this.$collapsed = on;
			if ( !on && this.visible ) {
				//console.log( 'sorting on visible...' );
				this.sort( true, true );
			}
		}
	}

	get expanded(): boolean {
		return !this.collapsed;
	}

	set expanded( on ) {
		this.collapsed = !!!on;
	}

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

	get parentNode(): Store_Node {
		return this.$parent;
	}

	get connectors(): number [] {
		return this.computeConnectors( true );
	}

	protected computeConnectors( forMyself: boolean ): number[] {
		var result: number[],
		    depth: number;

		result = !this.$parent ? [] : this.$parent.computeConnectors(false);
		result.push(~~(!this.$lastChild));

		if ( forMyself ) {
			depth = this.$depth - 1;
			result[ depth ] = result[ depth ]
				? ( this.$leaf ? 3 : ( this.$collapsed ? 6 : 7 ) )
				: ( this.$leaf ? 2 : ( this.$collapsed ? 4 : 5 ) );
		}

		return result;
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
}