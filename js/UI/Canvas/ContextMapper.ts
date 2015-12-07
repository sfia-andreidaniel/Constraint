/* The canvas context mapper makes a virtual "window" on a 2d canvas context,
   limiting the drawing inside the window region.

   Everything drawn outside the window region is clipped.

*/

class UI_Canvas_ContextMapper extends UI_Event {

	public static _theme = {
		scrollBar: {
			background: $I.string('UI.UI_Scrollbar/background'),
			draggerBackground: $I.string('UI.UI_Scrollbar/draggerBackground'),
			size: $I.number('UI.UI_Scrollbar/size')
		}
	};

	private _paintable: boolean = true;
	
	private _scrollLeft: number = 0;
	private _scrollTop : number = 0;
	private _overflowX : EClientScrollbarOverflow = EClientScrollbarOverflow.HIDDEN;
	private _overflowY : EClientScrollbarOverflow = EClientScrollbarOverflow.HIDDEN;
	private _clientWidth: number = 0;
	private _clientHeight: number = 0;
	private _paintMode: ECanvasPaintMode = ECanvasPaintMode.ABSOLUTE;

	// scrollbar dragger buttons sizes
	private _xDraggerSize: number = 0;
	private _xDraggerPos : number = 0;

	private _yDraggerSize: number = 0;
	private _yDraggerPos : number = 0;

	constructor( private ctx: CanvasRenderingContext2D, private size: IWindow, private logicalSize: IRect = null ) {
		super();

		this.logicalSize = this.logicalSize || { width: size.width, height: size.height };

		this.computeClientWidth();
		this.computeClientHeight();
	}

	get left(): number {
		return this.size.x;
	}

	get top(): number {
		return this.size.y;
	}

	get width(): number {
		return this.size.width;
	}

	get height(): number {
		return this.size.height;
	}

	set left( distance: number ) {
		this.size.x = ~~distance;
	}

	set top( distance: number ) {
		this.size.y = ~~distance;
	}

	set width( distance: number ) {
		this.size.width = ~~distance;
	}

	set height( distance: number ) {
		this.size.height = ~~distance;
	}

	get logicalWidth(): number {
		return this.logicalSize.width === null
			? this.size.width - ~~this.yScrollable * UI_Canvas_ContextMapper._theme.scrollBar.size
			: this.logicalSize.width;
	}

	set logicalWidth( width: number ) {
		width = ~~width;
		width = width < 0 ? 0 : width;
		if ( width != this.logicalSize.width ) {
			this.logicalSize.width = width;
			this.computeClientWidth();
			this.computeClientHeight();
		}
	}

	get logicalHeight(): number {
		return this.logicalSize.height === null
			? this.size.height - ~~this.xScrollable * UI_Canvas_ContextMapper._theme.scrollBar.size
			: this.logicalSize.height;
	}

	set logicalHeight( height: number ) {
		height = ~~height;
		height = height < 0 ? 0 : height;
		if ( height != this.logicalSize.height ) {
			this.logicalSize.height = height;
			this.computeClientHeight();
			this.computeClientWidth();
		}
	}

	private computeClientWidth() {
		this._clientWidth = this.size.width - 
			~~( ( this.size.width < this.logicalSize.width && this._overflowX != EClientScrollbarOverflow.HIDDEN) 
				|| 
				( this.size.height < this.logicalSize.height && this._overflowY != EClientScrollbarOverflow.HIDDEN )
				|| this._overflowY == EClientScrollbarOverflow.ALWAYS
			)
			* UI_Canvas_ContextMapper._theme.scrollBar.size;

		if ( this.logicalSize.height === null ) {
			this._clientWidth += UI_Canvas_ContextMapper._theme.scrollBar.size;
		}

		this.scrollLeft = this.scrollLeft;
	}

	private computeClientHeight() {
		this._clientHeight = this.size.height -
			~~( ( this.size.width < this.logicalSize.width && this._overflowX != EClientScrollbarOverflow.HIDDEN) 
				|| 
				( this.size.height < this.logicalSize.height && this._overflowY != EClientScrollbarOverflow.HIDDEN )
				|| this._overflowX == EClientScrollbarOverflow.ALWAYS
			)
			* UI_Canvas_ContextMapper._theme.scrollBar.size;

		if ( this.logicalSize.width === null ) {
			this._clientHeight += UI_Canvas_ContextMapper._theme.scrollBar.size;
		}

		this.scrollTop = this.scrollTop;
	}

