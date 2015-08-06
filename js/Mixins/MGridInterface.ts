/** 
 * The Interface for the Grids. Any UI element that is representing
 * a grid should implement this interface.
 */
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
	editable        : boolean;

	freezedColumns  : UI_Column[];
	freeColumns     : UI_Column[];
}

/**
 * The Grid Mixin. It injects methods and properties to an UI element
 * that is extendint UI_Canvas, in order to implement the IGridInterface.
 */
class MGridInterface extends UI_Canvas implements IGridInterface {

	/**
	 * Tells the Mixin injector that this is a valid mixin.
	 */
	public static isMixin: boolean = true;

	/**
	 * Tells the Mixin injector to force injecting these properties
	 * into the target, even if the exist implemented on the target.
	 */
	public static forceProperties: string[] = [
		'columns',
		'postrender',
		'freezedColumns',
		'freeColumns',
		'prerender',
		'postrender',
		'editable'
	];

	/**
	 * Tells the Mixin injector to skip injecting these properties
	 * on the target, even if they are implemented in this mixin
	 */
	public static skipProperties: string[] = [
		'itemAt'
	];

	/**
	 * The columns which are freezed
	 */
	public freezedColumns : UI_Column[] = [];

	/**
	 * The columns which are not freezed, and have free scrolling
	 */
	public freeColumns    : UI_Column[] = [];

	/**
	 * Items per page, computed by the visible height / row height
	 */
	public itemsPerPage   : number;

	/**
	 * Total numbers of items in the grid
	 */
	public length         : number;

	/**
	 * Is this grid editable or not?
	 */
	protected _editable: boolean = false;

	/**
	 * Initializer for the UI element, that mixin is calling for each node
	 * that it's embracing it.
	 */

	public static initialize( node: UI_Canvas ) {

		/* PRIVATE INITIALIZE DATA */

		var isRowInterface: boolean = node.implements( 'IRowInterface' ),
		    resizeTargetColumn: UI_Column = null,
		    isResizing: boolean = false,
		    prevX: number = 0;

		/**
		 * Forwards a mouse event to a grid column.
		 */
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

		/**
		 * Computes the resizing column that will be resized when the user places the
		 * mouse cursor on the right edge in the column header.
		 */
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

		/**
		 * Dettaches the resize event from the document body, when the user release the mouse button
		 */
		function resizeRelease( ev ) {
			isResizing = false;
			document.body.removeEventListener( 'mouseup', resizeRelease, true );
		}

		/**
		 * Computes details about columns, their displaying in the header, their widths, etc.
		 * This function is called each time a column emits the "column-changed" event.
		 */
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

						columns[i].left.distance = freezedWidth;

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
						
						columns[i].left.distance = logicalWidth;

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

					// clicked on a column header?

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

		// Each time the columns are triggering this event, we must update them in the main parent.
		node.on( 'column-changed',    computeColumns );
		node.on( 'viewport-resized',  computeColumns );
		node.on( 'scroll-x',          computeColumns );
		
		// we add an event to the "sort" event emited by the columns after we're clicking their header.
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

		// we repaint the node if the node becomes disabled.
		node.on( 'disabled', function() {
			node.onRepaint();
		} );

		// when the selected index changes, if we have an editable column with it's editor active,
		// we modify the rowIndex of the editor of that column
		node.on( 'index-changed', function() {
			if ( node['columns'] ) {
				var columns: UI_Column[] = node['columns']( null ),
				    i: number,
				    len: number = columns.length;
				for ( i=0; i<len; i++ ) {
					if ( columns[i].editor ) {
						columns[i].editor.rowIndex = node.selectedIndex;
					}
				}
			}
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

	/**
	 * Renders the columns contents on their appropriated context mappings
	 */
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

	/**
	 * Renderer that is executed in pre-render phase, which renders the contents
	 * of the freezed columns onto their appropriate canvas context mappings.
	 */
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

	/**
	 * Renderer that is executed in pre-render phase, which renders the contents
	 * of the free-scrollable columns onto their appropriate canvas context mappings.
	 */
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

	/**
	 * Pre-renderer.
	 */
	public prerender() {
		this.prerenderFree();
	}

	/**
	 * Computes the physical "top" position where the first grid row should be
	 * painted on the canvas viewport.
	 */
	get yPaintStart(): number {
		return -( this.scrollTop % this.rowHeight ) || 0;
	}

	/**
	 * Computes the index of the first row that should be painted in the viewport.
	 */
	get indexPaintStart(): number {
		return ~~( this.scrollTop / this.rowHeight );
	}

	/**
	 * Computes the index of the last row that should be painted in the viewport.
	 */
	get indexPaintEnd(): number {
		return Math.min( this.length, this.indexPaintStart + this.itemsPerPage );
	}

	/**
	 * The post-renderer starts painting on canvas after the rendering phase finish.
	 */
	public postrender() {

		var yPaintStart   : number = this.yPaintStart + UI_Column._theme.height + .5,
		    start         : number = this.indexPaintStart,
		    stop          : number = this.indexPaintEnd,
		    selectedIndex : number = this.selectedIndex,
			header 		  : UI_Canvas_ContextMapper = this.headerContext,
			body          : CanvasRenderingContext2D = this.globalContext,
			rowHeight     : number = this.rowHeight;

		/* Paint the selectedIndex */
		if ( selectedIndex >= start && selectedIndex < stop && this['active'] && ( this.form ? this.form.active : true ) && this['multiple'] ) {
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
				this.freeColumns[i].onRepaint();
			}

			/* Second we paint freezed columns
			 */

			for ( i=0, len = this.freezedColumns.length; i<len; i++ ) {
				this.freezedColumns[i].paintHeader();
				this.freezedColumns[i].onRepaint();
			}

			header.fillStyle = UI_Column._theme.border[ this.disabled ? 'disabled' : 'enabled' ];

			header.fillRect( 0, header.height - 1, header.width - 1, 1 );

		}

		if ( this.scrollLeft > 3 ) {
			UI_Resource.createSprite(
				'Constraint/dark_glow_we/12-y'
			).paintCtx(
				body,
				this.freezedWidth - 1,
				0,
				this.viewportHeight
			)
		}

	}

	/**
	 * Returns the item at position "index" in the grid collection (Store)
	 */
	public itemAt( index: number ): Store_Item {
		throw new Error( 'Should be implemented by target' );
	}

	// ******* EDITABLE PART *******

	/**
	 * Does this grid allows it's columns to be edited?
	 *
	 * If the grid doesn't allow it's columns to be edited, the "editable" property
	 * on it's columns will be always "false"
	 */
	get editable() {
		return this._editable;
	}

	set editable( on: boolean ) {
		on = !!on;
		if ( on != this._editable ) {
			this._editable = on;
			if ( !on ) {
				this.disposeAllColumnsEditors();
			}
		}
	}

	/**
	 * Returns TRUE if a column can create an editor. In the background, the grid interface
	 * checks the other columns to see if they have editors, and if they have editors in a closable state.
	 */
	public canCreateEditor( column: UI_Column ): boolean {

		var columns: UI_Column[] = this.columns( null ),
		    i: number,
		    len: number = columns.length;

		for ( i=0; i<len; i++ ) {
			if ( ( columns[i] != column ) && ( !columns[i].canDisposeEditor() ) ) {
				return false;
			}
		}

		return true;

	}

	public disposeAllColumnsEditors() {
		var columns: UI_Column[] = this.columns( null ),
		    i: number,
		    len: number = columns.length;

		for ( i=0; i<len; i++ ) {
			columns[i].disposeEditor();
		}
	}

}
