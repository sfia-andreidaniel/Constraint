
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

interface IScopeMethod {
	eventName: string;
	methodName: string;
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
	acceptsOnly?: string[];
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

interface INestable extends INameable {
	parent: any;
	isLeaf?: any;
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

interface ITextMetrics {
	width: number;
}

interface ISortOption {
	name: string;
	type: string;
	asc: boolean;
	format?: string;
	callback?: ( a: any, b: any ) => number;
}

interface FTraversor {
	( index: number ) : ETraverseSignal;
}

interface FAggregator {
	( item: any ) : void;
}

interface IOption {
	value: any;
	text : string;
	selected?: boolean;
}

interface IInput {
	value: any;
}