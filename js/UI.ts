/**
 * This is the BaseClass of an UI input. All the UI types are deriving from this
 * class.
 *
 * Weather it's a form, a grid, a button, etc., everything needs to extend this
 * class.
 *
 *
 *
 *
 *
 *
 *
 */
class UI extends UI_Event {

	/**
	 * The parent of this UI element (has nothing to do with dom)
	 */
	protected _owner  : UI;

	/**
	 * TOP anchor
	 */
	protected _top    : UI_Anchor = null;
	
	/**
	 * LEFT anchor
	 */
	protected _left   : UI_Anchor = null;
	
	/**
	 * RIGHT anchor
	 */
	protected _right  : UI_Anchor = null;
	
	/**
	 * BOTTOM anchor
	 */
	protected _bottom : UI_Anchor = null;

	/**
	 * Component WIDTH
	 */
	protected _width  : number = 0;
	
	/**
	 * Component HEIGHT
	 */
	protected _height : number = 0;
	
	/**
	 * Component Minimum WIDTH
	 */
	protected _minWidth: number = 0;
	
	/**
	 * Component Minimum HEIGHT
	 */
	protected _minHeight: number = 0;

	/** 
	 * Inside padding of the UI element (nothing to do with dom). 
	 * Useful if the element contains other elements at loglcal level, and
	 * they need a distance from the borders of this element in order to be neat painted.
	 */
	protected _padding: UI_Padding = null;

	/**
	 * The direct children of the UI element.
	 */
	protected _children: UI[] = [];

	/**
	 * if the element is represented in DOM, this is it's root element.
	 */
	public    _root   : HTMLDivElement = null;
	
	/**
	 * Whether this element is paintable or not. If it is not paintable,
	 * the onRepaint method will return FALSE when invoked, and it's logic
	 * will not run. This property does not reflect if the component is visible
	 * or not, but rather reflects if it's paint method / anchoring will be executed
	 * or not.
	 */
	protected _paintable: boolean = true;
	
	/**
	 * A flag representing if the user needs to be painted or not.
	 */
	private   _needPaint: boolean = false;

	/**
	 * The text alignment of the input.
	 */
	protected _textAlign: EAlignment = EAlignment.LEFT;
	
	/**
	 * The interface names this element is embracing.
	 */
	private   _embrace: any;

	/**
	 * Whether this component is disabled or not in a direct mode (e.g. this.disabled = true).
	 * However, the disabled state is determined also by parent's disabled state.
	 */
	protected _disabled: boolean = false;
	
	/**
	 * How many parents of this component are disabled?
	 */
	protected _parentsDisabled: number = 0;
	
	/**
	 * Whether the "onRepaint" method should recursively call the "onRepaint" on the
	 * direct children of this component.
	 */
	protected _disableChildPainting: boolean;

	/**
	 * Whether this component is visible on the screen or not.
	 */
	protected _visible: boolean = true;
	
	/**
	 * After we paint the element, it's computed painted size is stored here for caching
	 * purposes.
	 */
	protected _paintRect: IBoundingBox = {
		"left"   : 0,
		"right"  : 0,
		"width"  : 0,
		"top"    : 0,
		"bottom" : 0,
		"height" : 0
	};

	/**
	 * The type of layout this item has
	 */
	protected _layout: UI_Layout;
	protected _layoutDirty: boolean = false;


	constructor( owner: UI, mixins: string[] = [], rootNode: HTMLDivElement = null ) {
		super();

		if ( rootNode ) {
			this._root = rootNode;
		}

		if ( mixins ) {
			for ( var i=0, len = mixins.length; i<len; i++ ) {
				this.embrace( mixins[i] );
			}
		}

		this._owner = owner;

		this._top     = new UI_Anchor( this, EAlignment.TOP );
		this._left    = new UI_Anchor( this, EAlignment.LEFT );
		this._right   = new UI_Anchor( this, EAlignment.RIGHT );
		this._bottom  = new UI_Anchor( this, EAlignment.BOTTOM );

		this._padding = new UI_Padding( this );

		if ( this._owner ) {
			this._owner.insert( this );
		}

		( function( node ) {
			node.on( 'keydown', function( ev: Utils_Event_Mouse ) {
				if ( node != node.form ) {
					node.form.fire( 'child-keydown', ev );
				}
			} );
		} )( this );

	}

