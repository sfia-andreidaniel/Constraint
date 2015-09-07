class UI_Screen_Window extends UI_Event {

	private _screen:   UI_Screen;
	private _ctx:      CanvasRenderingContext2D;
	private _mapper:   UI_Canvas_ContextMapper;

	public ignoreKeyboardInput: boolean = false;

	constructor( screen: UI_Screen, left: number = 0, top: number = 0, width: number = 0, height: number = 0, logicalWidth: number = null, logicalHeight: number = null ) {
		
		super();

		this._screen = screen;
		this._ctx = this._screen.context;
		
		var client: IRect = ( logicalWidth === null && logicalHeight === null )
			? null
			: (
				logicalWidth == null
					? { width: null, height: logicalHeight }
					: { width: logicalWidth, height: null }
			);

		this._mapper = new UI_Canvas_ContextMapper( this._ctx, { "x": left, "y": top, "width": width, "height": height }, client );
		
		( function( me ) {

			me._mapper.on( 'scroll-changed', function() {
				me.render();
			} );

		} )( this );

		this.render();
	}

	get left(): number {
		return this._mapper.left;
	}

	set left( distance: number ) {
		distance = ~~distance;
		if ( distance != this._mapper.left ) {
			this._mapper.left = distance;
			this.render();
		}
	}

	get top(): number {
		return this._mapper.top;
	}

	set top( distance: number ) {
		distance = ~~distance;
		if ( distance != this._mapper.top ) {
			this._mapper.top = distance;
			this.render();
		}
	}

	get width(): number {
		return this._mapper.width;
	}

	set width( distance: number ) {
		distance = ~~distance;
		if ( distance != this._mapper.width ) {
			this._mapper.width = distance;
			this.render();
		}
	}

	get height(): number {
		return this._mapper.height;
	}

	set height( distance: number ) {
		distance = ~~distance;
		if ( distance != this._mapper.height ) {
			this._mapper.height = distance;
			this.render();
		}
	}

	get logicalWidth(): number {
		return this._mapper.logicalWidth;
	}

	set logicalWidth( width: number ) {
		this._mapper.logicalWidth = width;
	}

	get logicalHeight(): number {
		return this._mapper.logicalHeight;
	}

	set logicalHeight( height: number ) {
		this._mapper.logicalHeight = height;
	}

	get paintMode(): ECanvasPaintMode {
		return this._mapper.paintMode;
	}

	set paintMode( mode: ECanvasPaintMode ) {
		this._mapper.paintMode = mode;
	}

	get overflowX(): EClientScrollbarOverflow {
		return this._mapper.overflowX;
	}

	set overflowX( overflow: EClientScrollbarOverflow ) {
		this._mapper.overflowX = overflow;
	}

	get overflowY(): EClientScrollbarOverflow {
		return this._mapper.overflowY;
	}

	set overflowY(overflow: EClientScrollbarOverflow ) {
		this._mapper.overflowY = overflow;
	}

	get clientWidth(): number {
		return this._mapper.clientWidth;
	}

	get clientHeight(): number {
		return this._mapper.clientHeight;
	}

	get scrollLeft(): number {
		return this._mapper.scrollLeft;
	}

	set scrollLeft( left: number ) {
		this._mapper.scrollLeft = left;
	}

	get scrollTop(): number {
		return this._mapper.scrollTop;
	}

	set scrollTop( top: number ) {
		this._mapper.scrollTop = top;
	}

	get xScrollable(): boolean {
		return this._mapper.xScrollable;
	}

	get yScrollable(): boolean {
		return this._mapper.yScrollable;
	}

	get ctx(): UI_Canvas_ContextMapper {
		return this._mapper;
	}

	get zIndex(): number {
		return this._screen.getWinIndex( this );
	}

	set zIndex( index: number ) {
		this._screen.setWinIndex( this, index );
	}

	// trigger a screen rendering.
	public render() {
		this._screen.fire( 'render' );
	}

	// closes the window. Automatically unbinds all events on close.
	public close() {
		this._screen.closeWindow( this );
		
		this.fire( 'close' );

		// DROP ALL EVENT LISTENERS.
		this.off(null,null);
	}

}