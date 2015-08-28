/**
 * A property grid input row, that knows how to render and edit a color value.
 */
class UI_PropertyGrid_Row_Input_COLOR extends UI_PropertyGrid_Row_Input {

	constructor( config: IPropertyGroupNested, grid: UI_PropertyGrid, parent: UI_PropertyGrid_Row_Group = null ) {
		super( config, grid, parent );
		this.value = this._value;
	}

	protected createEditor(): UI {
		var result: UI_ColorBox = new UI_ColorBox(this._grid);
		this.bindEditorEvents( result );
		result.value = this._value;
		return result;
	}

	get value(): any {
		return this._value === null
			? null
			: this._value.toString();
	}

	set value( value: any ) {
		
		var colorVal: UI_Color;

		switch ( true ) {
			case !!!value:
				colorVal = null;
				break;
			case value instanceof UI_Color:
				colorVal = value;
				break;
			case typeof value == 'string':
				try {
					colorVal = UI_Color.create( value );
				} catch (e) {
					colorVal = null;
				}
				break;
			default:
				colorVal = null;
				break;
		}

		this._value = colorVal;

		if ( this._input ) {
			(<UI_ColorBox>this._input).value = this._value;
		}

		this._grid.render();

	}

	public paintAt( x: number, y: number, height: number, isDisabled: boolean, isActive: boolean, splitWidth: number, isScrollbarX: boolean, isScrollbarY: boolean, ctx: UI_Canvas_ContextMapper ) {
		super.paintAt( x, y, height, isDisabled, isActive, splitWidth, isScrollbarX, isScrollbarY, ctx );
		
		if ( !this._input ) {
			
			if ( !this._value ) {

				ctx.fillText( ctx.dotDotDot( 'Color not set', ctx.width - splitWidth - 4 ), x + splitWidth + 2, y + ~~( height / 2 ) );

			} else {

				ctx.fillStyle = this._value.toString();

				ctx.fillRect( splitWidth + 2, y + 2, 20, height - 4 );

			}

		}
	}

}