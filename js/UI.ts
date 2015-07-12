class UI extends UI_Event {

	protected _owner  : UI;

	protected _top    : UI_Anchor = null;
	protected _left   : UI_Anchor = null;
	protected _right  : UI_Anchor = null;
	protected _bottom : UI_Anchor = null;

	protected _width  : number = null;
	protected _height : number = null;

	protected _padding: UI_Padding = null;

	constructor( owner: UI ) {
		super();

		this._owner = owner;

		this._top     = new UI_Anchor( this );
		this._left    = new UI_Anchor( this );
		this._right   = new UI_Anchor( this );
		this._bottom  = new UI_Anchor( this );

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

	get height(): number {
		return this._height;
	}

	get padding(): UI_Padding {
		return this._padding;
	}

	get paddingLeft(): number {
		return this._padding.left;
	}

	get paddingRight(): number {
		return this._padding.right;
	}

	get paddingTop(): number {
		return this._padding.top;
	}

	get paddingBottom(): number {
		return this._padding.bottom;
	}

}

Constraint.registerClass( {
	"name": "UI",
	"properties": [

		// CONSTRAINTS
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
		
		// X,Y COORDS
		{
			"name": "x",
			"type": "number"
		},
		{
			"name": "y",
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
		{
			"name": "paddingLeft",
			"type": "number"
		},
		{
			"name": "paddingRight",
			"type": "number"
		},
		{
			"name": "paddingTop",
			"type": "number"
		},
		{
			"name": "paddingBottom",
			"type": "number"
		}
	]
} );