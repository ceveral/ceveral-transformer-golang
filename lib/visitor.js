"use strict";
const Path = require("path");
const utils_1 = require("./utils");
const ceveral_compiler_1 = require("ceveral-compiler");
const _ = require("lodash");
class GolangError extends Error {
    constructor(message, location) {
        super(message);
        this.message = message;
        this.location = location;
    }
}
exports.GolangError = GolangError;
function ucFirst(name) {
    return _.upperFirst(_.camelCase(name));
}
const Indention = '  ';
class GolangVisitor extends ceveral_compiler_1.BaseVisitor {
    constructor(options) {
        super();
        this.options = options;
        this.imports = new Set();
    }
    parse(expression) {
        let out = this.visit(expression);
        let imports = (new Array(...this.imports)).map(m => `  "${m}"`);
        let builder = "package " + this.package + '\n\n';
        if (imports.length) {
            builder += `import (\n${imports.join('\n')}\n)\n\n`;
        }
        builder += out.join('\n\n') + '\n';
        return [{
                filename: Path.basename(this.options.fileName, Path.extname(this.options.fileName)) + ".go",
                buffer: new Buffer(builder)
            }];
    }
    generateTags(name, exp) {
        let gotags = exp.get('gotags') || this.gotags;
        let tagStr = '';
        if (gotags) {
            if (utils_1.isStringArray(gotags)) {
                gotags = gotags.map(m => `${m}:"${name}"`);
            }
            else if (typeof gotags === 'object') {
                let tmp = [];
                for (let key in gotags) {
                    tmp.push(`${key}:"${gotags[key]}"`);
                }
                gotags = tmp;
            }
            if (gotags.length)
                tagStr = "`" + gotags.join(' ') + "`";
        }
        return tagStr;
    }
    visitPackage(expression) {
        this.package = expression.name;
        /*for (let child of expression.children) {
            out.push(this.visit(child));
        }*/
        let include = [ceveral_compiler_1.Token.Record, ceveral_compiler_1.Token.NumericEnum, ceveral_compiler_1.Token.StringEnum];
        let out = expression.children.filter(m => include.indexOf(m.nodeType) > -1)
            .map(m => this.visit(m));
        return out;
    }
    visitRecord(expression) {
        this.gotags = [];
        let gotags = expression.get('gotags');
        if (gotags) {
            this.gotags = Array.isArray(gotags) ? gotags : [gotags];
        }
        let comment = expression.get('doc');
        comment = comment ? '// ' + comment + '\n' : '';
        let properties = [];
        for (let property of expression.properties) {
            properties.push(this.visit(property));
        }
        let builder = comment + `type ${ucFirst(expression.name)} struct {\n`;
        for (let p of properties) {
            builder += Indention + p + '\n';
        }
        builder += '}';
        return builder;
    }
    visitProperty(expression) {
        let name = expression.name;
        let tags = this.generateTags(name, expression);
        let type = this.visit(expression.type);
        let isPointer = !!expression.get("gopointer");
        type = expression.get('gotype') || type;
        let comment = expression.get('doc');
        comment = comment ? '// ' + comment + '\n' + Indention : '';
        return `${comment}${ucFirst(name)} `
            + (isPointer ? '*' : '') + type + " " + tags;
    }
    visitiRecordType(expression) {
        return ucFirst(expression.name);
    }
    visitType(expression) {
        switch (expression.type) {
            case ceveral_compiler_1.Type.Date:
                this.imports.add('time');
                return "time.Time";
            case ceveral_compiler_1.Type.Boolean: return "bool";
            case ceveral_compiler_1.Type.Bytes: return "[]byte";
            case ceveral_compiler_1.Type.Double: return "float64";
            case ceveral_compiler_1.Type.Float: return "float32";
            default: return ceveral_compiler_1.Type[expression.type].toLowerCase();
        }
    }
    visitImportType(expression) {
        return expression.name;
    }
    visitOptionalType(expression) {
        return this.visit(expression.type);
    }
    visitRepeatedType(expression) {
        return "[]" + this.visit(expression.type);
    }
    visitMapType(expression) {
        let key = this.visit(expression.key);
        let value = this.visit(expression.value);
        return `map[${key}]${value}`;
    }
    visitAnnotation(expression) {
        return expression;
    }
    visitNumericEnum(expression) {
        let e = `type ${ucFirst(expression.name)} int32\n\nconst (\n  `;
        this.firstMember = true;
        this.enumName = ucFirst(expression.name);
        e += expression.members.map(m => this.visit(m)).join('\n  ');
        e += '\n)';
        return e;
    }
    visitNumericEnumMember(expression) {
        let e = ucFirst(expression.name);
        if (expression.value != null) {
            if (this.firstMember)
                e += ' ' + this.enumName;
            e += ' = ' + (this.firstMember ? 'iota + ' : '') + expression.value;
        }
        else {
            e += (this.firstMember ? `${this.enumName} = iota + ` : '');
        }
        this.firstMember = false;
        return e;
    }
    visitStringEnum(expression) {
        let e = `type ${ucFirst(expression.name)} string\n\nconst (\n  `;
        this.firstMember = true;
        this.enumName = ucFirst(expression.name);
        e += expression.members.map(m => this.visit(m)).join('\n  ');
        e += '\n)';
        return e;
    }
    visitStringEnumMember(expression) {
        let e = ucFirst(expression.name);
        e += ` ${this.enumName} = "${expression.value}"`;
        this.firstMember = false;
        return e;
    }
    visitService(_) {
    }
    visitMethod(_) {
    }
    visitAnonymousRecord(_) {
    }
}
exports.GolangVisitor = GolangVisitor;
