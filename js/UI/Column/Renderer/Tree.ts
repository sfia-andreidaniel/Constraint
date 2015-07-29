class UI_Column_Renderer_Tree extends UI_Column_Renderer {
	
	public onClick( point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean ) {
		var rowIndex      = ~~( point.y / this._column.target.rowHeight ),
		    item          = <Store_Item_NestableObject>this._column.target.itemAt( rowIndex ),
		    numConnectors = item.connectors.length;

		/* If x is in the range of the last connector, click on the expander */
		if ( ~~( point.x / this._column.target.rowHeight ) == numConnectors - 1 ) {
			this._column.target['onRowExpanderClick']( rowIndex );
		}

	}

	public render() {

		var ctx = this._column.canvasContext;

		if ( !ctx || !this._column.target ) {
			return;
		}

		var skip 			: number = this._column.target.indexPaintStart,
		    stop            : number = this._column.target.indexPaintEnd,
		    startY 			: number = this._column.target.yPaintStart,
		    paintRows  		: number = this._column.target.itemsPerPage,
		    i 				: number,
		    len 			: number,
		    opt 			: Store_Item_NestableObject,
		    rowHeight       : number = this._column.target.rowHeight,

		    isActive 		: boolean = !!this._column.target['active'] && this._column.target.form.active,
		    isDisabled 		: boolean = this._column.target.disabled,
		    paddingLeft 	: number,
		    ci 				: number,
		    numConnectors 	: number,
		    icon            : string;

		ctx.beginPaint();
		ctx.imageSmoothingEnabled = false;
		ctx.font = UI_Tree._theme.option.font;
		ctx.textBaseline = "middle";

		for ( i=skip; i< stop; i++ ) {
			opt = <Store_Item_NestableObject>this._column.target.itemAt( i );
			numConnectors = opt.connectors.length;
			paddingLeft = ( numConnectors + 1 ) * rowHeight;
			
			if ( !opt.selected ) {
				ctx.fillStyle = isDisabled
					? UI_Tree._theme.option.color.disabled
					: UI_Tree._theme.option.color.normal;
			} else {
				ctx.fillStyle = isDisabled
					? UI_Tree._theme.option.color.selectedDisabled
					: ( isActive ? UI_Tree._theme.option.color.selectedNormal : UI_Tree._theme.option.color.selectedInactive );
			}

			// paint connectors
			for ( ci=0; ci < numConnectors; ci++ ) {
				if ( opt.connectors[ci] ) {
					UI_Resource.createSprite(

						'Constraint/tree_connector_' + opt.connectors[ci] + '/' 
						+ rowHeight + 'x' + rowHeight
						+ ( isDisabled ? '-disabled' : '' )

					).paintWin( ctx, ci * rowHeight, startY );
				}
			}

			// paint the icon
			icon = (opt.data.icon || ( opt.isLeaf ? 'Constraint/file': 'Constraint/folder') )  + '/20x20'+ ( isDisabled ?  '-disabled' : '' );

			UI_Resource.createSprite( icon ).paintWin( ctx, ci * rowHeight, ~~( startY + ( rowHeight / 2 ) - 10 ) );

			// paint caption

			ctx.fillText( opt.name, 2 + paddingLeft, startY + ~~( rowHeight / 2 ) );

			startY += rowHeight;

		}

		ctx.endPaint();

	}
}