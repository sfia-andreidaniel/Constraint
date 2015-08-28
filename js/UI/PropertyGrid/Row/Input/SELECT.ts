/**
 * A PropertyGrid input row that knows how to render a value and let the user to chose one from
 * a set of pre-defined values.
 */
class UI_PropertyGrid_Row_Input_SELECT extends UI_PropertyGrid_Row_Input {
	
	private _options: IOption[] = null;
	private _text: string = '';

	constructor( config: IPropertyGroupNested, grid: UI_PropertyGrid, parent: UI_PropertyGrid_Row_Group = null ) {
		super( config, grid, parent );

		if ( typeof config.input.options != undefined ) {
			this._options = config.input.options || null;
		}

		this.maintainText();
	}

	get options(): IOption[] {
		return this._options;
	}

	set options( values: IOption[] ) {
		
		values = values || null;
		
		this._options = values;

		this.maintainText();

		if ( this._input ) {
			(<UI_DropDown>this._input).options = this._options;
		}
	}

	get value(): any {
		return this._value;
	}

	set value( value: any ) {
		this._value = value;
		
		if ( this._input ) {
			this._input['value'] = value;
		}

		this.maintainText();

		this._grid.render();
	}

	get isHandlingUpDown(): boolean {
		if ( !this._input ) {
			return false;
		} else {
			if ( ( <UI_DropDown>this._input ).isExpanded ) {
				return true;
			} else {
				return false;
			}
		}
	}

	private maintainText() {
		var i: number = 0,
		    len: number;

		if ( this._options ) {
			for ( i=0, len = this._options.length; i<len; i++ ) {
				if ( String( this._options[i].value || '' ) == String( this._value || '' ) ) {
					this._text = this._options[i].text;
					return;
				}
			}
		}

		this._text = String( this._value );
	}

	protected createEditor(): UI {

		if ( !this._options || !this._options.length ) {
			return null;
		}

		var result: UI_DropDown = new UI_DropDown(this._grid);
		
		result.options = this._options;
		result.keyIncrement = false;
		
		this.bindEditorEvents( result );

		( function( me ) {
			result.on( 'change', function() {
				me.maintainText();
			} );
		} )( this );

		result.value = this._value;
		
		return result;
	}

	public paintAt( x: number, y: number, height: number, isDisabled: boolean, isActive: boolean, splitWidth: number, isScrollbarX: boolean, isScrollbarY: boolean, ctx: UI_Canvas_ContextMapper ) {
		super.paintAt( x, y, height, isDisabled, isActive, splitWidth, isScrollbarX, isScrollbarY, ctx );
		
		if ( !this._input ) {
			ctx.fillText( ctx.dotDotDot( this._text, ctx.width - splitWidth - 4 ), x + splitWidth + 2, y + ~~( height / 2 ) );
		}
	}

}