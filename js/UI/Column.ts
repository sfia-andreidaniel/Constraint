
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
	protected _sortable  : boolean = false;
	protected _resizable : boolean = false;
	protected _visible   : boolean = true;

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
		return String( this._name || '' ) || null;
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
		return this._sortable;
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

	get resizable(): boolean {
		return this._resizable;
	}

	set resizable( resizable: boolean ) {
		resizable = !!resizable;
		if ( resizable != this._resizable ) {
			this._resizable = resizable;
			if ( this._owner ) {
				this._owner.fire( 'column-changed', this );
			}
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

	public paintHeader() {
		if ( this._headerContext ) {

			var ctx = this.headerContext;

			if ( !ctx ) {
				return;
			}

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

				ctx.fillText( this._caption, 4, ~~( ctx.height / 2 ) );
			}

			ctx.fillStyle = UI_Column._theme.border[ this.disabled ? 'disabled' : 'enabled' ];
			ctx.fillRect( ctx.width - 1, 0, ctx.width, ctx.height );

			ctx.endPaint();

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
		}
	]
});