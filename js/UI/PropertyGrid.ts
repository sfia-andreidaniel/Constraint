/**
 * The UI_PropertyGrid control allows the user to create in a super-fast time a
 * form for editing data.
 */
class UI_PropertyGrid extends UI_Canvas implements IFocusable, IRowInterface {

	public static _theme = {
		defaults: {
			rowHeight: $I.number('UI.UI_PropertyGrid/defaults.rowHeight'),
			depthUnitWidth: $I.number('UI.UI_PropertyGrid/defaults.depthUnitWidth')
		},
		border: {
			enabled: $I.string('UI.UI_PropertyGrid/border.enabled'),
			disabled:$I.string('UI.UI_PropertyGrid/border.disabled')
		},
		option: {
			background: {
				selected         : $I.string('UI.UI_PropertyGrid/option.background.selected'),
				selectedInactive : $I.string('UI.UI_PropertyGrid/option.background.selectedInactive'),
				disabled         : $I.string('UI.UI_PropertyGrid/option.background.disabled')
			}
		},
		expander: {
			expanded: $I.string('UI.UI_PropertyGrid/expander.expanded'),
			collapsed: $I.string('UI.UI_PropertyGrid/expander.collapsed')
		}
	};
	
	/**
	 * MFocusable mixin property
	 */
	public    active: boolean; // the active is overrided by the MFocusable mixin

	/**
	 * MFocusable mixin property
	 */
	public    wantTabs: boolean = false;

	/**
	 * MFocusable mixin property
	 */
	public    tabIndex: number = 0;

	/**
	 * MFocusable mixin property
	 */
	public    includeInFocus: boolean = true;

	/**
	 * MFocusable mixin property
	 */
	public    accelerators: string;


	/**
	 * Wether the control allows multiple rows selection or not.
	 */
	public    multiple: boolean;

	/**
	 * A easy to use nested interface for accessing the control properties. All properties of the 
	 * grid are exposed in this object via getters / setters.
	 */
	private   _values     : any = {};

	/**
	 * A easy to use nested interface for accessing the control inputs. All controls of the grid
	 * are exposed in this object via getters / setters.
	 */
	private   _inputs     : any = {};

	/**
	 * Control root properties.
	 */
	private   _properties : UI_PropertyGrid_Row[] = [];

	/**
	 * Un-nested visible (expanded) control properties that the user can see.
	 */
	private   _visibleProperties: UI_PropertyGrid_Row[] = [];

	/**
	 * The position of the splitter of the control. If value is <= 1, it is considered to be
	 * a percentual value relative to the width of the control.
	 */
	private   _splitWidth: number = .33;

	/**
	 * The index of the selected visible property of the control.
	 */
	private   _selectedIndex: number = -1;

	/**
	 * A throttler for rendering
	 */
	private   _render: UI_Throttler;

	/**
	 * Control constructor
	 */
	constructor( owner: UI ) {
	    super( owner, [ 'IFocusable', 'IRowInterface' ] );
	    Utils.dom.addClass( this._root, 'UI_PropertyGrid' );
	    this._values = {};
	    this._setup_();
	}

	/**
	 * Returns a nested object containing the raw values of the control. You can use
	 * JSON.stringify function in order to serialize the grid values.
	 */
	get values(): any {
		return this._values;
	}

	/**
	 * Returns a nested object containing the inputs of the control.
	 */
	get inputs(): any {
		return this._inputs;
	}

