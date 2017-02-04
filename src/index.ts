
import {ImportedPackageExpression, TranspileOptions, IResult} from 'ceveral-compiler'
import {GolangVisitor} from './visitor'

export default {
	name: 'Golang',
	transform(ast: ImportedPackageExpression, options:TranspileOptions): Promise<IResult[]> {
		let visitor = new GolangVisitor(options);
		return Promise.resolve(visitor.parse(ast));
	}
}