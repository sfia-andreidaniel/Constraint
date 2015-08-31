/**
 * Class that is used by the .ui files parser to represent a native typescript enumeration type.
 */
class Constraint_Enum {
	constructor( public value: any, public literal: string ) {}

	public toString(): string {
		return JSON.stringify( this.value );
	}

	public toLiteral(): string {
		return this.literal;
	}

	public static create( value: any, literal: string ) {
		return new Constraint_Enum( value, literal );
	}
}