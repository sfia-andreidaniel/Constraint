class UI_Column_Renderer_Float extends UI_Column_Renderer {

	public render() {
		
		var ctx = this._column.canvasContext;

		if ( !ctx || !this._column.target || !this._column.name ) {
			return;
		}

		var skip 			: number = this._column.target.indexPaintStart,
		    stop            : number = this._column.target.indexPaintEnd,
		    startY 			: number = this._column.target.yPaintStart,
		    paintRows  		: number = this._column.target.itemsPerPage,
		    rowHeight       : number = this._column.target.rowHeight,
		    i 				: number,
		    len 			: number,
		    opt 			: Store_Item,
		    propertyName    : string = this._column.name,

		    isActive 		: boolean = !!this._column.target['active'] && this._column.target.form.active,
		    isDisabled 		: boolean = this._column.target.disabled,
		    value           : number,
		    valueStr        : string,
		    color           : string,
		    precision       : number = this._column.precision,
		    paintX          : number = 2,
		    width4          : number = ctx.width - 4;

		ctx.beginPaint();

		ctx.font = UI_Canvas._theme.font.font;
		ctx.textBaseline = "middle";

		switch ( this._column.textAlign ) {
			case EAlignment.CENTER:
				paintX = ~~( ctx.width / 2 );
				ctx.textAlign = 'center';
				break;
			case EAlignment.RIGHT:
				ctx.textAlign = 'right';
				paintX = ctx.width - 2;
				break;

		}

		for ( i=skip; i< stop; i++ ) {
			
			opt = <Store_Item>this._column.target.itemAt( i );
			
			color = isDisabled
				? ( opt.selected ? UI_Canvas._theme.font.color.selectedDisabled : UI_Canvas._theme.font.color.disabled )
				: ( opt.selected ? ( isActive ? UI_Canvas._theme.font.color.selectedEnabled : UI_Canvas._theme.font.color.selectedInactive ) : UI_Canvas._theme.font.color.normal );

			ctx.fillStyle = color;

			value = opt.data[ propertyName ];

			valueStr = typeof value == 'number' && !isNaN( value )
				? String( value.toFixed( precision ) )
				: ( value === null ? 'NULL' : '' );

			ctx.fillText( ctx.dotDotDot( valueStr, width4 ), paintX, startY + ~~( rowHeight / 2 ) );

			startY += UI_Tree._theme.option.height;

		}

		ctx.endPaint();
	}

}