import {CPInvalidArgumentException, CPObject, CPString, CPMethodSignature, Protocol} from '../src/Foundation/Foundation';
import {objj_function, objj_initialize, objj_invocation, objj_propGuard} from "../src/Objective-J";
import CPArray from "../src/Foundation/CPArray";

test("CPObject initialize called only once", () => {
	CPObject.initialize = jest.fn();
	objj_initialize(CPObject);
	const MyObject = class extends CPObject { static initialize() { this.newClassProperty = 1; }	};
	objj_initialize(MyObject);
	expect(CPObject.initialize).toHaveBeenCalledTimes(1);
});

function testReadOnlyProperty(target, propName, setValue) {
	try {
		objj_propGuard(target, propName, [setValue]);
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CPInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe("Assignment to readonly property");
	}
}

test("CPObject +initialized is read-only", () => {
	testReadOnlyProperty(CPObject, 'initialized', false);
});

test("CPObject construct() gets unique UID", () => {
	const object1 = new CPObject();
	expect(object1.$UID).toBeGreaterThan(0);
	const object2 = new CPObject();
	expect(object2.$UID).not.toBe(object1.$UID);
	const object3 = new CPObject();
	expect(object3.$UID).not.toBe(object1.$UID);
	expect(object3.$UID).not.toBe(object2.$UID);
});

test("CPObject +alloc returns new, uninitialized object", () => {
	const object = CPObject.alloc();
	expect(object).toBeInstanceOf(CPObject);
	expect(object.$exposedBindings).toBeNull();
	expect(object.$observationInfo).toBeNull();
});

test("CPObject -init returns initialized object", () => {
	const object = CPObject.alloc().init();
	expect(object).toBeInstanceOf(CPObject);
	expect(object.$exposedBindings).not.toBeNull();
	expect(object.$observationInfo).not.toBeNull();
});

test("CPObject +copy returns self", () => {
	expect(CPObject.copy()).toBe(CPObject);
});

test("CPObject -copy raises does-not-recognize exception", () => {
	const object = CPObject.alloc().init();
	try {
		object.copy();
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CPInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe(`-[CPObject copyWithZone:]: unrecognized selector sent to instance ${object.$uidString()}`);
	}
});

test("CPObject +copyWithZone: returns self", () => {
	expect(CPObject.copyWithZone_()).toBe(CPObject);
});

test("CPObject +mutableCopy returns self", () => {
	expect(CPObject.mutableCopy()).toBe(CPObject);
});

test("CPObject +mutableCopyWithZone: returns self", () => {
	expect(CPObject.mutableCopyWithZone_()).toBe(CPObject);
});

test("CPObject +new returns initialized object", () => {
	const object = CPObject.new();
	expect(object).toBeInstanceOf(CPObject);
	expect(object.$exposedBindings).not.toBeNull();
	expect(object.$observationInfo).not.toBeNull();
});

test("CPObject +class returns self", () => {
	expect(CPObject.class()).toBe(CPObject);
});

test("CPObject +superclass on CPObject returns null", () => {
	expect(CPObject.superclass).toBeNull();
});

test("CPObject +superclass returns super class", () => {
	const MyClass = class extends CPObject {};
	expect(MyClass.superclass).toBe(CPObject);
	const MyClass2 = class extends MyClass {};
	expect(MyClass2.superclass).toBe(MyClass);
});

test("CPObject +superclass is read-only", () => {
	testReadOnlyProperty(CPObject, 'superclass', CPObject);
});

test("CPObject -superclass on CPObject returns null", () => {
	expect(CPObject.new().superclass).toBeNull();
});

test("CPObject -superclass returns super class", () => {
	const MyClass = class extends CPObject {};
	expect(MyClass.new().superclass).toBe(CPObject);
	const MyClass2 = class extends MyClass {};
	expect(MyClass2.new().superclass).toBe(MyClass);
});

test("CPObject -superclass is read-only", () => {
	testReadOnlyProperty(CPObject.new(), 'superclass', CPObject)
});

test("CPObject +isSubclassOfClass: returns expected value", () => {
	const MyClass = class extends CPObject {};
	expect(MyClass.isSubclassOfClass_(CPObject)).toBeTruthy();
	const MyClass2 = class extends MyClass {};
	expect(MyClass2.isSubclassOfClass_(CPObject)).toBeTruthy();
	const MyClass3 = class extends CPObject {};
	expect(MyClass3.isSubclassOfClass_(MyClass2)).toBeFalsy();
});

