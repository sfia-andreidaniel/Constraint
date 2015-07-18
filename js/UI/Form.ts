/* A form is a dialog in UI Concepts.
 */
class UI_Form extends UI implements IFocusable {
	
	public static _autoID: number = 0;

	public static _theme = {
		"borderWidth": $I.number('UI.UI_Form/border.width'),
		"titlebarHeight": $I.number('UI.UI_Form/titlebar.height')
	};

	// MINIMIZED, MAXIMIZED, CLOSED, NORMAL
	protected _state: EFormState = EFormState.NORMAL;
	
	// Weather it has a titlebar or not. NONE: window decorations aren't displayed.
	protected _borderStyle: EBorderStyle = EBorderStyle.NORMAL;

	// Weather it is a FORM or a MDI form. MDI Forms aren't minimizable, maximizable or resizable.
	protected _formStyle: EFormStyle = EFormStyle.FORM;

	// Form placement on desktop. If CENTER, also the form is not "drag'n droppable".
	protected _placement: EFormPlacement = EFormPlacement.AUTO;

	// Form title
	protected _caption: string = '';

	// Weather form is focused or not
	protected _active: boolean = false;

	// Internal, representing the ID of the form
	protected _id: number = 0;

	// each object that embraces the IFocusable interface that is child of this form
	// is stored here, in order to implement the tab focusing.
	protected _focusComponents: UI[] = [];

	// the current element that's active in a form at a single time.
	protected _activeElement: UI = null;

	// these are not considered but declared for the sake of IFocusable
	public wantTabs: boolean;
	public tabIndex: number;

	private   _dom = {
		"inner": UI_Dom.create( 'div', 'inner' ),
		"body": UI_Dom.create('div', 'body'),
		"titlebar": UI_Dom.create('div', 'titlebar'),
		"caption": UI_Dom.create('div', 'caption' ),
		"buttons": UI_Dom.create( 'div', 'buttons' ),
		"n": UI_Dom.create('div', 'resizer n' ),
		"s": UI_Dom.create('div', 'resizer s' ),
		"w": UI_Dom.create('div', 'resizer w' ),
		"e": UI_Dom.create('div', 'resizer e' ),
		"nw": UI_Dom.create( 'div', 'resizer nw' ),
		"ne": UI_Dom.create( 'div', 'resizer ne' ),
		"sw": UI_Dom.create( 'div', 'resizer sw' ),
		"se": UI_Dom.create( 'div', 'resizer se' ),
		"btnClose": UI_Dom.create('div', 'button close' ),
		"btnMinimize": UI_Dom.create( 'div', 'button minimize' ),
		"btnMaximize": UI_Dom.create( 'div', 'button maximize' )
	};

	// Form constructor.
	constructor( ) {
		super( null );

		this._top     = new UI_Anchor_Form( this, EAlignment.TOP );
		this._left    = new UI_Anchor_Form( this, EAlignment.LEFT );
		this._right   = new UI_Anchor_Form( this, EAlignment.RIGHT );
		this._bottom  = new UI_Anchor_Form( this, EAlignment.BOTTOM );

		this._root = UI_Dom.create( 'div', 'ui UI_Form state-normal border-normal style-form placement-auto' );
		this._root.tabIndex = 0; // make the window focusable.

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

		( function( self ) {

			self.on( 'child-inserted', function( node: UI ) {
				self.onChildInserted( node );
			} );

		} )( this );

	}

	// returns an element defined on this instance.
	// the element must extend the UI interface
	public getElementByName( elementName ): UI {
		if (typeof this[ elementName ] != 'undefined' && this[ elementName ] instanceof UI ) {
			return <UI>this[ elementName ];
		} else {
			return null;
		}
	}

	// @ UI.form
	get form(): UI_Form {
		return this;
	}

	/* The open method appends the form's element into the DialogManager desktop ( which by
	   default is document.body ) in order to make the form visible.
	 */
	public open( ) {
		UI_DialogManager.get().desktop.appendChild( this._root );
		this.onRepaint();
		UI_DialogManager.get().onWindowOpened( this );
	}

	/* Closes the form  (removes it from Dialog Manager's desktop)
	 */
	public close() {
		
		if ( this._root.parentNode ) {
			this._root.parentNode.removeChild( this._root );
		}

		this._state = EFormState.CLOSED;

		UI_DialogManager.get().onWindowClosed( this );
	}

	/* Returns the state of the form, which can be: MINIMIZED, MAXIMIZED, CLOSED, 
	   or FULLSCREEN 
	 */
	get state(): EFormState {
		return this._state;
	}