	/**
	 * Sets the control properties. The control properties should be an array containing
	 * objects matching the IPropertyGroupNested interface.
	 */
	set properties( properties: IPropertyGroupNested[] ) {
		
		var newValues: any = Object.create( null ),
			newInputs: any = Object.create( null ),
		    newProperties: UI_PropertyGrid_Row[] = [],
		    grid = this;

		properties = properties || [];

		function walkGroup( group: IPropertyGroupNested[], valuesRoot: any, rootProperty: UI_PropertyGrid_Row_Group, inputsRoot: any ) {

			var i: number = 0,
			    len: number,
			    seenProperties: string[] = [],
			    isGroup: boolean,
			    isInput: boolean;

			if ( !group ) {
				return;
			}

			for ( i=0, len = ~~group.length; i<len; i++ ) {

				if ( seenProperties.indexOf( group[i].name ) > -1 ) {
					throw new Error( 'Cannot declare two properties with the same name in a group' );
				}

				isGroup = typeof group[i].children != 'undefined';
				isInput = typeof group[i].input != 'undefined';

				if ( isGroup && isInput ) {
					throw new Error( 'Cannot declare both a group and an input in the same type' );
				}

				if ( !isGroup && !isInput ) {
					throw new Error( 'A property must be either a group, either an input' );
				}

				if ( isInput ) {

					( function( propertyName: string, propertyConfig: IPropertyGroupNested ) {

						var input = UI_PropertyGrid_Row_Input.create( propertyConfig.input.type, propertyConfig, grid, rootProperty );

						Object.defineProperty( valuesRoot, propertyName, {
							"get": function() {
								return input.value;
							},
							"set": function( data: any ) {
								input.value = data;
							},
							"enumerable": true,
							"configurable": false
						} );

						Object.defineProperty( inputsRoot, propertyName, {
							"value": input,
							"enumerable": true,
							"configurable": false
						} );

						if ( !rootProperty ) {
							newProperties.push( input );
						}

						if ( rootProperty ) {
							rootProperty.addChild( input );
						}

					} )( group[i].name, group[i] )

				} else {

					( function( propertyName: string, propertyConfig: IPropertyGroupNested ) {

						var root: any = Object.create( null ),
						    iRoot: any = Object.create( null );

						Object.defineProperty( valuesRoot, propertyName, {
							value: root,
							"enumerable": true,
							"configurable": false
						} );

						Object.defineProperty( inputsRoot, propertyName, {
							value: iRoot,
							"enumerable": true,
							"configurable": false
						});

						var group = new UI_PropertyGrid_Row_Group( propertyConfig, grid, rootProperty );

						if ( !rootProperty ) {
							newProperties.push( group );
						} else {
							rootProperty.addChild( group );
						}

						walkGroup( propertyConfig.children, root, group, iRoot );

					} )( group[i].name, group[i] )

				}

			}
		}

		walkGroup( properties, newValues, null, newInputs );

		this._properties = newProperties;
		this._values = newValues;
		this._inputs = newInputs;
		this._visibleProperties = this.visibleProperties;
		this.logicalHeight = this._visibleProperties.length * this.rowHeight;

		this.render();

	}

	/**
	 * Returns 2d array with the visible rows of the control.
	 */
	get visibleProperties(): UI_PropertyGrid_Row[] {
		var result: UI_PropertyGrid_Row[] = [];
		
		function walk( where: UI_PropertyGrid_Row[] ) {

			if ( !where ) {
				return;
			}

			for ( var i=0, len = where.length; i<len; i++ ) {
				
				if ( where[i].visible ) {
					result.push( where[i] );
				}

				walk( where[i].children );

			}
		}

		walk( this._properties );

		return result;
	}

	/**
	 * Returns the length of the visible properties of the control.
	 */
	get length(): number {
		return this._visibleProperties.length;
	}

	/**
	 * MRowInterface adapter method. Returns wether a row is selected or not.
	 */
	public isRowSelected( rowIndex: number ): boolean {
		return this._visibleProperties[ rowIndex ] && this._visibleProperties[ rowIndex ].selected;
	}

	/**
	 * MRowInterface adapter method. Sets the selected state of a visible row to ON or OFF.
	 */
	public selectRow( rowIndex: number, on: boolean ) {
		if ( this._visibleProperties[ rowIndex ] ) {
			this._visibleProperties[ rowIndex ].selected = !!on;
		}
	}

	/**
	 * MRowInterface adapter method. Implemented by mixin.
	 */
	public onRowIndexClick( rowIndex: number, shiftKey: boolean = false, ctrlKey: boolean = false ) {
		throw new Error( 'Is implemented by mixin' );
	}

	/**
	 * Returns the height of a row of the grid.
	 */
	get rowHeight(): number {
		return UI_PropertyGrid._theme.defaults.rowHeight;
	}

	/**
	 * Scrolls the grid if needed, in order to make a row visible to the user.
	 */
	public scrollIntoRow( rowIndex: number ) {
		
		if ( rowIndex < 0 && rowIndex >= this.length ) {
			return;
		}

		var rowTop = this.rowHeight * rowIndex,
		    rowBottom = rowTop +this.rowHeight;

		if ( rowBottom > this.scrollTop + this._paintRect.height - Utils.dom.scrollbarSize ) {
			this.scrollTop = rowBottom - this._paintRect.height + Utils.dom.scrollbarSize;
		} else
		if ( rowTop < this.scrollTop ) {
			this.scrollTop = rowTop;
		}
		
	}

	/**
	 * Returns the number of rows that the grid can render in it's canvas. It is determined
	 * automatically by the height of the grid.
	 */
	get itemsPerPage(): number {
		return Math.min( Math.round( this._paintRect.height / this.rowHeight ), this._visibleProperties.length );
	}

