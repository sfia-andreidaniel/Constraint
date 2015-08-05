class UI_Screen extends UI_Event {

	private _canvas: HTMLCanvasElement;
	private _width: number = 0;
	private _height: number = 0;

	private _windows: UI_Screen_Window[] = [];
	private _repainter: UI_Throttler;
	private _visible: boolean = false;
	private _pointerEvents: boolean = false;

	// USED WHEN SCREEN LOCKS A WINDOW FOR SCROLLING
	private _targetScrollWin: UI_Screen_Window = null;
	private _targetScrollBar: EAlignment = EAlignment.RIGHT;

	static get get(): UI_Screen {
		return UI_DialogManager.get.screen || null;
	}

	constructor() {
		super();
		this._canvas = Utils.dom.create( 'canvas', 'UI_Screen' );
		this._setupEvents_();
		
	}

	get width(): number {
		return this._width;
	}

	get heigth(): number {
		return this._height;
	}

	get visible(): boolean {
		return this._visible;
	}

	set visible( visible: boolean ) {
		
		visible = !!visible;
		
		if ( visible != this._visible ) {
			this._visible = visible;
			switch ( visible ) {
				case true:
					Utils.dom.addClass( this._canvas, 'visible' );
					break;
				case false:

					for ( var i=0, len = this._windows.length; i<len; i++ ) {
						this._windows[i].close();
					}

					Utils.dom.removeClass( this._canvas, 'visible' );

					this.render();

					break;
			}
		}
	}

	set pointerEvents( on: boolean ) {
		on = !!on;
		if ( on != this._pointerEvents ) {
			this._pointerEvents = on;
			if ( !on ) {
				this._canvas.style.pointerEvents = '';
			} else {
				this._canvas.style.pointerEvents = 'all';
			}
		}
	}

	public resize( width: number, height: number ) {

		width = ~~width;
		height= ~~height;

		if ( width != this._width || height != this._height ) {
			this._width = width;
			this._height = height;
			this._canvas.width = width;
			this._canvas.height= height;
			this.render();
		}
	}

	public getWinIndex( win: UI_Screen_Window ): number {
		return this._windows.indexOf( win );
	}

	public setWinIndex( win: UI_Screen_Window, index: number ) {
		
		var oldIndex: number = this.getWinIndex( win );
		
		if ( oldIndex != index ) {

			if ( oldIndex == -1 ) {
				throw new Error( 'Window is not registered in screen' );
			}

			this._windows.splice( oldIndex, 1 );

			switch ( index ) {
				
				case -1:
					// push backest
					this._windows.unshift( win );
					break;

				case null:
					// push toppest
					this._windows.push( win );
					break;

				default:
					this._windows.splice( index, 0, win );
					break;

			}

			this.render();

		}

	}

	public closeWindow( win: UI_Screen_Window ) {
		var oldIndex: number = this.getWinIndex( win );
		if ( oldIndex > -1 ) {
			this._windows.splice( oldIndex, 1 );
			if ( this._windows.length == 0 ) {
				this.visible = false;
			}
			this.updatePointerEventsState();
			this.render();
		}
	}

	// repaints all windows
	public render() {

		// clears the screen
		var ctx = this._canvas.getContext( '2d' );
		ctx.clearRect( 0, 0, this._width, this._height );

		for ( var i=0, len = this._windows.length; i<len; i++ ) {
			this._windows[i].fire( 'render', ctx );
			this._windows[i].ctx.paintScrollbars();
		}
	}

	public open( where: any ) {
		( where || document.body ).appendChild( this._canvas );
	}

	public updatePointerEventsState() {
		if ( this.visible ) {
			var x: number = UI_DialogManager.get.pointerX,
			    y: number = UI_DialogManager.get.pointerY,
			    i: number,
			    len: number = this._windows.length;

			if ( !len ) {
				this.pointerEvents = false;
			} else {
				for ( i=0; i<len; i++ ) {
					if ( this._windows[i].ctx.containsAbsolutePoint( x, y ) ) {
						this.pointerEvents = true;
						return;
					}
				}
				this.pointerEvents = false;
			}
		} else {
			this.pointerEvents = false;
		}
	}

	public handleMouseDown( ev ): boolean {

		var x: number = ev.pageX,
		    y: number = ev.pageY,
		    len: number = this._windows.length,
		    i: number,
		    handled: boolean = false;

		for ( i = len-1; i >= 0; i-- ) {
			if ( this._windows[i].ctx.containsAbsolutePoint( x, y ) ) {
				
				if ( this._windows[i].ctx.pointInClientViewport( x, y ) ) {

					this._windows[i].fire( 
						'mousedown', 
						x - this._windows[i].left + this._windows[i].scrollLeft, 
						y - this._windows[i].top + this._windows[i].scrollTop,
						ev.which
					);

				}
				
				handled = true;
				break;
			}
		}

		if ( !handled ) {
			this.fire( 'mousedown', x, y, ev.which );
		} else {
			ev.preventDefault();
			ev.stopPropagation();
		}

		return handled;
	}

	public handleMouseMove( ev ): boolean {

		var x: number = ev.pageX,
		    y: number = ev.pageY,
		    len: number = this._windows.length,
		    i: number,
		    handled: boolean = false;

		for ( i = len-1; i >= 0; i-- ) {
			if ( this._windows[i].ctx.containsAbsolutePoint( x, y ) ) {

				if ( this._windows[i].ctx.pointInClientViewport( x, y ) ) {
				
					this._windows[i].fire( 
						'mousemove', 
						x - this._windows[i].left + this._windows[i].scrollLeft,
						y - this._windows[i].top  + this._windows[i].scrollTop,
						ev.which
					);

				}

				handled = true;
				break;
			}
		}

		if ( !handled ) {
			this.fire( 'mousemove', x, y, ev.which );
		} else {
			ev.preventDefault();
			ev.stopPropagation();
		}

		this.pointerEvents = handled;

		return handled;
	}

	public handleDoubleClick( ev ): boolean {

		var x: number = ev.pageX,
		    y: number = ev.pageY,
		    len: number = this._windows.length,
		    i: number,
		    handled: boolean = false;

		for ( i = len-1; i >= 0; i-- ) {
			if ( this._windows[i].ctx.containsAbsolutePoint( x, y ) ) {

				if ( this._windows[i].ctx.pointInClientViewport( x, y ) ) {

					this._windows[i].fire( 
						'dblclick', 
						x - this._windows[i].left + this._windows[i].scrollLeft,
						y - this._windows[i].top + this._windows[i].scrollTop,
						ev.which
					);

				}

				handled = true;
				break;
			}
		}

		if ( !handled ) {
			this.fire( 'dblclick', x, y, ev.which );
		} else {
			ev.preventDefault();
			ev.stopPropagation();
		}

		return handled;

	}

	public handleMouseUp( ev ): boolean {
		
		var x: number = ev.pageX,
		    y: number = ev.pageY,
		    len: number = this._windows.length,
		    i: number,
		    handled: boolean = false;

		for ( i = len-1; i >= 0; i-- ) {
			if ( this._windows[i].ctx.containsAbsolutePoint( x, y ) ) {

				if ( this._windows[i].ctx.pointInClientViewport( x, y ) ) {

					this._windows[i].fire( 
						'mouseup', 
						x - this._windows[i].left + this._windows[i].scrollLeft,
						y - this._windows[i].top  + this._windows[i].scrollTop,
						ev.which
					);

				}

				handled = true;
				break;
			}
		}

		if ( !handled ) {
			this.fire( 'mouseup', x, y, ev.which );
		} else {
			ev.preventDefault();
			ev.stopPropagation();
		}

		return handled;

	}

	public handleScroll( ev ): boolean {

		var x: number = ev.pageX,
		    y: number = ev.pageY,
		    len: number = this._windows.length,
		    i: number,
		    handled: boolean = false,
		    wheelX: number = - ( ev.wheelDeltaX || -ev.deltaX || 0 ),
		    wheelY: number = - ( ev.wheelDeltaY || -ev.deltaY || 0 );

		for ( i = len - 1; i >= 0; i-- ) {
			if ( this._windows[i].ctx.containsAbsolutePoint( x, y ) ) {
				this._windows[i].fire( 'scroll', wheelX, wheelY );
				handled = true;
			}
		}

		if ( !handled ) {
			this.fire( 'scroll', wheelX, wheelY );
		} else {
			ev.preventDefault();
			ev.stopPropagation();
		}

		return handled;

	}

	public handleMouseClick( ev ): boolean {

		var x: number = ev.pageX,
		    y: number = ev.pageY,
		    len: number = this._windows.length,
		    i: number,
		    handled: boolean = false;

		for ( i = len-1; i >= 0; i-- ) {
			if ( this._windows[i].ctx.containsAbsolutePoint( x, y ) ) {

				if ( this._windows[i].ctx.pointInClientViewport( x, y ) ) {
				
					this._windows[i].fire( 
						'click', 
						x - this._windows[i].left + this._windows[i].scrollLeft, 
						y - this._windows[i].top  + this._windows[i].scrollTop, 
						ev.which
					);
				}
				
				handled = true;
				break;
			}
		}

		if ( !handled ) {
			this.fire( 'click', x, y, ev.which );
		} else {
			ev.preventDefault();
			ev.stopPropagation();
		}

		return handled;

	}

	public handleKeyDown( ev ) {
		if ( this._windows && this._windows.length ) {
			this._windows[ this._windows.length - 1 ].fire( 'keydown', ev );
			ev.preventDefault();
			ev.stopPropagation();
		}
	}

	private _setupEvents_() {
		( function( self ) {
			
			self.on( 'keydown', function( ev ) {
			} );

		} )( this );

	}

	public createWindow( x: number, y: number, width: number, height: number, logicalWidth: number = null, logicalHeight: number = null ): UI_Screen_Window {

		var result = new UI_Screen_Window( this, x, y, width, height, logicalWidth, logicalHeight );

		this._windows.push( result );
		this.visible = true;
		this.fire( 'render' );

		this.updatePointerEventsState();

		return result;

	}

	get context(): CanvasRenderingContext2D {
		return this._canvas.getContext('2d');
	}

	public measureText( s: string, font: string ): number {
		

		var ctx = this._canvas.getContext('2d'),
		    result: number = 0;
		
		ctx.save()

		ctx.font = font;

		result = ctx.measureText( s ).width;

		ctx.restore();

		return result;
	}

	public canPlaceWindow( XDirection: EAlignment, YDirection: EAlignment, point: IPoint, size: IRect ): boolean {

		var x1: number,
		    y1: number,
		    x2: number,
		    y2: number;

		if ( [ EAlignment.LEFT, EAlignment.RIGHT, EAlignment.CENTER, null ].indexOf( XDirection ) == -1 ) {
			throw new Error( 'Bad direction on X axis' );
		}

		if ( [ EAlignment.TOP, EAlignment.BOTTOM, EAlignment.CENTER, null ].indexOf( YDirection ) == -1 ) {
			throw new Error( 'Bad direction on Y axis' );
		}

		switch ( XDirection ) {
			case null:
				x1 = null;
				x2 = null;
				break;
			case EAlignment.LEFT:
				x1 = point.x - size.width + 1;
				x2 = point.x;
				break;
			case EAlignment.CENTER:
				x1 = ~~( point.x - size.width / 2 );
				x2 = x1 + size.width;
				break;
			case EAlignment.RIGHT:
				x1 = point.x;
				x2 = point.x + size.width - 1;
				break;
		}

		switch ( YDirection ) {
			case null:
				y1 = null;
				y2 = null;
				break;
			case EAlignment.TOP:
				y1 = point.y - size.height + 1;
				y2 = point.y;
				break;
			case EAlignment.CENTER:
				y1 = ~~( point.y - size.height / 2 );
				y2 = y1 + size.height;
				break;
			case EAlignment.BOTTOM:
				y1 = point.y;
				y2 = point.y + size.height - 1;
				break;
		}

		return ( x1 === null || ( x1 >= 0 && x2 <= this._width ) ) &&
		       ( y1 === null || ( y1 >= 0 && y2 <= this._height ) );

	}

	public addMargin( wnd: IWindow, amount: number ): IWindow {
		
		var out = {
			x: wnd.x - amount,
			y: wnd.y - amount,
			width: wnd.width + 2 * amount,
			height: wnd.height + 2 * amount
		};

		return out;
	}

	public getBestPlacementMenuStyle( src: IWindow, dest: IRect, margin: number = 0 ): IWindow {
		
		var s: IWindow = this.addMargin( src, margin );

		var out = {
			"x": 0,
			"y": 0,
			"width": dest.width,
			"height": dest.height
		};

		switch ( true ) {
			case this.canPlaceWindow( EAlignment.RIGHT, EAlignment.BOTTOM, { "x": s.x + s.width, "y": s.y }, dest ):
				out.x = s.x + s.width;
				out.y = s.y;
				break;
			case this.canPlaceWindow( EAlignment.RIGHT, EAlignment.TOP, { "x": s.x + s.width, "y": s.y + s.height }, dest ):
				out.x = s.x + s.width;
				out.y = s.y + s.height;
				break;
			case this.canPlaceWindow( EAlignment.LEFT, EAlignment.BOTTOM, { "x": s.x, "y": s.y }, dest ):
				out.x = s.x - dest.width;
				out.y = s.y;
				break;
			case this.canPlaceWindow( EAlignment.LEFT, EAlignment.TOP, { "x": s.x, "y": s.y + s.height }, dest ):
				out.x = s.x - dest.width;
				out.y = s.y + s.height - dest.height;
				break;
			default:
				out.x = s.x + s.width;
				out.y = s.y;
				break;

		}

		return out;

	}

	public getBestPlacementDropDownStyle( src: IWindow, dest: IRect, margin: number = 0 ): IWindow {
		
		var out = {
			"x": 0,
			"y": 0,
			"width": dest.width,
			"height": dest.height
		};

		switch ( true ) {
			case this.canPlaceWindow( null, EAlignment.BOTTOM, { "x": src.x, "y": src.y + src.height + margin }, dest ):
				out.x = src.x;
				out.y = src.y + src.height + margin;
				break;
			default:
				out.x = src.x;
				out.y = src.y - dest.height - margin;
				break;
		}

		return out;

	}


}