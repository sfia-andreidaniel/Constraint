class UI extends UI_Event {

	// the logical parent of this UI element (has nothing to do with dom)
	protected _owner  : UI;

	// constraints / anchors.
	protected _top    : UI_Anchor = null;
	protected _left   : UI_Anchor = null;
	protected _right  : UI_Anchor = null;
	protected _bottom : UI_Anchor = null;

	// dimensions
	protected _width  : number = 0;
	protected _height : number = 0;
	protected _minWidth: number = 0;
	protected _minHeight: number = 0;

	// inside padding of the UI element (nothing to do with dom). 
	// Useful if the element contains other elements at loglcal level.
	protected _padding: UI_Padding = null;

	// the children of the UI element.
	protected _children: UI[] = [];

	// if the element is represented in DOM, this is it's root element.
	public    _root   : HTMLDivElement = null;
	protected _paintable: boolean = true;
	private   _needPaint: boolean = false;

	constructor( owner: UI ) {
		super();

		this._owner = owner;

		this._top     = new UI_Anchor( this, EAlignment.TOP );
		this._left    = new UI_Anchor( this, EAlignment.LEFT );
		this._right   = new UI_Anchor( this, EAlignment.RIGHT );
		this._bottom  = new UI_Anchor( this, EAlignment.BOTTOM );

		this._padding = new UI_Padding( this );

		if ( this._owner ) {
			this._owner.insert( this );
		}

	}

	get top(): any {
		return this._top;
	}

	set top( value: any ) {
		this._top.load( value );
	}

	get left(): any {
		return this._left;
	}

	set left( value: any ) {
		this._left.load( value );
	}

	get right(): any {
		return this._right;
	}

	set right( value: any ) {
		this._right.load( value );
	}

	get bottom(): any {
		return this._bottom;
	}

	set bottom( value: any ) {
		this._bottom.load( value );
	}

	get width(): number {
		return this._width;
	}

	set width( value: number ) {
		value = ~~value;
		if ( value != this._width ) {
			this._width = value;
			this.onRepaint();
		}
	}

	get height(): number {
		return this._height;
	}

	set height( value: number ) {
		value = ~~value;
		if ( value != this._height ) {
			this._height = value;
			this.onRepaint();
		}
	}

	get minWidth(): number {
		return this._minWidth;
	}

	set minWidth( w: number) {
		w = ~~w;
		if ( w != this._minWidth ) {
			this._minWidth = w;
			if ( this._width < this._minWidth ) {
				this._width = this._minWidth;
				this.onRepaint();
			}
		}
	}

	get minHeight(): number {
		return this._minHeight;
	}

	set minHeight( h: number ) {
		h = ~~h;
		if ( h != this._minHeight ) {
			this._minHeight = h;
			if ( this._height < this._minHeight ) {
				this._height = this._minHeight;
				this.onRepaint();
			}
		}
	}

	get padding(): UI_Padding {
		return this._padding;
	}

	// form is the current "dialog" in which this element is inserted.
	get form(): UI_Form {
		return this._owner
			? this._owner.form
			: <UI_Form>this;
	}

	// owner is the "parent" of the current UI element.
	get owner(): UI {
		return this._owner;
	}

	set owner( owner: UI ) {
		this._owner = owner;
	}

	// removes the UI element from it's parent.
	public remove(): UI {
		if ( this._owner ) {
			for ( var i=0, len = this._owner._children.length; i<len; i++ ) {
				if ( this._owner._children[i] == this ) {
					this._owner._children.splice( i, 1 );
				}
			}
		}
		return this;
	}

	// inserts an UI element inside the current UI element
	public insert( child: UI ): UI {

		if ( !child )
			throw Error( 'Cannot insert a NULL element.' );

		child.remove();
		child.owner = this;
		this._children.push( child );

		this.insertDOMNode( child );

		return child;
	}

	public insertDOMNode( node: UI ): UI {
		if ( this._root && node._root ) {
			this._root.appendChild( node._root );
		}
		return node;
	}

	// this is called each time the element needs to be repainted.
	public onRepaint(): boolean {

		if ( !this._paintable ) {
		
			this._needPaint = true;
			return false;
		
		} else {
			
			if ( this._root ) {

				if ( this._owner && this._owner._root && this._owner._root != this._root ) {
					this._owner.insertDOMNode( this );
				}

				if ( this._left.valid && this._right.valid ) {
					this._root.style.left = this._left.distance + "px";
					this._root.style.right = this._right.distance + "px";
					this._root.style.width = 'auto';
				} else {

					if ( this._left.valid ) {
						this._root.style.left = this._left.distance + this.translateLeft + "px";
					}

					if ( this._right.valid ) {
						this._root.style.right = this._right.distance + "px";
					}

					this._root.style.width = this.width + "px";	
				}
				
				if ( this._top.valid && this._bottom.valid ) {
					this._root.style.top = this._top.distance + "px";
					this._root.style.bottom = this._bottom.distance + "px";
					this._root.style.height = 'auto';
				} else {

					if ( this._top.valid ) {
						this._root.style.top = this._top.distance + this.translateTop + "px";
					}

					if ( this._bottom.valid ) {
						this._root.style.bottom = this._bottom.distance + "px";
					}

					this._root.style.height= this.height + "px";

				}

				// If the widget has child nodes, paint them
				for ( var i=0, len = this._children.length; i<len; i++ ) {
					this._children[i].onRepaint();
				}

			}

			this._needPaint = false;
			return true;

		}
	}

	// returns the exterior width and height of the UI element.
	get offsetRect(): IRect {
		return {
			"width": this.offsetWidth,
			"height": this.offsetHeight
		}
	}

	// retrieves this UI element interior width and height
	get clientRect(): IRect {
		var outer: IRect = this.offsetRect;
		return {
			"width": outer.width - this._padding.left - this._padding.right,
			"height": outer.height - this._padding.top - this._padding.bottom
		};
	}

	// retrieves the parent width and height.
	get parentClientRect(): IRect {
		if ( this._owner ) {
			return this._owner.clientRect;
		} else {
			return {
				"width": 0,
				"height": 0
			}
		}
	}

	get boundingBox(): IBoundingBox {
		var rect: IRect,
		    out: IBoundingBox = {
		    	"left": 0, "top": 0, "right": 0, "bottom": 0, "width": 0, "height": 0
		    },
		    lValid: boolean,
		    rValid: boolean,
		    tValid: boolean,
		    bValid: boolean;

		if ( this._owner ) {

			 rect = this._owner.clientRect;

			 lValid = this._left.valid;
			 rValid = this._right.valid;

			 if ( lValid && rValid ) {
			 	out.left = this._left.distance;
			 	out.right = this._right.distance;
			 	out.width = rect.width - out.left - out.right;
			 } else
			 if ( lValid ) {
			 	out.left = this._left.distance;
			 	out.width = this._width;
			 	out.right = rect.width - out.left - out.width;
			 } else
			 if ( rValid ) {
			 	out.right = this._right.distance;
			 	out.width = this._width;
			 	out.left  = rect.width - out.width - out.left;
			 } else
			 if ( !lValid && !rValid ) {
			 	out.left = 0;
			 	out.width = this._width;
			 	out.right = rect.width - out.width;
			 }

			 tValid = this._top.valid;
			 bValid = this._bottom.valid;

			 if ( tValid && bValid ) {
			 	out.top = this._top.distance;
			 	out.bottom = this._bottom.distance;
			 	out.height = rect.height - out.top - out.bottom;
			 } else
			 if ( tValid ) {
			 	out.top = this._top.distance;
			 	out.height = this._height;
			 	out.bottom = rect.height - out.top - out.height;
			 } else
			 if ( bValid ) {
			 	out.bottom = this._bottom.distance;
			 	out.height = this._height;
			 	out.top = rect.height - out.bottom - out.height;
			 } else
			 if ( !tValid && !bValid ) {
			 	out.top = 0;
			 	out.height = this._height;
			 	out.bottom = rect.height - out.height;
			 }
		}

		return out;
	}

	// returns the exterior width of the UI element
	get offsetWidth(): number {
		var clientRect: IRect = this.parentClientRect;

		switch ( true ) {
			case this._left.active && this._right.active:
				return clientRect.width - this._left.value - this._right.value;
				break;
			default:
				return this._width;
				break;
		}
	}

	// returns the exterior height of the UI element
	get offsetHeight(): number {
		var clientRect: IRect = this.parentClientRect;

		switch ( true ) {
			case this._top.active && this._bottom.active:
				return clientRect.height - this._top.value - this._bottom.value;
				break;
			default:
				return this._height;
				break;
		}
	}

	get paintable(): boolean {
		return this._paintable;
	}

	set paintable( mode: boolean ) {
		mode = !!mode;
		if ( mode != this._paintable ) {
			this._paintable = mode;
			if ( mode ) {
				if ( this._needPaint ) {
					this.onRepaint();
				}
			} else {
				this._needPaint = false;
			}
		}
	}

	get translateLeft(): number {
		return 0;
	}

	get translateTop(): number {
		return 0;
	}

}

Constraint.registerClass( {
	"name": "UI",
	"properties": [

		// CONSTRAINTS / ANCHORS
		{
			"name": "top",
			"type": "UI_Anchor"
		},
		{
			"name": "right",
			"type": "UI_Anchor"
		},
		{
			"name": "bottom",
			"type": "UI_Anchor"
		},
		{
			"name": "left",
			"type": "UI_Anchor"
		},
		
		// DIMENSIONS
		{
			"name": "width",
			"type": "number"
		},
		{
			"name": "height",
			"type": "number"
		},
		{
			"name": "minWidth",
			"type": "number"
		},
		{
			"name": "minHeight",
			"type": "number"
		},

		// INSIDE PADDING COORDS
		{
			"name": "padding.left",
			"type": "number"
		},
		{
			"name": "padding.right",
			"type": "number"
		},
		{
			"name": "padding.top",
			"type": "number"
		},
		{
			"name": "padding.bottom",
			"type": "number"
		},

		// OTHER PROPERTIES
		{
			"name": "paintable",
			"type": "boolean"
		}
	]
} );