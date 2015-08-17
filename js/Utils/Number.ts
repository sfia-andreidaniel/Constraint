class Utils_Number {

	public static isInteger( num: string ): boolean {
		return /^(\+|-)?\d+$/.test( String( num ) );
	}

	public static isFloat( num: string ): boolean {
		return /^(\+|-)?((\d+(\.\d+)?)|(\.\d+)|(\d+\.))$/.test( String( num ) );
	}

}