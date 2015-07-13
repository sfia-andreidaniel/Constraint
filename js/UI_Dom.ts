/* Minimal JQuery like interface */

class UI_Dom {

	public static _selector_( element: any ): any {
		return typeof element == 'string'
			? document.querySelector( element )
			: element;
	}

	public static hasClass( element: any, className: string ): boolean {

		element = UI_Dom._selector_( element );

		if ( !className || !element ) {
			return false;
		}

		var classes = element.className.split( ' ' ),
		    i: number = 0,
		    len: number = classes.length;

		for ( i=0; i<len; i++ ) {
			if ( classes[i] == className ) {
				return true;
			}
		}

		return false;

	}

	public static addClass( element: any, className: string ) {

		element = UI_Dom._selector_( element );

		if ( !element || !className ) {
			return;
		}

		var classes = String( element.className || '' ).split( ' ' ),
			outclasses: string[] = [],
		    i: number = 0,
		    len: number = classes.length;

		for ( i=0; i<len; i++ ) {
			if ( classes[i] == className ) {
				return;
			} else
			if ( classes[i] ) {
				outclasses.push( classes[i] );
			}
		}

		outclasses.push( className );

		element.className = outclasses.join( ' ' );
	}

	public static removeClass( element: any, className: string ) {

		element = UI_Dom._selector_( element );

		if ( !element || !className || !element.className ) {
			return;
		}

		var classes = String( element.className ).split( ' ' ),
		    i: number = 0,
		    len: number = classes.length,
		    f: boolean = false;

		for ( i=0; i<len; i++ ) {
			if ( classes[i] == className ) {
				classes.splice( i, 1 );
				f = true;
				break;
			}
		}

		if ( f ) {
			element.className = classes.length
				? classes.join( ' ' )
				: null;
		}

	}

	public static removeClasses( element: any, classes: string[] ) {
		element = UI_Dom._selector_( element );

		if ( !element || !element.className || !classes.length ) {
			return;
		}

		var elClasses = String( element.className ).split( ' ' ),
		    i: number = 0,
		   	len: number = classes.length,
		   	pos: number = 0,
		   	f: boolean = false;

		for ( i=0; i<len; i++ ) {
			if ( ( pos = elClasses.indexOf( classes[i] ) ) >= 0 ) {
				elClasses.splice( pos, 1 );
				f = true;
			}
		}

		if ( f ) {
			element.className = elClasses.length
				? elClasses.join( ' ' )
				: null;
		}
	}

	public static create( tagName: string ): any {
		return document.createElement( tagName );
	}

}