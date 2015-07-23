class UI_Screen_Window extends UI_Event {

	private _left:     number;
	private _top: 	   number;
	private _width:    number;
	private _height:   number;
	private _screen:   UI_Screen;
	
	private _ctx:      CanvasRenderingContext2D;

	constructor( screen: UI_Screen, left: number = 0, top: number = 0, width: number = 0, height: number = 0 ) {
		
		super();

		this._screen = screen;
		this._left   = left;
		this._top    = top;
		this._width  = width;
		this._height = height;

		this._ctx = this._screen.context;
		
		this.render();
	}

	get left(): number {
		return this._left;
	}

	get top(): number {
		return this._top;
	}

	get width(): number {
		return this._width;
	}

	get height(): number {
		return this._height;
	}

	set left( distance: number ) {
		distance = ~~distance;
		if ( distance != this._left ) {
			this._left = distance;
			this.render();
		}
	}

	set top( distance: number ) {
		distance = ~~distance;
		if ( distance != this._top ) {
			this._top = distance;
			this.render();
		}
	}

	set width( distance: number ) {
		distance = ~~distance;
		if ( distance != this._width ) {
			this._width = distance;
			this.render();
		}
	}

	set height( distance: number ) {
		distance = ~~distance;
		if ( distance != this._height ) {
			this._height = distance;
			this.render();
		}
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
		
		// DROP ALL EVENT LISTENERS.
		this.off(null,null);
	}

	// before anything is painted on the window, this method must be called
	public beginPaint() {
		this._ctx.save();
		this._ctx.beginPath();
		this._ctx.rect( this._top, this._left, this._width, this._height );
		this._ctx.clip();
	}

	// before ending the paint sequence, this method must be called.
	public endPaint() {
		this._ctx.restore();
	}

	// returns TRUE if a point in the main screen is contained by this window.
	public containsAbsolutePoint( x: number, y: number ): boolean {
		return x >= this._left && x <= this._left + this._width - 1 && y >= this._top && y <= this._top + this._height - 1;
	}


	/* CANVAS API METHODS AND PROPERTIES ARE ALSO IMPLEMENTED ON UI_Screen_Window.
	   All the methods that require coordinates, are translated to local window coordinates 
	*/

	public clearRect( x: number, y: number, width: number, height: number ) {
		this._ctx.clearRect( this._left + x, this._top + y, width, height );
	}

	public fillRect( x: number, y: number, width: number, height: number ) {
		this._ctx.fillRect( this._left + x, this._top + y, width, height );
	}

	public strokeRect( x: number, y: number, width: number, height: number ) {
		this._ctx.strokeRect( this._left + x, this._top + y, width, height );
	}

	public fillText( text: string, x: number, y: number, maxWidth?: number ) {
		this._ctx.fillText( text, this._left + x, this._top + y, maxWidth );
	}

	public strokeText( text: string, x: number, y: number, maxWidth?: number ) {
		this._ctx.strokeText( text, this._left + x, this._top + y, maxWidth );
	}

	get lineWidth(): number {
		return this._ctx.lineWidth;
	}

	set lineWidth( width: number ) {
		this._ctx.lineWidth = width;
	}

	get lineCap(): string {
		return this._ctx.lineCap;
	}

	set lineCap( cap: string ) {
		this._ctx.lineCap = cap;
	}

	get lineJoin(): string {
		return this._ctx.lineJoin;
	}

	set lineJoin( join: string ) {
		this._ctx.lineJoin = join;
	}

	get miterLimit(): number {
		return this._ctx.miterLimit;
	}

	set miterLimit( limit: number ) {
		this._ctx.miterLimit = limit;
	}

	get lineDash(): any {
		return this._ctx.getLineDash();
	}

	set lineDash( dash: any ) {
		this._ctx.setLineDash( dash );
	}

	get lineDashOffset( ): number {
		return this._ctx.lineDashOffset;
	}

	set lineDashOffset( offset: number ) {
		this._ctx.lineDashOffset = offset;
	}

	get font(): string {
		return this._ctx.font;
	}

	set font( font: string ) {
		this._ctx.font = font;
	}

	get textAlign(): string {
		return this._ctx.textAlign;
	}

	set textAlign( align: string ) {
		this._ctx.textAlign = align;
	}

	get textBaseline(): string {
		return this._ctx.textBaseline;
	}

	set textBaseline( baseLine: string ) {
		this._ctx.textBaseline = baseLine;
	}

	/*
	get direction(): string {
		return this._ctx.direction;
	}

	set direction( dir: string ) {
		this._ctx.direction = dir;
	}
	*/

	get fillStyle(): string {
		return this._ctx.fillStyle;
	}

	set fillStyle( fillStyle: string ) {
		this._ctx.fillStyle = fillStyle;
	}

	get strokeStyle(): string {
		return this._ctx.strokeStyle;
	}

	set strokeStyle( strokeStyle: string ) {
		this._ctx.strokeStyle = strokeStyle;
	}

	get shadowBlur(): number {
		return this._ctx.shadowBlur;
	}

	set shadowBlur( shadowBlur: number ) {
		this._ctx.shadowBlur = shadowBlur;
	}

	get shadowColor( ): string {
		return this._ctx.shadowColor;
	}

	set shadowColor( shadowColor: string ) {
		this._ctx.shadowColor = shadowColor;
	}

	get shadowOffsetX(): number {
		return this._ctx.shadowOffsetX;
	}

	set shadowOffsetX( shadowOffsetX: number ) {
		this._ctx.shadowOffsetX = shadowOffsetX;
	}

	get shadowOffsetY(): number {
		return this._ctx.shadowOffsetY;
	}

	set shadowOffsetY( shadowOffsetY: number ) {
		this._ctx.shadowOffsetY = shadowOffsetY;
	}

	public beginPath() {
		this._ctx.beginPath();
	}

	public closePath() {
		this._ctx.closePath();
	}

	public moveTo( x: number, y: number ) {
		this._ctx.moveTo( this._left + x, this._top + y );
	}

	public lineTo( x: number, y: number ) {
		this._ctx.lineTo( this._left + x, this._top + y );
	}

	public arc( x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean ) {
		this._ctx.arc( this._left + x, this._top + y, radius, startAngle, endAngle, anticlockwise );
	}

	public arcTo( x1: number, y1: number, x2: number, y2: number, radius: number ) {
		this._ctx.arcTo( this._left + x1, this._top + y1, this._left + x2, this._top + y2, radius );
	}

	public rect( x, y, width, height ) {
		this._ctx.rect( this._left + x, this._top + y, width, height );
	}

	public fill( ...args: any[] ) {
		this._ctx.fill.apply( this._ctx, args );
	}

	public stroke( ...args: any[] ) {
		this._ctx.stroke.apply( this._ctx, args );
	}

	get globalAlpha(): number {
		return this._ctx.globalAlpha;
	}

	set globalAlpha( alpha: number ) {
		this._ctx.globalAlpha = alpha;
	}

	get globalCompositeOperation(): string {
		return this._ctx.globalCompositeOperation;
	}

	set globalCompositeOperation( mode: string ) {
		this._ctx.globalCompositeOperation = mode;
	}

	public drawImage( ...args: any[] ) {
		switch ( args.length ) {
			case 3:
				this._ctx.drawImage( args[0], this._left + args[1], this._top + args[2] );
				break;
			case 5:
				this._ctx.drawImage( args[0], this._left + args[1], this._top + args[2], args[3], args[4] );
				break;
			case 9:
				this._ctx.drawImage( args[0], args[1], args[2], args[3], args[4], this._left + args[5], this._top + args[6], args[7], args[8] );
				break;
			default:
				throw new Error( 'Invalid arguments' );
				break;
		}
	}

	public createImageData( ...args: any[] ): ImageData {
		return this._ctx.createImageData.apply( this._ctx, args );
	}

	public getImageData( sx: number, sy: number, sw: number, sh: number ): ImageData {
		return this._ctx.getImageData( this._left + sx, this._top + sy, sw, sh );
	}

	public putImageData( ...args: any[] ) {
		args[1] += this._left;
		args[2] += this._top;
		this._ctx.putImageData.apply( this._ctx, args );
	}

	public save() {
		this._ctx.save();
	}

	public restore() {
		this._ctx.restore();
	}

}