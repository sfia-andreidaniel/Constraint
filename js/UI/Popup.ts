class UI_Popup extends UI_MenuItem {
	
	constructor( owner: UI ) {
		super(owner);
	}

	get target(): UI {
		return this.form; // for now. later we must implement other targets.
	}

	public openAtXY( x: number, y: number, size: IRect ): boolean {
		
		size = size || {
			width: this.width,
			height: this.height
		};

		var renderFlags: number[],
		    siblings: UI_MenuItem[],
		    i: number,
		    len: number;

		if ( this._children.length ) {

			if ( !this.isOpened ) {

				this._overlay = UI_Screen.get.createWindow( 
					x, 
					y, 
					size.width, 
					size.height
				);

				// Add the paint listener to the overlay
				( function( me ) {
					
					me._overlay.on( 'render', function() {
						me.render();
					} );

					me._overlay.on( 'mousemove', function( x: number, y: number, button: number ) {
						me.onScreenMouseMove( x, y, button );
					} );

					me._overlay.on( 'click', function( x: number, y: number, button: number ) {
						me.onScreenClick( x, y, button );
					} );

					me._overlay.on( 'close', function() {
						me._overlay = null;
						me.fire('close');
					} );

					me._overlay.on( 'keydown', function( evt: Utils_Event_Keyboard ) {
						me.onScreenKeyDown( evt );
					} );

					me._overlayMouseDownHandler = function( x: number, y: number, button: number ) {
						me.onScreenMouseDown( x, y, button );
					};

					UI_Screen.get.on( 'mousedown', me._overlayMouseDownHandler );

				} )( this );

				this.selectedIndex = -1;

			}

			this.render();

			return true;

		} else {

			return false;
		
		}

	}


	public open( atScreenPoint: IPoint ) {

		if ( !this._owner || !this._children.length ) {
			return;
		}

		if ( this.isOpened ) {
			this.close();
		}

		this.fire('open');

		var clientRect: IBoundingBox,
		    size: IRect,
		    src: IWindow,
		    placement: IWindow,
		    rect: IWindow;

		size = {
			"width": this.width,
			"height": this.height
		},

		rect = {
			"width": 0,
			"height": 0,
			"x": atScreenPoint.x,
			"y": atScreenPoint.y
		};

		placement = UI_Screen.get.getBestPlacementMenuStyle( rect, size, 0 );

		this.openAtXY( placement.x, placement.y, { "width": placement.width, "height": placement.height } );

	}

	public openDropDownStyle( win: IWindow ) {
		
		if ( !this._owner || !this._children.length ) {
			return;
		}

		if ( this.isOpened ) {
			this.close();
		}

		this.fire('open');

		var clientRect: IBoundingBox,
		    size: IRect,
		    src: IWindow,
		    placement: IWindow,
		    rect: IWindow = win;

		size = {
			"width": this.width,
			"height": this.height
		},

		placement = UI_Screen.get.getBestPlacementDropDownStyle( rect, size, 0 );

		this.openAtXY( placement.x, placement.y, { "width": placement.width, "height": placement.height } );

	}

}

Constraint.registerClass({
	"name": "UI_Popup",
	"extends": "UI_MenuItem",
	"parentTypeOnly": [
		"UI_Form"
	],
	"properties": [
	]
});