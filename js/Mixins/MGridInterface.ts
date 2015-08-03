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

	freezedColumns  : UI_Column[];
	freeColumns     : UI_Column[];
}

class MGridInterface extends UI_Canvas implements IGridInterface {

	// confirm this class is a mixin class
	public static isMixin: boolean = true;

	// force overriding these properties into target.
	public static forceProperties: string[] = [
		'columns',
		'postrender',
		'freezedColumns',
		'freeColumns',
		'prerender',
		'postrender'
	];

	// do not mix these properties into target.
	public static skipProperties: string[] = [
		'itemAt'
	];

	public freezedColumns: UI_Column[] = [];
	public freeColumns:    UI_Column[] = [];
	
	public itemsPerPage: number;

	public length: number;

	public static initialize( node: UI_Canvas ) {

		/* PRIVATE INITIALIZE DATA */

		var isRowInterface: boolean = node.implements( 'IRowInterface' ),
		    resizeTargetColumn: UI_Column = null,
		    isResizing: boolean = false,
		    prevX: number = 0;

		function forwardEvent( eventType: string, point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean ) {

			if ( node.disabled || point.y < 0 ) {
				return;
			}

			var i: number,
			    len: number, 
			    translated: IPoint = {
					x: point.x,
					y: point.y + UI_Column._theme.height
				},
				target: UI_Column = null;

			// try to send the point first to the freezed columns.
			if ( node.freezedColumns ) {
				for ( i=0, len = node.freezedColumns.length; i<len; i++ ) {
					if ( node.freezedColumns[i].canvasContext && node.freezedColumns[i].canvasContext.containsAbsolutePoint( translated.x, null ) ) {
						target = node.freezedColumns[i];
						break;
					}
				}
			}

			if ( !target && node.freeColumns ) {
				for ( i=0, len = node.freeColumns.length; i<len; i++ ) {
					if ( node.freeColumns[i].canvasContext && node.freeColumns[i].canvasContext.containsAbsolutePoint( translated.x, null ) ) {
						target = node.freeColumns[i];
						break;
					}
				}
			}

			if ( target ) {
				switch ( eventType ) {
					case 'mousedown':
						target.renderer.onMouseDown( { "x": translated.x - target.canvasContext.left, "y": point.y }, which, ctrlKey, altKey, shiftKey );
						break;
					case 'mouseup':
						target.renderer.onMouseUp( { "x": translated.x - target.canvasContext.left, "y": point.y }, which, ctrlKey, altKey, shiftKey );
						break;
					case 'mousemove':
						target.renderer.onMouseMove( { "x": translated.x - target.canvasContext.left, "y": point.y }, which, ctrlKey, altKey, shiftKey );
						break;
					case 'click':
						target.renderer.onClick( { "x": translated.x - target.canvasContext.left, "y": point.y }, which, ctrlKey, altKey, shiftKey );
						break;
					case 'dblclick':
						target.renderer.onDblClick( { "x": translated.x - target.canvasContext.left, "y": point.y }, which, ctrlKey, altKey, shiftKey );
						break;
				}
			}

		}

		function getResizeTargetColumn( point: IPoint ): UI_Column {

			var left: number = 0,
			    i: number,
			    len: number;

			if ( node.freezedColumns ) {
				for ( i=0, len = node.freezedColumns.length; i<len; i++ ) {
					left += node.freezedColumns[i].width;
					if ( node.freezedColumns[i].resizable && ( left == point.x || left == point.x - 1 || left == point.x + 1 ) ) {
						return node.freezedColumns[i];
					}
				}
			}

			if ( node.freeColumns ) {

				for ( i = 0, len = node.freeColumns.length; i<len; i++ ) {
					left += node.freeColumns[i].width;
					if ( left > node.freezedWidth && node.freeColumns[i].resizable ) {
						if ( left == point.x || left == point.x - 1 || left == point.x + 1 ) {
							return node.freeColumns[i];
						}
					}
				}
			}

			return null;

		}

		function resizeRelease( ev ) {
			isResizing = false;
			document.body.removeEventListener( 'mouseup', resizeRelease, true );
		}

		function computeColumns() {
			
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
									"x": freezedWidth + ( logicalWidth - node.scrollLeft - columns[i].width ),
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
									"x": freezedWidth + ( logicalWidth - node.scrollLeft - columns[i].width ),
									"y": UI_Column._theme.height,
									"width": columns[i].width,
									"height": node.viewportHeight - UI_Column._theme.height
								}
							);

						}

						columns[i].headerContext.left 
						    = columns[i].canvasContext.left
							= freezedWidth + ( logicalWidth - columns[i].width ) - node.scrollLeft;

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

		}

		/* PUBLIC INITIALIZE DATA */

		/* Initialize mouse events */
		node.on( 'mousedown', function( point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean ) {
			
			if ( isResizing === false && resizeTargetColumn !== null ) {
				isResizing = true;
				prevX = point.x;

				document.body.addEventListener( 'mouseup', resizeRelease );
			}

			if ( !isResizing ) {
				
				if ( isRowInterface && point.y > 0 && which == 1 && !node.disabled ) {

					var rowIndex: number = ~~( point.y / node.rowHeight );

					node['onRowIndexClick']( rowIndex, shiftKey, ctrlKey );

				}

				forwardEvent( 'mousedown', point, which, ctrlKey, altKey, shiftKey );

			}

		} );

		node.on( 'mouseup', function(point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean) {
			
			if ( !isResizing ) {

				forwardEvent( 'mouseup', point, which, ctrlKey, altKey, shiftKey );

			} else {

				isResizing = false;

			}

		} );

		node.on( 'mousemove', function(point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean) {
			
			var nowTargetColumn: UI_Column,
			    deltaX: number;

			if ( isResizing === false ) {
				
				nowTargetColumn = point.y < 0 ? getResizeTargetColumn( point ) : null;
				
				if ( nowTargetColumn != resizeTargetColumn ) {
					resizeTargetColumn = nowTargetColumn;
					if ( resizeTargetColumn ) {
						Utils.dom.addClass( node._root, 'col-resize' );
					} else {
						Utils.dom.removeClass( node._root, 'col-resize' );
					}
				}

				forwardEvent( 'mousemove', point, which, ctrlKey, altKey, shiftKey );
			} else {

				deltaX = point.x - prevX;

				if ( resizeTargetColumn.width + deltaX > 5 ) {
					resizeTargetColumn.width += deltaX;
					prevX = point.x;
				}

			}
			

		} );

		node.on( 'click', function(point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean) {

			if ( !isResizing ) {

				var i: number,
				    len: number,
				    left: number = 0;
				
				if ( point.y < 0 ) {
					// clicked on a column?

					if ( node.freezedColumns ) {
						for ( i=0, len = node.freezedColumns.length; i<len; i++ ) {
							if ( ( left + 2 ) < point.x && point.x < ( node.freezedColumns[i].width + left - 2 ) ) {
								node.freezedColumns[i].onHeaderClick();
								return;
							}
							left += node.freezedColumns[i].width;
						}
					}

					if ( node.freeColumns ) {

						for ( i = 0, len = node.freeColumns.length; i<len; i++ ) {
							if ( left + 2 > node.freezedWidth ) {
								if ( ( left + 2 ) < point.x && point.x < ( node.freeColumns[i].width + left - 2 ) ) {
									node.freeColumns[i].onHeaderClick();
									return;
								}
							}
							left += node.freeColumns[i].width;
						}
					}


				} else {

					forwardEvent( 'click', point, which, ctrlKey, altKey, shiftKey );

				}

			}

		} );

		node.on( 'dblclick', function(point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean) {
			forwardEvent( 'dblclick', point, which, ctrlKey, altKey, shiftKey );
		} );

		// Each time the columns are triggering this event, we must
		// update them in the main parent.
		node.on( 'column-changed', computeColumns );
		node.on( 'viewport-resized', computeColumns );
		node.on( 'scroll-x', computeColumns );
		
		node.on( 'sort', function( fieldName: string, sortState: ESortState, dataType: string, inputFormat?: string ) {

			if ( !fieldName || !node['columns'] ) {
				return;
			}

			var i: number = 0,
			    columns = node['columns']( null ),
			    len: number = columns.length;

			for ( i=0; i<len; i++ ) {
				if ( columns[i].name == fieldName ) {
					if ( columns[i].sortState != sortState )
						columns[i].sortState = sortState;
				} else {
					columns[i].sortState = ESortState.NONE;
				}
			}

			node.onRepaint();

		} );


		node.on( 'disabled', function() {
			node.onRepaint();
		} );

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

		if ( this.freeColumns && this.freezedColumns ) {
			for ( i=0, len = this.freeColumns.length; i<len; i++ ) {
				this.freeColumns[i].renderer.render();
			}

			if ( this.freezedColumns.length ) {
				this.prerenderFreezed();
				for ( i=0, len = this.freezedColumns.length; i<len; i++ ) {
					this.freezedColumns[i].renderer.render();
				}
			}
		}
	}

	public prerenderFreezed() {
		var ctx = this.globalContext;

		/* Paints the background for the selected items globally */
		var yPaintStart: number = this.yPaintStart + UI_Column._theme.height,
		    start      : number = this.indexPaintStart,
		    stop       : number = this.indexPaintEnd,

		    isDisabled : boolean = this.disabled,
		    isActive   : boolean = this['active'] && ( this.form ? this.form.active : true ),
		    i          : number,
		    item       : Store_Item,
		    rowHeight  : number = this.rowHeight,
		    width      : number = this.freezedWidth;

		ctx.fillStyle = isDisabled
			? UI_Canvas._theme.background.disabled
			: UI_Canvas._theme.background.enabled;

		ctx.fillRect( 0, 0, width, this.viewportHeight );

		for ( i = start; i < stop; i++ ) {
			
			item = this.itemAt(i);
			
			if ( item.selected ) {

				ctx.fillStyle = isActive
					? ( isDisabled ? UI_Canvas._theme.background.selectedDisabled: UI_Canvas._theme.background.selected )
					: UI_Canvas._theme.background.selectedInactive;

				ctx.fillRect( 0, yPaintStart, width, rowHeight );

			}

			yPaintStart += rowHeight;
		}
	}

	public prerenderFree() {
		var ctx = this.globalContext;

		/* Paints the background for the selected items globally */
		var yPaintStart: number = this.yPaintStart + UI_Column._theme.height,
		    start      : number = this.indexPaintStart,
		    stop       : number = this.indexPaintEnd,

		    isDisabled : boolean = this.disabled,
		    isActive   : boolean = this['active'] && ( this.form ? this.form.active : true ),
		    i          : number,
		    item       : Store_Item,
		    rowHeight  : number = this.rowHeight,
		    width      : number = this.viewportWidth,
		    freezedWidth: number = this.freezedWidth;

		ctx.fillStyle = isDisabled
			? UI_Canvas._theme.background.disabled
			: UI_Canvas._theme.background.enabled;

		ctx.fillRect( freezedWidth, 0, width - freezedWidth, this.viewportHeight );

		for ( i = start; i < stop; i++ ) {
			
			item = this.itemAt(i);
			
			if ( item.selected ) {

				ctx.fillStyle = isActive
					? ( isDisabled ? UI_Canvas._theme.background.selectedDisabled: UI_Canvas._theme.background.selected )
					: UI_Canvas._theme.background.selectedInactive;

				ctx.fillRect( freezedWidth, yPaintStart, width - freezedWidth, rowHeight );

			}

			yPaintStart += rowHeight;
		}
	}

	public prerender() {
		this.prerenderFree();
	}

	get yPaintStart(): number {
		return -( this.scrollTop % this.rowHeight ) || 0;
	}

	get indexPaintStart(): number {
		return ~~( this.scrollTop / this.rowHeight );
	}

	get indexPaintEnd(): number {
		return Math.min( this.length, this.indexPaintStart + this.itemsPerPage );
	}

	// @overrides the postrender on the canvas
	public postrender() {

		var yPaintStart   : number = this.yPaintStart + UI_Column._theme.height + .5,
		    start         : number = this.indexPaintStart,
		    stop          : number = this.indexPaintEnd,
		    selectedIndex : number = this.selectedIndex,
			header 		  : UI_Canvas_ContextMapper = this.headerContext,
			body          : CanvasRenderingContext2D = this.globalContext,
			rowHeight     : number = this.rowHeight;

		/* Paint the selectedIndex */
		if ( selectedIndex >= start && selectedIndex < stop && this['active'] && ( this.form ? this.form.active : true ) ) {
			body.strokeStyle = 'black';
			body.lineWidth   = 1;
			body.strokeRect( .5, yPaintStart + ( selectedIndex - start ) * rowHeight, this.viewportWidth - 1, rowHeight - 1 )

		}

		if ( this.freeColumns && this.freezedColumns ) {
			

			header.beginPaint();

			header.fillStyle = this.disabled
				? UI_Column._theme.background.disabled
				: UI_Column._theme.background.enabled;

			header.fillRect( 0, 0, header.width, header.height );

			header.endPaint();

			var i: number,
			    len: number;

			/* First we paint free width columns, and after that we paint
			   freezed columns
			 */

			for ( i=0, len = this.freeColumns.length; i<len; i++ ) {
				this.freeColumns[i].paintHeader();
				// this.freeColumns[i].paintEdge();
			}

			/* Second we paint freezed columns
			 */

			for ( i=0, len = this.freezedColumns.length; i<len; i++ ) {
				this.freezedColumns[i].paintHeader();
				// this.freezedColumns[i].paintEdge();
			}

			header.fillStyle = UI_Column._theme.border[ this.disabled ? 'disabled' : 'enabled' ];

			header.fillRect( 0, header.height - 1, header.width - 1, 1 );

		}


	}

	public itemAt( index: number ): Store_Item {
		throw new Error( 'Should be implemented by target' );
	}

}