	/**
	 * Returns the first index of the visible row that the grid will render in it's viewport.
	 */
	get indexPaintStart(): number {
		return ~~( this.scrollTop / this.rowHeight );
	}

	/**
	 * Returns the last index of the visible row that the grid will render in it's viewport
	 */
	get indexPaintEnd(): number {
		return this.indexPaintStart + this.itemsPerPage;
	}

	/**
	 * Returns the value in pixels in the canvas where the first row of the grid will be painted.
	 * This value contains less or equal to zero values.
	 */
	get yPaintStart(): number {
		return -( this.scrollTop % this.rowHeight );
	}

	/**
	 * Returns the position of the splitter in the control
	 */
	get splitWidth(): number {
		return this._splitWidth < 1 && this._splitWidth != 0
			? ~~( this._paintRect.width * this._splitWidth )
			: this._splitWidth;
	}

	/**
	 * Sets the position of the splitter in the control.
	 */
	set splitWidth( width: number ) {
		width = width < 0
			? 0
			: width || 0;

		if ( width >= 1 ) {
			width = ~~width;
		}

		this._splitWidth = width;
		
		this.render();
	}

	/**
	 * Calls the throttler of the control in order to trigger the
	 * paint method.
	 */
	public render() {
		if ( this._render ) {
			this._render.run();
		}
		//this.paint();
	}

	/**
	 * Paints the control NOW on it's canvas.
	 */
	public paint() {

		var ctx = this.defaultContext;

		if ( !ctx ) {
			return;
		}

		var yPaintStart: number           = this.yPaintStart,
		    indexPaintStart: number       = this.indexPaintStart,
		    indexPaintEnd: number         = this.indexPaintEnd,
		    disabled: boolean             = this.disabled,
		    active: boolean               = this.active || ( this._children && this._children[0] && this._children[0]['active'] ),
		    bgColor: string               = disabled ? UI_Canvas._theme.background.disabled : UI_Canvas._theme.background.enabled,
		    length: number                = this.length,
		    row: UI_PropertyGrid_Row,
		    i: number,
		    rowHeight: number = this.rowHeight,
		    splitWidth: number = this.splitWidth,
		    isScrollbarX: boolean = this.logicalWidth >= this._paintRect.width,
		    isScrollbarY: boolean = this.logicalHeight >= this._paintRect.height;

		if ( indexPaintEnd >= length ) {
			indexPaintEnd = length - 1;
		}

		ctx.beginPaint();

		ctx.fillStyle = bgColor;
		ctx.fillRect( 0, 0, ctx.width, ctx.height );

		ctx.lineWidth = 1;


		ctx.imageSmoothingEnabled = false;
		ctx.font = UI_Canvas._theme.font.font;
		ctx.textBaseline = "middle";

		for ( i=indexPaintStart; i<=indexPaintEnd; i++ ) {
			row = this._visibleProperties[ i ];

			row.paintAt( 0, yPaintStart, rowHeight, disabled || row.disabled, active, splitWidth, isScrollbarX, isScrollbarY, ctx );

			yPaintStart += rowHeight;
		}


		ctx.endPaint();

	}

