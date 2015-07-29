class UI_Column extends UI {

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

	protected _name      : string;
	protected _caption   : string;
	protected _type      : EColumnType = EColumnType.STRING;
	protected _renderer  : UI_Column_Renderer = null;
	protected _freezed   : boolean = false;
	protected _sortable  : boolean = true;
	protected _sortState : ESortState = ESortState.NONE;
	protected _resizable : boolean = true;
	protected _visible   : boolean = true;
	protected _precision : number  = 2;

	protected _headerContext: UI_Canvas_ContextMapper;
	protected _canvasContext: UI_Canvas_ContextMapper;

	constructor( owner: UI ) {
	    super( owner );
	    this._renderer = UI_Column_Renderer.createForType( this._type, this );
	}

	get scrollTop(): number {
		return this._owner ? (<UI_Canvas>this._owner).scrollTop : 0;
	}

	public itemAt(index: number ) {
		return this._owner ? (<UI_Canvas>this._owner).itemAt( index ) : null;
	}

	get headerContext(): UI_Canvas_ContextMapper {
		return this._headerContext || null;
	}

	get canvasContext(): UI_Canvas_ContextMapper {
		return this._canvasContext || null;
	}

	set headerContext( ctx: UI_Canvas_ContextMapper ) {
		ctx = ctx || null;
		if ( ctx != this._headerContext ) {
			this._headerContext = ctx;
		}
	}

	set canvasContext( ctx: UI_Canvas_ContextMapper ) {
		ctx = ctx || null;
		if ( ctx != this._canvasContext ) {
			this._canvasContext = ctx;
		}
	}

	get name(): string {
		return this._type == EColumnType.TREE ? 'name' : ( String( this._name || '' ) || null );
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

	get precision(): number {
		return this._precision;
	}

	set precision( precision: number ){ 
		precision = ~~precision;
		precision = precision < 0 ? 0 : precision;
		this._precision = precision;
	}

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

	get renderer(): UI_Column_Renderer {
		return this._renderer;
	}

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

	get sortable(): boolean {
		return this._sortable && this._type != EColumnType.ROW_NUMBER;
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
			if ( this._owner ) {
				this._owner.fire( 'sort', this.name || null, this.sortState );
			}
		}
	}

	get resizable(): boolean {
		return this._resizable;
	}

	set resizable( resizable: boolean ) {
		resizable = !!resizable;
		if ( resizable != this._resizable ) {
			this._resizable = resizable;
		}
	}

	get height(): number {
		return UI_Column._theme.height;
	}

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

	get target(): MGridInterface {
		return <MGridInterface>this._owner || null;
	}

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
						icon = 'Constraint/grid.sorter_desc/16x10';
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

	/* Paints the right edge of the column in the "body" of the parent */

	public paintEdge() {

		var ctx = this.canvasContext;

		if ( ctx && ctx.paintable ) {
			ctx.fillStyle = this._owner.disabled ? UI_Column._theme.background.disabled : UI_Column._theme.background.enabled;
			ctx.fillRect( ctx.width - 1, 0, 1, ctx.height );
		}

	}

	/* @Override UI.remove */
	public remove(): UI {
		var owner: UI = this._owner;
		super.remove();
		if ( owner ) {
			owner.fire( 'column-changed', null );
		}
		return this;
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
		}
	]
});