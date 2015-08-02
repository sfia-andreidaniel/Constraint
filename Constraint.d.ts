declare class Global {
    static env: any;
    static isBrowser: boolean;
}
declare enum EAlignment {
    TOP = 0,
    LEFT = 1,
    RIGHT = 2,
    BOTTOM = 3,
    CENTER = 4,
}
declare enum EFormState {
    NORMAL = 0,
    MINIMIZED = 1,
    MAXIMIZED = 2,
    FULLSCREEN = 3,
    CLOSED = 4,
}
declare enum EBorderStyle {
    NORMAL = 0,
    NONE = 1,
}
declare enum EFormStyle {
    FORM = 0,
    MDI = 1,
}
declare enum EFormPlacement {
    AUTO = 0,
    CENTER = 1,
}
declare enum EResizeType {
    N = 0,
    S = 1,
    W = 2,
    E = 3,
    NW = 4,
    NE = 5,
    SW = 6,
    SE = 7,
    NONE = 8,
}
declare enum EFileSyncMode {
    SYNC = 0,
    ASYNC = 1,
}
declare enum EMenuItemInputType {
    NONE = 0,
    RADIO = 1,
    CHECKBOX = 2,
}
declare enum EColumnType {
    ROW_NUMBER = 0,
    INT = 1,
    FLOAT = 2,
    STRING = 3,
    BOOLEAN = 4,
    DATE = 5,
    TREE = 6,
    BYTES = 7,
}
declare enum ESortState {
    NONE = 0,
    ASC = 1,
    DESC = 2,
}
declare enum ETraverseSignal {
    CONTINUE = 0,
    STOP = 1,
    STOP_RECURSIVE = 2,
    AGGREGATE = 3,
}
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
    callback?: (a: any, b: any) => number;
}
interface FTraversor {
    (index: number): ETraverseSignal;
}
interface FAggregator {
    (item: any): void;
}
/// <reference path="types/enums.d.ts" />
/// <reference path="types/interfaces.d.ts" />
declare class Mixin {
    static extend(classDef: string, withClass: string): void;
}
declare class Utils {
    static arrayMerge(a: any[], b: any[], allowDuplicates?: boolean): any[];
    static ObjectPeek(keys: string[], srcObject: any): any;
    static ObjectExclude(keys: string[], srcObject: any): any;
    static createCircularMap(minValue: number, maxValue: number, currentValue: number, descending?: boolean): number[];
}
declare class Constraint {
    static tokens: {
        "tok_identifier": {
            "regex": RegExp;
            "return": number;
        };
        "tok_optional_identifier": {
            "regex": RegExp;
            "return": number;
        };
        "type_color_named": {
            "regex": RegExp;
            "return": number;
        };
        "type_color_hex": {
            "regex": RegExp;
            "return": number;
        };
        "type_color_rgb": {
            "regex": RegExp;
            "return": number;
        };
        "type_color_rgba": {
            "regex": RegExp;
            "return": number;
        };
        "type_anchor": {
            "regex": RegExp;
            "return": number;
        };
        "type_boolean": {
            "regex": RegExp;
            "return": number;
        };
        "type_null": {
            "regex": RegExp;
            "return": number;
        };
        "type_number": {
            "regex": RegExp;
            "return": number;
        };
        "type_subst": {
            "regex": RegExp;
            "return": number;
        };
        "type_string": {
            "regex": RegExp;
            "return": number;
        };
        "type_enum": {
            "regex": RegExp;
            "return": number;
        };
        "tok_resource": {
            "regex": RegExp;
            "return": number;
        };
        "tok_white_space": {
            "regex": RegExp;
            "return": number;
        };
        "tok_white_space_opt": {
            "regex": RegExp;
            "return": number;
        };
        "tok_comment": {
            "regex": RegExp;
            "return": number;
        };
        "tok_at": {
            "regex": RegExp;
            "return": number;
        };
        "tok_block_start": {
            "regex": RegExp;
            "return": number;
        };
        "tok_block_end": {
            "regex": RegExp;
            "return": number;
        };
        "tok_array_start": {
            "regex": RegExp;
            "return": number;
        };
        "tok_array_end": {
            "regex": RegExp;
            "return": number;
        };
        "tok_coma": {
            "regex": RegExp;
            "return": number;
        };
        "tok_declare": {
            "regex": RegExp;
            "return": number;
        };
        "tok_awaits": {
            "regex": RegExp;
            "return": number;
        };
        "tok_await_type": {
            "regex": RegExp;
            "return": number;
        };
        "tok_attrib": {
            "regex": RegExp;
            "return": number;
        };
        "tok_instruction_end": {
            "regex": RegExp;
            "return": number;
        };
        "tok_eof": {
            "regex": RegExp;
            "return": number;
        };
    };
    static flows: {
        "end_of_file": {
            "flow": string[];
        };
        "white_space": {
            "flow": string[];
        };
        "white_space_opt": {
            "flow": string[];
        };
        "comment": {
            "flow": string[];
        };
        "declaration": {
            "flow": string[];
        };
        "assignment": {
            "flow": string[];
        };
        "object_assignment": {
            "flow": string[];
            "children": string[];
        };
        "type_anonymous_primitive": {
            "flow": string[];
        };
        "type_anonymous_object_assignment": {
            "flow": string[];
            "children": string[];
            "childNum": number;
        };
        "type_anonymous_object": {
            "flow": string[];
            "children": string[];
        };
        "array_literal": {
            "flow": string[];
        };
        "array_separator": {
            "flow": string[];
        };
        "array_assignment": {
            "flow": string[];
            "children": string[];
        };
        "resource_file": {
            "flow": string[];
        };
        "awaits": {
            "flow": string[];
        };
        "scope": {
            "flow": string[];
            "children": string[];
        };
        "document": {
            "flow": string[];
            "children": string[];
        };
    };
    static defs: IClass[];
    static classRegistered(className: string): boolean;
    static registerClass(def: IClass): void;
    static getClassByName(className: string): IClass;
    static getClassPropertyType(className: string, propertyName: string): string;
    static classAcceptsChild(className: string, childType: string): boolean;
    line: number;
    buffer: string;
    scope: Constraint_Scope;
    error: string;
    strict: boolean;
    constructor(buffer: string, strict?: boolean);
    getBuffer(startingFrom?: number): string;
    consume(amount: number): string;
    awaits(awaitType: string, awaitValue: string): void;
    pushs(t: string, n: string): void;
    pops(): void;
    pusho(k: string): void;
    popo(): void;
    asgn(k: string, v: ITokenResult): void;
    resource(v: ITokenResult): void;
    decl(prop: string, val: ITokenResult): void;
    arstart(arrayName: string): void;
    arpush(value: ITokenResult): void;
    arpushliteral(value: any): void;
    arend(): void;
    pushanon(): void;
    popanon(): any;
    pushanonprop(propName: string): void;
    pushanonprim(token: ITokenResult): void;
    compile(): Constraint_Scope;
    $scope(scopeName: string): Constraint_Scope;
    $scopes: string[];
}
declare class Constraint_Token {
    protected def: IToken;
    name: string;
    constructor(def: IToken, tokenName: string);
    static create(tokenStr: string): Constraint_Token;
    exec(s: string): ITokenResult;
}
declare class Constraint_Token_Or extends Constraint_Token {
    protected members: Constraint_Token[];
    constructor(members: Constraint_Token[]);
    exec(s: string): ITokenResult;
}
declare class Constraint_Flow {
    protected tokensStart: Constraint_Token[];
    protected tokensEnd: Constraint_Token[];
    protected children: string[];
    protected $children: Constraint_Flow[];
    protected childLen: number;
    protected name: string;
    constructor(flowDef: IConstraintFlow, flowName: string);
    static create(flowName: string): Constraint_Flow;
    compile(inConstraint: Constraint, initialConsumed?: number, stack?: string): number;
}
declare class Constraint_Scope {
    static _anonymousId: number;
    parent: Constraint_Scope;
    protected root: Constraint_Scope;
    protected _name: string;
    protected type: string;
    protected properties: IProperty[];
    protected children: Constraint_Scope[];
    protected constants: IProperty[];
    protected objectPath: string[];
    global: any;
    protected arrayStack: string[];
    protected strict: boolean;
    protected anonObjStack: any[];
    protected anonObjProps: string[];
    protected _awaits: {
        "resource": any[];
    };
    private _isAnonymous;
    constructor(parentScope?: Constraint_Scope, name?: string, type?: string, strict?: boolean);
    isAnonymous: boolean;
    name: string;
    ownName: string;
    parentOwnName: string;
    awaits(awaitType: string, awaitValue: string): void;
    pushObjectKey(key: string): void;
    popObjectKey(): void;
    assign(keyName: string, value: ITokenResult): void;
    addResource(value: ITokenResult): void;
    arrayStart(keyName: string): void;
    arrayPush(value: ITokenResult): void;
    arrayPushLiteral(value: any): void;
    arrayEnd(): void;
    pushScope(type: string, name: string): Constraint_Scope;
    popScope(): Constraint_Scope;
    pushAnonymousProp(propertyName: string): void;
    protected popAnonymousProp(): void;
    pushAnonymousPrimitive(value: ITokenResult): void;
    pushAnonymousObject(propertyName?: string): void;
    popAnonymousObject(): any;
    declare(constant: string, substitute: ITokenResult): void;
    isset(propertyName: string, type?: string): boolean;
    getConstantValue(constName: string): any;
    toJSON(): any;
    UIElementExists(scopeName: string): boolean;
    UINestingOk(scopeName: string): boolean;
    getPropertyType(propertyName: string): string;
    isNestedInsideScopeType(typeName: string, recursive?: boolean): any;
    $property(propertyName: string): any;
    $name: string;
    $type: string;
    $anonymous: boolean;
    $parentName: string;
    $awaits: any;
    $anonymousStub(rootName: string, indentation: number): string;
    $scopes: Constraint_Scope[];
    $childScopes: Constraint_Scope[];
    $properties: IProperty[];
}
declare class Constraint_Enum {
    value: any;
    literal: string;
    constructor(value: any, literal: string);
    toString(): string;
    toLiteral(): string;
    static create(value: any, literal: string): Constraint_Enum;
}
declare class UI_Anchor_Literal {
    private _literal;
    constructor(anchorDef: IAnchor);
    static create(def: IAnchor): UI_Anchor_Literal;
    def: IAnchor;
    toLiteral(): string;
    toString(): string;
}
declare class UI_Resource_Literal {
    private file;
    private versions;
    private disabled;
    constructor(from: IResourceDef);
    static create(from: IResourceDef): UI_Resource_Literal;
    toString(): string;
}
/// <reference path="Enum.d.ts" />
/// <reference path="../UI/Anchor/Literal.d.ts" />
/// <reference path="../UI/Resource/Literal.d.ts" />
declare class Constraint_Type {
    static create(from: ITokenResult, inContext: Constraint_Scope, inPropertyType?: string, strict?: boolean): any;
    static createResourceDef(from: IResourceDef): UI_Resource_Literal;
    static createAnchorDef(from: ITokenResult, inContext: Constraint_Scope): UI_Anchor_Literal;
}
// Type definitions for es6-promise
// Project: https://github.com/jakearchibald/ES6-Promise
// Definitions by: François de Campredon <https://github.com/fdecampredon/>, vvakame <https://github.com/vvakame>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

