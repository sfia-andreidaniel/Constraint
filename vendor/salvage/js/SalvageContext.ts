class SalvageContext {

	public root: any = null;
	public owner: SalvageContext = null;

	private assigned: any = null;

	constructor( root: any, owner: SalvageContext = null, assignedKeys: any = null) {
		this.root = root;
		this.owner = owner;
		this.assigned = assignedKeys || {};
	}

	public cd( path: string[] = [] ): SalvageContext {

		if ( path.length == 0 )
			return this;

		var cursor: SalvageContext = this,
		         i: number = 0,
		       len: number = path.length;

		while ( path[i] == '..' ) {
			if ( !cursor.owner ) {
				throw "Illegal path!";
			}
			cursor = cursor.owner;
			i++;
		}

		while ( i < len ) {

			if ( path[i] == '..' ) {

				if ( !cursor.owner ) {
					throw "Illegal path!";
				}

				cursor = cursor.owner;

			} else 
			if ( path[i] == 'this' && i == 0 ) {

			} else
			{

				if ( !Salvage.isComplex( cursor.root ) || typeof cursor.root[ path[i] ] == 'undefined' ) {
					throw "Illegal path!";
				}

				cursor = new SalvageContext( cursor.root[ path[i] ], cursor );
			}

			i++;

		}

		return cursor;

	}

	public get( propertyName: string[] = null ): any {

		if ( propertyName === null || propertyName.length == 0 ) {
			return this.root;
		} else {

			if ( propertyName.length > 1 ) {
				return this.cd( propertyName.slice( 0, propertyName.length - 1 ) ).get( [ propertyName[ propertyName.length - 1 ] ] );
			} else {

				if ( typeof this.assigned[ propertyName[0] ] != 'undefined' ) {
					return this.assigned[ propertyName[0] ];
				} else {

				return Salvage.isComplex( this.root )
					? this.root[ propertyName[0] ]
					: ( 

						propertyName[0] == 'this'
							? this.root
							: ''

					);
				}
			}
		
		}

	}

	public getByPath( path: string ): any {
		var parts = SalvageContext.parsePATH( path );
		
		if ( parts === null )
			return null;

		return this.get( parts );
	}

	public static tokens = [
		{
			"name": "normal",
			"expr": /^[a-z_\$]([a-z_\$\d]+)?/i,
			"match": 0
		},
		{
			"name": "enclosed",
			"expr": /^\[([a-z_\$]([a-z_\$\d]+)?)\]/i,
			"match": 1
		},
		{
			"name": "dotdot",
			"expr": /^\.\./,
			"match": 0
		}
	];

	public static parsePATH( s: string ): string[] {
		var parts: string[] = [],
		    raw: string = s,
		    name: string = '',
		    matches: string[],
		    i: number = 0,
		    len: number = 0,
		    optimized: boolean;

		if ( !/^[a-z\d\.\[\]\/_\$]+/i.test( s ) ) {
			return null;
		}

		while ( raw ) {

			name = null;

			for ( i=0; i<3; i++ ) {

				matches = SalvageContext.tokens[i].expr.exec( raw );

				if ( matches ) {
					name = matches[ SalvageContext.tokens[i].match ];
					break;
				}

			}

			if ( name !== null ) {

				parts.push( name );
				
				raw = raw.substr( matches[0].length );

				// check next ...
				if ( raw != '' ) {
					matches = /^(\.|\/|\[)/.exec( raw );
					if ( !matches ) {
						return null;
					} else {
						if ( matches[0] != '[' ) {
							raw = raw.substr( matches[0].length );
						}
					}
					if ( raw == '' ) {
						return null;
					}
				}

			} else {

				return null;

			}

		}

		/* Optimize ... */

		do {

			optimized = true;

			for ( i=1, len = parts.length; i<len; i++ ) {
				if ( parts[i] == '..' && parts[i-1] != '..' ) {
					parts.splice( i - 1, 2 );
					optimized = false;
					break;
				}
			}

		} while ( !optimized );

		if ( !parts.length ) {
			return [ 'this' ];
		}

		return parts;

	}

}