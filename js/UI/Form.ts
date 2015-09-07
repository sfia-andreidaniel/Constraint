/**
 * An UI_Form is a Window ( aka Dialog, Form, etc. ) implementation in this framework.
 *
 * Various UI_Form window types:
 *
 * Standard form, with all form buttons ( this.formStyle = EFormStyle.FORM )
 *
 * ![form](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_Form.png "UI_Form")
 *
 * MDI form ( this.formStyle = EFormStyle.MDI )
 *
 * ![mdiform](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_Form-mdi.png "UI_Form-mdi")
 *
 * Form without any borders ( this.borderStyle = EBorderStyle.NONE )
 *
 * ![noborderform](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_Form-borderstyle-none.png "UI_Form-borderstyle-none")
 *
 */
class UI_Form extends UI implements IFocusable {
	
	public static _autoID: number = 0;

	public static _theme = {
		"borderWidth": $I.number('UI.UI_Form/border.width'),
		"titlebarHeight": $I.number('UI.UI_Form/titlebar.height'),
		"menubarHeight": $I.number('UI.UI_Form/menuBar.height')
	};

	private   _dom = {
		"inner": Utils.dom.create( 'div', 'inner' ),
		"body": Utils.dom.create('div', 'body'),
		"titlebar": Utils.dom.create('div', 'titlebar'),
		"caption": Utils.dom.create('div', 'caption' ),
		"buttons": Utils.dom.create( 'div', 'buttons' ),
		"n": Utils.dom.create('div', 'resizer n' ),
		"s": Utils.dom.create('div', 'resizer s' ),
		"w": Utils.dom.create('div', 'resizer w' ),
		"e": Utils.dom.create('div', 'resizer e' ),
		"nw": Utils.dom.create( 'div', 'resizer nw' ),
		"ne": Utils.dom.create( 'div', 'resizer ne' ),
		"sw": Utils.dom.create( 'div', 'resizer sw' ),
		"se": Utils.dom.create( 'div', 'resizer se' ),
		"btnClose": Utils.dom.create('div', 'button close' ),
		"btnMinimize": Utils.dom.create( 'div', 'button minimize' ),
		"btnMaximize": Utils.dom.create( 'div', 'button maximize' ),
		"menuBar": null
	};

	/**
	 * MINIMIZED, MAXIMIZED, CLOSED, NORMAL
	 */
	protected _state: EFormState = EFormState.NORMAL;
	
	/**
	 * Weather it has a titlebar or not. NONE: window decorations aren't displayed.
	 */
	protected _borderStyle: EBorderStyle = EBorderStyle.NORMAL;

	/**
	 * Weather it is a FORM or a MDI form. MDI Forms aren't minimizable, maximizable or resizable.
	 */
	protected _formStyle: EFormStyle = EFormStyle.FORM;

	/**
	 * Form placement on desktop. If CENTER, also the form is not "drag'n droppable".
	 */
	protected _placement: EFormPlacement = EFormPlacement.AUTO;

	/**
	 * Form title that is rendered on the form titlebar.
	 */
	protected _caption: string = '';

	/**
	 * Weather form is focused or not. When a form is focused, the UI_DialogManager sends all keystrokes
	 * to the current form focused input.
	 */
	protected _active: boolean = false;

	/**
	 * Internal, representing the ID of the form
	 */
	protected _id: number = 0;

	/**
	 * each object that embraces the IFocusable interface that is child of this form
	 * is stored here, in order to implement the tab focusing.
	 */
	protected _focusComponents: UI[] = [];

	/**
	 * the current element that's active in a form at a single time.
	 */
	protected _activeElement: UI = null;

	/**
	 * whether the form has a menubar or not. When placing a UI_MenuBar inside a form, the
	 * menubar is inserted in another container of the form, not directly in the form body.
	 */
	protected _menuBar: UI_MenuBar;

	/**
	 * IFocusable requirement
	 */
	public wantTabs: boolean;

	/**
	 * IFocusable requirement
	 */
	public tabIndex: number;

	/**
	 * IFocusable requirement
	 */
	public includeInFocus: boolean = false;

	/**
	 * A list with all current form's MDI sub-forms. An application for example can
	 * have a sub-dialog for searching purposes, etc.
	 */
	protected _mdiForms: UI_Form[] = [];

	/**
	 * The owner form of this form, in case this form is a MDI child form.
	 */
	protected _mdiParent: UI_Form = null;

	/**
	 * When a form has opened a mdi sub-form, can become locked if the mdi sub-child
	 * form is "modal". This variable stores the number of modal mdi child locks placed
	 * on this form.
	 */
	protected _mdiLocks: number = 0;

	/**
	 * Whether this form is a modal ( blocks all user input operations inside it's owner form while this
	 * form is opened).
	 */
	protected _modal: boolean = false;

	/**
	 * The css zIndex of the _root DOM node of the form. This property is computed automatically
	 * by UI_DialogManager class, and should not be used directly.
	 */
	protected _zIndex: number = 1;

	/**
	 * Keeps tracking of the focus events of the form, in order to let the UI_DialogManager to
	 * properly compute the _zIndex value.
	 */
	private   _focusOrder: number = 0;

