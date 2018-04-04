'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = objj_msgSend;
exports.objj_propGuard = objj_propGuard;
exports.objj_initialize = objj_initialize;
exports.objj_function = objj_function;
exports.objj_propertyDescriptor = objj_propertyDescriptor;
exports.objj_string = objj_string;
exports.objj_invocation = objj_invocation;
exports.objj_methodSignature = objj_methodSignature;
exports.objj_throw_arg = objj_throw_arg;

var _CPObject = require('./Foundation/CPObject');

var _CPObject2 = _interopRequireDefault(_CPObject);

var _CPString = require('./Foundation/CPString');

var _CPString2 = _interopRequireDefault(_CPString);

var _CPMethodSignature = require('./Foundation/CPMethodSignature');

var _CPMethodSignature2 = _interopRequireDefault(_CPMethodSignature);

var _CPInvocation = require('./Foundation/CPInvocation');

var _CPInvocation2 = _interopRequireDefault(_CPInvocation);

var _CPException = require('./Foundation/CPException');

var _CPException2 = _interopRequireDefault(_CPException);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
	* A "decorator" kind of function that facilitates making null-targeted methods into no-ops and handles message forwarding. Compiler rewrites all method calls to this function.
*/

function objj_msgSend(target, selector, ...args) {
	// null target returns null
	if (target === null) return null;

	// initialize class if needed
	const targetClass = target instanceof _CPObject2.default ? target.constructor : target;
	if (!targetClass.initialized) {
		objj_initialize(targetClass);
	}

	let property = objj_function(selector);
	if (property in target || targetClass !== target && targetClass.resolveInstanceMethod_(selector) || targetClass === target && targetClass.resolveClassMethod_(selector)) {
		const propValue = target[property];
		if (typeof propValue === 'function') {
			return propValue.apply(target, args);
		} else {
			// property access--check for getter
			const descriptor = objj_propertyDescriptor(target, selector);
			if (descriptor !== undefined && descriptor.get !== undefined) return descriptor.get.apply(target);else target.doesNotRecognizeSelector_(selector);
		}
	} else {
		// check whether is setter called by name
		property = selector.substr(3, selector.length - 4).toLowerCase();
		if (selector.substr(0, 3) === 'set' && property in target) {
			const descriptor = objj_propertyDescriptor(target, property);
			if (descriptor !== undefined && descriptor.set !== undefined) return descriptor.set.apply(target, args);
		}
		// otherwise see if we can forward the message
		const forwardingTarget = target.forwardingTargetForSelector_(selector);
		if (forwardingTarget && forwardingTarget !== target) {
			return objj_msgSend(forwardingTarget, selector, ...args);
		} else {
			// lastly see if we can use forwardInvocation
			const methodSignature = target.methodSignatureForSelector_(selector);
			if (methodSignature) {
				const invocation = objj_invocation(target, selector, ...args);
				if (invocation) {
					target.forwardInvocation_(invocation);
					// if the above doesn't throw, we need to return the value
					return invocation.returnValue;
				}
			} else target.doesNotRecognizeSelector_(selector);
		}
	}
}

/*
	* A "decorator" kind of function that facilitates null-targeted dot syntax property access into no-ops. Compiler wraps all objects with dot syntax property access with this call.
	* Will also support standard JS calls and chained calls: e.g. CPObject.alloc().init() -> objj_propGuard(CPObject, 'alloc', [], 'init', [])
*/

/**
 * The Objective-J "Runtime", as it were. Essentially just a group of utility methods. They must be functions or we run into cyclical import issues since functions are hoisted, and classes aren't.
 * We generally expect that these methods will only be called internally by the framework, so we allow run-time errors to occur by passing null/undefined values.
 **/

function objj_propGuard(object, ...args) {
	while (args.length) {
		if (object === null) return null;

		let target = object,
		    property = args.shift();

		// must exist
		if (property in target === false) objj_throw_arg(`Property '%s' not found on %s of type '%s'`, property, typeof target === 'function' ? 'class' : 'object', typeof target === 'function' ? target.name : target.constructor.nam);

		object = object[property];
		if (typeof object === 'function') object = object.apply(target, args.shift());else if (args.length === 1 && args[0] instanceof Array) {
			// assume that data property with single extra value is setter
			object[property] = args.shift()[0];
		}
	}

	return object;
}

/*
 * +initialize support: called to run the one-time initialization of a class and its superclass. Can also be used as a wrapper to ensure initialization
 * on property access/method calls when forwarding is not needed or desired. Keeps track of what is initialized by adding classes as properties to function object.
*/

function objj_initialize(aClass) {
	// need to initialize top-down
	let chain = [];
	for (let targetClass = aClass; targetClass !== Object.getPrototypeOf(_CPObject2.default); targetClass = Object.getPrototypeOf(targetClass)) {
		if (!targetClass.initialized) chain.unshift(targetClass);
	}

	for (let i = 0; i < chain.length; i++) {
		let targetClass = chain[i];
		targetClass.initialize();
		targetClass.$$initialized = true;
		targetClass.load();
	}

	// return arg so we can use as wrapper
	return aClass;
}

/*
 * Converts Objective-J selector string into the javascript function name
*/

function objj_function(selector) {
	// let null be null
	if (selector === null) return null;

	let parts = selector.split(':');
	if (parts[parts.length - 1].length === 0) parts.pop();
	return parts.join('_');
}

/*
 * Utility function to get descriptor for property on object anywhere on the prototype chain
*/

function objj_propertyDescriptor(object, property) {
	if (property in object === false) return undefined;

	let proto = object,
	    descriptor;
	do {
		descriptor = Object.getOwnPropertyDescriptor(proto, property);
		proto = Object.getPrototypeOf(proto);
	} while (descriptor === undefined && proto !== null);

	return descriptor;
}

/*
 * Convenience functions for creating objects that may depends on caller declaration, to avoid circular dependencies.
*/

// wrapper for string convenience constructor
function objj_string(string) {
	return new _CPString2.default(string);
}

// wrapper for CPInvocation creation
function objj_invocation(target, selector, ...args) {
	const methodSignature = objj_msgSend(target, 'methodSignatureForSelector:', selector);
	if (methodSignature !== null) {
		const invocation = objj_msgSend(_CPInvocation2.default, 'invocationWithMethodSignature:', methodSignature);
		if (invocation) {
			invocation.target = target;
			invocation.selector = selector;
			for (let i = 0; i < args.length; i++) {
				invocation.setArgument_atIndex_(args[i], i + 2);
			}
		}
		return invocation;
	}
	return null;
}

// wrapper for method signature creation
function objj_methodSignature(object, selector) {
	if (objj_function(selector) in object === false) return null;

	return objj_initialize(_CPMethodSignature2.default).signatureWithObjCTypes_('@@:'.padEnd(object[selector].length, '@'));
}

// wrapper for -[CPException raise:format:arguments:] for CPInvalidArgumentException
function objj_throw_arg(error, ...args) {
	objj_initialize(_CPException2.default).raise_format_arguments_(_CPException.CPInvalidArgumentException, new _CPString2.default(error), args);
}
//# sourceMappingURL=Objective-J.js.map