test("CPObject +className returns expected class name as CPString", () => {
	const className = CPObject.className;
	expect(className).toBeInstanceOf(CPString);
	expect(className.jsString).toBe("CPObject");
	const MyClass = class extends CPObject {};
	expect(MyClass.className.jsString).toBe("MyClass");
});

test("CPObject +className is read-only", () => {
	testReadOnlyProperty(CPObject, 'className', "MyClass");
});

test("CPObject -className returns expected class name as CPString", () => {
	const object = CPObject.new();
	const className = object.className;
	expect(className).toBeInstanceOf(CPString);
	expect(className.jsString).toBe("CPObject");
	const MyClass = class extends CPObject {};
	const object2 = MyClass.new();
	expect(object2.className.jsString).toBe("MyClass");
});

test("CPObject -className is read-only", () => {
	testReadOnlyProperty(CPObject.new(), 'className', "MyClass");
});

test("CPObject +isEqual: returns expected value", () => {
	const MyClass = class extends CPObject {};
	expect(CPObject.isEqual_(CPObject)).toBeTruthy();
	expect(MyClass.isEqual_(CPObject)).toBeFalsy();
	expect(MyClass.isEqual_(MyClass)).toBeTruthy();
});

test("CPObject -isEqual: returns expected value", () => {
	const object = CPObject.new();
	const clone = object;
	expect(object.isEqual_(clone)).toBeTruthy();
	const object2 = CPObject.new();
	expect(object2.isEqual_(clone)).toBeFalsy();
});

test("CPObject +hash returns expected value", () => {
	expect(CPObject.hash).toBe(CPObject.$UID);
});

test("CPObject +hash is read-only", () => {
	testReadOnlyProperty(CPObject, 'hash', 0);
});

test("CPObject -hash returns expected value", () => {
	const object = CPObject.new();
	expect(object.hash).toBe(object.$UID);
});

test("CPObject -hash is read-only", () => {
	testReadOnlyProperty(CPObject.new(), 'hash', 0);
});

test("CPObject +self returns self", () => {
	expect(CPObject.self()).toBe(CPObject);
});

test("CPObject -self returns self", () => {
	const object = CPObject.new();
	expect(object.self()).toBe(object);
});

test("CPObject +isKindOfClass: returns expected value", () => {
	const MyClass = class extends CPObject {};
	const MyClass2 = class extends MyClass {};
	expect(CPObject.isKindOfClass_(CPObject)).toBeTruthy();
	expect(MyClass.isKindOfClass_(CPObject)).toBeTruthy();
	expect(MyClass2.isKindOfClass_(CPObject)).toBeTruthy();
	expect(MyClass.isKindOfClass_(MyClass2)).toBeFalsy();
});

test("CPObject -isKindOfClass: returns expected value", () => {
	const MyClass = class extends CPObject {};
	const MyClass2 = class extends MyClass {};
	expect(CPObject.new().isKindOfClass_(CPObject)).toBeTruthy();
	expect(MyClass.new().isKindOfClass_(CPObject)).toBeTruthy();
	expect(MyClass2.new().isKindOfClass_(CPObject)).toBeTruthy();
	expect(MyClass.new().isKindOfClass_(MyClass2)).toBeFalsy();
});

test("CPObject -isMemberOfClass: returns expected value", () => {
	const MyClass = class extends CPObject {};
	expect(CPObject.new().isMemberOfClass_(CPObject)).toBeTruthy();
	expect(MyClass.new().isMemberOfClass_(CPObject)).toBeFalsy();
	expect(MyClass.new().isMemberOfClass_(MyClass)).toBeTruthy();
});

test("CPObject +instancesRespondToSelector: returns expected value", () => {
	const MyClass = class extends CPObject { constructor() {super(); this.prop = true;} };
	expect(MyClass.instancesRespondToSelector_("hash")).toBeTruthy();
	expect(MyClass.instancesRespondToSelector_("prop")).toBeFalsy();
});