	/**
	 * A handler that is installed if this form becomes a MDI child, in order to announce
	 * it's master form that some state has been changed in this form.
	 */
	private   _mdiChildStateChangedHandler: ( child: UI_Form, newState: EFormState ) => void;

	// Form constructor.
	constructor( ) {
		super( null );

		this._top     = new UI_Anchor_Form( this, EAlignment.TOP );
		this._left    = new UI_Anchor_Form( this, EAlignment.LEFT );
		this._right   = new UI_Anchor_Form( this, EAlignment.RIGHT );
		this._bottom  = new UI_Anchor_Form( this, EAlignment.BOTTOM );

		this._root = Utils.dom.create( 'div', 'ui UI_Form state-normal border-normal style-form placement-auto' );
		this._root.tabIndex = 0; // make the window focusable.
		this._root.style.zIndex = String( this._zIndex );

		this._root.appendChild( this._dom.inner );
		this._dom.inner.appendChild( this._dom.n );
		this._dom.inner.appendChild( this._dom.s );
		this._dom.inner.appendChild( this._dom.w );
		this._dom.inner.appendChild( this._dom.e );
		this._dom.inner.appendChild( this._dom.nw );
		this._dom.inner.appendChild( this._dom.ne );
		this._dom.inner.appendChild( this._dom.sw );
		this._dom.inner.appendChild( this._dom.se );
		this._dom.inner.appendChild( this._dom.titlebar );
		this._dom.inner.appendChild( this._dom.body );
		this._dom.titlebar.appendChild( this._dom.caption );
		this._dom.titlebar.appendChild( this._dom.buttons );
		this._dom.buttons.appendChild( this._dom.btnMinimize ).innerHTML = '<div class="ui icon btn-minimize"></div>';
		this._dom.buttons.appendChild( this._dom.btnMaximize ).innerHTML = '<div class="ui icon btn-maximize"></div>';
		this._dom.buttons.appendChild( this._dom.btnClose ).innerHTML = '<div class="ui icon btn-close"></div>';

		this._padding.top = UI_Form._theme.titlebarHeight + UI_Form._theme.borderWidth;
			this._padding.left = 
			this._padding.right = 
			this._padding.bottom = UI_Form._theme.borderWidth;

		this.caption = this._caption;

		UI_Form._autoID++;

		this._id = UI_Form._autoID;

		this._root.setAttribute( 'data-role', 'UI_Form' );
		this._root.setAttribute( 'data-form-id', String( this._id ) );

		this._setupEvents_();
	}

	/**
	 * Returns the list of dependencies that this form is waiting to be ready, before it is opened.
	 * Some forms depends on resources, which are asynchronous loaded. This list contains the resources
	 * that needs to be loaded before the form is "opened". The form "open" operation is of type promise.
	 */
	public __awaits__( what: string ): string[] {
		var result = [],
		    className: string = this.__class__;
		
		if ( typeof Global['env'][ className ][ '__awaits__' ] != 'undefined' && 
			 typeof Global['env'][ className ][ '__awaits__' ][ what ] != 'undefined' &&
			 Global['env'][ className ][ '__awaits__' ][ what ] instanceof Array
		) {
			result = Global['env'][ className ][ '__awaits__' ][ what ];
		}

		return result;

	}

	/**
	 * returns an element defined as a property on the form class, with the name elementName
	 * the element must extend the UI interface.
	 */
	public getElementByName( elementName ): UI {
		if (typeof this[ elementName ] != 'undefined' && this[ elementName ] instanceof UI ) {
			return <UI>this[ elementName ];
		} else {
			return null;
		}
	}

	/**
	 * @overrides UI.form
	 */
	get form(): UI_Form {
		return this;
	}

	/* The open method appends the form's element into the DialogManager desktop ( which by
	 * default is document.body ) in order to make the form visible. The opening process of a
	 * form is an asynchronous one, because the form must wait first for it's dependency resources
	 * to become available first.
	 */
	public open( ): Thenable<any> {

		return ( function( self ) {

			var resources: string[] = self.__awaits__('resource');

			return Promise.all([
				
				Promise.resolve().then(function() {
					if (resources.length) {
						return UI_Resource.require(resources);
					} else {
						return Promise.resolve();
					}
				}),

				new Promise(function( accept, reject ) {
					if ( UI_Font.ready ) {
						
						accept( true );
					
					} else {

						var unbinder = function( ) {
							UI_Font.eventer.off('ready', unbinder);
							accept(true);
						}

						UI_Font.eventer.on('ready', unbinder);

					}
				})
			])
			.then( function( ) {
				self.paintable = true;
				UI_DialogManager.get.desktop.appendChild( self._root );
				self.updateFocusOrder( self._focusOrder = UI_DialogManager.get.zIndexId );
				UI_DialogManager.get.onWindowOpened( self );
				self.fire( 'open' );
				UI_DialogManager.get.updateZIndex();
				self.onRepaint();
				self.fullRelayout();
				return self;
			} );


		} )( this );

	}

