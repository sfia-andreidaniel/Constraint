interface IToken {
	"regex": RegExp;
	"return": number;
}

interface ITokenResult {
	result: any;
	length: number;
	type: string;
}

interface IConstraintFlow {
	flow: string[];
	children?: string[];
}

interface IProperty {
	name: string;
	value: any;
}

enum EAlignment {
	TOP,
	LEFT,
	RIGHT,
	BOTTOM,
	CENTER
}

interface IAnchor {
	target: string;
	alignment: EAlignment;
	distance?: number;
}