class UI_Anchor_Form extends UI_Anchor {

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

		var owner: UI_Form = <UI_Form>this._owner;

		if ( this._type == EAlignment.LEFT || this._type == EAlignment.TOP ) {
			// left and top alignments are always valid
			return true;
		} else {

			// when the owner is in full screen, or maximized, the bottom and right anchors are valid,
			// otherwise they're not.

			if ( owner.state == EFormState.FULLSCREEN || owner.state == EFormState.MAXIMIZED ) {
				return true;
			} else {
				return false;
			}

		}
	}

	get distance(): number {

		var owner: UI_Form = <UI_Form>this._owner;

		switch ( owner.state ) {

			case EFormState.MAXIMIZED:

				switch ( this._type ) {
					case EAlignment.LEFT:
					case EAlignment.RIGHT:
					case EAlignment.BOTTOM:
						return 0;
						break;
					case EAlignment.TOP:
						return ( owner.borderStyle == EBorderStyle.NONE
								? 0
								: UI_Form._theme.titlebarHeight 
							) + ~~( !!owner.menuBar ) * UI_Form._theme.menubarHeight;
						break;
				}

				break;

			case EFormState.FULLSCREEN:

				switch ( this._type ) {
					case EAlignment.LEFT:
					case EAlignment.RIGHT:
					case EAlignment.BOTTOM:
						return 0;
						break;
					case EAlignment.TOP:
						return ~~( !!owner.menuBar ) * UI_Form._theme.menubarHeight;
						break;
				}

				break;

			default:
				
				switch ( owner.placement ) {

					case EFormPlacement.CENTER:

						if ( (<UI_Form>owner).mdiParent && [ EFormState.MAXIMIZED, EFormState.FULLSCREEN ].indexOf( ( <UI_Form>owner ).mdiParent.state ) == -1 ) {

							switch ( this._type ) {
								case EAlignment.LEFT:
									return ~~( (<UI_Form>owner).mdiParent.left.distance + ( (<UI_Form>owner).mdiParent.width / 2 ) - ( owner.offsetRect.width / 2 ) + UI_Form._theme.borderWidth );
									break;
								case EAlignment.TOP:
									return ~~( 
										(<UI_Form>owner).mdiParent.top.distance +
										( (<UI_Form>owner).mdiParent.height / 2 ) - ( owner.height / 2 )
										+ ( owner.borderStyle == EBorderStyle.NORMAL ? UI_Form._theme.titlebarHeight : 0 )
										+ UI_Form._theme.borderWidth 
										+ ~~( !!owner.menuBar ) * UI_Form._theme.menubarHeight
									);
									break;
								default:
									return 0;
							}

						} else {

							switch ( this._type ) {
								case EAlignment.LEFT:
									return ~~( ( UI_DialogManager.get.desktopWidth / 2 ) - ( owner.offsetRect.width / 2 ) + UI_Form._theme.borderWidth );
									break;
								case EAlignment.TOP:
									return ~~( 
										( UI_DialogManager.get.desktopHeight / 2 ) - ( owner.offsetRect.height / 2 )
										+ ( owner.borderStyle == EBorderStyle.NORMAL ? UI_Form._theme.titlebarHeight : 0 )
										+ UI_Form._theme.borderWidth 
										+ ~~( !!owner.menuBar ) * UI_Form._theme.menubarHeight
									);
									break;
								default:
									return 0;
							}

						}

						break;

					case EFormPlacement.AUTO:
						return this._distance;
						break;

				}

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