	get clientWidth(): number {
		return this._clientWidth;
	}

	get clientHeight(): number {
		return this._clientHeight;
	}

	get overflowX(): EClientScrollbarOverflow {
		return this._overflowX;
	}

	set overflowX( value: EClientScrollbarOverflow ) {
		if ( value != this._overflowX ) {
			this._overflowX = [ EClientScrollbarOverflow.HIDDEN, EClientScrollbarOverflow.AUTO, EClientScrollbarOverflow.ALWAYS ].indexOf( value ) >= 0 
				? value 
				: EClientScrollbarOverflow.HIDDEN;
			this.computeClientWidth();
			this.computeClientHeight();
		}
	}

	get overflowY(): EClientScrollbarOverflow {
		return this._overflowY;
	}

	set overflowY( value: EClientScrollbarOverflow ) {
		if ( value != this._overflowY ) {
			this._overflowY = [ EClientScrollbarOverflow.HIDDEN, EClientScrollbarOverflow.AUTO, EClientScrollbarOverflow.ALWAYS ].indexOf( value ) >= 0 
				? value 
				: EClientScrollbarOverflow.HIDDEN;
			this.computeClientWidth();
			this.computeClientHeight();
		}
	}

	get scrollTop(): number {
		return this.yScrollable
			? this._scrollTop
			: 0;
	}

	set scrollTop( value: number ) {
		if ( this.yScrollable ) {
			value = ~~value;
			value = value < 0 ? 0 : value;
			value = value + this._clientHeight <= this.logicalSize.height
				? value
				: this.logicalSize.height - this._clientHeight - 1;
		} else {
			value = 0;
		}

		this._scrollTop = value;

		this._yDraggerSize = ~~( Math.pow( this.clientHeight, 2 ) / this.logicalSize.height );
		this._yDraggerPos = ~~( this._scrollTop * this.clientHeight / this.logicalSize.height )
	}

	get scrollLeft(): number {
		return this.xScrollable
			? this._scrollLeft
			: 0;
	}

	set scrollLeft( value: number ) {
		if ( this.xScrollable ) {
			value = ~~value;
			value = value < 0 ? 0 : value;
			value = value + this._clientWidth <= this.logicalSize.width
				? value
				: this.logicalSize.width - this._clientWidth - 1;
		} else {
			value = 0;
		}
		
		this._scrollLeft = value;

		this._xDraggerSize = ~~( Math.pow( this.clientWidth, 2 ) / this.logicalSize.width );
		this._xDraggerPos  = ~~( this._scrollLeft * this.clientWidth / this.logicalSize.width );
	}

	get paintMode(): ECanvasPaintMode {
		return this._paintMode;
	}

	get xScrollable(): boolean {
		return this.logicalSize.width === null ? false : this.clientWidth < this.logicalSize.width && this._overflowX != EClientScrollbarOverflow.HIDDEN;
	}

	get yScrollable(): boolean {
		return this.logicalSize.height === null ? false : this.clientHeight < this.logicalSize.height && this._overflowY != EClientScrollbarOverflow.HIDDEN;
	}

	private paintXScrollbar() {
		var draggerSize: number,
		    draggerLeft : number;

		this.paintMode = ECanvasPaintMode.ABSOLUTE;

		this.fillStyle = UI_Canvas_ContextMapper._theme.scrollBar.background;
		this.fillRect( 
			0, 
			this.clientHeight, 
			this.clientWidth,
			UI_Canvas_ContextMapper._theme.scrollBar.size
		);

		this.fillStyle = UI_Canvas_ContextMapper._theme.scrollBar.draggerBackground;
		this.fillRect( this._xDraggerPos, this.clientHeight, this._xDraggerSize, UI_Canvas_ContextMapper._theme.scrollBar.size );

	}

	private paintYScrollbar() {
		var draggerSize: number,
		    draggerTop : number;

		this.paintMode = ECanvasPaintMode.ABSOLUTE;

		this.fillStyle = UI_Canvas_ContextMapper._theme.scrollBar.background;
		this.fillRect( 
			this.clientWidth, 
			0, 
			UI_Canvas_ContextMapper._theme.scrollBar.size, 
			this.clientHeight 
		);

		//draggerSize = ~~( Math.pow( this.clientHeight, 2 ) / this.logicalSize.height );
		//draggerTop  = ~~( this.scrollTop * this.clientHeight / this.logicalSize.height );

		this.fillStyle = UI_Canvas_ContextMapper._theme.scrollBar.draggerBackground;
		this.fillRect( this.clientWidth, this._yDraggerPos, UI_Canvas_ContextMapper._theme.scrollBar.size, this._yDraggerSize );
	}

