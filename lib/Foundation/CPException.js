'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.CPInvalidArgumentException = undefined;
exports.CPGetUncaughtExceptionHandler = CPGetUncaughtExceptionHandler;
exports.CPSetUncaughtExceptionHandler = CPSetUncaughtExceptionHandler;

var _ObjectiveJ = require('../Objective-J');

var _ObjectiveJ2 = _interopRequireDefault(_ObjectiveJ);

var _CPObject = require('./CPObject');

var _CPObject2 = _interopRequireDefault(_CPObject);

var _CPString = require('./CPString');

var _CPString2 = _interopRequireDefault(_CPString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// globals
/**
 * Implementation of NSException
 **/

const CPInvalidArgumentException = exports.CPInvalidArgumentException = (0, _ObjectiveJ.objj_string)("CPInvalidArgumentException");

class CPException extends _CPObject2.default {
	constructor(...args) {
		var _temp;

		return _temp = super(...args), Object.defineProperty(this, '$$name', {
			enumerable: true,
			writable: true,
			value: null
		}), Object.defineProperty(this, '$$reason', {
			enumerable: true,
			writable: true,
			value: null
		}), Object.defineProperty(this, '$$userInfo', {
			enumerable: true,
			writable: true,
			value: null
		}), Object.defineProperty(this, '$$callStackReturnAddresses', {
			enumerable: true,
			writable: true,
			value: null
		}), Object.defineProperty(this, '$$callStackSymbols', {
			enumerable: true,
			writable: true,
			value: null
		}), _temp;
	}

	get name() {
		return this.$$name;
	}
	set name(anything) {
		(0, _ObjectiveJ.objj_throw_arg)("Assignment to readonly property");
	}

	get reason() {
		return this.$$reason;
	}
	set reason(anything) {
		(0, _ObjectiveJ.objj_throw_arg)("Assignment to readonly property");
	}

	get userInfo() {
		return this.$$userInfo;
	}
	set userInfo(anything) {
		(0, _ObjectiveJ.objj_throw_arg)("Assignment to readonly property");
	}

	get callStackReturnAddresses() {
		return this.$$callStackReturnAddresses;
	}
	set callStackReturnAddresses(anything) {
		(0, _ObjectiveJ.objj_throw_arg)("Assignment to readonly property");
	}

	get callStackSymbols() {
		return this.$$callStackSymbols;
	}
	set callStackSymbols(anything) {
		(0, _ObjectiveJ.objj_throw_arg)("Assignment to readonly property");
	}

	static exceptionWithName_reason_userInfo_(name, reason, userInfo) {
		const exception = this.new();
		if (exception) {
			exception.$$name = name;
			exception.$$reason = reason;
			exception.$$userInfo = userInfo;
		}
		return exception;
	}

	static raise_format_(name, format, ...args) {
		this.raise_format_arguments_(name, format, args);
	}

	static raise_format_arguments_(name, format, args) {
		// null format seems to be ignored in cocoa, so we'll do that too
		const reason = format !== null ? (0, _ObjectiveJ2.default)(_CPString2.default, 'stringWithFormat:', format, ...args) : null;
		const exception = this.exceptionWithName_reason_userInfo_(name, reason, null);
		if (exception === null) throw "!? Could not create CPException object ?!";

		// because we don't have a sensible way of parsing call stacks, we'll just set whatever browser gives us
		exception.$$callStackReturnAddresses = exception.$$callStackSymbols = new Error().stack.split("\n");
		throw exception;
	}

	raise() {
		throw this;
	}
}

exports.default = CPException;
Object.defineProperty(CPException, '$$uncaughtExceptionHandler', {
	enumerable: true,
	writable: true,
	value: null
});
function CPGetUncaughtExceptionHandler() {
	return (0, _ObjectiveJ.objj_initialize)(CPException).$$uncaughtExceptionHandler;
}

function CPSetUncaughtExceptionHandler(handler /*(Event e)*/) {
	if ((0, _ObjectiveJ.objj_initialize)(CPException).$$uncaughtExceptionHandler !== null) {
		window.removeEventListener('error', CPException.$$uncaughtExceptionHandler, true);
	}
	CPException.$$uncaughtExceptionHandler = handler;
	window.addEventListener('error', handler, true);
}
//# sourceMappingURL=CPException.js.map