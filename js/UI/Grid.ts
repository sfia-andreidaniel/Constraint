class UI_Grid extends UI_Canvas implements IRowInterface, IGridInterface, IFocusable {

	constructor( owner: UI ) {
		super( owner, [ 'IInput', 'IRowInterface', 'IGridInterface' ] )
	}

}