	public paintScrollbars() {
		if ( this.yScrollable ) {
			this.paintYScrollbar();
		}
		if ( this.xScrollable ) {
			this.paintXScrollbar();
		}
	}

	public handleScrolling( x: number, y: number ): Thenable<any> {

		// translate coordinates to relative ones.
		x -= this.left;
		y -= this.top;

		var targetScrollbar : EAlignment = null,
		    mousePoint	    : number,
		    clientSize		: number,
		    draggerPos  	: number,
		    draggerSize     : number,
		    logicalSize     : number;

		if ( x > this.clientWidth && y < this.clientHeight ) {
			// we're handling the Y Scrollbar
			targetScrollbar = EAlignment.TOP;
		} else
		if ( y > this.clientHeight && x < this.clientWidth ) {
			// we're handling the X Scrollbar
			targetScrollbar = EAlignment.LEFT;
		}

		if ( targetScrollbar === null )
			return Promise.resolve( true );

		if ( targetScrollbar == EAlignment.TOP ) {
			mousePoint = y;
			clientSize = this.clientHeight;
			draggerPos = this._yDraggerPos;
			draggerSize= this._yDraggerSize;
			logicalSize= this.logicalHeight;

		} else {
			mousePoint = x;
			clientSize = this.clientWidth;
			draggerPos = this._xDraggerPos;
			draggerSize = this._xDraggerSize;
			logicalSize = this.logicalWidth;
		}

		var setVal: ( value: number ) => void,
		    getVal: ( ) => number;

		( function( me ) {

		    setVal = function( value: number ) {
		    	if ( targetScrollbar == EAlignment.TOP ) {
		    		me.scrollTop = value;
		    	} else {
		    		me.scrollLeft = value;
		    	}
		    	me.fire( 'scroll-changed' );
		    };

		    getVal = function( ): number {
		    	if ( targetScrollbar == EAlignment.TOP ) {
		    		return me.scrollTop;
		    	} else {
		    		return me.scrollLeft;
		    	}
		    }

		} )( this );


		if ( mousePoint < draggerPos ) {

			return Promise.resolve( true ).then( function( dummy ) {
				setVal( getVal() - clientSize );
				return true;
			} )

		} else

		if ( mousePoint > draggerPos + draggerSize ) {

			return Promise.resolve( true ).then( function( dummy ) {
				setVal( getVal() + clientSize );
				return true;
			} );

		} else {

			return ( function( me ) {

				return new Promise( function( accept, reject ) {

					var canvas = me.ctx.canvas,
					    prevPoint: number = mousePoint;

					var mousemove: Utils_Event_Unbinder = me.onDOMEvent( canvas, EEventType.MOUSE_MOVE, function( ev: Utils_Event_Mouse ) {

						var target = ev.target,
						    point: number,
						    x: number = ev.layer.x,
						    y: number = ev.layer.y,
						    delta: number,
						    newScrollPos: number,
						    currentScrollPos: number = getVal();

						if ( target != canvas ) {
							return;
						}

						// translate locally
						x -= me.left;
						y -= me.top;
						
						point = targetScrollbar == EAlignment.TOP ? y : x;

						if ( point < 0 || point > clientSize ) {
							return;
						}

						if ( point != prevPoint ) {

							delta = point - prevPoint;

							newScrollPos = Math.round( ( ( currentScrollPos * clientSize ) / logicalSize ) + delta ) * ( logicalSize / clientSize );

							if ( newScrollPos < 0 ) {
								newScrollPos = 0;
							} else
							if ( newScrollPos + clientSize > logicalSize ) {
								newScrollPos = logicalSize - clientSize;
							}

							if ( newScrollPos != currentScrollPos ) {
								setVal( newScrollPos );
								prevPoint = point;
							}

						}

					}, true );

					me.onDOMEvent( document.body, EEventType.MOUSE_UP, function( ev: Utils_Event_Mouse ) {
						mousemove.remove();
						mousemove = undefined;
						accept();
					}, true, true );

				} );

			} )( this );


		}

	}

