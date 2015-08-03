/* The UI_Canvas class is the base class for implementing grids, trees, dropdowns, etc.
 * The main idea of the UI_Canvas class is to create an infinite scrollable interface,
 * and to render virtual items on it, without using the slow DOM.
 * 
 * EG: A tree should extend the UI_Canvas, in order to draw it's nodes, and not implement
 * the tree nodes in a DOM way, because it would have limitations on speed and memory.
 *
 * @events:
 *     scroll-x  ()
 *     scroll-y  ()
 *     mousedown ( point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean )
 *     mouseup   ( point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean )
 *     mousemove ( point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean )
 *     click     ( point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean )
 *     dblclick  ( point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean )
 */
class UI_Canvas extends UI {

	public static _theme: any = {
		"defaultWidth" 			   : $I.number('UI.UI_Canvas/width'),
		"defaultHeight" 		   : $I.number('UI.UI_Canvas/height'),
		"font": {
			"size"    			   : $I.number('UI.UI_Canvas/font.size'),
			"family"  			   : $I.string('UI.UI_Canvas/font.family'),
			"font"   			   : $I.number('UI.UI_Canvas/font.size') + "px " + $I.string('UI.UI_Canvas/font.family'),
			"color"  : {
				"normal"           : $I.string('UI.UI_Canvas/font.color.normal'),
				"disabled"         : $I.string('UI.UI_Canvas/font.color.disabled'),
				"selectedEnabled"  : $I.string('UI.UI_Canvas/font.color.selectedEnabled'),
				"selectedDisabled" : $I.string('UI.UI_Canvas/font.color.selectedDisabled'),
				"selectedInactive" : $I.string('UI.UI_Canvas/font.color.selectedInactive')
			}
		},
		"background": {
			"disabled"         : $I.string('UI.UI_Canvas/background.disabled'),
			"enabled"          : $I.string('UI.UI_Canvas/background.enabled'),
			"selected"         : $I.string('UI.UI_Canvas/background.selected'),
			"selectedDisabled" : $I.string('UI.UI_Canvas/background.selectedDisabled'),
			"selectedInactive" : $I.string('UI.UI_Canvas/background.selectedInactive')
		}
	};

	protected _dom = {
		"canvas": Utils.dom.create( 'canvas' ),

		// Freezed Viewport
		"fViewport": Utils.dom.create( 'div', 'freezed-viewport' ),
		"fCanvasSize": Utils.dom.create( 'div', 'canvas-size' ),

		"fHeader": Utils.dom.create( 'div', 'freezed-header' ),

		// Unfreezed Viewport
		"viewport": Utils.dom.create( 'div', 'viewport' ),
		"canvasSize": Utils.dom.create( 'div', 'canvas-size' )
	};

	protected _logicalWidth: number = 0;
	protected _logicalHeight: number = 0;
	protected _viewportWidth: number = 0;
	protected _viewportHeight: number = 0;

	protected _scrollLeft: number = 0;
	protected _scrollTop: number = 0;

	protected _hasHeader: boolean = false;
	protected _freezedWidth: number = 0;

	protected _defaultContext: UI_Canvas_ContextMapper;
	protected _headerContext:  UI_Canvas_ContextMapper;

	private   _previousViewportWidth: number = null;
	private   _previousViewportHeight: number = null;

	// Required by IGridInterface / MGridInterface
	public    selectedIndex: number;
	public    rowHeight: number;
	public    freezedColumns: UI_Column[];
	public    freeColumns: UI_Column[];

	constructor( owner: UI, mixins: string[] = [] ) {
		super( owner, mixins, Utils.dom.create( 'div', 'ui UI_Canvas' ) );
		
		this._root.appendChild( this._dom.canvas );
		this._root.appendChild( this._dom.viewport );

		this._dom.viewport.appendChild( this._dom.canvasSize );
		this._dom.fViewport.appendChild( this._dom.fCanvasSize );

		this._width = UI_Canvas._theme.defaultWidth;
		this._height= UI_Canvas._theme.defaultHeight;

		this._setupEvents_();
	}

