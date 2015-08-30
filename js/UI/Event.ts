/// <reference path="../Utils/Keyboard.ts" />
/// <reference path="../Utils/Event.ts" />
/// <reference path="../Utils/Event/Unbinder.ts" />
/// <reference path="../Utils/Event/Generic.ts" />
/// <reference path="../Utils/Event/Keyboard.ts" />
/// <reference path="../Utils/Event/Mouse.ts" />

class UI_Event {

	private $EVENTS_QUEUE : {};
	private $EVENTS_ENABLED: boolean = true;
	private $DOM_EVENTS: Utils_Event_Unbinder[];

	constructor(){}

	public on( eventName: string, callback: ( ...args ) => void ) {
		
		this.$EVENTS_QUEUE = this.$EVENTS_QUEUE || {};

		if ( !this.$EVENTS_QUEUE[ eventName ] )
			this.$EVENTS_QUEUE[ eventName ] = [];
		this.$EVENTS_QUEUE[ eventName ].push( callback );
	}

	public off( eventName: string, callback: ( ... args ) => void ) {

		if ( eventName ) {

			if ( this.$EVENTS_QUEUE && this.$EVENTS_QUEUE[ eventName ] ) {
				for ( var i=0, len = this.$EVENTS_QUEUE[ eventName ].length; i<len; i++ ) {
					if ( this.$EVENTS_QUEUE[ eventName ][ i ] == callback ) {
						this.$EVENTS_QUEUE[ eventName ].splice( i, 1 );
						return;
					}
				}
			}

		} else {

			// drops the $EVENTS_QUEUE AT ALL
			this.$EVENTS_QUEUE = undefined;

		}

	}

	public fire( eventName, ...args ) {

		if ( this.$EVENTS_ENABLED ) {

			if ( this.$EVENTS_QUEUE && this.$EVENTS_QUEUE[ eventName ] ) {
				for ( var i=0, len = this.$EVENTS_QUEUE[ eventName ].length; i<len; i++ ) {
					if ( this.$EVENTS_QUEUE && this.$EVENTS_QUEUE[ eventName ] && this.$EVENTS_QUEUE[ eventName ][ i ] ) {
						this.$EVENTS_QUEUE[ eventName ][i].apply( this, args );
					}
				}
			}
		}
	}

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

	public free() {
		if ( this.$DOM_EVENTS ) {
			while ( this.$DOM_EVENTS[0] ) {
				this.$DOM_EVENTS[0].remove();
			}
		}
		this.off(null, null);
	}

	// globally enables or disables all events fired.
	public setEventingState( enabled: boolean ) {
		this.$EVENTS_ENABLED = !!enabled;
	}

}