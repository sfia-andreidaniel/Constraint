class UI_Resource extends UI_Event {

	public static resources: { name: string; resource: UI_Resource }[] = [];

	public static addResourceFile( resourceName: string, fileURI: string ) {
		console.log( 'addResourceFile: ', resourceName, fileURI );
	}

	constructor( parameters) {
	    super();
	}

}