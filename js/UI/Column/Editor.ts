/**
 * Implementation of a column editor.
 */
class UI_Column_Editor extends UI implements IFocusable {

	public static _theme = {
		"border": {
			"width": $I.number('UI.UI_Column_Editor/border.width')
		}
	};

	/**
	 * The target column of this editor
	 */
	protected  _column   : UI_Column;
	
	/** The row index this editor needs to be placed */
	protected _rowIndex : number = 0;
	
	/** MFocusable requirement */
	public active: boolean;

	/** MFocusable requirement */
	public wantTabs: boolean;

	/** MFocusable requirement */
	public tabIndex: number;

	/** MFocusable requirement */
	public includeInFocus: boolean;

	/**
	 * If the column of the row we're editing is affected by a sort in the store, we
	 * don't want to save when the RowIndex changes.
	 */
	protected saveOnRowIndexChange: boolean = true;

	/**
	 * Class constructor
	 */
	constructor( owner: UI ) {
		super( owner, [ 'IFocusable' ], Utils.dom.create( 'div', 'ui UI_Column_Editor' ) );
		
		this._column = <UI_Column>owner;

		this._top     = new UI_Anchor_ColumnEditor( this, EAlignment.TOP );
		this._left    = new UI_Anchor_ColumnEditor( this, EAlignment.LEFT );
		this._right   = new UI_Anchor_ColumnEditor( this, EAlignment.RIGHT );
		this._bottom  = new UI_Anchor_ColumnEditor( this, EAlignment.BOTTOM );

		this._initialize_();

	}

	/**
	 * Returns the index of the row this editor is editing, in order to know
	 * how to extract the editor data.
	 */
	get rowIndex(): number {
		return this._rowIndex;
	}

	set rowIndex( index: number ) {
		index = ~~index;
		if ( index != this._rowIndex ) {

			if ( this.saveOnRowIndexChange )
				this.doSave();

			this._rowIndex = index;
			this.doLoad();
			this.onRepaint();
		}
	}

	/**
	 * Returns the "left" position of the editor, in pixels.
	 */
	get leftPosition(): number {
		return this._column
			? this._column.left.distance
			: 0;
	}

	/**
	 * Computes the "top" position of the editor.
	 */
	get scrollTop(): number {
		return this._column ? (this._column.freezed ? this._column.grid.scrollTop : 0 ) : 0;
	}

	/**
	 * Sugar for this._column.
	 */
	get column(): UI_Column {
		return this._column;
	}

	/**
	 * Sugar for this._column.width
	 */
	get width(): number {
		return ( this._column ? this._column.width : 0 ) - 2 * UI_Column_Editor._theme.border.width;
	}

	/**
	 * Computes the "height" of the editor.
	 */
	get height(): number {
		return this.rowHeight - 2 * UI_Column_Editor._theme.border.width;
	}

	/**
	 * Sugar for this._column.grid.rowHeight
	 */
	get rowHeight(): number {
		return this._column && this._column.grid
			? this._column.grid.rowHeight
			: 0;
	}

	/**
	 * See UI.remove().
	 */
	public remove(): UI {
		
		if ( this.editMode ) {
			this.doSave();
		}

		super.remove();
		
		if ( this._root.parentNode ) {
			this._root.parentNode.removeChild( this._root );
		}

		return this;
	}

	/**
	 * Returns true if the editor is in a "valid" state, or false otherwise.
	 *
	 * Depending on the editor column type, the valid state is determined if the editor
	 * value matches the syntax of it's column type.
	 *
	 */
	get isValid(): boolean {
		return true;
	}

	/**
	 * Returns TRUE if the editor content can be saved.
	 */
	public save(): boolean {
		return true;
	}

	/**
	 * See UI.onRepaint() - Repaints the editor.
	 */
	public onRepaint(): boolean {
		if ( !this._column ) {
			return false;
		} else {

			if ( this.width <= 0 ) {
				this._root.style.display = 'none';
				return true;
			} else {
				this._root.style.display = '';
				return super.onRepaint();
			}

		}
	}

