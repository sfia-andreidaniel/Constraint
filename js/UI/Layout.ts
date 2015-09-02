/**
 * The UI_Layout class is used to automatically arrange children
 * inside of an UI element.
 */

class UI_Layout extends UI_Event {

	protected _type              : ELayoutType = ELayoutType.NONE;
	protected _owner             : UI;
	protected _throttler         : UI_Throttler;

	protected _verticalSpacing   : number = 0;
	protected _horizontalSpacing : number = 0;
	protected _columns           : number[] = null;
	protected _rows              : number[] = null;

	protected _isFixedWidth      : boolean = true;
	protected _isFixedHeight     : boolean = true;

	protected _itemFixedWidth    : number = null;
	protected _itemFixedHeight   : number = null;

	protected _marginLeft        : number = 0;
	protected _marginRight       : number = 0;
	protected _marginTop         : number = 0;
	protected _marginBottom      : number = 0;

	constructor( owner: UI ) {
		super();
		
		this._owner = owner;
		
		( function( me ) {
			me._throttler = new UI_Throttler( function() {
				me.doLayout();
			}, 1 );
		} )( this );
	
	}

	get type(): ELayoutType {
		return this._type;
	}

	set type( type: ELayoutType ) {
		
		if ( type != this._type ) {

			switch ( type ) {
				case ELayoutType.LEFT_TO_RIGHT:
				case ELayoutType.TOP_TO_BOTTOM:
					this._type = type;
					break;
				default:
					this._type = ELayoutType.NONE;
					break;
			}

			this.compute();
		}
	}

	get verticalSpacing(): number {
		return this._verticalSpacing;
	}

	set verticalSpacing( spacing: number ) {
		spacing = ~~spacing;

		if ( spacing != this._verticalSpacing ) {
			this._verticalSpacing = spacing;
			this.compute();
		}
	}

	get horizontalSpacing(): number {
		return this._horizontalSpacing;
	}

	set horizontalSpacing( spacing: number ) {
		spacing = ~~spacing;

		if ( spacing != this._horizontalSpacing ) {
			this._horizontalSpacing = spacing;
			this.compute();
		}
	}

	get columns(): any {
		return this._columns;
	}

	set columns( cols: any ) {
		
		cols = cols || null;
		
		this._isFixedWidth = true;

		var result: number[],
		    division: number,
		    i: number,
		    len: number;

		switch ( true ) {

			case typeof cols == 'number':
				cols = ~~cols;
				
				result = [];

				if ( cols < 0 ) {
					cols = 0;
				}

				division = 1 / cols;

				for ( i=0; i<cols; i++ ) {
					result.push( parseFloat( division.toFixed(3) ) );
				}

				if ( !result.length ) {
					result = null;
				} else {
					this._isFixedWidth = false;
				}

				break;

			case cols instanceof Array:

				len = cols.length;
				result = [];

				for ( i=0; i<len; i++ ) {
					
					result.push( 
						!isNaN( cols[i] ) && isFinite( cols[i] )
							? parseFloat( String( cols[i] ) )
							: null
					);

					if ( result[i] === null ) {
						throw new Error('Bad columns config in layout!' );
					}

					if ( result[i] >= 0 && result[i] <= 1 ) {
						this._isFixedWidth = false;
					}
				}

				if ( !result.length ) {
					result = null;
				}

				break;

			default:
				result = null;
				break;
		}

		this._columns = result;

		this.compute();

	}

	get rows(): any {
		return this._rows;
	}

	set rows( rows: any ) {
		
		rows = rows || null;
		
		this._isFixedHeight = true;

		var result: number[],
		    division: number,
		    i: number,
		    len: number;

		switch ( true ) {

			case typeof rows == 'number':
				rows = ~~rows;
				
				result = [];

				if ( rows < 0 ) {
					rows = 0;
				}

				division = 1 / rows;

				for ( i=0; i<rows; i++ ) {
					result.push( parseFloat( division.toFixed(3) ) );
				}

				if ( !result.length ) {
					result = null;
				} else {
					this._isFixedHeight = false;
				}

				break;

			case rows instanceof Array:

				len = rows.length;
				result = [];

				for ( i=0; i<len; i++ ) {
					
					result.push( 
						!isNaN( rows[i] ) && isFinite( rows[i] )
							? parseFloat( String( rows[i] ) )
							: null
					);

					if ( result[i] === null ) {
						throw new Error('Bad columns config in layout!' );
					}

					if ( result[i] >= 0 && result[i] <= 1 ) {
						this._isFixedHeight = false;
					}
				}

				if ( !result.length ) {
					result = null;
				}

				break;

			default:
				result = null;
				break;
		}

		this._rows = result;

		this.compute();

	}

	get isFluid(): boolean {
		return !this._isFixedHeight || !this._isFixedWidth;
	}

	get isFixed(): boolean {
		return this._isFixedWidth && this._isFixedHeight;
	}

	get itemFixedWidth(): number {
		return this._itemFixedWidth || null;
	}

