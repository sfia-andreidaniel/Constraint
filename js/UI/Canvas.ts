/* The UI_Canvas class is the base class for implementing grids, trees, dropdowns, etc.
 * The main idea of the UI_Canvas class is to create an infinite scrollable interface,
 * and to render virtual items on it, without using the slow DOM.
 * 
 * EG: A tree should extend the UI_Canvas, in order to draw it's nodes, and not implement
 * the tree nodes in a DOM way, because it would have limitations on speed and memory.
 *
 */
class UI_Canvas extends UI {

	public static _theme: any = {
		"defaultWidth": $I.number('UI.UI_Canvas/width'),
		"defaultHeight": $I.number('UI.UI_Canvas/height')
	};

	protected _dom = {
		"canvas": UI_Dom.create( 'canvas' ),

		// Freezed Viewport
		"fViewport": UI_Dom.create( 'div', 'freezed-viewport' ),
		"fCanvasSize": UI_Dom.create( 'div', 'canvas-size' ),

		"fHeader": UI_Dom.create( 'div', 'freezed-header' ),

		// Unfreezed Viewport
		"viewport": UI_Dom.create( 'div', 'viewport' ),
		"canvasSize": UI_Dom.create( 'div', 'canvas-size' )
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

	constructor( owner: UI, mixins: string[] = [] ) {
		super( owner, mixins, UI_Dom.create( 'div', 'ui UI_Canvas' ) );
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

			this._dom.canvas.width = this._viewportWidth = ( this._paintRect.width - this.padding.left - this.padding.right );
			this._dom.canvas.height= this._viewportHeight = ( this._paintRect.height - this.padding.top - this.padding.bottom );

			if ( this._defaultContext ) {

				this._defaultContext.width = this._viewportWidth - this._freezedWidth;
				this._defaultContext.height= this._viewportHeight - ( ~~this._hasHeader * UI_Column._theme.height );
				this._defaultContext.top = ( ~~this._hasHeader * UI_Column._theme.height );
				this._defaultContext.left = this._freezedWidth;

			}

			this.render( );
			this.postrender();

		} else {
			return false;
		}
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
					UI_Dom.addClass( this._root, 'has-header' );
					break;
				case false:
					this._root.removeChild( this._dom.fHeader );
					UI_Dom.removeClass( this._root, 'has-header' );
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

	protected _setupEvents_() {

		( function( me ) {

			me._dom.viewport.addEventListener( 'scroll', function( e ) {
				me._scrollLeft = me.scrollLeft;
				me._scrollTop = me.scrollTop;

				me.render();
			}, true );

		} )( this );

	}

}

Constraint.registerClass( {
	"name": "UI_Canvas",
	"extends": "UI",
	"properties": [
	]
} );