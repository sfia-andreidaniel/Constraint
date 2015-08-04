/**
 * The UI_Column class is used to represent columns inside of grids and tree-grids.
 * 
 * It **provides rendering, editor and sorting mechanisms** for various data types, such as
 * string, int, float, boolean, date, etc.
 *
 *
 */
class UI_Column extends UI {

	/**
	 * Column's theme settings.
	 */
	public static _theme: any = {
		height: $I.number('UI.UI_Column/height'),
		background: {
			enabled: $I.string('UI.UI_Column/background.enabledColor'),
			disabled: $I.string('UI.UI_Column/background.disabledColor')
		},
		font: {
			family: $I.string('UI.UI_Column/font.size') + 'px ' + $I.string('UI.UI_Column/font.family'),
			color: {
				enabled: $I.string('UI.UI_Column/font.color.enabled'),
				disabled: $I.string('UI.UI_Column/font.color.disabled')
			}
		},
		border: {
			enabled: $I.string('UI.UI_Column/font.color.enabled'),
			disabled: $I.string('UI.UI_Column/font.color.disabled')
		}
	};

	/**
	 * Column's property name field binding in the store.
	 */
	protected _name      : string;

	/**
	 * Column's caption, that is visible by the user
	 */
	protected _caption   : string;

	/**
	 * Column's data type. We need the data type in order to know what kind of
	 * render / editor to instantiate on the column.
	 */
	protected _type      : EColumnType = EColumnType.STRING;

	/**
	 * The column's renderer, which is reponsible with the "painting" of the
	 * column in the column canvas parent.
	 */
	protected _renderer  : UI_Column_Renderer = null;

	/**
	 * Weather that this is a "freezed" column or not.
	 */
	protected _freezed   : boolean = false;

	/**
	 * Weather this column can be sorted when the user clicks on the
	 * column header, or not
	 */
	protected _sortable  : boolean = true;

	/**
	 * The sort state of the column (ASC, DESC, or NONE). Based on the
	 * value of this property, we know to draw the mini-arrows on the
	 * header of the column also.
	 */
	protected _sortState : ESortState = ESortState.NONE;

	/**
	 * Weather this column can be resized by the user or not.
	 */
	protected _resizable : boolean = true;

	/**
	 * Weather this colum is visible or not in the viewport.
	 */
	protected _visible   : boolean = true;

	/**
	 * If this colum is of type EColumnType.FLOAT, EColumnType.BYTES, what precision to be rendered for the numbers?
	 */
	protected _precision : number  = 2;

	/**
	 * If this colum is of type EColumnType.STRING, denotes the fact that the values
	 * from the column are case sensitive or not.
	 */
	protected _caseSensitive: boolean = false;

	/**
	 * If this colum is of type EColumnType.DATE, denotes the input of the dates in the
	 * store this column is using for sorting / parsing dates.
	 */
	protected _inputFormat: string = 'MS';

	/**
	 * If this colum is of type EColumnType.DATE, denotes the format for rendering the
	 * dates on the screen.
	 */
	protected _outputFormat: string = Utils.date.DEFAULT_DATE_FORMAT;

	/**
	 * The editor of the column. If the owner of the colum is editable, an editor is
	 * instantiated for the column.
	 */
	protected _editor    : UI_Column_Editor = null;

	/**
	 * Denotes the fact that this column is editable. If this column is not editable,
	 * the editor of the column won't be able to enter editMode.
	 */
	protected _editable  : boolean = false;

	/**
	 * The Canvas Context Mapper used for the column's header.
	 */
	protected _headerContext: UI_Canvas_ContextMapper;

	/**
	 * The Canvas Context Mapper used for the column's body.
	 */
	protected _canvasContext: UI_Canvas_ContextMapper;

	/**
	 * Reference to the column's grid, that is implementing the IGridInterface.
	 */
	protected _grid: MGridInterface;

	/**
	 * Constructor.
	 */
	constructor( owner: UI ) {
	    super( owner );
	    this._renderer = UI_Column_Renderer.createForType( this._type, this );
	    this._grid = <MGridInterface>owner;
	}

