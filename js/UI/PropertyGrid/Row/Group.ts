/**
 * An UI_PropertyGrid group row. This type of row contains sub-rows.
 */
class UI_PropertyGrid_Row_Group extends UI_PropertyGrid_Row {

	protected _expanded: boolean = true;
	protected _children: UI_PropertyGrid_Row[] = [];

	constructor( config: IPropertyGroupNested, grid: UI_PropertyGrid, parent: UI_PropertyGrid_Row_Group = null ) {
		super( config, grid, parent );
		
		if ( typeof config.expanded != 'undefined' ) {
			this._expanded = !!config.expanded;
		}

		this.on( 'disabled', function( on: boolean ) {

			for ( var i=0, len = this._children.length; i<len; i++ ) {
				this._children[i].fire( 'disabled', on );
			}

		} );
	}

	get expanded(): boolean {
		return this._expanded;
	}

	set expanded( on: boolean ) {
		on = !!on;
		if ( on != this._expanded ) {
			this._expanded = on;
			this._grid.fire( 'row-expanded' );
			this._grid.render();
		}
	}

	get children(): UI_PropertyGrid_Row[] {
		return this._children;
	}

	get length(): number {
		return this._children.length;
	}

	public addChild( child: UI_PropertyGrid_Row ) {
		this._children.push( child );
	}

}