	/**
	 * Closes the form  (removes it from Dialog Manager's desktop)
	 */
	public close() {
		
		if ( this._root.parentNode ) {
			this._root.parentNode.removeChild( this._root );
		}

		if ( this.mdiParent && this.active ) {
			this.mdiParent.active = true;
		}

		this._state = EFormState.CLOSED;

		UI_DialogManager.get.onWindowClosed( this );

		this.fire( 'close' );

	}

	/**
	 * Returns or sets an instance of the form's menubar, if a UI_Menubar is inserted previously in
	 * the form.
	 */
	get menuBar(): UI_MenuBar {
		return this._menuBar || null;
	}

	set menuBar( bar: UI_MenuBar ) {
		bar = bar || null;
		if ( bar != this._menuBar ) {

			if ( bar ) {

				// Set a menubar.
				if ( !this._dom.menuBar ) {
					// If we don't have an existing menubar, we create it
					this._dom.menuBar = Utils.dom.create('div', 'menubar');
				} else {
					// If we already have a menuBar, we clear it's dom nodes from the form
					// menubar holder
					this._dom.menuBar.innerHTML = '';
				}

				// and we append the menubar to the dom, of course
				this._dom.inner.insertBefore( this._dom.menuBar, this._dom.body );

				Utils.dom.addClass( this._root, 'has-menu' );

				this._dom.menuBar.appendChild( bar._root );

				this._menuBar = bar;

				this.padding.top += UI_Form._theme.menubarHeight;
			
			} else {

				if ( this._dom.menuBar ) {

					if ( this._dom.menuBar.parentNode ) {
						this._dom.inner.removeChild( this._dom.menuBar );
					}

					this._dom.menuBar.innerHTML = '';

					Utils.dom.removeClass( this._root, 'has-menu' );

				}

				this._menuBar = null;

				this.padding.top -= UI_Form._theme.menubarHeight;

			}

		}
	}

	/**
	 * Returns or sets the state of the form, which can be: MINIMIZED, MAXIMIZED, CLOSED, 
	 * or FULLSCREEN 
	 */
	get state(): EFormState {
		return this._state;
	}

	set state( state: EFormState ) {
		if ( state != this._state ) {

			Utils.dom.removeClasses( this._root, [ 'state-normal', 'state-minimized', 'state-maximized', 'state-fullscreen', 'state-closed' ] );

			switch ( state ) {
				case EFormState.NORMAL:
					Utils.dom.addClass( this._root, 'state-normal' );
					this._state = EFormState.NORMAL;
					break;
				case EFormState.MINIMIZED:
					Utils.dom.addClass( this._root, 'state-minimized' );
					this._state = EFormState.MINIMIZED;
					break;
				case EFormState.MAXIMIZED:
					Utils.dom.addClass( this._root, 'state-maximized' );
					this._state = EFormState.MAXIMIZED;
					break;
				case EFormState.FULLSCREEN:
					Utils.dom.addClass( this._root, 'state-fullscreen' );
					this._state = EFormState.FULLSCREEN;
					break;
				case EFormState.CLOSED:
				default:
					Utils.dom.addClass( this._root, 'state-closed' );
					this._state = EFormState.CLOSED;
					break;
			}

			this.onRepaint();

			this.fire( 'state-changed', this, this._state );
		}
	}

	/**
	 * Sets or returns whether the form has a titlebar or not.
	 * NORMAL: Form has a titlebar.
	 * NONE: Form doesn't have a titlebar
	 */
	get borderStyle(): EBorderStyle {
		return this._borderStyle;
	}

	set borderStyle( bStyle: EBorderStyle ) {
		if ( bStyle != this._borderStyle ) {
			Utils.dom.removeClasses( this._root, [ 'border-normal', 'border-none' ] );
			switch ( bStyle ) {
				case EBorderStyle.NORMAL:
					Utils.dom.addClass( this._root, 'border-normal' );
					this._borderStyle = EBorderStyle.NORMAL;
					this._padding.top += UI_Form._theme.titlebarHeight;
					break;
				case EBorderStyle.NONE:
				default:
					Utils.dom.addClass( this._root, 'border-none' );
					this._borderStyle = EBorderStyle.NONE;
					this._padding.top -= UI_Form._theme.titlebarHeight;
					break;
			}
			this.onRepaint();
		}
	}

	/**
	 * Sets weather this form is a normal one, or a MDI form.
	 * MDI forms are typically child forms of other forms, and are not
	 * displayed on OS taskbars.
	 */
	get formStyle(): EFormStyle {
		return this._formStyle;
	}

	set formStyle( fStyle: EFormStyle ) {
		if ( fStyle != this._formStyle ) {
			Utils.dom.removeClasses( this._root, [ 'style-form', 'style-mdi' ] );
			switch ( fStyle ) {
				case EFormStyle.FORM:
					Utils.dom.addClass( this._root, 'style-form' );
					this._formStyle = EFormStyle.FORM;
					break;
				case EFormStyle.MDI:
				default:
					Utils.dom.addClass( this._root, 'style-mdi' );
					this._formStyle = EFormStyle.MDI;
					break;
			}
			this.onRepaint();
		}
	}

