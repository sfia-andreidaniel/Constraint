class Frontend_Storage {

	private static _cookie: Frontend_Storage_Cookie;

	public get( propertyName: string ): any {
		return '';
	}

	public set( propertyName: string, propertyValue: any ): boolean {
		// needs to be implemented
		return false;
	}

	public has( propertyName: string ): boolean {
		return false;
	}

	public remove( propertyName: string ): boolean {
		return false;
	}

	public get cookie(): Frontend_Storage_Cookie {
		return Frontend_Storage._cookie || ( Frontend_Storage._cookie = new Frontend_Storage_Cookie() );
	}


}