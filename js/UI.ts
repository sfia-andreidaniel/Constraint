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

	// inside padding of the UI element (nothing to do with dom). 
	// Useful if the element contains other elements at loglcal level.
	protected _padding: UI_Padding = null;

	// the children of the UI element.
	protected _children: UI[] = [];

	// if the element is represented in DOM, this is it's root element.
	protected _root   : HTMLDivElement = null;

	constructor( owner: UI ) {
		super();

		this._owner = owner;

		this._top     = new UI_Anchor( this, EAlignment.TOP );
		this._left    = new UI_Anchor( this, EAlignment.LEFT );
		this._right   = new UI_Anchor( this, EAlignment.RIGHT );
		this._bottom  = new UI_Anchor( this, EAlignment.BOTTOM );

		this._padding = new UI_Padding( this );
	}

	get top(): UI_Anchor {
		return this._top;
	}

	get left(): UI_Anchor {
		return this._left;
	}

	get right(): UI_Anchor {
		return this._right;
	}

	get bottom(): UI_Anchor {
		return this._bottom;
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

	public onRepaint() {
		// this is called each time the element needs to be repainted.
		console.warn( 'UI.onRepaint: not implemented' );
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
		}
	]
} );