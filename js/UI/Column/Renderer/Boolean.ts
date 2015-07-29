class UI_Column_Renderer_Boolean extends UI_Column_Renderer {

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
		    color           : string,
		    paintX          : number = 2;

		ctx.beginPaint();

		ctx.font = UI_Canvas._theme.font.font;
		ctx.textBaseline = "middle";

		switch ( this._column.textAlign ) {
			case EAlignment.CENTER:
				paintX = ~~( ctx.width / 2 ) - 7;
				break;
			case EAlignment.RIGHT:
				paintX = ctx.width - 16;
				break;

		}

		for ( i=skip; i< stop; i++ ) {
			
			opt = <Store_Item>this._column.target.itemAt( i );
			
			color = isDisabled
				? ( opt.selected ? UI_Canvas._theme.font.color.selectedDisabled : UI_Canvas._theme.font.color.disabled )
				: ( opt.selected ? ( isActive ? UI_Canvas._theme.font.color.selectedEnabled : UI_Canvas._theme.font.color.selectedInactive ) : UI_Canvas._theme.font.color.normal );

			ctx.fillStyle = color;

			value = opt.data[ propertyName ];

			if ( !!value ) {
				UI_Resource.createSprite(
						'Constraint/grid_boolean/14x14'
						+ ( isDisabled ? '-disabled' : '' )
				).paintWin( ctx, paintX, startY + ~~( rowHeight / 2 - 7 ) );
			}

			startY += rowHeight;

		}

		ctx.endPaint();
	}

}