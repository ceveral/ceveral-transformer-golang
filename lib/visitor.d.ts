import { BaseVisitor, IResult, TranspileOptions, RecordTypeExpression, PackageExpression, RecordExpression, AnnotationExpression, PropertyExpression, TypeExpression, ImportTypeExpression, RepeatedTypeExpression, MapTypeExpression, OptionalTypeExpression, StringEnumExpression, StringEnumMemberExpression, NumericEnumExpression, NumericEnumMemberExpression, ExpressionPosition, ServiceExpression, MethodExpression, AnonymousRecordExpression } from 'ceveral-compiler';
export declare class GolangError extends Error {
    message: string;
    location: ExpressionPosition;
    constructor(message: string, location: ExpressionPosition);
}
export declare class GolangVisitor extends BaseVisitor {
    options: TranspileOptions;
    imports: Set<string>;
    package: string;
    gotags: string[];
    firstMember: boolean;
    enumName: string;
    constructor(options: TranspileOptions);
    parse(expression: PackageExpression): IResult[];
    private generateTags(name, exp);
    visitPackage(expression: PackageExpression): any;
    visitRecord(expression: RecordExpression): any;
    visitProperty(expression: PropertyExpression): any;
    visitiRecordType(expression: RecordTypeExpression): any;
    visitType(expression: TypeExpression): any;
    visitImportType(expression: ImportTypeExpression): any;
    visitOptionalType(expression: OptionalTypeExpression): any;
    visitRepeatedType(expression: RepeatedTypeExpression): any;
    visitMapType(expression: MapTypeExpression): any;
    visitAnnotation(expression: AnnotationExpression): any;
    visitNumericEnum(expression: NumericEnumExpression): any;
    visitNumericEnumMember(expression: NumericEnumMemberExpression): any;
    visitStringEnum(expression: StringEnumExpression): any;
    visitStringEnumMember(expression: StringEnumMemberExpression): any;
    visitService(_: ServiceExpression): any;
    visitMethod(_: MethodExpression): any;
    visitAnonymousRecord(_: AnonymousRecordExpression): any;
}
