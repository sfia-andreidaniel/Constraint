class UI_PropertyGrid_Row_Input_DATE extends UI_PropertyGrid_Row_Input {

	constructor( config: IPropertyGroupNested, grid: UI_PropertyGrid, parent: UI_PropertyGrid_Row_Group = null ) {
		super( config, grid, parent );
		this._type = EColumnType.DATE;
	}

	protected createEditor(): UI {
		var result: UI_DateBox = new UI_DateBox(this._grid);
		result.displayFormat = this.outputFormat;
		this.bindEditorEvents( result );
		return result;
	}

	public paintAt( x: number, y: number, height: number, isDisabled: boolean, isActive: boolean, splitWidth: number, ctx: UI_Canvas_ContextMapper ) {
		super.paintAt( x, y, height, isDisabled, isActive, splitWidth, ctx );
		
		if ( !this._input ) {
		}
	}

}