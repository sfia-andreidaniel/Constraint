/**
 * A property grid input row that knows how to render and edit a string value.
 * Optionally, a password mask can be provided, in order to render the string as a password.
 */
class UI_PropertyGrid_Row_Input_STRING extends UI_PropertyGrid_Row_Input {

	protected password: boolean = false;

	constructor( config: IPropertyGroupNested, grid: UI_PropertyGrid, parent: UI_PropertyGrid_Row_Group = null ) {
		super( config, grid, parent );

		if ( typeof config.input.password != 'undefined' ) {
			this.password = !!config.input.password;
		}

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

	public paintAt( x: number, y: number, height: number, isDisabled: boolean, isActive: boolean, splitWidth: number, isScrollbarX: boolean, isScrollbarY: boolean, ctx: UI_Canvas_ContextMapper ) {
		
		super.paintAt( x, y, height, isDisabled, isActive, splitWidth, isScrollbarX, isScrollbarY, ctx );
		
		if ( !this._input ) {

			ctx.fillText( ctx.dotDotDot( this.password ? Utils.string.repeat( this._value.length, '●' ) : this._value, ctx.width - splitWidth - 4 ), x + splitWidth + 2, y + ~~( height / 2 ) );

		}
	}

}