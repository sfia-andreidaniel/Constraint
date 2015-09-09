/**
 * The Utils_Keyboard contains keyboard helpers
 */

class Utils_Keyboard {

	static KB_BACKSPACE   = 8;
	static KB_TAB         = 9;
	static KB_ENTER       = 13;
	static KB_SHIFT       = 16;
	static KB_CTRL        = 17;
	static KB_ALT         = 18;
	static KB_BREAK       = 19;
	static KB_CAPS_LOCK   = 20;
	static KB_ESC         = 27;
	static KB_SPACE       = 32;
	static KB_PAGE_UP     = 33;
	static KB_PAGE_DOWN   = 34;
	static KB_END         = 35;
	static KB_HOME        = 36;
	static KB_LEFT        = 37;
	static KB_UP          = 38;
	static KB_RIGHT       = 39;
	static KB_DOWN        = 40;
	static KB_INSERT      = 45;
	static KB_DELETE      = 46;
	static KB_F1          = 112;
	static KB_F2          = 113;
	static KB_F3          = 114;
	static KB_F4          = 115;
	static KB_F5          = 116;
	static KB_F6          = 117;
	static KB_F7          = 118;
	static KB_F8          = 119;
	static KB_F9          = 120;
	static KB_F10         = 121;
	static KB_F11         = 122;
	static KB_F12         = 123;
	static KB_NUM_LOCK    = 144;
	static KB_SCROLL_LOCK = 145;

	static keyBindings = {
		"32" : [ ' ', ' ' ],
		"192": [ '`', '~' ],

		"48":  [ '0', ')' ],
		"49":  [ '1', '!' ],
		"50":  [ '2', '@' ],
		"51":  [ '3', '#' ],
		"52":  [ '4', '$' ],
		"53":  [ '5', '%' ],
		"54":  [ '6', '^' ],
		"55":  [ '7', '&' ],
		"56":  [ '8', '*' ],
		"57":  [ '9', '(' ],

		"81":  [ 'q', 'Q' ],
		"87":  [ 'w', 'W' ],
		"69":  [ 'e', 'E' ],
		"82":  [ 'r', 'R' ],
		"84":  [ 't', 'T' ],
		"89":  [ 'y', 'Y' ],
		"85":  [ 'u', 'U' ],
		"73":  [ 'i', 'I' ],
		"79":  [ 'o', 'O' ],
		"80":  [ 'p', 'P' ],

		"65":  [ 'a', 'A' ],
		"83":  [ 's', 'S' ],
		"68":  [ 'd', 'D' ],
		"70":  [ 'f', 'F' ],
		"71":  [ 'g', 'G' ],
		"72":  [ 'h', 'H' ],
		"74":  [ 'j', 'J' ],
		"75":  [ 'k', 'K' ],
		"76":  [ 'l', 'L' ],

		"90":  [ 'z', 'Z' ],
		"88":  [ 'x', 'X' ],
		"67":  [ 'c', 'C' ],
		"86":  [ 'v', 'V' ],
		"66":  [ 'b', 'B' ],
		"78":  [ 'n', 'N' ],
		"77":  [ 'm', 'M' ],

		"226": [ '\\', '|' ],
		"188": [ ',', '<' ],
		"191": [ '/', '?' ],
		"190": [ '.', '>' ],

		"186": [ ';', ':' ],
		"222": [ "'", '"' ],
		"220": [ '\\', '|' ],

		"219": [ '[', '{' ],
		"221": [ ']', '}' ],
		
		"189": [ '-', '_' ],
		"187": [ '=', '+' ]
	}

