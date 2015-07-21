class Global {

	public static env: any;
	public static isBrowser: boolean = typeof window != 'undefined' ? true : false;

}

Global.env = typeof window != 'undefined' ? window : global;
