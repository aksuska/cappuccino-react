/*
	* Module that contains NSObject class emulation and related symbols. All framework classes derive from this base class, except for CPProxy.
 */

import objj_msgSend, {
	objj_propGuard,
	objj_string,
	objj_methodSignature,
	objj_throw_arg,
	objj_getMethod, objj_oid, objj_array
} from '../Objective-J';

const sprintf = require('sprintf-js').sprintf;

export function objj_CPObject(superClass = Object) {
	//! NSObject Cocoa Foundation class emulation. Most methods in the Cocoa documentation appear to be applied by categories to add functionality
	//!  needed only by certain subclasses. We will omit all of that as much as we we can to keep our objects lighter. Only methods/properties that
	//!  reasonably apply to all objects should be defined here.
	const metaClass = class CPObject extends superClass {

		static $initialized = false;
		static $conformsTo = [];

		$ISA = 'CPObject';
		$UID = null;
		$exposedBindings = null;
		$observationInfo = null;

		constructor(...args) {
			super(...args);
			this.$UID = objj_oid();
		}

		// private method to return UID as hex value
		$uidString() {
			return sprintf("x%06x", this.$UID);
		}

		// we need to use the conditional getter or all subclasses will inherit the value
		static get initialized() {
			return this.hasOwnProperty("$initialized") ? this.$initialized : false;
		}

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
			this.$exposedBindings = objj_array([]);
			this.$observationInfo = {};

			return this;
		}

		//! @typed id : void
		static copy() {
			return objj_msgSend(this, 'copyWithZone:', null);
		}

		//! @typed id : void
		copy() {
			return objj_msgSend(this, 'copyWithZone:', null);
		}

		//! @typed id : null
		static copyWithZone_(zone) {
			// all class objects are unique
			return this;
		}

		//! @typed id : void
		mutableCopy() {
			return objj_msgSend(this, 'mutableCopyWithZone:', null);
		}

		//! @typed id : void
		static mutableCopy() {
			return objj_msgSend(this, 'mutableCopyWithZone:', null);
		}

		//! @typed id : null
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

		//! @property(class, readonly) Class superclass
		static get superclass() {
			return (this.name === 'CPObject') ? null : Object.getPrototypeOf(this);
		}

		//! @property(readonly) Class superclass
		get superclass() {
			return (this.constructor.name === 'CPObject') ? null : Object.getPrototypeOf(this.constructor);
		}

		//! @typed BOOL : Class
		static isSubclassOfClass_(aClass) {
			for (let targetClass = this; targetClass !== null; targetClass = Object.getPrototypeOf(targetClass)) {
				if (targetClass === aClass)
					return true;
			}
			return false;
		}

		//! This property shows under the "Scripting" group in Cocoa docs but since there is no useful equivalent in JS, and this property is otherwise useful, we put it here.
		//! @property(class, readonly, copy) CPString className
		static get className() {
			return new CPString(this.name);
		}

		//! This property shows under the "Scripting" group in Cocoa docs but since there is no useful equivalent in JS, and this property is otherwise useful, we put it here.
		//! @property(readonly, copy) CPString className
		get className() {
			return new CPString(this.constructor.name);
		}

		//! @}

		//! @name Identifying and Comparing Objects
		//! @{
		//! @typed BOOL : Class
		static isEqual_(aClass) {
			return this.hash === aClass.hash;
		}

		//! @typed BOOL : id
		isEqual_(object) {
			return this.hash === object.hash;
		}

		//! @property(class, readonly) CPUInteger hash
		static get hash() {
			return (this.$$UID === undefined ? this.$$UID = objj_oid() : this.$$UID);
		}

		//! @property(readonly) CPUInteger hash
		get hash() {
			return this.$UID;
		}

		//! @typed Class : void
		static self() {
			return this;
		}

		//! @typed instancetype : void
		self() {
			return this;
		}

		//! @}

		//! @name Testing Class and Object Inheritance, Behavior, and Conformance
		//! @{
		//! @typed BOOL : Class
		static isKindOfClass_(aClass) {
			for (let targetClass = this; targetClass !== Object.getPrototypeOf(CPObject); targetClass = Object.getPrototypeOf(targetClass)) {
				if (targetClass === aClass)
					return true;
			}
			return false;
		}

		//! @typed BOOL : Class
		isKindOfClass_(aClass) {
			return this instanceof aClass;
		}

		//! Technically, CPObject should respond to +isMemberOfClass: but the answer is always NO and since there is no use case we just don't include it.
		//! @typed BOOL : Class
		isMemberOfClass_(aClass) {
			return this.constructor === aClass;
		}

		static instancesRespondToSelector_(aSelector) {
			// we can't call respondsToSelector as it may be overridden for forwarding, as this method must test only the implemented methods of the class
			return objj_getMethod(this.prototype, aSelector) !== undefined || this.resolveInstanceMethod_(aSelector);
		}

		static respondsToSelector_(aSelector) {
			return (objj_getMethod(this, aSelector) !== undefined);
		}

		//! @typed BOOL : SEL
		respondsToSelector_(aSelector) {
			return (objj_getMethod(this, aSelector) !== undefined);
		}

		static conformsToProtocol_(protocol) {
			return this.$conformsTo.includes(protocol.name);
		}

		//! @typed BOOL : Protocol
		conformsToProtocol_(protocol) {
			return this.constructor.$conformsTo.includes(protocol.name);
		}

		//! @}

		//! @name Obtaining Information About Methods
		//! @{
		//! Returns an anonymous function taking arguments (self, _cmd, ...args) that calls objj_msgSend(self, aSelector, ...args). If the object doesn't respond
		//!  to the selector (-respondsToSelector: returns NO), function will call objj_msgSend(self, @selector(doesNotRecognizeSelector:), aSelector).
		//! @typed IMP : SEL
		static methodForSelector_(aSelector) {
			if (this.respondsToSelector_(aSelector)) {
				return (self, _cmd, ...args) => objj_msgSend(self, aSelector, ...args);
			}
			else {
				return (self, _cmd, ...args) => objj_msgSend(self, 'doesNotRecognizeSelector:', aSelector);
			}
		}

		//! Returns an anonymous function taking arguments (self, _cmd, ...args) that calls objj_msgSend(self, aSelector, ...args). If the object doesn't respond
		//!  to the selector (-respondsToSelector: returns NO), function will call objj_msgSend(self, @selector(doesNotRecognizeSelector:), aSelector).
		//! @typed IMP : SEL
		methodForSelector_(aSelector) {
			return this.constructor.instanceMethodForSelector_(aSelector);
		}

		//! Returns an anonymous function taking arguments (self, _cmd, ...args) that calls objj_msgSend(self, aSelector, ...args). If the object doesn't respond
		//!  to the selector (-respondsToSelector: returns NO), function will call objj_msgSend(self, @selector(doesNotRecognizeSelector:), aSelector).
		//! @typed IMP : SEL
		static instanceMethodForSelector_(aSelector) {
			if (this.instancesRespondToSelector_(aSelector)) {
				return (self, _cmd, ...args) => objj_msgSend(self, aSelector, ...args);
			}
			else {
				return (self, _cmd, ...args) => objj_msgSend(self, 'doesNotRecognizeSelector:', aSelector);
			}
		}

		//! @typed CPMethodSignature : SEL
		static instanceMethodSignatureForSelector_(aSelector) {
			return objj_msgSend(this.prototype, 'methodSignatureForSelector:', aSelector);
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
		//! @property(class, readonly, copy) CPString description
		static get description() {
			return objj_string(this.name);
		}

		//! @property(readonly, copy) CPString description
		get description() {
			return objj_string(`<${this.constructor.name}: ${this.$$uidString()}>`);
		}

		//! @property(class, readonly, copy) CPString debugDescription
		static get debugDescription() {
			return this.description;
		}

		//! @property(readonly, copy) CPString debugDescription
		get debugDescription() {
			return this.description;
		}

		//! @}

		//! @name Sending Messages
		//! @{
		//! @typed id : SEL
		static performSelector_(aSelector) {
			return this.performSelector_withObject_withObject_(aSelector, null, null);
		}

		//! @typed id : SEL
		performSelector_(aSelector) {
			return this.performSelector_withObject_withObject_(aSelector, null, null);
		}

		//! @typed id : SEL, id
		static performSelector_withObject_(aSelector, object) {
			return this.performSelector_withObject_withObject_(aSelector, object, null);
		}

		//! @typed id : SEL, id
		performSelector_withObject_(aSelector, object) {
			return this.performSelector_withObject_withObject_(aSelector, object, null);
		}

		//! @typed id : SEL, id, id
		static performSelector_withObject_withObject_(aSelector, object1, object2) {
			// if method takes more than two arguments, need to pass null for them
			let args = [object1, object2];
			const sig = this.methodSignatureForSelector_(aSelector);
			if (sig !== null) {
				const argCount = sig.numberOfArguments;
				for (let i = 2; i < argCount; i++) {
					args.push(null);
				}
			}
			return objj_msgSend(this, aSelector, ...args);
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

		//! @typed ID : SEL
		forwardingTargetForSelector_(aSelector) {
			return null;
		}

		//! @typed void : CPInvocation
		static forwardInvocation_(invocation) {
			this.doesNotRecognizeSelector_(objj_propGuard(invocation, 'selector'));
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
			objj_throw_arg("-[%@ %s]: unrecognized selector sent to instance %s", this.className, aSelector, this.$uidString());
		}

		//! @}

		//! @name Instance Properties
		//! TODO: do we think that there is a use case to implement the accessibility API? Is it mappable to ARIA?
		//! @{
		//! @property(readonly, copy) CPArray<CPString> exposedBindings
		get exposedBindings() {
			return this.$exposedBindings;
		}

		//! @property () Object observationInfo
		get observationInfo() {
			return this.$observationInfo;
		}

		set observationInfo(anObject) {
			this.$observationInfo = anObject;
		}

		//! @}

		//! @name Instance Methods
		//! TODO: do we think that there is a use case to implement the accessibility API? Is it mappable to ARIA?
		//! @{
		//! Technically, CPObject should respond to +isProxy but the answer is always NO and since there is no use case we just don't include it.
		//! @typed BOOL : void
		isProxy() {
			return false;
		}

		//! @}

	};

	metaClass.$conformsTo.push('CPObject');

	return metaClass;
}

// our default export is meta class as concrete class
const CPObject = objj_CPObject();
export default CPObject;
