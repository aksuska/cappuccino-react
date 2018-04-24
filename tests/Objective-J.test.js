import objj_msgSend, {
	objj_propGuard,
	objj_initialize,
	objj_function,
	objj_propertyDescriptor,
	objj_string,
	objj_invocation,
	objj_methodSignature,
	objj_throw_arg,
	objj_prop2setter, objj_setter2prop, objj_getMethod
} from '../src/Objective-J';
import {
	CPObject,
	CPString,
	CPInvocation,
	CPInvalidArgumentException,
	CPMethodSignature
} from '../src/Foundation/Foundation';

/*
	* Let's test utility function first as the main two might depend on them
*/

test("objj_initialize() initializes chain", () => {
	const MyObject = class extends CPObject { static initialize() { this.newClassProperty = 1; }	};
	expect(MyObject.initialized).toBeFalsy();
	expect(CPObject.initialized).toBeFalsy();
	const result = objj_initialize(MyObject);
	expect(result).toBe(MyObject);
	expect(MyObject.initialized).toBeTruthy();
	expect(MyObject.newClassProperty).toBe(1);
	expect(CPObject.initialized).toBeTruthy();
});

test("objj_function() performs expected conversion", () => {
	expect(objj_function(null)).toBeNull();
	expect(objj_function('description')).toBe('description');
	expect(objj_function('description:')).toBe('description_');
	expect(objj_function('description:locale:')).toBe('description_locale_');
});

test("objj_propertyDescriptor() returns descriptor anywhere on prototype chain", () => {
	const MyObject = class extends CPObject { constructor() { super(); this.myProperty = 1; }	};
	const MyObject2 = class extends MyObject {};
	const object = new MyObject2();
	expect(objj_propertyDescriptor(object, 'bogus')).toBeUndefined();
	expect(objj_propertyDescriptor(object, 'myProperty')).not.toBeUndefined();
	expect(objj_propertyDescriptor(MyObject2, 'description')).not.toBeUndefined();
});

test("objj_prop2setter() returns proper setter selector", () => {
	expect(objj_prop2setter('propValue')).toBe('setPropValue:');
});

test("objj_setter2prop() returns proper property name from setter selector", () => {
	expect(objj_setter2prop('setPropValue:')).toBe('propValue');
});

test("objj_string() returns CPString instance", () => {
	expect(objj_string("hello")).toBeInstanceOf(CPString);
});

test("objj_getMethod() returns undefined for no such selector", () => {
	expect(objj_getMethod(CPObject, 'bogus')).toBeUndefined();
});

test("objj_getMethod() checks for setter pattern, returns undefined for no such selector", () => {
	const MyObject = class extends CPObject { constructor() {super(); this.$propValue = false} get propValue() { return this.$propValue} set propValue(value) { this.$propValue = value} testMethod() {return true;} };
	expect(objj_getMethod(new MyObject(), 'tesPropValue:')).toBeUndefined();
});

test("objj_getMethod() returns undefined for property returning class without defined getter", () => {
	const MyObject = class extends CPObject { constructor() {super(); this.propValue = CPObject} };
	const object = new MyObject();
	expect(objj_getMethod(object, 'propValue')).toBeUndefined();
	Object.defineProperty(object, 'prop', {get() { return this.propValue } });
	expect(typeof objj_getMethod(object, 'prop')).toBe('function');
});

test("objj_getMethod() returns function for regular method", () => {
	const MyObject = class extends CPObject { constructor() {super(); this.$propValue = false} get propValue() { return this.$propValue} set propValue(value) { this.$propValue = value} testMethod() {return true;} };
	expect(typeof objj_getMethod(new MyObject(), 'testMethod')).toBe('function');
});

test("objj_getMethod() returns function for defined accessors", () => {
	const MyObject = class extends CPObject { constructor() {super(); this.$propValue = false} get propValue() { return this.$propValue} set propValue(value) { this.$propValue = value} testMethod() {return true;} };
	const object = new MyObject();
	expect(typeof objj_getMethod(object, 'propValue')).toBe('function');
	expect(typeof objj_getMethod(object, 'setPropValue:')).toBe('function');
});

test("objj_methodSignature() returns signature or null", () => {
	// unrecognized returns null
	expect(objj_methodSignature(CPObject, 'bogus')).toBeNull();
	// selector returns method signature object
	const MyObject = class extends CPObject { testMethod_(arg) {return true;} };
	let sig = objj_methodSignature(new MyObject(), 'testMethod:');
	expect(sig).toBeInstanceOf(CPMethodSignature);
	expect(sig.$$typeList.join('')).toBe('@@:@');
});

test("objj_throw_arg() throws expected exception", () => {
	try {
		objj_throw_arg("Exception with args %d, %d, %d", 1, 2, 3);
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CPInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe("Exception with args 1, 2, 3");
	}
});

