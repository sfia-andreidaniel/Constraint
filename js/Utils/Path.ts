class Utils_Path {

	public static createURL( info: IUrlStruc ) {
		
		var o: string[] = [],
			q: string[] = [],
		    k: string;

		if ( !info ) {
			return null;
		}

		if ( info.protocol ) {
		
			o.push( info.protocol + '://' );
		
			if (info.user && info.protocol != 'file' ) {
				o.push(encodeURIComponent(info.user));
				if (info.password) {
					o.push(':' + encodeURIComponent(info.password));
				}
				o.push('@');
			}

			if (info.host && info.protocol != 'file') {
				o.push(info.host);
				if ( info.port) {
					o.push(':' + String(info.port));
				}
			}
		}

		if ( info.path )
			o.push(info.path);

		if ( info.file )
			o.push(info.file)

		if ( info.query && info.protocol != 'file' ) {

			k = Utils_Path.encodeQuery( info.query );

			if ( k ) {
				o.push('?' + k);
			}

		}

		if ( info.hash && info.protocol != 'file' ) {
			o.push(info.hash);
		}

		return o.join('');

	}

	public static encodeQuery(info: IQueryStruc): string {
		
		if ( !info ){ 
			return '';
		}

		var q: string[] = [],
			k: string;
		
		for (k in info) {
			if (info.hasOwnProperty(k)) {
				q.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(info[k] || '')));
			}
		}

		return q.join('&');
	}

	public static parseURL(url: string): IUrlStruc {

		var result: IUrlStruc = {
			protocol: null,
			user: null,
			password: null,
			host: null,
			port: null,
			path: null,
			file: null,
			query: null,
			hash: null,
			fullPath: null
		},
			rest: string = url,
			matches: string[],
			index: number,
			len: number,
			queryArgs: string[];

		// parse protocol:
		if ( matches = /^([\da-zA-Z]+)\:/.exec( rest ) ) {
			result.protocol = matches[1];
			rest = rest.substr(matches[0].length);
		}

		// parse "//""
		if ( matches = /^\/\//.exec(rest) ) {
			rest = rest.substr(matches[0].length);
		}

		if ( result.protocol !== 'file' ) {

			// parse user[:password]@
			if (matches = /^([a-zA-Z\%\d_\(\)\-\.]+)(\:([a-zA-Z\%\d_\(\)\-\.]+))@/.exec(rest)) {

				if (matches[1]) {
					result.user = decodeURIComponent(matches[1]) || matches[1];
					if (matches[3]) {
						result.password = decodeURIComponent(matches[3]) || matches[3];
					}
				}
				rest = rest.substr(matches[0].length);
			}

			if ( result.protocol ) {
				
				// parse host[:port]
				if (matches = /^(([a-zA-Z\d\_\.\-]+)(\:([\d]+))?)($|\/)/.exec(rest)) {
					
					if ( matches[2] && !/^\.|\.$/.test(matches[2]) ) {

						index = 0;

						result.host = matches[2];

						index += result.host.length;

						if ( matches[4] ) {

							index += matches[4].length + 1;

							result.port = ~~matches[4];

							if ( result.port > 65535 ) {
								console.warn('Utils_Pat.parseURL: detected invalid port value (>65535).');
							}
						
						}

						rest = rest.substr(index);

					}

				}

			}

		}

		// parse path

		if ( matches = /^[^\?\#]+/.exec(rest) ) {

			var pathParts: string = matches[0];

			index = matches[0].length;

			pathParts = pathParts.replace(/[\/\\]+/g, '/'); // normalize path separators

			if ( matches = /[^\/]+$/.exec( pathParts ) ) {
				result.file = matches[0];
				pathParts = pathParts.substr(0, pathParts.length - result.file.length);
				if ( pathParts ) {
					result.path = pathParts;
				}
			} else {
				result.path = pathParts;
			}

			rest = rest.substr(index);

		}

		if ( matches = /\?([^$#]+)/.exec(rest) ) {
			
			rest = rest.substr(matches[0].length);
			
			queryArgs = matches[1].split('&');

			for (index = 0, len = queryArgs.length; index < len; index++ ) {
				if ( queryArgs[index] ) {

					matches = /^([^=]+)(\=(.*)?)?$/.exec(queryArgs[index]);

					if ( matches ) {

						result.query = result.query || {};

						if ( matches[1] ) {
							result.query[decodeURIComponent(matches[1])]
							= matches[3]
								? decodeURIComponent(matches[3])
								: '';
						}
					}

				}
			}
		}

		if ( matches = /^\#(.*)$/.exec(rest) ) {

			result.hash = matches[1];

		} else {
			if ( rest ) {
				return null; // unexpected remain of query...
			}
		}

		// normalize components

		if ( result.file ) {
			result.file = decodeURIComponent(result.file.replace(/^[\s]+|[\s]+$/g, '')) || null;
		}

		if ( result.path ) {
			result.path = decodeURIComponent(result.path.replace(/^[\s]+|[\s]+$/g, '')) || null;	
		}

		// file:// protocol does not support: query, hash, user or password, or host
		if ( result.protocol === 'file' && ( result.hash || result.query || result.user || result.password || result.host ) ) {
			return null;
		}

		if ( result.file || result.path ) {
			matches = [];

			if ( result.path ) {

				if (result.path && ['.','/'].indexOf( result.path.charAt(0) ) == -1 ) {
					
					if ( result.path.substr(0,2) == '..' ) {
						// out of server root attack
						return null;
					}

					result.path = './' + result.path;
				}

				matches.push(result.path);
			}
			
			if ( result.file) {
				matches.push(result.file);
			}

			result.fullPath = matches.join('/').replace(/[\/]+/g, '/' );

		}

		return result;

	}

}