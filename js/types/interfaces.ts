
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

interface IAnchor {
	target: string;
	alignment: EAlignment;
	distance?: number;
}

interface IClassProperty {
	name: string;
	type: string;
}

interface IClass {
	name: string;
	extends?: string;
	properties: IClassProperty[];
}

interface IPoint {
	x: number;
	y: number;
}

interface IRect {
	width: number;
	height: number;
}

interface IBoundingBox {
	left: number;
	right: number;
	top: number;
	bottom: number;
	width: number;
	height: number;
}

