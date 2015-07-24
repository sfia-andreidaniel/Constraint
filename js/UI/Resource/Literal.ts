class UI_Resource_Literal {
	private file: string;
	private versions: string[];
	private disabled: boolean;

	constructor( from: IResourceDef ) {
		this.file = from.file;
		this.versions = from.versions;
		this.disabled = from.disabled;
	}

	public static create( from: IResourceDef ) {
		return new UI_Resource_Literal( from );
	}

	public toString(): string {
		return JSON.stringify({
			"file": this.file,
			"versions": this.versions,
			"disabled": this.disabled
		});
	}

}