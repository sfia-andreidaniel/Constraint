/**
 * A property grid input row, that knows how to edit and render an integer value.
 */
class UI_PropertyGrid_Row_Input_INT extends UI_PropertyGrid_Row_Input {

	protected min: number = null;
	protected max: number = null;

	constructor( config: IPropertyGroupNested, grid: UI_PropertyGrid, parent: UI_PropertyGrid_Row_Group = null ) {

		super( config, grid, parent );

		if ( typeof config.input.min != 'undefined' ) {
			this.min = isNaN( config.input.min ) ? null : parseFloat( String( config.input.min || 0 ) );
		}

		if ( typeof config.input.max != 'undefined' ) {
			this.max = isNaN( config.input.max ) ? null : parseFloat( String( config.input.max || 0 ) );
		}

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

	public paintAt( x: number, y: number, height: number, isDisabled: boolean, isActive: boolean, splitWidth: number, isScrollbarX: boolean, isScrollbarY: boolean, ctx: UI_Canvas_ContextMapper ) {
		super.paintAt( x, y, height, isDisabled, isActive, splitWidth, isScrollbarX, isScrollbarY, ctx );
		
		if ( !this._input ) {
			
			var numStr: number = parseInt( String( this._value ) || '0' );

			numStr = isNaN( numStr ) || !isFinite( numStr )? 0 : numStr;

			ctx.fillText( ctx.dotDotDot( String( numStr ), ctx.width - splitWidth - 4 ), x + splitWidth + 2, y + ~~( height / 2 ) );

		}
	}

}