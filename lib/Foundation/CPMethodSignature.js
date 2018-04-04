'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _ObjectiveJ = require('../Objective-J');

var _CPObject = require('./CPObject');

var _CPObject2 = _interopRequireDefault(_CPObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Implementation of NSMethodSignature. Not generally useful since there is a lot if functionality
 * we can't easily replicate. If it became necessary it might be possible to have the compiler annotate
 * inside the function declaration so as to preserve the type annotations, which would be accessible
 * via the toString() method of Function.
 **/

class CPMethodSignature extends _CPObject2.default {
	constructor(...args) {
		var _temp;

		return _temp = super(...args), Object.defineProperty(this, '$$typeList', {
			enumerable: true,
			writable: true,
			value: []
		}), _temp;
	}

	get methodReturnType() {
		return this.$$typeList[0];
	}
	set methodReturnType(anything) {
		(0, _ObjectiveJ.objj_throw_arg)("Assignment to readonly property");
	}

	get methodReturnLength() {
		return 1;
	}
	set methodReturnLength(anything) {
		(0, _ObjectiveJ.objj_throw_arg)("Assignment to readonly property");
	}

	get numberOfArguments() {
		return this.$$typeList.length - 1;
	}
	set numberOfArguments(anything) {
		(0, _ObjectiveJ.objj_throw_arg)("Assignment to readonly property");
	}

	get frameLength() {
		return 1;
	}
	set frameLength(anything) {
		(0, _ObjectiveJ.objj_throw_arg)("Assignment to readonly property");
	}

	static signatureWithObjCTypes_(typeString) {
		let sig = this.new();
		if (sig) {
			sig.$$typeList = typeString.split('');
		}
		return sig;
	}

	getArgumentTypeAtIndex_(idx) {
		if (idx >= this.$$typeList.length) (0, _ObjectiveJ.objj_throw_arg)("-[%@ getArgumentTypeAtIndex:]: index (%i) out of bounds [0, %i]", this.className, idx, this.$$typeList.length - 1);

		return this.$$typeList[idx];
	}

	// N/A but true is usually the right answer
	isOneway() {
		return true;
	}
}
exports.default = CPMethodSignature;
//# sourceMappingURL=CPMethodSignature.js.map