interface Thenable<R> {
    then<U>(onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Thenable<U>;
    then<U>(onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => void): Thenable<U>;
}

declare class Promise<R> implements Thenable<R> {
	/**
	 * If you call resolve in the body of the callback passed to the constructor,
	 * your promise is fulfilled with result object passed to resolve.
	 * If you call reject your promise is rejected with the object passed to resolve.
	 * For consistency and debugging (eg stack traces), obj should be an instanceof Error.
	 * Any errors thrown in the constructor callback will be implicitly passed to reject().
	 */
	constructor(callback: (resolve : (value?: R | Thenable<R>) => void, reject: (error?: any) => void) => void);

	/**
	 * onFulfilled is called when/if "promise" resolves. onRejected is called when/if "promise" rejects.
	 * Both are optional, if either/both are omitted the next onFulfilled/onRejected in the chain is called.
	 * Both callbacks have a single parameter , the fulfillment value or rejection reason.
	 * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve.
	 * If an error is thrown in the callback, the returned promise rejects with that error.
	 *
	 * @param onFulfilled called when/if "promise" resolves
	 * @param onRejected called when/if "promise" rejects
	 */
    then<U>(onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Promise<U>;
    then<U>(onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => void): Promise<U>;

	/**
	 * Sugar for promise.then(undefined, onRejected)
	 *
	 * @param onRejected called when/if "promise" rejects
	 */
	catch<U>(onRejected?: (error: any) => U | Thenable<U>): Promise<U>;
}

declare module Promise {
	/**
	 * Make a new promise from the thenable.
	 * A thenable is promise-like in as far as it has a "then" method.
	 */
	function resolve<R>(value?: R | Thenable<R>): Promise<R>;

	/**
	 * Make a promise that rejects to obj. For consistency and debugging (eg stack traces), obj should be an instanceof Error
	 */
	function reject(error: any): Promise<any>;

	/**
	 * Make a promise that fulfills when every item in the array fulfills, and rejects if (and when) any item rejects.
	 * the array passed to all can be a mixture of promise-like objects and other objects.
	 * The fulfillment value is an array (in order) of fulfillment values. The rejection value is the first rejection value.
	 */
	function all<R>(promises: (R | Thenable<R>)[]): Promise<R[]>;

