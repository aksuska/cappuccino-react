/*!
 * The Objective-J "Runtime", as it were. Essentially just a group of utility methods. They must be functions or we run into cyclical import issues since functions are hoisted, and classes aren't.
 * We generally expect that these methods will only be called internally by the framework, so we allow run-time errors to occur by passing null/undefined values.
 **/

/*!
	* A "decorator" kind of function that facilitates making null-targeted methods into no-ops and handles message forwarding. Compiler rewrites all method calls to this function.
*/

function objj_msgSend(target, selector, ...args) {
	// null target returns null
	if (target === null)
		return null;

	// initialize class if needed
	const targetClass = typeof target === 'object' ? target.constructor : target;
	if (!targetClass.initialized) {
		objj_initialize(targetClass);
	}

	const method = objj_getMethod(target, selector);
	if (method !== undefined) {
		return method.apply(target, args);
	}
	else {
		// otherwise see if we can forward the message
		const forwardingTarget = target.forwardingTargetForSelector_(selector);
		if (forwardingTarget && forwardingTarget !== target) {
			return objj_msgSend(forwardingTarget, selector, ...args);
		}
		else {
			// lastly see if we can use forwardInvocation
			const methodSignature = target.methodSignatureForSelector_(selector);
			if (methodSignature) {
				const invocation = objj_invocation(target, selector, ...args);
				if (invocation) {
					target.forwardInvocation_(invocation);
					// if the above doesn't throw, we need to return the value
					return invocation.returnValue;
				}
			}
			else
				target.doesNotRecognizeSelector_(selector);
		}
	}
}
exports.objj_msgSend = objj_msgSend;

/*!
	* A "decorator" kind of function that facilitates null-targeted dot syntax property access into no-ops. Compiler wraps all objects with dot syntax property access with this call.
	* Will also support standard JS calls and chained calls: e.g. CRObject.alloc().init() -> objj_propGuard(CRObject, 'alloc', [], 'init', [])
*/

function objj_propGuard(object, ...args) {
	while(args.length) {
		if (object === null)
			return null;

		let target = object, property = args.shift();

		// must exist
		if ((typeof object === 'object' && property in target === false) || (typeof object !== 'object' && target[property] === undefined))
			objj_initialize(CRException).raise_format_(CRInvalidArgumentException, CRString.new(`Property '%s' not found on %s of type '%s'`), property, (typeof target === 'function' ? 'class' : 'object'), (typeof target === 'function' ? target.name : target.constructor.name));

		object = object[property];
		if (typeof object === 'function')
			object = object.apply(target, args.shift());
		else if (args.length === 1 && args[0] instanceof Array)
		{
			// assume that data property with single extra value is setter, but make sure there is a defined setter
			const descriptor = objj_propertyDescriptor(target, property);
			if (descriptor.set)
				target[property] = args.shift()[0];
			else
				objj_initialize(CRException).raise_format_(CRInvalidArgumentException, CRString.new("Assignment to readonly property"));
		}
	}

	return object;
}
exports.objj_propGuard = objj_propGuard;

/*!
 * +initialize support: called to run the one-time initialization of a class and its superclass. Can also be used as a wrapper to ensure initialization
 * on property access/method calls when forwarding is not needed or desired. Keeps track of what is initialized by adding classes as properties to function object.
*/

function objj_initialize(aClass) {
	// need to initialize top-down
	let chain = [];
	let targetClass = aClass;
	while (targetClass.name !== 'CRObject') {
		if (!targetClass.initialized)
			chain.unshift(targetClass);
		targetClass = Object.getPrototypeOf(targetClass);
	}

	// now check CRObject--we do this separately as mixin maintains state
	if (objj_CRObject.$initialized === false) {
		objj_CRObject.$initialized = true;
		chain.unshift(CRObject);
	}

	for (let i = 0; i < chain.length; i++) {
		let targetClass = chain[i];
		targetClass.initialize();
		targetClass.$initialized = true;
		targetClass.load();
	}

	// return arg so we can use as wrapper
	return aClass;
}
exports.objj_initialize = objj_initialize;

