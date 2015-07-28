class UI_Tree_Grid extends UI_Tree implements IGridInterface {

	private _paintContextColumn: UI_Column = null;

	// @overrided by MGridInterface
	public  yPaintStart: number;
	public  indexPaintStart: number;
	public  indexPaintEnd: number;

	constructor( owner: UI, mixins: string[] = [] ) {
	    
	    super( owner, Utils.arrayMerge( [ 'IGridInterface' ], mixins ) );

	}

	protected setupMouseHandler() {

		( function( me ) {

			me.on( 'mousedown', function( point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean ) {
				
				if ( me.disabled || which != 1 || point.y < 0 ) {
					return;
				}

				//console.log( e.offsetY, e.clientY, e );
				var y: number  = point.y,
				    x: number  = point.x,
					rowIndex   = ~~( y / UI_Tree._theme.option.height ),
					numConnectors = me._view.connectorsAt( rowIndex ).length;

				me.onRowIndexClick( rowIndex, shiftKey, ctrlKey );
				
				// translate the X to the X of the column in which the tree is rendered.

				if ( this._paintContextColumn !== null ) {
					x -= this._paintContextColumn.canvasContext.left;
				}

				/* If x is in the range of the last connector, click on the expander */
				if ( x > 0 && ~~( x / UI_Tree._theme.option.height ) == numConnectors - 1 ) {
					me.onRowExpanderClick( rowIndex );
				}

			}, true );

		})( this );
	}

	protected _setupExtendedEvents_() {
		super._setupExtendedEvents_();
		
		( function( grid ) {

			grid.on( 'column-changed', function( column: UI_Column ) {
				
				if ( column && column.type == EColumnType.TREE ) {
					grid._paintContextColumn = column;
				}

			} );

		} )( this );
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
	]
} );