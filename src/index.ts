
import {ImportedPackageExpression, TranspileOptions, IResult} from 'ceveral-compiler'
import {GolangVisitor} from './visitor'

export default {
	name: 'Golang',
	annotations: {
        records: {
            gotags: {
                arguments: '[string]|string',
                description: "Generate struct tags on all fields"
            },
            doc: {
                arguments: "string",
                description: "Generate documenting comments"
            }
        },
        properties: {
            gotags: {
                arguments: '[string]|{string}'
            },
            gopointer: {
                arguments: "boolean",
                description: "Declare the field as a pointer"
            },
            gotype: {
                arguments: 'string',
                description: "Override Go type"
            },
            doc: {
                arguments: "string"
            }
        }
    },
	transform(ast: ImportedPackageExpression, options:TranspileOptions): Promise<IResult[]> {
		let visitor = new GolangVisitor(options);
		return Promise.resolve(visitor.parse(ast));
	}
}