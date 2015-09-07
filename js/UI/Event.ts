/// <reference path="../Utils/Keyboard.ts" />
/// <reference path="../Utils/Event.ts" />
/// <reference path="../Utils/Event/Unbinder.ts" />
/// <reference path="../Utils/Event/Generic.ts" />
/// <reference path="../Utils/Event/Keyboard.ts" />
/// <reference path="../Utils/Event/Mouse.ts" />

/**
 * Core eventing class, which stands at the base of most classes in this framework.
 */
class UI_Event {

	private $EVENTS_QUEUE : {};
	private $EVENTS_ENABLED: boolean = true;
	private $DOM_EVENTS: Utils_Event_Unbinder[];

	constructor(){}

	/**
	 * Adds an event listener to eventName
	 *
	 * @param eventName - the name of the event where the callback should run.
	 * @param callback - a function which is executed each time an event with name eventName is fired. You can use
	 * this inside the callback.
	 */
	public on( eventName: string, callback: ( ...args ) => void ) {
		
		this.$EVENTS_QUEUE = this.$EVENTS_QUEUE || {};

		if ( !this.$EVENTS_QUEUE[ eventName ] )
			this.$EVENTS_QUEUE[ eventName ] = [];
		this.$EVENTS_QUEUE[ eventName ].push( callback );
	}

	/**
	 * Removes the event listener callback from event eventName.
	 *
	 * @param eventName - if null, all events are removed from the event.
	 * @param callback - the callback which should be removed. If null, all events binded to eventName are removed.
	 */
	public off( eventName: string, callback: ( ... args ) => void ) {

		if ( eventName ) {

			if ( callback ) {

				if ( this.$EVENTS_QUEUE && this.$EVENTS_QUEUE[ eventName ] ) {
					for ( var i = this.$EVENTS_QUEUE[ eventName ].length - 1; i>=0; i-- ) {
						if ( this.$EVENTS_QUEUE[ eventName ][ i ] == callback ) {
							this.$EVENTS_QUEUE[eventName][i] = null;
							return;
						}
					}
				}
			} else {
				if ( typeof this.$EVENTS_QUEUE[ eventName ] != 'undefined' ) {
					delete this.$EVENTS_QUEUE[ eventName ];
				}
			}

		} else {

			// drops the $EVENTS_QUEUE AT ALL
			this.$EVENTS_QUEUE = undefined;

		}

	}

	/**
	 * Fires all callbacks associated with event eventName. You can use "this" in the context
	 * of the callbacks.
	 *
	 * @param eventName - the name of the event which should be fired.
	 * @param ...args - arguments that are applied with the "this" context to each binded callback.
	 */
	public fire( eventName: string, ...args ) {

		var hasNull: boolean = false,
		    i: number,
		    len: number;

		if ( this.$EVENTS_ENABLED ) {

			if ( this.$EVENTS_QUEUE && this.$EVENTS_QUEUE[ eventName ] ) {
				for ( i=0, len = this.$EVENTS_QUEUE[ eventName ].length; i<len; i++ ) {
					if (this.$EVENTS_QUEUE[eventName][i]) {
						this.$EVENTS_QUEUE[eventName][i].apply(this, args);
						if (this.$EVENTS_QUEUE && this.$EVENTS_QUEUE[eventName] && this.$EVENTS_QUEUE[eventName][i] === null)
							hasNull = true;
					} else {
						hasNull = true;
					}
				}

				// Remove nulls
				if ( hasNull && this.$EVENTS_QUEUE[eventName] && this.$EVENTS_QUEUE[ eventName ]) {
					for (i = len - 1; i>=0; i-- ) {
						if ( this.$EVENTS_QUEUE[ eventName ][ i ] === null ) {
							this.$EVENTS_QUEUE[eventName].splice(i, 1);
						}
					}
					if ( this.$EVENTS_QUEUE[ eventName ].length == 0 ) {
						delete this.$EVENTS_QUEUE[eventName];
					}
				}
			}
					}
	}

	/**
	 * Adds a DOM Event listener on target, and stores a local event unbinder on this instance.
	 * When calling the "free" method, all unbinders will be executed, removing memory references and
	 * allowing the garbage collection to take place.
	 */
	public onDOMEvent( target: any, eventType: EEventType, callback: (e:Utils_Event_Generic) => void, phase: boolean = false, once: boolean = false ): Utils_Event_Unbinder {

		var result: Utils_Event_Unbinder,
		    me = this,
		    index: number;

		this.$DOM_EVENTS = this.$DOM_EVENTS || [];

		result = Utils_Event.on(target, eventType, callback, phase, once );

		if ( !result ) {
			return null;
		}

		this.$DOM_EVENTS.push(result );

		result.onRemove = function() {
			if ( ( index = me.$DOM_EVENTS.indexOf( result ) ) > -1 ) {
				me.$DOM_EVENTS.splice(index, 1);
			}
		};

		return result;
	}

	/**
	 * Destructor. Unbinds all events and all dom event listeners.
	 */
	public free() {
		if ( this.$DOM_EVENTS ) {
			while ( this.$DOM_EVENTS[0] ) {
				this.$DOM_EVENTS[0].remove();
			}
		}
		this.off(null, null);
	}

	/**
	 * A method to enable or disable all events on this object.
	 */
	public setEventingState( enabled: boolean ) {
		this.$EVENTS_ENABLED = !!enabled;
	}

}