/*
	* Module that contains NSObject class emulation and related symbols. All framework classes derive from this base class, except for CPProxy.
 */

import objj_msgSend, {
	objj_propGuard,
	objj_function,
	objj_string,
	objj_methodSignature,
	objj_throw_arg,
	objj_getMethod, objj_oid
} from '../Objective-J';
const sprintf = require('sprintf-js').sprintf;

//! NSObject Cocoa Foundation class emulation. Most methods in the Cocoa documentation appear to be applied by categories to add functionality
//!  needed only by certain subclasses. We will omit all of that as much as we we can to keep our objects lighter. Only methods/properties that
//!  reasonably apply to all objects should be defined here.
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

	// we need to use the conditional getter or all subclasses will inherit the value
	static get initialized() {
		return this.hasOwnProperty("$$initialized") ? this.$$initialized : false;
	}
	static set initialized(anything) {objj_throw_arg("Assignment to readonly property");}

	//! @name Initializing a Class
	//! @{
	//! @typed void : void
	static initialize() {
		// default nothing
	}

	//! @typed void : void
	static load() {
		// default nothing
	}
	//! @}

	//! @name Creating, Copying, and Deallocating Objects
	//! @{
	//! We don't implement +allocWithZone: since +alloc is sufficient and there is no use case for overriding either of them.
	//! @typed instancetype : void
	static alloc() {
		return new this();
	}

	//! @typed instancetype : void
	init() {
		this.$$exposedBindings = [];
		this.$$observationInfo = {};

		return this;
	}

	//! @typed id : void
	copy() {
		return objj_msgSend(this, 'copyWithZone:', null);
	}

	//! @typed id : @ignored
	static copyWithZone_(zone) {
		// all class objects are unique
		return this;
	}

	//! @typed id : void
	mutableCopy() {
		return objj_msgSend(this, 'mutableCopyWithZone:', null);
	}

	//! @typed id : @ignored
	static mutableCopyWithZone_(zone) {
		// all class objects are unique
		return this;
	}

	//! @typed instancetype : void
	static new() {
		return this.alloc().init();
	}
	//! @}

	//! @name Identifying Classes
	//! @{
	//! @typed Class : void
	static class() {
		return this;
	}

	//! @typed Class : void
	class() {
		return this.constructor;
	}

	//! @typed Class : void
	static superclass() {
		return (this === CPObject) ? null : Object.getPrototypeOf(this);
	}

	//! @property(readonly) Class superclass
	get superclass() {return (this.constructor === CPObject) ? null : Object.getPrototypeOf(this.constructor);}
	set superclass(anything) {objj_throw_arg("Assignment to readonly property");}

	//! @typed BOOL : Class
	static isSubclassOfClass_(aClass) {
		return typeof aClass === 'object' ? Object.create(this.prototype) instanceof aClass : false;
	}

	//! This property shows under the "Scripting" group in Cocoa docs but since there is no useful equivalent in JS, and this property is otherwise useful, we put it here.
	//! @property(readonly, copy) CPString className
	get className() {return objj_string(this.constructor.name);}
	set className(anything) {objj_throw_arg("Assignment to readonly property");}
	//! @}

	//! @name Identifying and Comparing Objects
	//! @{
	//! @typed BOOL : id
	isEqual_(object) {
		return this.hash === object.hash;
	}

	//! @property(readonly) CPUInteger hash
	get hash() {return this.$$UID;}
	set hash(anything) {objj_throw_arg("Assignment to readonly property");}

	//! @typed instancetype : void
	self() {
		return this;
	}
	//! @}

	//! @name Testing Class Functionality
	//! @{
	//! @typed BOOL : SEL
	static instancesRespondToSelector_(aSelector) {
		// we can't call respondsToSelector as it may be overridden for forwarding, as this method must test only the implemented methods of the class
		const instance = this.new();
		return (instance) ? (Reflect.has(instance, objj_function(aSelector)) || this.resolveInstanceMethod_(aSelector)) : false;
	}

	//! @typed BOOL : SEL
	static respondsToSelector_(aSelector) {
		return (objj_getMethod(this, aSelector) !== undefined);
	}
	//! @}

	//! @name Testing Protocol Conformance
	//! @{
	//! @typed BOOL : Protocol
	static conformsToProtocol_(protocol) {
		return this.$$conformsTo.includes(protocol.name);
	}
	//! @}

	//! @name Testing Object Inheritance, Behavior, and Conformance
	//! @{
	//! @typed BOOL : Class
	isKindOfClass_(aClass) {
		return this instanceof aClass;
	}

	//! @typed BOOL : Class
	isMemberOfClass_(aClass) {
		return this.constructor === aClass;
	}

	//! @typed BOOL : SEL
	respondsToSelector_(aSelector) {
		return (objj_getMethod(this, aSelector) !== undefined);
	}

	//! @typed BOOL : Protocol
	conformsToProtocol_(protocol) {
		return this.constructor.$$conformsTo.includes(protocol.name);
	}
	//! @}

	//! @name Obtaining Information About Methods
	//! @{
	//! @typed IMP : SEL
	static methodForSelector_(aSelector) {
		if (this.respondsToSelector_(aSelector)) {
			return (self, ...args) => objj_msgSend(self, aSelector, ...args);
		}
		else {
			return (self, ...args) => objj_msgSend(self, 'doesNotRecognizeSelector:', aSelector);
		}
	}

	//! @typed IMP : SEL
	methodForSelector_(aSelector) {
		return this.constructor.instanceMethodForSelector_(aSelector);
	}

	//! @typed IMP : SEL
	static instanceMethodForSelector_(aSelector) {
		if (this.instancesRespondToSelector_(aSelector)) {
			return (self, ...args) => objj_msgSend(self, aSelector, ...args);
		}
		else {
			return (self, ...args) => objj_msgSend(self, 'doesNotRecognizeSelector:', aSelector);
		}
	}

	//! @typed CPMethodSignature : SEL
	instanceMethodSignatureForSelector_(aSelector) {
		return objj_msgSend(this.new(), 'methodSignatureForSelector:', aSelector);
	}

	//! @typed CPMethodSignature : SEL
	static methodSignatureForSelector_(aSelector) {
		if (this.respondsToSelector_(aSelector)) {
			return objj_methodSignature(this, aSelector);
		}
		return null;
	}

	//! @typed CPMethodSignature : SEL
	methodSignatureForSelector_(aSelector) {
		if (this.respondsToSelector_(aSelector)) {
			return objj_methodSignature(this, aSelector);
		}
		return null;
	}
	//! @}

	//! @name Describing Objects
	//! @{
	//! @typed CPString : void
	static description() {
		return objj_string(this.name);
	}

	//! @property(readonly, copy) CPString description
	get description() {return objj_string(`<${this.constructor.name}: ${this.$$uidString()}>`);}
	set description(anything) {objj_throw_arg("Assignment to readonly property");}

	//! @typed CPString : void
	static debugDescription() {
		return this.description();
	}

	//! @property(readonly, copy) CPString debugDescription
	get debugDescription() {return this.description();}
	set debugDescription(anything) {objj_throw_arg("Assignment to readonly property");}
	//! @}

	//! @name Sending Messages
	//! @{
	//! @typed id : SEL
	performSelector_(aSelector) {
		return objj_msgSend(this, aSelector);
	}

	//! @typed id : SEL, id
	performSelector_withObject_(aSelector, object) {
		return objj_msgSend(this, aSelector, object);
	}

	//! @typed id : SEL, id, id
	performSelector_withObject_withObject_(aSelector, object1, object2) {
		return objj_msgSend(this, aSelector, object1, object2);
	}
	//! @}

	//! @name Forwarding Messages
	//! @{
	//! @typed id : SEL
	static forwardingTargetForSelector_(aSelector) {
		return null;
	}

	//! @typed void : CPInvocation
	static forwardInvocation_(invocation) {
		this.doesNotRecognizeSelector_(objj_propGuard(invocation, 'selector'));
	}

	//! @typed ID : SEL
	forwardingTargetForSelector_(aSelector) {
		return null;
	}

	//! @typed void : CPInvocation
	forwardInvocation_(invocation) {
		this.doesNotRecognizeSelector_(invocation.selector);
	}
