const OBJJ = require('../src/Objective-J'),
	objj_msgSend = OBJJ.objj_msgSend,
	objj_propGuard = OBJJ.objj_propGuard,
	objj_initialize = OBJJ.objj_initialize,
	objj_function = OBJJ.objj_function,
	objj_propertyDescriptor = OBJJ.objj_propertyDescriptor,
	objj_invocation = OBJJ.objj_invocation,
	objj_prop2setter = OBJJ.objj_prop2setter,
	objj_setter2prop = OBJJ.objj_setter2prop,
	objj_getMethod = OBJJ.objj_getMethod;
const CRObjectSym = require('../src/Foundation/CRObject'), objj_CRObject = CRObjectSym.objj_CRObject, CRObject = CRObjectSym.CRObject;
const CRStringSym = require('../src/Foundation/CRString'), CRString = CRStringSym.CRString;
const CRInvocationSym = require('../src/Foundation/CRInvocation'), CRInvocation = CRInvocationSym.CRInvocation;
const CRExceptionSym = require("../src/Foundation/CRException"), CRInvalidArgumentException = CRExceptionSym.CRInvalidArgumentException;

/*
	* Let's test utility function first as the main two might depend on them
*/

test("objj_initialize() initializes chain", () => {
	const MyObject = class extends objj_CRObject() { static initialize() { this.newClassProperty = 1; }	};
	expect(MyObject.initialized).toBeFalsy();
	expect(CRObject.initialized).toBeFalsy();
	const result = objj_initialize(MyObject);
	expect(result).toBe(MyObject);
	expect(MyObject.initialized).toBeTruthy();
	expect(MyObject.newClassProperty).toBe(1);
	expect(CRObject.initialized).toBeTruthy();
    expect(objj_CRObject.$initialized).toBeTruthy();
});

test("objj_function() performs expected conversion", () => {
	expect(objj_function(null)).toBeNull();
	expect(objj_function('description')).toBe('description');
	expect(objj_function('description:')).toBe('description_');
	expect(objj_function('description:locale:')).toBe('description_locale_');
});

