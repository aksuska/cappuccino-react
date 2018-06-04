const OBJJ = require('../src/Objective-J'), objj_initialize = OBJJ.objj_initialize, objj_propGuard = OBJJ.objj_propGuard, objj_function = OBJJ.objj_function, objj_invocation = OBJJ.objj_invocation;
const CRObjectSym = require('../src/Foundation/CPObject'), CRObject = CRObjectSym.CRObject;
const CRStringSym = require('../src/Foundation/CPString'), CRString = CRStringSym.CRString;
const CRExceptionSym = require("../src/Foundation/CPException"), CRInvalidArgumentException = CRExceptionSym.CRInvalidArgumentException;
const CRMethodSignatureSym = require('../src/Foundation/CPMethodSignature'), CRMethodSignature = CRMethodSignatureSym.CRMethodSignature;
const ProtocolSym = require("../src/Foundation/Protocol"), Protocol = ProtocolSym.Protocol;
const CRArraySym = require("../src/Foundation/CPArray"), CRArray = CRArraySym.CRArray;

test("CRObject initialize called only once", () => {
	CRObject.initialize = jest.fn();
	objj_initialize(CRObject);
	const MyObject = class extends CRObject { static initialize() { this.newClassProperty = 1; }	};
	objj_initialize(MyObject);
	expect(CRObject.initialize).toHaveBeenCalledTimes(1);
});

function testReadOnlyProperty(target, propName, setValue) {
	try {
		objj_propGuard(target, propName, [setValue]);
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CRInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe("Assignment to readonly property");
	}
}

test("CRObject +initialized is read-only", () => {
	testReadOnlyProperty(CRObject, 'initialized', false);
});

test("CRObject construct() gets unique UID", () => {
	const object1 = new CRObject();
	expect(object1.$UID).toBeGreaterThan(0);
	const object2 = new CRObject();
	expect(object2.$UID).not.toBe(object1.$UID);
	const object3 = new CRObject();
	expect(object3.$UID).not.toBe(object1.$UID);
	expect(object3.$UID).not.toBe(object2.$UID);
});

test("CRObject +alloc returns new, uninitialized object", () => {
	const object = CRObject.alloc();
	expect(object).toBeInstanceOf(CRObject);
	expect(object.$exposedBindings).toBeNull();
	expect(object.$observationInfo).toBeNull();
});

test("CRObject -init returns initialized object", () => {
	const object = CRObject.alloc().init();
	expect(object).toBeInstanceOf(CRObject);
	expect(object.$exposedBindings).not.toBeNull();
	expect(object.$observationInfo).not.toBeNull();
});

test("CRObject +copy returns self", () => {
	expect(CRObject.copy()).toBe(CRObject);
});

test("CRObject -copy raises does-not-recognize exception", () => {
	const object = CRObject.alloc().init();
	try {
		object.copy();
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CRInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe(`-[CRObject copyWithZone:]: unrecognized selector sent to instance ${object.$uidString()}`);
	}
});

test("CRObject +copyWithZone: returns self", () => {
	expect(CRObject.copyWithZone_()).toBe(CRObject);
});

test("CRObject +mutableCopy returns self", () => {
	expect(CRObject.mutableCopy()).toBe(CRObject);
});

test("CRObject +mutableCopyWithZone: returns self", () => {
	expect(CRObject.mutableCopyWithZone_()).toBe(CRObject);
});

test("CRObject +new returns initialized object", () => {
	const object = CRObject.new();
	expect(object).toBeInstanceOf(CRObject);
	expect(object.$exposedBindings).not.toBeNull();
	expect(object.$observationInfo).not.toBeNull();
});

test("CRObject +class returns self", () => {
	expect(CRObject.class()).toBe(CRObject);
});

test("CRObject +superclass on CRObject returns null", () => {
	expect(CRObject.superclass).toBeNull();
});

test("CRObject +superclass returns super class", () => {
	const MyClass = class extends CRObject {};
	expect(MyClass.superclass).toBe(CRObject);
	const MyClass2 = class extends MyClass {};
	expect(MyClass2.superclass).toBe(MyClass);
});

test("CRObject +superclass is read-only", () => {
	testReadOnlyProperty(CRObject, 'superclass', CRObject);
});

test("CRObject -superclass on CRObject returns null", () => {
	expect(CRObject.new().superclass).toBeNull();
});

test("CRObject -superclass returns super class", () => {
	const MyClass = class extends CRObject {};
	expect(MyClass.new().superclass).toBe(CRObject);
	const MyClass2 = class extends MyClass {};
	expect(MyClass2.new().superclass).toBe(MyClass);
});

