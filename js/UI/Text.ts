/**
 * The UI_Text class represents a text fragment which can be inserted into the DOM.
 */

class UI_Text extends UI {
	
	protected _caption: string = '';

	constructor( owner: UI ) {
		super( owner, null, Utils.dom.create( 'div', 'ui UI_Text' ) );
	}

	get caption(): string {
		return this._caption;
	}

	set caption( caption: string ) {
		
		caption = String( caption || '' );

		if ( caption != this._caption ) {
		
			this._root.textContent = '';

			var lines: string[] = caption.split( '\n' ),
			    i: number = 0,
			    len: number,
			    div: HTMLDivElement;

			for ( i=0, len = lines.length; i<len; i++ ) {
				div = Utils.dom.create( 'div' );
				div.appendChild( document.createTextNode( lines[i] ) );
				div.style.textIndent = ( /^[\t]+/.exec( lines[i] ) || [''] )[0].length * 20 + "px";
				this._root.appendChild( div );
			}

			this._caption = caption;
		}
	}

	get textHeight(): number {
		var result = 0,
		    i: number = 0,
		    len: number = this._root.childNodes.length;

		for ( i=0; i<len; i++ ) {
			result += this._root.childNodes[i]['offsetHeight'];
		}

		return result;
	}

}

Constraint.registerClass( {
	"name": "UI_Text",
	"extends": "UI",
	"properties": [
		{
			"name": "caption",
			"type": "string"
		}
	]
} );