	/**
	 * Editable accessor. Is this column editable?
	 */
	get editable(): boolean {
		
		if ( !this._grid || !this._grid.editable ) {
			return false;
		} else {

			switch ( this._type ) {
				case EColumnType.ROW_NUMBER:
				case EColumnType.BYTES:
					return false;
					break;
				default:
					return this._editable;
					break;
			}

		}
	}

	/**
	 * Editable accessor. Is this column editable?
	 */
	set editable( editable: boolean ) {
		editable = !!editable;
		if ( editable != this._editable ) {
			this._editable = editable;
			//TODO: Maybe fire an event at this point?
		}

	}

	/**
	 * Returns the editor of the column, if any.
	 */
	get editor(): UI_Column_Editor {
		return this._editor || null;
	}

	/**
	 * Shorthand for column's owner scrollTop value.
	 */
	get scrollTop(): number {
		return this._owner ? (<UI_Canvas>this._owner).scrollTop : 0;
	}

	/**
	 * Shorthand for column's owner.itemAt( index ) value.
	 */
	public itemAt(index: number ) {
		return this._owner ? (<UI_Canvas>this._owner).itemAt( index ) : null;
	}

	/**
	 * Returns the column's header canvas context mapper
	 */
	get headerContext(): UI_Canvas_ContextMapper {
		return this._headerContext || null;
	}

	set headerContext( ctx: UI_Canvas_ContextMapper ) {
		ctx = ctx || null;
		if ( ctx != this._headerContext ) {
			this._headerContext = ctx;
		}
	}

	/**
	 * Returns the column's body canvas context mapper.
	 */
	get canvasContext(): UI_Canvas_ContextMapper {
		return this._canvasContext || null;
	}

	set canvasContext( ctx: UI_Canvas_ContextMapper ) {
		ctx = ctx || null;
		if ( ctx != this._canvasContext ) {
			this._canvasContext = ctx;
		}
	}

	/**
	 * Returns the Date input format this column is using.
	 */
	get inputFormat(): string {
		return this._inputFormat;
	}

	set inputFormat( inputFormat: string ) {
		inputFormat = String( inputFormat || '' );
		this._inputFormat = inputFormat;
	}

	/**
	 * Return the Date output format this column is using.
	 */
	get outputFormat(): string {
		return this._outputFormat;
	}

	set outputFormat( outputFormat: string ) {
		outputFormat = String( outputFormat || '' );
		this._outputFormat = outputFormat;
	}

	/**
     * Returns the columns field name used to extract data when rendering
     * from the column's store owner
     */
	get name(): string {
		return this._type == EColumnType.TREE ? ( this._owner ? ( this._owner['nameField'] || 'name' ) : 'name' ) : ( String( this._name || '' ) || null );
	}

	set name( name: string ) {
		name = String( name || '' ) || null;
		if ( name != this.name ) {
			this._name = name;
			if ( this._owner ) {
				this._owner.fire( 'column-changed', this );
			}
		}
	}

	/**
	 * Returns weather this column should treat strings in a case sensitive way or not.
	 */
	get caseSensitive(): boolean {
		return this._caseSensitive;
	}

	set caseSensitive( sensitive: boolean ) {
		this._caseSensitive = !!sensitive;
	}

	/**
	 * Returns the precision this column is using when rendering float-based data types.
	 */
	get precision(): number {
		return this._precision;
	}

	set precision( precision: number ){ 
		precision = ~~precision;
		precision = precision < 0 ? 0 : precision;
		this._precision = precision;
	}

	/**
	 * Returns the caption of the column that the user is seeing in the grid.
	 */
	get caption(): string {
		return String( this._caption || '' );
	}

	set caption( caption: string ) {
		caption = String( caption || '' );
		if ( caption != this.caption ) {
			this._caption = caption;
			if ( this._owner ) {
				this._owner.fire( 'column-changed', this );
			}
		}
	}

	/**
	 * Returns the type of data this column is handling
	 */
	get type(): EColumnType {
		return this._type;
	}

	set type( type: EColumnType ) {
		if ( type != this._type ) {
			this._type = type;
			this._renderer = UI_Column_Renderer.createForType( this._type, this );
			if ( this._owner ) {
				this._owner.fire( 'column-changed', this );
			}
		}
	}