test("CRObject -superclass is read-only", () => {
	testReadOnlyProperty(CRObject.new(), 'superclass', CRObject)
});

test("CRObject +isSubclassOfClass: returns expected value", () => {
	const MyClass = class extends CRObject {};
	expect(MyClass.isSubclassOfClass_(CRObject)).toBeTruthy();
	const MyClass2 = class extends MyClass {};
	expect(MyClass2.isSubclassOfClass_(CRObject)).toBeTruthy();
	const MyClass3 = class extends CRObject {};
	expect(MyClass3.isSubclassOfClass_(MyClass2)).toBeFalsy();
});

test("CRObject +className returns expected class name as CRString", () => {
	const className = CRObject.className;
	expect(className).toBeInstanceOf(CRString);
	expect(className.jsString).toBe("CRObject");
	const MyClass = class extends CRObject {};
	expect(MyClass.className.jsString).toBe("MyClass");
});

test("CRObject +className is read-only", () => {
	testReadOnlyProperty(CRObject, 'className', "MyClass");
});

test("CRObject -className returns expected class name as CRString", () => {
	const object = CRObject.new();
	const className = object.className;
	expect(className).toBeInstanceOf(CRString);
	expect(className.jsString).toBe("CRObject");
	const MyClass = class extends CRObject {};
	const object2 = MyClass.new();
	expect(object2.className.jsString).toBe("MyClass");
});

test("CRObject -className is read-only", () => {
	testReadOnlyProperty(CRObject.new(), 'className', "MyClass");
});

test("CRObject +isEqual: returns expected value", () => {
	const MyClass = class extends CRObject {};
	expect(CRObject.isEqual_(CRObject)).toBeTruthy();
	expect(MyClass.isEqual_(CRObject)).toBeFalsy();
	expect(MyClass.isEqual_(MyClass)).toBeTruthy();
});

test("CRObject -isEqual: returns expected value", () => {
	const object = CRObject.new();
	const clone = object;
	expect(object.isEqual_(clone)).toBeTruthy();
	const object2 = CRObject.new();
	expect(object2.isEqual_(clone)).toBeFalsy();
});

test("CRObject +hash returns expected value", () => {
	expect(CRObject.hash).toBe(CRObject.$UID);
});

test("CRObject +hash is read-only", () => {
	testReadOnlyProperty(CRObject, 'hash', 0);
});

test("CRObject -hash returns expected value", () => {
	const object = CRObject.new();
	expect(object.hash).toBe(object.$UID);
});

test("CRObject -hash is read-only", () => {
	testReadOnlyProperty(CRObject.new(), 'hash', 0);
});

test("CRObject +self returns self", () => {
	expect(CRObject.self()).toBe(CRObject);
});

test("CRObject -self returns self", () => {
	const object = CRObject.new();
	expect(object.self()).toBe(object);
});

test("CRObject +isKindOfClass: returns expected value", () => {
	const MyClass = class extends CRObject {};
	const MyClass2 = class extends MyClass {};
	expect(CRObject.isKindOfClass_(CRObject)).toBeTruthy();
	expect(MyClass.isKindOfClass_(CRObject)).toBeTruthy();
	expect(MyClass2.isKindOfClass_(CRObject)).toBeTruthy();
	expect(MyClass.isKindOfClass_(MyClass2)).toBeFalsy();
});

test("CRObject -isKindOfClass: returns expected value", () => {
	const MyClass = class extends CRObject {};
	const MyClass2 = class extends MyClass {};
	expect(CRObject.new().isKindOfClass_(CRObject)).toBeTruthy();
	expect(MyClass.new().isKindOfClass_(CRObject)).toBeTruthy();
	expect(MyClass2.new().isKindOfClass_(CRObject)).toBeTruthy();
	expect(MyClass.new().isKindOfClass_(MyClass2)).toBeFalsy();
});

test("CRObject -isMemberOfClass: returns expected value", () => {
	const MyClass = class extends CRObject {};
	expect(CRObject.new().isMemberOfClass_(CRObject)).toBeTruthy();
	expect(MyClass.new().isMemberOfClass_(CRObject)).toBeFalsy();
	expect(MyClass.new().isMemberOfClass_(MyClass)).toBeTruthy();
});

