class UI_ListBox extends UI_Canvas implements IFocusable, IRowInterface {
	
	public static _theme: any = {
		optionHeight: $I.number('UI.UI_ListBox/option.height'),

		/* BACKGROUND COLOR OF THE LISTBOX FOR DISABLED AND ENABLED STATES */
		disabledBackgroundColor: $I.string('UI.UI_ListBox/background.disabled'),
		enabledBackgroundColor: $I.string('UI.UI_ListBox/background.enabled'),
		
		/* OPTIONS */

		// FONT
		font: $I.string('UI.UI_ListBox/font.size') + "px " + $I.string('UI.UI_ListBox/font.family'),

		// BACKGROUND
		disabledSelectedBackgroundColor: $I.string('UI.UI_ListBox/background.selectedDisabled'),
		enabledSelectedBackgroundColor: $I.string('UI.UI_ListBox/background.selected'),
		inactiveSelectedBackgroundColor: $I.string('UI.UI_ListBox/background.inactiveSelected'),
		
		// COLOR IN UNSELECTED STATE
		color: $I.string('UI.UI_ListBox/font.color'),
		disabledColor: $I.string('UI.UI_ListBox/font.disabledColor'),

		// COLOR IN SELECTED STATE
		disabledSelectedFontColor: $I.string('UI.UI_ListBox/font.selectedDisabledColor'),
		enabledSelectedFontColor: $I.string('UI.UI_ListBox/font.selectedEnabledColor'),
		inactiveSelectedFontColor: $I.string('UI.UI_ListBox/font.inactiveSelectedColor')
	};

	private _options: Store;

	// IFocusable properties
	public    active: boolean; // the active is overrided by the MFocusable mixin
	public    wantTabs: boolean = false;
	public    tabIndex: number = 0;
	public    includeInFocus: boolean = true;

	// MRowInterface properties
	// public    length: number;
	public    selectedIndex: number;
	public    multiple: boolean;

	private   _render: UI_Throttler;


	constructor( owner: UI ) {
		super( owner, [ 'IFocusable', 'IRowInterface' ] );
		UI_Dom.addClass( this._root, 'UI_ListBox' );
		this._options = new Store('id');
		this._setupExtendedEvents_();

	}

