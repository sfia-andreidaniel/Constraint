
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
	childNum?: number;
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

interface IWindow extends IPoint, IRect {

}

interface IBoundingBox {
	left: number;
	right: number;
	top: number;
	bottom: number;
	width: number;
	height: number;
}

interface IIdentifiable {
	id: any;
}

interface INameable extends IIdentifiable {
	name: string;
}

interface IResourceDef {
	file: string;
	versions: string[];
	disabled: boolean;
}

interface IResourceTouple {
	name: string;
	resource: string;
}

interface IResourceFileVersion {
	width?: number;
	height?: number;
	repeatX?: boolean;
	repeatY?: boolean;
	disabled?: boolean;
	window?: IWindow;
}