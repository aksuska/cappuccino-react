/**
 * Implementation of NSException
 **/

import {objj_initialize, objj_string, objj_throw_arg} from '../Objective-J';
import CPObject from './CPObject';
import CPString from './CPString';
import objj_msgSend from "../Objective-J";

// globals
export const CPInvalidArgumentException = objj_string("CPInvalidArgumentException");

export default class CPException extends CPObject {

	static $$uncaughtExceptionHandler = null;

	$$name = null;
	$$reason = null;
	$$userInfo = null;
	$$callStackReturnAddresses = null;
	$$callStackSymbols = null;

	get name() {return this.$$name;}
	set name(anything) {objj_throw_arg("Assignment to readonly property");}

	get reason() {return this.$$reason;}
	set reason(anything) {objj_throw_arg("Assignment to readonly property");}

	get userInfo() {return this.$$userInfo;}
	set userInfo(anything) {objj_throw_arg("Assignment to readonly property");}

	get callStackReturnAddresses() {return this.$$callStackReturnAddresses;}
	set callStackReturnAddresses(anything) {objj_throw_arg("Assignment to readonly property");}

	get callStackSymbols() {return this.$$callStackSymbols;}
	set callStackSymbols(anything) {objj_throw_arg("Assignment to readonly property");}

	static exceptionWithName_reason_userInfo_(name, reason, userInfo) {
		const exception = this.new();
		if (exception) {
			exception.$$name = name;
			exception.$$reason = reason;
			exception.$$userInfo = userInfo;
		}
		return exception
	}

	static raise_format_(name, format, ...args) {
		this.raise_format_arguments_(name, format, args);
	}

	static raise_format_arguments_(name, format, args) {
		// null format seems to be ignored in cocoa, so we'll do that too
		const reason = (format !== null) ? objj_msgSend(CPString, 'stringWithFormat:', format, ...args) : null;
		const exception = this.exceptionWithName_reason_userInfo_(name, reason, null);
		if (exception === null)
			throw "!? Could not create CPException object ?!";

		// because we don't have a sensible way of parsing call stacks, we'll just set whatever browser gives us
		exception.$$callStackReturnAddresses = exception.$$callStackSymbols = new Error().stack.split("\n");
		throw exception;
	}

	raise() {
		throw this;
	}
}

export function CPGetUncaughtExceptionHandler() {
	return objj_initialize(CPException).$$uncaughtExceptionHandler;
}

export function CPSetUncaughtExceptionHandler(handler/*(Event e)*/) {
	if (objj_initialize(CPException).$$uncaughtExceptionHandler !== null) {
		window.removeEventListener('error', CPException.$$uncaughtExceptionHandler, true);
	}
	CPException.$$uncaughtExceptionHandler = handler;
	window.addEventListener('error', handler, true);
}
