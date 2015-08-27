class UI_PropertyGrid_Row_Input extends UI_PropertyGrid_Row implements IInput {

	protected _type: EColumnType;
	protected _value: any = null;
	protected min: number = null;
	protected max: number = null;
	protected inputFormat: string = 'MS';
	protected outputFormat: string = Utils.date.DEFAULT_DATE_FORMAT;
	protected precision: number;
	protected _disabled: boolean = false;
	protected password: boolean = false;

	constructor( config: IPropertyGroupNested, grid: UI_PropertyGrid, parent: UI_PropertyGrid_Row_Group = null ) {

		super( config, grid, parent );

		if ( typeof config.input.value != 'undefined' ) {
			this._value = config.input.value;
		}

		if ( typeof config.input.min != 'undefined' ) {
			this.min = isNaN( config.input.min ) ? null : parseFloat( String( config.input.min || 0 ) );
		}

		if ( typeof config.input.max != 'undefined' ) {
			this.max = isNaN( config.input.max ) ? null : parseFloat( String( config.input.max || 0 ) );
		}

		if ( typeof config.input.inputFormat != 'undefined' ) {
			this.inputFormat = String( config.input.inputFormat || '' ) || null;
		}

		if ( typeof config.input.outputFormat != 'undefined' ) {
			this.outputFormat = String( config.input.outputFormat || '' ) || null;
		}

		if ( typeof config.input.precision != 'undefined' ) {
			this.precision = ~~config.input.precision;
		}

		if ( typeof config.input.password != 'undefined' ) {
			this.password = !!config.input.password;
		}

		this.on( 'disabled', function( on: boolean ) {
			if ( on && this._input ) {
				this._grid.disposeEditor();
			}
		} );

	}

	get value(): any {
		return this._value;
	}

	set value( value: any ) {
		this._value = value;
		
		if ( this._input ) {
			this._input['value'] = value;
		}
	}

	public paintAt( x: number, y: number, height: number, isDisabled: boolean, isActive: boolean, splitWidth: number, ctx: UI_Canvas_ContextMapper ) {
		
		super.paintAt( x, y, height, isDisabled, isActive, splitWidth, ctx );
		
		if ( this._input ) {
			this._input.left  = splitWidth;
			this._input.top   = y + this._grid.scrollTop;
			this._input.width = ctx.width - splitWidth;
		}
	}

	public bindEditorEvents( editor: UI ) {

		( function( me ) {
			
			editor.on( 'change', function() {
				var oldValue = me._value;

				me._value = editor['value'];
				
				if ( me._value !== oldValue ) {
					me._grid.fire( 'property-change', me.fullNotation, me._value, oldValue );
				}

			} );

			editor.on( 'destroy', function() {
				editor.remove();
				editor.off(null,null);
				me._input = undefined;
			} );

			editor.on( 'focus', function() {
				me._grid.render();
			} );

			editor.on( 'blur', function() {
				me._grid.render();
			} );

			editor.on( 'keydown', function( ev ) {
				var code: number = ev.keyCode || ev.charCode;

				if ( ( code == Utils.keyboard.KB_UP || code == Utils.keyboard.KB_DOWN ) && ( !ev.ctrlKey && !ev.altKey && !ev.shiftKey ) ) {
					me._grid.fire( 'keydown', ev );
				}
			} );

			editor.disabled = me.disabled;

		} )( this );

	}

	public static create( inputType: string, config: IPropertyGroupNested, grid: UI_PropertyGrid, parent: UI_PropertyGrid_Row_Group = null ): UI_PropertyGrid_Row_Input {

		inputType = ( String( inputType ) || '' ).toUpperCase();
		
		switch ( inputType ) {
			case "DATE":
				return new UI_PropertyGrid_Row_Input_DATE(config, grid, parent );
				break;
			case "BOOLEAN":
				return new UI_PropertyGrid_Row_Input_BOOLEAN( config, grid, parent );
				break;
			case "FLOAT":
				return new UI_PropertyGrid_Row_Input_FLOAT( config, grid, parent );
				break;
			case "INT":
				return new UI_PropertyGrid_Row_Input_INT( config, grid, parent );
				break;
			case "STRING":
				return new UI_PropertyGrid_Row_Input_STRING( config, grid, parent );
				break;
			default:
				throw new Error( 'Don\'t know how to create a PropertyGrid input row of type "' + inputType + '"' );
				break;
		}
	}


}