	/**
	 * Returns the owner of the column, casted to IGridInterface.
	 */
	get grid(): MGridInterface {
		return this._grid;
	}

	/**
	 * Returns the renderer of the column.
	 */
	get renderer(): UI_Column_Renderer {
		return this._renderer;
	}

	/**
	 * Returns weather this colum is freezed or not.
	 */
	get freezed( ): boolean {
		return this._freezed;
	}

	set freezed( freezed: boolean ) {
		freezed = !!freezed;
		if ( freezed != this._freezed ) {
			this._freezed = freezed;
			if ( this._owner ) {
				this._owner.fire( 'column-changed', this );
			}
		}
	}

	/**
	 * Returns weather this colum is sortable or not.
	 */
	get sortable(): boolean {
		return this._sortable && this._type != EColumnType.ROW_NUMBER && !!this._grid;
	}

	set sortable( sortable: boolean ) {
		sortable = !!sortable;
		if ( sortable != this._sortable ) {
			this._sortable = sortable;
			if ( this._owner ) {
				this._owner.fire( 'column-changed', this );
			}
		}
	}

	/**
	 * Returns the direction of the sorter that is sorting this column.
	 */
	get sortState(): ESortState {
		return this._sortState;
	}

	set sortState( sortState: ESortState ) {
		if ( sortState != this._sortState ) {
			switch ( sortState ) {
				case ESortState.ASC:
				case ESortState.DESC:
					this._sortState = sortState;
					break;
				default:
					this._sortState = ESortState.NONE;
					break;
			}
		}
	}

	/**
	 * Returns weather this column is resizable by the user or not.
	 */
	get resizable(): boolean {
		return this._resizable;
	}

	set resizable( resizable: boolean ) {
		resizable = !!resizable;
		if ( resizable != this._resizable ) {
			this._resizable = resizable;
		}
	}

	/**
	 * Returns the header height of this column.
	 */
	get height(): number {
		return UI_Column._theme.height;
	}

	/**
	 * Returns the width of this column
	 */
	get width(): number {
		return this._width;
	}

	set width( width: number ) {
		width = ~~width;
		if ( width != this._width ) {
			this._width = width;
			if ( this._owner ) {
				this._owner.fire( 'column-changed', this );
			}
		}
	}

	/**
	 * Returns weather this column is visible or not.
	 */
	get visible(): boolean {
		return this._visible;
	}

	set visible( on: boolean ) {
		on = !!on;
		if ( on != this._visible ) {
			this._visible = on;
			if ( this._owner ) {
				this._owner.fire( 'column-changed', this );
			}
		}
	}

	/**
	 * Paints the column header on it's owner
	 */
	public paintHeader() {
		if ( this._headerContext ) {

			var ctx = this.headerContext,
			    icon: string;

			if ( !ctx ) {
				return;
			}

			var labelWidth: number = !this.sortable
				? ctx.width - 8
				: ctx.width - 28; // reserve space for the sortable sign

			ctx.beginPaint();

			ctx.fillStyle = this.disabled
				? UI_Column._theme.background.disabled
				: UI_Column._theme.background.enabled;

			ctx.fillRect( 0, 0, ctx.width, ctx.height );

			ctx.fillStyle = this.disabled
				? UI_Column._theme.font.color.disabled
				: UI_Column._theme.font.color.enabled;

			if ( this._caption ) {
				ctx.font = UI_Column._theme.font.family;
				ctx.textBaseline = "middle";

				ctx.fillText( ctx.dotDotDot( this._caption, labelWidth ), 4, ~~( ctx.height / 2 ) );
			}

			/* paint sorter sign */
			if ( this.sortable ) {
				switch ( this._sortState ) {
					case ESortState.NONE:
						icon = 'Constraint/grid_sorter/16x10';
						break;
					case ESortState.ASC:
						icon = 'Constraint/grid_sorter_asc/16x10';
						break;
					case ESortState.DESC:
						icon = 'Constraint/grid_sorter_desc/16x10';
						break;
				}
				UI_Resource.createSprite( icon + ( this.disabled ? '-disabled' : '' ) )
					.paintWin( ctx, labelWidth + 4, ~~( UI_Column._theme.height / 2 - 5 ) );
			}
			
			ctx.fillStyle = UI_Column._theme.border[ this.disabled ? 'disabled' : 'enabled' ];
			ctx.fillRect( ctx.width - 1, 0, ctx.width, ctx.height );

			ctx.endPaint();

		}
	}