test("objj_invocation() returns configured CPInvocation instance", () => {
	const MyObject = class extends CPObject { testMethod__(arg1, arg2) {return true;} };
	const object = new MyObject();
	const invocation = objj_invocation(object, 'testMethod::', 'arg1', 'arg2');
	expect(invocation).toBeInstanceOf(CPInvocation);
	expect(invocation.target).toBe(object);
	expect(invocation.selector).toBe('testMethod::');
	let arg = null, argRef = { get name() { return 'arg' }, get arg() { return arg }, set arg(value) { arg = value } };
	invocation.getArgument_atIndex_(argRef, 2);
	expect(arg).toBe('arg1');
	invocation.getArgument_atIndex_(argRef, 3);
	expect(arg).toBe('arg2');
});

/*
	* objj_msgSend() tests
*/

test("objj_msgSend() returns null for null target", () => {
	expect(objj_msgSend(null)).toBeNull();
});

test("objj_msgSend() calls objj_initialize()", () => {
	const MyObject = class extends CPObject {static testMethod() {return true;}};
	expect(MyObject.initialized).toBeFalsy();
	objj_msgSend(MyObject, 'testMethod');
	expect(MyObject.initialized).toBeTruthy();
});

test("objj_msgSend() performs selector", () => {
	const MyObject = class extends CPObject { testMethod_(num) { return 1 + num; }	};
	expect(objj_msgSend(new MyObject(), 'testMethod:', 1)).toBe(2);
});

test("objj_msgSend() calls resolveInstanceMethod", () => {
	const MyObject = class extends CPObject { static resolveInstanceMethod_(aSelector) { this.prototype.newProperty = function () {return "hello"}; return true }};
	expect(objj_msgSend(new MyObject(), 'newProperty')).toBe("hello");
});

test("objj_msgSend() calls resolveClassMethod", () => {
	const MyObject = class extends CPObject { static resolveClassMethod_(aSelector) { this.newProperty = function () {return "hello"}; return true }};
	expect(objj_msgSend(MyObject, 'newProperty')).toBe("hello");
});

test("objj_msgSend() missing defined getter throws 'does not recognize' exception", () => {
	const MyObject = class extends CPObject { constructor() { super(); this.prop = 1} };
	const object = new MyObject();
	try {
		objj_msgSend(object, 'prop');
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CPInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe(`-[MyObject prop]: unrecognized selector sent to instance ${object.$$uidString()}`);
	}
});

test("objj_msgSend() executes getter as method", () => {
	const MyObject = class extends CPObject { constructor() { super(); this.$prop = 1; } get prop() { return this.$prop }	};
	expect(objj_msgSend(new MyObject(), 'prop')).toBe(1);
});

test("objj_msgSend() setter as selector: missing defined setter throws 'does not recognize' exception (also tests any non-recognized method throws)", () => {
	const MyObject = class extends CPObject { constructor() { super(); this.$prop = 1; } get prop() { return this.$prop }	};
	const object = new MyObject();
	try {
		objj_msgSend(object, 'setProp:', 2);
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CPInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe(`-[MyObject setProp:]: unrecognized selector sent to instance ${object.$$uidString()}`);
	}
});

test("objj_msgSend() executes setter as method", () => {
	const MyObject = class extends CPObject { constructor() { super(); this.$propValue = 1; } set propValue(value) { this.$propValue = value }	};
	const object = new MyObject();
	objj_msgSend(object, 'setPropValue:', 3);
	expect(object.$propValue).toBe(3);
});

test("objj_msgSend() calls forwarding target", () => {
	const MyObject = class extends CPObject { forwarded() { return true }	};
	const MyObject2 = class extends CPObject { forwardingTargetForSelector_(aSelector) {return new MyObject()} };
	expect(objj_msgSend(new MyObject2(), 'forwarded')).toBeTruthy();
});

test("objj_msgSend() calls forwardInvocation:", () => {
	const MyObject = class extends CPObject { forwarded() { return true }	};
	const MyObject2 = class extends CPObject { constructor() {super(); this.forwardee = new MyObject();} methodSignatureForSelector_(aSelector) {return objj_methodSignature(this.forwardee, aSelector)} forwardInvocation_(invocation) {invocation.invokeWithTarget_(this.forwardee)} };
	expect(objj_msgSend(new MyObject2(), 'forwarded')).toBeTruthy();
});

/*
	* objj_propGuard() tests
*/

test("objj_propGuard() returns null for null object/result", () => {
	expect(objj_propGuard(null, 'any')).toBeNull();
	// check chained
	expect(objj_propGuard({prop: null}, 'prop', 'bogus')).toBeNull();
});

test("objj_propGuard() throws on nonexistent property", () => {
	try {
		objj_propGuard({}, 'prop');
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CPInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe(`Property 'prop' not found on object of type 'Object'`);
	}
});

test("objj_propGuard() returns correct value on property chain", () => {
	expect(objj_propGuard(new CPString("hello"), 'jsString', 'length')).toBe(5);
});

test("objj_propGuard() executes property chain setter", () => {
	const MyObject = class extends CPObject { constructor() { super(); this.$prop = false } get prop() { return this.$prop } set prop(value) { this.$prop = value }	};
	const object = new MyObject();
	objj_propGuard(object, 'prop', [true]);
	expect(object.prop).toBeTruthy();
});

