/**
 * A property grid input row that can edit and render a Date object.
 */
class UI_PropertyGrid_Row_Input_DATE extends UI_PropertyGrid_Row_Input {

	protected inputFormat: string = 'MS';
	protected outputFormat: string = Utils.date.DEFAULT_DATE_FORMAT;

	constructor( config: IPropertyGroupNested, grid: UI_PropertyGrid, parent: UI_PropertyGrid_Row_Group = null ) {
		super( config, grid, parent );

		if ( typeof config.input.inputFormat != 'undefined' ) {
			this.inputFormat = String( config.input.inputFormat || '' ) || null;
		}

		if ( typeof config.input.outputFormat != 'undefined' ) {
			this.outputFormat = String( config.input.outputFormat || '' ) || null;
		}

		this.value = this._value;
	}

	protected createEditor(): UI {
		var result: UI_DateBox = new UI_DateBox(this._grid);
		result.displayFormat = this.outputFormat;
		result.keyIncrement = false;
		this.bindEditorEvents( result );
		result.value = this._value;
		return result;
	}

	get value(): any {
		return !this._value
			? null
			: Utils.date.format( this._value, this.inputFormat );
	}

	set value( value: any ) {

		var valDate: Date = null;

		switch ( true ) {

			case value === null:
			case value instanceof Date:
				valDate = value;
				break;
			case typeof value == 'string':
			case typeof value == 'number':
				valDate = Utils.date.parse( value, this.inputFormat ) || Utils.date.parse( value, this.outputFormat );
				break;
			default:
				valDate = null;
				break;
		}

		this._value = valDate;
		
		if ( this._input ) {
			this._input['value'] = this._value;
		}

		this._grid.render();
	}

	public paintAt( x: number, y: number, height: number, isDisabled: boolean, isActive: boolean, splitWidth: number, isScrollbarX: boolean, isScrollbarY: boolean, ctx: UI_Canvas_ContextMapper ) {
		super.paintAt( x, y, height, isDisabled, isActive, splitWidth, isScrollbarX, isScrollbarY, ctx );
		
		if ( !this._input ) {
			ctx.fillText( ctx.dotDotDot( this._value === null ? 'not set' : Utils.date.format( this._value, this.outputFormat ), ctx.width - splitWidth - 4 ), x + splitWidth + 2, y + ~~( height / 2 ) );
		}
	}

}