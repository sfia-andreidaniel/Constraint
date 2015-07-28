interface IGridInterface {
	columns 		: ( freezed: boolean ) => UI_Column[];
	length 			: number;
	itemAt 			: ( index: number ) => Store_Item;
	renderColumns 	: () => void;
	rowHeight       : number;
	itemsPerPage    : number;
	yPaintStart     : number;
	indexPaintStart : number;
	indexPaintEnd   : number;
}

class MGridInterface extends UI_Canvas implements IGridInterface {

	// confirm this class is a mixin class
	public static isMixin: boolean = true;

	// force overriding these properties into target.
	public static forceProperties: string[] = [
		'columns',
		'postrender',
		'_freezedColumns',
		'_freeColumns',
		'prerender',
		'postrender',
		'itemsPerPage'
	];

	// do not mix these properties into target.
	public static skipProperties: string[] = [
		'itemAt'
	];

	public freezedColumns: UI_Column[] = [];
	public freeColumns:    UI_Column[] = [];
	
	public length: number;

	public static initialize( node: UI_Canvas ) {

		var computeColumns = function() {
			
			node.header = !!node.childNodes.length;

			if ( node.header ) {
				// determine the freezed width, and the logical width
				var freezedWidth: number = 0,
				    logicalWidth: number = 0,
				    columns: UI_Column[] = node['columns'](),
				    i: number = 0,
				    len: number = columns.length;
				
				node['freeColumns'] = [];
				node['freezedColumns'] = [];

				for ( i=0; i<len; i++ ) {

					if ( columns[i].visible && columns[i].freezed ) {

						freezedWidth += columns[i].width;
						node['freezedColumns'].push( columns[i] );

						/* SET the column header context */
						if ( !columns[i].headerContext ) {
							
							columns[i].headerContext = new UI_Canvas_ContextMapper(
								node.globalContext,
								{
									"x": freezedWidth - columns[i].width,
									"y": 0,
									"width": columns[i].width,
									"height": UI_Column._theme.height
								}
							);

						}

						/* Set the column canvas context */
						if ( !columns[i].canvasContext ) {

							columns[i].canvasContext = new UI_Canvas_ContextMapper(
								node.globalContext,
								{
									"x": freezedWidth - columns[i].width,
									"y": UI_Column._theme.height,
									"width": columns[i].width,
									"height": node.viewportHeight - UI_Column._theme.height
								}
							);

						}

						columns[i].canvasContext.left 
							= columns[i].headerContext.left
							= freezedWidth - columns[i].width;


						columns[i].canvasContext.width
							= columns[i].headerContext.width
							= columns[i].width;

						columns[i].canvasContext.height 
							= node.viewportHeight - UI_Column._theme.height;


						columns[i].headerContext.paintable 
							= columns[i].canvasContext.paintable 
							= true;
					
					}

				}

				for ( i=0; i<len; i++ ) {
					
					if ( columns[i].visible && !columns[i].freezed ) {
						
						logicalWidth += columns[i].width;
						node['freeColumns'].push( columns[i] );

						/* Set the column header context if not set */
						if ( !columns[i].headerContext ) {

							columns[i].headerContext = new UI_Canvas_ContextMapper(
								node.globalContext,
								{
									"x": freezedWidth + ( logicalWidth - columns[i].width ),
									"y": 0,
									"width": columns[i].width,
									"height": UI_Column._theme.height
								}
							);

						}

						/* Set the column canvas context if not set */
						if ( !columns[i].canvasContext ) {

							columns[i].canvasContext = new UI_Canvas_ContextMapper(
								node.globalContext,
								{
									"x": freezedWidth + ( logicalWidth - columns[i].width ),
									"y": UI_Column._theme.height,
									"width": columns[i].width,
									"height": node.viewportHeight - UI_Column._theme.height
								}
							);

						}

						columns[i].headerContext.left 
						    = columns[i].canvasContext.left
							= freezedWidth + ( logicalWidth - columns[i].width );

						columns[i].headerContext.width
							= columns[i].canvasContext.width
							= columns[i].width;

						columns[i].canvasContext.height 
							= node.viewportHeight - UI_Column._theme.height;

						columns[i].headerContext.paintable
							= columns[i].canvasContext.paintable 
							= ( columns[i].canvasContext.left < node.viewportWidth ) && ( columns[i].canvasContext.left + columns[i].width > freezedWidth );
					}

				}

				node.freezedWidth = freezedWidth;
				node.logicalWidth = logicalWidth;
			}

			node.onRepaint();

		};

		// Each time the columns are triggering this event, we must
		// update them in the main parent.
		node.on( 'column-changed', computeColumns );
		node.on( 'viewport-resized', computeColumns );

	}

	public columns( freezed: boolean = null ): UI_Column[] {
		var result: UI_Column[] = [],
		    i: number,
		    len: number;

		if ( freezed === null ) {
			return <UI_Column[]>this._children;
		} else {
			freezed = !!freezed;
			len = this._children.length
			for ( i=0; i<len; i++ ) {
				if ( (<UI_Column>this._children[i]).freezed == freezed ) {
					result.push( <UI_Column>this._children[i] );
				}
			}
		}
	}

	// Does the column rendering. @Overrides target
	public renderColumns() {
		// first we paint free width columns, and after that we paint freezed columns
		var i: number = 0,
		    len: number;

		for ( i=0, len = this.freeColumns.length; i<len; i++ ) {
			this.freeColumns[i].renderer.render();
		}

		for ( i=0, len = this.freezedColumns.length; i<len; i++ ) {
			this.freezedColumns[i].renderer.render();
		}
	}

	public prerender() {
		var ctx = this.globalContext;
		ctx.fillStyle = 'white';
		ctx.fillRect( 0, 0, this.viewportWidth, this.viewportHeight );

		/* Paints the background for the selected items globally */
	}

	get yPaintStart(): number {
		return -( this.scrollTop % this.rowHeight ) || 0;
	}

	get indexPaintStart(): number {
		return ~~( this.scrollTop / this.rowHeight );
	}

	get itemsPerPage(): number {
		return Math.round( ( this.viewportHeight - ~~UI_Column._theme.height ) / this.rowHeight );
	}

	get indexPaintEnd(): number {
		return Math.min( this.length, this.indexPaintStart + this.itemsPerPage );
	}

	// @overrides the postrender on the canvas
	public postrender() {

		if ( this.freeColumns && this.freezedColumns ) {
			
			var ctx: UI_Canvas_ContextMapper = this.headerContext;

			ctx.beginPaint();

			ctx.fillStyle = this.disabled
				? UI_Column._theme.background.disabled
				: UI_Column._theme.background.enabled;

			ctx.fillRect( 0, 0, ctx.width, ctx.height );

			ctx.endPaint();

			var i: number,
			    len: number;

			/* First we paint free width columns, and after that we paint
			   freezed columns
			 */

			for ( i=0, len = this.freeColumns.length; i<len; i++ ) {
				this.freeColumns[i].paintHeader();
			}

			/* Second we paint freezed columns
			 */

			for ( i=0, len = this.freezedColumns.length; i<len; i++ ) {
				this.freezedColumns[i].paintHeader();
			}

		}

	}

	public itemAt( index: number ): Store_Item {
		throw new Error( 'Should be implemented by target' );
	}

}
