class Global {

	public static env: any;

}

Global.env = typeof window != 'undefined' ? window : global;