	/**
	 * Returns or sets the form placement on the desktop.
	 *
	 * AUTO - The form is placed by it's "left" and "top" anchors.
	 *
	 * CENTER - The form stays always in the center of it's desktop, and it
	 * cannot be dragged from there.
	 */
	get placement(): EFormPlacement {
		return this._placement;
	}

	set placement( fPlacement: EFormPlacement ) {
		if ( fPlacement != this._placement ) {
			Utils.dom.removeClasses( this._root, [ 'placement-auto', 'placement-center' ] );
			switch ( fPlacement ) {
				case EFormPlacement.AUTO:
					Utils.dom.addClass( this._root, 'placement-auto' );
					this._placement = EFormPlacement.AUTO;
					break;
				case EFormPlacement.CENTER:
				default:
					Utils.dom.addClass( this._root, 'placement-center' );
					this._placement = EFormPlacement.CENTER;
					break;
			}
			this.onRepaint();
		}
	}

	/**
	 * Returns or sets the caption ( text displayed in the titlebar ) of the form.
	 */
	get caption(): string {
		return this._caption;
	}

	set caption( cap: string ) {
		if ( cap != this._caption ) {
			this._caption = String( cap || '' );
			this._dom.caption.innerHTML = '';
			this._dom.caption.appendChild( document.createTextNode( this._caption ) );
		}
	}

	/**
	 * Returns or set whether this form is the "active" form on it's desktop or not. There can be only a single
	 * active form at a time in the desktop, which receives the user keystrokes from the UI_DialogManager
	 * and sends them to the focused form control, if any.
	 */
	get active(): boolean {
		return this._active;
	}

	set active( on: boolean ) {
		
		on = !!on;

		if ( on != this._active ) {

			this._active = on;
			if ( this._active ) {
				Utils.dom.addClass( this._root, 'focus-active' );
				this.updateFocusOrder( this._focusOrder = UI_DialogManager.get.zIndexId );
				UI_DialogManager.get.updateZIndex();
			} else {
				Utils.dom.removeClass( this._root, 'focus-active' );
			}
			this.onRepaint();
		}

		if ( this._active ) {
			UI_DialogManager.get.activeWindow = this;
		}
	}

	/**
	 * Returns the list of MDI sub-forms that this form owns.
	 */
	get mdiChildForms(): UI_Form[] {
		return this._mdiForms || null;
	}

	/**
	 * Read-Only. An auto-increment value determined by the UI_DialogManager, used to unique 
	 * identify each window that is opened.
	 */
	get id(): number {
		return this._id;
	}

	/**
	 * @overrides UI.parentClientRect, in order to fix anchor measurements.
	 */
	get parentClientRect(): IRect {
		return this._root.parentNode
			? {
				"width": UI_DialogManager.get.desktop.offsetWidth,
				"height": UI_DialogManager.get.desktop.offsetHeight
			}
			: {
				"width": 0,
				"height": 0
			}
	}