test("objj_propertyDescriptor() returns descriptor anywhere on prototype chain", () => {
	const MyObject = class extends CRObject { constructor() { super(); this.myProperty = 1; }	};
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

test("objj_getMethod() returns undefined for null selector", () => {
	expect(objj_getMethod(CRObject, null)).toBeUndefined();
});

test("objj_getMethod() returns undefined for no such selector", () => {
	expect(objj_getMethod(CRObject, 'bogus')).toBeUndefined();
});

test("objj_getMethod() checks for setter pattern, returns undefined for no such selector", () => {
	const MyObject = class extends CRObject { constructor() {super(); this.$propValue = false} get propValue() { return this.$propValue} set propValue(value) { this.$propValue = value} testMethod() {return true;} };
	expect(objj_getMethod(new MyObject(), 'tesPropValue:')).toBeUndefined();
});

test("objj_getMethod() returns undefined for property returning class without defined getter", () => {
	const MyObject = class extends CRObject { constructor() {super(); this.propValue = CRObject} };
	const object = new MyObject();
	expect(objj_getMethod(object, 'propValue')).toBeUndefined();
	Object.defineProperty(object, 'prop', {get() { return this.propValue } });
	expect(typeof objj_getMethod(object, 'prop')).toBe('function');
});

test("objj_getMethod() returns function for regular method", () => {
	const MyObject = class extends CRObject { constructor() {super(); this.$propValue = false} get propValue() { return this.$propValue} set propValue(value) { this.$propValue = value} testMethod() {return true;} };
	expect(typeof objj_getMethod(new MyObject(), 'testMethod')).toBe('function');
});

test("objj_getMethod() returns function for defined accessors", () => {
	const MyObject = class extends CRObject { constructor() {super(); this.$propValue = false} get propValue() { return this.$propValue} set propValue(value) { this.$propValue = value} testMethod() {return true;} };
	const object = new MyObject();
	expect(typeof objj_getMethod(object, 'propValue')).toBe('function');
	expect(typeof objj_getMethod(object, 'setPropValue:')).toBe('function');
});

test("objj_invocation() returns configured CRInvocation instance", () => {
	const MyObject = class extends CRObject { testMethod__(arg1, arg2) {return true;} };
	const object = new MyObject();
	const invocation = objj_invocation(object, 'testMethod::', 'arg1', 'arg2');
	expect(invocation).toBeInstanceOf(CRInvocation);
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
	const MyObject = class extends CRObject {static testMethod() {return true;}};
	expect(MyObject.initialized).toBeFalsy();
	objj_msgSend(MyObject, 'testMethod');
	expect(MyObject.initialized).toBeTruthy();
});

test("objj_msgSend() performs selector", () => {
	const MyObject = class extends CRObject { testMethod_(num) { return 1 + num; }	};
	expect(objj_msgSend(new MyObject(), 'testMethod:', 1)).toBe(2);
});

test("objj_msgSend() calls resolveInstanceMethod", () => {
	const MyObject = class extends CRObject { static resolveInstanceMethod_(aSelector) { this.prototype.newProperty = function () {return "hello"}; return true }};
	expect(objj_msgSend(new MyObject(), 'newProperty')).toBe("hello");
});

test("objj_msgSend() calls resolveClassMethod", () => {
	const MyObject = class extends CRObject { static resolveClassMethod_(aSelector) { this.newProperty = function () {return "hello"}; return true }};
	expect(objj_msgSend(MyObject, 'newProperty')).toBe("hello");
});

test("objj_msgSend() missing defined getter throws 'does not recognize' exception", () => {
	const MyObject = class extends CRObject { constructor() { super(); this.prop = 1} };
	const object = new MyObject();
	try {
		objj_msgSend(object, 'prop');
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CRInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe(`-[MyObject prop]: unrecognized selector sent to instance ${object.$uidString()}`);
	}
});

test("objj_msgSend() executes getter as method", () => {
	const MyObject = class extends CRObject { constructor() { super(); this.$prop = 1; } get prop() { return this.$prop }	};
	expect(objj_msgSend(new MyObject(), 'prop')).toBe(1);
});

test("objj_msgSend() setter as selector: missing defined setter throws 'does not recognize' exception (also tests any non-recognized method throws)", () => {
	const MyObject = class extends CRObject { constructor() { super(); this.$prop = 1; } get prop() { return this.$prop }	};
	const object = new MyObject();
	try {
		objj_msgSend(object, 'setProp:', 2);
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CRInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe(`-[MyObject setProp:]: unrecognized selector sent to instance ${object.$uidString()}`);
	}
});

test("objj_msgSend() executes setter as method", () => {
	const MyObject = class extends CRObject { constructor() { super(); this.$propValue = 1; } set propValue(value) { this.$propValue = value }	};
	const object = new MyObject();
	objj_msgSend(object, 'setPropValue:', 3);
	expect(object.$propValue).toBe(3);
});

test("objj_msgSend() calls forwarding target", () => {
	const MyObject = class extends CRObject { forwarded() { return true }	};
	const MyObject2 = class extends CRObject { forwardingTargetForSelector_(aSelector) {return new MyObject()} };
	expect(objj_msgSend(new MyObject2(), 'forwarded')).toBeTruthy();
});

test("objj_msgSend() calls forwardInvocation:", () => {
	const MyObject = class extends CRObject { forwarded() { return true }	};
	const MyObject2 = class extends CRObject { constructor() {super(); this.forwardee = new MyObject();} methodSignatureForSelector_(aSelector) {return this.forwardee.methodSignatureForSelector_(aSelector)} forwardInvocation_(invocation) {invocation.invokeWithTarget_(this.forwardee)} };
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
		expect(e.name.jsString).toBe(CRInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe(`Property 'prop' not found on object of type 'Object'`);
	}
});

test("objj_propGuard() throws on assignment to property without defined setter", () => {
	try {
		objj_propGuard({get prop() { return true }}, 'prop', [false]);
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CRInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe("Assignment to readonly property");
	}
});

test("objj_propGuard() returns correct value on property chain", () => {
	expect(objj_propGuard(new CRString("hello"), 'jsString', 'length')).toBe(5);
});

test("objj_propGuard() executes property chain setter", () => {
	const MyObject = class extends CRObject { constructor() { super(); this.$prop = false } get prop() { return this.$prop } set prop(value) { this.$prop = value }	};
	const object = new MyObject();
	objj_propGuard(object, 'prop', [true]);
	expect(object.prop).toBeTruthy();
});

