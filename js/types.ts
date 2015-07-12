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

	point?: IPoint;

	width: number;
	height: number;
}

// A Form can be in these 5 states
enum EFormState {
	MINIMIZED,
	MAXIMIZED,
	NORMAL,
	FULLSCREEN,
	CLOSED
}

// A Form can have either EBorderStyle.NORMAL, meaning that
// it's titlebar is displayed, either none meaning it has no titlebar at all.
enum EBorderStyle {
	NORMAL,
	NONE
}

// resizable or not?
enum EFormStyle {
	FORM,      // Allows the form to be resized.
	MDI        // MDI doesn't allow the form to be resized.
}

// moveable or not?
enum EFormPosition {
	AUTO,      // moveable
	CENTER     // centered, not moveable
}