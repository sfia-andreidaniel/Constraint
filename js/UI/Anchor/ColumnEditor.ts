class UI_Anchor_ColumnEditor extends UI_Anchor {

	constructor( owner: UI, type: EAlignment ) {
		super( owner, type );
	}

	get target(): UI {
		return null;
	}

	set target( target: UI ) {
		throw Error( "UI_Form constraints don't support targets!" );
	}

	get alignment(): EAlignment {
		return this._type;
	}

	set alignment( al: EAlignment ) {
		throw Error( "UI_Form constraints have the property 'alignment' read-only!" );
	}

	get valid(): boolean {
		if ( this._type == EAlignment.LEFT || this._type == EAlignment.TOP ) {
			return true;
		} else {
			return false;
		}
	}

	get distance(): number {

		switch ( this._type ) {
			case EAlignment.LEFT:
				return (<UI_Column_Editor>this.owner).leftPosition;
				break;
			case EAlignment.TOP:
				return (<UI_Column_Editor>this.owner).rowIndex * (<UI_Column_Editor>this.owner).rowHeight - (<UI_Column_Editor>this._owner).scrollTop;
				break;
			case EAlignment.RIGHT:
			case EAlignment.BOTTOM:
				return 0;
				break;
		}

	}

	set distance( d: number ) {
		if ( ~~d != this._distance ) {
			this._distance = d;
			this.requestRepaint();
		}
	}

}