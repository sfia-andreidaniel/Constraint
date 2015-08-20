/**
 * The UI_Grid component is an (editable) Grid control.
 */
class UI_Grid extends UI_Canvas implements IRowInterface, IGridInterface, IFocusable {

	public static _theme: any = {
		option: {
			height				 : $I.number('UI.UI_Grid/option.height'),
			
			background: {
				selected         : $I.string('UI.UI_Grid/background.selected'),
				selectedDisabled : $I.string('UI.UI_Grid/background.selectedDisabled'),
				selectedInactive : $I.string('UI.UI_Grid/background.inactiveSelected')
			},
			
			color: {
				normal			 : $I.string('UI.UI_Grid/font.color'),
				disabled         : $I.string('UI.UI_Grid/font.disabledColor'),
				selectedNormal   : $I.string('UI.UI_Grid/font.selectedEnabledColor'),
				selectedDisabled : $I.string('UI.UI_Grid/font.selectedDisabledColor'),
				selectedInactive : $I.string('UI.UI_Grid/font.inactiveSelectedColor')
			},

			font: $I.string('UI.UI_Grid/font.size') + 'px ' + $I.string('UI.UI_Grid/font.family')
		},

		background: {
			disabled: $I.string('UI.UI_Grid/background.disabled'),
			enabled:  $I.string('UI.UI_Grid/background.enabled'),
		}
	};


	public    selectedIndex: number;
	public    multiple: boolean;

	protected _items: Store;
	private   _render: UI_Throttler;
	protected _selectedIndexId: any = null;

	// @overrided by MFocusable
	public    active: boolean; // the active is overrided by the MFocusable mixin
	public    wantTabs: boolean = false;
	public    tabIndex: number = 0;
	public    includeInFocus: boolean = true;

	// @overrided by MGridInterface
	public  yPaintStart: number;
	public  indexPaintStart: number;
	public  indexPaintEnd: number;

	constructor( owner: UI ) {
		super( owner, [ 'IInput', 'IRowInterface', 'IGridInterface', 'IFocusable' ] );

	    Utils.dom.addClass( this._root, 'UI_Grid' );
		this._items = new Store();
		this._setupExtendedEvents_();
	}

	get rowHeight(): number {
		return UI_Grid._theme.option.height;
	}

	protected _setupExtendedEvents_() {
		( function( me ) {

			me._render = new UI_Throttler( function() { 
				me.paint(); 
			}, 1 );

			me._items.on( 'change', function() {
				
				me.logicalHeight = UI_Grid._theme.option.height * me.length;

				if ( me._selectedIndexId !== null ) {
					
					if ( !me.restoreSelectedIndex() ) {
						me.selectedIndex = -1;
					}
				
				}

				me.render();
			} );

			me._items.on( 'meta-changed', function() {
				me.render();
			} );

			me.on( 'disabled', function() {
				me.render();
			} );

			me.on( 'focus', function() {
				me.render();
			} );

			me.on( 'blur', function() {
				me.render();
			} );

			me._items.on( 'before-sort', function() {
				me._selectedIndexId = me.selectedIndex == -1 ? null : me.itemAt( me.selectedIndex ).id;
			} );

			me.on( 'sort', function( fieldName: string, sortState: ESortState, dataType: string, inputFormat?: string ) {

				if ( !fieldName ) {
					return;
				}

				if ( inputFormat ) {
					me._items.sorter = [ { "name": fieldName, "type": dataType, "asc": sortState == ESortState.ASC, "format": inputFormat } ]
				} else {
					me._items.sorter = [ { "name": fieldName, "type": dataType, "asc": sortState == ESortState.ASC } ];
				}

			} );

		} )( this );
	}

	private restoreSelectedIndex(): boolean {

		var index: number;

		if ( this._selectedIndexId !== null ) {

			index = this._items.getItemIndexById( this._selectedIndexId );

			if ( index !== null ) {

				this.selectedIndex = index;
				
				if ( !this.multiple ) {
					this.onRowIndexClick( index, false, false );
				}
				
				return true;
			}
		
		}

		return false;

	}

