class UI_Label extends UI {
	
	public static _theme = {
		"defaultWidth": $I.number('UI.UI_Label/width'),
		"defaultHeight": $I.number('UI.UI_Label/height')
	}

	protected _dom = {
		caption: UI_Dom.create( 'div', 'label' )
	};

	protected _caption: string = 'Label';
	
	constructor( owner: UI ) {
		super( owner );
	    this._root = UI_Dom.create( 'div', 'ui UI_Label ta-left' );
		this._root.appendChild( this._dom.caption );
		this._dom.caption.appendChild( document.createTextNode( this._caption ) );

		this._width = UI_Label._theme.defaultWidth;
		this._height = UI_Label._theme.defaultHeight;
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
}

Constraint.registerClass( {
	"name": "UI_Label",
	"extends": "UI",
	"properties": [
		{
			"name": "caption",
			"type": "string"
		}
	]
} );