	/** 
	 * Creates a column editor for this column. All column editors of the other columns
	 * in the column owner will be destroyed.
	 * 
	 * @returns weather an editor has been created or not.
	 *
	 */
	public createEditor(): boolean {

		if ( this.disabled ) {
			return false;
		}

		if ( this._grid ) {

			if ( this._editor ) {
				this.disposeEditor();
			}

			if ( this._grid.canCreateEditor( this ) ) {

				this._grid.disposeAllColumnsEditors();

				this._editor = UI_Column_Editor.create( this );
				this._editor.onRepaint();

				this._editor.rowIndex = this._grid.selectedIndex;

				return true;

			} else {

				// we cannot create an editor. Another editor is in an invalid state, and must be solved first.
				return false;

			}

		} else {
			
			return false;

		}

	}

	/**
	 * Returns TRUE if either the two conditions are met:
	 * - The column doesn't have an opened editor
	 * - The column has an editor which is in a disposable (valid) state.
	 */
	public canDisposeEditor(): boolean {
		if ( !this._editor ) {
			return true;
		} else {
			return this._editor.isValid;
		}
	}

	/**
	 * If the column has an associated editor, it disposes it.
	 */
	public disposeEditor() {
		if ( this._editor ) {
			this._editor.remove();
			this._editor = undefined;
		}
	}

	/* Paints the right edge of the column in the "body" of the parent */
	public paintEdge() {

		var ctx = this.canvasContext;

		if ( ctx && ctx.paintable ) {
			ctx.fillStyle = this._owner.disabled ? UI_Column._theme.background.disabled : UI_Column._theme.background.enabled;
			ctx.fillRect( ctx.width - 1, 0, 1, ctx.height );
		}

	}

	/** See UI.remove
	 */
	public remove(): UI {
		var owner: UI = this._owner;
		super.remove();
		if ( owner ) {
			owner.fire( 'column-changed', null );
		}
		return this;
	}

	/**
	 * When the user clicks on the header of the column, this method is responsible
	 * with the appropriate action (usually sorting the column).
	 */
	public onHeaderClick() {
		if ( this.disabled || !this.sortable ) {
			return;
		}

		switch ( this.sortState ) {
			case ESortState.NONE:
			case ESortState.DESC:
				this.sortState = ESortState.ASC;
				break;

			case ESortState.ASC:
				this.sortState = ESortState.DESC;
				break;
		}

		if ( this._owner ) {
			this._owner.fire( 
				'sort', 
				this.name || null, 
				this.sortState, 
				this._renderer.sortDataType, 
				this._type == EColumnType.DATE ? this._inputFormat : null
			);
		}
	}

	/**
	 * Required by the editor, in order to be inserted in the appropriate node of the
	 * column's owner.
	 */
	protected insertDOMNode( node: UI ): UI {
		if ( this._owner && node && node._root ) {
			(<UI_Canvas>this._owner)['appendDOMNode']( this.freezed, node._root );
		}

		return node;
	}

	/**
	 * @Overrides UI.onRepaint. Repaints the column, together with it's editors.
	 */
	public onRepaint(): boolean {

		if ( this._children ) {
			for ( var i=0, len = this._children.length; i<len; i++ ) {
				this._children[i].onRepaint();
			}
			return true;
		} else {
			return false;
		}
	}
}

Constraint.registerClass( {
	"name": "UI_Column",
	"extends": "UI",
	"properties": [
		{
			"name": "name",
			"type": "string"
		},
		{
			"name": "type",
			"type": "enum:EColumnType"
		},
		{
			"name": "freezed",
			"type": "boolean"
		},
		{
			"name": "precision",
			"type": "number"
		},
		{
			"name": "resizable",
			"type": "boolean"
		},
		{
			"name": "caseSensitive",
			"type": "boolean"
		},
		{
			"name": "editable",
			"type": "boolean"
		}
	]
});