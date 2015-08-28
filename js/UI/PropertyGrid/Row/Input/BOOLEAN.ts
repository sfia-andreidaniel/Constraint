/**
 * A property grid input row, that knows how to render and edit a boolean value.
 */
class UI_PropertyGrid_Row_Input_BOOLEAN extends UI_PropertyGrid_Row_Input {

	constructor( config: IPropertyGroupNested, grid: UI_PropertyGrid, parent: UI_PropertyGrid_Row_Group = null ) {
		super( config, grid, parent );
	}

	protected createEditor(): UI {
		var result: UI_CheckBox = new UI_CheckBox(this._grid);
		result.caption = '';
		this.bindEditorEvents( result );
		result.value = !!this._value;
		return result;
	}

	public paintAt( x: number, y: number, height: number, isDisabled: boolean, isActive: boolean, splitWidth: number, isScrollbarX: boolean, isScrollbarY: boolean, ctx: UI_Canvas_ContextMapper ) {
		super.paintAt( x, y, height, isDisabled, isActive, splitWidth, isScrollbarX, isScrollbarY, ctx );
		
		if ( !this._input ) {
			if ( !!this._value ) {
				UI_Resource.createSprite(
						'Constraint/grid_boolean/14x14'
						+ ( isDisabled ? '-disabled' : '' )
				).paintWin( ctx, splitWidth + 2, y + ~~( height / 2 - 7 ) );
			}
		}
	}

}