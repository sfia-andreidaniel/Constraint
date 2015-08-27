class UI_PropertyGrid_Row_Input_FLOAT extends UI_PropertyGrid_Row_Input {

	constructor( config: IPropertyGroupNested, grid: UI_PropertyGrid, parent: UI_PropertyGrid_Row_Group = null ) {
		super( config, grid, parent );
		this._type = EColumnType.FLOAT;
	}

	protected createEditor(): UI {
		var result: UI_Spinner = new UI_Spinner(this._grid);
				
		result.keyIncrement = false;

		if ( this.min !== null )
			result.min = this.min;

		if ( this.max !== null )
			result.max = this.max;

		result.precision = this.precision;

		this.bindEditorEvents( result );

		result.value = <number>this._value || 0;

		return result;
	}


	public paintAt( x: number, y: number, height: number, isDisabled: boolean, isActive: boolean, splitWidth: number, ctx: UI_Canvas_ContextMapper ) {
		super.paintAt( x, y, height, isDisabled, isActive, splitWidth, ctx );
		
		if ( !this._input ) {
		}
	}

}