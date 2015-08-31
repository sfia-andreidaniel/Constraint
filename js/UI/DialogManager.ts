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

	protected _pointerX: number = 0;
	protected _pointerY: number = 0;

	public  screen: UI_Screen;

	private _activeWindow: UI_Form = null;

	constructor() {
		super();
		this._setupEvents_();
	}

	get pointerX(): number {
		return this._pointerX;
	}

	get pointerY(): number {
		return this._pointerY;
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

	static get get(): UI_DialogManager {
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

				if ( this._activeWindow.mdiParent )
					this._activeWindow.mdiParent['mdiUnfocusChain']();

			}
			this._activeWindow = form || null;
		}

		if ( this._activeWindow && !this.activeWindow.active ) {
			this._activeWindow.active = true;
		}

		if ( this._activeWindow ) {
			if ( this._activeWindow.mdiParent ) {
				this._activeWindow.mdiParent['mdiFocusChain']();
			}
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

	protected handleTabKey (ev, ignoreWantTabs: boolean = false) {

		var components: UI[],
		    index: number,
		    cancel: boolean = true;

		if ( this._activeWindow ) {

			if ( this._activeWindow.activeElement && this._activeWindow.activeElement['wantTabs'] && !ignoreWantTabs ) {
				
				this.handleRegularKey( ev );

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

			ev.preventDefault();
			ev.stopPropagation();

		}

	}

	// sends the key to activeForm.activeElement
	protected handleRegularKey( ev: Utils_Event_Keyboard ) {
		if ( this._activeWindow && this._activeWindow.activeElement ) {
			
			var keyAsString: string = ev.keyName,
			    keyAsNumber: number = ev.code,
			    i: number = 0,
			    len: number = this._activeWindow.focusComponents.length;

			for ( i=0; i<len; i++ ) {

				if ( this._activeWindow.focusComponents[i]['__runAccelerator__']( keyAsNumber, keyAsString ) ) {
					return;
				}

			}

			// see if there are any accelerators matching the key.
			// if there are no accelerators, send the key to activeElement
			this._activeWindow.activeElement.fire( 'keydown', ev );
		}
	}

	public focusNextElement( force: boolean = false ) {
		this.handleTabKey(Utils_Event_Keyboard.createFrom( { "keyCode": 8, "charCode": 8 } ), force);
	}

	public focusPreviousElement( force: boolean = false ) {
		this.handleTabKey(Utils_Event_Keyboard.createFrom( { "keyCode": 8, "charCode": 8, "shiftKey": true } ), force);
	}

	private _setupEvents_() {
		( function( manager ) {

			if ( typeof window != 'undefined' ) {

				manager.onDOMEvent( window, EEventType.LOAD, function( e: Utils_Event_Generic ) {
					
					// setup the default manager.
					manager.desktop = document.body;

					manager.screen = new UI_Screen();
					manager.screen.resize( manager.desktopWidth, manager.desktopHeight );

					manager.screen.open( manager.desktop );

					manager.onDOMEvent( manager.desktop, EEventType.MOUSE_DOWN, function( evt: Utils_Event_Mouse ) {

						var target: any = evt.target,
						    win: UI_Form;

						if ( manager.screen.visible ) {
							return;
						}

						while ( target && target != document.documentElement ) {
							if ( target.getAttribute('data-role') == 'UI_Form' ) {
								
								win = manager.getWindowById(
									target.getAttribute('data-form-id' )
								);

								if ( win["_mdiLocks"] > 0 ) {
									win.mdiFocusChild();

									return;
								} else {
									manager.activeWindow = win;
								}

								return;

							}
							target = target.parentNode;
						}

						//manager.activeWindow = null;

					}, true );

					manager.onDOMEvent( manager.desktop, EEventType.KEY_DOWN, function( ev: Utils_Event_Keyboard ) {
						
						if ( manager.screen.visible ) {
							manager.screen.handleKeyDown( ev );
						} else {
							
							var code = ev.code;

							if ( code == Utils.keyboard.KB_TAB ) {
								manager.handleTabKey( ev );
							} else {
								manager.handleRegularKey( ev );
							}
							if ( code == Utils.keyboard.KB_BACKSPACE && !document.activeElement || [ 'input', 'textarea' ].indexOf( document.activeElement.nodeName.toLowerCase() ) == -1 ) {
								ev.preventDefault();
							}
						}
					}, true );

					manager.onDOMEvent( manager.desktop, EEventType.MOUSE_MOVE, function( ev: Utils_Event_Mouse ) {
						
						manager._pointerX = ev.page.x;
						manager._pointerY = ev.page.y;

						if ( manager.screen.visible ) {
							manager.screen.handleMouseMove( ev );
						}

					}, true );

					manager.onDOMEvent( manager.desktop, EEventType.MOUSE_DOWN, function( ev: Utils_Event_Mouse ) {
						if ( manager.screen.visible ) {
							manager.screen.handleMouseDown( ev );
						}
					}, true );

					manager.onDOMEvent( manager.desktop, EEventType.MOUSE_UP, function( ev: Utils_Event_Mouse ) {
						if ( manager.screen.visible ) {
							manager.screen.handleMouseUp( ev );
						}
					}, true );

					manager.onDOMEvent( manager.desktop, EEventType.CLICK, function( ev: Utils_Event_Mouse ) {
						if ( manager.screen.visible ) {
							manager.screen.handleMouseClick( ev );
						}
					}, true );

					manager.onDOMEvent( manager.desktop, EEventType.DBLCLICK, function( ev: Utils_Event_Mouse ) {
						if ( manager.screen.visible ) {
							manager.screen.handleDoubleClick( ev );
						}
					}, true );

					manager.onDOMEvent( manager.desktop, EEventType.MOUSE_WHEEL, function( ev: Utils_Event_Mouse ) {
						if ( manager.screen.visible ) {
							manager.screen.handleScroll( ev );
						}
					}, true );

				}, true );

				manager.onDOMEvent( window, EEventType.RESIZE, function( ev: Utils_Event_Generic ) {

					if ( manager.desktop ) {
						manager._desktopHeight = manager.desktop.offsetHeight;
						manager._desktopWidth = manager.desktop.offsetWidth;

						manager.screen.resize( manager._desktopWidth, manager._desktopHeight );

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

UI_DialogManager.get;