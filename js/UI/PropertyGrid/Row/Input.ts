/**
 * An abstract class representing a Property Grid input row.
 */
class UI_PropertyGrid_Row_Input extends UI_PropertyGrid_Row implements IInput {

	protected _value: any = null;
	protected _disabled: boolean = false;

	constructor( config: IPropertyGroupNested, grid: UI_PropertyGrid, parent: UI_PropertyGrid_Row_Group = null ) {

		super( config, grid, parent );

		if ( typeof config.input.value != 'undefined' ) {
			this._value = config.input.value;
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

		this._grid.render();
	}

	public paintAt( x: number, y: number, height: number, isDisabled: boolean, isActive: boolean, splitWidth: number, isScrollbarX: boolean, isScrollbarY: boolean, ctx: UI_Canvas_ContextMapper ) {
		
		super.paintAt( x, y, height, isDisabled, isActive, splitWidth, isScrollbarX, isScrollbarY, ctx );
		
		if ( this._input ) {
			this._input.left  = splitWidth + 1;
			this._input.top   = y + this._grid.scrollTop + 1;
			this._input.width = ctx.width - splitWidth - 2 - ~~isScrollbarY * Utils.dom.scrollbarSize;
			this._input.height = height - 2;
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
				if ( me._grid.form.activeElement != me._grid ) {
					me._grid.fire( 'blur' );
				}
			} );

			editor.on( 'keydown', function( ev: Utils_Event_Keyboard ) {
				var code: number = ev.code;

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
			case "SELECT":
				return new UI_PropertyGrid_Row_Input_SELECT( config, grid, parent );
				break;
			case "COLOR":
				return new UI_PropertyGrid_Row_Input_COLOR( config, grid, parent );
				break;
			default:
				throw new Error( 'Don\'t know how to create a PropertyGrid input row of type "' + inputType + '"' );
				break;
		}
	}


}