	get items(): IIdentifiable[] {
		var out: IIdentifiable[] = [];

		this._items.walk( function( index: number ): ETraverseSignal {
			out.push(<IIdentifiable>this.data);
			return 0;
		} );

		return out;
	}

	set items( items: IIdentifiable[] ) {
		this._items.setItems( items, false );
	}

	get store(): Store {
		return this._items;
	}

	public render() {
		if ( this._render ) {
			this._render.run();
		}
	}

	public itemAt( index: number ): Store_Item {
		return this._items.itemAt( index );
	}


	// returns the id of the selected tree item
	get value(): any {

		var result: any = null;

		this._items.walk( function( index: number ): ETraverseSignal {
			if ( this.selected ) {
				result = this.id;
				return ETraverseSignal.STOP;
			}
		} );

		return result;
	}

	set value( valueId: any ) {
		var index: number = -1;

		this._items.walk( function( nIndex: number ): ETraverseSignal {
			if ( this.id == valueId ) {
				index = nIndex;
				this.selected = true;
			} else {
				this.selected = false;
			}
			return 0;
		});

		if ( index != -1 ) {
			index = this._items.getItemIndexById( valueId );
		}

		this.selectedIndex = index;
	}

	get values(): any[] {
		if ( this.multiple === false ) {
			
			var value: any = this.value;

			return value === null
				? []
				: [ value ];
		
		} else {

			var result: any[] = [],
			    i: number;

			this._items.walk( function( index ): ETraverseSignal {
				if ( this.selected ) {
					result.push( this.id );
				}
				return 0;
			} );

			return result;
		}
	}

	set values( values: any[] ) {

		if ( !this.multiple ) {
			throw new Error( 'The values property of a UI_Tree component can be set only if the component is multiple.' );
		}

		values = values || [];

		var i: number = 0;

		this._items.walk( function( index ): ETraverseSignal {
			this.selected = values.indexOf( this.id ) > -1;
			return 0;
		} );

	}

	/* MRowInterface methods */
	get length(): number {
		return this._items.length;
	}

	get itemsPerPage(): number {
		return ~~( this.defaultContext.height / UI_Grid._theme.option.height ) + 1;
	}

	public isRowSelected( rowIndex: number ): boolean {
		return this._items.itemAt(rowIndex).selected;
	}

	public selectRow( rowIndex: number, on: boolean ) {
		this._items.itemAt( rowIndex ).selected = on;
	}

	public scrollIntoRow( rowIndex: number ) {

		if ( rowIndex < 0 && rowIndex >= this.length ) {
			return;
		}

		var rowTop = UI_Grid._theme.option.height * rowIndex,
		    rowBottom = rowTop + UI_Grid._theme.option.height;

		if ( rowBottom > this.scrollTop + this._paintRect.height - ( ~~this.header * UI_Column._theme.height ) - Utils.dom.scrollbarSize ) {
			this.scrollTop = rowBottom - this._paintRect.height + ( ~~this.header * UI_Column._theme.height ) + Utils.dom.scrollbarSize;
		} else
		if ( rowTop < this.scrollTop ) {
			this.scrollTop = rowTop;
		}
		
	}

	// Overrided by mixin MRowInterface
	public onRowIndexClick( rowIndex: number, shiftKey: boolean = false, ctrlKey: boolean = false ) {
		// override by MRowInterface.onRowIndexClick
	}


	// @overrided by MGridInterface
	public renderColumns() {}

	public paint() {
		this.prerender();
		this.renderColumns();
		this.postrender();
	}

	// @overrided by MGridInterface
	public columns( freezed: boolean = null ): UI_Column[] {
		throw "Will be implemented by mixin MGridInterface";
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

Mixin.extend( "UI_Grid", "MFocusable" );
Mixin.extend( "UI_Grid", "MRowInterface" );
Mixin.extend( "UI_Grid", "MGridInterface" );

Constraint.registerClass( {
	"name": "UI_Grid",
	"extends": "UI_Canvas",
	"acceptsOnly": [
		"UI_Column"
	],
	"properties": [
		{
			"name": "active",
			"type": "boolean"
		},
		{
			"name": "tabIndex",
			"type": "boolean"
		},
		{
			"name": "items",
			"type": "IIdentifiable[]"
		}
	]
} );