	set paintMode( mode: ECanvasPaintMode ) {
		if ( mode != this._paintMode ) {
			this._paintMode = mode == ECanvasPaintMode.LOGICAL
				? ECanvasPaintMode.LOGICAL
				: ECanvasPaintMode.ABSOLUTE;
		}
	}

	get paintable(): boolean {
		return this._paintable;
	}

	set paintable(on: boolean ) {
		this._paintable = !!on;
	}

	// before anything is painted on the window, this method must be called
	public beginPaint() {
		this.ctx.save();
		this.ctx.beginPath();
		this.ctx.rect( this.size.x, this.size.y, this.size.width, this.size.height );
		this.ctx.clip();
	}

	// before ending the paint sequence, this method must be called.
	public endPaint() {
		this.ctx.restore();
	}

	// returns TRUE if a point in the main screen is contained by this window.
	// use null to ignore checking on x on y.
	public containsAbsolutePoint( x: number, y: number ): boolean {
		return ( x === null || ( x >= this.size.x && x <= this.size.x + this.size.width - 1 ) ) 
			&& ( y === null || ( y >= this.size.y && y <= this.size.y + this.size.height - 1 ) );
	}

	public pointInClientViewport( x: number, y: number ): boolean {
		return ( x === null || ( x >= this.size.x && x <= this.size.x + this.clientWidth - 1 ) ) 
			&& ( y === null || ( y >= this.size.y && y <= this.size.y + this.clientHeight - 1 ) );
	}

	/* Transforms a string to fit a length, using the "..." at it's beginnig or at it's ending 
	 *
	 * Uses current canvas text settings.
	 */
	public dotDotDot( s: string, width: number ): string {
		s = String( s || '' );

		if ( s == '' || width <= 0 ) {
			return '';
		}

		var result: string,
		    result1: string,
			dotDotDot: number,
			align: string,
		    metrics: ITextMetrics = this.measureText( s ),
		    i: number,
		    len: number,
		    direction: EAlignment,
		    condition: boolean,
		    mid: number,
		    letterWidth: number,
		    letter: string,
		    pivot: number,
		    cWidth: number;

		if ( metrics.width <= width ) {
			return s;
		} else {
			dotDotDot = this.measureText('…').width;
			
			if ( metrics.width < dotDotDot ) {
				return '…';
			} else {
				align = this.textAlign;
				result = '';
				cWidth = dotDotDot;
				condition = true;

				switch ( align ) {
					case 'start': case 'left':
						direction = EAlignment.LEFT;
						i = 0;
						len = s.length;
						break;

					case 'right': case 'end':
						direction = EAlignment.RIGHT;
						len = s.length;
						i = len - 1;
						break;

					// center?
					default:
						direction = EAlignment.CENTER;
						result1 = '';
						len = s.length - 1;
						mid = ~~( ( len + 1 ) / 2 );
						i = 0;
						pivot = 0;
						break;
				}

				do {

					switch ( direction ) {
						case EAlignment.LEFT:
							letter = s[i];
							break;
						case EAlignment.RIGHT:
							letter = s[i];
							break;
						case EAlignment.CENTER:
							letter = pivot == 1 ? s[ len - i ] : s[ i ];
							break;
					}

					letterWidth = this.measureText( letter ).width;

					condition = ( letter != '\n' ) && ( cWidth + letterWidth <= width );

					if ( condition ) {

						cWidth += letterWidth;

						switch ( direction ) {
							case EAlignment.LEFT:
								result = result + letter;
								i++;
								condition = i < len;
								break;
							case EAlignment.RIGHT:
								result = letter + result;
								i--;
								condition = i > 0;
								break;
							case EAlignment.CENTER:
								if ( pivot == 1 ) {
									result1 = letter + result1;
								} else {
									result = result + letter;
								}
								pivot = 1 - pivot;
								if ( pivot == 0 ) {
									i++;
								}
								condition = i < mid;
								break;
						}
					}

				} while( condition );

				switch ( direction ) {
					case EAlignment.LEFT:
						return result + '…';
						break;
					case EAlignment.RIGHT:
						return '…' + result ;
						break;
					case EAlignment.CENTER:
						return result + '…' + result1;
						break;
				}
			}


		}

		return s;
	}