	set state( state: EFormState ) {
		if ( state != this._state ) {

			UI_Dom.removeClasses( this._root, [ 'state-normal', 'state-minimized', 'state-maximized', 'state-fullscreen', 'state-closed' ] );

			switch ( state ) {
				case EFormState.NORMAL:
					UI_Dom.addClass( this._root, 'state-normal' );
					this._state = EFormState.NORMAL;
					break;
				case EFormState.MINIMIZED:
					UI_Dom.addClass( this._root, 'state-minimized' );
					this._state = EFormState.MINIMIZED;
					break;
				case EFormState.MAXIMIZED:
					UI_Dom.addClass( this._root, 'state-maximized' );
					this._state = EFormState.MAXIMIZED;
					break;
				case EFormState.FULLSCREEN:
					UI_Dom.addClass( this._root, 'state-fullscreen' );
					this._state = EFormState.FULLSCREEN;
					break;
				case EFormState.CLOSED:
				default:
					UI_Dom.addClass( this._root, 'state-closed' );
					this._state = EFormState.CLOSED;
					break;
			}

			this.onRepaint();
		}
	}

	/* Sets weather the form has a titlebar or not.
	   NORMAL: Form has a titlebar.
	   NONE: Form doesn't have a titlebar
	 */
	get borderStyle(): EBorderStyle {
		return this._borderStyle;
	}

	set borderStyle( bStyle: EBorderStyle ) {
		if ( bStyle != this._borderStyle ) {
			UI_Dom.removeClasses( this._root, [ 'border-normal', 'border-none' ] );
			switch ( bStyle ) {
				case EBorderStyle.NORMAL:
					UI_Dom.addClass( this._root, 'border-normal' );
					this._borderStyle = EBorderStyle.NORMAL;
					this._padding.top = UI_Form._theme.titlebarHeight;
					break;
				case EBorderStyle.NONE:
				default:
					UI_Dom.addClass( this._root, 'border-none' );
					this._borderStyle = EBorderStyle.NONE;
					this._padding.top = 0;
					break;
			}
			this.onRepaint();
		}
	}

	/* Sets weather this form is a normal one, or a MDI form.
	   MDI forms are typically child forms of other forms, and usually are not
	   displayed on OS taskbars.
	 */
	get formStyle(): EFormStyle {
		return this._formStyle;
	}

	set formStyle( fStyle: EFormStyle ) {
		if ( fStyle != this._formStyle ) {
			UI_Dom.removeClasses( this._root, [ 'style-form', 'style-mdi' ] );
			switch ( fStyle ) {
				case EFormStyle.FORM:
					UI_Dom.addClass( this._root, 'style-form' );
					this._formStyle = EFormStyle.FORM;
					break;
				case EFormStyle.MDI:
				default:
					UI_Dom.addClass( this._root, 'style-mdi' );
					this._formStyle = EFormStyle.MDI;
					break;
			}
			this.onRepaint();
		}
	}

	/* Returns the form placement on the desktop.
	   AUTO - The form is placed by it's "left" and "top" anchors.
	   CENTER - The form stays always in the center of it's desktop, and it
	            cannot be dragged from there.
	 */
	get placement(): EFormPlacement {
		return this._placement;
	}

	set placement( fPlacement: EFormPlacement ) {
		if ( fPlacement != this._placement ) {
			UI_Dom.removeClasses( this._root, [ 'placement-auto', 'placement-center' ] );
			switch ( fPlacement ) {
				case EFormPlacement.AUTO:
					UI_Dom.addClass( this._root, 'placement-auto' );
					this._placement = EFormPlacement.AUTO;
					break;
				case EFormPlacement.CENTER:
				default:
					UI_Dom.addClass( this._root, 'placement-center' );
					this._placement = EFormPlacement.CENTER;
					break;
			}
			this.onRepaint();
		}
	}

	/* Sets the caption ( text displayed as title in the titlebar ) of the form.
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

	/* Weather this form is the "active" form on it's desktop or not
	 */
	get active(): boolean {
		return this._active;
	}

	set active( on: boolean ) {
		on = !!on;
		if ( on != this._active ) {
			this._active = on;
			if ( this._active ) {
				UI_Dom.addClass( this._root, 'focus-active' );
			} else {
				UI_Dom.removeClass( this._root, 'focus-active' );
			}
		}

		if ( this._active ) {
			UI_DialogManager.get().activeWindow = this;
		}
	}

	/* Read-Only. An auto-increment value, used to unique identify each window
	 */
	get id(): number {
		return this._id;
	}

	/* @UI.parentClientRect
	 */
	get parentClientRect(): IRect {
		return this._root.parentNode
			? {
				"width": UI_DialogManager.get().desktop.offsetWidth,
				"height": UI_DialogManager.get().desktop.offsetHeight
			}
			: {
				"width": 0,
				"height": 0
			}
	}