test("CPObject +respondsToSelector: returns expected value", () => {
	const MyClass = class extends CPObject {};
	MyClass.prop = true;
	expect(MyClass.respondsToSelector_("initialized")).toBeTruthy();
	expect(MyClass.respondsToSelector_("prop")).toBeFalsy();
});

test("CPObject -respondsToSelector: returns expected value", () => {
	const MyClass = class extends CPObject { constructor() {super(); this.prop = true;} };
	const object = MyClass.new();
	expect(object.respondsToSelector_("hash")).toBeTruthy();
	expect(object.respondsToSelector_("prop")).toBeFalsy();
});

test("CPObject +conformsToProtocol: returns expected value; also CPObject conforms to CPObject", () => {
	const CPObjectProtocol = new Protocol('CPObject');
	expect(CPObject.conformsToProtocol_(CPObjectProtocol)).toBeTruthy();
	const protocol = new Protocol('Bogus');
	expect(CPObject.conformsToProtocol_(protocol)).toBeFalsy();
});

test("CPObject -conformsToProtocol: returns expected value; also CPObject conforms to CPObject", () => {
	const CPObjectProtocol = new Protocol('CPObject');
	const object = CPObject.new();
	expect(object.conformsToProtocol_(CPObjectProtocol)).toBeTruthy();
	const protocol = new Protocol('Bogus');
	expect(object.conformsToProtocol_(protocol)).toBeFalsy();
});

test("CPObject +methodForSelector: returns expected value", () => {
	const MyClass = class extends CPObject { static myMethod_(value) { return value * 2; } };
	// unknown throws does not recognize exception
	const unknown = MyClass.methodForSelector_('isMemberOfClass:');
	try {
		unknown(MyClass, 'isMemberOfClass:', CPObject);
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CPInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe("+[MyClass isMemberOfClass:]: unrecognized selector sent to class");
	}
	const method = MyClass.methodForSelector_('myMethod:');
	expect(typeof method).toBe('function');
	expect(method(MyClass, 'myMethod:', 4)).toBe(8);
	const inherited = MyClass.methodForSelector_('conformsToProtocol:');
	expect(typeof inherited).toBe('function');
	expect(inherited(MyClass, 'conformsToProtocol:', new Protocol('CPObject'))).toBeTruthy();
});

test("CPObject -methodForSelector: returns expected value", () => {
	const MyClass = class extends CPObject { myMethod_(value) { return value * 2; } };
	const object = MyClass.new();
	// unknown throws does not recognize exception
	const unknown = object.methodForSelector_('initialized');
	try {
		unknown(object, 'initialized');
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CPInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe(`-[MyClass initialized]: unrecognized selector sent to instance ${object.$uidString()}`);
	}
	const method = object.methodForSelector_('myMethod:');
	expect(typeof method).toBe('function');
	expect(method(object, 'myMethod:', 4)).toBe(8);
	const inherited = object.methodForSelector_('conformsToProtocol:');
	expect(typeof inherited).toBe('function');
	expect(inherited(object, 'conformsToProtocol:', new Protocol('CPObject'))).toBeTruthy();
});

test("CPObject +instanceMethodForSelector: returns expected value", () => {
	const MyClass = class extends CPObject { myMethod_(value) { return value * 2; } };
	const object = MyClass.new();
	// unknown throws does not recognize exception
	const unknown = MyClass.instanceMethodForSelector_('initialized');
	try {
		unknown(object, 'initialized');
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CPInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe(`-[MyClass initialized]: unrecognized selector sent to instance ${object.$uidString()}`);
	}
	const method = MyClass.instanceMethodForSelector_('myMethod:');
	expect(typeof method).toBe('function');
	expect(method(object, 'myMethod:', 4)).toBe(8);
	const inherited = MyClass.instanceMethodForSelector_('conformsToProtocol:');
	expect(typeof inherited).toBe('function');
	expect(inherited(object, 'conformsToProtocol:', new Protocol('CPObject'))).toBeTruthy();
});

test("CPObject +instanceMethodSignatureForSelector: returns expected value", () => {
	const MyClass = class extends CPObject {};
	expect(MyClass.instanceMethodSignatureForSelector_('initialized')).toBeNull();
	expect(MyClass.instanceMethodSignatureForSelector_('hash')).toBeInstanceOf(CPMethodSignature);
});

