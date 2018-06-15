/**
 * Symbols for handling protocols
 **/

class Protocol {

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
exports.Protocol = Protocol;

// Also, protocols need universal registry
class ProtocolRegistry {

	static $regMap = {};

	static registerProtocol(protocol) {
		this.$regMap[protocol.name] = protocol;
	}

	static protocolForName(protoName) {
		const protocol = this.$regMap[protoName];
		if (protocol === undefined)
			throw `Cannot find protocol declaration for '${protoName}'`;
		return protocol;
	}
}
exports.ProtocolRegistry = ProtocolRegistry;
