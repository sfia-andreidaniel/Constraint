var EAlignment;
(function (EAlignment) {
    EAlignment[EAlignment["TOP"] = 0] = "TOP";
    EAlignment[EAlignment["LEFT"] = 1] = "LEFT";
    EAlignment[EAlignment["RIGHT"] = 2] = "RIGHT";
    EAlignment[EAlignment["BOTTOM"] = 3] = "BOTTOM";
    EAlignment[EAlignment["CENTER"] = 4] = "CENTER";
})(EAlignment || (EAlignment = {}));
// A Form can be in these 5 states
var EFormState;
(function (EFormState) {
    EFormState[EFormState["MINIMIZED"] = 0] = "MINIMIZED";
    EFormState[EFormState["MAXIMIZED"] = 1] = "MAXIMIZED";
    EFormState[EFormState["NORMAL"] = 2] = "NORMAL";
    EFormState[EFormState["FULLSCREEN"] = 3] = "FULLSCREEN";
    EFormState[EFormState["CLOSED"] = 4] = "CLOSED";
})(EFormState || (EFormState = {}));
// A Form can have either EBorderStyle.NORMAL, meaning that
// it's titlebar is displayed, either none meaning it has no titlebar at all.
var EBorderStyle;
(function (EBorderStyle) {
    EBorderStyle[EBorderStyle["NORMAL"] = 0] = "NORMAL";
    EBorderStyle[EBorderStyle["NONE"] = 1] = "NONE";
})(EBorderStyle || (EBorderStyle = {}));
// resizable or not?
var EFormStyle;
(function (EFormStyle) {
    EFormStyle[EFormStyle["FORM"] = 0] = "FORM";
    EFormStyle[EFormStyle["MDI"] = 1] = "MDI"; // MDI doesn't allow the form to be resized.
})(EFormStyle || (EFormStyle = {}));
// moveable or not?
var EFormPosition;
(function (EFormPosition) {
    EFormPosition[EFormPosition["AUTO"] = 0] = "AUTO";
    EFormPosition[EFormPosition["CENTER"] = 1] = "CENTER"; // centered, not moveable
})(EFormPosition || (EFormPosition = {}));
// Main library file.
var Constraint = (function () {
    function Constraint(buffer, strict) {
        if (strict === void 0) { strict = false; }
        // should be null after parse.
        // if non null, returns the line on which compiler encountered error.
        this.line = null;
        this.buffer = '';
        this.scope = null;
        this.error = '';
        this.strict = false;
        this.buffer = buffer;
    }
    Constraint.classRegistered = function (className) {
        for (var i = 0, len = Constraint.defs.length; i < len; i++) {
            if (Constraint.defs[i].name == className) {
                return true;
            }
        }
        return false;
    };
    Constraint.registerClass = function (def) {
        if (Constraint.classRegistered(def.name)) {
            throw Error('Class "' + def.name + '" is allready registered!');
        }
        if (def.extends) {
            if (!Constraint.classRegistered(def.extends)) {
                throw Error('Class "' + def.name + '" extends class "' + def.extends + '", but such class was not registered!');
            }
        }
        Constraint.defs.push(def);
    };
    Constraint.getClassByName = function (className) {
        for (var i = 0, len = Constraint.defs.length; i < len; i++) {
            if (Constraint.defs[i].name == className) {
                return Constraint.defs[i];
            }
        }
        return null;
    };
    Constraint.getClassPropertyType = function (className, propertyName) {
        var def = Constraint.getClassByName(className);
        if (!def) {
            return null;
        }
        for (var i = 0, len = def.properties.length; i < len; i++) {
            if (def.properties[i].name == propertyName) {
                return def.properties[i].type;
            }
        }
        if (def.extends) {
            return Constraint.getClassPropertyType(def.extends, propertyName);
        }
        else {
            return null;
        }
    };
    Constraint.prototype.getBuffer = function (startingFrom) {
        if (startingFrom === void 0) { startingFrom = 0; }
        return !startingFrom ? this.buffer : this.buffer.substr(startingFrom);
    };
    Constraint.prototype.consume = function (amount) {
        var sub = this.buffer.substr(0, amount);
        this.buffer = this.buffer.substr(amount);
        for (var i = 0, len = sub.length; i < len; i++) {
            if (sub[i] == '\n') {
                this.line++;
            }
        }
        return this.buffer;
    };
    // creates a scope inside the current scope with the name "n", and type "t" and returns it.
    // the scope changes.
    Constraint.prototype.pushs = function (t, n) {
        this.scope = this.scope.pushScope(t, n);
    };
    // pops one scope level up
    Constraint.prototype.pops = function () {
        this.scope = this.scope.popScope();
    };
    Constraint.prototype.pusho = function (k) {
        this.scope.pushObjectKey(k);
    };
    Constraint.prototype.popo = function () {
        this.scope.popObjectKey();
    };
    // @alias of this.scope.assign( k, v )
    Constraint.prototype.asgn = function (k, v) {
        this.scope.assign(k, v);
    };
    Constraint.prototype.decl = function (prop, val) {
        this.scope.declare(prop, val);
    };
    Constraint.prototype.arstart = function (arrayName) {
        this.scope.arrayStart(arrayName);
    };
    Constraint.prototype.arpush = function (value) {
        this.scope.arrayPush(value);
    };
    Constraint.prototype.arend = function () {
        this.scope.arrayEnd();
    };
    Constraint.prototype.compile = function () {
        this.scope = new Constraint_Scope(null, 'resource', 'document', this.strict);
        this.line = 1;
        this.error = null;
        var doc = Constraint_Flow.create('document'), masterScope = this.scope;
        try {
            var len = doc.compile(this);
            this.consume(len);
            if (this.buffer)
                throw Error('Unexpected remaining buffer!');
            return this.scope = masterScope;
        }
        catch (err) {
            this.error = '@line: ' + this.line + ': ' + err;
            console.error(err);
            throw SyntaxError(this.error);
        }
    };
    Constraint.prototype.$scope = function (scopeName) {
        return typeof this.scope.global[scopeName] == 'undefined' ? null : this.scope.global[scopeName];
    };
    Object.defineProperty(Constraint.prototype, "$scopes", {
        get: function () {
            var out = [];
            for (var k in this.scope.global) {
                if (this.scope.global.hasOwnProperty(k)) {
                    out.push(k);
                }
            }
            return out;
        },
        enumerable: true,
        configurable: true
    });
    Constraint.tokens = {
        // matches: "$foo ", "fooApplication ", with no white spaces before
        "tok_identifier": {
            "regex": /^([a-z_\$]([a-z_\$\d]+)?)/i,
            "return": 1
        },
        // matches standard html colors by their name
        "type_color_named": {
            "regex": /^(aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen)/,
            "return": 1
        },
        // matches "#fff", "#fd235a", "#ff325352"
        "type_color_hex": {
            "regex": /^(\#([a-f\d]{8}|[a-f\d]{6}|[a-f\d]{3}))/,
            "return": 1
        },
        // matches "rgb(231,231, 13)"
        "type_color_rgb": {
            "regex": /^rgb\(([\s]+)?([\d]+)([\s]+)?\,([\s]+)?([\d]+)([\s]+)?\,([\s]+)?([\d]+)([\s]+)?\)/,
            "return": 0
        },
        // matches "rgba( 1, 213, 21, 13 )"
        "type_color_rgba": {
            "regex": /^rgba\(([\s]+)?([\d]+)([\s]+)?\,([\s]+)?([\d]+)([\s]+)?\,([\s]+)?([\d]+)([\s]+)?\,([\s]+)?([\d]+)([\s]+)?\)/,
            "return": 0
        },
        "type_anchor": {
            "regex": /^([a-z\$_]([a-z\$_\d]+)?)[\s]+(center|middle|((top|bottom|left|right)[\s]+[\d]+))/i,
            "return": 0
        },
        // matches yes, no, true, false
        "type_boolean": {
            "regex": /^(yes|no|true|false)/,
            "return": 0
        },
        "type_null": {
            "regex": /^null/i,
            "return": 0
        },
        // obvious, this matches a number
        "type_number": {
            "regex": /^(\-)?([\d]([\d]+)?(\.[\d]([\d]+))?|\.[\d]([\d]+)?)/,
            "return": 0
        },
        "type_subst": {
            "regex": /^\$([a-z\_\$]([a-z\_\$\d]+))/i,
            "return": 1
        },
        // this matches = string enclosed in simple "'" signs.
        "type_string": {
            "regex": /^('[^'\n\r]+')+/,
            "return": 0
        },
        // this matches a white space.
        "tok_white_space": {
            "regex": /^[\s]+/,
            "return": 0
        },
        // this matches an optional white space.
        "tok_white_space_opt": {
            "regex": /^([\s]+)?/,
            "return": 0
        },
        // this matches a comment
        "tok_comment": {
            "regex": /^\/\/[^\n\r]+/,
            "return": 0
        },
        "tok_at": {
            "regex": /^@/,
            "return": 0
        },
        "tok_block_start": {
            "regex": /^\{/,
            "return": 0
        },
        "tok_block_end": {
            "regex": /^\}/,
            "return": 0
        },
        "tok_array_start": {
            "regex": /^\[/,
            "return": 0
        },
        "tok_array_end": {
            "regex": /^\]/,
            "return": 0
        },
        "tok_coma": {
            "regex": /^\,/,
            "return": 0
        },
        "tok_declare": {
            "regex": /^\$declare/,
            "return": 0
        },
        "tok_attrib": {
            "regex": /^\:/,
            "return": 0
        },
        "tok_instruction_end": {
            "regex": /^\;/,
            "return": 0
        },
        "tok_eof": {
            "regex": /$/,
            "return": 0
        }
    };
    Constraint.flows = {
        "end_of_file": {
            "flow": [
                "tok_eof"
            ]
        },
        "white_space": {
            "flow": [
                "tok_white_space"
            ]
        },
        "white_space_opt": {
            "flow": [
                "tok_white_space_opt"
            ]
        },
        "comment": {
            "flow": [
                "tok_comment"
            ]
        },
        "declaration": {
            "flow": [
                "tok_declare",
                "tok_white_space",
                "tok_identifier",
                "tok_white_space_opt",
                "tok_attrib",
                "tok_white_space_opt",
                "type_color_named|type_color_hex|type_color_rgba|type_color_rgb|type_string|type_number|type_boolean|type_anchor|type_null",
                "tok_instruction_end"
            ]
        },
        "assignment": {
            "flow": [
                "tok_identifier",
                "tok_white_space_opt",
                "tok_attrib",
                "tok_white_space_opt",
                "type_color_named|type_color_hex|type_color_rgba|type_color_rgb|type_string|type_number|type_boolean|type_anchor|type_subst|type_null",
                "tok_white_space_opt",
                "tok_instruction_end"
            ]
        },
        "object_assignment": {
            "flow": [
                "tok_identifier",
                "tok_white_space_opt",
                "tok_attrib",
                "tok_white_space_opt",
                "tok_block_start",
                "@children",
                "tok_block_end",
                "tok_instruction_end"
            ],
            "children": [
                "white_space",
                "comment",
                "assignment",
                "object_assignment",
                "array_assignment"
            ]
        },
        "array_literal": {
            "flow": [
                "type_color_named|type_color_hex|type_color_rgba|type_color_rgb|type_string|type_number|type_boolean|type_anchor|type_null"
            ]
        },
        "array_separator": {
            "flow": [
                "tok_white_space|tok_coma"
            ]
        },
        "array_assignment": {
            "flow": [
                "tok_identifier",
                "tok_white_space_opt",
                "tok_attrib",
                "tok_white_space_opt",
                "tok_array_start",
                "@children",
                "tok_array_end",
                "tok_instruction_end"
            ],
            "children": [
                "array_separator",
                "array_literal"
            ]
        },
        "scope": {
            "flow": [
                "tok_white_space_opt",
                "tok_at",
                "tok_identifier",
                "tok_white_space",
                "tok_identifier",
                "tok_white_space_opt",
                "tok_block_start",
                "@children",
                "tok_white_space_opt",
                "tok_block_end",
                "tok_instruction_end"
            ],
            "children": [
                "comment",
                "declaration",
                "assignment",
                "object_assignment",
                "array_assignment",
                "scope",
                "white_space"
            ]
        },
        "document": {
            "flow": [
                "tok_white_space_opt",
                "@children",
                "tok_eof"
            ],
            "children": [
                "scope",
                "white_space",
                "comment"
            ]
        }
    };
    Constraint.defs = [];
    return Constraint;
})();
var Constraint_Token = (function () {
    function Constraint_Token(def, tokenName) {
        this.def = null;
        this.name = 'token';
        this.def = def;
        this.name = tokenName;
    }
    Constraint_Token.create = function (tokenStr) {
        var parts = tokenStr.split('|'), out = null, tokName;
        if (parts.length > 1) {
            out = [];
            for (var i = 0, len = parts.length; i < len; i++) {
                out.push(Constraint_Token.create(parts[i]));
            }
            return new Constraint_Token_Or(out);
        }
        else {
            tokName = parts[0];
            if (typeof Constraint.tokens[tokName] == 'undefined') {
                console.warn('token: ' + tokName + ' doesn\'t exist!');
                throw Error('Token "' + tokName + '" is not defined!');
            }
            return new Constraint_Token(Constraint.tokens[tokName], tokName);
        }
    };
    // executes a token. if execution fails, returns null.
    // otherwise returns { "result": value, "length": number }
    Constraint_Token.prototype.exec = function (s) {
        var matches = this.def.regex.exec(s);
        if (!matches) {
            return null;
        }
        else {
            return {
                "result": matches[this.def['return']],
                "length": matches[0].length,
                "type": this.name
            };
        }
    };
    return Constraint_Token;
})();
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Constraint_Token_Or = (function (_super) {
    __extends(Constraint_Token_Or, _super);
    function Constraint_Token_Or(members) {
        _super.call(this, null, '');
        this.members = null;
        this.members = members;
        this.name = 'token_or(' + (function () {
            var out = [];
            for (var i = 0, len = members.length; i < len; i++) {
                out.push(members[i].name);
            }
            return out.join(',') || 'null';
        })() + ')';
    }
    Constraint_Token_Or.prototype.exec = function (s) {
        var result;
        for (var i = 0, len = this.members.length; i < len; i++) {
            if (result = this.members[i].exec(s)) {
                return result;
            }
        }
        return null;
    };
    return Constraint_Token_Or;
})(Constraint_Token);
var Constraint_Flow = (function () {
    function Constraint_Flow(flowDef, flowName) {
        this.tokensStart = [];
        this.tokensEnd = [];
        this.children = [];
        this.$children = null;
        this.name = 'Flow';
        this.name = flowName;
        var addStart = true, hasChildren = false;
        for (var i = 0, len = flowDef.flow.length; i < len; i++) {
            if (flowDef.flow[i] == '@children') {
                if (!addStart) {
                    throw Error('Bad flow (' + this.name + ') definition. Cannot have more than 1 @children blocks');
                }
                else {
                    addStart = false;
                    hasChildren = true;
                }
            }
            else {
                if (addStart) {
                    this.tokensStart.push(Constraint_Token.create(flowDef.flow[i]));
                }
                else {
                    this.tokensEnd.push(Constraint_Token.create(flowDef.flow[i]));
                }
            }
        }
        if (hasChildren) {
            if (typeof flowDef.children == 'undefined') {
                throw Error('Flow ' + this.name + ' requires a "children" block!');
            }
            for (var i = 0, len = flowDef.children.length; i < len; i++) {
                // we store the flow childrens as strings, not as object, in order to avoid recursivity.
                this.children.push(flowDef.children[i]);
            }
        }
    }
    Constraint_Flow.create = function (flowName) {
        if (typeof Constraint.flows[flowName] == 'undefined') {
            console.warn(flowName + ' doesn\'t exist!');
            throw Error('Failed to create flow "' + flowName + '": flow is not defined');
        }
        return new Constraint_Flow(Constraint.flows[flowName], flowName);
    };
    Constraint_Flow.prototype.compile = function (inConstraint, initialConsumed, stack) {
        if (initialConsumed === void 0) { initialConsumed = 0; }
        if (stack === void 0) { stack = ''; }
        var consume = initialConsumed, buffer = inConstraint.getBuffer(initialConsumed), result, childParsed, consumeAdd = 0, atLeastOneChildParsed = false, dstack = stack == '' ? this.name : stack + '.' + this.name, rstart = [], rend = [];
        for (var i = 0, len = this.tokensStart.length; i < len; i++) {
            if (result = this.tokensStart[i].exec(buffer)) {
                consume += result.length;
                if (result.length > 0)
                    buffer = inConstraint.getBuffer(consume);
                rstart.push(result);
            }
            else {
                return -1;
            }
        }
        switch (this.name) {
            case 'scope':
                inConstraint.pushs(rstart[2].result, rstart[4].result);
                break;
            case 'object_assignment':
                inConstraint.pusho(rstart[0].result);
                break;
            case 'array_assignment':
                inConstraint.arstart(rstart[0].result);
                break;
        }
        // PARSE CHILDREN IF ANY
        if (this.children.length > 0) {
            if (this.$children === null) {
                this.$children = [];
                for (var i = 0, len = this.children.length; i < len; i++) {
                    this.$children.push(Constraint_Flow.create(this.children[i]));
                }
            }
            do {
                childParsed = false;
                for (var i = 0, len = this.$children.length; i < len; i++) {
                    if ((consumeAdd = this.$children[i].compile(inConstraint, consume, dstack)) >= 0) {
                        consume = consumeAdd;
                        buffer = inConstraint.getBuffer(consume);
                        childParsed = true;
                        atLeastOneChildParsed = true;
                        break;
                    }
                    else {
                    }
                }
            } while (childParsed);
        }
        for (var i = 0, len = this.tokensEnd.length; i < len; i++) {
            if (result = this.tokensEnd[i].exec(buffer)) {
                consume += result.length;
                buffer = inConstraint.getBuffer(consume);
                rend.push(result.result);
            }
            else {
                return -1;
            }
        }
        inConstraint.consume(consume);
        consume = 0;
        switch (this.name) {
            case 'declaration':
                inConstraint.decl((rstart[2].result), rstart[6]);
                break;
            case 'comment':
                break;
            case 'assignment':
                inConstraint.asgn(rstart[0].result, rstart[4]);
                break;
            case 'scope':
                inConstraint.pops();
                break;
            case 'object_assignment':
                inConstraint.popo();
                break;
            case 'array_literal':
                inConstraint.arpush(rstart[0]);
                break;
            case 'array_assignment':
                inConstraint.arend();
                break;
            default:
        }
        return consume;
    };
    return Constraint_Flow;
})();
var Constraint_Scope = (function () {
    function Constraint_Scope(parentScope, name, type, strict) {
        if (parentScope === void 0) { parentScope = null; }
        if (name === void 0) { name = ''; }
        if (type === void 0) { type = ''; }
        if (strict === void 0) { strict = false; }
        this._name = null;
        this.type = null;
        this.properties = [];
        this.children = [];
        this.constants = [];
        this.objectPath = [];
        this.global = null;
        this.arrayStack = [];
        this.strict = false;
        this.strict = strict;
        this.parent = parentScope;
        this.root = parentScope === null ? this : parentScope.root;
        if (!parentScope) {
            this.global = {};
        }
        this._name = name;
        this.type = type;
    }
    Object.defineProperty(Constraint_Scope.prototype, "name", {
        get: function () {
            return this.parent === null ? this._name : this.parent._name + '.' + this._name;
        },
        enumerable: true,
        configurable: true
    });
    Constraint_Scope.prototype.pushObjectKey = function (key) {
        this.objectPath.push(key);
    };
    Constraint_Scope.prototype.popObjectKey = function () {
        if (this.objectPath.length == 0) {
            throw Error("Cannot pop object path");
        }
        else {
            this.objectPath.pop();
        }
    };
    Constraint_Scope.prototype.assign = function (keyName, value) {
        var k = this.objectPath.length ? this.objectPath.join('.') + '.' + keyName : keyName;
        for (var i = 0, len = this.properties.length; i < len; i++) {
            if (this.properties[i].name == k) {
                throw Error('Duplicate identifier "' + k + '" in scope ' + this.name);
            }
        }
        this.properties.push({
            "name": k,
            "value": Constraint_Type.create(value, this)
        });
    };
    Constraint_Scope.prototype.arrayStart = function (keyName) {
        var k = this.objectPath.length ? this.objectPath.join('.') + '.' + keyName : keyName;
        for (var i = 0, len = this.properties.length; i < len; i++) {
            if (this.properties[i].name == k) {
                throw Error('Duplicate identifier "' + k + '" in scope "' + this.name + '"');
            }
        }
        this.properties.push({
            "name": k,
            "value": []
        });
        this.arrayStack.push(k);
    };
    Constraint_Scope.prototype.arrayPush = function (value) {
        if (this.arrayStack.length == 0) {
            throw Error('Failed to push value in array stack: Stack is empty!');
        }
        var keyName = this.arrayStack[this.arrayStack.length - 1];
        for (var i = 0, len = this.properties.length; i < len; i++) {
            if (this.properties[i].name == keyName) {
                this.properties[i].value.push(Constraint_Type.create(value, this));
            }
        }
    };
    Constraint_Scope.prototype.arrayEnd = function () {
        if (this.arrayStack.length == 0) {
            throw Error('Failed to end current array: Array stack is empty!');
        }
        this.arrayStack.pop();
    };
    Constraint_Scope.prototype.pushScope = function (type, name) {
        if (this.UIElementExists(name)) {
            throw Error('UI Element "' + name + '" cannot be declared twice!');
        }
        var result = new Constraint_Scope(this, name, type, this.strict);
        this.children.push(result);
        this.root.global[name] = result;
        return result;
    };
    Constraint_Scope.prototype.popScope = function () {
        if (this.parent) {
            return this.parent;
        }
        else {
            throw Error("Scope request outside bounds in scope \"" + this.name + "\"");
        }
    };
    Constraint_Scope.prototype.declare = function (constant, substitute) {
        for (var i = 0, len = this.constants.length; i < len; i++) {
            if (this.constants[i].name == constant) {
                throw Error('Duplicate declaration of constant: ' + constant);
            }
        }
        this.constants.push({
            "name": constant,
            "value": (function (v, scope) {
                if (substitute.type == 'type_subst') {
                    // alias declaration of another constant?
                    if (scope.isset(substitute.result)) {
                        return scope.getConstantValue(substitute.result);
                    }
                    else {
                        throw Error('Failed to declare alias const "' + constant + ": The constant is not declared at this point.");
                    }
                }
                else {
                    return Constraint_Type.create(v, scope);
                }
            })(substitute, this)
        });
    };
    /* Check if a property or constant is defined in scope.
       if @type is "constant", checking is done also recursive inside the parent scopes.
     */
    Constraint_Scope.prototype.isset = function (propertyName, type) {
        if (type === void 0) { type = 'property'; }
        if (type == 'property') {
            for (var i = 0, len = this.properties.length; i < len; i++) {
                if (this.properties[i].name == propertyName) {
                    return true;
                }
            }
        }
        else if (type == 'constant') {
            for (var i = 0, len = this.constants.length; i < len; i++) {
                if (this.constants[i].name == propertyName) {
                    return true;
                }
            }
        }
        else {
            throw Error('The second argument of isset should be "property" or "constant".');
        }
        if (this.parent === null) {
            return false;
        }
        else {
            // only pa
            if (type == 'constant') {
                return this.parent.isset(propertyName, 'constant');
            }
            else {
                return false;
            }
        }
    };
    /* Returns the name of the constant with name @constName.
       Searches recursive in the parents.
       If a constant is not defined, returns null.
     */
    Constraint_Scope.prototype.getConstantValue = function (constName) {
        for (var i = 0, len = this.constants.length; i < len; i++) {
            if (this.constants[i].name == constName) {
                return this.constants[i].value;
            }
        }
        if (this.parent !== null) {
            return this.parent.getConstantValue(constName);
        }
        else {
            return null;
        }
    };
    // represents this scope together with it's child scopes to a
    // more friendly JSON representation
    Constraint_Scope.prototype.toJSON = function () {
        var result = {
            "name": this._name,
            "type": this.type
        };
        if (this.properties.length) {
            result['properties'] = {};
            for (var i = 0, len = this.properties.length; i < len; i++) {
                result['properties'][this.properties[i].name] = this.properties[i].value;
            }
        }
        if (this.children.length) {
            result['children'] = [];
            for (var i = 0, len = this.children.length; i < len; i++) {
                result['children'].push(this.children[i].toJSON());
            }
        }
        if (!this.parent) {
            return result['children'] || [];
        }
        return result;
    };
    // check if a scope exists or not.
    Constraint_Scope.prototype.UIElementExists = function (scopeName) {
        if (scopeName === '$parent' || scopeName === null) {
            return this.parent !== null;
        }
        else {
            return typeof this.root.global[scopeName] != 'undefined' ? true : false;
        }
    };
    // checks if a scopeName is this one, or if scopeName is a direct
    // child of this one.
    Constraint_Scope.prototype.UINestingOk = function (scopeName) {
        if (scopeName == '$parent' || scopeName === null) {
            return this.parent !== null;
        }
        else {
            if (this.parent) {
                for (var i = 0, len = this.parent.children.length; i < len; i++) {
                    if (this.parent.children[i]._name == scopeName) {
                        return true;
                    }
                }
                return false;
            }
            else {
                return false;
            }
        }
    };
    // returns the value of a property from this scope.
    Constraint_Scope.prototype.$property = function (propertyName) {
        for (var i = 0, len = this.properties.length; i < len; i++) {
            if (this.properties[i].name == propertyName) {
                return this.properties[i].value;
            }
        }
        return null;
    };
    Object.defineProperty(Constraint_Scope.prototype, "$name", {
        // returns the name of the scope without it's dotted notation.
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Constraint_Scope.prototype, "$type", {
        // returns the type name of the scope
        get: function () {
            return this.type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Constraint_Scope.prototype, "$parentName", {
        get: function () {
            if (this.parent) {
                return this.parent.$name;
            }
            else {
                return '';
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Constraint_Scope.prototype, "$scopes", {
        // returns all the sub-scopes from this scope.
        get: function () {
            var out = [], sub = [];
            for (var i = 0, len = this.children.length; i < len; i++) {
                out.push(this.children[i]);
                sub = this.children[i].$scopes;
                for (var j = 0, n = sub.length; j < n; j++) {
                    out.push(sub[j]);
                }
            }
            return out;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Constraint_Scope.prototype, "$properties", {
        get: function () {
            var out = [];
            for (var i = 0, len = this.properties.length; i < len; i++) {
                if (this.properties[i].value && this.properties[i].value.toLiteral) {
                    out.push({
                        "name": this.properties[i].name,
                        "value": this.properties[i].value.toLiteral(),
                        "literal": true
                    });
                }
                else {
                    out.push({
                        "name": this.properties[i].name,
                        "value": this.properties[i].value,
                        "valueJSON": JSON.stringify(this.properties[i].value)
                    });
                }
            }
            return out;
        },
        enumerable: true,
        configurable: true
    });
    return Constraint_Scope;
})();
var Constraint_Type = (function () {
    function Constraint_Type() {
    }
    Constraint_Type.create = function (from, inContext) {
        switch (from.type) {
            case 'type_number':
                return from.result.indexOf('.') >= 0 ? parseFloat(from.result) : parseInt(from.result);
                break;
            case 'type_color_hex':
            case 'type_color_rgba':
            case 'type_color_rgb':
            case 'type_color_named':
                return UI_Color.create(from.result.replace(/[\s]+/g, ''));
                break;
            case 'type_string':
                return from.result.substr(1, from.result.length - 2).replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/''/g, '\'');
                break;
            case 'type_boolean':
                return ['yes', 'true'].indexOf(from.result.toLowerCase()) >= 0 ? true : false;
                break;
            case 'type_subst':
                return inContext.getConstantValue(from.result);
                break;
            case 'type_anchor':
                return Constraint_Type.createAnchorDef(from, inContext);
                break;
            case 'type_null':
                return null;
                break;
            default:
                throw Error('Unknown type: ' + from.type);
                break;
        }
    };
    Constraint_Type.createAnchorDef = function (from, inContext) {
        var parts = from.result.split(' '), result = {
            "target": parts[0],
            "alignment": (function (str) {
                switch (str) {
                    case 'top':
                        return 0 /* TOP */;
                        break;
                    case 'left':
                        return 1 /* LEFT */;
                        break;
                    case 'right':
                        return 2 /* RIGHT */;
                        break;
                    case 'bottom':
                        return 3 /* BOTTOM */;
                        break;
                    case 'center':
                    case 'middle':
                        return 4 /* CENTER */;
                        break;
                    default:
                        throw Error('Bad alignment: ' + str);
                        break;
                }
            })(parts[1].toLowerCase())
        };
        if (result.target == '$parent') {
            result.target = null;
        }
        if (result.alignment != 4 /* CENTER */) {
            result.distance = parseInt(parts[2]);
        }
        result['align'] = parts[1].toLowerCase();
        if (!inContext.UIElementExists(result.target)) {
            throw Error("UI Element called " + JSON.stringify(result.target) + " doesn't exist or is not accessible from this element!");
        }
        if (!inContext.UINestingOk(result.target)) {
            throw Error('UI Element called ' + JSON.stringify(result.target) + " is referencing an element outside it's UI scope!");
        }
        return result;
    };
    return Constraint_Type;
})();
var UI_Color = (function () {
    function UI_Color(red, green, blue, alpha) {
        if (alpha === void 0) { alpha = 255; }
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
        if (red < 0 || red > 255 || green < 0 || green > 255 || blue < 0 || blue > 255 || alpha < 0 || alpha > 255) {
            throw SyntaxError('Bad color: indexes out of bounds.');
        }
    }
    UI_Color.prototype.toString = function (withAlpha) {
        if (withAlpha === void 0) { withAlpha = false; }
        return withAlpha ? 'rgba(' + this.red + ',' + this.green + ',' + this.blue + ',' + this.alpha + ')' : 'rgb(' + this.red + ',' + this.green + ',' + this.blue + ')';
    };
    UI_Color.create = function (str) {
        var matches;
        str = str.toLowerCase();
        // first checi if is a color by name.
        if (UI_Color.names[str]) {
            str = UI_Color.names[str];
        }
        if (/^\#[a-f\d]{3}$/.test(str)) {
            str = '#' + str[1] + str[1] + str[2] + str[2] + str[3] + str[3] + 'ff';
        }
        else if (/^\#[a-f\d]{6}$/.test(str)) {
            str = str + 'ff';
        }
        switch (true) {
            case (matches = /^\#[\da-f]{8}$/.exec(str)) ? true : false:
                return new UI_Color(parseInt(str[1] + str[2], 16), parseInt(str[3] + str[4], 16), parseInt(str[5] + str[6], 16), parseInt(str[5] + str[6], 16));
                break;
            case (matches = /^rgb\(([\d]+)\,([\d]+)\,([\d]+)\)$/.exec(str)) ? true : false:
                return new UI_Color(parseInt(matches[1]), parseInt(matches[2]), parseInt(matches[3]));
                break;
            case (matches = /^rgba\(([\d]+)\,([\d]+)\,([\d]+)\,([\d]+)\)$/.exec(str)) ? true : false:
                return new UI_Color(parseInt(matches[1]), parseInt(matches[2]), parseInt(matches[3]), parseInt(matches[4]));
                break;
            default:
                throw SyntaxError('Illegal color notation');
                break;
        }
    };
    UI_Color.names = {
        "aliceblue": "#f0f8ff",
        "antiquewhite": "#faebd7",
        "aqua": "#00ffff",
        "aquamarine": "#7fffd4",
        "azure": "#f0ffff",
        "beige": "#f5f5dc",
        "bisque": "#ffe4c4",
        "black": "#000000",
        "blanchedalmond": "#ffebcd",
        "blue": "#0000ff",
        "blueviolet": "#8a2be2",
        "brown": "#a52a2a",
        "burlywood": "#deb887",
        "cadetblue": "#5f9ea0",
        "chartreuse": "#7fff00",
        "chocolate": "#d2691e",
        "coral": "#ff7f50",
        "cornflowerblue": "#6495ed",
        "cornsilk": "#fff8dc",
        "crimson": "#dc143c",
        "cyan": "#00ffff",
        "darkblue": "#00008b",
        "darkcyan": "#008b8b",
        "darkgoldenrod": "#b8860b",
        "darkgray": "#a9a9a9",
        "darkgreen": "#006400",
        "darkkhaki": "#bdb76b",
        "darkmagenta": "#8b008b",
        "darkolivegreen": "#556b2f",
        "darkorange": "#ff8c00",
        "darkorchid": "#9932cc",
        "darkred": "#8b0000",
        "darksalmon": "#e9967a",
        "darkseagreen": "#8fbc8f",
        "darkslateblue": "#483d8b",
        "darkslategray": "#2f4f4f",
        "darkturquoise": "#00ced1",
        "darkviolet": "#9400d3",
        "deeppink": "#ff1493",
        "deepskyblue": "#00bfff",
        "dimgray": "#696969",
        "dodgerblue": "#1e90ff",
        "firebrick": "#b22222",
        "floralwhite": "#fffaf0",
        "forestgreen": "#228b22",
        "fuchsia": "#ff00ff",
        "gainsboro": "#dcdcdc",
        "ghostwhite": "#f8f8ff",
        "gold": "#ffd700",
        "goldenrod": "#daa520",
        "gray": "#808080",
        "green": "#008000",
        "greenyellow": "#adff2f",
        "honeydew": "#f0fff0",
        "hotpink": "#ff69b4",
        "indianred  ": "#cd5c5c",
        "indigo   ": "#4b0082",
        "ivory": "#fffff0",
        "khaki": "#f0e68c",
        "lavender": "#e6e6fa",
        "lavenderblush": "#fff0f5",
        "lawngreen": "#7cfc00",
        "lemonchiffon": "#fffacd",
        "lightblue": "#add8e6",
        "lightcoral": "#f08080",
        "lightcyan": "#e0ffff",
        "lightgoldenrodyellow": "#fafad2",
        "lightgray": "#d3d3d3",
        "lightgreen": "#90ee90",
        "lightpink": "#ffb6c1",
        "lightsalmon": "#ffa07a",
        "lightseagreen": "#20b2aa",
        "lightskyblue": "#87cefa",
        "lightslategray": "#778899",
        "lightsteelblue": "#b0c4de",
        "lightyellow": "#ffffe0",
        "lime": "#00ff00",
        "limegreen": "#32cd32",
        "linen": "#faf0e6",
        "magenta": "#ff00ff",
        "maroon": "#800000",
        "mediumaquamarine": "#66cdaa",
        "mediumblue": "#0000cd",
        "mediumorchid": "#ba55d3",
        "mediumpurple": "#9370db",
        "mediumseagreen": "#3cb371",
        "mediumslateblue": "#7b68ee",
        "mediumspringgreen": "#00fa9a",
        "mediumturquoise": "#48d1cc",
        "mediumvioletred": "#c71585",
        "midnightblue": "#191970",
        "mintcream": "#f5fffa",
        "mistyrose": "#ffe4e1",
        "moccasin": "#ffe4b5",
        "navajowhite": "#ffdead",
        "navy": "#000080",
        "oldlace": "#fdf5e6",
        "olive": "#808000",
        "olivedrab": "#6b8e23",
        "orange": "#ffa500",
        "orangered": "#ff4500",
        "orchid": "#da70d6",
        "palegoldenrod": "#eee8aa",
        "palegreen": "#98fb98",
        "paleturquoise": "#afeeee",
        "palevioletred": "#db7093",
        "papayawhip": "#ffefd5",
        "peachpuff": "#ffdab9",
        "peru": "#cd853f",
        "pink": "#ffc0cb",
        "plum": "#dda0dd",
        "powderblue": "#b0e0e6",
        "purple": "#800080",
        "rebeccapurple": "#663399",
        "red": "#ff0000",
        "rosybrown": "#bc8f8f",
        "royalblue": "#4169e1",
        "saddlebrown": "#8b4513",
        "salmon": "#fa8072",
        "sandybrown": "#f4a460",
        "seagreen": "#2e8b57",
        "seashell": "#fff5ee",
        "sienna": "#a0522d",
        "silver": "#c0c0c0",
        "skyblue": "#87ceeb",
        "slateblue": "#6a5acd",
        "slategray": "#708090",
        "snow": "#fffafa",
        "springgreen": "#00ff7f",
        "steelblue": "#4682b4",
        "tan": "#d2b48c",
        "teal": "#008080",
        "thistle": "#d8bfd8",
        "tomato": "#ff6347",
        "turquoise": "#40e0d0",
        "violet": "#ee82ee",
        "wheat": "#f5deb3",
        "white": "#ffffff",
        "whitesmoke": "#f5f5f5",
        "yellow": "#ffff00",
        "yellowgreen": "#9acd32"
    };
    return UI_Color;
})();
var UI_Event = (function () {
    function UI_Event() {
        this.$EVENTS_ENABLED = true;
    }
    UI_Event.prototype.on = function (eventName, callback) {
        this.$EVENTS_QUEUE = this.$EVENTS_QUEUE || {};
        if (!this.$EVENTS_QUEUE[eventName])
            this.$EVENTS_QUEUE[eventName] = [];
        this.$EVENTS_QUEUE[eventName].push(callback);
    };
    UI_Event.prototype.off = function (eventName, callback) {
        if (this.$EVENTS_QUEUE && this.$EVENTS_QUEUE[eventName]) {
            for (var i = 0, len = this.$EVENTS_QUEUE[eventName].length; i < len; i++) {
                if (this.$EVENTS_QUEUE[eventName][i] == callback) {
                    this.$EVENTS_QUEUE[eventName].splice(i, 1);
                    return;
                }
            }
        }
    };
    UI_Event.prototype.fire = function (eventName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.$EVENTS_ENABLED) {
            if (this.$EVENTS_QUEUE && this.$EVENTS_QUEUE[eventName]) {
                for (var i = 0, len = this.$EVENTS_QUEUE[eventName].length; i < len; i++) {
                    this.$EVENTS_QUEUE[eventName][i].apply(this, args);
                }
            }
        }
    };
    // globally enables or disables all events fired.
    UI_Event.prototype.setEventingState = function (enabled) {
        this.$EVENTS_ENABLED = !!enabled;
    };
    return UI_Event;
})();
var UI_Throttler = (function (_super) {
    __extends(UI_Throttler, _super);
    function UI_Throttler(callbackFunction, frequency) {
        if (frequency === void 0) { frequency = 1; }
        _super.call(this);
        this.lastRun = 0;
        this.nextRun = null;
        this.frequency = 1;
        this.callback = null;
        this.frequency = frequency;
        this.nextRun = null;
        this.lastRun = Date.now();
        this.callback = callbackFunction;
    }
    UI_Throttler.prototype.run = function () {
        var now = 0, self = this;
        if (this.nextRun != null) {
            // a run is already scheduled in the future.
            return;
        }
        else {
            now = Date.now();
            this.lastRun += this.frequency;
            if (this.lastRun < now) {
                // run immediately
                this.lastRun = now;
                this.nextRun = null;
                this.callback();
            }
            else {
                // run in the future
                this.nextRun = this.lastRun + this.frequency;
                setTimeout(function () {
                    self.callback();
                    self.nextRun = null;
                }, this.nextRun - this.lastRun);
            }
        }
    };
    return UI_Throttler;
})(UI_Event);
var UI = (function (_super) {
    __extends(UI, _super);
    function UI(owner) {
        _super.call(this);
        // constraints / anchors.
        this._top = null;
        this._left = null;
        this._right = null;
        this._bottom = null;
        // dimensions
        this._width = null;
        this._height = null;
        // inside padding of the UI element (nothing to do with dom). 
        // Useful if the element contains other elements at loglcal level.
        this._padding = null;
        // the children of the UI element.
        this._children = [];
        // if the element is represented in DOM, this is it's root element.
        this._root = null;
        this._owner = owner;
        this._top = new UI_Anchor(this, 0 /* TOP */);
        this._left = new UI_Anchor(this, 1 /* LEFT */);
        this._right = new UI_Anchor(this, 2 /* RIGHT */);
        this._bottom = new UI_Anchor(this, 3 /* BOTTOM */);
        this._padding = new UI_Padding(this);
    }
    Object.defineProperty(UI.prototype, "top", {
        get: function () {
            return this._top;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UI.prototype, "left", {
        get: function () {
            return this._left;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UI.prototype, "right", {
        get: function () {
            return this._right;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UI.prototype, "bottom", {
        get: function () {
            return this._bottom;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UI.prototype, "width", {
        get: function () {
            return this._width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UI.prototype, "height", {
        get: function () {
            return this._height;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UI.prototype, "padding", {
        get: function () {
            return this._padding;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UI.prototype, "form", {
        // form is the current "dialog" in which this element is inserted.
        get: function () {
            return this._owner ? this._owner.form : this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UI.prototype, "owner", {
        // owner is the "parent" of the current UI element.
        get: function () {
            return this._owner;
        },
        set: function (owner) {
            this._owner = owner;
        },
        enumerable: true,
        configurable: true
    });
    // removes the UI element from it's parent.
    UI.prototype.remove = function () {
        if (this._owner) {
            for (var i = 0, len = this._owner._children.length; i < len; i++) {
                if (this._owner._children[i] == this) {
                    this._owner._children.splice(i, 1);
                }
            }
        }
        return this;
    };
    // inserts an UI element inside the current UI element
    UI.prototype.insert = function (child) {
        if (!child)
            throw Error('Cannot insert a NULL element.');
        child.remove();
        child.owner = this;
        this._children.push(child);
        return child;
    };
    UI.prototype.onRepaint = function () {
        // this is called each time the element needs to be repainted.
    };
    return UI;
})(UI_Event);
Constraint.registerClass({
    "name": "UI",
    "properties": [
        {
            "name": "top",
            "type": "UI_Anchor"
        },
        {
            "name": "right",
            "type": "UI_Anchor"
        },
        {
            "name": "bottom",
            "type": "UI_Anchor"
        },
        {
            "name": "left",
            "type": "UI_Anchor"
        },
        {
            "name": "x",
            "type": "number"
        },
        {
            "name": "y",
            "type": "number"
        },
        {
            "name": "padding.left",
            "type": "number"
        },
        {
            "name": "padding.right",
            "type": "number"
        },
        {
            "name": "padding.top",
            "type": "number"
        },
        {
            "name": "padding.bottom",
            "type": "number"
        }
    ]
});
var UI_Anchor = (function () {
    function UI_Anchor(owner, type) {
        this._target = null;
        this._owner = null;
        this._alignment = null;
        this._owner = owner;
        this._type = type;
        if (type == 4 /* CENTER */)
            throw Error('Bad anchor direction EAlignment.CENTER');
    }
    Object.defineProperty(UI_Anchor.prototype, "target", {
        get: function () {
            return this._target;
        },
        set: function (target) {
            if (target != this._target) {
                this._target = target;
                this.requestRepaint();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UI_Anchor.prototype, "owner", {
        // the owner of the anchor cannot be changed
        get: function () {
            return this._owner;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UI_Anchor.prototype, "alignment", {
        get: function () {
            return this._alignment;
        },
        set: function (al) {
            if (al != this._alignment) {
                this._alignment = al;
                this.requestRepaint();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UI_Anchor.prototype, "distance", {
        // the distance from the target.
        // if the alignment is CENTER, this value is ignored.
        get: function () {
            return this._distance;
        },
        set: function (d) {
            if (~~d != this._distance) {
                this._distance = d;
                this.requestRepaint();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UI_Anchor.prototype, "oppositeAnchor", {
        // returns the opposite anchor ( for left -> right, right -> left, top -> bottom, and bottom -> top )
        get: function () {
            if (!this._owner)
                return null;
            switch (this._type) {
                case 1 /* LEFT */:
                    return this._owner.right;
                    break;
                case 2 /* RIGHT */:
                    return this._owner.left;
                    break;
                case 0 /* TOP */:
                    return this._owner.bottom;
                    break;
                case 3 /* BOTTOM */:
                    return this._owner.top;
                    break;
                default:
                    return null;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UI_Anchor.prototype, "valid", {
        // weather the anchor has all the needed data to be considered a valid one or not.
        get: function () {
            if (!this._target || !this._owner || !this._type || this._type == 4 /* CENTER */) {
                return false;
            }
            else {
                return true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UI_Anchor.prototype, "active", {
        get: function () {
            var opposed;
            if (!this.valid) {
                return false;
            }
            else {
                opposed = this.oppositeAnchor;
                // if the opposite anchor is not valid, this is 100% valid.
                if (!opposed || !opposed.valid) {
                    return true;
                }
                switch (this._alignment) {
                    case 4 /* CENTER */:
                        if (opposed.alignment == 4 /* CENTER */) {
                            // both centered anchors. bottom and right anchors have lower priority.
                            if (this._type == 3 /* BOTTOM */ || this._type == 2 /* RIGHT */) {
                                return false;
                            }
                            else {
                                // this is the left or top anchor, and has maximum priority.
                                return true;
                            }
                        }
                        else {
                            // this is the only centered anchor, and has best priority.
                            return true;
                        }
                        break;
                    default:
                        // anchor is valid, but it's opposed anchor is centered. because
                        // this anchor is not centered, we considerr the anchor as not active.
                        if (opposed.alignment == 4 /* CENTER */) {
                            return false;
                        }
                        else {
                            return true;
                        }
                        break;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    UI_Anchor.prototype.requestRepaint = function () {
        if (this._owner) {
            this._owner.onRepaint();
        }
    };
    UI_Anchor.create = function (from) {
        var result = new UI_Anchor(null, null);
        return result;
    };
    return UI_Anchor;
})();
var UI_Padding = (function () {
    function UI_Padding(owner) {
        this._left = 0;
        this._right = 0;
        this._bottom = 0;
        this._top = 0;
        this._owner = null;
        this._owner = owner;
    }
    Object.defineProperty(UI_Padding.prototype, "left", {
        get: function () {
            return this._left;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UI_Padding.prototype, "right", {
        get: function () {
            return this._right;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UI_Padding.prototype, "top", {
        get: function () {
            return this._top;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UI_Padding.prototype, "bottom", {
        get: function () {
            return this._bottom;
        },
        enumerable: true,
        configurable: true
    });
    return UI_Padding;
})();
/* A form is a dialog in UI Concepts.
 */
var UI_Form = (function (_super) {
    __extends(UI_Form, _super);
    function UI_Form() {
        _super.call(this, null);
        // MINIMIZED, MAXIMIZED, CLOSED, NORMAL
        this._state = 2 /* NORMAL */;
        // Weather it has a titlebar or not
        this._borderStyle = 0 /* NORMAL */;
        // Weather it is resizable or not
        this._formStyle = 0 /* FORM */;
        // Moveable or not?
        this._position = 0 /* AUTO */;
        this._root = document.createElement('div');
    }
    // returns an element defined on this instance.
    // the element must extend the UI interface
    UI_Form.prototype.getElementByName = function (elementName) {
        if (typeof this[elementName] != 'undefined' && this[elementName] instanceof UI) {
            return this[elementName];
        }
        else {
            return null;
        }
    };
    Object.defineProperty(UI_Form.prototype, "form", {
        get: function () {
            return this;
        },
        enumerable: true,
        configurable: true
    });
    return UI_Form;
})(UI);
var Salvage = (function () {
    function Salvage(contents) {
        // Parse all blocks.
        // For special blocks, instantiate special children
        this.children = [];
        this.exception = null;
        try {
            Salvage.parseBlocks(contents, this.children);
        }
        catch (error) {
            this.exception = error + '';
        }
    }
    Salvage.prototype.parse = function (context) {
        if (this.exception !== null) {
            return Salvage.toSTRINGSAFE(this.exception);
        }
        else {
            var out = [], i = 0, len = this.children.length, ctx = new SalvageContext(context);
            for (i = 0; i < len; i++) {
                out.push(this.children[i].parse(ctx));
            }
            return out.join('');
        }
    };
    Salvage.callHelper = function (helperName, onValue) {
        for (var i = 0, len = Salvage.HELPERS.length; i < len; i++) {
            if (Salvage.HELPERS[i].name == helperName) {
                return Salvage.HELPERS[i].func(onValue);
            }
        }
        throw "Bad helper name: " + helperName;
    };
    Salvage.isPrimitive = function (value) {
        return Salvage.isNULL(value) || Salvage.isSTRING(value) || Salvage.isBOOLEAN(value) || Salvage.isNUMBER(value);
    };
    Salvage.isNULL = function (value) {
        return value === null || value == void 0;
    };
    Salvage.isSTRING = function (value) {
        return typeof value == 'string';
    };
    Salvage.isBOOLEAN = function (value) {
        return value === true || value === false;
    };
    Salvage.isNUMBER = function (value) {
        return !isNaN(value) && isFinite(value) && (value * 1) === value ? true : false;
    };
    Salvage.isComplex = function (value) {
        return Salvage.isARRAY(value) || Salvage.isOBJECT(value);
    };
    Salvage.isARRAY = function (value) {
        return Salvage.isOBJECT(value) && Salvage.isNUMBER(value.length) ? true : false;
    };
    Salvage.isOBJECT = function (value) {
        return typeof value == 'object' && value && typeof value.prototype == 'undefined' ? true : false;
    };
    Salvage.keys = function (value) {
        var len, i, k, result = null;
        if (Salvage.isARRAY(value)) {
            result = [];
            for (var i = 0, len = ~~(value['length']); i < len; i++) {
                result.push(String(i));
            }
        }
        else if (Salvage.isOBJECT(value)) {
            result = [];
            for (k in value) {
                if (value.hasOwnProperty(k) && value.propertyIsEnumerable(k)) {
                    result.push(k);
                }
            }
        }
        return result;
    };
    Salvage.isEMPTY = function (value) {
        return Salvage.keys(value).length == 0;
    };
    Salvage.toSTRING = function (value, decimals, thousandSeparator, decimalSeparator) {
        if (decimals === void 0) { decimals = null; }
        if (thousandSeparator === void 0) { thousandSeparator = ''; }
        if (decimalSeparator === void 0) { decimalSeparator = '.'; }
        var sub, keys, v, i = 0, len = 0, result = '', isFloat = false, decParts, matches;
        switch (true) {
            case Salvage.isNULL(value):
                result = 'null';
                break;
            case Salvage.isSTRING(value):
                result = String(value);
                break;
            case Salvage.isBOOLEAN(value):
                result = !!(value) ? 'true' : 'false';
                break;
            case Salvage.isNUMBER(value):
                result = (isFloat = Math.round(value) != value) ? (decimals === null ? String(value) : (decimals === 0 ? String(parseInt(value)) : value.toFixed(decimals))) : String(value);
                if (isFloat && (decimalSeparator != '.' || thousandSeparator != '')) {
                    keys = result.split('.');
                    decParts = '';
                    while (matches = /([\d]{3}$)/.exec(keys[0])) {
                        decParts = keys[0].length > 3 ? thousandSeparator + matches[1] + decParts : matches[1] + decParts;
                        keys[0] = keys[0].replace(/[\d]{3}$/, '');
                    }
                    if (keys[0].length)
                        decParts = decParts.length ? keys[0] + decParts : keys[0];
                    result = keys[1] ? decParts + decimalSeparator + keys[1] : decParts;
                }
                break;
            case Salvage.isARRAY(value):
                if (value.length) {
                    sub = [];
                    for (i = 0, len = ~~value.length; i < len; i++) {
                        v = Salvage.toSTRING(value[i], decimals, thousandSeparator, decimalSeparator);
                        if (v != '') {
                            sub.push(v);
                        }
                    }
                    result = sub.length ? '[ ' + sub.join(', ') + ']' : '';
                }
                else {
                    result = '';
                }
                break;
            case Salvage.isOBJECT(value):
                keys = Salvage.keys(value);
                if (keys.length) {
                    sub = [];
                    for (i = 0, len = keys.length; i < len; i++) {
                        v = Salvage.toSTRING(value[keys[i]], decimals, thousandSeparator, decimalSeparator);
                        if (v != '') {
                            sub.push(keys[i] + ': ' + v);
                        }
                    }
                    result = sub.length ? '[ ' + sub.join(', ') + ']' : '';
                }
                else {
                    result = '';
                }
                break;
            default:
                result = '';
                break;
        }
        return result;
    };
    Salvage.toSTRINGSAFE = function (value, decimals, thousandSeparator, decimalSeparator) {
        if (decimals === void 0) { decimals = null; }
        if (thousandSeparator === void 0) { thousandSeparator = ''; }
        if (decimalSeparator === void 0) { decimalSeparator = '.'; }
        return Salvage.toSTRING(value, decimals, thousandSeparator, decimalSeparator).replace(/"/, '&quot;').replace(/>/g, '&gt;').replace(/</g, '&lt;');
    };
    Salvage.getHELPERS = function (helpersList) {
        if (helpersList === void 0) { helpersList = null; }
        helpersList = String(helpersList || '').replace(/(^[\s\|]+|[\s\|]+$)/g, '');
        if (!helpersList.length) {
            return null;
        }
        var out = helpersList.split(/[\s\|]+/), i, j, len, n = Salvage.HELPERS.length, good;
        if (out.length) {
            for (i = 0, len = out.length; i < len; i++) {
                good = false;
                for (j = 0; j < n; j++) {
                    if (Salvage.HELPERS[j].name == out[i]) {
                        good = true;
                        break;
                    }
                }
                if (!good) {
                    throw "Invalid helper name: " + JSON.stringify(out[i]);
                }
            }
        }
        return out.length ? out : null;
    };
    Salvage.parseBlocks = function (contents, destination, ownerBlock) {
        if (destination === void 0) { destination = []; }
        if (ownerBlock === void 0) { ownerBlock = null; }
        var lastBlock = null, raw = contents || '', i = 0, entities = Salvage.ENTITIES.length, isText = false, entityType = '', matches = [], matchIndex = 0, decimals, helpers = null;
        while (true) {
            isText = true;
            entityType = '';
            matchIndex = 0;
            for (i = 0; i < entities; i++) {
                matches = Salvage.ENTITIES[i].expr.exec(raw);
                if (matches) {
                    // good. we found an entity.
                    entityType = Salvage.ENTITIES[i].type;
                    matchIndex = Salvage.ENTITIES[i].match;
                    isText = false;
                    break;
                }
            }
            if (!isText) {
                switch (entityType) {
                    case 'end':
                        if (!ownerBlock || ['if', 'each', 'with'].indexOf(ownerBlock.type) == -1) {
                            throw "An 'end' block can be placed only after an 'if', 'each', or 'with' block!";
                        }
                        // flush end
                        raw = raw.substr(matches[0].length);
                        return raw;
                        break;
                    case 'var':
                    case 'rawVar':
                        decimals = (matches[6] || '').length ? ~~matches[6] : null;
                        helpers = Salvage.getHELPERS(matches[8]);
                        raw = raw.substr(matches[0].length);
                        destination.push(lastBlock = new SalvageBlockVar(matches[matchIndex], entityType == 'var', decimals, helpers));
                        break;
                    case 'if':
                        raw = raw.substr(matches[0].length);
                        destination.push(lastBlock = new SalvageBlockIf(SalvageContext.parsePATH(matches[matchIndex]), raw));
                        raw = lastBlock.unconsumedRawText;
                        break;
                    case 'with':
                        raw = raw.substr(matches[0].length);
                        destination.push(lastBlock = new SalvageBlockContext(SalvageContext.parsePATH(matches[matchIndex]), raw));
                        raw = lastBlock.unconsumedRawText;
                        break;
                    case 'else':
                        raw = raw.substr(matches[0].length);
                        if (!ownerBlock || ownerBlock.type != 'if')
                            throw "An 'else' block can be placed only inside of an 'if' block!";
                        ownerBlock.onParseElse();
                        // put a NULL block delimiter
                        destination.push(null);
                        lastBlock = null;
                        break;
                    case 'each':
                        raw = raw.substr(matches[0].length);
                        destination.push(lastBlock = new SalvageBlockEach(SalvageContext.parsePATH(matches[matchIndex]), raw, matches[4] || null));
                        raw = lastBlock.unconsumedRawText;
                        break;
                    case 'comment':
                        // comments are ignored from the start in the loading mechanism.
                        raw = raw.substr(matches[0].length);
                        break;
                    default:
                        throw 'Bad entity type: ' + entityType;
                }
            }
            else {
                if (raw.length) {
                    if (lastBlock && lastBlock.type == 'text') {
                        lastBlock.append(raw[0]); //good.
                    }
                    else {
                        destination.push(lastBlock = new SalvageBlockText());
                        lastBlock.append(raw[0]); //good.
                    }
                    raw = raw.substr(1);
                }
                else {
                    break;
                }
            }
        }
        return raw;
    };
    Salvage.HELPERS = [
        {
            "name": "upper",
            "func": function (s) {
                return String(s || '').toUpperCase();
            }
        },
        {
            "name": "lower",
            "func": function (s) {
                return String(s || '').toLowerCase();
            }
        }
    ];
    Salvage.ENTITIES = [
        {
            "type": "var",
            "expr": /^\{\{([\s]+)?([a-z\d\.\[\]\/_\$]+)([\s]+)?(\:([\s]+)?([\d]+)([\s]+)?)?((([\s]+)?\|([\s]+)?([a-z\d_\$]+))+)?([\s]+)?\}\}/i,
            "match": 2
        },
        {
            "type": "rawVar",
            "expr": /^\{\{\{([\s]+)?([a-z\d\.\[\]\/_\$]+)([\s]+)?(\:([\s]+)?([\d]+)([\s]+)?)?((([\s]+)?\|([\s]+)?([a-z\d_\$]+))+)?([\s]+)?\}\}\}/i,
            "match": 2
        },
        {
            "type": "if",
            "expr": /^\{\{([\s]+)?#if[\s]+([a-z\d\.\[\]\/_\$]+)([\s]+)?\}\}/i,
            "match": 2
        },
        {
            "type": "else",
            "expr": /^\{\{([\s]+)?#else([\s]+)?\}\}/i,
            "match": 0
        },
        {
            "type": "end",
            "expr": /^\{\{([\s]+)?#end([\s]+)?\}\}/i,
            "match": 0
        },
        {
            "type": "each",
            "expr": /^\{\{([\s]+)?#each([\s]+)(([a-z\$\_]+([a-z\$\_\d]+)?)[\s]+in[\s]+)?([a-z\d\.\[\]\/_\$]+)([\s]+)?\}\}/i,
            "match": 6
        },
        {
            "type": "with",
            "expr": /^\{\{([\s]+)?#with[\s]+([a-z\d\.\[\]\/_\$]+)([\s]+)?\}\}/i,
            "match": 2
        },
        {
            "type": "comment",
            "expr": /^\{\{\!--[\s\S]+?--\}\}/i,
            "match": 0
        }
    ];
    return Salvage;
})();
var SalvageBlock = (function () {
    function SalvageBlock(parent) {
        if (parent === void 0) { parent = null; }
        this.parent = parent;
    }
    Object.defineProperty(SalvageBlock.prototype, "type", {
        get: function () {
            return '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalvageBlock.prototype, "unconsumedRawText", {
        get: function () {
            return '';
        },
        enumerable: true,
        configurable: true
    });
    SalvageBlock.prototype.parse = function (context) {
        return '';
    };
    return SalvageBlock;
})();
var SalvageBlockVar = (function (_super) {
    __extends(SalvageBlockVar, _super);
    function SalvageBlockVar(varName, escaped, decimals, helpers) {
        if (escaped === void 0) { escaped = false; }
        if (decimals === void 0) { decimals = null; }
        if (helpers === void 0) { helpers = null; }
        _super.call(this);
        this.varName = '';
        this.isEsc = false;
        this.decimals = null;
        this.helpers = null;
        this.varName = varName;
        this.isEsc = escaped;
        this.decimals = decimals;
        this.helpers = helpers;
    }
    SalvageBlockVar.prototype.parse = function (context) {
        var result = '', i = 0, len = 0;
        result = Salvage.toSTRING(context.getByPath(this.varName), this.decimals);
        if (this.helpers) {
            for (i = 0, len = this.helpers.length; i < len; i++) {
                result = Salvage.callHelper(this.helpers[i], result);
            }
        }
        if (this.isEsc) {
            result = Salvage.toSTRINGSAFE(result);
        }
        return result;
    };
    return SalvageBlockVar;
})(SalvageBlock);
var SalvageBlockText = (function (_super) {
    __extends(SalvageBlockText, _super);
    function SalvageBlockText() {
        _super.call(this);
        this._text = '';
    }
    SalvageBlockText.prototype.append = function (character) {
        this._text = this._text + character;
    };
    Object.defineProperty(SalvageBlockText.prototype, "type", {
        get: function () {
            return 'text';
        },
        enumerable: true,
        configurable: true
    });
    SalvageBlockText.prototype.parse = function (ctx) {
        return this._text;
    };
    return SalvageBlockText;
})(SalvageBlock);
var SalvageBlockIf = (function (_super) {
    __extends(SalvageBlockIf, _super);
    function SalvageBlockIf(condition, contents) {
        _super.call(this);
        this._condition = null;
        this._raw = '';
        this._else = false;
        this.ifchildren = [];
        this.elsechildren = [];
        this._condition = condition;
        var children = [];
        this._raw = Salvage.parseBlocks(contents, children, this);
        if (children.indexOf(null) == -1) {
            this.ifchildren = children;
        }
        else {
            this.ifchildren = children.slice(0, children.indexOf(null));
            this.elsechildren = children.slice(children.indexOf(null) + 1);
        }
    }
    SalvageBlockIf.prototype.onParseElse = function () {
        if (this._else) {
            throw "Multiple else clauses cannot be added inside of an 'if' clause!";
        }
        this._else = true;
    };
    Object.defineProperty(SalvageBlockIf.prototype, "type", {
        get: function () {
            return 'if';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalvageBlockIf.prototype, "unconsumedRawText", {
        get: function () {
            var result = this._raw;
            this._raw = '';
            return result;
        },
        enumerable: true,
        configurable: true
    });
    SalvageBlockIf.prototype.parse = function (context) {
        var out = [], data = context.get(this._condition), i = 0, len;
        if ((Salvage.isPrimitive(data) && !!(data)) || (Salvage.isComplex(data) && !Salvage.isEMPTY(data))) {
            for (i = 0, len = this.ifchildren.length; i < len; i++) {
                out.push(this.ifchildren[i].parse(context));
            }
        }
        else {
            for (i = 0, len = this.elsechildren.length; i < len; i++) {
                out.push(this.elsechildren[i].parse(context));
            }
        }
        return out.join('');
    };
    return SalvageBlockIf;
})(SalvageBlock);
var SalvageBlockEach = (function (_super) {
    __extends(SalvageBlockEach, _super);
    function SalvageBlockEach(condition, contents, keyName) {
        if (keyName === void 0) { keyName = null; }
        _super.call(this);
        this._raw = '';
        this.cd = [];
        this.keyName = null;
        this.children = [];
        this.cd = condition;
        this.keyName = keyName;
        this._raw = Salvage.parseBlocks(contents, this.children, this);
    }
    Object.defineProperty(SalvageBlockEach.prototype, "type", {
        get: function () {
            return 'each';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalvageBlockEach.prototype, "unconsumedRawText", {
        get: function () {
            var out = this._raw;
            this._raw = ''; // free mem
            return out;
        },
        enumerable: true,
        configurable: true
    });
    SalvageBlockEach.prototype.makeKey = function (value) {
        var o = {};
        o[this.keyName] = value;
        return o;
    };
    SalvageBlockEach.prototype.parse = function (context) {
        var out = [], ctx = context.cd(this.cd), root = ctx.get(null), i, j = 0, len, n, keys = [], item, n = this.children.length;
        if (!Salvage.isEMPTY(root)) {
            keys = Salvage.keys(root);
            len = keys.length;
            for (i = 0; i < len; i++) {
                item = this.keyName === null ? new SalvageContext(root[keys[i]], ctx.cd(['..'])) : new SalvageContext(root[keys[i]], ctx.cd(['..']), this.makeKey(keys[i]));
                for (j = 0; j < n; j++) {
                    out.push(this.children[j].parse(item));
                }
            }
        }
        return out.join('');
    };
    return SalvageBlockEach;
})(SalvageBlock);
var SalvageBlockContext = (function (_super) {
    __extends(SalvageBlockContext, _super);
    function SalvageBlockContext(condition, contents) {
        _super.call(this);
        this._raw = '';
        this.cd = [];
        this.children = [];
        this.cd = condition;
        this._raw = Salvage.parseBlocks(contents, this.children, this);
    }
    Object.defineProperty(SalvageBlockContext.prototype, "type", {
        get: function () {
            return 'with';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalvageBlockContext.prototype, "unconsumedRawText", {
        get: function () {
            var out = this._raw;
            this._raw = ''; // free mem
            return out;
        },
        enumerable: true,
        configurable: true
    });
    SalvageBlockContext.prototype.parse = function (context) {
        var out = [], ctx = context.cd(this.cd), i = 0, len = this.children.length;
        for (i = 0; i < len; i++) {
            out.push(this.children[i].parse(ctx));
        }
        return out.join('');
    };
    return SalvageBlockContext;
})(SalvageBlock);
var SalvageContext = (function () {
    function SalvageContext(root, owner, assignedKeys) {
        if (owner === void 0) { owner = null; }
        if (assignedKeys === void 0) { assignedKeys = null; }
        this.root = null;
        this.owner = null;
        this.assigned = null;
        this.root = root;
        this.owner = owner;
        this.assigned = assignedKeys || {};
    }
    SalvageContext.prototype.cd = function (path) {
        if (path === void 0) { path = []; }
        if (path.length == 0)
            return this;
        var cursor = this, i = 0, len = path.length;
        while (path[i] == '..') {
            if (!cursor.owner) {
                throw "Illegal path!";
            }
            cursor = cursor.owner;
            i++;
        }
        while (i < len) {
            if (path[i] == '..') {
                if (!cursor.owner) {
                    throw "Illegal path!";
                }
                cursor = cursor.owner;
            }
            else if (path[i] == 'this' && i == 0) {
            }
            else {
                if (!Salvage.isComplex(cursor.root) || typeof cursor.root[path[i]] == 'undefined') {
                    throw "Illegal path!";
                }
                cursor = new SalvageContext(cursor.root[path[i]], cursor);
            }
            i++;
        }
        return cursor;
    };
    SalvageContext.prototype.get = function (propertyName) {
        if (propertyName === void 0) { propertyName = null; }
        if (propertyName === null || propertyName.length == 0) {
            return this.root;
        }
        else {
            if (propertyName.length > 1) {
                return this.cd(propertyName.slice(0, propertyName.length - 1)).get([propertyName[propertyName.length - 1]]);
            }
            else {
                if (typeof this.assigned[propertyName[0]] != 'undefined') {
                    return this.assigned[propertyName[0]];
                }
                else {
                    return Salvage.isComplex(this.root) ? this.root[propertyName[0]] : (propertyName[0] == 'this' ? this.root : '');
                }
            }
        }
    };
    SalvageContext.prototype.getByPath = function (path) {
        var parts = SalvageContext.parsePATH(path);
        if (parts === null)
            return null;
        return this.get(parts);
    };
    SalvageContext.parsePATH = function (s) {
        var parts = [], raw = s, name = '', matches, i = 0, len = 0, optimized;
        if (!/^[a-z\d\.\[\]\/_\$]+/i.test(s)) {
            return null;
        }
        while (raw) {
            name = null;
            for (i = 0; i < 3; i++) {
                matches = SalvageContext.tokens[i].expr.exec(raw);
                if (matches) {
                    name = matches[SalvageContext.tokens[i].match];
                    break;
                }
            }
            if (name !== null) {
                parts.push(name);
                raw = raw.substr(matches[0].length);
                // check next ...
                if (raw != '') {
                    matches = /^(\.|\/|\[)/.exec(raw);
                    if (!matches) {
                        return null;
                    }
                    else {
                        if (matches[0] != '[') {
                            raw = raw.substr(matches[0].length);
                        }
                    }
                    if (raw == '') {
                        return null;
                    }
                }
            }
            else {
                return null;
            }
        }
        do {
            optimized = true;
            for (i = 1, len = parts.length; i < len; i++) {
                if (parts[i] == '..' && parts[i - 1] != '..') {
                    parts.splice(i - 1, 2);
                    optimized = false;
                    break;
                }
            }
        } while (!optimized);
        if (!parts.length) {
            return ['this'];
        }
        return parts;
    };
    SalvageContext.tokens = [
        {
            "name": "normal",
            "expr": /^[a-z_\$]([a-z_\$\d]+)?/i,
            "match": 0
        },
        {
            "name": "enclosed",
            "expr": /^\[([a-z_\$]([a-z_\$\d]+)?)\]/i,
            "match": 1
        },
        {
            "name": "dotdot",
            "expr": /^\.\./,
            "match": 0
        }
    ];
    return SalvageContext;
})();
/// <reference path="main.ts" />
/// <reference path="node.d.ts" />
/// <reference path="../vendor/salvage/js/build.ts" />
try {
    var fs = require('fs'), os = require('os'), srcFile = process.argv[2], destDir = process.argv[3] || null, justForm = process.argv[4] || null, buffer;
    if (!srcFile) {
        throw Error('Usage: constraint <constraint_src_file> <app_directory> [<form_name>]');
    }
    buffer = fs.readFileSync(srcFile);
    if (!buffer) {
        throw Error("File empty, non-existent or non-readable: " + srcFile);
    }
    var constraint = new Constraint(buffer + '');
    constraint.compile();
    // Fetch all the Forms from the compiled file, and dump them.
    var scopes = constraint.$scopes, forms = [];
    for (var i = 0, len = scopes.length; i < len; i++) {
        if (constraint.$scope(scopes[i]).$type == 'UI_Form') {
            forms.push(constraint.$scope(scopes[i]));
        }
    }
    console.log('* Found ', forms.length, ' forms in "' + srcFile + '"');
    if (forms.length == 0) {
        process.exit();
    }
    if (destDir === null) {
        console.log('* Second argument of the compiler not present. Auto-determining target dir.');
        destDir = srcFile.replace(/\.[^\.]+$/g, '');
        if (destDir == srcFile) {
            destDir = srcFile + "_app";
        }
    }
    if (!fs.existsSync(destDir)) {
        try {
            fs.mkdirSync(destDir);
            console.log('* Directory "' + destDir + '" successfully created');
        }
        catch (err) {
            throw Error('Failed to create directory: ' + destDir);
        }
    }
    var app = {
        "forms": []
    };
    var constraintLibPath = JSON.stringify(fs.realpathSync('./js/main.ts')), writeFiles = [];
    for (var i = 0, len = forms.length; i < len; i++) {
        (function (form) {
            var frm = {
                "name": form.$name,
                "properties": [],
                "compileDate": (new Date()).toString(),
                "userName": os.hostname(),
                "version": process.version,
                "constraintLibPath": constraintLibPath,
                "fileName": form.$name + '.ts'
            };
            if (justForm && form._name != justForm) {
                writeFiles.push({
                    "path": destDir + '/' + frm.fileName,
                    "method": "ignore",
                    "data": null,
                    "fileName": frm.fileName
                });
                return;
            }
            var scopes = form.$scopes, data;
            for (var i = 0, len = scopes.length; i < len; i++) {
                frm.properties.push({
                    "name": scopes[i].$name,
                    "type": scopes[i].$type,
                    "in": scopes[i].$parentName == form.$name ? null : scopes[i].$parentName,
                    "properties": scopes[i].$properties
                });
            }
            app.forms.push(frm);
        })(forms[i]);
    }
    var salvage = new Salvage(fs.readFileSync('js/compiler/form.salvage') + '');
    function patchFile(destinationFile, withBuffer, fileName) {
        var contents = fs.readFileSync(destinationFile) + '', matchesSrc = [], matchesDest = [], regexpDest; // convert to string.
        while (matchesSrc = /\/\* \$hint\: ([a-z\d\-]+) \*\/([\s\S]+?)\/\* \$hint\: end \*\//.exec(withBuffer)) {
            regexpDest = new RegExp('\\/\\* \\$hint\\: ' + matchesSrc[1].replace(/\-/g, '\\-') + ' \\*\\/([\\s\\S]+?)\\/\\* \\$hint\\: end \\*\\/');
            if (!(matchesDest = regexpDest.exec(contents))) {
                throw Error('Failed to find hint ' + JSON.stringify(matchesSrc[1]) + ' in target file: ' + JSON.stringify(destinationFile));
            }
            else {
                contents = contents.replace(matchesDest[0], matchesSrc[0]);
                withBuffer = withBuffer.replace(matchesSrc[0], '');
            }
        }
        //console.log( contents );
        writeFiles.push({
            "path": destinationFile,
            "data": contents,
            "method": "patch",
            "fileName": fileName
        });
    }
    function writeFile(destinationFile, withBuffer, fileName) {
        writeFiles.push({
            "path": destinationFile,
            "data": withBuffer,
            "method": "create",
            "fileName": fileName
        });
    }
    var destFile = '';
    for (var i = 0, len = app.forms.length; i < len; i++) {
        // console.log( salvage.parse( app.forms[i] ) );
        // console.log( JSON.stringify( app.forms[i], undefined, 4 ) );
        if (fs.existsSync(destFile = (destDir + '/' + app.forms[i].fileName))) {
            patchFile(destFile, salvage.parse(app.forms[i]), app.forms[i].fileName);
        }
        else {
            writeFile(destFile, salvage.parse(app.forms[i]), app.forms[i].fileName);
        }
    }
    // Generate a main.ts file.
    var mainTs = {
        "constraintLibPath": constraintLibPath,
        "files": []
    };
    for (var i = 0, len = writeFiles.length; i < len; i++) {
        mainTs.files.push({
            "name": JSON.stringify(writeFiles[i].fileName)
        });
    }
    salvage = new Salvage(fs.readFileSync('js/compiler/main.salvage') + '');
    writeFiles.push({
        "path": destDir + '/main.ts',
        "data": salvage.parse(mainTs),
        "method": "create",
        "fileName": "main.ts"
    });
    writeFiles.push({
        "path": destDir + '/Makefile',
        "data": fs.readFileSync('js/compiler/Makefile.salvage') + '',
        "method": "create",
        "fileName": "Makefile"
    });
    console.log("* Placing compiled files in folder '" + destDir + "'");
    for (var i = 0, len = writeFiles.length; i < len; i++) {
        if (writeFiles[i].method != 'ignore') {
            console.log('* ', writeFiles[i].method, ' file: "' + writeFiles[i].path + '": ', fs.writeFileSync(writeFiles[i].path, writeFiles[i].data) || 'Ok');
        }
        else {
            console.log('* ', writeFiles[i].method, ' file: "' + writeFiles[i].path + '": Ok');
        }
    }
    console.log('Compilation completed. Type "make" inside the folder "' + destDir + '" to build the project.');
}
catch (err) {
    console.log("\nERROR: " + err);
}
