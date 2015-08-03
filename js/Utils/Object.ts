/**
 * The Utils_Object class contains helpers for manipulating the Object data type
 *
 */
class Utils_Object {

	/**
	 * Returns another object with the key-value pair from srcObject,
	 * containing **only** the keys defined in the keys argument.
	 *
	 * @param keys - keys to copy from srcObject
	 * @param srcObject - source object from which keys are copied
	 *
	 * If srcObject is not an object, the returned value will be an empty object.
	 *
	 */

	public static peek( keys: string[], srcObject: any ): any {

		var result: any = Object.create( null ),
		    i: number,
		    len: number;
		
		if ( !srcObject ) {
			return result;
		}

		for ( i=0, len = keys.length; i<len; i++ ) {
			if ( typeof srcObject[ keys[i] ] != 'undefined' ) {
				result[ keys[i] ] = srcObject[ keys[i] ];
			}
		}

		return result;

	}

	/**
	 * Returns another object with key-value pair from srcObject,
	 * containing all the keys but the **excluded ones** defined in the
	 * keys argument.
	 * 
	 * @param keys - keys to exclude from the srcObject
	 * @param srcObject - source object from which keys are copied.
	 *
	 * If srcObject is not an object, the returned value will be an empty object.
	 */
	public static exclude( keys: string[], srcObject: any ): any {
		var result: any = Object.create( null ),
		    k: string;

		if ( !srcObject ) {
			return result;
		}

		for ( k in srcObject ) {
			if ( srcObject.hasOwnProperty( k ) && keys.indexOf( k ) == -1 ) {
				result[ k ] = srcObject[ k ];
			}
		}

		return result;
	}



}