	/**
	 * TOP anchor
	 */
	get top(): any { 
		return this._top; 
	}

	/**
	 * TOP anchor.
	 * @param value  int | IAnchor
	 */
	set top( value: any ) 	 	{
		this.layoutDirty = true;
		this._top.load( value );
	}

	/**
	 * LEFT anchor
	 */
	get left(): any { 
		return this._left;
	}

	/**
	 * LEFT anchor.
	 * @param value  int | IAnchor
	 */
	set left( value: any ) { 
		this.layoutDirty = true; this._left.load( value ); 
	}

	/**
	 * RIGHT anchor.
	 */
	get right(): any { 
		return this._right; 
	}

	/**
	 * RIGHT anchor.
	 * @param value    int | IAnchor
	 */
	set right( value: any ) {
		this.layoutDirty = true;
		this._right.load( value );
	}

	/**
	 * BOTTOM anchor
	 */
	get bottom(): any {
		return this._bottom;
	}

	/**
	 * BOTTOM anchor.
	 * @param value int | IAnchor
	 */
	set bottom( value: any ) { 
		this.layoutDirty = true; 
		this._bottom.load( value );
	}

	/**
	 * Returns the width of the element in pixels.
	 */
	get width(): number { 
		return this._width;
	}

	/**
	 * Sets the width of the element in pixels.
	 */
	set width( value: number ) {
		value = ~~value;

		if ( value != this._width ) {

			this._width = value;
			this.layoutDirty = true;

			this.onRepaint();
		}
	}

	/**
	 * Returns the height of the element in pixels.
	 */
	get height(): number { 
		return this._height;
	}

	/**
	 * Sets the height of the element in pixels.
	 */
	set height( value: number ) {

		value = ~~value;

		if ( value != this._height ) {

			this._height = value;
			this.layoutDirty = true;

			this.onRepaint();

		}
	}

	/**
	 * Returns the minimum allowed width of the element in pixels
	 */
	get minWidth(): number { 
		return this._minWidth; 
	}

	/**
	 * Sets the minimum allowed width of the element in pixels
	 */
	set minWidth( w: number) {
		w = ~~w;
		if ( w != this._minWidth ) {
			this._minWidth = w;
			if ( this._width < this._minWidth ) {
				this._width = this._minWidth;
				this.layoutDirty = true;
				this.onRepaint();
			}
		}
	}

	/**
	 * Returns the minimum allowed height of the element in pixels
	 */
	get minHeight(): number { 
		return this._minHeight; 
	}

	/**
	 * Sets the minimum allowed height of the element in pixels
	 */
	set minHeight( h: number ) {
		h = ~~h;
		if ( h != this._minHeight ) {
			this._minHeight = h;
			if ( this._height < this._minHeight ) {
				this._height = this._minHeight;
				this.layoutDirty = true;
				this.onRepaint();
			}
		}
	}

	/**
	 * Returns the padding settings of the element
	 */
	get padding(): UI_Padding { 
		return this._padding; 
	}

	/**
	 * Return the current "window" ( aka. form or dialog) in which this element is inserted.
	 */
	get form(): UI_Form { 
		return this._owner ? this._owner.form : <UI_Form>this; 
	}

	/**
	 * Returns the direct parent of the UI element ( in DOM this property is called parentNode )
	 */
	get owner(): UI { 
		return this._owner; 
	}

	/**
	 * Sets the owner ( parent element ) of the UI element.
	 */
	set owner( owner: UI ) { 
		this._owner = owner; 
	}

	/**
	 * removes the UI element from it's parent (ui element).
	 */
	public remove(): UI {

		if ( this.form )
			this.form.fire('child-removed', this);
		
		if ( this._owner ) {
			for ( var i=0, len = this._owner._children.length; i<len; i++ ) {
				if ( this._owner._children[i] == this ) {
					this._owner._children.splice( i, 1 );
				}
			}

			// flush parents disabled states.
			this.onParentDisableStateChange( null );

		}

		if ( this._root && this._root.parentNode ) {
			this._root.parentNode.removeChild(this._root);
		}

		this.layoutDirty = true;

		return this;
	}

	/**
	 * inserts an UI element inside the current UI element
	 */
	public insert( child: UI ): UI {

		if ( !child )
			throw Error( 'Cannot insert a NULL element.' );

		child.remove();
		child.owner = this;
		this._children.push( child );

		this.insertDOMNode( child );

		this.form.fire( 'child-inserted', child );

		if ( this._parentsDisabled + ~~this._disabled ) {
			// set the disabled state
			child.onParentDisableStateChange( this._parentsDisabled + ~~this._disabled );
		}

		this.layoutDirty = true;

		return child;
	}