	/* We're overriding the repaint of the canvas, in order to optimize it
	 */
	public onRepaint(): boolean {
		if ( super.onRepaint() ) {

			/* Resize the canvas, and trigger the "render" method.
			 */

			var changed: boolean = false;

			this._dom.canvas.width = this._viewportWidth = ( this._paintRect.width - this.padding.left - this.padding.right );
			this._dom.canvas.height= this._viewportHeight = ( this._paintRect.height - this.padding.top - this.padding.bottom );

			if ( this._viewportWidth != this._previousViewportWidth ) {
				this._previousViewportWidth = this._viewportWidth;
				changed = true;
			}

			if ( this._viewportHeight != this._previousViewportHeight ) {
				this._previousViewportHeight = this._viewportHeight;
				changed = true;
			}

			if ( changed ) {
				this.fire( 'viewport-resized' );
			}

			if ( this._defaultContext ) {

				this._defaultContext.width = this._viewportWidth - this._freezedWidth;
				this._defaultContext.height= this._viewportHeight - ( ~~this._hasHeader * UI_Column._theme.height );
				this._defaultContext.top = ( ~~this._hasHeader * UI_Column._theme.height );
				this._defaultContext.left = this._freezedWidth;

			}

			if ( this._headerContext ) {
				this._headerContext.height = ( ~~this._hasHeader * UI_Column._theme.height );
				this._headerContext.width  = this._viewportWidth;
			}

			this.render( );

		} else {
			return false;
		}
	}

	/* What we can insert on UI_Canvas is "UI_Column" only, so we alter the
	   "insert" method of UI.
	 */
	public insert( child: UI ): UI {
		if ( !child || !( child instanceof UI_Column ) ) {
			throw new Error("Invalid child! Excepting UI_Column, nothing can be inserted inside UI_Canvas" );
		} else {
			super.insert( child );
			this.fire( 'column-changed', child );
			return child;
		}
	}

	get globalContext(): CanvasRenderingContext2D {
		return this._dom.canvas.getContext('2d');
	}

	get defaultContext(): UI_Canvas_ContextMapper {
		if ( this._defaultContext ) {
			return this._defaultContext;
		} else {
			this._defaultContext = new UI_Canvas_ContextMapper(
				this._dom.canvas.getContext('2d'),
				{
					"x": this._freezedWidth,
					"y": ( ~~this._hasHeader * UI_Column._theme.height ),
					"width": this._viewportWidth - this._freezedWidth,
					"height": this._viewportHeight - ( ~~this._hasHeader * UI_Column._theme.height )
				}
			);
			return this._defaultContext;
		}
	}

	get headerContext(): UI_Canvas_ContextMapper {
		if ( this._headerContext ) {
			return this._headerContext;
		} else {
			this._headerContext = new UI_Canvas_ContextMapper(
				this._dom.canvas.getContext('2d'),
				{
					"x": 0,
					"y": 0,
					"width": this._viewportWidth,
					"height": ( ~~this._hasHeader * UI_Column._theme.height )
				}
			);
			return this._headerContext;
		}
	}

	get header(): boolean {
		return this._hasHeader;
	}

	set header( on: boolean ) {
		on = !!on;
		if ( on != this._hasHeader ) {
			this._hasHeader = on;

			switch ( on ) {
				case true:
					this._root.appendChild( this._dom.fHeader );
					Utils.dom.addClass( this._root, 'has-header' );
					break;
				case false:
					this._root.removeChild( this._dom.fHeader );
					Utils.dom.removeClass( this._root, 'has-header' );
					break;
			}

			this.onRepaint();
		}
	}

	get freezedWidth(): number {
		return this._freezedWidth;
	}

	set freezedWidth( width: number ) {
		width = ~~width;
		width = width < 0 ? 0 : width;
		if ( width != this._freezedWidth ) {

			if ( width == 0 ) {
				this._root.removeChild( this._dom.fViewport );
			} else {
				this._root.appendChild( this._dom.fViewport );
			}

			this._dom.viewport.style.left = width + "px";
			this._dom.fViewport.style.width = width + "px";

			this._freezedWidth = width;

			this.onRepaint();
		}
	}

	// renders something on the canvas before the main render is started.
	public prerender() {

	}

	// renders something on the canvas.
	public render() {
	}

	// renders something on the canvas after the main render is done.
	// this is usefull in order to always-draw the columns on the canvas.
	public postrender() {
	}

	get logicalWidth(): number {
		return this._logicalWidth;
	}

	set logicalWidth( width: number ) {
		width = ~~width;
		if ( width != this._logicalWidth ) {
			this._logicalWidth = width;
			this._dom.canvasSize.style.width = this._logicalWidth + "px";
		}
	}

	get logicalHeight(): number {
		return this._logicalHeight;
	}

