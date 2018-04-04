/**
 * Symbols for handling protocols
 **/

export default class Protocol {

	$_name;
	$_inherits;
	$_methods = [];

	constructor(name, inherits) {
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
		this.$_methods.push({selector: selector.methodName, required: required, classMethod: classMethod});
	}
}
