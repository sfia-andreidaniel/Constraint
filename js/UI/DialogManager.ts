/*  DialogManager role is the following:
	- maintains a list with opened dialog
	- provides a "desktop" DOM element, where the dialogs are opened
	- handles the "focusing" by keyboard in the current active dialog.
*/

class UI_DialogManager extends UI_Event {

	public static instance: UI_DialogManager = null;

	public  windows: UI_Form[] = [];
	public  desktop: any = null;
	public  _desktopWidth: number = null;
	public  _desktopHeight: number = null;

	private _activeWindow: UI_Form = null;

	constructor() {
		super();
		this._setupEvents_();
	}

	get desktopWidth(): number {
		if ( this._desktopWidth === null ) {
			if ( this.desktop ) {
				this._desktopWidth = this.desktop.offsetWidth;
			}
		}
		return ~~this._desktopWidth;
	}

	get desktopHeight(): number {
		if ( this._desktopHeight === null ) {
			if ( this.desktop ) {
				this._desktopHeight = this.desktop.offsetHeight;
			}
		}
		return ~~this._desktopHeight;
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
				this._activeWindow.active = false;
			}
			this._activeWindow = form || null;
		}
		if ( this._activeWindow && !this.activeWindow.active ) {
			this._activeWindow.active = true;
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

	protected handleTabKey (ev) {

		var components: UI[],
		    index: number,
		    cancel: boolean = true;

		if ( this._activeWindow ) {

			if ( this._activeWindow.activeElement && this._activeWindow.activeElement['wantTabs'] ) {
				
				cancel = false;
			
			} else {

				components = this._activeWindow.focusGroup;

				if ( components.length > 1) {

					index = components.indexOf( this._activeWindow.activeElement );
					
					if ( index >= 0 ) {

						// reverse tabbing
						if ( ev.shiftKey ) {
							if ( index == 0 ) {
								index = components.length - 1;
							} else {
								index--;
							}
						} else {
							if ( index < components.length - 1 ) {
								index++;
							} else {
								index = 0;
							}
						}

					} else {

						if ( ev.shiftKey ) {
							index = components.length - 1;
						} else {
							index = 0;
						}

					}

					(<MFocusable>components[index]).active = true;

				}

			}

			if ( cancel ) {
				ev.preventDefault();
				ev.stopPropagation();
			}
		}

	}

	private _setupEvents_() {
		( function( manager ) {

			if ( typeof window != 'undefined' ) {

				window.addEventListener( 'load', function() {
					
					// setup the default manager.
					manager.desktop = document.body;

					manager.desktop.addEventListener( 'mousedown', function( evt ) {

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

					manager.desktop.addEventListener( 'keydown', function( ev ) {
						var code = ev.keyCode || ev.charCode;
						if ( code == 9 ) {
							manager.handleTabKey( ev );
						}
					}, true );



				}, true );

				window.addEventListener( 'resize', function() {

					if ( manager.desktop ) {
						manager._desktopHeight = manager.desktop.offsetHeight;
						manager._desktopWidth = manager.desktop.offsetWidth;
					}

					for ( var i=0, len = manager.windows.length; i<len; i++ ) {
						if ( manager.windows[i].placement == EFormPlacement.CENTER 
							|| manager.windows[i].state == EFormState.FULLSCREEN 
							|| manager.windows[i].state == EFormState.MAXIMIZED 
						) {
							manager.windows[i].onRepaint();
						}
					}

				}, true );

			}

		} )( this );
	}

}

UI_DialogManager.get();