	set logicalHeight( height: number ) {
		height = ~~height;
		if ( height != this._logicalHeight ) {
			this._logicalHeight = height;
			this._dom.canvasSize.style.height = this._logicalHeight + "px";
			this._dom.fCanvasSize.style.height = this._logicalHeight + "px";
		}
	}

	get scrollTop(): number {
		return this._dom.viewport.scrollTop || this._scrollTop;
	}

	get scrollLeft(): number {
		return this._dom.viewport.scrollLeft || this._scrollLeft;
	}

	set scrollTop( top: number ) {
		top = ~~top;
		if ( top != this.scrollTop ) {
			this._dom.viewport.scrollTop = this._scrollTop = top;
			this.render();
		}
	}

	set scrollLeft( left: number ) {
		left = ~~left;
		if ( left != this.scrollLeft ) {
			this._dom.viewport.scrollLeft = this._scrollLeft = left;
			this.render();
		}
	}

	get viewportWidth(): number {
		return this._viewportWidth;
	}

	get viewportHeight(): number {
		return this._viewportHeight;
	}

	private translateMouseEvent( x: number, y: number, target ): IPoint {

		var result = { "x": 0, "y": 0 };

		switch ( true ) {
			case target == this._dom.fHeader:
				result.y = y - UI_Column._theme.height;
				result.x = x + ( x > this.freezedWidth ? this.scrollLeft : 0 );
				break;

			case target == this._dom.canvasSize:
				result.x = x + this.freezedWidth - this.scrollLeft;
				result.y = y;
				break;

			case target == this._dom.viewport:
				return null;
				break;

			case target == this._dom.fCanvasSize:
				result.x = x;
				result.y = y + this.scrollTop;
				if ( result.y > this.logicalHeight ) {
					return null;
				}

				break;

			default:
				//console.log( target, x, y );
				return null;
				break;
		}

		return result;
	}

	protected _setupEvents_() {

		( function( me ) {

			me._dom.viewport.addEventListener( 'scroll', function( e ) {

				var x: boolean = false,
				    y: boolean = false;

				if ( me._scrollLeft != me.scrollLeft ) {
					x = true;
				}

				if ( me._scrollTop != me.scrollTop ) {
					y = true;
				}

				me._scrollLeft = me.scrollLeft;
				me._scrollTop = me.scrollTop;

				if ( x ) {
					me.fire( 'scroll-x' );
				}

				if ( y ) {
					me.fire( 'scroll-y' );
				}

				me.render();
			}, true );

			me._root.addEventListener( 'mousemove', function( e ) {

				if ( me.disabled ) {
					return;
				}

				var x = e.offsetX,
				    y = e.offsetY,

				    result = me.translateMouseEvent( x, y, e.target );

				if ( result )
					me.fire( 'mousemove', result, e.which, e.ctrlKey, e.altKey, e.shiftKey );

			}, true );

			me._root.addEventListener( 'mousedown', function( e ) {

				if ( me.disabled ) {
					return;
				}

				var x = e.offsetX,
					y = e.offsetY,
					result = me.translateMouseEvent( x, y, e.target );

				if ( result )
					me.fire( 'mousedown', result, e.which, e.ctrlKey, e.altKey, e.shiftKey );

			} );

			me._root.addEventListener( 'mouseup', function( e ) {

				if ( me.disabled ) {
					return;
				}

				var x = e.offsetX,
				    y = e.offsetY,
				    result = me.translateMouseEvent( x, y, e.target );

				if ( result )
					me.fire( 'mouseup', result, e.which, e.ctrlKey, e.altKey, e.shiftKey );

			} );

			me._root.addEventListener( 'click', function( e ) {

				if ( me.disabled ) {
					return;
				}

				var x = e.offsetX,
				    y = e.offsetY,
				    result = me.translateMouseEvent( x, y, e.target );

				if ( result )
					me.fire( 'click', result, e.which, e.ctrlKey, e.altKey, e.shiftKey );

			} );

			me._root.addEventListener( 'dblclick', function( e ) {

				if ( me.disabled ) {
					return;
				}

				var x = e.offsetX,
				    y = e.offsetY,
				    result = me.translateMouseEvent( x, y, e.target );

				if ( result )
					me.fire( 'dblclick', result, e.which, e.ctrlKey, e.altKey, e.shiftKey );

			} );

		} )( this );

	}

	public itemAt( index: number ): Store_Item {
		throw new Error( 'Should be implemented if ancestor implements a MGridInterface' );
	}

}

Constraint.registerClass( {
	"name": "UI_Canvas",
	"extends": "UI",
	"properties": [
	]
} );