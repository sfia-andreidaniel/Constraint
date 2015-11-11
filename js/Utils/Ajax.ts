class Utils_Ajax {

	private static createRequest( requestType: string, requestURL: string, requestData: IQueryStruc = null, withCredentials: boolean = false ): Thenable<string> {
		
		return new Promise(function(accept, reject) {

			var http = new XMLHttpRequest,
			    postData: string = '';

			if ( withCredentials ) {
				http.withCredentials = true;
			}

			http.onload = function(e: Event) {
				if (this.status >= 200 && this.status < 300) {
					accept(this.response);
				} else {
					reject(new Error( 'BAD HTTP CODE: ' + this.status ) );
				}

			}

			http.onerror = function(e: Event) {
				reject(new Error(this.statusText));
			}

			if ( requestType != 'GET' && requestType != 'POST' ) {
				throw new Error("Sorry, only GET and POST protocols are supported");
			}

			if ( requestData ) {

				if ( requestType == 'GET' ) {

					var info: IUrlStruc = Utils_Path.parseURL(requestURL),
					    k: string,
					    v: string;

					info.query = info.query || {};

					for ( k in requestData ) {
						if ( requestData.hasOwnProperty(k) ) {
							info.query[k] = String(requestData[k] || '');
						}
					}

					requestURL = Utils_Path.createURL(info);

				} else {

					postData = Utils_Path.encodeQuery(requestData);

				}

			}

			http.open(requestType, requestURL);

			if ( postData ) {
				http.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
				http.send(postData);
			} else {
				http.send(null);
			}

		});

	}

	public static get( url, requestData: IQueryStruc = null, withCredentials: boolean = false ): Thenable<string> {
		return Utils_Ajax.createRequest('GET', url, requestData, withCredentials);
	}

	public static post(url, requestData: IQueryStruc = null, withCredentials: boolean = false ): Thenable<string> {
		return Utils_Ajax.createRequest('POST', url, requestData, withCredentials);
	}

	public static isRequestable( url: string ): boolean {
		return [null, '', 'http', 'https', 'file' ].indexOf( Utils_Path.parseURL(url).protocol ) > -1;
	}

}