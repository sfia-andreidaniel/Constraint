/**
 * An UI_Label is a single-line arbitrary placed text in a form. It is typically
 * placed near text inputs or other input types, as a hint of what the neighbour
 * input is doing.
 *
 */
class UI_Label extends UI {
	
	public static _theme = {
		"defaultWidth": $I.number('UI.UI_Label/width'),
		"defaultHeight": $I.number('UI.UI_Label/height')
	}

	protected _dom = {
		caption: Utils.dom.create( 'div', 'label' )
	};

	protected _caption: string = 'Label';
	protected _target: string;
	
	constructor( owner: UI ) {
		super( owner );
	    this._root = Utils.dom.create( 'div', 'ui UI_Label ta-left' );
		this._root.appendChild( this._dom.caption );
		this._dom.caption.appendChild( document.createTextNode( this._caption ) );

		this._width = UI_Label._theme.defaultWidth;
		this._height = UI_Label._theme.defaultHeight;

		this._setupEvents_();
	}

	get caption(): string {
		return this._caption;
	}

	set caption( cap: string ) {
		cap = String( cap || '' );
		if ( cap != this._caption ) {
			this._caption = cap;
			this._dom.caption.innerHTML = '';
			this._dom.caption.appendChild( document.createTextNode( cap ) );
		}
	}

	/**
	 * The name of the target which should be focused when the user clicks on this label
	 */
	get target(): string {
		return String(this._target || '') || null;
	}

	set target( target: string ) {
		target = String(target || '') || null;
		if ( target != this._target ) {
			this._target = target;
		}
	}

	protected _setupEvents_() {
		(function(me: UI_Label) {

			me.onDOMEvent(me._root, EEventType.MOUSE_DOWN, function(e: Utils_Event_Mouse) {

				if ( !me.disabled && me.form && me.target ) {

					var target: UI = me.form.getElementByName(me.target);
					
					if ( target && !target.disabled && target.implements( 'IFocusable' ) ) {
						target['active'] = true;
					}

				}

				e.preventDefault();
				e.stopPropagation();
				e.handled = true;

			}, true );

		})(this);
	}
}

Constraint.registerClass( {
	"name": "UI_Label",
	"extends": "UI",
	"properties": [
		{
			"name": "caption",
			"type": "string"
		},
		{
			"name": "target",
			"type": "string"
		}
	]
} );