	/**
	 * Setup various events on this form, on it's initialization, like resizing, moving, etc.
	 */
	private _setupEvents_() {
		( function( form ) {
			
			// SETUP FOCUSING
			form.onDOMEvent( form._root, EEventType.MOUSE_DOWN, function( evt: Utils_Event_Mouse ) {

				UI_Screen.get.visible = false;

				if ( form._mdiLocks == 0 ) {
					form.focused = true; 
				} else {
					form.mdiFocusChild();
				}

			}, true );

			// SETUP RESIZING
			var handleNames: string[] = ['n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se' ],
				handleMappings = {
					"n": EResizeType.N,
					"s": EResizeType.S,
					"w": EResizeType.W,
					"e": EResizeType.E,
					"nw": EResizeType.NW,
					"ne": EResizeType.NE,
					"sw": EResizeType.SW,
					"se": EResizeType.SE
				},
			    i: number = 0,
			    len: number = 8,
			    resize = {
			    	"type": EResizeType.NONE,
			    	"prevPoint": {
			    		"x": 0,
			    		"y": 0
			    	}
			    };

			function onResizeRun( evt: Utils_Event_Mouse ) {
				var newX = evt.page.x,
				    newY = evt.page.y,
				    deltaX = resize.prevPoint.x - newX,
				    deltaY = resize.prevPoint.y - newY,
				    width = form.width,
				    height= form.height,
				    top: number = form.top.distance,
				    left: number = form.left.distance;

				if ( deltaX != 0 || deltaY != 0 ) {
					switch ( resize.type ) {
						case EResizeType.N:
							top -= deltaY;
							height += deltaY;
							break;
						case EResizeType.S:
							height -= deltaY;
							break;
						case EResizeType.W:
							left -= deltaX;
							width += deltaX;
							break;
						case EResizeType.E:
							width -= deltaX;
							break;
						case EResizeType.NW:
							top -= deltaY;
							left -= deltaX;
							width += deltaX;
							height += deltaY;
							break;
						case EResizeType.NE:
							top -= deltaY;
							height += deltaY;
							width -= deltaX;
							break;
						case EResizeType.SW:
							left -= deltaX;
							width += deltaX;
							height -= deltaY;
							break;
						case EResizeType.SE:
							width -= deltaX;
							height -= deltaY;
							break;
					}
				}

				form.paintable = false;

				if ( ( width != form._width || left != form._left.distance  ) && width >= form._minWidth ) {
					if ( width != form._width ) {
						form.width = width;
					}
					if ( left != form._left.distance ) {
						form.left.distance = left;
					}

					resize.prevPoint.x = newX;
				}

				if ( ( height != form._height || top != form._top.distance ) && ( height >= form._minHeight ) ) {
					if ( height != form._height ) {
						form.height = height;
					}

					if ( top != form._top.distance ) {
						form.top = top;
					}

					resize.prevPoint.y = newY;
				}

				form.paintable = true;

			}

			for ( i=0; i<len; i++ ) {
				( function( handleName: string ) {

					var handle: any = form._dom[ handleName ];

					form.onDOMEvent( handle, EEventType.MOUSE_DOWN, function( evt: Utils_Event_Mouse ) {
						
						if ( form.formStyle != EFormStyle.FORM || form.state != EFormState.NORMAL /* || form.placement != EFormPlacement.AUTO */ ) {
							// Invalid resize states.
							return;
						}

						if ( form._mdiLocks > 0 ) {
							form.runAnimation( EFormAnimation.BLINK );
							return;
						}

						resize.type = handleMappings[ handleName ];
						resize.prevPoint.x = evt.page.x;
						resize.prevPoint.y = evt.page.y;

						var mouseMove: Utils_Event_Unbinder = form.onDOMEvent( document.body, EEventType.MOUSE_MOVE, onResizeRun, true );
						
						form.onDOMEvent( document.body, EEventType.MOUSE_UP, function() {
							mouseMove.remove();
							mouseMove = undefined;
						}, true, true );

					}, true );

				} )( handleNames[i] );
			}

			// SETUP MOVING ( DRAGGING )

			var move: IPoint = {
				"x": 0,
				"y": 0
			};

			function onMoveRun( evt: Utils_Event_Mouse ) {

				var left: number = form._left.distance,
				    top : number = form._top.distance,
				    newX: number = evt.page.x,
				    newY: number = evt.page.y,
				    deltaX: number = move.x - newX,
				    deltaY: number = move.y - newY,
				    i: number,
				    len: number = form._mdiForms.length;

				if ( deltaX != 0 || deltaY != 0 ) {
					
					left -= deltaX;
					top  -= deltaY;

					form.paintable = false;
					form._disableChildPainting = true;

					form.left.distance = left;
					form.top.distance = top;

					form.paintable = true;

					form.onRepaint();

					for ( i=0; i<len; i++ ) {
						form._mdiForms[i]._disableChildPainting = true;
						form._mdiForms[i].onRepaint();
						form._mdiForms[i]._disableChildPainting = false;
					}

					form._disableChildPainting = false;

					move.x = newX;
					move.y = newY;
				}
			}

			form.onDOMEvent( form._dom.caption, EEventType.MOUSE_DOWN, function( evt: Utils_Event_Mouse ) {

				if ( form.state != EFormState.NORMAL || form.placement != EFormPlacement.AUTO ) {
					// invalid move states
					return;
				}

				move.x = evt.page.x;
				move.y = evt.page.y;

				var mouseMove: Utils_Event_Unbinder = form.onDOMEvent( document.body, EEventType.MOUSE_MOVE, onMoveRun, true );

				form.onDOMEvent( document.body, EEventType.MOUSE_UP, function( evt: Utils_Event_Mouse ) {
					mouseMove.remove();
					mouseMove = undefined;
				}, true, true );
				
			}, true );

			// SETUP MAXIMIZATION ON CAPTION DOUBLECLICK
			form.onDOMEvent( form._dom.caption, EEventType.DBLCLICK, function( evt: Utils_Event_Mouse ) {
				if ( form.formStyle == EFormStyle.FORM ) {

					if ( form._mdiLocks == 0 ) {

						if ( form.state == EFormState.NORMAL ) {
							form.state = EFormState.MAXIMIZED;
						} else
						if ( form.state == EFormState.MAXIMIZED ) {
							form.state = EFormState.NORMAL;
						}

					} else {

						form.runAnimation( EFormAnimation.BLINK );
						return;

					}

				}

			}, true );

			form.onDOMEvent( form._dom.btnMinimize, EEventType.CLICK, function( evt: Utils_Event_Mouse ) {

				if ( form.formStyle != EFormStyle.MDI && form.state != EFormState.MINIMIZED ) {

					if ( form._mdiLocks == 0 ) {

						form.state = EFormState.MINIMIZED;

					} else {

						form.runAnimation( EFormAnimation.BLINK );
						return;

					}
				}
			}, true );

			form.onDOMEvent( form._dom.btnMaximize, EEventType.CLICK, function( evt: Utils_Event_Mouse ) {

				if ( form.formStyle != EFormStyle.MDI ) {

					if ( form._mdiLocks == 0 ) {

						switch ( form.state ) {
							case EFormState.MAXIMIZED:
								form.state = EFormState.NORMAL;
								break;
							case EFormState.NORMAL:
								form.state = EFormState.MAXIMIZED;
								break;
						}
					} else {
						form.runAnimation( EFormAnimation.BLINK );
						return;
					}
				}

			}, true );

			form.onDOMEvent( form._dom.btnClose, EEventType.CLICK, function( evt: Utils_Event_Mouse ) {
				if ( form.onClose() ) {
					if ( form._mdiLocks == 0 ) {
						form.close();
					} else {
						form.runAnimation( EFormAnimation.BLINK );
						return;
					}
				}
			}, true );

			form.on( 'child-inserted', function( node: UI ) {
				form.onChildInserted( node );
			} );

			form.on('child-removed', function(node: UI) {
				form.onChildRemoved(node);
			});

			form.on( 'child-keydown', function( evt: Utils_Event_Keyboard ) {
				
				var key = evt.code,
				    handled: boolean = false;

				switch ( key ) {
						// F10:
						case Utils.keyboard.KB_F10:
							if ( form.menuBar ) {
								form.activeElement = form.menuBar;
								handled = true;
								break;
							}

						break;

					default:
						break;
				}

				if ( handled ) {
					evt.preventDefault();
					evt.stopPropagation();
					evt.handled = true;
				}

			} );

			form._mdiChildStateChangedHandler = function( child: UI_Form, state: EFormState ) {
				form.onMDIChildStateChanged( child, state );
			};

		} )( this );
	}

