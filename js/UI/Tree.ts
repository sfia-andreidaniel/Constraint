class UI_Tree extends UI_Canvas implements IFocusable, IRowInterface {

	//@IFocusable mixin
	public    active: boolean; // the active is overrided by the MFocusable mixin
	public    wantTabs: boolean = false;
	public    tabIndex: number = 0;
	public    includeInFocus: boolean = true;

	public    selectedIndex: number;
	public    multiple: boolean;

	constructor( owner: UI ) {
	    super( owner, [ 'IFocusable', 'IRowInterface' ] );
	    UI_Dom.addClass( this._root, 'UI_Tree' );
	}

	get length(): number {
		return 0;
	}

	get itemsPerPage(): number {
		return 0;
	}

	public isRowSelected( rowIndex: number ): boolean {
		return false;
	}

	public selectRow( rowIndex: number, on: boolean ) {
		
	}

	public scrollIntoRow( rowIndex: number ) {
		
	}

	// Overrided by mixin MRowInterface
	public onRowIndexClick( rowIndex: number, shiftKey: boolean = false, ctrlKey: boolean = false ) {

	}


}

Mixin.extend( "UI_Tree", "MFocusable" );
Mixin.extend( "UI_Tree", "MRowInterface" );

Constraint.registerClass( {
	"name": "UI_Tree",
	"extends": "UI_Canvas",
	"properties": [
		{
			"name": "active",
			"type": "boolean"
		},
		{
			"name": "tabIndex",
			"type": "boolean"
		}
	]
} );