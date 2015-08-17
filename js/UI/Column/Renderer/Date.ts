class UI_Column_Renderer_Date extends UI_Column_Renderer {

	get sortDataType(): string {
		return 'date';
	}

	public render() {
		
		var ctx = this._column.canvasContext;

		if ( !ctx || !this._column.grid || !this._column.name ) {
			return;
		}

		var skip 			: number = this._column.grid.indexPaintStart,
		    stop            : number = this._column.grid.indexPaintEnd,
		    startY 			: number = this._column.grid.yPaintStart,
		    paintRows  		: number = this._column.grid.itemsPerPage,
		    rowHeight       : number = this._column.grid.rowHeight,
		    i 				: number,
		    len 			: number,
		    opt 			: Store_Item,
		    propertyName    : string = this._column.name,

		    isActive 		: boolean = !!this._column.grid['active'] && this._column.grid.form.active,
		    isDisabled 		: boolean = this._column.grid.disabled,
		    value           : any,
		    valueDate       : any,
		    valueStr        : string,
		    color           : string,
		    paintX          : number = 2,
		    width4          : number = ctx.width - 4,
		    precision       : number = this._column.precision,
		    outputFormat    : string = this._column.outputFormat,
		    inputFormat     : string = this._column.inputFormat;

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
			
			opt = <Store_Item>this._column.itemAt( i );
			
			color = isDisabled
				? ( opt.selected ? UI_Canvas._theme.font.color.selectedDisabled : UI_Canvas._theme.font.color.disabled )
				: ( opt.selected ? ( isActive ? UI_Canvas._theme.font.color.selectedEnabled : UI_Canvas._theme.font.color.selectedInactive ) : UI_Canvas._theme.font.color.normal );

			ctx.fillStyle = color;

			value = opt.get( propertyName );

			valueDate = value instanceof Date ? value : Utils.date.parse( value, inputFormat );

			if ( valueDate )
				ctx.fillText( ctx.dotDotDot( Utils.date.format( valueDate, outputFormat ), width4 ), paintX, startY + ~~( rowHeight / 2 ) );

			startY += UI_Tree._theme.option.height;

		}

		ctx.endPaint();
	}

}