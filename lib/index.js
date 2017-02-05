"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
const visitor_1 = require("./visitor");
__export(require("./visitor"));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
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
    transform(ast, options) {
        let visitor = new visitor_1.GolangVisitor(options);
        return Promise.resolve(visitor.parse(ast));
    }
};
