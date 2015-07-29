class UI_Column_Renderer {
	
	protected _column: UI_Column;

	constructor( column: UI_Column ) {
		this._column = column;
	}

	public render( ) {
		
		var ctx = this._column.canvasContext;
		
		if ( !ctx ) {
			return;
		}

		ctx.beginPaint();

		ctx.fillStyle = 'black';
		ctx.fillRect( 0, 0, ctx.width, ctx.height );

		ctx.endPaint();

	}

	/* IF THE RENDERER IS USING MOUSE EVENTS, THESE METHODS CAN BE IMPLEMENTED. */

	public onMouseDown( point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean ) {
		//console.log( 'mousedown: ', point, which );
	}

	public onMouseUp  ( point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean ) {
		//console.log( 'mouseup: ', point, which );
	}

	public onMouseMove( point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean ) {
		//console.log( 'mousemove: ', point, which );
	}

	public onClick    ( point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean ) {
		//console.log( 'click', point, which );
	}

	public onDblClick ( point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean ) {
		//console.log( 'dblclick', point, which );
	}

	public static createForType( type: EColumnType, inColumn: UI_Column ) {
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
			default:
				return new UI_Column_Renderer( inColumn );
				break;
		}
	}
}