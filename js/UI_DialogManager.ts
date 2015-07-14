class UI_DialogManager extends UI_Event {

	public static instance: UI_DialogManager = null;

	public  windows: UI_Form[] = [];
	public  desktop: any = null;

	private _activeWindow: UI_Form = null;

	constructor() {
		super();
		this._setupEvents_();
	}

	public onWindowOpened( win: UI_Form ) {

		for ( var i=0, len = this.windows.length; i<len; i++ ) {
			if ( this.windows[i] == win ) {
				this.windows.splice( i, 1 );
				break;
			}
		}

		// put the window at the end of the window stack
		this.windows.push( win );

		// make the window active
		this.activeWindow = win;
	
	}

	public onWindowClosed( win: UI_Form ) {

		for ( var i=0, len = this.windows.length; i<len; i++ ) {
			if ( this.windows[i] == win ) {
				this.windows.splice( i, 1 );
			}
		}

		if ( this._activeWindow == win ) {
			this.activeWindow = null;
		}

	}

	public static get(): UI_DialogManager {
		return UI_DialogManager.instance
			? UI_DialogManager.instance
			: ( UI_DialogManager.instance = new UI_DialogManager() );
	}

	get activeWindow(): UI_Form {
		return this._activeWindow;
	}

	set activeWindow( form: UI_Form ) {
		if ( form != this._activeWindow ) {
			if ( this._activeWindow ) {
				this._activeWindow.focused = false;
			}
			this._activeWindow = form || null;
		}
		if ( this._activeWindow && !this.activeWindow.focused ) {
			this._activeWindow.focused = true;
		}
	}

	public getWindowById( winId: number ) {
		for ( var i=0, len = this.windows.length; i<len; i++ ) {
			if ( this.windows[i].id == winId ) {
				return this.windows[i];
			}
		}
		return null;
	}

	private _setupEvents_() {
		( function( manager ) {

			if ( typeof window != 'undefined' ) {

				window.addEventListener( 'load', function() {
					
					// setup the default manager.
					manager.desktop = document.body;

					document.body.addEventListener( 'mousedown', function( evt ) {

						var target: any = evt.target || evt.srcElement;

						while ( target && target != document.documentElement ) {
							if ( target.getAttribute('data-role') == 'UI_Form' ) {
								
								manager.activeWindow = manager.getWindowById(
									target.getAttribute('data-form-id' )
								);

								return;

							}
							target = target.parentNode;
						}

						manager.activeWindow = null;

					}, true );

				}, true );
			}

		} )( this );
	}

}

UI_DialogManager.get();