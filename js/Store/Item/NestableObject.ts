class Store_Item_NestableObject extends Store_Item_NamedObject {

	protected _isCollapsed: boolean = true;
	protected _parentsCollapsed: number = 0;
	protected _parentId: any;
	protected _isLeaf: boolean;
	protected _depth: number = 0;
	protected _parent: Store_Item_NestableObject = null;


	// the tree connectors are stored in this array.
	// the tree connectors are computed by Store_View/* objects
	public    connectors: number[] = [];

	constructor( payload: INestable, owner: Store ) {
		super( payload, owner );

		var parent: Store_Item_NestableObject;

		this._parentId = payload.parent || null;
		this._isLeaf = !!payload.isLeaf;

		if ( this._parentId ) {
			
			this._parent = <Store_Item_NestableObject>owner.getElementById( this._parentId );

			if ( this._parent === null ) {
				throw new Error( 'Parent #' + this._parentId + ' was not found' );
			}
			
			this._parentsCollapsed = this._parent.parentsCollapsed;
			this._depth = this._parent.depth + 1;

		}
	}

	get data(): any {
		return this._data;
	}

	set data( payload: any ) {
		payload = payload || {};
		
		payload.id = this._id;
		payload.name = String(payload.name || '');
		payload.parent = this._parentId || null;
		payload.isLeaf = this._isLeaf || false;

		if ( payload.parent == payload.id ) {
			throw new Error( 'Recursivity detected!' );
		}

		this._data = payload;
		this.onUpdate();
		this.onChange();
	}

	protected onCollapse( before: boolean ) {
		if ( !this._dead ) {
			this._owner.fire( before ? 'before-collapse' : 'collapse', this );
		}
	}

	protected onExpand( before: boolean ) {
		if ( !this._dead ) {
			this._owner.fire( before ? 'before-expand' : 'expand', this );
		}
	}

	get collapsed(): boolean {
		if ( this.isLeaf ) {
			return false;
		} else {
			return this._isCollapsed || this._parentsCollapsed > 0;
		}
	}

	set collapsed( collapsed: boolean ) {
		collapsed = !!collapsed;
		if ( collapsed != this._isCollapsed && !this._isLeaf ) {

			if ( collapsed )
				this.onCollapse( true );
			else
				this.onExpand( true );

			this._isCollapsed = collapsed;
			this.onChange();
			this.onParentCollapse( collapsed ? 1 : -1 );
			this.onMetaChanged();

			if ( collapsed ) {
				this.onCollapse( false );
			} else {
				this.onExpand( false );
			}
		}
	}

	get expanded(): boolean {
		return !this.collapsed;
	}

	set expanded( on: boolean ) {
		this.collapsed = !on;
	}

	get depth(): number {
		return this._depth;
	}

	get visible(): boolean {
		if ( !this._parentId ) {
			return true;
		} else {
			return !this.parent.collapsed && this.parent.visible;
		}
	}

	get parentsCollapsed(): number {
		return this._parentsCollapsed;
	}

	public getParentByDepth( depth: number ) {
		if ( this._depth > 0 ) {

			if ( depth > -1 && depth < this._depth ) {

				var cursor: Store_Item_NestableObject = this._parent,
				    i: number = 0,
				    len: number = this._depth - depth - 1;

				for ( i = 0; i<len; i++ ) {
					cursor = cursor.parent;
				}

				return cursor;

			} else {
				throw new Error( 'Illegal depth!' );
			}

		} else {
			
			throw new Error( 'Child is orphan' );

		}
	}

	public onRemove() {
		// NOTE THAT this IS ALLREADY REMOVED WHEN THIS METHOD IS CALLED

		/* Triggered after a node is removed from the store.
		   We must remove our children, right? */

		super.onRemove();

		var indexes: number[] = [],
		    item: Store_Item_NestableObject,
		    i: number,
		    len: number;

		for ( i=0, len = this._owner.length; i<len; i++ ) {
			item = <Store_Item_NestableObject>this._owner.itemAt(i);
			if ( item.parentId == this.id ) {
				indexes.push( i );
			}
		}

		for ( i = indexes.length - 1; i >= 0; i-- ) {
			this._owner.removeAt( indexes[i] );
		}

	}

	public onParentCollapse( amount: number ) {
		
		if ( !this.isLeaf ) {

			var prevState: boolean = this.collapsed,
			    nowState: boolean,
			    children: Store_Item_NestableObject[],
			    i: number,
			    len: number;

			this._parentsCollapsed += amount;

			nowState = this.collapsed;

			if ( nowState != prevState ) {
				this.onChange();
			}

			// publish to children
			children = this.childNodes;
			len = children.length;

			for ( i=0; i<len; i++ ) {
				children[i].onParentCollapse( amount );
			}

		}

	}

	public relativeDepthChange( amount: number ) {
		if ( amount == 0 ) {
			return;
		}

		this._depth += amount;

		var children: Store_Item_NestableObject[] = this.childNodes,
		    len: number = children.length,
		    i: number = 0;

		for ( i=0; i<len; i++ ) {
			children[i].relativeDepthChange( amount );
		}
	}

	get parentId(): any {
		return this._parentId;
	}

	set parentId( parentId: any ) {
		if ( parentId === null ) {
			this.parent = null;
		} else {
			
			var parent: Store_Item_NestableObject = <Store_Item_NestableObject>this._owner.getElementById( parentId );
			
			if ( parent === null ) {
				throw new Error( 'Parent #' + parentId + ' was not found' );
			} else {
				this.parent = parent;
			}
		}
	}

	get parent(): Store_Item_NestableObject {
		return this._parent;
	}

	set parent( parent: Store_Item_NestableObject ) {

		if ( parent !== this._parent ) {

			if ( parent !== null && this.contains( parent ) ) {
				throw new Error( 'Circularity detected!' );
			}

			if ( parent && parent.isLeaf ) {
				throw new Error( 'Cannot move inside leaf objects' );
			}

			var _changeDepthRelative: number,
			    _changeCollapsedRelative: number;

			if ( parent === null ) {
				_changeDepthRelative = -this.depth;
				_changeCollapsedRelative = -this._parentsCollapsed;
				this._parent = null;
				this._parentId = null;
			} else {

				_changeDepthRelative = parent.depth - this.depth + 1;
				_changeCollapsedRelative = ( parent.parentsCollapsed + ( parent.collapsed ? 1 : 0 ) ) - this.parentsCollapsed;
				this._parent = parent;
				this._parentId = parent.id;

			}

			// set the "parent" property of this
			if ( this._data ) {
				this._data.parent = this._parentId;
			}

			this.relativeDepthChange( _changeDepthRelative );
			this.onParentCollapse( _changeCollapsedRelative );

			if ( this._owner.sorted ) {
				this._owner.ensureSorted();
				this.onChange();
			} else {
				this.onChange();
			}

		}

	}

	get isLeaf(): boolean {
		return !!this._isLeaf;
	}

	get idPath(): any[] {
		var cursor = this.parent,
		    result: any[] = [];
		while ( cursor ) {
			result.push( cursor.id );
			cursor = cursor.parent;
		}

		return result;
	}

	get childNodes(): Store_Item_NestableObject[] {
		
		if ( this.isLeaf ) {
			return [];
		}

		var i: number,
		    len: number = this._owner.length,
		    result: Store_Item_NestableObject[] = [],
		    item: Store_Item_NestableObject;

		for ( i=0; i<len; i++ ) {
			if ( (item = <Store_Item_NestableObject>this._owner.itemAt( i )).parentId == this.id ) {
				result.push( item );
			}
		}

		return result;

	}

	public contains( node: Store_Item_NestableObject ): boolean {
		
		if ( node.depth <= this.depth ) {
			return false;
		} else {
			return node && node.idPath.indexOf( this.id ) > -1;
		}
	}

}