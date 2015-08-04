/**
 * The UI_Column_Renderer implements a grid column mechanism that is used to
 * draw the column contents on the column grid.
 */

class UI_Column_Renderer {
	
	/**
	 * Renderer's column owner
	 */
	protected _column: UI_Column;

	/**
	 * Constructor.
	 */
	constructor( column: UI_Column ) {
		this._column = column;
	}

	/**
	 * Renders the column body in the canvas.
	 */
	public render( ) {
		// overrided by ancestors
	}

	/**
	 * Returns the sort data type that is passed to the sorter.
	 */
	get sortDataType(): string {
		return 'istring';
	}

	/* IF THE RENDERER IS USING MOUSE EVENTS, THESE METHODS CAN BE IMPLEMENTED. */

	/**
	 * Handles a mouse down event in the column body.
	 */
	public onMouseDown( point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean ) {
		if ( this._column && this._column.grid && this._column.grid.editable ) {
			this._column.createEditor();
		}
	}

	/**
	 * Handles a mouse up event in the column body.
	 */
	public onMouseUp  ( point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean ) {}

	/**
	 * Handles a mouse move event in the column body.
	 */
	public onMouseMove( point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean ) {}

	/**
	 * Handles a click event in the column body.
	 */
	public onClick    ( point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean ) {}


	/**
	 * Handles a double click event in the colum body.
	 */
	public onDblClick ( point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean ) {}

	/**
	 * Creates a column renderer for a specific column data type.
	 */
	public static createForType( type: EColumnType, inColumn: UI_Column ): UI_Column_Renderer {
		switch ( type ) {
			case EColumnType.ROW_NUMBER:
				return new UI_Column_Renderer_RowNumber( inColumn );
				break;
			case EColumnType.TREE:
				return new UI_Column_Renderer_Tree( inColumn );
				break;
			case EColumnType.INT:
				return new UI_Column_Renderer_Int( inColumn );
				break;
			case EColumnType.FLOAT:
				return new UI_Column_Renderer_Float( inColumn );
				break;
			case EColumnType.STRING:
				return new UI_Column_Renderer_String( inColumn );
				break;
			case EColumnType.BOOLEAN:
				return new UI_Column_Renderer_Boolean( inColumn );
				break;
			case EColumnType.BYTES:
				return new UI_Column_Renderer_Bytes( inColumn );
				break;
			case EColumnType.DATE:
				return new UI_Column_Renderer_Date( inColumn );
				break;
			default:
				return new UI_Column_Renderer( inColumn );
				break;
		}
	}
}