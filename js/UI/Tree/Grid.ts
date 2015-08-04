class UI_Tree_Grid extends UI_Tree implements IGridInterface {

	private _paintContextColumn: UI_Column = null;

	// @overrided by MGridInterface
	public  yPaintStart: number;
	public  indexPaintStart: number;
	public  indexPaintEnd: number;

	constructor( owner: UI, mixins: string[] = [] ) {
	    
	    super( owner, Utils.array.merge( [ 'IGridInterface' ], mixins ) );

	}

	protected setupMouseHandler() {
		// THE WHOLE MOUSE HANDLER IS CONTROLED BY MGridInterface.
	}

	protected setupKeyboardHandler() {
		// THE WHOLE KEYBOARD HANDLER IS CONTROLLED BY MGridInterface.
	}

	// @overrided by MGridInterface
	public renderColumns() {}

	// we're not painting only the tree now, we're alsa painting the columns
	public paint() {
		this.prerender();
		this.renderColumns();
		this.postrender();
	}

	// @overrided by MGridInterface
	public columns( freezed: boolean = null ): UI_Column[] {
		throw "Will be implemented by mixin MGridInterface";
	}

}

Mixin.extend( "UI_Tree_Grid", "MGridInterface" );

Constraint.registerClass( {
	"name": "UI_Tree_Grid",
	"extends": "UI",
	"acceptsOnly": [
		"UI_Column"
	],
	"properties": [
		{
			"name": "editable",
			"type": "boolean"
		}
	]
} );