'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _ObjectiveJ = require('../Objective-J');

var _ObjectiveJ2 = _interopRequireDefault(_ObjectiveJ);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const sprintf = require('sprintf-js').sprintf; /**
                                                * Base class from which all Objective-J objects should derive
                                                **/

class CPObject {

	constructor() {
		Object.defineProperty(this, '$$UID', {
			enumerable: true,
			writable: true,
			value: null
		});
		Object.defineProperty(this, '$$exposedBindings', {
			enumerable: true,
			writable: true,
			value: null
		});
		Object.defineProperty(this, '$$observationInfo', {
			enumerable: true,
			writable: true,
			value: null
		});

		this.constructor.$$oidCounter = this.constructor.$$oidCounter + 1;
		this.$$UID = this.constructor.$$oidCounter;
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
	static set initialized(anything) {
		(0, _ObjectiveJ.objj_throw_arg)("Assignment to readonly property");
	}

	static get description() {
		return (0, _ObjectiveJ.objj_string)(this.name);
	}
	static set description(anything) {
		(0, _ObjectiveJ.objj_throw_arg)("Assignment to readonly property");
	}

	static get debugDescription() {
		return this.description();
	}
	static set debugDescription(anything) {
		(0, _ObjectiveJ.objj_throw_arg)("Assignment to readonly property");
	}

	static get superclass() {
		return this === CPObject ? null : Object.getPrototypeOf(this);
	}
	static set superclass(anything) {
		(0, _ObjectiveJ.objj_throw_arg)("Assignment to readonly property");
	}

	get superclass() {
		return this.constructor === CPObject ? null : Object.getPrototypeOf(this.constructor);
	}
	set superclass(anything) {
		(0, _ObjectiveJ.objj_throw_arg)("Assignment to readonly property");
	}

	get exposedBindings() {
		return this.$$exposedBindings;
	}
	set exposedBindings(anything) {
		(0, _ObjectiveJ.objj_throw_arg)("Assignment to readonly property");
	}

	get observationInfo() {
		return this.$$observationInfo;
	}
	set observationInfo(anything) {
		(0, _ObjectiveJ.objj_throw_arg)("Assignment to readonly property");
	}

	get className() {
		return (0, _ObjectiveJ.objj_string)(this.constructor.name);
	}
	set className(anything) {
		(0, _ObjectiveJ.objj_throw_arg)("Assignment to readonly property");
	}

	get description() {
		return (0, _ObjectiveJ.objj_string)(`<${this.constructor.name}: ${this.$$uidString()}>`);
	}
	set description(anything) {
		(0, _ObjectiveJ.objj_throw_arg)("Assignment to readonly property");
	}

	get debugDescription() {
		return this.description();
	}
	set debugDescription(anything) {
		(0, _ObjectiveJ.objj_throw_arg)("Assignment to readonly property");
	}

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
		return typeof this[(0, _ObjectiveJ.objj_function)(aSelector)] === 'function' || this.resolveClassMethod_(aSelector);
	}

	static instancesRespondToSelector_(aSelector) {
		// we can't call respondsToSelector as it may be overridden for forwarding, as this method must test only the implemented methods of the class
		const instance = this.new();
		return instance ? Reflect.has(instance, (0, _ObjectiveJ.objj_function)(aSelector)) || this.resolveInstanceMethod_(aSelector) : false;
	}

	static instanceMethodForSelector_(aSelector) {
		if (this.instancesRespondToSelector_(aSelector)) {
			return (...args) => (0, _ObjectiveJ2.default)(this, aSelector, ...args);
		} else {
			return (...args) => (0, _ObjectiveJ2.default)(this, 'doesNotRecognizeSelector:', aSelector);
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
			return (0, _ObjectiveJ.objj_methodSignature)(this, aSelector);
		}
		return null;
	}

	static forwardInvocation_(invocation) {
		this.doesNotRecognizeSelector_((0, _ObjectiveJ.objj_propGuard)(invocation, 'selector'));
	}

	static doesNotRecognizeSelector_(aSelector) {
		(0, _ObjectiveJ.objj_throw_arg)("+[%s %s]: unrecognized selector sent to class", this.name, aSelector);
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

	conformsToProtocol_(protocol) {
		return this.constructor.$$conformsTo.includes(protocol.name);
	}

	respondsToSelector_(aSelector) {
		return typeof Reflect.get(this, aSelector) === 'function' || this.class().resolveInstanceMethod_(aSelector);
	}

	forwardingTargetForSelector_(aSelector) {
		return null;
	}

	methodSignatureForSelector_(aSelector) {
		if (this.respondsToSelector_(aSelector)) {
			return (0, _ObjectiveJ.objj_methodSignature)(this, aSelector);
		}
		return null;
	}

	forwardInvocation_(invocation) {
		this.doesNotRecognizeSelector_(invocation.selector);
	}

	doesNotRecognizeSelector_(aSelector) {
		(0, _ObjectiveJ.objj_throw_arg)("-[%@ %s]: unrecognized selector sent to instance %s", this.className, aSelector, this.$$uidString());
	}

	copy() {
		return (0, _ObjectiveJ2.default)(this, 'copyWithZone:', null);
	}
}

exports.default = CPObject;
Object.defineProperty(CPObject, '$$oidCounter', {
	enumerable: true,
	writable: true,
	value: 0
});
Object.defineProperty(CPObject, '$$initialized', {
	enumerable: true,
	writable: true,
	value: false
});
Object.defineProperty(CPObject, '$$conformsTo', {
	enumerable: true,
	writable: true,
	value: []
});
CPObject.$$conformsTo.push('CPObject');
//# sourceMappingURL=CPObject.js.map