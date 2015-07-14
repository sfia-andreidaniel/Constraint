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
	protected _root   : HTMLDivElement = null;
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

		return child;
	}

	// this is called each time the element needs to be repainted.
	public onRepaint() {

		if ( !this._paintable ) {
		
			this._needPaint = true;
		
		} else {
			
			if ( this._root ) {

				if ( this._left.valid && this._right.valid ) {
					this._root.style.left = this._left.distance + "px";
					this._root.style.right = this._right.distance + "px";
					this._root.style.width = 'auto';
				} else {

					if ( this._left.valid ) {
						this._root.style.left = this._left.distance + "px";
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
						this._root.style.top = this._top.distance + "px";
					}

					if ( this._bottom.valid ) {
						this._root.style.bottom = this._bottom.distance + "px";
					}

					this._root.style.height= this.height + "px";

				}

			}

			this._needPaint = false;

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
		if ( !outer ) {
			return {
				"width": 0,
				"height": 0
			};
		} else {
			return {
				"width": outer.width - this._padding.left - this._padding.right,
				"height": outer.height - this._padding.top - this._padding.bottom
			}
		}
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