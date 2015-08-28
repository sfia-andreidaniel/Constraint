/**
 * A property grid input row that knows how to edit and render a float based-number
 */
class UI_PropertyGrid_Row_Input_FLOAT extends UI_PropertyGrid_Row_Input {

	protected min: number = null;
	protected max: number = null;
	protected precision: number;

	constructor( config: IPropertyGroupNested, grid: UI_PropertyGrid, parent: UI_PropertyGrid_Row_Group = null ) {
		super( config, grid, parent );

		if ( typeof config.input.min != 'undefined' ) {
			this.min = isNaN( config.input.min ) ? null : parseFloat( String( config.input.min || 0 ) );
		}

		if ( typeof config.input.max != 'undefined' ) {
			this.max = isNaN( config.input.max ) ? null : parseFloat( String( config.input.max || 0 ) );
		}

		if ( typeof config.input.precision != 'undefined' ) {
			this.precision = ~~config.input.precision;
		}
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


	public paintAt( x: number, y: number, height: number, isDisabled: boolean, isActive: boolean, splitWidth: number, isScrollbarX: boolean, isScrollbarY: boolean, ctx: UI_Canvas_ContextMapper ) {
		super.paintAt( x, y, height, isDisabled, isActive, splitWidth, isScrollbarX, isScrollbarY, ctx );
		
		if ( !this._input ) {
		}
	}

}