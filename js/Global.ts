/**
 * The Global class is used to access the global javascript environment in a cross-platform
 * way ( window in browser, global under node, etc ).
 */
class Global {

	public static env: any;
	public static isBrowser: boolean = typeof window != 'undefined' ? true : false;

}

Global.env = typeof window != 'undefined' ? window : global;
