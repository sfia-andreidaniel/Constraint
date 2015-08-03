/*  Events emitted by the tree:

	

 */

class UI_Tree extends UI_Canvas implements IFocusable, IRowInterface {

	public static _theme: any = {
		option: {
			height				 : $I.number('UI.UI_Tree/option.height'),
			
			background: {
				selected         : $I.string('UI.UI_Tree/background.selected'),
				selectedDisabled : $I.string('UI.UI_Tree/background.selectedDisabled'),
				selectedInactive : $I.string('UI.UI_Tree/background.inactiveSelected')
			},
			
			color: {
				normal			 : $I.string('UI.UI_Tree/font.color'),
				disabled         : $I.string('UI.UI_Tree/font.disabledColor'),
				selectedNormal   : $I.string('UI.UI_Tree/font.selectedEnabledColor'),
				selectedDisabled : $I.string('UI.UI_Tree/font.selectedDisabledColor'),
				selectedInactive : $I.string('UI.UI_Tree/font.inactiveSelectedColor')
			},

			font: $I.string('UI.UI_Tree/font.size') + 'px ' + $I.string('UI.UI_Tree/font.family')
		},

		background: {
			disabled: $I.string('UI.UI_Tree/background.disabled'),
			enabled:  $I.string('UI.UI_Tree/background.enabled'),
		}
	};

	//@IFocusable mixin
	public    active: boolean; // the active is overrided by the MFocusable mixin
	public    wantTabs: boolean = false;
	public    tabIndex: number = 0;
	public    includeInFocus: boolean = true;

	public    selectedIndex: number;
	public    multiple: boolean;

	protected _items: Store_Tree;
	protected _view:  Store_View;

	private   _render: UI_Throttler;

	private   _selectedIndexPath: any[] = null;

	// FROM WHICH PROPERTY OF THE ITEMS IN THE STORE DOES THE TREE RENDERS THE LABEL AND IT'S ICONS?
	protected _name: string = 'name';
	protected _icon: string = 'icon';

	constructor( owner: UI, mixins: string[] = [] ) {
	    
	    super( owner, Utils.array.merge( [ 'IFocusable', 'IRowInterface' ], mixins ) );
	    
	    Utils.dom.addClass( this._root, 'UI_Tree' );
	    this._items = new Store_Tree('id','parent','isLeaf');

	    this._view = this._items.createQueryView( function( index: number ) : ETraverseSignal {
	    	
	    	if ( this.visible ) {
	    		return ETraverseSignal.AGGREGATE;
	    	} else {
	    		return ETraverseSignal.STOP_RECURSIVE;
	    	}
	    });

	    this._setupExtendedEvents_();
	}

	get rowHeight(): number {
		return UI_Tree._theme.option.height;
	}

	get paintContext(): UI_Canvas_ContextMapper {
		return this.defaultContext;
	}

	/* Must be reimplemented also by the UI_Tree_Grid */
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
					numConnectors = me._view.itemAt( rowIndex ).connectors.length;

				me.onRowIndexClick( rowIndex, shiftKey, ctrlKey );

