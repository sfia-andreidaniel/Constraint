/**
 * The Utils_Array class implements helpers usefull for manipulating arrays.
 *
 */
class Utils_Array {

	/**
	 * Merge values of two arrays, optionally removing duplicates.
	 */
	public static merge( a: any[], b: any[], allowDuplicates: boolean = false ): any[] {
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


}