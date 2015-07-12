class SalvageBlock  {


	constructor( public parent: SalvageBlock = null ) {

	}

	get type(): string {
		return '';
	}

	get unconsumedRawText(): string {
		return '';
	}

	public parse( context: SalvageContext ): string {
		return '';
	}

}