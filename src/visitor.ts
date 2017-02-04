import * as Path from 'path'
import {  isStringArray } from './utils';
import {
    Token, Type, BaseVisitor, IResult, TranspileOptions, RecordTypeExpression,
     PackageExpression, RecordExpression,
    AnnotationExpression, PropertyExpression, TypeExpression, ImportTypeExpression,
    RepeatedTypeExpression, MapTypeExpression, OptionalTypeExpression,
    StringEnumExpression, StringEnumMemberExpression, NumericEnumExpression, NumericEnumMemberExpression,
    ExpressionPosition, AnnotatedExpression, ServiceExpression, MethodExpression, AnonymousRecordExpression
} from 'ceveral-compiler';

import * as _ from 'lodash'

export class GolangError extends Error {
    constructor(public message: string, public location: ExpressionPosition) {
        super(message);
    }
}



function ucFirst(name: string) {
    return _.upperFirst(_.camelCase(name))
}

const Indention = '  ';

export class GolangVisitor extends BaseVisitor {
    imports: Set<string> = new Set();
    package: string;
    gotags: string[]
    firstMember: boolean;
    enumName: string;
    constructor(public options: TranspileOptions) {
        super();
    }
    parse(expression: PackageExpression): IResult[] {
        let out: string[] = this.visit(expression);
        
        let imports = (new Array(...this.imports)).map(m => `  "${m}"`)
        let builder = "package " + this.package + '\n\n';

        if (imports.length) {
            builder += `import (\n${imports.join('\n')}\n)\n\n`;
        }

        builder += out.join('\n\n') + '\n'

        return [{
            filename: Path.basename(this.options.fileName, Path.extname(this.options.fileName)) + ".go",
            buffer: new Buffer(builder)
        }]
    }

    private generateTags(name: string, exp: AnnotatedExpression) {
        let gotags: any = exp.get('gotags') || this.gotags;

        let tagStr = '';
        if (gotags) {
            if (isStringArray(gotags)) {
                gotags = gotags.map(m => `${m}:"${name},omitempty"`);
            } else if (typeof gotags === 'object') {
                let tmp = [];
                for (let key in gotags) {
                    tmp.push(`${key}:"${gotags[key]}"`);
                }
                gotags = tmp;
            }

            if (gotags.length)
                tagStr = "`" + gotags.join(' ') + "`"
        }

        return tagStr;
    }


    visitPackage(expression: PackageExpression): any {

        this.package = expression.name;
        /*for (let child of expression.children) {
            out.push(this.visit(child));
        }*/
        let include = [Token.Record, Token.NumericEnum, Token.StringEnum];
        let out = expression.children.filter(m => include.indexOf(m.nodeType) > -1)
            .map(m => this.visit(m));
        
        return out;
    }

    visitRecord(expression: RecordExpression): any {

        this.gotags = [];
        
        let gotags = expression.get('gotags')
        if (gotags) {
            this.gotags = Array.isArray(gotags) ? gotags : [gotags];
        }

        let comment: any = expression.get('doc');
        comment = comment ? '// ' + comment + '\n' : ''

        let properties = [];
        for (let property of expression.properties) {
            properties.push(this.visit(property));
        }

        let builder = comment + `type ${ucFirst(expression.name)} struct {\n`;
        for (let p of properties) {
            builder += Indention + p + '\n'
        }
        builder += '}'

        return builder;

    }
    visitProperty(expression: PropertyExpression): any {

        let name = expression.name;
        let tags = this.generateTags(name, expression);
        let type = this.visit(expression.type);
        let isPointer = !!expression.get("gopointer")
        type = expression.get('gotype') || type;
        let comment: any = expression.get('doc');
        comment = comment ? '// ' + comment + '\n' + Indention : ''


        return `${comment}${ucFirst(name)} `
            + (isPointer ? '*' : '') + type + " " + tags
    }

    visitiRecordType(expression: RecordTypeExpression) {
        return ucFirst(expression.name);
    }

    visitType(expression: TypeExpression): any {
        switch (expression.type) {
            case Type.Date:
                this.imports.add('time')
                return "time.Time"
            case Type.Boolean: return "bool"
            case Type.Bytes: return "[]byte"
            case Type.Double: return "float64"
            case Type.Float: return "float32"
            default: return Type[expression.type].toLowerCase();
        }
    }

    visitImportType(expression: ImportTypeExpression): any {
        return expression.name
    }

    visitOptionalType(expression: OptionalTypeExpression): any {
        return this.visit(expression.type);
    }

    visitRepeatedType(expression: RepeatedTypeExpression): any {
        return "[]" + this.visit(expression.type);
    }

    visitMapType(expression: MapTypeExpression): any {
        let key = this.visit(expression.key);
        let value = this.visit(expression.value);
        return `map[${key}]${value}`;
    }

    visitAnnotation(expression: AnnotationExpression): any {
        return expression;
    }

    visitNumericEnum(expression: NumericEnumExpression): any {
        let e = `type ${ucFirst(expression.name)} int32\n\nconst (\n  `
        this.firstMember = true;
        this.enumName = ucFirst(expression.name);
        e += expression.members.map(m => this.visit(m)).join('\n  ')
        e += '\n)'
        return e;
    }

    visitNumericEnumMember(expression: NumericEnumMemberExpression): any {
        let e = ucFirst(expression.name)
        if (expression.value != null) {
            if (this.firstMember) e += ' ' + this.enumName
            e += ' = ' + (this.firstMember ? 'iota + ' : '') + expression.value;
        } else {
            e += (this.firstMember ? `${this.enumName} = iota + ` : '') 
        }
        this.firstMember = false;
        return e
    }
    visitStringEnum(expression: StringEnumExpression): any {
        let e = `type ${ucFirst(expression.name)} string\n\nconst (\n  `
        this.firstMember = true;
        this.enumName = ucFirst(expression.name);
        e += expression.members.map(m => this.visit(m)).join('\n  ')

        e += '\n)';
        return e;
    }
    visitStringEnumMember(expression: StringEnumMemberExpression): any {
        let e = ucFirst(expression.name)
        e += ` ${this.enumName} = "${expression.value}"`;
        this.firstMember = false;
        return e
    }


    visitService(_: ServiceExpression): any {

    }

    visitMethod(_: MethodExpression): any {

    }

    visitAnonymousRecord(_: AnonymousRecordExpression): any {

    }

}
