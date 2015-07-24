class Utils {

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