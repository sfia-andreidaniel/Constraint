class Mixin {

	public static extend( classDef: string, withClass: string ) {

		var dest: any = Global.env[ classDef ];
		var src: any  = Global.env[ withClass ];

		if ( !dest || !dest.prototype ) {
			return;
		}

		if ( !src || !src.prototype ) {
			return;
		}

		if ( !src.isMixin ) {
			throw new Error( 'Failed to extend: Source class "' + withClass + '" does not appear to be a mixin class' );
		}

		var descriptor: any,
		    skipProperties: string[] = src.skipProperties || [],
		    forceProperties: string[] = src.forceProperties || [];

		console.log( 'Mixin.extend( ' + JSON.stringify( classDef ) + ', ' + JSON.stringify( withClass ) + ')' );

		for ( var propertyName in src.prototype ) {
			if ( src.prototype.hasOwnProperty( propertyName ) && propertyName != 'constructor' ) {
			
				descriptor = Object.getOwnPropertyDescriptor( src.prototype, propertyName );

				if ( descriptor ) {

					if ( typeof descriptor.get != 'undefined' || typeof descriptor.set != 'undefined' || typeof descriptor.value != 'undefined' ) {

						if ( typeof descriptor.value != 'undefined' && typeof src.prototype[ propertyName ] == 'undefined' && forceProperties.indexOf( propertyName ) == -1 ) {
							//console.log( 'skipping: ', propertyName );
							continue;
						}

						if ( typeof dest.prototype[ propertyName ] != 'undefined' && skipProperties.indexOf( propertyName ) == -1 ) {
							delete dest.prototype[ propertyName ];
						}

						if ( skipProperties.indexOf( propertyName ) == -1 ) {
							Object.defineProperty( dest.prototype, propertyName, descriptor );
							//console.log( 'implementing: ', propertyName );
						} else {
							//console.log( 'skipping: ', propertyName );
						}

					}

				}

			}
		}

	}

}