/*!
 * Converts Objective-J selector string into the javascript function name
*/

function objj_function(selector) {
	// let null be null
	if (selector === null)
		return null;

	return selector.split(':').join('_');
}
exports.objj_function = objj_function;

/*!
 * Converts property name to Objective-J setter selector string and visa versa
*/

function objj_prop2setter(property) {
	return 'set' + property[0].toUpperCase() + property.substr(1) + ':';
}
exports.objj_prop2setter = objj_prop2setter;

function objj_setter2prop(selector) {
	const propName = selector.substr(3, selector.length - 4);
	return propName[0].toLowerCase() + propName.substr(1);
}
exports.objj_setter2prop = objj_setter2prop;

/*!
 * Utility function to get descriptor for property on object anywhere on the prototype chain
*/

function objj_propertyDescriptor(object, property) {
	if (property in object === false)
		return undefined;

	let proto = object, descriptor;
	do {
		descriptor = Object.getOwnPropertyDescriptor(proto, property);
		proto = Object.getPrototypeOf(proto);
	}	while(descriptor === undefined && proto !== null);

	return descriptor;
}
exports.objj_propertyDescriptor = objj_propertyDescriptor;

/*!
 * Algorithm for returning function that matches selector, or undefined if none. Employs full search for regular method vs accessor.
*/

function objj_getMethod(object, selector) {
	// null just means undefined
	if (selector === null) return undefined;

	let functionName = objj_function(selector), method;
	// It is not possible in JS to reliably determine whether a property is a data member returning a function or a method, so we have
	// to treat them as if they are the same thing. One exception is if it inherits from CRObject, which we can check for.
	if (typeof object[functionName] === 'function' && '$initialized' in object[functionName] === false) {
		method = object[functionName];
	}
	else if (functionName in object) {
		// check getter
		const descriptor = objj_propertyDescriptor(object, selector);
		method = descriptor.get;
	}
	else if (selector.substr(0, 3) === 'set' && (functionName = objj_setter2prop(selector)) in object)
	{
		// check setter
		const descriptor = objj_propertyDescriptor(object, functionName);
		method = descriptor.set;
	}
	else if((typeof object === 'object' ) ? object.constructor.resolveInstanceMethod_(selector) : object.resolveClassMethod_(selector))
	{
		// we expect that the resolve will add a regular or accessor method, so re-call us
		method = objj_getMethod(object, selector);
	}
	return method;
}
exports.objj_getMethod = objj_getMethod;

/*!
 * Convenience functions for creating objects that may depends on caller declaration, to avoid circular dependencies.
*/

//! wrapper for CRInvocation creation
function objj_invocation(target, selector, ...args) {
	const methodSignature = objj_msgSend(target, 'methodSignatureForSelector:', selector);
	if (methodSignature !== null) {
		const invocation = objj_msgSend(CRInvocation, 'invocationWithMethodSignature:', methodSignature);
		if (invocation) {
			invocation.target = target;
			invocation.selector = selector;
			for (let i= 0; i < args.length; i++) {
				let name = `arg${i}`, arg = {get name() {return name}, get [name]() {return args[i]}, set [name](value) {args[i] = value}};
				invocation.setArgument_atIndex_(arg, i + 2);
			}
		}
		return invocation;
	}
	return null;
}
exports.objj_invocation = objj_invocation;

// usage imports--import last so we avoid circular dependencies
const CRObjectSym = require('./Foundation/CRObject'), CRObject = CRObjectSym.CRObject, objj_CRObject = CRObjectSym.objj_CRObject;
const CRStringSym = require('./Foundation/CRString'), CRString = CRStringSym.CRString;
const CRInvocationSym = require('./Foundation/CRInvocation'), CRInvocation = CRInvocationSym.CRInvocation;
const CRExceptionSym = require("./Foundation/CRException"), CRException = CRExceptionSym.CRException, CRInvalidArgumentException = CRExceptionSym.CRInvalidArgumentException;

