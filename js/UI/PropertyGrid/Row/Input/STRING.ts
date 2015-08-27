class UI_PropertyGrid_Row_Input_STRING extends UI_PropertyGrid_Row_Input {

	constructor( config: IPropertyGroupNested, grid: UI_PropertyGrid, parent: UI_PropertyGrid_Row_Group = null ) {
		super( config, grid, parent );
		this._type = EColumnType.STRING;
	}

	protected createEditor(): UI {
		var result: UI_TextBox = new UI_TextBox(this._grid);

		if ( this.password ) {
			result.password = true;
		}

		this.bindEditorEvents( result );

		result.value = <string>this._value || '';

		return result;
	}

	public paintAt( x: number, y: number, height: number, isDisabled: boolean, isActive: boolean, splitWidth: number, ctx: UI_Canvas_ContextMapper ) {
		
		super.paintAt( x, y, height, isDisabled, isActive, splitWidth, ctx );
		
		if ( !this._input ) {

			ctx.fillText( ctx.dotDotDot( this.password ? Utils.string.repeat( this._value.length, '*' ) : this._value, ctx.width - splitWidth - 4 ), x + splitWidth + 2, y + ~~( height / 2 ) );

		}
	}

}