	/**
	 * Returns the clientRect of the form.
	 */
	get clientRect(): IRect {
		// if seems that for the UI_Form it's better to rely on browser
		// info, even if it's more CPU demanding.
		return {
			"width": this._dom.body.offsetWidth,
			"height": this._dom.body.offsetHeight
		}
	}

	/**
	 * Forms are painted "translated", in order to properly place them on the desktop,
	 * taking in consideration it's border decoration.
	 */
	get translateLeft(): number {
		return this.padding.left;
	}

	/**
	 * Forms are painted "translated", in order to properly place them on the desktop,
	 * taking in consideration it's border decoration.
	 */
	get translateTop(): number {
		return this.padding.top;
	}

	/**
	 * Function that, when the "close" button of the form is pressed, returns
	 * true for closing the form, or false for canceling the closing of the form.
	 */
	public onClose(): boolean {
		return this._mdiLocks > 0 ? false : true;
	}

	/**
	 * @overrides UI.insertDOMNode
	 */
	protected insertDOMNode( node: UI ): UI {
		if ( node._root ) {
			this._dom.body.appendChild( node._root );
		}
		return node;
	}

	/**
	 * Returns the focused (active) element of this form. The mixin MFocusable is playing
	 * with this property, and should not be overrided by the programmer.
	 */
	get activeElement(): UI {
		return this._activeElement;
	}

	set activeElement( node: UI ) {
		if ( ( node || null ) != this._activeElement ) {
			
			var prevElement: UI = this._activeElement || null;

			this._activeElement = node || null;

			if ( prevElement ) {
				prevElement.fire( 'blur' );
			}

			if ( this._activeElement )
				this._activeElement.fire( 'focus' );
		}
	}

	/**
	 * When a focusable element is inserted inside the form, that element is registered
	 * to the form focus group. When the tab key is pressed by the user, only the registered VISIBLE
	 * elements in the form's focus group are took in consideration.
	 *
	 * This property always returns the list in a sorted manner, based on the component's tabIndex.
	 */
	get focusGroup(): UI[] {
		var result: UI[] = [];
		for ( var i=0, len = this._focusComponents.length; i<len; i++ ) {
			if ( !this._focusComponents[i].disabled && this._focusComponents[i].visible && (<MFocusable>this._focusComponents[i]).includeInFocus ) {
				result.push( this._focusComponents[i] );
			}
		}

		result.sort( function( a, b ) {
			return ~~a['tabIndex'] - ~~b['tabIndex'];
		} );

		return result;
	}

	/**
	 * Returns a non-sorted focusGroup of the form.
	 */
	get focusComponents(): UI[] {
		return this._focusComponents;
	}

	/**
	 * This method is fired each time a component is inserted on this form (here we hook registration
	 * to focusGroup, etc. ).
	 */
	protected onChildInserted( node: UI ) {

		var nodes: UI[],
		    i: number,
		    len: number;

		if ( node ) {

			if ( node.implements( 'IFocusable' ) ) {

				if ( this._focusComponents.indexOf( node ) == -1 ) {
					this._focusComponents.push( node );
				}

			}

			if ( nodes = node.childNodes ) {
				
				for (i = 0, len = nodes.length; i < len; i++ ) {
					this.onChildInserted(nodes[i]);
				}
			}
		}

	}

	/**
	 * This method is fired each time a component is removed from this form (in order to properly unregister
	 * the component from the form focus group, for example ).
	 */
	protected onChildRemoved( node: UI ) {

		var index: number,
		    nodes: UI[],
		    i: number,
		    len: number;

		if ( node ) {
			if ( nodes = node.childNodes ) {
				for (i = 0, len = nodes.length; i < len; i++ ) {
					this.onChildRemoved(nodes[i]);
				}
			}

			if ( node.implements( 'IFocusable' ) ) {
				if ( node['active'] ) {
					node.fire('blur');
				}
				if ( ( index = this._focusComponents.indexOf( node ) ) != -1 ) {
					this._focusComponents.splice(index, 1);
				}
			}
		}
	}