test("CPObject +methodSignatureForSelector: returns expected value", () => {
	const MyClass = class extends CPObject {};
	expect(MyClass.methodSignatureForSelector_('isMemberOfClass:')).toBeNull();
	expect(MyClass.methodSignatureForSelector_('initialized')).toBeInstanceOf(CPMethodSignature);
});

test("CPObject -methodSignatureForSelector: returns expected value", () => {
	const MyClass = class extends CPObject {};
	const object = MyClass.new();
	expect(object.methodSignatureForSelector_('initialized')).toBeNull();
	expect(object.methodSignatureForSelector_('hash')).toBeInstanceOf(CPMethodSignature);
});

test("CPObject +description returns class name as CPString", () => {
	const MyClass = class extends CPObject {};
	expect(MyClass.description).toBeInstanceOf(CPString);
	expect(MyClass.description.jsString).toBe("MyClass");
});

test("CPObject +description is read-only", () => {
	testReadOnlyProperty(CPObject, 'description', 'Bogus');
});

test("CPObject -description returns expected value as CPString", () => {
	const MyClass = class extends CPObject {};
	const object = MyClass.new();
	expect(object.description).toBeInstanceOf(CPString);
	expect(object.description.jsString).toBe(`<MyClass: ${object.$uidString()}>`);
});

test("CPObject -description is read-only", () => {
	testReadOnlyProperty(CPObject.new(), 'description', 'Bogus');
});

test("CPObject +debugDescription returns class name as CPString", () => {
	const MyClass = class extends CPObject {};
	expect(MyClass.description).toBeInstanceOf(CPString);
	expect(MyClass.description.jsString).toBe("MyClass");
});

test("CPObject +debugDescription is read-only", () => {
	testReadOnlyProperty(CPObject, 'debugDescription', 'Bogus');
});

test("CPObject -debugDescription returns class name as CPString", () => {
	const MyClass = class extends CPObject {};
	const object = MyClass.new();
	expect(object.debugDescription).toBeInstanceOf(CPString);
	expect(object.debugDescription.jsString).toBe(`<MyClass: ${object.$uidString()}>`);
});

test("CPObject -debugDescription is read-only", () => {
	testReadOnlyProperty(CPObject.new(), 'debugDescription', 'Bogus');
});

function testClassPerformSelector(result, performSelector, ...args) {
	test(`CPObject +${performSelector} throws on null selector`, () => {
		try {
			CPObject[objj_function(performSelector)](null, ...args);
			// this actually means the above failed to throw
			expect(true).toBe(false);
		}
		catch (e) {
			expect(e.name.jsString).toBe(CPInvalidArgumentException.jsString);
			expect(e.reason.jsString).toBe(`+[CPObject null]: unrecognized selector sent to class`);
		}
	});

	test(`CPObject +${performSelector} throws on unknown selector`, () => {
		try {
			CPObject[objj_function(performSelector)]('bogus:', ...args);
			// this actually means the above failed to throw
			expect(true).toBe(false);
		}
		catch (e) {
			expect(e.name.jsString).toBe(CPInvalidArgumentException.jsString);
			expect(e.reason.jsString).toBe(`+[CPObject bogus:]: unrecognized selector sent to class`);
		}
	});

	test(`CPObject +${performSelector} executes expected method`, () => {
		const MyClass = class extends CPObject { static testMethod(arg1, arg2, arg3, arg4) {let val = {args: 0, nulls: 0}; for(let i=0;i<arguments.length;i++) {if(arguments[i] !== null) val.args++; else val.nulls++} return val} };
		expect(MyClass[objj_function(performSelector)]('testMethod', ...args)).toEqual(result);
	});

}