	public fillTextSearchBoldedStyle( str: string, substrToHighlight: string, caseSensitive: boolean, x: number, y: number ) {

		if ( !str ) {
			return;
		}

		var currentFont = this.font,
			normalFont = currentFont.replace(/^bold (.*)$/, '$1');

		if ( !substrToHighlight ) {
			this.font = normalFont;
			this.fillText(str, x, y);
			return;
		}

		var boldedFont = 'bold ' + normalFont,
			x: number = x,
			y: number = y,
			
			s: string = caseSensitive ? str : str.toLowerCase(), // string
			os: string = str, // original string

			s1: string = caseSensitive ? substrToHighlight : substrToHighlight.toLowerCase(), // substring
			part: string,

			partLen: number = 0,

			subLen: number = s1.length,

			metrics: any,
			wasBold = false;

		while (!!s) {

			if ( ( s.substr( 0, subLen ) ) == s1 && !wasBold) {
				partLen = subLen;
				part = os.substr(0, subLen);
				this.font = boldedFont;
				wasBold = true;
			} else {
				part = !wasBold ? os[0] : os;
				partLen = !wasBold ? 1 : os.length;
				this.font = normalFont;
			}

			this.fillText(part, x, y);
			metrics = this.measureText(part);
			
			x += metrics.width;

			s = s.substr(partLen);
			os = os.substr(partLen);
		}

	}

	/* CANVAS API METHODS AND PROPERTIES ARE IMPLEMENTED ON UI_Canvas_ContextMapper
	   All the methods that require coordinates, are translated to local window coordinates 
	*/

	get imageSmoothingEnabled(): boolean {
		return this.ctx['imageSmoothingEnabled'];
	}

	set imageSmoothingEnabled( on: boolean ) {
		this.ctx['imageSmoothingEnabled'] = !!on;
	}

	public clearRect( x: number, y: number, width: number, height: number ) {
		if ( this._paintable )
		this.ctx.clearRect( this.size.x + x, this.size.y + y, width, height );
	}

	public fillRect( x: number, y: number, width: number, height: number ) {
		if ( this._paintable )
		this.ctx.fillRect( this.size.x + x, this.size.y + y, width, height );
	}

	public strokeRect( x: number, y: number, width: number, height: number ) {
		if ( this._paintable )
		this.ctx.strokeRect( this.size.x + x, this.size.y + y, width, height );
	}

	public fillText( ...args: any[] ) {
		if ( this._paintable ) {
			args[1] += this.size.x;
			args[2] += this.size.y;
			this.ctx.fillText.apply( this.ctx, args );
		}
	}

	public strokeText( text: string, x: number, y: number, maxWidth?: number ) {
		if ( this._paintable )
		this.ctx.strokeText( text, this.size.x + x, this.size.y + y, maxWidth );
	}

	public measureText( text: string ): ITextMetrics {
		return this.ctx.measureText( text );
	}

	get lineWidth(): number {
		return this.ctx.lineWidth;
	}

	set lineWidth( width: number ) {
		this.ctx.lineWidth = width;
	}

	get lineCap(): string {
		return this.ctx.lineCap;
	}

	set lineCap( cap: string ) {
		this.ctx.lineCap = cap;
	}

	get lineJoin(): string {
		return this.ctx.lineJoin;
	}

	set lineJoin( join: string ) {
		this.ctx.lineJoin = join;
	}

	get miterLimit(): number {
		return this.ctx.miterLimit;
	}

	set miterLimit( limit: number ) {
		this.ctx.miterLimit = limit;
	}

	get lineDash(): any {
		return this.ctx.getLineDash();
	}

	set lineDash( dash: any ) {
		this.ctx.setLineDash( dash );
	}

	get lineDashOffset( ): number {
		return this.ctx.lineDashOffset;
	}

	set lineDashOffset( offset: number ) {
		this.ctx.lineDashOffset = offset;
	}

	get font(): string {
		return this.ctx.font;
	}

	set font( font: string ) {
		this.ctx.font = font;
	}

	get textAlign(): string {
		return this.ctx.textAlign;
	}

	set textAlign( align: string ) {
		this.ctx.textAlign = align;
	}

	get textBaseline(): string {
		return this.ctx.textBaseline;
	}

	set textBaseline( baseLine: string ) {
		this.ctx.textBaseline = baseLine;
	}