	public static eventToString( ev: KeyboardEvent ): string {
		var code = ev.keyCode || ev.charCode,
		    shift= ev.shiftKey,
		    ctrl = ev.ctrlKey,
		    alt  = ev.altKey,
		    out: string[] = [];

		if ( !ctrl && !alt ) {

			if ( code && typeof Utils_Keyboard.keyBindings[ code ] != 'undefined' ) {
				if (code == 32) {
					return shift ? 'shift space' : ' ';
				} else {
					return Utils_Keyboard.keyBindings[code][~~shift];
				}
			}

			if ( shift ) {
				out.push( 'shift' );
			}

			switch ( code ) {
				case Utils_Keyboard.KB_BACKSPACE: 	out.push('backspace'); break;
				case Utils_Keyboard.KB_TAB: 		out.push('tab'); break;
				case Utils_Keyboard.KB_ENTER: 		out.push('enter'); break;
				case Utils_Keyboard.KB_BREAK: 		out.push('break'); break;
				case Utils_Keyboard.KB_CAPS_LOCK: 	out.push('caps_lock'); break;
				case Utils_Keyboard.KB_ESC: 		out.push('esc'); break;
				case Utils_Keyboard.KB_PAGE_UP: 	out.push('page_up'); break;
				case Utils_Keyboard.KB_PAGE_DOWN: 	out.push('page_down'); break;
				case Utils_Keyboard.KB_END: 		out.push('end'); break;
				case Utils_Keyboard.KB_HOME: 		out.push('home'); break;
				case Utils_Keyboard.KB_LEFT: 		out.push('left'); break;
				case Utils_Keyboard.KB_UP: 			out.push('up'); break;
				case Utils_Keyboard.KB_RIGHT: 		out.push('right'); break;
				case Utils_Keyboard.KB_DOWN: 		out.push('down'); break;
				case Utils_Keyboard.KB_INSERT: 		out.push('insert'); break;
				case Utils_Keyboard.KB_DELETE: 		out.push('delete'); break;
				case Utils_Keyboard.KB_F1: 			out.push('f1'); break;
				case Utils_Keyboard.KB_F2: 			out.push('f2'); break;
				case Utils_Keyboard.KB_F3: 			out.push('f3'); break;
				case Utils_Keyboard.KB_F4: 			out.push('f4'); break;
				case Utils_Keyboard.KB_F5: 			out.push('f5'); break;
				case Utils_Keyboard.KB_F6: 			out.push('f6'); break;
				case Utils_Keyboard.KB_F7: 			out.push('f7'); break;
				case Utils_Keyboard.KB_F8: 			out.push('f8'); break;
				case Utils_Keyboard.KB_F9: 			out.push('f9'); break;
				case Utils_Keyboard.KB_F10: 		out.push('f10'); break;
				case Utils_Keyboard.KB_F11: 		out.push('f11'); break;
				case Utils_Keyboard.KB_F12: 		out.push('f12'); break;
				case Utils_Keyboard.KB_NUM_LOCK: 	out.push('num_lock'); break;
				case Utils_Keyboard.KB_SCROLL_LOCK: out.push('scroll_lock'); break;
				default:
					return '';
			}

			return out.join( ' ' );

		} else {
			
			if ( ctrl )
				out.push( 'ctrl' );
			
			if ( alt )
				out.push( 'alt' );
			
			if ( shift )
				out.push( 'shift' );

			if ( typeof Utils_Keyboard.keyBindings[ code ] != 'undefined' ) {
				out.push( Utils_Keyboard.keyBindings[ code ][ 0 ] == ' ' ? 'space' : Utils_Keyboard.keyBindings[ code ][ 0 ] );
				return out.join( ' ' );
			} else {
				
				switch ( code ) {
					case Utils_Keyboard.KB_BACKSPACE: 	out.push('backspace'); break;
					case Utils_Keyboard.KB_TAB: 		out.push('tab'); break;
					case Utils_Keyboard.KB_ENTER: 		out.push('enter'); break;
					case Utils_Keyboard.KB_BREAK: 		out.push('break'); break;
					case Utils_Keyboard.KB_CAPS_LOCK: 	out.push('caps_lock'); break;
					case Utils_Keyboard.KB_ESC: 		out.push('esc'); break;
					case Utils_Keyboard.KB_PAGE_UP: 	out.push('page_up'); break;
					case Utils_Keyboard.KB_PAGE_DOWN: 	out.push('page_down'); break;
					case Utils_Keyboard.KB_END: 		out.push('end'); break;
					case Utils_Keyboard.KB_HOME: 		out.push('home'); break;
					case Utils_Keyboard.KB_LEFT: 		out.push('left'); break;
					case Utils_Keyboard.KB_UP: 			out.push('up'); break;
					case Utils_Keyboard.KB_RIGHT: 		out.push('right'); break;
					case Utils_Keyboard.KB_DOWN: 		out.push('down'); break;
					case Utils_Keyboard.KB_INSERT: 		out.push('insert'); break;
					case Utils_Keyboard.KB_DELETE: 		out.push('delete'); break;
					case Utils_Keyboard.KB_F1: 			out.push('f1'); break;
					case Utils_Keyboard.KB_F2: 			out.push('f2'); break;
					case Utils_Keyboard.KB_F3: 			out.push('f3'); break;
					case Utils_Keyboard.KB_F4: 			out.push('f4'); break;
					case Utils_Keyboard.KB_F5: 			out.push('f5'); break;
					case Utils_Keyboard.KB_F6: 			out.push('f6'); break;
					case Utils_Keyboard.KB_F7: 			out.push('f7'); break;
					case Utils_Keyboard.KB_F8: 			out.push('f8'); break;
					case Utils_Keyboard.KB_F9: 			out.push('f9'); break;
					case Utils_Keyboard.KB_F10: 		out.push('f10'); break;
					case Utils_Keyboard.KB_F11: 		out.push('f11'); break;
					case Utils_Keyboard.KB_F12: 		out.push('f12'); break;
					case Utils_Keyboard.KB_NUM_LOCK: 	out.push('num_lock'); break;
					case Utils_Keyboard.KB_SCROLL_LOCK: out.push('scroll_lock'); break;
					default:
						return '';
				}

				return out.join( ' ' );
			}

			return '';

		}
	}

}