class UI_Color_List extends UI_Canvas implements IInput, IFocusable {

	public static _theme: any = {
		defaults: {
			colorBoxWidth: $I.number('UI.UI_Color_List/defaults.colorBoxWidth'),
			colorBoxHeight: $I.number('UI.UI_Color_List/defaults.colorBoxHeight'),
			colorBoxMargin: $I.number('UI.UI_Color_List/defaults.colorBoxMargin')
		},
		border: {
			color: $I.string('UI.UI_Color_List/border.color'),
			selected: $I.string('UI.UI_Color_List/border.selected')
		}
	};

	protected _colors         : IRGBPixel[] = [];
	protected _selectedIndex  : number = -1;
	protected _valueIndex     : number = -1;

	protected _colorBoxMargin : number = 5;
	protected _colorBoxWidth  : number = 16;
	protected _colorBoxHeight : number = 16;
	protected _maxColumns     : number = null;

	public    active: boolean; // the active is overrided by the MFocusable mixin
	public    wantTabs: boolean = false;
	public    tabIndex: number = 0;
	public    includeInFocus: boolean = true;
	public    accelerators: string;

	constructor( owner: UI ) {
		super( owner, [ 'IFocusable' ] );
		Utils.dom.addClass( this._root, 'UI_Color_List' );
		this._colorBoxMargin = UI_Color_List._theme.defaults.colorBoxMargin;
		this._colorBoxWidth   = UI_Color_List._theme.defaults.colorBoxWidth;
		this._colorBoxHeight  = UI_Color_List._theme.defaults.colorBoxHeight;
	}

	get colors(): string[] {
		var result: string[] = [],
		    i: number,
		    len: number = this._colors.length;

		for ( i=0; i<len; i++ ) {
			result.push( 'rgb(' + this._colors[i].r + ',' + this._colors[i].g + ',' + this._colors[i].b + ')' );
		}
		return result;
	}

	set colors( colors: string[] ) {
		
		var i: number, len: number,
		    color: UI_Color;

		this._colors.splice( 0, this._colors.length );

		if ( !!colors && ( len = colors.length ) ) {
			for ( i=0; i<len; i++ ) {

				color = UI_Color.create( colors[i] );

				this._colors.push( {
					r: color.red,
					g: color.green,
					b: color.blue
				} );
			}
		}

		this._selectedIndex = -1;
		this._valueIndex = -1;

		this.render();
	}

	get selectedIndex(): number {
		return this._selectedIndex;
	}

	set selectedIndex( index: number ) {
		
		index = ~~index;
		
		if ( index < -1 ) {
			index = -1;
		}
		
		if ( index >= this._colors.length ) {
			index = this._colors.length;
		}

		if ( index != this._selectedIndex ) {
			this._selectedIndex = index;
			this.render();
		}
	}

	get value(): string {
		return this._valueIndex == -1
			? null
			: 'rgb(' + this._colors[this._valueIndex].r + ',' + this._colors[this._valueIndex].g + ',' + this._colors[this._valueIndex].b + ')';
	}

	set value( value: string ) {
		
		value = String( value || '' ) || null;

		if ( !value ) {

			this._valueIndex = -1;

		} else {

			var i: number = 0,
			    len: number = this._colors.length,
			    color: UI_Color = UI_Color.create( value ),
			    pixel: IRGBPixel = { r: color.red, g: color.green, b: color.blue };

			for ( i=0, len = this._colors.length; i<len; i++ ) {
				if ( this._colors[i].r == pixel.r && this._colors[i].g == pixel.g && this._colors[i].b == pixel.b ) {
					this._valueIndex = i;
					this.render();
					return;
				}
			}
		}
	}

	public get( index: number ): string {
		
		index = ~~index;

		if ( this._colors[ index ] ) {
			return 'rgb(' + this._colors[index].r + ',' + this._colors[index].g + ',' + this._colors[index].b + ')';
		} else {
			return null;
		}

	}

	public set( index: number, color: string = 'white' ) {
		index = ~~index;

		var c: UI_Color = UI_Color.create( String( color ) || 'white' );

		if ( index >= 0 && index < this._colors.length ) {
			this._colors[ index ].r = c.red;
			this._colors[ index ].g = c.green;
			this._colors[ index ].b = c.blue;
			this.render();
		}
	}

	get colorBoxMargin(): number {
		return this._colorBoxMargin;
	}

	set colorBoxMargin( margin: number ) {
		margin = ~~margin;
		if ( margin < 0 ) {
			margin = 0;
		}
		if ( margin != this._colorBoxMargin ) {
			this._colorBoxMargin = margin;
			this.render();
		}
	}

	get colorBoxWidth(): number {
		return this._colorBoxWidth;
	}

	set colorBoxWidth( size: number ) {
		size = ~~size;
		if ( size < 1 ) {
			size = 1;
		}
		if ( size != this._colorBoxHeight ) {
			this._colorBoxWidth = size;
			this.render();
		}
	}

	get colorBoxHeight(): number {
		return this._colorBoxHeight;
	}

	set colorBoxHeight( size: number ) {
		size = ~~size;
		if ( size < 1 ) {
			size = 1;
		}
		if ( size != this._colorBoxHeight ) {
			this._colorBoxHeight = size;
			this.render();
		}
	}

	get columns(): number {
		return ~~( ( this.viewportWidth ) / ( this.colorBoxMargin + this.colorBoxWidth ) );
	}

	get selectedColumnIndex(): number {
		return this._selectedIndex == -1
			? null
			: ~~( this._selectedIndex % this.columns );
	}