	/**
	 * Setups various events of the grid control.
	 */
	protected _setup_() {
		( function( me ) {

			me._render = new UI_Throttler( function(){ me.paint(); }, 1 );

			me.on( 'row-expanded', function() {
				this._visibleProperties = this.visibleProperties;
				this.logicalHeight = this._visibleProperties.length * this.rowHeight;
			} );

			me.on( 'focus', function() {
				this.render();

				if ( this._children && this._children[0] ) {
					this._children[0]['active'] = true;
				}

			} );

			me.on( 'blur', function() {
				this.render();
				if ( this._children && this._children[0] && this.form.activeElement == this._children[0] ) {
					Utils.dom.addClass( this._root, 'focused' );
				}
			} );

			me.on( 'disabled', function() {
				this.render();
			} );

			me.on( 'index-changed', function() {
				this.render();
				this.disposeEditor();
				if ( this._visibleProperties[ this._selectedIndex ] ) {
					this._visibleProperties[ this._selectedIndex ].editMode = true;
				}
			} );

			var canResize: boolean = false,
			    isResizing: boolean = false,
			    currentSplitWidth: number = this.splitWidth;

			me.on( 'mousemove', function( point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean ) {

				if ( me.disabled ) {
					return;
				}

				if ( which == 0 && !isResizing ) {

					var thisSplit: number = this.splitWidth,
					    thisCanResize: boolean = point.x >= thisSplit - 1 && point.x <= thisSplit + 1;

					if ( thisCanResize != canResize ) {
						canResize = thisCanResize;

						switch ( canResize ) {
							case true:
								this._dom.canvasSize.style.cursor = 'col-resize';
								break;
							default:
								this._dom.canvasSize.style.cursor = '';
								break
						}
					}
				} else
				if ( which == 1 && isResizing ) {

					this.splitWidth = point.x;

				}

			} );

			me.on( 'mousedown', function( point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean ) {

				if ( this.disabled || which != 1 || point.y < 0 ) {
					return;
				}

				if ( !canResize && !isResizing ) {

					//console.log( e.offsetY, e.clientY, e );
					var y: number  = point.y,
					    x: number  = point.x,
						rowIndex   = ~~( y / this.rowHeight ),
						row: UI_PropertyGrid_Row = this._visibleProperties[ rowIndex ];

					me.onRowIndexClick( rowIndex, shiftKey, ctrlKey );

					if ( !row ) {
						return;
					}

					var padding: number = ( row.depth ) * UI_PropertyGrid._theme.defaults.depthUnitWidth,
			    		expanderPadding: number = ~~!!row.length * UI_PropertyGrid._theme.defaults.depthUnitWidth;

			    	if ( expanderPadding && x >= padding && x <= padding + expanderPadding ) {
			    		(<UI_PropertyGrid_Row_Group>row).expanded = !(<UI_PropertyGrid_Row_Group>row).expanded;
			    	}

		    	} else {

		    		// handle split resizing
		    		if ( !isResizing ) {

		    			currentSplitWidth = this.splitWidth;

		    			me.onDOMEvent( document.body, EEventType.MOUSE_UP, function( evt: Utils_Event_Mouse ) { isResizing = false; }, true, true );

		    			isResizing = true;

		    		}

		    	}

			} );

			me.on( 'keydown', function( ev: Utils_Event_Keyboard ) {

				if ( this.disabled ) {
					return;
				}

				var code: number = ev.code;

				if ( ev.altKey || ev.shiftKey || ev.ctrlKey ) {
					return;
				}

				switch ( code ) {

					case Utils.keyboard.KB_LEFT:
						this.setCurrentGroupExpandedState( false );
						break;
					
					case Utils.keyboard.KB_RIGHT:
						this.setCurrentGroupExpandedState( true );
						break;
				}

			} );

		} )( this );
	}

	/**
	 * Sets the expanded state of the current selected-index row to ON or OFF.
	 */
	protected setCurrentGroupExpandedState( expanded: boolean ) {
		if ( this._selectedIndex > -1 && this._visibleProperties[ this._selectedIndex ] && !!this._visibleProperties[ this._selectedIndex ].children ) {
			(<UI_PropertyGrid_Row_Group>this._visibleProperties[ this._selectedIndex ]).expanded = !!expanded;
		}
	}

	/**
	 * Overrides the UI_Canvas.insert method, in order to allow inserting the Editor control inside
	 * the property grid.
	 */
	public insert( child: UI ): UI {		

		if ( !child )
			throw Error( 'Cannot insert a NULL element.' );

		child.remove();
		child.owner = this;

		this._children.push( child );

		this.insertDOMNode( child );

		this.form.fire( 'child-inserted', child );

		if ( this._parentsDisabled + ~~this._disabled ) {
			// set the disabled state
			child.onParentDisableStateChange( this._parentsDisabled + ~~this._disabled );
		}

		return child;

	}

	/**
	 * Overrides the UI.insertDOMNode method, in order to place the editor control
	 * DOM element inside the canvasSize div element of the grid.
	 */
	public insertDOMNode( child: UI ): UI {
		if ( child && child._root ) {
			this._dom.canvasSize.appendChild( child._root );
		}
		return child;
	}

	/**
	 * If the grid has an editor active on some row, it kills and removes it.
	 */
	public disposeEditor() {
		if ( this._children && this._children[0] ) {
			
			var wasActive: boolean = this._children[0]['active'];

			this._children[0].fire( 'destroy' );

			if ( wasActive && !this.disabled ) {
				this.active = true;
			}
		}
	}

	get isHandlingNavigationKeys(): boolean {
		if ( this._visibleProperties[ this._selectedIndex ] ) {
			return this._visibleProperties[ this._selectedIndex ].isHandlingUpDown;
		} else {
			return false;
		}
	}


}

Mixin.extend( 'UI_PropertyGrid', 'MFocusable' );
Mixin.extend( 'UI_PropertyGrid', 'MRowInterface' );

Constraint.registerClass({
	"name": "UI_PropertyGrid",
	"extends": "UI_Canvas",
	"properties": [
		{
			"name": "values",
			"type": "any"
		},
		{
			"name": "properties",
			"type": "IPropertyGroupNested[]"
		}
	]
});