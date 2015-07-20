class UI_ListBox extends UI_Canvas implements IFocusable {
	
	public static _theme: any = {
		optionHeight: $I.number('UI.UI_ListBox/option.height'),
		disabledBackgroundColor: $I.string('UI.UI_ListBox/background.disabled'),
		enabledBackgroundColor: $I.string('UI.UI_ListBox/background.enabled'),
		font: $I.string('UI.UI_ListBox/font.size') + "px " + $I.string('UI.UI_ListBox/font.family'),
		color: $I.string('UI.UI_ListBox/font.color'),
		disabledColor: $I.string('UI.UI_ListBox/font.disabledColor')
	};

	private _options: Store_NamedObjects;
	private _selectedIndex: number = -1;

	// IFocusable properties
	public    active: boolean; // the active is overrided by the MFocusable mixin
	public    wantTabs: boolean = false;
	public    tabIndex: number = 0;

	constructor( owner: UI ) {
		super( owner, [ 'IFocusable' ] );
		UI_Dom.addClass( this._root, 'UI_ListBox' );
		this._options = new Store_NamedObjects([]);
		this._setupExtendedEvents_();
	}

	protected _setupExtendedEvents_() {

		( function( me ) {

			// setup the listbox events.
			me._options.on( 'change', function() {
				me.logicalHeight = UI_ListBox._theme.optionHeight * me.length;
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

		} )( this );
	}

	get options(): INameable[] {
		var out: INameable[] = [];
		for ( var i=0, len = this._options.length; i<len; i++ ) {
			out.push( this._options.itemAt( i ).data );
		}
		return out;
	}

	set options( opts: INameable[] ) {
		opts = opts || [];
		this._options.setItems( opts );
		this.selectedIndex = this.selectedIndex;
		this.logicalHeight = UI_ListBox._theme.optionHeight * opts.length;
	}

	get length(): number {
		return this._options.length;
	}

	get selectedIndex(): number {
		return this._selectedIndex;
	}

	set selectedIndex( index: number ) {
		index = ~~index;
		if ( index < -1 ) {
			index = -1;
		}
		if ( index >= this.length ) {
			index = this.length - 1;
		}
		if ( index != this._selectedIndex ) {
			this._selectedIndex = index;
			this.render();
		}
	}

	public render() {
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
		   	opt: INameable;

		ctx.fillStyle = bgColor;
		ctx.fillRect( 0, 0, this._paintRect.width, this._paintRect.height );
		ctx.font = UI_ListBox._theme.font;
		ctx.textBaseline = "middle";

		for ( i = skip, len = Math.min( this.length, skip + paintRows); i<len; i++ ) {
			opt = this._options.itemAt( i ).data;

			ctx.fillStyle = this.disabled
				? UI_ListBox._theme.disabledColor
				: UI_ListBox._theme.color;

			ctx.fillText( opt.name, 2, startY + ~~( UI_ListBox._theme.optionHeight / 2 ) );

			startY += UI_ListBox._theme.optionHeight;
		}

	}

}

Mixin.extend( "UI_ListBox", "MFocusable" );

Constraint.registerClass( {
	"name": "UI_ListBox",
	"extends": "UI_Canvas",
	"properties": [
		{
			"name": "active",
			"type": "boolean"
		},
		{
			"name": "wantTabs",
			"type": "boolean"
		},
		{
			"name": "tabIndex",
			"type": "boolean"
		},
		{
			"name": "options",
			"type": "INameable[]"
		}
	]
} );