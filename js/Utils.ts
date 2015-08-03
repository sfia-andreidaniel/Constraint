
/**
 * The Utils class expose helper interfaces for manipulating different
 * data types:
 *
 * * **date** -> **Utils_Date**
 * * **array** -> **Utils_Array**
 * * **object** -> **Utils_Object**
 * * **circular** -> **Utils_Circular**
 * * **dom** -> **Utils_Dom**
 *
 */
class Utils {

	/**
	 * Helpers for manipulating **Date**s
	 */
	public static date = Utils_Date;

	/**
	 * Helpers for manipuating **Array**s
	 */
	public static array = Utils_Array;

	/**
	 * Helpers for manipulating **Object**s
	 */
	public static object= Utils_Object;

	/**
	 * Helpers for manipulating circular structures (generators)
	 */
	public static circular = Utils_Circular;

	/**
	 * Helpers for manipulating DOM objects
	 */
	public static dom = Utils_Dom;

}