	/**
	 * Insert the root DOM element of the UI node, inside the root of this UI element.
	 * This is because some UI elements might have the default insertion DOM node other
	 * then their _root DOM element.
	 */
	protected insertDOMNode( node: UI ): UI {
		if ( this._root && node._root ) {
			this._root.appendChild( node._root );
		}
		return node;
	}

	/**
	 * this is called each time the element needs to be repainted.
	 */
	public onRepaint(): boolean {

		if ( !this._visible ) {
			return false;
		}

		if ( !this._paintable ) {
		
			this._needPaint = true;
			
			return false;
		
		} else {
			
			var rect: IRect,
			    a: number,
			    b: number,
			    c: number = 1,
			    d: number = 1;

			if ( this._root ) {

				if ( this._owner && this._owner._root && this._owner._root != this._root ) {
					this._owner.insertDOMNode( this );
				}

				if ( this._left.valid && this._right.valid ) {
					rect = this.parentClientRect;
					this._root.style.left = ( this._paintRect.left = a = this._left.distance ) + "px";
					this._root.style.right = ( this._paintRect.right = b = this._right.distance ) + "px";
					this._root.style.width = ( this._paintRect.width = c = rect.width - a - b ) + "px";
				} else {

					if ( this._left.valid ) {
						this._root.style.left = ( this._paintRect.left = this._left.distance + this.translateLeft ) + "px";
					} else {
						this._paintRect.left = null;
					}

					if ( this._right.valid ) {
						this._root.style.right = ( this._paintRect.right = this._right.distance ) + "px";
					} else {
						this._paintRect.right = null;
					}

					this._root.style.width = ( this._paintRect.width = this.width ) + "px";
				}
				
				if ( this._top.valid && this._bottom.valid ) {
					rect = rect || this.parentClientRect;
					this._root.style.top = ( this._paintRect.top = a = this._top.distance ) + "px";
					this._root.style.bottom = ( this._paintRect.bottom = b = this._bottom.distance ) + "px";
					this._root.style.height = ( this._paintRect.height = d = rect.height - a - b ) + "px";
				} else {

					if ( this._top.valid ) {
						this._root.style.top = ( this._paintRect.top = this._top.distance + this.translateTop ) + "px";
					} else {
						this._paintRect.top = null;
					}

					if ( this._bottom.valid ) {
						this._root.style.bottom = ( this._paintRect.bottom = this._bottom.distance ) + "px";
					} else {
						this._paintRect.bottom = null;
					}

					this._root.style.height= ( this._paintRect.height = this.height ) + "px";

				}

				if ( c <= 0 || d <= 0 ) {
					this._root.style.display = 'none';
				} else {
					this._root.style.display = '';
				}

			}

			if ( !!!this._disableChildPainting ) {

				if ( this._layoutDirty && this.layoutType != ELayoutType.NONE ) {
					this._layout.compute();
					this.layoutDirty = false;
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

	/**
	 * returns the exterior width and height of the UI element.
	 */
	get offsetRect(): IRect {
		return {
			"width": this.offsetWidth,
			"height": this.offsetHeight
		}
	}

	/**
	 * retrieves this UI element interior width and height
	 */
	get clientRect(): IRect {
		var outer: IRect = this.offsetRect;
		return {
			"width": outer.width - this._padding.left - this._padding.right,
			"height": outer.height - this._padding.top - this._padding.bottom
		};
	}

	/**
	 * retrieves the parent client ( inner ) width and height.
	 */
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

	/**
	 * Returns the bounding box size of the current UI element.
	 */
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
			 	out.left  = rect.width - out.width - out.right;
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

	/**
	 * returns the exterior width of the UI element
	 */
	get offsetWidth(): number {
		var clientRect: IRect = this.parentClientRect;

		switch ( true ) {
			case this._left.active && this._right.active:
				return clientRect.width - this._left.distance - this._right.distance;
				break;
			default:
				return this._width;
				break;
		}
	}

	/**
	 * returns the exterior height of the UI element
	 */
	get offsetHeight(): number {
		var clientRect: IRect = this.parentClientRect;

		switch ( true ) {
			case this._top.active && this._bottom.active:
				return clientRect.height - this._top.distance - this._bottom.distance;
				break;
			default:
				return this._height;
				break;
		}
	}

	/**
	 * Returns true if this element is paintable or not.
	 * If the element is not paintable, the onRepaint method won't bother to paint
	 * the element or it's children.
	 */
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

	/**
	 * If this element needs to be painted translated on the screen,
	 * this property returns that value ( e.g. a form has a translate
	 * left property of 5, because it's border size ).
	 */
	get translateLeft(): number {
		return 0;
	}

	/**
	 * If this element needs to be painted translated on the screen,
	 * this property returns that value ( e.g. a form has a translate
	 * left property of 5, because it's border size ).
	 */
	get translateTop(): number {
		return 0;
	}


	/**
	 * Gets the text alignment of this UI element.
	 * TOP and BOTTOM are considered to be illegal values, and treated as "CENTER".
	 */
	get textAlign(): EAlignment {
		return this._textAlign;
	}

	set textAlign( ta: EAlignment ) {
		if ( ta != this._textAlign ) {
			switch ( ta ) {
				case EAlignment.LEFT:
					this._textAlign = ta;
					Utils.dom.removeClasses( this._root, [ 'ta-right', 'ta-center' ] );
					Utils.dom.addClass( this._root, 'ta-left' );
					break;
				case EAlignment.RIGHT:
					Utils.dom.removeClasses( this._root, [ 'ta-left', 'ta-center' ] );
					Utils.dom.addClass( this._root, 'ta-right' );
					this._textAlign = ta;
					break;
				default:
					Utils.dom.removeClasses( this._root, [ 'ta-left', 'ta-right' ] );
					Utils.dom.addClass( this._root, 'ta-center' );
					this._textAlign = EAlignment.CENTER;
					break;
			}
		}
	}

	/**
	 * Returns the "disabled" state of this UI element
	 *
	 */
	get disabled(): boolean {
		return this._disabled || this._parentsDisabled > 0;
	}

	/**
	 * Sets the "disabled" state of this UI element.
	 */
	set disabled( on: boolean ) {
		on = !!on;

		if ( on != this._disabled ) {
			
			this._disabled = on;

			if ( this._root ) {
				if ( this.disabled ){
					Utils.dom.addClass( this._root, 'disabled' );
				} else {
					Utils.dom.removeClass( this._root, 'disabled' );
				}
			}

			if ( this._children ) {
				for ( var i=0, len = this._children.length; i<len; i++ ) {
					this._children[i].onParentDisableStateChange( on ? 1 : -1 );
				}
			}

			// fire a disabled event, that might be treated by the mixins this
			// object is embracing.
			this.fire( 'disabled', on );
		}
	}

	/**
	 * This is called automatically by a parent UI to a child UI, when the disabled
	 * property of the parent changes. Should not be invoked manually.
	 */
	public onParentDisableStateChange( amount: number = 1 ) {
		if ( amount === 0 ) {
			return;
		}

		if ( amount === null ) {
			amount = this._parentsDisabled;
		}

		var previousDisabledState: boolean = this.disabled,
		    actualDisabledState: boolean;

		this._parentsDisabled += amount;

		if ( this._parentsDisabled < 0 ) {
			this._parentsDisabled = 0;
		}

		actualDisabledState = this.disabled;

		if ( actualDisabledState != previousDisabledState  ) {
			
			if ( this._root ) {

				if ( actualDisabledState ) {
					Utils.dom.addClass( this._root, 'disabled' );
				} else {
					Utils.dom.removeClass( this._root, 'disabled' );
				}

			}

			this.fire( 'disabled', actualDisabledState );

			// Publish event to child nodes
			for ( var i=0, len = this._children.length; i<len; i++ ) {
				this._children[i].onParentDisableStateChange( amount );
			}
		}

	}


	/**
	 * Tells this UI element to "embrace" an interface, and to load
	 * the interface appropriated mixin.
	 *
	 * Interfaces are starting with "I", mixins are starting with "M".
	 *
	 * So if you embrace an interface "IFoo", an attempt to apply the
	 * mixin "MFoo" will be made automatically.
	 *
	 */

	protected embrace( interfaceName: string ) {
		this._embrace = this._embrace || {};
		
		if ( typeof this._embrace[ interfaceName ] == 'undefined' ) {
			
			this._embrace[ interfaceName ] = true;

			// if the interface has an associated mixin ( IFocusable => MFocusable )
			// call the static mixin initializer on the event.
			var mixin: any = Global.env[ interfaceName.replace( /^I/, 'M' ) ];

			if ( mixin && mixin.initialize ) {
				mixin.initialize( this );
			}
		}
	}

	/**
	 * Returns true if this component contains other UI component
	 */
	public contains( child: UI ): boolean {
		if (child) {
			var cursor = child._owner;
			while (cursor) {
				if (cursor == this) {
					return true;
				}
				cursor = cursor = cursor.owner;
			}
		}
		return false;
	}

	/**
	 * Returns the visibility of this UI element
	 *
	 */

	get visible(): boolean {
		if ( !this._visible ) {
			return false;
		} else {
			if ( this._owner ) {
				return this._owner.visible;
			} else {
				return true;
			}
		}
	}

	/**
	 * Sets the visibility of this UI element.
	 *
	 */

	set visible( on: boolean ) {
		on = !!on;
		if ( on != this._visible ) {
			this._visible = on;
			if ( this._root ) {
				if ( on ) {
					this._root.style.display = '';
				} else {
					this._root.style.display = 'none';
				}
			}
			if ( this.owner ) {
				this.owner.onRepaint();
			}
		}
	}

	/**
	 * Returns the children of this UI element
	 *
	 */
	get childNodes(): UI[] {
		return this._children;
	}

	/**
	 * Returns the name of the current class as a string.
	 *
	 */
	get __class__(): string {
		var matches: string[] = /^function ([^\s\(]+)/.exec( this['constructor']['toString']() );
		return matches[1] || null;
	}

	/**
	 * Returns TRUE if this UI object implements an interface
	 */
	public implements( interfaceName: string ): boolean {
		return this._embrace && this._embrace[ interfaceName ] === true;
	}

	/**
	 * Returns the type of the layout this UI element has.
	 */
	get layoutType(): ELayoutType {
		return this._layout ? this._layout.type : ELayoutType.NONE;
	}

	/**
	 * Returns a layout instance of this UI element.
	 */
	get layout(): UI_Layout {
		return this._layout || ( this._layout = new UI_Layout( this ) );
	}

	protected get layoutDirty(): boolean {
		return this._layoutDirty;
	}

	protected set layoutDirty( on: boolean ) {
		on = !!on;

		this._layoutDirty = on;

		if ( on && this._children && this._children.length ) {
			for ( var i=0, len = this._children.length; i<len; i++ ) {
				this._children[i].layoutDirty = true;
			}
		}
	}

	set layoutType( type: ELayoutType ) {
		
		switch ( type ) {
			case ELayoutType.LEFT_TO_RIGHT:
			case ELayoutType.TOP_TO_BOTTOM:
				break;
			default:
				type = ELayoutType.NONE;
				break;
		}

		if ( type != this.layoutType ) {
			
			if ( type == ELayoutType.NONE ) {
				this._layout.free();
				this._layout = undefined;
			} else {
				this._layout = new UI_Layout( this );
				this._layout.type = type;
			}

		}
	}

	/**
	 * Destructor. Unbinds all events (DOM/UI_Event) allocated on the UI element.
	 */
	public free() {
		if ( this._children ) {
			for (var i = 0, len = this._children.length; i < len; i++ ) {
				this._children[i].free();
			}
		}
		super.free();
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

		// LAYOUT
		{
			"name": "layoutType",
			"type": "enum:ELayoutType"
		},
		{
			"name": "layout",
			"type": "UI_Layout"
		},
		{
			"name": "layout.marginLeft",
			"type": "number"
		},
		{
			"name": "layout.marginRight",
			"type": "number"
		},
		{
			"name": "layout.marginTop",
			"type": "number"
		},
		{
			"name": "layout.marginBottom",
			"type": "number"
		},
		{
			"name": "layout.columns",
			"type": "number|number[]"
		},
		{
			"name": "layout.rows",
			"type": "number|number[]"
		},
		{
			"name": "layout.type",
			"type": "enum:ELayoutType"
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

		// STATES
		{
			"name": "disabled",
			"type": "boolean"
		},

		// OTHER PROPERTIES
		{
			"name": "paintable",
			"type": "boolean"
		},
		{
			"name": "textAlign",
			"type": "enum:EAlignment"
		}
	]
} );