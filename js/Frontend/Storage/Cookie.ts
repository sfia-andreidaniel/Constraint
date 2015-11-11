class Frontend_Storage_Cookie extends Frontend_Storage {

	constructor() {
		super();
	}

	public set( cookieName: string, cookieValue: any, expireDate: Date = null, path: string = null, domain: string = null, secure: boolean = false ): boolean {
		
		cookieName = String(cookieName || '');

		if (!cookieName || /^(?:expires|max\-age|path|domain|secure)$/i.test(cookieName))
			return false;

		var sExpires = "";
		
		if (expireDate) {
				sExpires = "; expires=" + expireDate.toUTCString();
		}

		document.cookie = encodeURIComponent(cookieName) 
			+ "=" 
			+ encodeURIComponent(String( cookieValue || '' ) ) 
			+ sExpires 
			+ (
				domain 
					? "; domain=" + String( domain || '') 
					: ""
			) 
			+ (
				path 
					? "; path=" + String(path) 
					: ""
			) 
			+ (secure 
				? "; secure" 
				: ""
			);

		return true;
	}

	public has( cookieName: string ): boolean {
		if (!cookieName)
			return false;
		return (
				new RegExp("(?:^|;\\s*)" + encodeURIComponent(cookieName).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")
			).test(document.cookie);
	}

	public get( cookieName: string ): any {
		cookieName = String(cookieName || '');
		
		if (!cookieName) { 
			return null; 
		}
		
		return decodeURIComponent(
			document.cookie.replace(
				new RegExp("(?:(?:^|.*;)\\s*" 
					+ encodeURIComponent(cookieName).replace(/[\-\.\+\*]/g, "\\$&") 
					+ "\\s*\\=\\s*([^;]*).*$)|^.*$"), 
				"$1"
			)
		) || null;
	}

	public remove( cookieName: string, path: string = null, domain: string = null ): boolean {
		if (!this.has(cookieName))
			return false;

		document.cookie = encodeURIComponent(String(cookieName)) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (domain ? "; domain=" + domain : "") + (path ? "; path=" + path : "");
		
		return true;
	}

}