	protected _setupExtendedEvents_() {

		( function( me ) {

			me._render = new UI_Throttler( function() { me.paint(); }, 1);

			// setup the listbox events.
			me._options.on( 'change', function() {
				me.logicalHeight = UI_ListBox._theme.optionHeight * me.length;
				me.selectedIndex = -1;
				me.render();
			} );

			me._options.on( 'meta-changed', function() {
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

			me.on('change', function() {
				me.render();
			} );

			me.on( 'mousedown', function( point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean ) {
				
				if ( me.disabled || which != 1 || point.y < 0 ) {
					return;
				}

				var y: number = point.y,
					rowIndex = ~~( y / UI_ListBox._theme.optionHeight );

				me.onRowIndexClick( rowIndex, shiftKey, ctrlKey );

			}, true );

		} )( this );
	}

	get options(): INameable[] {
		var out: INameable[] = [],
		    opt: INameable,
		    item: Store_Item;
		for ( var i=0, len = this._options.length; i<len; i++ ) {
			item = this._options.itemAt( i );
			opt = {
				"id": item.id,
				"name": item.get('name')
			};
			opt['selected'] = item.selected;
			out.push( opt );
		}
		return out;
	}

	set options( opts: INameable[] ) {
		opts = opts || [];
		this._options.setItems( opts );
		this.selectedIndex = this.selectedIndex;
		this.logicalHeight = UI_ListBox._theme.optionHeight * opts.length;
	}

	public render() {
		if ( this._render ) {
			this._render.run();
			this._dom.viewport.scrollLeft = this._scrollLeft;
			this._dom.viewport.scrollTop = this._scrollTop;
		}
	}

	public paint() {
		var scrollTop: number = this.scrollTop,
		    skip: number = ~~( scrollTop / UI_ListBox._theme.optionHeight ),
		    
		    ctx = this._dom.canvas.getContext('2d'),
		    
		    bgColor = this.disabled
		    	? UI_ListBox._theme.disabledBackgroundColor
		    	: UI_ListBox._theme.enabledBackgroundColor,
		   	startY: number = -( scrollTop % UI_ListBox._theme.optionHeight ),
		   	paintRows: number = Math.round( this._paintRect.height / UI_ListBox._theme.optionHeight ) + 1,
		   	i: number,
		   	len: number,
		   	opt: Store_Item,
		   	isActive: boolean = this.active && this.form && this.form.active,
		   	isDisabled: boolean = this.disabled,
		   	isScrollbar: boolean = this.logicalHeight >= this._paintRect.height,
		   	selectedIndex: number = this.selectedIndex;

		ctx.fillStyle = bgColor;
		ctx.fillRect( 0, 0, this._paintRect.width, this._paintRect.height );
		ctx.font = UI_ListBox._theme.font;
		ctx.textBaseline = "middle";

		for ( i = skip, len = Math.min( this.length, skip + paintRows); i<len; i++ ) {
			opt = this._options.itemAt( i );

			if ( !opt.selected ) {
				ctx.fillStyle = isDisabled
					? UI_ListBox._theme.disabledColor
					: UI_ListBox._theme.color;
			} else {
				// Draw also the selected background color
				ctx.fillStyle = isDisabled
					? UI_ListBox._theme.disabledSelectedBackgroundColor
					: ( isActive ? UI_ListBox._theme.enabledSelectedBackgroundColor : UI_ListBox._theme.inactiveSelectedBackgroundColor );

				ctx.fillRect( 0, startY, this._paintRect.width, UI_ListBox._theme.optionHeight );

				ctx.fillStyle = isDisabled
					? UI_ListBox._theme.disabledSelectedFontColor
					: ( isActive ? UI_ListBox._theme.enabledSelectedFontColor : UI_ListBox._theme.inactiveSelectedFontColor );
			}

			ctx.fillText( opt.get('name'), 2, startY + ~~( UI_ListBox._theme.optionHeight / 2 ) );

			if ( selectedIndex == i && isActive && !isDisabled ) {
				// draw selected index focus ring
				ctx.strokeStyle = 'black';
				ctx.lineWidth = 1;
				ctx.strokeRect( .5, startY + 0.5, this._paintRect.width - 1 - ( ~~isScrollbar * UI_Dom.scrollbarSize ), UI_ListBox._theme.optionHeight - 1 );
				ctx.stroke();
			}

			startY += UI_ListBox._theme.optionHeight;
		}

	}

	get length(): number {
		return this._options.length;
	}

	get itemsPerPage(): number {
		return ~~( this._paintRect.height / UI_ListBox._theme.optionHeight );
	}

	public onRowIndexClick( rowIndex: number, shiftKey: boolean = false, ctrlKey: boolean = false ) {
		// @override by MRowInterface.onRowIndexClick
	}

	public isRowSelected( rowIndex: number ): boolean {
		return this._options.itemAt(rowIndex).selected;
	}

	public selectRow( rowIndex: number, on: boolean ) {
		this._options.itemAt(rowIndex).selected = on;
	}

	public scrollIntoRow( rowIndex: number ) {

		if ( rowIndex < 0 && rowIndex >= this.length ) {
			return;
		}

		var rowTop = UI_ListBox._theme.optionHeight * rowIndex,
		    rowBottom = rowTop + UI_ListBox._theme.optionHeight;

		if ( rowBottom > this.scrollTop + this._paintRect.height ) {
			this.scrollTop = rowBottom - this._paintRect.height;
		} else
		if ( rowTop < this.scrollTop ) {
			this.scrollTop = rowTop;
		}

	}

	get value(): any {
		for ( var i=0, len = this.length; i<len; i++ ) {
			if ( this._options.itemAt(i).selected ) {
				return this._options.itemAt(i).id;
			}
		}
		return null;
	}

	set value( value: any ) {
		var index: number = -1,
		    i: number,
		    len: number = this.length;

		for ( i=0; i<len; i++ ) {
			if ( this._options.itemAt(i).id == value ) {
				index = i;
				break;
			}
		}

		for ( i=0; i<len; i++ ) {
			this.selectRow( i, i == index );
		}

		this.selectedIndex = index;

		this.fire( 'change' );
	}

	get values(): any[] {
		var result: any[] = [],
		    i: number,
		    len: number = this.length,
		    v: any;

		if ( this.multiple ) {

			for ( i=0; i<len; i++ ) {
				if ( this.isRowSelected(i) ) {
					result.push( this._options.itemAt(i).id );
				}
			}

		} else {
			
			v = this.value;
			
			if ( v !== null ) {
				result.push( v );
			}
		}

		return result;
	}

	set values( values: any[] ) {

		var i: number,
			len: number = this.length,
			firstIndex: number = -1;

		if ( !this.multiple ) {
			throw new Error( "UI_ListBox: the values property accepts setter only when multiple mode is true" );
		}

		if ( values.length ) {

			for ( i=0; i<len; i++ ) {

				this.selectRow( i, values.indexOf( this._options.itemAt(i).id ) >= 0 );

				if ( firstIndex == -1 && this.isRowSelected(i) ) {
					firstIndex = i;
				}

			}
		
		}

		this.selectedIndex = firstIndex;

		this.fire( 'change' );

	}

}

Mixin.extend( "UI_ListBox", "MFocusable" );
Mixin.extend( "UI_ListBox", "MRowInterface" );

Constraint.registerClass( {
	"name": "UI_ListBox",
	"extends": "UI_Canvas",
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
			"name": "options",
			"type": "INameable[]"
		},
		{
			"name": "multiple",
			"type": "boolean"
		},
		{
			"name": "value",
			"type": "any"
		},
		{
			"name": "values",
			"type": "any[]"
		},
		{
			"name": "selectedIndex",
			"type": "number"
		}
	]
} );