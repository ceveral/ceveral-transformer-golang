import { ImportedPackageExpression, TranspileOptions, IResult } from 'ceveral-compiler';
export * from './visitor';
declare var _default: {
    name: string;
    annotations: {
        records: {
            gotags: {
                arguments: string;
                description: string;
            };
            doc: {
                arguments: string;
                description: string;
            };
        };
        properties: {
            gotags: {
                arguments: string;
            };
            gopointer: {
                arguments: string;
                description: string;
            };
            gotype: {
                arguments: string;
                description: string;
            };
            doc: {
                arguments: string;
            };
        };
    };
    transform(ast: ImportedPackageExpression, options: TranspileOptions): Promise<IResult[]>;
};
export default _default;
