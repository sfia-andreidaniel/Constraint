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

		ctx.fillStyle = 'red';
		ctx.fillRect( 0, 0, ctx.width, ctx.height );

		ctx.endPaint();

	}

	public static createForType( type: EColumnType, inColumn: UI_Column ) {
		switch ( type ) {
			case EColumnType.TREE:
				return new UI_Column_Renderer_Tree( inColumn );
				break;
			default:
				return new UI_Column_Renderer( inColumn );
				break;
		}
	}
}