	get rows(): number {
		return ~~( this._colors.length / this.columns ) + ~~!!( this._colors.length % this.columns );
	}

	get selectedRowIndex(): number {
		return this._selectedIndex == -1
			? null
			: ~~( this._selectedIndex / this.columns );
	}

	public moveCursor( orientation: EOrientation, relative: number ) {
		
		var col: number = this.selectedColumnIndex,
		    row: number = this.selectedRowIndex,
		    cols: number = this.columns,
		    rows: number = this.rows,
		    newIndex: number;

		switch ( orientation ) {

			case EOrientation.VERTICAL:

				if ( relative < 0 ) {

					if ( row === null ) {
						row = rows - 1;
					} else {
						if ( row > 0 ) {
							row--;
						}
					}
				} else
				if ( relative > 0 ) {

					if ( row === null ) {
						row = 0;
					} else {
						if ( row < rows - 1 ) {
							row++;
						}
					}

				}

				break;

			case EOrientation.HORIZONTAL:

				if ( relative < 0 ) {

					if ( col === null ) {
						col = cols - 1;
					} else {
						if ( col > 0 ) {
							col--;
						}
					}
				} else
				if ( relative > 0 ) {

					if ( col === null ) {
						col = 0;
					} else {
						if ( col < cols - 1 ) {
							col++;
						}
					}

				}

				break;

		}

		newIndex = col + row * cols;

		if ( newIndex < this._colors.length ) {
			this.selectedIndex = newIndex;
		}

	}

	protected _setupEvents_() {
		
		super._setupEvents_();

		( function( me ) {

			me.on( 'keydown', function( ev ) {

				if ( this.disabled ) {
					return;
				}

				var code = ev.keyCode || ev.charCode;

				switch ( code ) {

					case Utils.keyboard.KB_UP:
						this.moveCursor( EOrientation.VERTICAL, -1 );
						break;

					case Utils.keyboard.KB_DOWN:
						this.moveCursor( EOrientation.VERTICAL, 1 );
						break;

					case Utils.keyboard.KB_LEFT:
						this.moveCursor( EOrientation.HORIZONTAL, -1 );
						break;

					case Utils.keyboard.KB_RIGHT:
						this.moveCursor( EOrientation.HORIZONTAL, 1 );
						break;

					case Utils.keyboard.KB_SPACE:
						if ( this.selectedIndex != -1 ) {
							this._valueIndex = this.selectedIndex;
							this.render();
							this.fire( 'change' );
						}
						break;

				}

			} );

			me.on( 'mousedown', function( point: IPoint, which: number ) {

				if ( which != 1 || this.disabled ) {
					return;
				}

				if ( point.x < this.colorBoxMargin || point.y < this.colorBoxMargin ) {
					return;
				}

				var newCol: number = ~~( ( ( point.x - this.colorBoxMargin ) / ( this.colorBoxWidth + this.colorBoxMargin ) ) ),
				    newRow: number = ~~( ( ( point.y - this.colorBoxMargin ) / ( this.colorBoxHeight + this.colorBoxMargin ) ) ),
				    newIndex: number = newRow * this.columns + newCol;

				if ( newIndex < this._colors.length ) {
					this._selectedIndex = newIndex;
					this._valueIndex = newIndex;
					this.render();
					this.fire( 'change' );
				}

			} );

			me.on( 'focus', function() {
				me.render();
			} );

			me.on( 'blur',  function() {
				me.render();
			} );

		} )( this );

	}

	public render() {

		var columns: number = this.columns,
		    row: number = 0,
		    col: number = 0,
		    len: number = this._colors.length,
		    index: number = 0,
		    x: number = this._colorBoxMargin,
		    y: number = this._colorBoxMargin,
		    ctx: CanvasRenderingContext2D = this.globalContext,
		    bgColor = this.disabled ? UI_Canvas._theme.background.disabled : UI_Canvas._theme.background.enabled,
		    width: number = this._viewportWidth,
		    height: number = this._viewportHeight,
		    active: boolean = this.active;

		ctx.fillStyle = bgColor;
		ctx.fillRect( 0, 0, width, height );
		ctx.lineWidth = 1;

		while ( index < len ) {

			ctx.fillStyle = this._colors[index] ? 'rgb(' + this._colors[index].r + ',' + this._colors[index].g + ',' + this._colors[index].b + ')' : 'white';
			ctx.fillRect( x, y, this._colorBoxWidth, this._colorBoxHeight );

			if ( index == this._valueIndex ) {
				ctx.strokeStyle = UI_Color_List._theme.border.selected;
			} else {
				ctx.strokeStyle = UI_Color_List._theme.border.color;
			}

			ctx.strokeRect( x + .5, y + .5, this._colorBoxWidth, this._colorBoxHeight );

			if ( index == this._selectedIndex && active ) {

				ctx.save();

				try {
					ctx.setLineDash( [ 1, 2 ] );
				} catch( e ) {}

				ctx.strokeStyle = UI_Color_List._theme.border.selected;
				ctx.strokeRect( x - 1.5, y - 1.5, this._colorBoxWidth + 4, this._colorBoxHeight + 4 );

				ctx.restore();

			}

			col++;

			x += this._colorBoxWidth + this._colorBoxMargin;

			if ( col == columns ) {

				col = 0;

				y += this.colorBoxHeight + this.colorBoxMargin;
				x = this._colorBoxMargin;

			}

			index++;

		}

	}

}

Mixin.extend( 'UI_Color_List', 'MFocusable' );