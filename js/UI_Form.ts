/* A form is a dialog in UI Concepts.
 */
class UI_Form extends UI {
	
	// MINIMIZED, MAXIMIZED, CLOSED, NORMAL
	protected _state: EFormState = EFormState.NORMAL;
	
	// Weather it has a titlebar or not
	protected _borderStyle: EBorderStyle = EBorderStyle.NORMAL;

	// Weather it is resizable or not
	protected _formStyle: EFormStyle = EFormStyle.FORM;

	// Moveable or not?
	protected _position: EFormPosition = EFormPosition.AUTO;

	constructor( ) {
		super( null );
		this._root = document.createElement( 'div' );
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
}