	/* Private. Setup up the DOM events of the form */
	private _setupEvents_() {
		( function( form ) {
			
			// SETUP FOCUSING
			form._root.addEventListener( 'mousedown', function() {
				form.focused = true; 
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

			function onResizeRun( evt ) {
				var newX = evt.clientX || evt.pageX,
				    newY = evt.clientY || evt.pageY,
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

			function onResizeEnd( evt ) {
				document.body.removeEventListener( 'mousemove', onResizeRun, true );
				document.body.removeEventListener( 'mouseup',   onResizeEnd, true );
			}

			for ( i=0; i<len; i++ ) {
				( function( handleName: string ) {

					var handle: any = form._dom[ handleName ];

					handle.addEventListener( 'mousedown', function( evt ) {
						
						if ( form.formStyle != EFormStyle.FORM || form.state != EFormState.NORMAL /* || form.placement != EFormPlacement.AUTO */ ) {
							// Invalid resize states.
							return;
						}

						resize.type = handleMappings[ handleName ];
						resize.prevPoint.x = evt.clientX || evt.pageX;
						resize.prevPoint.y = evt.clientY || evt.pageY;

						document.body.addEventListener( 'mousemove', onResizeRun, true );
						document.body.addEventListener( 'mouseup',   onResizeEnd, true );

					}, true );

				} )( handleNames[i] );
			}

			// SETUP MOVING ( DRAGGING )

			var move: IPoint = {
				"x": 0,
				"y": 0
			};

			function onMoveRun( evt ) {

				var left: number = form._left.distance,
				    top : number = form._top.distance,
				    newX: number = evt.clientX || evt.pageX,
				    newY: number = evt.clientY || evt.pageY,
				    deltaX: number = move.x - newX,
				    deltaY: number = move.y - newY;

				if ( deltaX != 0 || deltaY != 0 ) {
					
					left -= deltaX;
					top  -= deltaY;

					form.paintable = false;

					form.left.distance = left;
					form.top.distance = top;

					form.paintable = true;

					form.onRepaint();

					move.x = newX;
					move.y = newY;
				}
			}

			function onMoveEnd( evt ) {
				document.body.removeEventListener( 'mousemove', onMoveRun, true );
				document.body.removeEventListener( 'mouseup',   onMoveEnd, true );
			}

			form._dom.caption.addEventListener( 'mousedown', function( evt ) {
				if ( form.state != EFormState.NORMAL || form.placement != EFormPlacement.AUTO ) {
					// invalid move states
					return;
				}

				move.x = evt.clientX || evt.pageX;
				move.y = evt.clientY || evt.pageY;

				document.body.addEventListener( 'mousemove', onMoveRun, true );
				document.body.addEventListener( 'mouseup',   onMoveEnd, true );

			}, true );

			// SETUP MAXIMIZATION ON CAPTION DOUBLECLICK
			form._dom.caption.addEventListener( 'dblclick', function( evt ) {

				if ( form.formStyle == EFormStyle.FORM ) {

					if ( form.state == EFormState.NORMAL ) {
						form.state = EFormState.MAXIMIZED;
					} else
					if ( form.state == EFormState.MAXIMIZED ) {
						form.state = EFormState.NORMAL;
					}

				}

			}, true );

			form._dom.btnMinimize.addEventListener( 'click', function() {
				if ( form.formStyle != EFormStyle.MDI && form.state != EFormState.MINIMIZED ) {
					form.state = EFormState.MINIMIZED;
				}
			}, true );

			form._dom.btnMaximize.addEventListener( 'click', function() {
				if ( form.formStyle != EFormStyle.MDI ) {
					switch ( form.state ) {
						case EFormState.MAXIMIZED:
							form.state = EFormState.NORMAL;
							break;
						case EFormState.NORMAL:
							form.state = EFormState.MAXIMIZED;
							break;
					}
				}
			}, true );

			form._dom.btnClose.addEventListener( 'click', function() {
				if ( form.onClose() ) {
					form.close();
				}
			}, true );

		} )( this );
	}

	/* @UI.clientRect */
	get clientRect(): IRect {
		// if seems that for the UI_Form it's better to rely on browser
		// info, even if it's more CPU demanding.
		return {
			"width": this._dom.body.offsetWidth,
			"height": this._dom.body.offsetHeight
		}
	}

	/* @UI.translateLeft */
	get translateLeft(): number {
		return this.padding.left;
	}

	/* @UI.translateTop */
	get translateTop(): number {
		return this.padding.top;
	}

	/* Function that, when the "close" button of the form is pressed, returns
	   true for closing the form, or false for canceling the closing of the form.
	 */
	public onClose(): boolean {
		return true;
	}

	/* @UI.insertDOMNode */
	protected insertDOMNode( node: UI ): UI {
		if ( node._root ) {
			this._dom.body.appendChild( node._root );
		}
		return node;
	}

	get activeElement(): UI {
		return this._activeElement;
	}

	set activeElement( node: UI ) {
		if ( ( node || null ) != this._activeElement ) {
			
			if ( this._activeElement ) {
				this._activeElement.fire( 'blur' );
			}

			this._activeElement = node || null;
		}
	}

	/* Returns the registered to focus components, sorted by their tabIndex property */
	get focusGroup(): UI[] {
		var result: UI[] = [];
		for ( var i=0, len = this._focusComponents.length; i<len; i++ ) {
			if ( !this._focusComponents[i].disabled ) {
				result.push( this._focusComponents[i] );
			}
		}

		result.sort( function( a, b ) {
			return ~~a['tabIndex'] - ~~b['tabIndex'];
		} );

		return result;
	}

	protected onChildInserted( node: UI ) {

		var found: boolean = false;

		if ( node ) {

			if ( node.implements( 'IFocusable' ) ) {

				if ( this._focusComponents.indexOf( node ) == -1 ) {
					this._focusComponents.push( node );
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
		}
	]
});