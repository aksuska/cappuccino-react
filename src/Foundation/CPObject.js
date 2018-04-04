/**
 * Base class from which all Objective-J objects should derive
 **/

import objj_msgSend, {
	objj_propGuard,
	objj_function,
	objj_string,
	objj_methodSignature,
	objj_throw_arg,
	objj_getMethod, objj_oid
} from '../Objective-J';
const sprintf = require('sprintf-js').sprintf;

export default class CPObject {

	static $$initialized = false;
	static $$conformsTo = [];

	$$UID = null;
	$$exposedBindings = null;
	$$observationInfo = null;

	constructor() {
		this.$$UID = objj_oid();
	}

	// private method to return UID as hex value
	$$uidString() {
		return sprintf("x%06x", this.$$UID);
	}

	/*
				ACCESSORS
	 */

	// we need to use the conditional getter or all subclasses will inherit the value
	static get initialized() {
		return this.hasOwnProperty("$$initialized") ? this.$$initialized : false;
	}
	static set initialized(anything) {objj_throw_arg("Assignment to readonly property");}

	static get description() {return objj_string(this.name);}
	static set description(anything) {objj_throw_arg("Assignment to readonly property");}

	static get debugDescription() {return this.description();}
	static set debugDescription(anything) {objj_throw_arg("Assignment to readonly property");}

	static get superclass() {return (this === CPObject) ? null : Object.getPrototypeOf(this);}
	static set superclass(anything) {objj_throw_arg("Assignment to readonly property");}

	get superclass() {return (this.constructor === CPObject) ? null : Object.getPrototypeOf(this.constructor);}
	set superclass(anything) {objj_throw_arg("Assignment to readonly property");}

	get hash() {return this.$$UID;}
	set hash(anything) {objj_throw_arg("Assignment to readonly property");}

	get exposedBindings() {return this.$$exposedBindings;}
	set exposedBindings(anything) {objj_throw_arg("Assignment to readonly property");}

	get observationInfo() {return this.$$observationInfo;}
	set observationInfo(anything) {objj_throw_arg("Assignment to readonly property");}

	get className() {return objj_string(this.constructor.name);}
	set className(anything) {objj_throw_arg("Assignment to readonly property");}

	get description() {return objj_string(`<${this.constructor.name}: ${this.$$uidString()}>`);}
	set description(anything) {objj_throw_arg("Assignment to readonly property");}

	get debugDescription() {return this.description();}
	set debugDescription(anything) {objj_throw_arg("Assignment to readonly property");}

	/*
				CLASS METHODS
	 */

	static initialize() {
		// default nothing
	}

	static load() {
		// default nothing
	}

	static alloc() {
		return new this();
	}

	static new() {
		return this.alloc().init();
	}

	static copyWithZone_(zone = null) {
		// all class objects are unique
		return this;
	}

	static mutableCopyWithZone_(zone = null) {
		// all class objects are unique
		return this;
	}

	static class() {
		return this;
	}

	static isSubclassOfClass_(aClass) {
		return typeof aClass === 'object' ? Object.create(this.prototype) instanceof aClass : false;
	}

	static conformsToProtocol_(protocol) {
		return this.$$conformsTo.includes(protocol.name);
	}

	static respondsToSelector_(aSelector) {
		return (objj_getMethod(this, aSelector) !== undefined);
	}

	static instancesRespondToSelector_(aSelector) {
		// we can't call respondsToSelector as it may be overridden for forwarding, as this method must test only the implemented methods of the class
		const instance = this.new();
		return (instance) ? (Reflect.has(instance, objj_function(aSelector)) || this.resolveInstanceMethod_(aSelector)) : false;
	}

	static instanceMethodForSelector_(aSelector) {
		if (this.instancesRespondToSelector_(aSelector)) {
			return (...args) => objj_msgSend(this, aSelector, ...args);
		}
		else {
			return (...args) => objj_msgSend(this, 'doesNotRecognizeSelector:', aSelector);
		}
	}

	static resolveClassMethod_(sel) {
		return false;
	}

	/* Caveat: adding instance properties or defining accessor methods for existing properties must be accomplished using Object.defineProperty() with defined getter/setters */
	static resolveInstanceMethod_(sel) {
		return false;
	}

	static forwardingTargetForSelector_(aSelector) {
		return null;
	}

	static methodSignatureForSelector_(aSelector) {
		if (this.respondsToSelector_(aSelector)) {
			return objj_methodSignature(this, aSelector);
		}
		return null;
	}

	static forwardInvocation_(invocation) {
		this.doesNotRecognizeSelector_(objj_propGuard(invocation, 'selector'));
	}
	
	static doesNotRecognizeSelector_(aSelector) {
		objj_throw_arg("+[%s %s]: unrecognized selector sent to class", this.name, aSelector);
	}

	/*
				INSTANCE METHODS
	 */


	init() {
		this.$$exposedBindings = [];
		this.$$observationInfo = {};

		return this;
	}

	class() {
		return this.constructor;
	}

	isEqual_(object) {
		return this.hash === object.hash;
	}

	self() {
		return this;
	}

	isKindOfClass_(aClass) {
		return this instanceof aClass;
	}

	isMemberOfClass_(aClass) {
		return this.constructor === aClass;
	}

	conformsToProtocol_(protocol) {
		return this.constructor.$$conformsTo.includes(protocol.name);
	}

	respondsToSelector_(aSelector) {
		return (objj_getMethod(this, aSelector) !== undefined);
	}

	performSelector_(aSelector) {
		return objj_msgSend(this, aSelector);
	}

	performSelector_withObject_(aSelector, object) {
		return objj_msgSend(this, aSelector, object);
	}

	performSelector_withObject_withObject_(aSelector, object1, object2) {
		return objj_msgSend(this, aSelector, object1, object2);
	}

	isProxy() {
		return false;
	}

	forwardingTargetForSelector_(aSelector) {
		return null;
	}

	methodSignatureForSelector_(aSelector) {
		if (this.respondsToSelector_(aSelector)) {
			return objj_methodSignature(this, aSelector);
		}
		return null;
	}

	forwardInvocation_(invocation) {
		this.doesNotRecognizeSelector_(invocation.selector);
	}

	doesNotRecognizeSelector_(aSelector) {
		objj_throw_arg("-[%@ %s]: unrecognized selector sent to instance %s", this.className, aSelector, this.$$uidString());
	}

	copy() {
		return objj_msgSend(this, 'copyWithZone:', null);
	}
}

CPObject.$$conformsTo.push('CPObject');
