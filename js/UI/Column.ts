class UI_Column extends UI {

	public static _theme: any = {
		height: $I.number('UI.UI_Column/height')
	};

	protected _name      : string;
	protected _caption   : string;
	protected _type      : EColumnType = EColumnType.STRING;
	protected _freezed   : boolean = false;
	protected _sortable  : boolean = false;
	protected _resizable : boolean = false;

	constructor( ) {
	    super( owner );
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
			if ( this._owner ) {
				this._owner.fire( 'column-changed', this );
			}
		}
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

}