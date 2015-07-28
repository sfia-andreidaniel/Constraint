class UI_Column_Renderer_Tree extends UI_Column_Renderer {
	
	public render() {

		super.render();

		/*
		this.prerender();

		var ctx = this.paintContext;

		if ( !ctx ) {
			return;
		}

		var	scrollTop : number = this.scrollTop,
			bgColor = this.disabled ? UI_Tree._theme.background.disabled : UI_Tree._theme.background.enabled,
			skip      : number = ~~( scrollTop / UI_Tree._theme.option.height ),
		    startY    : number = -( scrollTop % UI_Tree._theme.option.height ),
		    paintRows : number = Math.round( this._paintRect.height / UI_Tree._theme.option.height ) + 1,
		    i 		  : number,
		   	len 	  : number,
		   	opt 	  : INestable,

		   	isActive  : boolean = this.active && this.form && this.form.active,
		   	isDisabled: boolean = this.disabled,
		   	isScrollbar: boolean = this.logicalHeight >= this._paintRect.height,
		   	selectedIndex: number = this.selectedIndex,
		   	connectors: number[],
		   	paddingLeft: number,
		   	ci            : number,
		   	numConnectors : number;

		ctx.fillStyle = bgColor;
		ctx.fillRect( 0, 0, ctx.width, ctx.height );

		ctx.beginPaint();
		ctx.imageSmoothingEnabled = false;
		ctx.font = UI_Tree._theme.option.font;
		ctx.textBaseline = "middle";

		for ( i = skip, len = Math.min( this.length, skip + paintRows); i<len; i++ ) {
			
			opt = <INestable>this._view.itemAt( i ).data;
			connectors = this._view.connectorsAt(i);
			numConnectors = connectors.length;

			paddingLeft = ( numConnectors + 1 ) * UI_Tree._theme.option.height;

			if ( !this._view.itemAt(i)['selected'] ) {
				ctx.fillStyle = isDisabled
					? UI_Tree._theme.option.color.disabled
					: UI_Tree._theme.option.color.normal;
			} else {

				ctx.endPaint();

				// Draw also the selected background color
				ctx.fillStyle = isDisabled
					? UI_Tree._theme.option.background.selectedDisabled
					: ( isActive ? UI_Tree._theme.option.background.selected : UI_Tree._theme.option.background.selectedInactive );

				ctx.fillRect( -this._freezedWidth, startY, this._paintRect.width, UI_Tree._theme.option.height );

				ctx.beginPaint();
				ctx.font = UI_Tree._theme.option.font;
				ctx.textBaseline = "middle";

				ctx.fillStyle = isDisabled
					? UI_Tree._theme.option.color.selectedDisabled
					: ( isActive ? UI_Tree._theme.option.color.selectedNormal : UI_Tree._theme.option.color.selectedInactive );
			}

			// paint connectors
			for ( ci=0; ci < numConnectors; ci++ ) {

				if ( connectors[ci] ) {

					UI_Resource.createSprite( 

						'Constraint/tree_connector_' + connectors[ci] + '/' 

						+ UI_Tree._theme.option.height + 'x' + UI_Tree._theme.option.height
						+ ( this.disabled ? '-disabled' : '' )

					).paintWin( ctx, ci * UI_Tree._theme.option.height, startY );

				}
			}

			// paint icon
			if ( opt.isLeaf ) {
				
				// paint file icon
				UI_Resource.createSprite(
				
					( opt['icon'] || 'Constraint/file' ) 
					+ '/20x20'
					+ ( this.disabled ? '-disabled' : '' )
				
				).paintWin( ctx, numConnectors * UI_Tree._theme.option.height, startY + ~~( UI_Tree._theme.option.height - 20 ) / 2 );

			} else {

				// paint folder icon
				UI_Resource.createSprite(
				
					( opt['icon'] || 'Constraint/folder' ) 
					+ '/20x20'
					+ ( this.disabled ? '-disabled' : '' )
				
				).paintWin( ctx, numConnectors * UI_Tree._theme.option.height, startY + ~~( UI_Tree._theme.option.height - 20 ) / 2 );
			}

			ctx.fillText( opt.name, 2 + paddingLeft, startY + ~~( UI_Tree._theme.option.height / 2 ) );

			if ( selectedIndex == i && isActive && !isDisabled ) {
	
				ctx.endPaint();
				// draw selected index focus ring
				ctx.strokeStyle = 'black';
				ctx.strokeRect( -this._freezedWidth + .5, startY + 0.5, this._paintRect.width - 1 - ( ~~isScrollbar * UI_Dom.scrollbarSize ), UI_Tree._theme.option.height - 1 );
				ctx.font = UI_Tree._theme.option.font;
				ctx.textBaseline = "middle";
				ctx.beginPaint();
			}

			startY += UI_Tree._theme.option.height;
		}

		ctx.endPaint();

		this.postrender();
		*/

	}
}