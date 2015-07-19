class UI_Anchor {
	protected _target: UI = null;
	protected _owner: UI = null;

	protected _alignment: EAlignment = null;
	protected _distance: number = 0;
	protected _loaded: boolean = false;
	
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

		var rect: IRect,
			bBox: IBoundingBox,
		    parentSize: number,
		    mySize: number;

		switch ( this._alignment ) {

			case EAlignment.CENTER:
				
				if ( this._target === null || this._target === this._owner ) {

					// compute center inside of parent.
					rect = this._owner.parentClientRect;

					if ( this._type == EAlignment.TOP || this._type == EAlignment.BOTTOM ){
						parentSize = ~~( rect.height / 2 );
						mySize = ~~( this._owner.height / 2 );
					} else {
						parentSize = ~~( rect.width / 2 );
						mySize = ~~( this._owner.width / 2 );
					}

					return parentSize - mySize;
				
				} else {
					
					bBox = this._target.boundingBox;

					switch ( this._type ) {

						case EAlignment.TOP:

							return ~~( bBox.top + ( bBox.height / 2 ) - ( this._owner.height / 2 ) );

							break;

						case EAlignment.LEFT:

							return ~~( bBox.left + ( bBox.width / 2 ) - ( this._owner.width / 2 ) );

							break;

						case EAlignment.BOTTOM:

							return ~~( bBox.bottom + ( bBox.height / 2 ) - ( this._owner.height / 2 ) );

							break;

						case EAlignment.RIGHT:

							return ~~( bBox.right + ( bBox.width / 2 ) - ( this._owner.width / 2 ) );

							break;

					}

				}

				break;

			case EAlignment.LEFT:
				// target edge: "left"

				if ( this._target === null || this._target === this._owner ) {
					
					switch ( this._type ) {
						case EAlignment.LEFT:
							// anchor type: "left"
							return this._distance;
							break;
						case EAlignment.RIGHT:
							// anchor type: right
							return this._owner.offsetWidth - this._distance;
							break;
						default:
							throw Error( 'Invalid anchor target edge' );
							break;
					}
				
				} else {

					bBox = this._target.boundingBox;

					switch ( this._type ) {
						case EAlignment.LEFT:
							return bBox.left + this._distance;
							break;

						case EAlignment.RIGHT:
							return bBox.right + bBox.width + this._distance;
							break;

						default:
							throw Error( 'Invalid anchor target edge' );
							break;
					}

				}

				break;

			case EAlignment.RIGHT:
				// target edge: "right"

				if ( this._target === null || this._target === this._owner) {

					switch ( this._type ) {
						case EAlignment.LEFT:
							return this._owner.offsetWidth - this._distance;
							break;

						case EAlignment.RIGHT:
							return this._distance;
							break;

						default:
							throw Error( 'Invalid anchor target edge' );
							break;
					}

				} else {

					bBox = this._target.boundingBox;

					switch ( this._type ) {
							
						case EAlignment.LEFT:
							return bBox.left + bBox.width + this._distance;
							break;

						case EAlignment.RIGHT:
							return bBox.right + this._distance;
							break;

						default:
							throw Error( 'Invalid anchor target edge' );
							break;

					}

				}

				break;

			case EAlignment.TOP:
				// target edge "top":

				if ( this._target === null || this._target === this._owner ) {

					switch ( this._type ) {
						case EAlignment.TOP:
							return this._distance;
							break;
						case EAlignment.BOTTOM:
							return this._owner.offsetHeight - this._distance;
							break;
						default:
							throw Error( 'Invalid anchor target edge' );
							break;
					}

				} else {

					bBox = this._target.boundingBox;

					switch ( this._type ) {

						case EAlignment.TOP:
							return bBox.top + this._distance;
							break;

						case EAlignment.BOTTOM:
							return bBox.bottom + bBox.height + this._distance;
							break;

						default:
							throw Error( 'Invalid anchor target edge' );
							break;

					}

				}

				break;

			case EAlignment.BOTTOM:
				// target edge: "bottom"

				if ( this._target === null || this._target === this._owner) {

					switch ( this._type ) {
						case EAlignment.TOP:
							return this._owner.offsetHeight - this._distance;
							break;
						case EAlignment.BOTTOM:
							return this._distance;
							break;
						default:
							throw Error( 'Invalid anchor target edge' );
							break;
					}

				} else {

					bBox = this._target.boundingBox;

					switch ( this._type ) {
						case EAlignment.TOP:
							return bBox.top + bBox.height + this._distance;
							break;
						case EAlignment.BOTTOM:
							return bBox.bottom + this._distance;
							break;
						default:
							throw Error( 'Invalid anchor target edge!' );
							break;
					}

				}

			default:
				return this._distance;
		}

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
		if ( !this._loaded || !this._owner || this._type === null || this._type == EAlignment.CENTER ) {
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

	get value(): number {
		return 0;
	}

	protected requestRepaint() {
		if ( this._owner ) {
			this._owner.onRepaint();
		}
	}

	public load( anotherAnchor: any ) {
		
		var def: IAnchor;

		switch ( true ) {

			case typeof anotherAnchor == 'number':
				this._distance = ~~anotherAnchor;
				this._target = null;
				this._alignment = this._type;
				this._loaded = true;
				break;

			case !!!( anotherAnchor ):
				this._distance = 0;
				this._target = null;
				this._alignment = this._type;
				this._loaded = false;

				break;

			case anotherAnchor instanceof UI_Anchor:
				this._distance = anotherAnchor._distance;
				this._target   = anotherAnchor._target;
				this._alignment = anotherAnchor._alignment;
				this._loaded = true;
				break;

			case anotherAnchor instanceof UI_Anchor_Literal:
				def = anotherAnchor.def;
				this._distance = def.distance || 0;
				this._alignment = def.alignment;
				this._target = def.target === null
					? null
					: this._owner.form[ def.target ];
				this._loaded = true;
				break;

		}

		this.requestRepaint();
	}

	public static create( from: IAnchor ): UI_Anchor {
		var result = new UI_Anchor( null, null );
		return result;
	}

}