	/*
	get direction(): string {
		return this.ctx.direction;
	}

	set direction( dir: string ) {
		this.ctx.direction = dir;
	}
	*/

	get fillStyle(): string {
		return <string>this.ctx.fillStyle;
	}

	set fillStyle( fillStyle: string ) {
		this.ctx.fillStyle = fillStyle;
	}

	get strokeStyle(): string {
		return <string>this.ctx.strokeStyle;
	}

	set strokeStyle( strokeStyle: string ) {
		this.ctx.strokeStyle = strokeStyle;
	}

	get shadowBlur(): number {
		return this.ctx.shadowBlur;
	}

	set shadowBlur( shadowBlur: number ) {
		this.ctx.shadowBlur = shadowBlur;
	}

	get shadowColor( ): string {
		return this.ctx.shadowColor;
	}

	set shadowColor( shadowColor: string ) {
		this.ctx.shadowColor = shadowColor;
	}

	get shadowOffsetX(): number {
		return this.ctx.shadowOffsetX;
	}

	set shadowOffsetX( shadowOffsetX: number ) {
		this.ctx.shadowOffsetX = shadowOffsetX;
	}

	get shadowOffsetY(): number {
		return this.ctx.shadowOffsetY;
	}

	set shadowOffsetY( shadowOffsetY: number ) {
		this.ctx.shadowOffsetY = shadowOffsetY;
	}

	public beginPath() {
		this.ctx.beginPath();
	}

	public closePath() {
		this.ctx.closePath();
	}

	public moveTo( x: number, y: number ) {
		this.ctx.moveTo( this.size.x + x, this.size.y + y );
	}

	public lineTo( x: number, y: number ) {
		if ( this._paintable )
		this.ctx.lineTo( this.size.x + x, this.size.y + y );
	}

	public arc( x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean ) {
		if ( this._paintable )
		this.ctx.arc( this.size.x + x, this.size.y + y, radius, startAngle, endAngle, anticlockwise );
	}

	public arcTo( x1: number, y1: number, x2: number, y2: number, radius: number ) {
		if ( this._paintable )
		this.ctx.arcTo( this.size.x + x1, this.size.y + y1, this.size.x + x2, this.size.y + y2, radius );
	}

	public rect( x, y, width, height ) {
		if ( this._paintable )
		this.ctx.rect( this.size.x + x, this.size.y + y, width, height );
	}

	public fill( ...args: any[] ) {
		if ( this._paintable )
		this.ctx.fill.apply( this.ctx, args );
	}

	public stroke( ...args: any[] ) {
		if ( this._paintable )
		this.ctx.stroke.apply( this.ctx, args );
	}

	get globalAlpha(): number {
		return this.ctx.globalAlpha;
	}

	set globalAlpha( alpha: number ) {
		this.ctx.globalAlpha = alpha;
	}

	get globalCompositeOperation(): string {
		return this.ctx.globalCompositeOperation;
	}

	set globalCompositeOperation( mode: string ) {
		this.ctx.globalCompositeOperation = mode;
	}

	public drawImage( ...args: any[] ) {
		if ( this._paintable ) {
			switch ( args.length ) {
				case 3:
					this.ctx.drawImage( args[0], this.size.x + args[1], this.size.y + args[2] );
					break;
				case 5:
					this.ctx.drawImage( args[0], this.size.x + args[1], this.size.y + args[2], args[3], args[4] );
					break;
				case 9:
					this.ctx.drawImage( args[0], args[1], args[2], args[3], args[4], this.size.x + args[5], this.size.y + args[6], args[7], args[8] );
					break;
				default:
					throw new Error( 'Invalid arguments' );
					break;
			}
		}
	}

	public createImageData( ...args: any[] ): ImageData {
		return this.ctx.createImageData.apply( this.ctx, args );
	}

	public getImageData( sx: number, sy: number, sw: number, sh: number ): ImageData {
		return this.ctx.getImageData( this.size.x + sx, this.size.y + sy, sw, sh );
	}

	public putImageData( ...args: any[] ) {
		if ( this._paintable ){
			args[1] += this.size.x;
			args[2] += this.size.y;
			this.ctx.putImageData.apply( this.ctx, args );
		}
	}

	private paintVerticalScrollbar( logicalHeight: number, scrollTop: number, clientHeight: number ): void {
		
	}

	public save() {
		this.ctx.save();
	}

	public restore() {
		this.ctx.restore();
	}

}