
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
	parentTypeOnly?: string[];
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

interface IAccelerator {
	keyAsString?: string;
	keyAsNumber?: number;
	action: string;
}

interface IRGBPixel {
	r: number;
	g: number;
	b: number;
}

interface IPropertyGroupNested {
	name: string;
	caption: string;
	disabled?: boolean;

	// If this key is defined, it means we're speaking about a group of properties
	children?: IPropertyGroupNested[];

	// If the property is a group, this key is took in consideration
	expanded?: boolean;

	// If this key is defined, it means this property is not a group
	input?: {
		type: string;
		value?: any;
		min?: number;
		max?: number;
		options?: IOption[];
		inputFormat?: string;
		outputFormat?: string;
		precision?: number;
		password?: boolean;
	};
}