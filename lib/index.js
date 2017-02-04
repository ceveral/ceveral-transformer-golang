"use strict";
const visitor_1 = require("./visitor");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    name: 'Golang',
    transform(ast, options) {
        let visitor = new visitor_1.GolangVisitor(options);
        return Promise.resolve(visitor.parse(ast));
    }
};
