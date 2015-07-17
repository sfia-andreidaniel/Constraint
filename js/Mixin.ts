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

		var descriptor: any;

		for ( var propertyName in src.prototype ) {
			if ( src.prototype.hasOwnProperty( propertyName ) && propertyName != 'constructor' ) {
			
				descriptor = Object.getOwnPropertyDescriptor( src.prototype, propertyName );

				if ( descriptor ) {

					if ( typeof descriptor.get != 'undefined' || typeof descriptor.set != 'undefined' || typeof descriptor.value != 'undefined' ) {

						if ( typeof descriptor.value != 'undefined' && typeof src.prototype[ propertyName ] == 'undefined') {
							console.log( 'skipping: ', propertyName );
							continue;
						}

						if ( typeof dest.prototype[ propertyName ] != 'undefined' ) {
							delete dest.prototype[ propertyName ];
						}

						Object.defineProperty( dest.prototype, propertyName, descriptor );

					}

				}

			}
		}

	}

}