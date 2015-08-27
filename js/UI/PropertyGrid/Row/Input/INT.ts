class UI_PropertyGrid_Row_Input_INT extends UI_PropertyGrid_Row_Input {

	constructor( config: IPropertyGroupNested, grid: UI_PropertyGrid, parent: UI_PropertyGrid_Row_Group = null ) {
		super( config, grid, parent );
		this._type = EColumnType.INT;
	}

	protected createEditor(): UI {
		var result: UI_Spinner = new UI_Spinner(this._grid);

		result.keyIncrement = false;

		if ( this.min !== null )
			result.min = this.min;
				
		if ( this.max !== null )
			result.max = this.max;

		this.bindEditorEvents( result );
		
		result.value = parseInt( this._value ) || 0;

		return result;
	}

	public paintAt( x: number, y: number, height: number, isDisabled: boolean, isActive: boolean, splitWidth: number, ctx: UI_Canvas_ContextMapper ) {
		super.paintAt( x, y, height, isDisabled, isActive, splitWidth, ctx );
		
		if ( !this._input ) {
			
			var numStr: number = parseInt( String( this._value ) || '0' );

			numStr = isNaN( numStr ) || !isFinite( numStr )? 0 : numStr;



			ctx.fillText( ctx.dotDotDot( String( numStr ), ctx.width - splitWidth - 4 ), x + splitWidth + 2, y + ~~( height / 2 ) );

		}
	}

}