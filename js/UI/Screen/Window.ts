class UI_Screen_Window extends UI_Event {

	private _screen:   UI_Screen;
	private _ctx:      CanvasRenderingContext2D;
	private _mapper:   UI_Canvas_ContextMapper;

	constructor( screen: UI_Screen, left: number = 0, top: number = 0, width: number = 0, height: number = 0 ) {
		
		super();

		this._screen = screen;
		this._ctx = this._screen.context;
		this._mapper = new UI_Canvas_ContextMapper( this._ctx, { "x": left, "y": top, "width": width, "height": height } );
		
		this.render();
	}

	get left(): number {
		return this._mapper.left;
	}

	get top(): number {
		return this._mapper.top;
	}

	get width(): number {
		return this._mapper.width;
	}

	get height(): number {
		return this._mapper.height;
	}

	set left( distance: number ) {
		distance = ~~distance;
		if ( distance != this._mapper.left ) {
			this._mapper.left = distance;
			this.render();
		}
	}

	set top( distance: number ) {
		distance = ~~distance;
		if ( distance != this._mapper.top ) {
			this._mapper.top = distance;
			this.render();
		}
	}

	set width( distance: number ) {
		distance = ~~distance;
		if ( distance != this._mapper.width ) {
			this._mapper.width = distance;
			this.render();
		}
	}

	set height( distance: number ) {
		distance = ~~distance;
		if ( distance != this._mapper.height ) {
			this._mapper.height = distance;
			this.render();
		}
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