	set itemFixedWidth( width: number ) {
		width = ~~width;
		width = width == 0 ? null : ( width < -1 ? -1 : width );
		if ( width != this._itemFixedWidth ) {
			this._itemFixedWidth = width;
			this.compute();
		}
	}

	get itemFixedHeight(): number {
		return this._itemFixedHeight || null;
	}

	set itemFixedHeight( height: number ) {
		height = ~~height;
		height = height == 0 ? null : ( height < -1 ? -1 : height );
		if ( height != this._itemFixedHeight ) {
			this._itemFixedHeight = height;
			this.compute();
		}
	}

	get marginLeft(): number {
		return this._marginLeft;
	}

	set marginLeft( margin: number ) {
		margin = ~~margin;
		if ( margin != this._marginLeft ) {
			this._marginLeft = margin;
			this.compute();
		}
	}

	get marginTop(): number {
		return this._marginTop;
	}

	set marginTop( margin: number ) {
		margin = ~~margin;
		if ( margin != this._marginTop ) {
			this._marginTop = margin;
			this.compute();
		}
	}

	get marginRight(): number {
		return this._marginRight;
	}

	set marginRight( margin: number ) {
		margin = ~~margin;
		if ( margin != this._marginRight ) {
			this._marginRight = margin;
			this.compute();
		}
	}

	get marginBottom(): number {
		return this._marginBottom;
	}

	set marginBottom( margin: number ) {
		margin = ~~margin;
		if ( margin != this._marginBottom ) {
			this._marginBottom = margin;
			this.compute();
		}
	}

	get margin(): number {
		return ( this._marginTop == this._marginRight ) &&
			   ( this._marginRight == this._marginBottom ) &&
			   ( this._marginBottom == this._marginLeft )
			 	? this._marginLeft
			 	: 0;

	}

	set margin( margin: number ) {
		margin = ~~margin;
		this._marginLeft = this._marginRight = this._marginBottom = this._marginTop = margin;
		this.compute();
	}

	public compute() {
		this._throttler.run();
	}

	/**
	 * Re-computes the layout of the element.
	 */
	public doLayout() {
		
		// maintain the original placing of the elements.
		if ( this._type == ELayoutType.NONE ) {
			return;
		}

		var numColumns: number = this._columns === null ? 1 : this._columns.length,
		    numRows   : number = this._rows    === null ? 1 : this._rows.length,
		    cols      : number[] = this._columns || [ 1 ],
		    rows      : number[] = this._rows || [ 1 ],
		    col       : number = 0,
		    row       : number = 0,
		    children  : UI[] = this._owner.childNodes,
		    i         : number,
		    len       : number = children.length,
		    currentWidth: number,
		    currentHeight: number,
		    rect      : IRect = this._owner.clientRect,
		    currentLeft: number = this._marginLeft,
		    currentTop : number = this._marginTop;

		rect.width -= ( ( numColumns - 1 ) * this._verticalSpacing + this._marginLeft + this._marginRight );
		rect.height -= ( ( numRows - 1 ) * this._horizontalSpacing + this._marginTop + this._marginBottom );

		if ( !len ) {
			return;
		}

		for ( i=0; i<len; i++ ) {

			if (this._itemFixedWidth !== -1) {
				currentWidth = cols[col] <= 1
					? ~~(rect.width * cols[col])
					: cols[col];
			} else {
				currentWidth = children[i].width;
			}

			if ( this._itemFixedHeight !== -1 ) {
				currentHeight = rows[ row ] <= 1
					? ~~( rect.height * rows[ row ] )
					: rows[ row ];
			} else {
				currentHeight = children[i].height;
			}

			children[ i ].left = currentLeft;
			children[ i ].top  = currentTop;
			
			if ( this._itemFixedWidth !== -1 ) {
				children[ i ].width = this._itemFixedWidth === null ? currentWidth : this._itemFixedWidth;
			}
			
			if ( this._itemFixedHeight !== -1 ) {
				children[ i ].height = this._itemFixedHeight === null ? currentHeight : this._itemFixedHeight;
			}

			children[ i ].right = null;
			children[ i ].bottom = null;

			switch ( this._type ) {

				case ELayoutType.LEFT_TO_RIGHT:

					col++;
					currentLeft += ( currentWidth + this._verticalSpacing );

					if ( col == numColumns ) {
						
						col = 0;
						
						currentLeft = this._marginLeft;

						row++;
						
						currentTop += ( currentHeight + this._horizontalSpacing );

						if ( row == numRows ) {
							row = 0;
							currentTop = this._marginTop;
						}

					}

					break;

				case ELayoutType.TOP_TO_BOTTOM:

					row++;
					currentTop += ( currentHeight + this._horizontalSpacing );

					if ( row == numRows ) {

						row = 0;
						currentTop = this._marginTop;

						col++;

						currentLeft += ( currentWidth + this._verticalSpacing );

						if ( col == numColumns ) {
							col = 0;
							currentLeft = this._marginLeft;
						}

					}

					break;

			}

		}

	}

}