function testPerformSelector(result, performSelector, ...args) {
	test(`CPObject -${performSelector} throws on null selector`, () => {
		const object = CPObject.new();
		try {
			object[objj_function(performSelector)](null, ...args);
			// this actually means the above failed to throw
			expect(true).toBe(false);
		}
		catch (e) {
			expect(e.name.jsString).toBe(CPInvalidArgumentException.jsString);
			expect(e.reason.jsString).toBe(`-[CPObject null]: unrecognized selector sent to instance ${object.$uidString()}`);
		}
	});

	test(`CPObject -${performSelector} throws on unknown selector`, () => {
		const object = CPObject.new();
		try {
			object[objj_function(performSelector)]('bogus:', ...args);
			// this actually means the above failed to throw
			expect(true).toBe(false);
		}
		catch (e) {
			expect(e.name.jsString).toBe(CPInvalidArgumentException.jsString);
			expect(e.reason.jsString).toBe(`-[CPObject bogus:]: unrecognized selector sent to instance ${object.$uidString()}`);
		}
	});

	test(`CPObject +${performSelector} executes expected method`, () => {
		const MyClass = class extends CPObject { testMethod(arg1, arg2, arg3, arg4) {let val = {args: 0, nulls: 0}; for(let i=0;i<arguments.length;i++) {if(arguments[i] !== null) val.args++; else val.nulls++} return val} };
		expect(MyClass.new()[objj_function(performSelector)]('testMethod', ...args)).toEqual(result);
	});
}

testClassPerformSelector({args: 2, nulls: 2}, 'performSelector:withObject:withObject:', 'arg1', 'arg2');
testPerformSelector({args: 2, nulls: 2}, 'performSelector:withObject:withObject:', 'arg1', 'arg2');

testClassPerformSelector({args: 1, nulls: 3}, 'performSelector:withObject:', 'arg1');
testPerformSelector({args: 1, nulls: 3}, 'performSelector:withObject:', 'arg1');

testClassPerformSelector({args: 0, nulls: 4}, 'performSelector:');
testPerformSelector({args: 0, nulls: 4}, 'performSelector:');

test("CPObject +forwardingTargetForSelector: returns null", () => {
	expect(CPObject.forwardingTargetForSelector_('any')).toBeNull();
});

test("CPObject -forwardingTargetForSelector: returns null", () => {
	expect(CPObject.new().forwardingTargetForSelector_('any')).toBeNull();
});

test("CPObject +forwardInvocation: always throws does not recognize", () => {
	try {
		CPObject.forwardInvocation_(objj_invocation(CPObject, 'initialized'));
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CPInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe("+[CPObject initialized]: unrecognized selector sent to class");
	}
});

test("CPObject -forwardInvocation: always throws does not recognize", () => {
	const object = CPObject.new();
	try {
		object.forwardInvocation_(objj_invocation(CPObject, 'description'));
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CPInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe(`-[CPObject description]: unrecognized selector sent to instance ${object.$uidString()}`);
	}
});

test("CPObject +resolveClassMethod: always returns false", () => {
	expect(CPObject.resolveClassMethod_('initialized')).toBeFalsy();
});

test("CPObject +resolveInstanceMethod: always returns false", () => {
	expect(CPObject.resolveInstanceMethod_('forwardInvocation:')).toBeFalsy();
});

test("CPObject +doesNotRecognizeSelector: always throws does not recognize", () => {
	try {
		CPObject.doesNotRecognizeSelector_('initialized');
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CPInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe("+[CPObject initialized]: unrecognized selector sent to class");
	}
});

test("CPObject -doesNotRecognizeSelector: always throws does not recognize", () => {
	const object = CPObject.new();
	try {
		object.doesNotRecognizeSelector_('description');
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CPInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe(`-[CPObject description]: unrecognized selector sent to instance ${object.$uidString()}`);
	}
});

test("CPObject -exposedBindings returns empty array", () => {
	const object = CPObject.new();
	const exposedBindings = object.exposedBindings;
	expect(exposedBindings).toBeInstanceOf(CPArray);
	expect(exposedBindings.count).toBe(0);
});

test("CPObject -exposedBindings is read-only", () => {
	testReadOnlyProperty(CPObject.new(), 'exposedBindings', false);
});

test("CPObject -observationInfo returns empty object", () => {
	const object = CPObject.new();
	expect(object.observationInfo).toEqual({});
});

test("CPObject -setObservationInfo sets value", () => {
	const observationInfo = {'key': [{'object': null, 'options': 0, "context": "testContext"}]};
	const object = CPObject.new();
	object.observationInfo = observationInfo;
	expect(object.observationInfo).toEqual(observationInfo);
});

test("CPObject -isProxy returns false", () => {
	const object = CPObject.new();
	expect(object.isProxy()).toBeFalsy();
});

