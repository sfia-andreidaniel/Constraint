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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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
            console.log('evalTRUE: ', JSON.stringify(data, undefined, 4));
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
