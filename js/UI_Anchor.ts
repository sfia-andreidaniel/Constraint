class UI_Anchor {
	protected _target: UI = null;
	protected _owner: UI = null;

	protected _alignment: EAlignment = null;
	protected _distance: number;
	
	// anchor type. weather if it's LEFT, RIGHT, TOP or BOTTOM.
	protected _type: EAlignment;


	constructor( owner: UI, type: EAlignment ) {
		this._owner = owner;
		this._type = type;

		if ( type == EAlignment.CENTER )
			throw Error('Bad anchor direction EAlignment.CENTER');

	}

	get target(): UI {
		return this._target;
	}

	set target( target: UI ) {
		if ( target != this._target ) {
			this._target = target;
			this.requestRepaint();
		}
	}

	// the owner of the anchor cannot be changed
	get owner(): UI {
		return this._owner;
	}

	get alignment(): EAlignment {
		return this._alignment;
	}

	set alignment( al: EAlignment ) {
		if ( al != this._alignment ) {
			this._alignment = al;
			this.requestRepaint();
		}
	}

	// the distance from the target.
	// if the alignment is CENTER, this value is ignored.
	get distance(): number {
		return this._distance;
	}

	set distance( d: number ) {
		if ( ~~d != this._distance ) {
			this._distance = d;
			this.requestRepaint();
		}
	}

	// returns the opposite anchor ( for left -> right, right -> left, top -> bottom, and bottom -> top )
	get oppositeAnchor(): UI_Anchor {
		if ( !this._owner )
			return null;

		switch ( this._type ) {
			case EAlignment.LEFT:
				return this._owner.right;
				break;
			case EAlignment.RIGHT:
				return this._owner.left;
				break;
			case EAlignment.TOP:
				return this._owner.bottom;
				break;
			case EAlignment.BOTTOM:
				return this._owner.top;
				break;
			default:
				return null;
		}
	}

	// weather the anchor has all the needed data to be considered a valid one or not.
	get valid(): boolean {
		if ( !this._target || !this._owner || !this._type || this._type == EAlignment.CENTER ) {
			return false;
		} else {
			return true;
		}
	}

	get active(): boolean {
		var opposed: UI_Anchor;

		if ( !this.valid ) {
			return false;
		} else {

			opposed = this.oppositeAnchor;

			// if the opposite anchor is not valid, this is 100% valid.
			if ( !opposed || !opposed.valid ) {
				return true;
			}

			// on centered mode, the top and the left anchors
			// have priority over the bottom and the right anchor.
			switch ( this._alignment ) {
				case EAlignment.CENTER:

					if ( opposed.alignment == EAlignment.CENTER ) {
						// both centered anchors. bottom and right anchors have lower priority.
						if ( this._type == EAlignment.BOTTOM || this._type == EAlignment.RIGHT ) {
							return false;
						} else {
							// this is the left or top anchor, and has maximum priority.
							return true;
						}

					} else {
						// this is the only centered anchor, and has best priority.
						return true;
					}

					break;
				default:
					// anchor is valid, but it's opposed anchor is centered. because
					// this anchor is not centered, we considerr the anchor as not active.
					if ( opposed.alignment == EAlignment.CENTER ) {
						return false;
					} else {
						return true;
					}
					break;
			}
		}
	}

	protected requestRepaint() {
		if ( this._owner ) {
			this._owner.onRepaint();
		}
	}

	public static create( from: IAnchor ): UI_Anchor {
		var result = new UI_Anchor( null, null );
		return result;
	}

}