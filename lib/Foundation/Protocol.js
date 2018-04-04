"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
/**
 * Symbols for handling protocols
 **/

class Protocol {

	constructor(name, inherits) {
		Object.defineProperty(this, "$_methods", {
			enumerable: true,
			writable: true,
			value: []
		});

		this.$_name = name;
		this.$_inherits = inherits;
	}

	get name() {
		return this.$_name;
	}

	get inherits() {
		return this.$_inherits;
	}

	// adds a method to the protocol definition
	addSelector_isRequired_isClassMethod(selector, required, classMethod) {
		this.$_methods.push({ selector: selector.methodName, required: required, classMethod: classMethod });
	}
}
exports.default = Protocol;
//# sourceMappingURL=Protocol.js.map