//! @}

	//! @name Dynamically Resolving Methods
	//! @{
	//! @typed BOOL : SEL
	static resolveClassMethod_(sel) {
		return false;
	}

	/*!
	 * Caveat: adding instance properties or defining accessor methods for existing properties must be accomplished using Object.defineProperty() with defined getter/setters
	 * @typed BOOL : SEL
	 */
	static resolveInstanceMethod_(sel) {
		return false;
	}
	//! @}

	//! @name Error Handling
	//! @{
	//! @typed void : SEL
	static doesNotRecognizeSelector_(aSelector) {
		objj_throw_arg("+[%s %s]: unrecognized selector sent to class", this.name, aSelector);
	}

	//! @typed void : SEL
	doesNotRecognizeSelector_(aSelector) {
		objj_throw_arg("-[%@ %s]: unrecognized selector sent to instance %s", this.className, aSelector, this.$$uidString());
	}
	//! @}

	//! @name Instance Properties
	//! TODO: do we think that there is a use case to implement the accessibility API? Is it mappable to ARIA?
	//! @{
	//! @property(readonly, copy) CPArray<CPString> exposedBindings
	get exposedBindings() {return this.$$exposedBindings;}
	set exposedBindings(anything) {objj_throw_arg("Assignment to readonly property");}

	//! @property () Object observationInfo
	get observationInfo() {return this.$$observationInfo;}
	set observationInfo(anObject) {this.$$observationInfo = anObject;}
	//! @}

	//! @name Instance Methods
	//! TODO: do we think that there is a use case to implement the accessibility API? Is it mappable to ARIA?
	//! @{
	//! @typed BOOL : void
	isProxy() {
		return false;
	}
	//! @}

}

CPObject.$$conformsTo.push('CPObject');
