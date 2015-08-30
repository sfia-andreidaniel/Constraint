/**
 * The Utils_Event class implements a cross-browser event abstractization.
 * 
 * 
 */
class Utils_Event {

	public static keyboard( e: KeyboardEvent, unbinder: Utils_Event_Unbinder = null ): Utils_Event_Keyboard {
		return new Utils_Event_Keyboard(e, unbinder);
	}

	public static mouse( e: MouseEvent, unbinder: Utils_Event_Unbinder = null ): Utils_Event_Mouse {
		return new Utils_Event_Mouse(e, unbinder);
	}

	public static generic( e: Event, unbinder: Utils_Event_Unbinder = null ): Utils_Event_Generic {
		return new Utils_Event_Generic(e, unbinder);
	}

	public static on( target: any, eventType: EEventType, callback: ( event: Utils_Event_Generic ) => void, phase: boolean = false, once: boolean = false ): Utils_Event_Unbinder {
		
		var evType: string,
			evName: string;

		if ( !target || !target.addEventListener ) {
			throw new Error('Bad call');
		}

		switch ( eventType ) {
			case EEventType.MOUSE_UP:
				evName = 'mouseup';
				evType = 'mouse';
				break;
			case EEventType.MOUSE_DOWN:
				evName = 'mousedown';
				evType = 'mouse';
				break;
			case EEventType.MOUSE_WHEEL:
				switch ( true ) {
					case typeof target.onwheel != 'undefined':
						evName = 'wheel';
						break;
					case typeof target.onmousewheel != 'undefined':
						evName = 'mousewheel';
						break;
					default:
						throw new Error('Failed to bind wheel event on target ( wheel, mousewheel were not found )');
						break;
				}
				evType = 'mouse';
				break;
			case EEventType.MOUSE_MOVE:
				evName = 'mousemove';
				evType = 'mouse';
				break;
			case EEventType.CLICK:
				evName = 'click';
				evType = 'mouse';
				break;
			case EEventType.DBLCLICK:
				evName = 'dblclick';
				evType = 'mouse';
				break;
			case EEventType.KEY_UP:
				evName = 'keyup';
				evType = 'keyboard';
				break;
			case EEventType.KEY_DOWN:
				evName = 'keydown';
				evType = 'keyboard';
				break;
			case EEventType.KEY_PRESS:
				evName = 'keypresss';
				evType = 'keyboard';
				break;

			case EEventType.FOCUS:
				evName = 'focus';
				evType = 'generic';
				break;
			case EEventType.BLUR:
				evName = 'blur';
				evType = 'generic';
				break;
			case EEventType.INPUT:
				evName = 'input';
				evType = 'generic';
				break;

			default:
				throw new Error('Invalid event type');
				break;
		}

		if ( evName ) {

			var unbinder: Utils_Event_Unbinder;

			var wrapper = function( ev ) {

				if ( once ) {
					callback(Utils_Event[evType](ev, unbinder ).remove() );
					unbinder = undefined;
				} else {
					callback(Utils_Event[evType](ev, unbinder ) );
				}
				
			}

			unbinder = new Utils_Event_Unbinder(
				target,
				evName,
				wrapper,
				phase
			);
			
			target.addEventListener(evName, wrapper, phase);

			return unbinder;

		} else {
			throw new Error('Bad event type (not implemented)');
		}
	}

	public static once( target: any, eventType: EEventType, callback: ( event: Utils_Event_Generic ) => void, phase: boolean = false ): Utils_Event_Unbinder {
		return Utils_Event.on(target, eventType, callback, phase, true );
	}

}