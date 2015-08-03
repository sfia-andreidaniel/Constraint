/**
 * Helpers for create circular generators.
 */
class Utils_Circular {

	/* Creates a circular map:
	 *
	 * @param descending - indicates the direction used to generate the circular map:
	 *    IF TRUE:  [ currentValue, currentValue - 1, currentValue - 2, ...minValue, maxValue, maxValue - 1, maxValue - 2, ... currentValue + 1 ]
	 *    IF FALSE: [ currentValue, currentValue + 1, ...maxValue, minValue, minValue + 1, minValue + 2, ...currentValue - 1 ]
	 *
	 * @param minValue - minimum value of the circular map
	 * @param maxValue - maximum value of the circular map
	 * @param currentValue - current value from which the generator starts
	 *
	 */

	public static createMap( minValue: number, maxValue: number, currentValue: number, descending: boolean = false ): number[] {

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