test("CRObject +instancesRespondToSelector: returns expected value", () => {
	const MyClass = class extends CRObject { constructor() {super(); this.prop = true;} };
	expect(MyClass.instancesRespondToSelector_("hash")).toBeTruthy();
	expect(MyClass.instancesRespondToSelector_("prop")).toBeFalsy();
});

test("CRObject +respondsToSelector: returns expected value", () => {
	const MyClass = class extends CRObject {};
	MyClass.prop = true;
	expect(MyClass.respondsToSelector_("initialized")).toBeTruthy();
	expect(MyClass.respondsToSelector_("prop")).toBeFalsy();
});

test("CRObject -respondsToSelector: returns expected value", () => {
	const MyClass = class extends CRObject { constructor() {super(); this.prop = true;} };
	const object = MyClass.new();
	expect(object.respondsToSelector_("hash")).toBeTruthy();
	expect(object.respondsToSelector_("prop")).toBeFalsy();
});

test("CRObject +conformsToProtocol: returns expected value; also CRObject conforms to CRObject", () => {
	const CRObjectProtocol = new Protocol('CRObject');
	expect(CRObject.conformsToProtocol_(CRObjectProtocol)).toBeTruthy();
	const protocol = new Protocol('Bogus');
	expect(CRObject.conformsToProtocol_(protocol)).toBeFalsy();
});

test("CRObject -conformsToProtocol: returns expected value; also CRObject conforms to CRObject", () => {
	const CRObjectProtocol = new Protocol('CRObject');
	const object = CRObject.new();
	expect(object.conformsToProtocol_(CRObjectProtocol)).toBeTruthy();
	const protocol = new Protocol('Bogus');
	expect(object.conformsToProtocol_(protocol)).toBeFalsy();
});

test("CRObject +methodForSelector: returns expected value", () => {
	const MyClass = class extends CRObject { static myMethod_(value) { return value * 2; } };
	// unknown throws does not recognize exception
	const unknown = MyClass.methodForSelector_('isMemberOfClass:');
	try {
		unknown(MyClass, 'isMemberOfClass:', CRObject);
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CRInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe("+[MyClass isMemberOfClass:]: unrecognized selector sent to class");
	}
	const method = MyClass.methodForSelector_('myMethod:');
	expect(typeof method).toBe('function');
	expect(method(MyClass, 'myMethod:', 4)).toBe(8);
	const inherited = MyClass.methodForSelector_('conformsToProtocol:');
	expect(typeof inherited).toBe('function');
	expect(inherited(MyClass, 'conformsToProtocol:', new Protocol('CRObject'))).toBeTruthy();
});

test("CRObject -methodForSelector: returns expected value", () => {
	const MyClass = class extends CRObject { myMethod_(value) { return value * 2; } };
	const object = MyClass.new();
	// unknown throws does not recognize exception
	const unknown = object.methodForSelector_('initialized');
	try {
		unknown(object, 'initialized');
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CRInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe(`-[MyClass initialized]: unrecognized selector sent to instance ${object.$uidString()}`);
	}
	const method = object.methodForSelector_('myMethod:');
	expect(typeof method).toBe('function');
	expect(method(object, 'myMethod:', 4)).toBe(8);
	const inherited = object.methodForSelector_('conformsToProtocol:');
	expect(typeof inherited).toBe('function');
	expect(inherited(object, 'conformsToProtocol:', new Protocol('CRObject'))).toBeTruthy();
});

test("CRObject +instanceMethodForSelector: returns expected value", () => {
	const MyClass = class extends CRObject { myMethod_(value) { return value * 2; } };
	const object = MyClass.new();
	// unknown throws does not recognize exception
	const unknown = MyClass.instanceMethodForSelector_('initialized');
	try {
		unknown(object, 'initialized');
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CRInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe(`-[MyClass initialized]: unrecognized selector sent to instance ${object.$uidString()}`);
	}
	const method = MyClass.instanceMethodForSelector_('myMethod:');
	expect(typeof method).toBe('function');
	expect(method(object, 'myMethod:', 4)).toBe(8);
	const inherited = MyClass.instanceMethodForSelector_('conformsToProtocol:');
	expect(typeof inherited).toBe('function');
	expect(inherited(object, 'conformsToProtocol:', new Protocol('CRObject'))).toBeTruthy();
});

test("CRObject +instanceMethodSignatureForSelector: returns expected value", () => {
	const MyClass = class extends CRObject {};
	expect(MyClass.instanceMethodSignatureForSelector_('initialized')).toBeNull();
	expect(MyClass.instanceMethodSignatureForSelector_('hash')).toBeInstanceOf(CRMethodSignature);
});