	/** 
	 * @overrides the "UI.insert"
	 *
	 * inserts an UI element inside the current Form.
	 */
	public insert( child: UI ): UI {

		var i: number,
		    len: number;

		if ( !child )
			throw Error( 'Cannot insert a NULL element.' );

		switch ( true ) {

			case child instanceof UI_MenuBar:

				// We make the menubar a component of the form
				this.menuBar = <UI_MenuBar>child;

				if ( this._parentsDisabled + ~~this._disabled ) {
					// set the disabled state
					child.onParentDisableStateChange( this._parentsDisabled + ~~this._disabled );
				}

				// We DO NOT add this node as a child of the dialog, but we add this to the _focusComponents.
				for ( i=0, len = this._focusComponents.length; i<len; i++ ) {
					if ( this._focusComponents[i] instanceof UI_MenuBar ) {
						this._focusComponents.splice(i,1);
						break;
					}
				}

				this._focusComponents.push( child );

				return child;

				break;

			case child instanceof UI_Popup:
				
				// we do not insert the UI_Popup inside the form.

				child.owner = this;
				return child;
				break;

			default:
				return super.insert( child );
				break;
		}

	}

	/**
	 * Gets or sets the disabled state of the form. When a form is disabled, all it's components
	 * become disabled too.
	 */
	get disabled(): boolean {
		return this._disabled || this._parentsDisabled > 0;
	}

	set disabled( on: boolean ) {
		on = !!on;

		if ( on != this._disabled ) {
			this._disabled = on;

			if ( this._root ) {
				if ( this.disabled ){
					Utils.dom.addClass( this._root, 'disabled' );
				} else {
					Utils.dom.removeClass( this._root, 'disabled' );
				}
			}

			if ( this._children ) {
				for ( var i=0, len = this._children.length; i<len; i++ ) {
					this._children[i].onParentDisableStateChange( on ? 1 : -1 );
				}
			}

			if ( this._menuBar ) {
				this._menuBar.onParentDisableStateChange( on ? 1 : -1 );
			}

			// fire a disabled event, that might be treated by the mixins this
			// object is embracing.
			this.fire( 'disabled', on );
		}
	}

	/**
	 * Returns the owner form ( Parent Form ) of this one.
	 */
	get mdiParent(): UI_Form {
		return this._mdiParent;
	}

	set mdiParent( parent: UI_Form ) {
		parent = parent || null;
		
		if ( parent != this._mdiParent ) {

			if ( this._mdiParent ) {
				this._mdiParent.removeMDIChild( this );
			}

			this._mdiParent = parent;

			if ( parent ) {
				this._mdiParent.addMDIChild( this );
			}

		}
	}

	/**
	 * Each times a child form registers to this form as it's mdi child, this method is triggered.
	 */
	protected addMDIChild( form: UI_Form ) {
		
		if ( form && this._mdiForms.indexOf( form ) == -1 ) {
			
			this._mdiForms.push( form );
			
			if ( form.modal ) {
				this.mdiParentLock();
			}

			if ( this._mdiForms.length == 1 ) {
				Utils.dom.addClass( this._root, 'mdi-parent' );
			}

			form.on( 'state-changed', this._mdiChildStateChangedHandler );
		}

	}

	/**
	 * Each time a previously registered sub form (mdi child) unregisters from the list of mdi children
	 * of this form, this method is fired.
	 */
	protected removeMDIChild( form: UI_Form ) {
		var index: number = 0;

		if ( form && ( index = this._mdiForms.indexOf( form ) ) > -1 ) {
			
			if ( form.modal ) {
				this.mdiParentUnlock();
			}

			this._mdiForms.splice( index, 1 );

			form.off( 'state-changed', this._mdiChildStateChangedHandler );

			if ( this._mdiForms.length == 0 ) {
				Utils.dom.removeClass( this._root, 'mdi-parent' );
			}
		}
	}

