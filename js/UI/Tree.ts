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

	protected _items: Store_NestedObjects;
	protected _view:  Store_View_Tree;

	private   _render: UI_Throttler;

	private   _selectedIndexPath: any[] = null;

	constructor( owner: UI ) {
	    super( owner, [ 'IFocusable', 'IRowInterface' ] );
	    UI_Dom.addClass( this._root, 'UI_Tree' );
	    this._items = new Store_NestedObjects(null);
	    this._view = this._items.createTreeView( null );

	    this._setupExtendedEvents_();
	}

	get paintContext(): UI_Canvas_ContextMapper {
		return this.defaultContext;
	}

	/* Local methods */
	protected _setupExtendedEvents_() {

		( function( me ) {

			me._render = new UI_Throttler( function() { me.paint(); }, 1 );

			me._view.on( 'before-change', function() {
				
				// SAVE selectedIndex
				me._selectedIndexPath = ( me.selectedIndex == -1 )
					? null
					: ( <Store_Item_NestableObject>me._view.itemAt( me.selectedIndex ) ).idPath;

				if ( me._selectedIndexPath !== null ) {
					me._selectedIndexPath.push( ( <Store_Item_NestableObject>me._view.itemAt( me.selectedIndex ) ).id );
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

			me._dom.canvasSize.addEventListener( 'mousedown', function(e) {
				
				if ( me.disabled || e.which != 1 ) {
					return;
				}

				//console.log( e.offsetY, e.clientY, e );
				var y: number  = typeof e.offsetY != 'undefined' ? e.offsetY : e.layerY,
				    x: number  = typeof e.offsetX != 'undefined' ? e.offsetX : e.layerX,
					rowIndex   = ~~( y / UI_Tree._theme.option.height ),
					numConnectors = me._view.connectorsAt( rowIndex ).length;

				me.onRowIndexClick( rowIndex, e.shiftKey, e.ctrlKey );

				/* If x is in the range of the last connector, click on the expander */
				if ( ~~( x / UI_Tree._theme.option.height ) == numConnectors - 1 ) {
					me.onRowExpanderClick( rowIndex );
				}

			}, true );

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


		} )( this );
	}

	get items(): INestable[] {
		var out: INestable[] = [],
		    i: number = 0,
		    len: number = this._items.length,
		    item: Store_Item_NestableObject;

		for ( i=0; i<len; i++ ) {

			item = <Store_Item_NestableObject>this._view.itemAt( i );

			out.push({
				id: item.id,
				name: item.name,
				parent: item.parentId,
				selected: item.selected
			});
		}

		return out;
	}

	set items( items: INestable[] ) {

		this._items.setItems( items );

	}

	get store(): Store_NestedObjects {
		return this._items;
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
		var opt: Store_Item_NestableObject = <Store_Item_NestableObject>this._view.itemAt( rowIndex );

		if ( !opt.isLeaf ) {
			opt.expanded = !opt.expanded;
		}
	}

	private collapseNode() {
		if ( this.selectedIndex == -1 ) {
			return;
		}

		var node: Store_Item_NestableObject = <Store_Item_NestableObject>this._view.itemAt( this.selectedIndex );

		if ( !node.collapsed ) {
			node.collapsed = true;
		}
	}

	private expandNode() {
		if ( this.selectedIndex == -1 ) {
			return;
		}

		var node: Store_Item_NestableObject = <Store_Item_NestableObject>this._view.itemAt( this.selectedIndex );

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

	public paint() {
		var scrollTop : number = this.scrollTop,
			skip      : number = ~~( scrollTop / UI_Tree._theme.option.height ),
			ctx               = this.paintContext,
			bgColor           = this.disabled
		    		? UI_Tree._theme.background.disabled
		    		: UI_Tree._theme.background.enabled,
		    startY    : number = -( scrollTop % UI_Tree._theme.option.height ),
		    paintRows : number = Math.round( this._paintRect.height / UI_Tree._theme.option.height ) + 1,
		    i 		  : number,
		   	len 	  : number,
		   	opt 	  : INestable,

		   	isActive  : boolean = this.active && this.form && this.form.active,
		   	isDisabled: boolean = this.disabled,
		   	isScrollbar: boolean = this.logicalHeight >= this._paintRect.height,
		   	selectedIndex: number = this.selectedIndex,
		   	connectors: number[],
		   	paddingLeft: number,
		   	ci            : number,
		   	numConnectors : number;

		ctx.fillStyle = bgColor;
		ctx.fillRect( -this._freezedWidth, 0, this._paintRect.width, ctx.height );

		ctx.beginPaint();
		ctx.imageSmoothingEnabled = false;
		ctx.font = UI_Tree._theme.option.font;
		ctx.textBaseline = "middle";

		for ( i = skip, len = Math.min( this.length, skip + paintRows); i<len; i++ ) {
			
			opt = <INestable>this._view.itemAt( i ).data;
			connectors = this._view.connectorsAt(i);
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

			// paint icon
			if ( opt.isLeaf ) {
				
				// paint file icon
				UI_Resource.createSprite(
				
					( opt['icon'] || 'Constraint/file' ) 
					+ '/20x20'
					+ ( this.disabled ? '-disabled' : '' )
				
				).paintWin( ctx, numConnectors * UI_Tree._theme.option.height, startY + ~~( UI_Tree._theme.option.height - 20 ) / 2 );

			} else {

				// paint folder icon
				UI_Resource.createSprite(
				
					( opt['icon'] || 'Constraint/folder' ) 
					+ '/20x20'
					+ ( this.disabled ? '-disabled' : '' )
				
				).paintWin( ctx, numConnectors * UI_Tree._theme.option.height, startY + ~~( UI_Tree._theme.option.height - 20 ) / 2 );
			}

			ctx.fillText( opt.name, 2 + paddingLeft, startY + ~~( UI_Tree._theme.option.height / 2 ) );

			if ( selectedIndex == i && isActive && !isDisabled ) {
	
				ctx.endPaint();
				// draw selected index focus ring
				ctx.strokeStyle = 'black';
				ctx.strokeRect( -this._freezedWidth + .5, startY + 0.5, this._paintRect.width - 1 - ( ~~isScrollbar * UI_Dom.scrollbarSize ), UI_Tree._theme.option.height - 1 );
				ctx.font = UI_Tree._theme.option.font;
				ctx.textBaseline = "middle";
				ctx.beginPaint();
			}

			startY += UI_Tree._theme.option.height;
		}

		ctx.endPaint();

	}

	// returns the id of the selected tree item
	get value(): any {
		for ( var i=0, len = this._items.length; i<len; i++ ) {
			if ( (<Store_Item_NestableObject>this._items.itemAt(i)).selected ) {
				return this._items.itemAt(i).id;
			}
		}
		return null;
	}

	set value( valueId: any ) {
		var index: number = -1,
		    item: Store_Item_NestableObject;

		for ( var i=0, len = this._items.length; i<len; i++ ) {
			item = <Store_Item_NestableObject>this._items.itemAt(i);
			
			if ( item.id == valueId ) {
				index = i;
				item.selected = true;
			} else {
				item.selected = false;
			}
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
			    i: number,
			    len: number = this._items.length;

			for ( i=0; i<len; i++ ) {
				if ( (<Store_Item_NestableObject>this._items.itemAt(i)).selected ) {
					result.push( this._items.itemAt(i).id );
				}
			}

			return result;
		}
	}

	set values( values: any[] ) {

		if ( !this.multiple ) {
			throw new Error( 'The values property of a UI_Tree component can be set only if the component is multiple.' );
		}

		values = values || [];

		var i: number = 0,
		    len: number = this._items.length;

		for ( i=0; i<len; i++ ) {
			(<Store_Item_NestableObject>this._items.itemAt(i)).selected = values.indexOf( this._items.itemAt(i).id ) > -1;
		}

	}

	/* MRowInterface methods */
	get length(): number {
		return this._view.length;
	}

	get itemsPerPage(): number {
		return ~~( this.paintContext.height / UI_Tree._theme.option.height );
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
		}
	]
} );