test("CRObject +methodSignatureForSelector: returns expected value", () => {
	const MyClass = class extends CRObject {};
	expect(MyClass.methodSignatureForSelector_('isMemberOfClass:')).toBeNull();
	expect(MyClass.methodSignatureForSelector_('initialized')).toBeInstanceOf(CRMethodSignature);
});

test("CRObject -methodSignatureForSelector: returns expected value", () => {
	const MyClass = class extends CRObject {};
	const object = MyClass.new();
	expect(object.methodSignatureForSelector_('initialized')).toBeNull();
	expect(object.methodSignatureForSelector_('hash')).toBeInstanceOf(CRMethodSignature);
});

test("CRObject +description returns class name as CRString", () => {
	const MyClass = class extends CRObject {};
	expect(MyClass.description).toBeInstanceOf(CRString);
	expect(MyClass.description.jsString).toBe("MyClass");
});

test("CRObject +description is read-only", () => {
	testReadOnlyProperty(CRObject, 'description', 'Bogus');
});

test("CRObject -description returns expected value as CRString", () => {
	const MyClass = class extends CRObject {};
	const object = MyClass.new();
	expect(object.description).toBeInstanceOf(CRString);
	expect(object.description.jsString).toBe(`<MyClass: ${object.$uidString()}>`);
});

test("CRObject -description is read-only", () => {
	testReadOnlyProperty(CRObject.new(), 'description', 'Bogus');
});

test("CRObject +debugDescription returns class name as CRString", () => {
	const MyClass = class extends CRObject {};
	expect(MyClass.description).toBeInstanceOf(CRString);
	expect(MyClass.description.jsString).toBe("MyClass");
});

test("CRObject +debugDescription is read-only", () => {
	testReadOnlyProperty(CRObject, 'debugDescription', 'Bogus');
});

test("CRObject -debugDescription returns class name as CRString", () => {
	const MyClass = class extends CRObject {};
	const object = MyClass.new();
	expect(object.debugDescription).toBeInstanceOf(CRString);
	expect(object.debugDescription.jsString).toBe(`<MyClass: ${object.$uidString()}>`);
});

test("CRObject -debugDescription is read-only", () => {
	testReadOnlyProperty(CRObject.new(), 'debugDescription', 'Bogus');
});

function testClassPerformSelector(result, performSelector, ...args) {
	test(`CRObject +${performSelector} throws on null selector`, () => {
		try {
			CRObject[objj_function(performSelector)](null, ...args);
			// this actually means the above failed to throw
			expect(true).toBe(false);
		}
		catch (e) {
			expect(e.name.jsString).toBe(CRInvalidArgumentException.jsString);
			expect(e.reason.jsString).toBe(`+[CRObject null]: unrecognized selector sent to class`);
		}
	});

	test(`CRObject +${performSelector} throws on unknown selector`, () => {
		try {
			CRObject[objj_function(performSelector)]('bogus:', ...args);
			// this actually means the above failed to throw
			expect(true).toBe(false);
		}
		catch (e) {
			expect(e.name.jsString).toBe(CRInvalidArgumentException.jsString);
			expect(e.reason.jsString).toBe(`+[CRObject bogus:]: unrecognized selector sent to class`);
		}
	});

	test(`CRObject +${performSelector} executes expected method`, () => {
		const MyClass = class extends CRObject { static testMethod(arg1, arg2, arg3, arg4) {let val = {args: 0, nulls: 0}; for(let i=0;i<arguments.length;i++) {if(arguments[i] !== null) val.args++; else val.nulls++} return val} };
		expect(MyClass[objj_function(performSelector)]('testMethod', ...args)).toEqual(result);
	});

}

function testPerformSelector(result, performSelector, ...args) {
	test(`CRObject -${performSelector} throws on null selector`, () => {
		const object = CRObject.new();
		try {
			object[objj_function(performSelector)](null, ...args);
			// this actually means the above failed to throw
			expect(true).toBe(false);
		}
		catch (e) {
			expect(e.name.jsString).toBe(CRInvalidArgumentException.jsString);
			expect(e.reason.jsString).toBe(`-[CRObject null]: unrecognized selector sent to instance ${object.$uidString()}`);
		}
	});

	test(`CRObject -${performSelector} throws on unknown selector`, () => {
		const object = CRObject.new();
		try {
			object[objj_function(performSelector)]('bogus:', ...args);
			// this actually means the above failed to throw
			expect(true).toBe(false);
		}
		catch (e) {
			expect(e.name.jsString).toBe(CRInvalidArgumentException.jsString);
			expect(e.reason.jsString).toBe(`-[CRObject bogus:]: unrecognized selector sent to instance ${object.$uidString()}`);
		}
	});

	test(`CRObject +${performSelector} executes expected method`, () => {
		const MyClass = class extends CRObject { testMethod(arg1, arg2, arg3, arg4) {let val = {args: 0, nulls: 0}; for(let i=0;i<arguments.length;i++) {if(arguments[i] !== null) val.args++; else val.nulls++} return val} };
		expect(MyClass.new()[objj_function(performSelector)]('testMethod', ...args)).toEqual(result);
	});
}