				/* If x is in the range of the last connector, click on the expander */
				if ( ~~( x / UI_Tree._theme.option.height ) == numConnectors - 1 ) {
					me.onRowExpanderClick( rowIndex );
				}

			}, true );

		})( this );
	}

	/* Local methods */
	protected _setupExtendedEvents_() {

		( function( me ) {

			me._render = new UI_Throttler( function() { 
				me.paint(); 
			}, 1 );

			me._view.on( 'before-change', function() {
				
				// SAVE selectedIndex
				me._selectedIndexPath = ( me.selectedIndex == -1 )
					? null
					: ( <Store_Node>me._view.itemAt( me.selectedIndex ) ).idPath;

				if ( me._selectedIndexPath !== null ) {
					me._selectedIndexPath.push( ( <Store_Node>me._view.itemAt( me.selectedIndex ) ).id );
				}

			} );

			me._view.on( 'change', function() {
				me.logicalHeight = UI_Tree._theme.option.height * me.length;

				if ( me._selectedIndexPath !== null ) {
					
					if ( !me.restoreSelectedIndex() ) {
						me.selectedIndex = -1;
					}
				
				} else {
					me.selectedIndex = -1;
				}
				
				me.render();
			} );

			me._view.on( 'meta-changed', function() {
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

			me.on( 'change', function() {
				me.render();
			} );

			me.setupMouseHandler();

			me.on( 'keydown', function( evt ) {

				if ( me.disabled ) {
					return;
				}

				var code = evt.keyCode || evt.charCode;

				switch ( code ) {
					// LEFT
					case 37:
						me.collapseNode();
						break;
					// RIGHT
					case 39:
						me.expandNode();
						break;
				}

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

	get items(): INestable[] {
		var out: INestable[] = [];

		this._items.walk( function( index: number ): ETraverseSignal {
			out.push(<INestable>this.data);
			return 0;
		} );

		return out;
	}

	set items( items: INestable[] ) {

		this._items.setItems( items, false );

	}

	set nestedItems( items: any ) {

		this._items.setItems( items, true, 'children' );
	
	}

	get store(): Store_Tree {
		return this._items;
	}

	get nameField(): string {
		return this._name;
	}

	set nameField( fieldName: string ) {
		fieldName = String( fieldName || '' );
		if ( fieldName != this._name ) {
			this._name = fieldName;
			this.onRepaint();
		}
	}

	get iconField(): string {
		return this._icon;
	}

	set iconField( fieldName: string ) {
		fieldName = String( fieldName || '' );
		if ( fieldName != this._icon ) {
			this._icon = fieldName;
			this.onRepaint();
		}
	}

	private restoreSelectedIndex(): boolean {
		var len: number = this._selectedIndexPath.length,
		    i: number,
		    index: number;

		for ( i = len - 1; i>=0; i-- ) {
			index = this._view.getItemIndexById( this._selectedIndexPath[ i ] );
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

	private onRowExpanderClick( rowIndex: number ) {
		var opt: Store_Node = <Store_Node>this._view.itemAt( rowIndex );

		if ( !opt.isLeaf ) {
			opt.expanded = !opt.expanded;
		}
	}

	private collapseNode() {
		if ( this.selectedIndex == -1 ) {
			return;
		}

		var node: Store_Node = <Store_Node>this._view.itemAt( this.selectedIndex );

		if ( !node.collapsed ) {
			node.collapsed = true;
		}
	}

	private expandNode() {
		if ( this.selectedIndex == -1 ) {
			return;
		}

		var node: Store_Node = <Store_Node>this._view.itemAt( this.selectedIndex );

		if ( node.collapsed ) {
			node.collapsed = false;
		}
	}

	public render() {
		if ( this._render ) {
			this._render.run();
			this._dom.viewport.scrollLeft = this._scrollLeft;
			this._dom.viewport.scrollTop = this._scrollTop;
		}
	}

	public itemAt( index: number ): Store_Item {
		return this._view.itemAt( index );
	}

	public paint() {

		this.prerender();

		var ctx = this.paintContext;

		if ( !ctx ) {
			return;
		}

		var	scrollTop : number = this.scrollTop,
			bgColor = this.disabled ? UI_Tree._theme.background.disabled : UI_Tree._theme.background.enabled,
			skip      : number = ~~( scrollTop / UI_Tree._theme.option.height ),
		    startY    : number = -( scrollTop % UI_Tree._theme.option.height ),
		    paintRows : number = Math.round( this._paintRect.height / UI_Tree._theme.option.height ) + 1,
		    i 		  : number,
		   	len 	  : number,
		   	label     : string,
		   	icon      : string,

		   	isActive  : boolean = this.active && this.form && this.form.active,
		   	isDisabled: boolean = this.disabled,
		   	isScrollbar: boolean = this.logicalHeight >= this._paintRect.height,
		   	selectedIndex: number = this.selectedIndex,
		   	connectors: number[],
		   	paddingLeft: number,
		   	ci            : number,
		   	numConnectors : number,
		   	item          : Store_Node;

		ctx.fillStyle = bgColor;
		ctx.fillRect( 0, 0, ctx.width, ctx.height );

		ctx.beginPaint();
		ctx.imageSmoothingEnabled = false;
		ctx.font = UI_Tree._theme.option.font;
		ctx.textBaseline = "middle";

		for ( i = skip, len = Math.min( this.length, skip + paintRows); i<len; i++ ) {
			
			item = <Store_Node>this._view.itemAt(i);

			connectors = item.connectors;
			numConnectors = connectors.length;

			paddingLeft = ( numConnectors + 1 ) * UI_Tree._theme.option.height;

			if ( !this._view.itemAt(i)['selected'] ) {
				ctx.fillStyle = isDisabled
					? UI_Tree._theme.option.color.disabled
					: UI_Tree._theme.option.color.normal;
			} else {

				ctx.endPaint();

				// Draw also the selected background color
				ctx.fillStyle = isDisabled
					? UI_Tree._theme.option.background.selectedDisabled
					: ( isActive ? UI_Tree._theme.option.background.selected : UI_Tree._theme.option.background.selectedInactive );

				ctx.fillRect( -this._freezedWidth, startY, this._paintRect.width, UI_Tree._theme.option.height );

				ctx.beginPaint();
				ctx.font = UI_Tree._theme.option.font;
				ctx.textBaseline = "middle";

				ctx.fillStyle = isDisabled
					? UI_Tree._theme.option.color.selectedDisabled
					: ( isActive ? UI_Tree._theme.option.color.selectedNormal : UI_Tree._theme.option.color.selectedInactive );
			}

			// paint connectors
			for ( ci=0; ci < numConnectors; ci++ ) {

				if ( connectors[ci] ) {

					UI_Resource.createSprite( 

						'Constraint/tree_connector_' + connectors[ci] + '/' 

						+ UI_Tree._theme.option.height + 'x' + UI_Tree._theme.option.height
						+ ( this.disabled ? '-disabled' : '' )

					).paintWin( ctx, ci * UI_Tree._theme.option.height, startY );

				}
			}

			icon = String( item.get( this._icon ) || '' );

			// paint icon
			if ( item.isLeaf ) {
				
				// paint file icon
				UI_Resource.createSprite(
				
					( icon || 'Constraint/file' ) 
					+ '/20x20'
					+ ( this.disabled ? '-disabled' : '' )
				
				).paintWin( ctx, numConnectors * UI_Tree._theme.option.height, startY + ~~( UI_Tree._theme.option.height - 20 ) / 2 );

			} else {

				// paint folder icon
				UI_Resource.createSprite(
				
					( icon || 'Constraint/folder' ) 
					+ '/20x20'
					+ ( this.disabled ? '-disabled' : '' )
				
				).paintWin( ctx, numConnectors * UI_Tree._theme.option.height, startY + ~~( UI_Tree._theme.option.height - 20 ) / 2 );
			}

			label = String( item.get( this._name ) || '' );

			if ( label ) {
				ctx.fillText( label, 2 + paddingLeft, startY + ~~( UI_Tree._theme.option.height / 2 ) );
			}

			if ( selectedIndex == i && isActive && !isDisabled ) {
	
				ctx.endPaint();
				// draw selected index focus ring
				ctx.strokeStyle = 'black';
				ctx.strokeRect( -this._freezedWidth + .5, startY + 0.5, this._paintRect.width - 1 - ( ~~isScrollbar * Utils.dom.scrollbarSize ), UI_Tree._theme.option.height - 1 );
				ctx.font = UI_Tree._theme.option.font;
				ctx.textBaseline = "middle";
				ctx.beginPaint();
			}

			startY += UI_Tree._theme.option.height;
		}

		ctx.endPaint();

		this.postrender();

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

		return null;
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
			index = this._view.getItemIndexById( valueId );
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
		return this._view.length;
	}

	get itemsPerPage(): number {
		return ~~( this.paintContext.height / UI_Tree._theme.option.height ) + 1;
	}

	public isRowSelected( rowIndex: number ): boolean {
		return this._view.itemAt(rowIndex).selected;
	}

	public selectRow( rowIndex: number, on: boolean ) {
		this._view.itemAt( rowIndex ).selected = on;
	}

	public scrollIntoRow( rowIndex: number ) {

		if ( rowIndex < 0 && rowIndex >= this.length ) {
			return;
		}

		var rowTop = UI_Tree._theme.option.height * rowIndex,
		    rowBottom = rowTop + UI_Tree._theme.option.height;

		if ( rowBottom > this.scrollTop + this._paintRect.height ) {
			this.scrollTop = rowBottom - this._paintRect.height;
		} else
		if ( rowTop < this.scrollTop ) {
			this.scrollTop = rowTop;
		}
		
	}

	// Overrided by mixin MRowInterface
	public onRowIndexClick( rowIndex: number, shiftKey: boolean = false, ctrlKey: boolean = false ) {
		// override by MRowInterface.onRowIndexClick
	}


}

Mixin.extend( "UI_Tree", "MFocusable" );
Mixin.extend( "UI_Tree", "MRowInterface" );

Constraint.registerClass( {
	"name": "UI_Tree",
	"extends": "UI_Canvas",
	"acceptsOnly": null,
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
			"name": "nameField",
			"type": "string"
		},
		{
			"name": "iconField",
			"type": "string"
		},
		{
			"name": "items",
			"type": "INestable[]"
		},
		{
			"name": "nestedItems",
			"type": "any"
		},
		{
			"name": "nameField",
			"type": "string"
		},
		{
			"name": "iconField",
			"type": "string"
		}
	]
} );