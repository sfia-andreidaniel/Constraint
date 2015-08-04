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
	 * Class constructor
	 */
	constructor( owner: UI ) {
		super( owner, [ 'IFocusable' ], Utils.dom.create( 'div', 'ui UI_Column_Editor' ) );
		
		this._column = <UI_Column>owner;

		this._top     = new UI_Anchor_ColumnEditor( this, EAlignment.TOP );
		this._left    = new UI_Anchor_ColumnEditor( this, EAlignment.LEFT );
		this._right   = new UI_Anchor_ColumnEditor( this, EAlignment.RIGHT );
		this._bottom  = new UI_Anchor_ColumnEditor( this, EAlignment.BOTTOM );

		window['ed'] = this;
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
			this._rowIndex = index;
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