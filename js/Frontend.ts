class Frontend extends UI_Event {
	
	private static _singleton: Frontend = null;
	private static _loaded: boolean = false;
	private static _storage: Frontend_Storage;


	/**
	 * Creates a new frontend. This class should be used via it's "create" method,
	 * not via it's constructor, in order to be a singleton.
	 */
	constructor() {
		super();
	}

	/**
	 * Obtains the frontend singleton
	 */
	public static create(): Frontend {
		return Frontend._singleton || (Frontend._singleton = new Frontend());
	}

	/**
	 * Returns true if the frontend has been loaded
	 */
	public static get loaded(): boolean {
		return Frontend._loaded;
	}

	/**
	 * Adds a event to the frontend.
	 * Valid events are:
	 * - "load"
	 */
	public static on( eventName: string, eventCallback: ( ...args: any[] ) => void ) {
		if ( eventName == 'load' && Frontend.loaded ) {
			Frontend.create().fire(eventName);
		} else {
			Frontend.create().on(eventName, eventCallback);
		}
	}

	/**
	 * Returns a Frontend Storage instance
	 */
	public static get storage(): Frontend_Storage {
		return Frontend._storage || (Frontend._storage = new Frontend_Storage());
	}
}

(function() {

	if (Global.isBrowser) {

		window.addEventListener('load', function(e: Event) {
			Frontend['_loaded'] = true;
			Frontend.create().fire('load');
		});

	}

})();