/* A form is a dialog in UI Concepts.
 */
class UI_Form extends UI {
	
	public static _autoID: number = 0;

	public static _theme = {
		"borderWidth": $I.number('UI.UI_Form/border.width'),
		"titlebarHeight": $I.number('UI.UI_Form/titlebar.height')
	};

	// MINIMIZED, MAXIMIZED, CLOSED, NORMAL
	protected _state: EFormState = EFormState.NORMAL;
	
	// Weather it has a titlebar or not
	protected _borderStyle: EBorderStyle = EBorderStyle.NORMAL;

	// Weather it is resizable or not
	protected _formStyle: EFormStyle = EFormStyle.FORM;

	// Moveable or not?
	protected _placement: EFormPlacement = EFormPlacement.AUTO;

	protected _caption: string = '';

	protected _focused: boolean = false;

	protected _id: number = 0;

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
		"se": UI_Dom.create( 'div', 'resizer se' )
	};

	// Form constructor.
	constructor( ) {
		super( null );

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

		this.caption = this._caption;

		UI_Form._autoID++;

		this._id = UI_Form._autoID;

		this._root.setAttribute( 'data-role', 'UI_Form' );
		this._root.setAttribute( 'data-form-id', String( this._id ) );

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

	get form(): UI_Form {
		return this;
	}

	// Makes the root element of the form a child of a DOM element.
	// This is needed in order to make the form available to the browser.
	public open( ) {
		UI_DialogManager.get().desktop.appendChild( this._root );
		this.onRepaint();
		UI_DialogManager.get().onWindowOpened( this );
	}

	// Closes the window. Removes it from DOM and from DialogManager.
	public close() {
		
		if ( this._root.parentNode ) {
			this._root.parentNode.removeChild( this._root );
		}

		UI_DialogManager.get().onWindowClosed( this );
	}

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
					break;
				case EBorderStyle.NONE:
				default:
					UI_Dom.addClass( this._root, 'border-none' );
					this._borderStyle = EBorderStyle.NONE;
					break;
			}
			this.onRepaint();
		}
	}

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

	get focused(): boolean {
		return this._focused;
	}

	set focused( on: boolean ) {
		on = !!on;
		if ( on != this._focused ) {
			this._focused = on;
			if ( this._focused ) {
				UI_Dom.addClass( this._root, 'focused' );
			} else {
				UI_Dom.removeClass( this._root, 'focused' );
			}
		}

		if ( this._focused ) {
			UI_DialogManager.get().activeWindow = this;
		}
	}

	get id(): number {
		return this._id;
	}

	get parentClientRect(): IRect {
		return this._root.parentNode
			? {
				"width": document.body.offsetWidth,
				"height": document.body.offsetHeight
			}
			: {
				"width": 0,
				"height": 0
			}
	}

	private _setupEvents_() {
		( function( form ) {
			
			form._root.addEventListener( 'mousedown', function() {
				form.focused = true; 
			}, true );

		} )( this );
	}

}

