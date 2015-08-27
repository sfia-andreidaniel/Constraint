/**
 * The Utils_String class is providing helpers for working with
 * string type.
 */
class Utils_String {

	/**
	 * Pads a string to a desired length with a padding string.
	 *  
	 * @param s - the string, or any data type convertible to string
	 * @param length - the desired length
	 * @param withWhat - the padding character(s)
	 * @param where - where to place the padding ( LEFT, RIGHT, BOTH )
	 */
	public static pad( s: any, length: number, withWhat: string = ' ', where: EStrPadding = EStrPadding.RIGHT ): string {
		var result = String( s || '' ),
		    len: number = result.length,
		    addLen: number,
		    t: number = 1;

		withWhat = String( withWhat || ' ' );
		addLen = withWhat.length;

		while ( len < length ) {
			switch ( where ) {
				case EStrPadding.LEFT:
					result = withWhat + result;
					break;
				case EStrPadding.RIGHT:
					result = result + withWhat;
					break;
				case EStrPadding.BOTH:
					t = 1 - t;
					if ( t ) {
						result = result + withWhat;
					} else {
						result = withWhat + result;
					}
					break;
			}
			len += addLen;
		}

		return result;
	}

	public static repeat( times: number, sequence: string ): string {
		var result = '',
		    i: number;

		for ( i=0; i<times; i++ ) {
			result += sequence;
		}

		return result;
	}

}