	/**
	 * Returns TRUE if a sub-form is a mdi child of this form.
	 */
	protected containsMDIChild( form: UI_Form ): boolean {
		for ( var i=0, len = this._mdiForms.length; i<len; i++ ) {
			if ( this._mdiForms[i] == form || this._mdiForms[i].containsMDIChild( form ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Fired by a mdi child on this form, when it's state is changed.
	 */
	protected onMDIChildStateChanged( child: UI_Form, newChildState: EFormState ) {
		console.log( 'MDI Child state changed: ', child.caption, 'state', newChildState );
	}

	/**
	 * Put a MDI lock on this form. Called by a mdi sub-form. When the form has MDI locks,
	 * it ignores user keyboard and pointer events, until it becomes unlocked again.
	 */
	protected mdiParentLock() {
		this._mdiLocks += 1;

		if ( this._mdiLocks == 1 ) {
			Utils.dom.addClass( this._root, 'mdi-locked' );
		}

		if ( this.mdiParent ) {
			this.mdiParent.mdiParentLock();
		}
	}

	/**
	 * Cancels one MDI lock on this form, previously placed with mdiParentLock.
	 */
	protected mdiParentUnlock() {
		if ( this._mdiLocks > 0 ) {
			
			this._mdiLocks--;
			
			if ( this._mdiLocks == 0 ) {
				Utils.dom.removeClass( this._root, 'mdi-locked' );
			}

			if ( this.mdiParent ) {
				this.mdiParent.mdiParentUnlock();
			}
		}
	}

	/**
	 * Recursively adds the "mdi-active" class on the root element of this
	 * form and to the mdi parents of this forms. This is needed for form css
	 * styling.
	 */
	protected mdiFocusChain() {
		
		Utils.dom.addClass( this._root, 'mdi-active' );

		if ( this.mdiParent ) {
			this.mdiParent.mdiFocusChain();
		}
	}

	/**
	 * Recursively removes the "mdi-active" class on the root element of this
	 * form and it's mdi parents. Needed for CSS styling.
	 */
	protected mdiUnfocusChain() {
		
		Utils.dom.removeClass( this._root, 'mdi-active' );

		if ( this.mdiParent ) {
			this.mdiParent.mdiUnfocusChain();
		}

	}

	/**
	 * When the user attempts to focus a locked MDI form, this method is triggered,
	 * in order to focus it's first MDI modal child instead.
	 */
	public mdiFocusChild() {

		for ( var i=0, len = this._mdiForms.length; i<len; i++ ) {
			if ( this._mdiForms[i].modal ) {
				this._mdiForms[i].mdiFocusChild();
				return;
			}
		}

		this.active = true;

	}

	/**
	 * Gets or sets if this form is modal. If a form is modal and is a MDI child, it blocks
	 * it's parent keyboard and pointer events.
	 */
	get modal(): boolean {
		return this._modal;
	}

	set modal( modal: boolean ) {
		modal = !!modal;
		if ( modal != this._modal ) {
			this._modal = modal;
			if ( modal ) {
				if ( this.mdiParent )
					this.mdiParent.mdiParentLock();
			} else {
				if ( this.mdiParent ) {
					this.mdiParent.mdiParentUnlock();
				}
			}
		}
	}

	/**
	 * Runs a form animation, in order to attract user attention on this form.
	 */
	public runAnimation( type: EFormAnimation ) {

		Utils.dom.removeClass( this._root, 'animation-shake' );
		Utils.dom.removeClass( this._root, 'animation-blink' );

		switch ( type ) {

			case EFormAnimation.SHAKE:
				
				( function( self ) {

					Utils.dom.addClass( self._root, 'animation-shake' );

					setTimeout( function() {
						Utils.dom.removeClass( self._root, 'animation-shake' );
					}, 1500 );

				} )( this );

				break;

			case EFormAnimation.BLINK:
				
				( function( self ) {

					Utils.dom.addClass( self._root, 'animation-blink' );

					setTimeout( function() {
						Utils.dom.removeClass( self._root, 'animation-blink' );
					}, 1500 );

				} )( this );

				break;
		}
	}

	/**
	 * Gets or sets the zIndex of this form. This property is automatically handled by the UI_DialogManager,
	 * and should not be handled by the programmer.
	 */ 
	get zIndex(): number {
		return this._zIndex;
	}

	set zIndex( index: number ) {
		index = ~~index || 1;
		if ( index < 1 ) {
			index = 1;
		}
		if ( index != this._zIndex ) {
			this._zIndex = index;
			this._root.style.zIndex = String( index );
		}
	}

	/**
	 * Property needed by the UI_DialogManager, in order to know how to properly set the zIndex of the
	 * form.
	 */
	get focusOrder(): number {
		return this._focusOrder;
	}

	/**
	 * If this form is a MDI child form (has a master form), when the focus order of this
	 * child changes, it is propagated to the parents of this form too.
	 */
	protected updateFocusOrder( order: number ) {
		if ( this._mdiParent ) {
			this._mdiParent['_focusOrder'] = order;
		}
	}

	/**
	 * Force a layout computing on all elements of type UI declared as properties on this form,
	 * if they have a layoutType != ELayoutType.NONE.
	 */
	public fullRelayout() {
		
		var property: string;
		
		if ( this.layoutType != ELayoutType.NONE ) {
			this.layout.compute();
		}

		for ( property in this ) {
			if ( this[property] && this[property] instanceof UI ) {
				if ( this[property].layoutType != ELayoutType.NONE ) {
					this[property].layout.compute();
				}
			}
		}
	}

}

Constraint.registerClass({
	"name": "UI_Form",
	"extends": "UI",
	"properties": [
		{
			"name": "state",
			"type": "enum:EFormState"
		},
		{
			"name": "borderStyle",
			"type": "enum:EBorderStyle"
		},
		{
			"name": "placement",
			"type": "enum:EFormPlacement"
		},
		{
			"name": "formStyle",
			"type": "enum:EFormStyle"
		},
		{
			"name": "caption",
			"type": "string"
		},
		{
			"name": "active",
			"type": "boolean"
		},
		{
			"name": "modal",
			"type": "boolean"
		}
	]
});