testClassPerformSelector({args: 2, nulls: 2}, 'performSelector:withObject:withObject:', 'arg1', 'arg2');
testPerformSelector({args: 2, nulls: 2}, 'performSelector:withObject:withObject:', 'arg1', 'arg2');

testClassPerformSelector({args: 1, nulls: 3}, 'performSelector:withObject:', 'arg1');
testPerformSelector({args: 1, nulls: 3}, 'performSelector:withObject:', 'arg1');

testClassPerformSelector({args: 0, nulls: 4}, 'performSelector:');
testPerformSelector({args: 0, nulls: 4}, 'performSelector:');

test("CRObject +forwardingTargetForSelector: returns null", () => {
	expect(CRObject.forwardingTargetForSelector_('any')).toBeNull();
});

test("CRObject -forwardingTargetForSelector: returns null", () => {
	expect(CRObject.new().forwardingTargetForSelector_('any')).toBeNull();
});

test("CRObject +forwardInvocation: always throws does not recognize", () => {
	try {
		CRObject.forwardInvocation_(objj_invocation(CRObject, 'initialized'));
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CRInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe("+[CRObject initialized]: unrecognized selector sent to class");
	}
});

test("CRObject -forwardInvocation: always throws does not recognize", () => {
	const object = CRObject.new();
	try {
		object.forwardInvocation_(objj_invocation(CRObject, 'description'));
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CRInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe(`-[CRObject description]: unrecognized selector sent to instance ${object.$uidString()}`);
	}
});

test("CRObject +resolveClassMethod: always returns false", () => {
	expect(CRObject.resolveClassMethod_('initialized')).toBeFalsy();
});

test("CRObject +resolveInstanceMethod: always returns false", () => {
	expect(CRObject.resolveInstanceMethod_('forwardInvocation:')).toBeFalsy();
});

test("CRObject +doesNotRecognizeSelector: always throws does not recognize", () => {
	try {
		CRObject.doesNotRecognizeSelector_('initialized');
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CRInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe("+[CRObject initialized]: unrecognized selector sent to class");
	}
});

test("CRObject -doesNotRecognizeSelector: always throws does not recognize", () => {
	const object = CRObject.new();
	try {
		object.doesNotRecognizeSelector_('description');
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CRInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe(`-[CRObject description]: unrecognized selector sent to instance ${object.$uidString()}`);
	}
});

test("CRObject -exposedBindings returns empty array", () => {
	const object = CRObject.new();
	const exposedBindings = object.exposedBindings;
	expect(exposedBindings).toBeInstanceOf(CRArray);
	expect(exposedBindings.count).toBe(0);
});

test("CRObject -exposedBindings is read-only", () => {
	testReadOnlyProperty(CRObject.new(), 'exposedBindings', new CRArray([]));
});

test("CRObject -observationInfo returns empty object", () => {
	const object = CRObject.new();
	expect(object.observationInfo).toEqual({});
});

test("CRObject -setObservationInfo sets value", () => {
	const observationInfo = {'key': [{'object': null, 'options': 0, "context": "testContext"}]};
	const object = CRObject.new();
	object.observationInfo = observationInfo;
	expect(object.observationInfo).toEqual(observationInfo);
});

test("CRObject +accessInstanceVariablesDirectly returns true", () => {
	expect(CRObject.accessInstanceVariablesDirectly).toBeTruthy();
});


test("CRObject -setNilValueForKey: always throws", () => {
	const object = CRObject.new();
	try {
		object.setNilValueForKey_('observationInfo');
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CRInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe(`-[<CRObject ${object.$uidString()}> setNilValueForKey:]: could not set nil as the value for the key observationInfo`);
	}
});

test("CRObject -isProxy returns false", () => {
	const object = CRObject.new();
	expect(object.isProxy()).toBeFalsy();
});

