/*
	* Module that contains NSObject class emulation and related symbols. All framework classes derive from this base class, except for CRProxy.
 */

function objj_CRObject(superClass = Object) {
	//! NSObject Cocoa Foundation class emulation. Most methods in the Cocoa documentation appear to be applied by categories to add functionality
	//!  needed only by certain subclasses. We will omit all of that as much as we we can to keep our objects lighter. Only methods/properties that
	//!  reasonably apply to all objects should be defined here.
	const metaClass = class CRObject extends superClass {

		static $UID = null;
		static $initialized = false;
		static $conformsTo = [];

		$ISA = 'CRObject';
		$UID = null;
		$exposedBindings = null;
		$observationInfo = null;

		constructor(...args) {
			super(...args);
			this.$UID = objj_CRObject.$oidCounter++;
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
		static mutableCopy() {
			return objj_msgSend(this, 'mutableCopyWithZone:', null);
		}

		//! @typed id : void
		mutableCopy() {
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
			const superClass = (this.name === 'CRObject') ? null : Object.getPrototypeOf(this);
			// always return concrete singleton for CRObject
			if (superClass !== null && superClass.name === 'CRObject')
				return exports.CRObject;
			else
				return superClass;
		}

		//! @property(readonly) Class superclass
		get superclass() {
			const superClass = (this.constructor.name === 'CRObject') ? null : Object.getPrototypeOf(this.constructor);
			if (superClass !== null && superClass.name === 'CRObject')
				return exports.CRObject;
			else
				return superClass;
		}

		//! @typed BOOL : Class
		static isSubclassOfClass_(aClass) {
			for (let targetClass = this; targetClass !== null; targetClass = Object.getPrototypeOf(targetClass)) {
				if (targetClass === aClass || (targetClass.name === 'CRObject' && aClass === exports.CRObject))
					return true;
			}
			return false;
		}

		//! This property shows under the "Scripting" group in Cocoa docs but since there is no useful equivalent in JS, and this property is otherwise useful, we put it here.
		//! @property(class, readonly, copy) CRString className
		static get className() {
			return CRString.new(this.name);
		}

		//! This property shows under the "Scripting" group in Cocoa docs but since there is no useful equivalent in JS, and this property is otherwise useful, we put it here.
		//! @property(readonly, copy) CRString className
		get className() {
			return CRString.new(this.constructor.name);
		}

		//! @}

		//! @name Identifying and Comparing Objects
		//! @{
		//! @typed BOOL : Class
		static isEqual_(aClass) {
			return this.class() === aClass;
		}

		//! @typed BOOL : id
		isEqual_(object) {
			return this === object;
		}

		//! @property(class, readonly) CRUInteger hash
		static get hash() {
			return this.hasOwnProperty("$UID") ? this.$UID : this.$UID = objj_CRObject.$oidCounter++;
		}

		//! @property(readonly) CRUInteger hash
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
			for (let targetClass = this; targetClass !== null; targetClass = Object.getPrototypeOf(targetClass)) {
				if (targetClass === aClass || (targetClass.name === 'CRObject' && aClass === exports.CRObject))
					return true;
			}
			return false;
		}

		//! @typed BOOL : Class
		isKindOfClass_(aClass) {
			return this.class().isKindOfClass_(aClass);
		}

		//! Technically, CRObject should respond to +isMemberOfClass: but the answer is always NO and since there is no use case we just don't include it.
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
			return this.$conformsTo.includes(objj_propGuard(protocol, 'name'));
		}

		//! @typed BOOL : Protocol
		conformsToProtocol_(protocol) {
			return this.constructor.$conformsTo.includes(objj_propGuard(protocol, 'name'));
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

		//! @typed CRMethodSignature : SEL
		static instanceMethodSignatureForSelector_(aSelector) {
			return objj_msgSend(this.prototype, 'methodSignatureForSelector:', aSelector);
		}

		//! @typed CRMethodSignature : SEL
		static methodSignatureForSelector_(aSelector) {
			if (this.respondsToSelector_(aSelector)) {
				return objj_initialize(CRMethodSignature).methodSignatureForObject_selector_(this, aSelector);
			}
			return null;
		}

		//! @typed CRMethodSignature : SEL
		methodSignatureForSelector_(aSelector) {
			if (this.respondsToSelector_(aSelector)) {
				return objj_initialize(CRMethodSignature).methodSignatureForObject_selector_(this, aSelector);
			}
			return null;
		}

		//! @}

		//! @name Describing Objects
		//! @{
		//! @property(class, readonly, copy) CRString description
		static get description() {
			return CRString.new(this.name);
		}

		//! @property(readonly, copy) CRString description
		get description() {
			return CRString.new(`<${this.constructor.name}: ${this.$uidString()}>`);
		}

		//! @property(class, readonly, copy) CRString debugDescription
		static get debugDescription() {
			return this.description;
		}

		//! @property(readonly, copy) CRString debugDescription
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
				// first two args always self and _cmd
				for (let i = 4; i < argCount; i++) {
					args.push(null);
				}
			}
			return objj_msgSend(this, aSelector, ...args);
		}

		//! @typed id : SEL, id, id
		performSelector_withObject_withObject_(aSelector, object1, object2) {
			// if method takes more than two arguments, need to pass null for them
			let args = [object1, object2];
			const sig = this.methodSignatureForSelector_(aSelector);
			if (sig !== null) {
				const argCount = sig.numberOfArguments;
				// first two args always self and _cmd
				for (let i = 4; i < argCount; i++) {
					args.push(null);
				}
			}
			return objj_msgSend(this, aSelector, ...args);
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

		//! @typed void : CRInvocation
		static forwardInvocation_(invocation) {
			this.doesNotRecognizeSelector_(objj_propGuard(invocation, 'selector'));
		}

		//! @typed void : CRInvocation
		forwardInvocation_(invocation) {
			this.doesNotRecognizeSelector_(objj_propGuard(invocation, 'selector'));
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
			objj_initialize(CRException).raise_format_(CRInvalidArgumentException, CRString.new("+[%s %s]: unrecognized selector sent to class"), this.name, aSelector);
		}

		//! @typed void : SEL
		doesNotRecognizeSelector_(aSelector) {
			objj_initialize(CRException).raise_format_(CRInvalidArgumentException, CRString.new("-[%@ %s]: unrecognized selector sent to instance %s"), this.className, aSelector, this.$uidString());
		}

		//! @}

		//! @name Instance Properties
		//! TODO: do we think that there is a use case to implement the accessibility API? Is it mappable to ARIA?
		//! @{
		//! @property(readonly, copy) CRArray<CRString> exposedBindings
		get exposedBindings() {
			// lazy load so we avoid circular dependency in -init
			if (this.$exposedBindings === null)
				this.$exposedBindings = CRArray.new();
			return this.$exposedBindings;
		}

		//! @property () Object observationInfo
		//! Our implementation returns a vanilla JS Object whose properties are observed keys with a JS Array value of sub-objects with keys "object": observing object, "options": options bit mask, "context": context value.
		get observationInfo() {
			return this.$observationInfo;
		}

		set observationInfo(anObject) {
			this.$observationInfo = anObject;
		}

		//! @}

		//! @name Type Properties
		//! @{
		//! @property(class, readonly) BOOL accessInstanceVariablesDirectly
		static get accessInstanceVariablesDirectly() {
			return true;
		}

		//! @}

		//! @name Instance Methods
		//! TODO: do we think that there is a use case to implement the accessibility API? Is it mappable to ARIA?
		//! @{
		//! @typed void : CRString
		setNilValueForKey_(key) {
			objj_initialize(CRException).raise_format_(CRInvalidArgumentException, CRString.new("-[<%@ %s> setNilValueForKey:]: could not set nil as the value for the key %s"), this.className, this.$uidString(), key);
		}

		//! @typed id : CRString
		valueForKey_(key) {
			const keyString = key.jsString, properKey = keyString[0].toUpperCase() + keyString.substr(1);
			let value = undefined;
			// first check for basic accessors
			for (let propName of [`get${properKey}`, keyString, `is${properKey}`, `_${keyString}`]) {
				if (propName in this && objj_propertyDescriptor(this, propName).get !== undefined) {
					value = this[propName];
				}
			}
			// if none, check for array to-many accessors
			if (value === undefined && `countOf${properKey}` in this && (`objectIn${properKey}AtIndex_` in this || `${keyString}AtIndexes_` in this)) {
				// value is mutable array proxy
			}
			// if none, check for set to-many accessors
			else if (`countOf${properKey}` in this && `enumeratorOf${properKey}` in this && `memberOf${properKey}_` in this) {
				// value is mutable set proxy
			}
			else if (this.constructor.accessInstanceVariablesDirectly) {
				for (let propName of [`_${keyString}`, `_is${properKey}`, keyString, `is${properKey}`]) {
					if (propName in this) {
						value = this[propName];
					}
				}
			}
			// did we find a value?
			if (value !== undefined) {
				if (typeof value === 'object')
					return value;
				else if (typeof value === 'number' || typeof value === 'boolean')
					return objj_number(value);
				else
					return objj_value(value);
			}
			else {
				return this.valueForUndefinedKey_(key);
			}
		}

		//! @typed id : CRString
		valueForKeyPath_(keyPath) {
			const pathString = keyPath.jsString,
						periodIdx = pathString.indexOf('.'),
						key = (periodIdx > 0 ? pathString.slice(0, periodIdx) : pathString),
						path = (periodIdx > 0 ? pathString.slice(periodIdx+1) : '');
			if (path === '')
				return this.valueForKey_(CRString.new(key));
			else
				return objj_propGuard(this[key], 'valueForKeyPath_', [CRString.new(path)]);
		}

		//! Technically, CRObject should respond to +isProxy but the answer is always NO and since there is no use case we just don't include it.
		//! @typed BOOL : void
		isProxy() {
			return false;
		}

		//! @}

	};

	// we need CRObject to act as singleton, so store UID & initialized state in function
	if (objj_CRObject.$oidCounter === undefined) objj_CRObject.$oidCounter = 1;
	if (objj_CRObject.$initialized === undefined) objj_CRObject.$initialized = false;

	// our UID always 1 so we don't have to worry about multiple invocations creating different hash values
	metaClass.$UID = 1;
	metaClass.$initialized = objj_CRObject.$initialized;
	metaClass.$conformsTo.push('CRObject');

	return metaClass;
}
exports.objj_CRObject = objj_CRObject;

// export meta class as concrete class
exports.CRObject = objj_CRObject();

// usage imports--import last so we avoid circular dependencies
const OBJJ = require('../Objective-J'),
		objj_msgSend = OBJJ.objj_msgSend,
		objj_propGuard = OBJJ.objj_propGuard,
		objj_getMethod = OBJJ.objj_getMethod, objj_initialize = OBJJ.objj_initialize, objj_propertyDescriptor = OBJJ.objj_propertyDescriptor;
const CRStringSym = require('./CRString'), CRString = CRStringSym.CRString;
const CRExceptionSym = require("./CRException"), CRException = CRExceptionSym.CRException, CRInvalidArgumentException = CRExceptionSym.CRInvalidArgumentException;
const CRMethodSignatureSym = require('./CRMethodSignature'), CRMethodSignature = CRMethodSignatureSym.CRMethodSignature;
const CRArraySym = require('./CRArray'), CRArray = CRArraySym.CRArray;
const sprintf = require('sprintf-js').sprintf;