	public static create( column: UI_Column ): UI_Column_Editor {
		switch ( column.type ) {
			case EColumnType.TREE:
				return new UI_Column_Editor_Tree( column );
				break;
			default:
				return new UI_Column_Editor( column );
				break;
		}
	}

	get clientRect(): IRect {
		return {
			width: this.width,
			height: this.height
		};
	}

	get offsetRect(): IRect {
		return {
			width: this.width + 4,
			height: this.height + 4
		};
	}

	get editMode(): boolean {
		return !!this._children.length;
	}

	set editMode( on: boolean ) {
		var result: UI;
		on = !!on;
		if ( on != this.editMode ) {
			if ( !on ) {
				if ( this._children[0] && this._children[0]['active'] ) {
					this.owner.owner['active'] = true;
				}
				this._children[0].remove();
			} else {
				if ( this._column.name && this._column.grid.canEditProperty( this._column.grid.itemAt( this._rowIndex), this._column.name ) ) {
					result = this.insert( UI_Column_Editor.createEditor( this ) );
					result.left = result.right = result.top = result.bottom = 0;
					result['active'] = true;
					this.doLoad();
				}
			}
		}
	}

	protected static createEditor( instance: UI_Column_Editor ): UI {
		
		var result: UI;

		switch ( instance._column.type ) {

			case EColumnType.ROW_NUMBER:
				result = null;
				break;
			case EColumnType.TREE:
				result = new UI_TextBox(instance);
				break;
			case EColumnType.INT:
				result = new UI_Spinner(instance);
				break;
			case EColumnType.FLOAT:
				result = new UI_Spinner(instance);
				break;
			case EColumnType.STRING:
				result = new UI_TextBox(instance);
				break;
			case EColumnType.BOOLEAN:
				result = new UI_CheckBox(instance);
				(<UI_CheckBox>result).caption = '';
				break;
			case EColumnType.BYTES:
				result = new UI_Spinner(instance);
				(<UI_Spinner>result).min = 0;
				(<UI_Spinner>result).precision = 0;
				break;
			case EColumnType.DATE:
				result = new UI_DateBox(instance);
				(<UI_DateBox>result).displayFormat = instance._column.outputFormat;
				break;
			default:
				result = null;
				break;
			
		}

		if ( result ) {
			result.on('keydown', function(ev) {
				var code = ev.keyCode || ev.charCode;
				switch ( code ) {
					case Utils.keyboard.KB_ENTER:
					case Utils.keyboard.KB_ESC:
						instance.fire('keydown', ev);
						break;
				}
			});

			result.on('blur', function() {
				instance.fire('dispose');
				if ( instance.form.activeElement != instance.owner.owner ) {
					instance.editMode = false;
				}
			});

		}

		return result;
	}

	get input(): IInput {
		return <IInput>this['_children'+''][0] || null;
	}

	public doSave() {
		
		if ( !this.disabled ) {
			
			var value: any;
			
			if ( this.editMode ) {
				this.saveOnRowIndexChange = false;
				this._column.grid.itemAt( this._rowIndex ).set( this._column.name, this.input.value );
				this.saveOnRowIndexChange = true;
			}
		}

	}

	public doLoad() {
		if ( this.editMode ) {
			this.input.value = this._column.grid.itemAt( this._rowIndex ).get( this._column.name );
		}
	}

	protected _initialize_() {

		(function(me) {

			me.on( 'keydown', function( ev ) {

				if ( me.editMode ) {

					var code = ev.keyCode || ev.charCode;

					switch ( code ) {
						case Utils.keyboard.KB_ENTER:
							me.doSave();
							me.editMode = false;
							break;
						case Utils.keyboard.KB_ESC:
							me.editMode = false;
							break;
					}

				}

			});

			me.on( 'dispose', function() {
				if ( me.form.activeElement === null )
				me.owner.owner['active'] = true;
			} );

		})(this);
			
	}

}

Mixin.extend( 'UI_Column_Editor', 'MFocusable' );

Constraint.registerClass( {
	"name": "UI_Column_Editor",
	"extends": "UI",
	"properties": [
		{
			"name": "rowIndex",
			"type": "int"
		}
	]
} );