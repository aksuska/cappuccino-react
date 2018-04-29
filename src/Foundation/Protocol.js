/**
 * Symbols for handling protocols
 **/

export default class Protocol {

	$name;
	$inherits;
	$methods = [];
	$properties = [];

	constructor(name, inherits = null) {
		this.$name = name;
		this.$inherits = inherits;
	}

	get name() {
		return this.$name;
	}

	get inherits() {
		return this.$inherits;
	}

	// adds a method to the protocol definition
	addSelector_isRequired_isClassMethod(selector, required, classMethod) {
		this.$methods.push({selector: selector, required: required, classMethod: classMethod});
	}

	// adds a property to the protocol definition
	addProperty_isRequired_onClass(property, required, onClass) {
		this.$properties.push({property: property, required: required, onClass: onClass});
	}
}
