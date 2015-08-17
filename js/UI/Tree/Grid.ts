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

	// @overrides MFocusable.active
	get active(): boolean {
		return this.form && ( this.form.activeElement == this || this.contains(this.form.activeElement) );
	}

	set active( on: boolean ) {
		on = !!on;

		if ( on != this.active )
		 {
			if ( on ) {
				this.form.activeElement = this;
				if ( this._root ) {
					Utils.dom.addClass( this._root, 'focused' );
				}
			} else {
				if ( this.form.activeElement == this ) {
					this.form.activeElement = null;
				}
				if ( this._root ) {
					Utils.dom.removeClass( this._root, 'focused' );
				}
			}
		}
	}

	/**
	 * Returns true if a specific property can be edited on a specific item.
	 */
	public canEditProperty( item: Store_Item, propertyName: string ): boolean {
		return !this.disabled && this._items.canEditProperty( item, propertyName );
	}

	/**
	 * Install a callback that can deny a property editing.
	 */
	public addEditPropertyFilter( callback: ( item: Store_Item, propertyName: string, value: any ) => boolean ) {
		this._items.on( 'before-change', function( item: Store_Item, propertyName: string, value: any = null ) {
			if ( !callback( item, propertyName, value) ) {
				throw new Error('Property "' + propertyName + '" is not editable!');
			}
		} );
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