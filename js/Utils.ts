class Utils {

	public static arrayMerge( a: any[], b: any[], allowDuplicates: boolean = false ): any[] {
		var result: any[] = [],
		    i: number,
		    len: number;

		for ( i=0, len = a.length; i<len; i++ ) {
			if ( allowDuplicates ) {
				result.push( a[i] );
			} else {
				if ( result.indexOf( a[i] ) == -1 ) {
					result.push( a[i] );
				}
			}
		}

		for ( i=0, len = b.length; i<len; i++ ) {
			if ( allowDuplicates ) {
				result.push( b[i] );
			} else {
				if ( result.indexOf( b[i] ) == -1 ) {
					result.push( b[i] );
				}
			}
		}

		return result;

	}

	public static createCircularMap( minValue: number, maxValue: number, currentValue: number, descending: boolean = false ): number[] {

		if ( maxValue < minValue ) {

			throw new Error( 'Invalid map arguments' );

		} else 

		if ( currentValue < minValue || currentValue > maxValue ) {

			throw new Error( 'Cursor out of bounds!' );

		} else

		if ( maxValue == minValue ) {

			return [ currentValue ];

		} else {

			var result: number[] = [],
			    i: number,
			    cursor: number = currentValue;

			if ( descending ) {

				if ( cursor != minValue ) {

					while ( cursor > minValue ) {
						cursor--;
						result.push( cursor );
					}

				}

				cursor = maxValue + 1;

				while ( cursor > currentValue ) {
					cursor--;
					result.push( cursor );
				}

			} else {

				cursor = currentValue + 1;

				while ( cursor <= maxValue ) {
					result.push( cursor );
					cursor++;
				}

				cursor = minValue;

				while ( cursor <= currentValue ) {
					result.push( cursor );
					cursor++;
				}

			}

			return result;

		}

	}

}