	/**
	 * Make a Promise that fulfills when any item fulfills, and rejects if any item rejects.
	 */
	function race<R>(promises: (R | Thenable<R>)[]): Promise<R>;
}

declare module 'es6-promise' {
	var foo: typeof Promise; // Temp variable to reference Promise in local context
	module rsvp {
		export var Promise: typeof foo;
	}
	export = rsvp;
}declare class UI_Event {
    private $EVENTS_QUEUE;
    private $EVENTS_ENABLED;
    constructor();
    on(eventName: string, callback: (...args) => void): void;
    off(eventName: string, callback: (...args) => void): void;
    fire(eventName: any, ...args: any[]): void;
    setEventingState(enabled: boolean): void;
}
/// <reference path="../es6-promise.d.ts" />
/// <reference path="../UI/Event.d.ts" />
/// <reference path="../Global.d.ts" />
declare class FS_File extends UI_Event {
    private _contents;
    protected _path: string;
    protected _sync: EFileSyncMode;
    protected _error: any;
    constructor(path: string, mode?: EFileSyncMode);
    open(): FS_File;
    promise: Thenable<string>;
    private openFileAjax();
    private openFileNode();
    contents: string;
    static create(fromPath: string, sync?: boolean): FS_File;
    static openAsync(fromPath: string): Thenable<string>;
}
/// <reference path="Constraint.d.ts" />
/// <reference path="Constraint/Token.d.ts" />
/// <reference path="Constraint/Token/Or.d.ts" />
/// <reference path="Constraint/Flow.d.ts" />
/// <reference path="Constraint/Scope.d.ts" />
/// <reference path="Constraint/Type.d.ts" />
/// <reference path="FS/File.d.ts" />
declare class $I {
    static _root_: Constraint;
    static _offline_: boolean;
    static _namespace_: string;
    static _get_(path: string): any;
    static number(path: string): number;
    static string(path: string): string;
    static color(path: string): UI_Color;
    static _parse_(str: string): string;
}
declare class UI_Resource extends UI_Event {
    name: string;
    files: UI_Resource_File[];
    stage: HTMLCanvasElement;
    stageX: HTMLCanvasElement;
    stageY: HTMLCanvasElement;
    protected cssUpdater: UI_Throttler;
    protected styleNode: HTMLStyleElement;
    constructor(resourceName: string);
    ready: boolean;
    ensureFile(fileName: string, buffer: string): UI_Resource_File;
    requestCSSUpdate(): void;
    updateCSS(): void;
    _setupEvents_(): void;
    static resources: UI_Resource[];
    static files: any;
    static addResourceFile(resourceName: string, fileURI: string): void;
    static publishFileVersion(path: string, file: UI_Resource_File, version: IResourceFileVersion): void;
    static createSprite(spritePath: string): UI_Sprite;
    static addResource(buffer: string, resourceName: string): void;
    static queuedResources: string[];
    static loadedResources: string[];
    static failedResources: string[];
    static subscribers: {
        requirements: string[];
        accept: any;
        reject: any;
    }[];
    static onResourceQueue(resourceName: string): void;
    static onResourceStatusChanged(): void;
    static onResourceLoaded(resource: UI_Resource): void;
    static onResourceFailed(resourceName: string): void;
    static require(resources: string[]): Thenable<boolean>;
}
declare class UI_Resource_File extends UI_Event {
    owner: UI_Resource;
    name: string;
    private base64Data;
    protected _versions: IResourceFileVersion[];
    protected _disabled: boolean;
    protected _width: number;
    protected _height: number;
    protected _loaded: boolean;
    protected _error: boolean;
    protected _img: HTMLImageElement;
    constructor(owner: UI_Resource, name: string, base64Data: string);
    private str2ab(str);
    loaded: boolean;
    error: boolean;
    ready: boolean;
    image: HTMLImageElement;
    disabled: boolean;
    versions: IResourceFileVersion[];
    versionExists(v: IResourceFileVersion): boolean;
    addVersion(version: IResourceFileVersion): void;
    addVersionFromString(version: string): void;
}
declare class UI_Sprite extends UI_Event {
    private file;
    private version;
    protected _path: string;
    constructor(file: UI_Resource_File, version: IResourceFileVersion, _path: string);
    cssClasses: string;
    enabled: UI_Sprite;
    disabled: UI_Sprite;
    path: string;
    paintWin(win: UI_Canvas_ContextMapper, x: number, y: number): void;
    paintCtx(ctx: CanvasRenderingContext2D, x: number, y: number): void;
}
declare class UI_Sprite_Null extends UI_Sprite {
    constructor(path: string);
    cssClasses: string;
    enabled: UI_Sprite;
    disabled: UI_Sprite;
    path: string;
    paintWin(win: UI_Canvas_ContextMapper, x: number, y: number): void;
    paintCtx(ctx: CanvasRenderingContext2D, x: number, y: number): void;
}
declare class UI_Dom {
    static _selector_(element: any): any;
    static scrollbarSize: number;
    static hasClass(element: any, className: string): boolean;
    static addClass(element: any, className: string): void;
    static removeClass(element: any, className: string): void;
    static removeClasses(element: any, classes: string[]): void;
    static create(tagName: string, className?: string): any;
}
declare class UI_Color {
    red: number;
    green: number;
    blue: number;
    alpha: number;
    static names: {
        "aliceblue": string;
        "antiquewhite": string;
        "aqua": string;
        "aquamarine": string;
        "azure": string;
        "beige": string;
        "bisque": string;
        "black": string;
        "blanchedalmond": string;
        "blue": string;
        "blueviolet": string;
        "brown": string;
        "burlywood": string;
        "cadetblue": string;
        "chartreuse": string;
        "chocolate": string;
        "coral": string;
        "cornflowerblue": string;
        "cornsilk": string;
        "crimson": string;
        "cyan": string;
        "darkblue": string;
        "darkcyan": string;
        "darkgoldenrod": string;
        "darkgray": string;
        "darkgreen": string;
        "darkkhaki": string;
        "darkmagenta": string;
        "darkolivegreen": string;
        "darkorange": string;
        "darkorchid": string;
        "darkred": string;
        "darksalmon": string;
        "darkseagreen": string;
        "darkslateblue": string;
        "darkslategray": string;
        "darkturquoise": string;
        "darkviolet": string;
        "deeppink": string;
        "deepskyblue": string;
        "dimgray": string;
        "dodgerblue": string;
        "firebrick": string;
        "floralwhite": string;
        "forestgreen": string;
        "fuchsia": string;
        "gainsboro": string;
        "ghostwhite": string;
        "gold": string;
        "goldenrod": string;
        "gray": string;
        "green": string;
        "greenyellow": string;
        "honeydew": string;
        "hotpink": string;
        "indianred  ": string;
        "indigo   ": string;
        "ivory": string;
        "khaki": string;
        "lavender": string;
        "lavenderblush": string;
        "lawngreen": string;
        "lemonchiffon": string;
        "lightblue": string;
        "lightcoral": string;
        "lightcyan": string;
        "lightgoldenrodyellow": string;
        "lightgray": string;
        "lightgreen": string;
        "lightpink": string;
        "lightsalmon": string;
        "lightseagreen": string;
        "lightskyblue": string;
        "lightslategray": string;
        "lightsteelblue": string;
        "lightyellow": string;
        "lime": string;
        "limegreen": string;
        "linen": string;
        "magenta": string;
        "maroon": string;
        "mediumaquamarine": string;
        "mediumblue": string;
        "mediumorchid": string;
        "mediumpurple": string;
        "mediumseagreen": string;
        "mediumslateblue": string;
        "mediumspringgreen": string;
        "mediumturquoise": string;
        "mediumvioletred": string;
        "midnightblue": string;
        "mintcream": string;
        "mistyrose": string;
        "moccasin": string;
        "navajowhite": string;
        "navy": string;
        "oldlace": string;
        "olive": string;
        "olivedrab": string;
        "orange": string;
        "orangered": string;
        "orchid": string;
        "palegoldenrod": string;
        "palegreen": string;
        "paleturquoise": string;
        "palevioletred": string;
        "papayawhip": string;
        "peachpuff": string;
        "peru": string;
        "pink": string;
        "plum": string;
        "powderblue": string;
        "purple": string;
        "rebeccapurple": string;
        "red": string;
        "rosybrown": string;
        "royalblue": string;
        "saddlebrown": string;
        "salmon": string;
        "sandybrown": string;
        "seagreen": string;
        "seashell": string;
        "sienna": string;
        "silver": string;
        "skyblue": string;
        "slateblue": string;
        "slategray": string;
        "snow": string;
        "springgreen": string;
        "steelblue": string;
        "tan": string;
        "teal": string;
        "thistle": string;
        "tomato": string;
        "turquoise": string;
        "violet": string;
        "wheat": string;
        "white": string;
        "whitesmoke": string;
        "yellow": string;
        "yellowgreen": string;
    };
    constructor(red: number, green: number, blue: number, alpha?: number);
    toString(withAlpha?: boolean): string;
    toLiteral(): string;
    static create(str: string): UI_Color;
}
declare function rgb(red: number, green: number, blue: number): string;
declare function rgba(red: number, green: number, blue: number, alpha: number): string;
declare class UI_Throttler extends UI_Event {
    lastRun: number;
    nextRun: number;
    frequency: number;
    callback: (...args) => void;
    constructor(callbackFunction: (...args) => void, frequency?: number);
    run(): void;
}
declare class UI extends UI_Event {
    protected _owner: UI;
    protected _top: UI_Anchor;
    protected _left: UI_Anchor;
    protected _right: UI_Anchor;
    protected _bottom: UI_Anchor;
    protected _width: number;
    protected _height: number;
    protected _minWidth: number;
    protected _minHeight: number;
    protected _padding: UI_Padding;
    protected _children: UI[];
    _root: HTMLDivElement;
    protected _paintable: boolean;
    private _needPaint;
    protected _textAlign: EAlignment;
    private _embrace;
    protected _disabled: boolean;
    protected _parentsDisabled: number;
    protected _disableChildPainting: boolean;
    protected _visible: boolean;
    protected _paintRect: IBoundingBox;
    constructor(owner: UI, mixins?: string[], rootNode?: HTMLDivElement);
    top: any;
    left: any;
    right: any;
    bottom: any;
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
    padding: UI_Padding;
    form: UI_Form;
    owner: UI;
    remove(): UI;
    insert(child: UI): UI;
    protected insertDOMNode(node: UI): UI;
    onRepaint(): boolean;
    offsetRect: IRect;
    clientRect: IRect;
    parentClientRect: IRect;
    boundingBox: IBoundingBox;
    offsetWidth: number;
    offsetHeight: number;
    paintable: boolean;
    translateLeft: number;
    translateTop: number;
    textAlign: EAlignment;
    disabled: boolean;
    onParentDisableStateChange(amount?: number): void;
    protected embrace(interfaceName: string): void;
    visible: boolean;
    childNodes: UI[];
    __class__: string;
    implements(interfaceName: string): boolean;
}
interface IFocusable {
    active: boolean;
    wantTabs: boolean;
    tabIndex: number;
    includeInFocus: boolean;
}
declare class MFocusable extends UI implements IFocusable {
    static isMixin: boolean;
    static initialize(node: UI): void;
    wantTabs: boolean;
    tabIndex: number;
    includeInFocus: boolean;
    active: boolean;
}
interface IRowInterface {
    length: number;
    multiple: boolean;
    itemsPerPage: number;
    isRowSelected: (rowIndex: number) => boolean;
    selectRow: (rowIndex: number, on: boolean) => void;
    onRowIndexClick: (rowIndex: number, shiftKey: boolean, ctrlKey: boolean) => void;
    scrollIntoRow: (rowIndex: number) => void;
}
declare class MRowInterface extends UI implements IRowInterface {
    static isMixin: boolean;
    static skipProperties: string[];
    static forceProperties: string[];
    private _multiple;
    private _selectedIndex;
    length: number;
    itemsPerPage: number;
    static initialize(node: UI): void;
    multiple: boolean;
    isRowSelected(rowIndex: number): boolean;
    selectRow(rowIndex: number, on: boolean): void;
    scrollIntoRow(rowIndex: number): void;
    private ensureNoMultipleItemsAreSelected();
    onRowIndexClick(rowIndex: number, shiftKey?: boolean, ctrlKey?: boolean): void;
    selectedIndex: number;
}
declare class Store extends UI_Event {
    private _autoID;
    protected _id: string;
    protected _items: Store_Item[];
    protected _length: number;
    protected _map: Store_Map;
    private _wr_locks;
    private _rd_locks;
    private _onchanged;
    private _onmetachanged;
    protected _sorting: Store_Map;
    $sorter: (a: any, b: any) => number;
    private $sortFields;
    constructor(uniqueKeyName?: string);
    autoID: number;
    sorter: ISortOption[];
    readable: boolean;
    readLocks: number;
    writable: boolean;
    writeLocks: number;
    items: Store_Item[];
    isTree: boolean;
    protected sort(requestChange?: boolean): void;
    lock(write: boolean): void;
    unlock(write: boolean): void;
    insert(data: any): Store_Item;
    setItems(items: any, fromNested?: boolean, childrenKeyName?: string): void;
    protected pivotInsert(left: number, right: number, item: Store_Item): number;
    itemAt(index: number): Store_Item;
    remove(item: Store_Item): Store_Item;
    removeUniqueId(id: any): void;
    getElementById(id: any): Store_Item;
    requestUpdate($id: any, propertyName?: string): void;
    requestChange(): void;
    requestMetaChange(): void;
    triggerInsertionFlag(): void;
    clear(): void;
    protected onBeforeChange(): void;
    walk(callback: FTraversor, skip?: number, limit?: number, aggregator?: FAggregator): Store;
    createQueryView(query: FTraversor): Store_View;
    getItemIndexById(itemId: any): number;
    length: number;
}
declare class Store_Map {
    private _keys;
    private _size;
    constructor();
    clear(): void;
    has(key: any): boolean;
    get(key: any): any;
    set(key: any, value: any): void;
    delete(key: any): void;
    size: number;
    static validKey(key: any): boolean;
}
declare class Store_Sorter {
    static comparers: number;
    1: any;
}
declare function (a: any, b: any): number;
declare class Store_Item {
    protected data: any;
    protected $store: Store;
    protected $id: any;
    private $dead;
    private $selected;
    constructor(data: any, store: Store, $id: any);
    compare(otherItem: Store_Item): number;
    id: any;
    selected: boolean;
    get(propertyName?: string): any;
    set(propertyName?: string, value?: any): void;
    dead: boolean;
    die(): void;
    remove(): Store_Item;
}
declare class Store_Tree extends Store {
    private _parent;
    private _leaf;
    constructor(uniqueKeyName?: string, parentKeyName?: string, leafKeyName?: string);
    insert(data: any): Store_Item;
    protected sort(requestChange?: boolean, recursive?: boolean): void;
    walk(callback: FTraversor, skip?: number, limit?: number, aggregator?: FAggregator): Store;
    isTree: boolean;
    lengthDepth: number;
    setItems(items: any, fromNested?: boolean, childrenKeyName?: string): void;
    remove(item: Store_Item): Store_Item;
    private dettach(node);
    private attach(node);
    static unnest(data: any, idKeyName?: string, parentKeyName?: string, childrenKeyName?: string, leafKeyName?: string): any[];
}
declare class Store_Node extends Store_Item {
    protected $parent: Store_Node;
    protected $leaf: boolean;
    protected $length: number;
    protected $children: Store_Node[];
    protected $depth: number;
    protected $totalChildren: number;
    protected $collapsed: boolean;
    protected $visible: number;
    $lastChild: boolean;
    constructor(data: any, store: Store_Tree, $id: any, $parent?: Store_Node, $leaf?: boolean);
    protected appendChild(node: Store_Node): Store_Node;
    protected dettach(node: Store_Node): Store_Node;
    protected attach(node: Store_Node): Store_Node;
    move(newParent: Store_Node): void;
    contains(node: Store_Node): boolean;
    protected pivotInsert(left: number, right: number, item: Store_Item): number;
    depth: number;
    length: number;
    lengthDepth: number;
    childNodes: Store_Node[];
    isLeaf: boolean;
    collapsed: boolean;
    idPath: any[];
    expanded: boolean;
    visible: boolean;
    parentNode: Store_Node;
    connectors: number[];
    protected updateLastChildProperty(): void;
    protected computeConnectors(forMyself: boolean): number[];
    updateDepthLength(withRelativeAmount: number): void;
    sort(requestChange?: boolean, recursive?: boolean): void;
    remove(): Store_Item;
}
declare class Store_Cursor {
    protected skip: number;
    protected limit: number;
    protected store: Store;
    constructor(store: Store, totalItems: number, skip?: number, limit?: number);
    each(callback: (index: number) => ETraverseSignal, aggregator?: (item: Store_Item) => void): Store;
}
declare class Store_Cursor_Tree extends Store_Cursor {
    private _visited;
    constructor(store: Store_Tree, totalItems: number, skip?: number, limit?: number);
    each(callback: (index: number) => ETraverseSignal, aggregator?: (item: Store_Item) => void): Store;
}
declare class Store_View extends Store {
    protected _query: FTraversor;
    protected _owner: Store;
    protected _isListening: boolean;
    protected _changeFunc: () => void;
    protected _metaChangeFunc: () => void;
    protected _treeChangeFunc: () => void;
    constructor(owner: Store, query: FTraversor);
    readable: boolean;
    writable: boolean;
    autoID: number;
    readLocks: number;
    writeLocks: number;
    protected sort(requestChange?: boolean): void;
    lock(write: boolean): void;
    unlock(write: boolean): void;
    insert(data: any): Store_Item;
    protected pivotInsert(left: number, right: number, item: Store_Item): number;
    itemAt(index: number): Store_Item;
    remove(item: Store_Item): Store_Item;
    removeUniqueId(id: any): void;
    getElementById(id: any): Store_Item;
    requestUpdate($id: any, propertyName?: string): void;
    requestChange(): void;
    requestMetaChange(): void;
    protected onBeforeChange(): void;
    listen(): void;
    stopListening(): void;
    private update(force?);
}
declare class UI_Anchor {
    protected _target: UI;
    protected _owner: UI;
    protected _alignment: EAlignment;
    protected _distance: number;
    protected _loaded: boolean;
    protected _type: EAlignment;
    constructor(owner: UI, type: EAlignment);
    target: UI;
    owner: UI;
    alignment: EAlignment;
    distance: number;
    oppositeAnchor: UI_Anchor;
    valid: boolean;
    invalidate(): void;
    active: boolean;
    protected requestRepaint(): void;
    load(anotherAnchor: any): void;
    static create(from: IAnchor): UI_Anchor;
}
declare class UI_Anchor_Form extends UI_Anchor {
    constructor(owner: UI, type: EAlignment);
    target: UI;
    alignment: EAlignment;
    valid: boolean;
    distance: number;
}
declare class UI_Padding {
    protected _left: number;
    protected _right: number;
    protected _bottom: number;
    protected _top: number;
    protected _owner: UI;
    constructor(owner: UI);
    left: number;
    right: number;
    top: number;
    bottom: number;
    protected requestRepaint(): void;
}
declare class UI_Canvas_ContextMapper {
    private ctx;
    private size;
    private _paintable;
    constructor(ctx: CanvasRenderingContext2D, size: IWindow);
    left: number;
    top: number;
    width: number;
    height: number;
    paintable: boolean;
    beginPaint(): void;
    endPaint(): void;
    containsAbsolutePoint(x: number, y: number): boolean;
    dotDotDot(s: string, width: number): string;
    imageSmoothingEnabled: boolean;
    clearRect(x: number, y: number, width: number, height: number): void;
    fillRect(x: number, y: number, width: number, height: number): void;
    strokeRect(x: number, y: number, width: number, height: number): void;
    fillText(...args: any[]): void;
    strokeText(text: string, x: number, y: number, maxWidth?: number): void;
    measureText(text: string): ITextMetrics;
    lineWidth: number;
    lineCap: string;
    lineJoin: string;
    miterLimit: number;
    lineDash: any;
    lineDashOffset: number;
    font: string;
    textAlign: string;
    textBaseline: string;
    fillStyle: string;
    strokeStyle: string;
    shadowBlur: number;
    shadowColor: string;
    shadowOffsetX: number;
    shadowOffsetY: number;
    beginPath(): void;
    closePath(): void;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
    rect(x: any, y: any, width: any, height: any): void;
    fill(...args: any[]): void;
    stroke(...args: any[]): void;
    globalAlpha: number;
    globalCompositeOperation: string;
    drawImage(...args: any[]): void;
    createImageData(...args: any[]): ImageData;
    getImageData(sx: number, sy: number, sw: number, sh: number): ImageData;
    putImageData(...args: any[]): void;
    save(): void;
    restore(): void;
}
declare class UI_Screen extends UI_Event {
    private _canvas;
    private _width;
    private _height;
    private _windows;
    private _repainter;
    private _visible;
    private _pointerEvents;
    static get: UI_Screen;
    constructor();
    width: number;
    heigth: number;
    visible: boolean;
    pointerEvents: boolean;
    resize(width: number, height: number): void;
    getWinIndex(win: UI_Screen_Window): number;
    setWinIndex(win: UI_Screen_Window, index: number): void;
    closeWindow(win: UI_Screen_Window): void;
    render(): void;
    open(where: any): void;
    updatePointerEventsState(): void;
    handleMouseDown(ev: any): boolean;
    handleMouseMove(ev: any): boolean;
    handleDoubleClick(ev: any): boolean;
    handleMouseUp(ev: any): boolean;
    handleMouseClick(ev: any): boolean;
    handleKeyDown(ev: any): void;
    private _setupEvents_();
    createWindow(x: number, y: number, width: number, height: number): UI_Screen_Window;
    context: CanvasRenderingContext2D;
    measureText(s: string, font: string): number;
    canPlaceWindow(XDirection: EAlignment, YDirection: EAlignment, point: IPoint, size: IRect): boolean;
    addMargin(wnd: IWindow, amount: number): IWindow;
    getBestPlacementMenuStyle(src: IWindow, dest: IRect, margin?: number): IWindow;
    getBestPlacementDropDownStyle(src: IWindow, dest: IRect, margin?: number): IWindow;
}
declare class UI_Screen_Window extends UI_Event {
    private _screen;
    private _ctx;
    private _mapper;
    constructor(screen: UI_Screen, left?: number, top?: number, width?: number, height?: number);
    left: number;
    top: number;
    width: number;
    height: number;
    ctx: UI_Canvas_ContextMapper;
    zIndex: number;
    render(): void;
    close(): void;
}
declare class UI_DialogManager extends UI_Event {
    static instance: UI_DialogManager;
    windows: UI_Form[];
    desktop: any;
    _desktopWidth: number;
    _desktopHeight: number;
    protected _pointerX: number;
    protected _pointerY: number;
    screen: UI_Screen;
    private _activeWindow;
    constructor();
    pointerX: number;
    pointerY: number;
    desktopWidth: number;
    desktopHeight: number;
    onWindowOpened(win: UI_Form): void;
    onWindowClosed(win: UI_Form): void;
    static get: UI_DialogManager;
    activeWindow: UI_Form;
    getWindowById(winId: number): UI_Form;
    protected handleTabKey(ev: any): void;
    protected handleRegularKey(ev: any): void;
    focusNextElement(): void;
    private _setupEvents_();
}
declare class UI_Form extends UI implements IFocusable {
    static _autoID: number;
    static _theme: {
        "borderWidth": number;
        "titlebarHeight": number;
        "menubarHeight": number;
    };
    protected _state: EFormState;
    protected _borderStyle: EBorderStyle;
    protected _formStyle: EFormStyle;
    protected _placement: EFormPlacement;
    protected _caption: string;
    protected _active: boolean;
    protected _id: number;
    protected _focusComponents: UI[];
    protected _activeElement: UI;
    protected _menuBar: UI_MenuBar;
    wantTabs: boolean;
    tabIndex: number;
    includeInFocus: boolean;
    private _dom;
    constructor();
    __awaits__(what: string): string[];
    getElementByName(elementName: any): UI;
    form: UI_Form;
    open(): Thenable<any>;
    close(): void;
    menuBar: UI_MenuBar;
    state: EFormState;
    borderStyle: EBorderStyle;
    formStyle: EFormStyle;
    placement: EFormPlacement;
    caption: string;
    active: boolean;
    id: number;
    parentClientRect: IRect;
    private _setupEvents_();
    clientRect: IRect;
    translateLeft: number;
    translateTop: number;
    onClose(): boolean;
    protected insertDOMNode(node: UI): UI;
    activeElement: UI;
    focusGroup: UI[];
    focusComponents: UI[];
    protected onChildInserted(node: UI): void;
    insert(child: UI): UI;
    disabled: boolean;
}
declare class UI_Label extends UI {
    static _theme: {
        "defaultWidth": number;
        "defaultHeight": number;
    };
    protected _dom: {
        caption: any;
    };
    protected _caption: string;
    constructor(owner: UI);
    caption: string;
}
declare class UI_Button extends UI implements IFocusable {
    static _theme: {
        "defaultWidth": number;
        "defaultHeight": number;
    };
    protected _dom: {
        "caption": any;
        "icon": any;
    };
    protected _caption: string;
    protected _icon: string;
    protected _textAlign: EAlignment;
    active: boolean;
    wantTabs: boolean;
    tabIndex: number;
    includeInFocus: boolean;
    constructor(owner: UI);
    caption: string;
    icon: string;
    protected _initDom_(): void;
}
declare class UI_CheckBox extends UI implements IFocusable {
    static _theme: {
        "defaultWidth": number;
        "defaultHeight": number;
    };
    protected _dom: {
        "input": any;
        "caption": any;
    };
    active: boolean;
    wantTabs: boolean;
    tabIndex: number;
    includeInFocus: boolean;
    protected _caption: string;
    protected _value: boolean;
    constructor(owner: UI);
    caption: string;
    value: boolean;
    click(): void;
    protected _initDom_(): void;
}
declare class UI_RadioBox extends UI implements IFocusable {
    static _theme: {
        "defaultWidth": number;
        "defaultHeight": number;
    };
    protected _dom: {
        "input": any;
        "caption": any;
    };
    active: boolean;
    wantTabs: boolean;
    tabIndex: number;
    includeInFocus: boolean;
    protected _caption: string;
    protected _value: boolean;
    protected _group: string;
    constructor(owner: UI);
    group: string;
    siblings: UI_RadioBox[];
    caption: string;
    value: boolean;
    click(): void;
    protected _initDom_(): void;
}
declare class UI_Canvas extends UI {
    static _theme: any;
    protected _dom: {
        "canvas": any;
        "fViewport": any;
        "fCanvasSize": any;
        "fHeader": any;
        "viewport": any;
        "canvasSize": any;
    };
    protected _logicalWidth: number;
    protected _logicalHeight: number;
    protected _viewportWidth: number;
    protected _viewportHeight: number;
    protected _scrollLeft: number;
    protected _scrollTop: number;
    protected _hasHeader: boolean;
    protected _freezedWidth: number;
    protected _defaultContext: UI_Canvas_ContextMapper;
    protected _headerContext: UI_Canvas_ContextMapper;
    private _previousViewportWidth;
    private _previousViewportHeight;
    selectedIndex: number;
    rowHeight: number;
    freezedColumns: UI_Column[];
    freeColumns: UI_Column[];
    constructor(owner: UI, mixins?: string[]);
    onRepaint(): boolean;
    insert(child: UI): UI;
    globalContext: CanvasRenderingContext2D;
    defaultContext: UI_Canvas_ContextMapper;
    headerContext: UI_Canvas_ContextMapper;
    header: boolean;
    freezedWidth: number;
    prerender(): void;
    render(): void;
    postrender(): void;
    logicalWidth: number;
    logicalHeight: number;
    scrollTop: number;
    scrollLeft: number;
    viewportWidth: number;
    viewportHeight: number;
    private translateMouseEvent(x, y, target);
    protected _setupEvents_(): void;
    itemAt(index: number): Store_Item;
}
interface IGridInterface {
    columns: (freezed: boolean) => UI_Column[];
    length: number;
    itemAt: (index: number) => Store_Item;
    renderColumns: () => void;
    rowHeight: number;
    itemsPerPage: number;
    yPaintStart: number;
    indexPaintStart: number;
    indexPaintEnd: number;
    freezedColumns: UI_Column[];
    freeColumns: UI_Column[];
}
declare class MGridInterface extends UI_Canvas implements IGridInterface {
    static isMixin: boolean;
    static forceProperties: string[];
    static skipProperties: string[];
    freezedColumns: UI_Column[];
    freeColumns: UI_Column[];
    itemsPerPage: number;
    length: number;
    static initialize(node: UI_Canvas): void;
    columns(freezed?: boolean): UI_Column[];
    renderColumns(): void;
    prerenderFreezed(): void;
    prerenderFree(): void;
    prerender(): void;
    yPaintStart: number;
    indexPaintStart: number;
    indexPaintEnd: number;
    postrender(): void;
    itemAt(index: number): Store_Item;
}
declare class UI_ListBox extends UI_Canvas implements IFocusable, IRowInterface {
    static _theme: any;
    private _options;
    active: boolean;
    wantTabs: boolean;
    tabIndex: number;
    includeInFocus: boolean;
    selectedIndex: number;
    multiple: boolean;
    private _render;
    constructor(owner: UI);
    protected _setupExtendedEvents_(): void;
    options: INameable[];
    render(): void;
    paint(): void;
    length: number;
    itemsPerPage: number;
    onRowIndexClick(rowIndex: number, shiftKey?: boolean, ctrlKey?: boolean): void;
    isRowSelected(rowIndex: number): boolean;
    selectRow(rowIndex: number, on: boolean): void;
    scrollIntoRow(rowIndex: number): void;
    value: any;
    values: any[];
}
declare class UI_TabsPanel extends UI implements IFocusable {
    static _theme: any;
    protected _dom: any;
    protected _activeTab: UI_Tab;
    active: boolean;
    wantTabs: boolean;
    tabIndex: number;
    includeInFocus: boolean;
    constructor(owner: UI);
    insert(child: UI): UI;
    activeTab: UI_Tab;
    private _initDom_();
    focusTab(relative: number): void;
    protected insertDOMNode(node: UI): UI;
}
declare class UI_Tab extends UI {
    protected _dom: any;
    protected _caption: string;
    constructor(owner: UI);
    caption: string;
    tabElement: HTMLDivElement;
    private createDOM();
    remove(): UI;
    protected insertDOMNode(node: UI): UI;
    _setupEvents_(): void;
}
declare class UI_VerticalSplitter extends UI {
    static _theme: any;
    protected _anchorType: EAlignment;
    protected _minDistance: number;
    constructor(owner: UI);
    _rootClassName: string;
    anchor: UI_Anchor;
    anchorType: EAlignment;
    minDistance: number;
    distance: number;
    protected setupMouseEvents(): void;
    protected _setupEvents_(): void;
}
declare class UI_HorizontalSplitter extends UI_VerticalSplitter {
    static _theme: any;
    constructor(owner: UI);
    _rootClassName: string;
    anchorType: EAlignment;
    protected _setupEvents_(): void;
}
declare class UI_Panel extends UI {
    protected _dom: any;
    protected _logicalWidth: number;
    protected _logicalHeight: number;
    constructor(owner: UI);
    logicalWidth: number;
    logicalHeight: number;
    clientRect: IRect;
    private getDOM();
    protected insertDOMNode(node: UI): UI;
}
declare class UI_MenuBar extends UI implements IFocusable {
    active: boolean;
    wantTabs: boolean;
    tabIndex: number;
    includeInFocus: boolean;
    protected _focusedItem: UI_MenuItem;
    constructor(owner: UI);
    insert(child: UI): UI;
    target: UI;
    focusedItem: UI_MenuItem;
    protected focusItem(relative: number): void;
    protected _setupEvents_(): void;
}
declare class UI_MenuItem extends UI {
    static _theme: any;
    static FLAG_ICON: number;
    static FLAG_INPUT: number;
    static FLAG_LABEL: number;
    static FLAG_KBD: number;
    static FLAG_CHILDREN: number;
    renderFlags: number[];
    renderRect: IWindow;
    protected _caption: string;
    protected _inputType: EMenuItemInputType;
    protected _shortcutKey: string;
    protected _icon: UI_Sprite;
    protected _checked: boolean;
    protected _groupName: string;
    protected _action: string;
    protected _id: string;
    protected _overlay: UI_Screen_Window;
    protected _overlayMouseDownHandler: (x: number, y: number, button: number) => void;
    protected _menuBarRootNode: any;
    protected _selectedIndex: number;
    constructor(owner: UI);
    caption: string;
    inputType: EMenuItemInputType;
    checked: boolean;
    groupName: string;
    shortcutKey: string;
    private createMenuBarNode();
    target: UI;
    id: string;
    click(): void;
    menuBarNode: HTMLDivElement;
    private _setupEvents_();
    action: string;
    icon: string;
    isOpened: boolean;
    insert(child: UI): UI;
    onRepaint(): boolean;
    computeRenderFlags(): number[];
    width: number;
    height: number;
    render(): void;
    paintAt(top: number, win: UI_Screen_Window, paintActive: boolean): void;
    onScreenMouseMove(x: number, y: number, button: number): void;
    onScreenClick(x: number, y: number, button: number): void;
    modifySelectedIndex(relative: number): void;
    onScreenKeyDown(evt: any): void;
    onScreenMouseDown(x: number, y: number, button: number): void;
    close(untilRoot?: boolean): void;
    openAtXY(x: number, y: number, size: IRect): boolean;
    selectedIndex: number;
    open(): void;
}
declare class UI_Tree extends UI_Canvas implements IFocusable, IRowInterface {
    static _theme: any;
    active: boolean;
    wantTabs: boolean;
    tabIndex: number;
    includeInFocus: boolean;
    selectedIndex: number;
    multiple: boolean;
    protected _items: Store_Tree;
    protected _view: Store_View;
    private _render;
    private _selectedIndexPath;
    protected _name: string;
    protected _icon: string;
    constructor(owner: UI, mixins?: string[]);
    rowHeight: number;
    paintContext: UI_Canvas_ContextMapper;
    protected setupMouseHandler(): void;
    protected _setupExtendedEvents_(): void;
    items: INestable[];
    nestedItems: any;
    store: Store_Tree;
    nameField: string;
    iconField: string;
    private restoreSelectedIndex();
    private onRowExpanderClick(rowIndex);
    private collapseNode();
    private expandNode();
    render(): void;
    itemAt(index: number): Store_Item;
    paint(): void;
    value: any;
    values: any[];
    length: number;
    itemsPerPage: number;
    isRowSelected(rowIndex: number): boolean;
    selectRow(rowIndex: number, on: boolean): void;
    scrollIntoRow(rowIndex: number): void;
    onRowIndexClick(rowIndex: number, shiftKey?: boolean, ctrlKey?: boolean): void;
}
declare class UI_Tree_Grid extends UI_Tree implements IGridInterface {
    private _paintContextColumn;
    yPaintStart: number;
    indexPaintStart: number;
    indexPaintEnd: number;
    constructor(owner: UI, mixins?: string[]);
    protected setupMouseHandler(): void;
    renderColumns(): void;
    paint(): void;
    columns(freezed?: boolean): UI_Column[];
}
declare class UI_Column extends UI {
    static _theme: any;
    protected _name: string;
    protected _caption: string;
    protected _type: EColumnType;
    protected _renderer: UI_Column_Renderer;
    protected _freezed: boolean;
    protected _sortable: boolean;
    protected _sortState: ESortState;
    protected _resizable: boolean;
    protected _visible: boolean;
    protected _precision: number;
    protected _headerContext: UI_Canvas_ContextMapper;
    protected _canvasContext: UI_Canvas_ContextMapper;
    constructor(owner: UI);
    scrollTop: number;
    itemAt(index: number): Store_Item;
    headerContext: UI_Canvas_ContextMapper;
    canvasContext: UI_Canvas_ContextMapper;
    name: string;
    precision: number;
    caption: string;
    type: EColumnType;
    renderer: UI_Column_Renderer;
    freezed: boolean;
    sortable: boolean;
    sortState: ESortState;
    resizable: boolean;
    height: number;
    width: number;
    visible: boolean;
    target: MGridInterface;
    paintHeader(): void;
    paintEdge(): void;
    remove(): UI;
}
declare class UI_Column_Renderer {
    protected _column: UI_Column;
    constructor(column: UI_Column);
    render(): void;
    onMouseDown(point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean): void;
    onMouseUp(point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean): void;
    onMouseMove(point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean): void;
    onClick(point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean): void;
    onDblClick(point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean): void;
    static createForType(type: EColumnType, inColumn: UI_Column): UI_Column_Renderer_RowNumber;
}
declare class UI_Column_Renderer_Tree extends UI_Column_Renderer {
    onClick(point: IPoint, which: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean): void;
    render(): void;
}
declare class UI_Column_Renderer_Int extends UI_Column_Renderer {
    render(): void;
}
declare class UI_Column_Renderer_Float extends UI_Column_Renderer {
    render(): void;
}
declare class UI_Column_Renderer_RowNumber extends UI_Column_Renderer {
    render(): void;
}
declare class UI_Column_Renderer_String extends UI_Column_Renderer {
    render(): void;
}
declare class UI_Column_Renderer_Boolean extends UI_Column_Renderer {
    render(): void;
}
declare class UI_Column_Renderer_Bytes extends UI_Column_Renderer {
    static sizeLabels: string[];
    static formatSize(size: number, precision: number): string;
    render(): void;
}
/// <reference path="Global.d.ts" />
/// <reference path="types.d.ts" />
/// <reference path="Mixin.d.ts" />
/// <reference path="Utils.d.ts" />
/// <reference path="Constraint.d.ts" />
/// <reference path="Constraint/Token.d.ts" />
/// <reference path="Constraint/Token/Or.d.ts" />
/// <reference path="Constraint/Flow.d.ts" />
/// <reference path="Constraint/Scope.d.ts" />
/// <reference path="Constraint/Enum.d.ts" />
/// <reference path="Constraint/Type.d.ts" />
/// <reference path="$I.d.ts" />
/// <reference path="UI/Resource.d.ts" />
/// <reference path="UI/Resource/File.d.ts" />
/// <reference path="UI/Sprite.d.ts" />
/// <reference path="UI/Sprite/Null.d.ts" />
/// <reference path="UI/Dom.d.ts" />
/// <reference path="UI/Color.d.ts" />
/// <reference path="UI/Event.d.ts" />
/// <reference path="UI/Throttler.d.ts" />
/// <reference path="UI.d.ts" />
/// <reference path="Mixins/MFocusable.d.ts" />
/// <reference path="Mixins/MRowInterface.d.ts" />
/// <reference path="Store.d.ts" />
/// <reference path="Store/Map.d.ts" />
/// <reference path="Store/Sorter.d.ts" />
/// <reference path="Store/Item.d.ts" />
/// <reference path="Store/Tree.d.ts" />
/// <reference path="Store/Node.d.ts" />
/// <reference path="Store/Cursor.d.ts" />
/// <reference path="Store/Cursor/Tree.d.ts" />
/// <reference path="Store/View.d.ts" />
/// <reference path="UI/Anchor.d.ts" />
/// <reference path="UI/Anchor/Form.d.ts" />
/// <reference path="UI/Padding.d.ts" />
/// <reference path="UI/Canvas/ContextMapper.d.ts" />
/// <reference path="UI/Screen.d.ts" />
/// <reference path="UI/Screen/Window.d.ts" />
/// <reference path="UI/DialogManager.d.ts" />
/// <reference path="UI/Form.d.ts" />
/// <reference path="UI/Label.d.ts" />
/// <reference path="UI/Button.d.ts" />
/// <reference path="UI/CheckBox.d.ts" />
/// <reference path="UI/RadioBox.d.ts" />
/// <reference path="UI/Canvas.d.ts" />
/// <reference path="Mixins/MGridInterface.d.ts" />
/// <reference path="UI/ListBox.d.ts" />
/// <reference path="UI/TabsPanel.d.ts" />
/// <reference path="UI/Tab.d.ts" />
/// <reference path="UI/VerticalSplitter.d.ts" />
/// <reference path="UI/HorizontalSplitter.d.ts" />
/// <reference path="UI/Panel.d.ts" />
/// <reference path="UI/MenuBar.d.ts" />
/// <reference path="UI/MenuItem.d.ts" />
/// <reference path="UI/Tree.d.ts" />
/// <reference path="UI/Tree/Grid.d.ts" />
/// <reference path="UI/Column.d.ts" />
/// <reference path="UI/Column/Renderer.d.ts" />
/// <reference path="UI/Column/Renderer/Tree.d.ts" />
/// <reference path="UI/Column/Renderer/Int.d.ts" />
/// <reference path="UI/Column/Renderer/Float.d.ts" />
/// <reference path="UI/Column/Renderer/RowNumber.d.ts" />
/// <reference path="UI/Column/Renderer/String.d.ts" />
/// <reference path="UI/Column/Renderer/Boolean.d.ts" />
/// <reference path="UI/Column/Renderer/Bytes.d.ts" />
