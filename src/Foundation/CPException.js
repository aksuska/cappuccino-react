/*!
 * Module that contains NSException class emulation and related symbols.
 **/

import objj_msgSend, {objj_initialize} from '../Objective-J';
import {objj_CPObject} from './CPObject';
import CPString from './CPString';

//! @typed CPString
export const CPInvalidArgumentException = new CPString("CPInvalidArgumentException");

//! NSException Cocoa Foundation class emulation
export default class CPException extends objj_CPObject(Error) {

	static $uncaughtExceptionHandler = null;

	$userInfo = null;

	constructor(...args) {
		super(...args);

	}

	// we declare this for consistency with Cocoa, but don't implerment because it already exists in superclass.
	//! @property(readonly, copy) CPString name

	//! @property(readonly, copy) CPString reason
	get reason() {return this.message;}

	//! @property(readonly, copy) CPDictionary userInfo
	get userInfo() {return this.$userInfo;}

	/*!
	 * Browsers don't provide a reliable way to parse a call stack, so we just return the entries from new Error().stack
	 * @property(readonly, copy) CPArray<CPString> callStackReturnAddresses
	 */
	get callStackReturnAddresses() {return this.stack.split("\n");}

	//! Browsers don't provide a reliable way to parse a call stack, so we just return the entries from new Error().stack
	//! @property(readonly, copy) CPArray<CPString> callStackSymbols
	get callStackSymbols() {return this.stack.split("\n");}

	//! @typed CPException : CPString, CPString, CPDictionary
	static exceptionWithName_reason_userInfo_(name, reason, userInfo) {
		const exception = this.new();
		if (exception) {
			exception.name = objj_msgSend(name, 'copyWithZone:', null);
			exception.message = objj_msgSend(reason, 'copyWithZone:', null);
			exception.$userInfo = objj_msgSend(userInfo, 'copyWithZone:', null);
		}
		return exception
	}

	//! @typed void : CPString, CPString
	static raise_format_(name, format, ...args) {
		this.raise_format_arguments_(name, format, args);
	}

	//! @typed void : CPString, CPString, CPArray
	static raise_format_arguments_(name, format, args) {
		// null format seems to be ignored in cocoa, so we'll do that too
		const reason = (format !== null) ? objj_msgSend(CPString, 'stringWithFormat:', format, ...args) : null;
		const exception = this.exceptionWithName_reason_userInfo_(name, reason, null);
		if (exception === null)
			throw new Error("!? Could not create CPException object ?!");
		throw exception;
	}

	//! @typed void : void
	raise() {
		throw this;
	}
}

//! @typed void (^)(Event e) : void
export function CPGetUncaughtExceptionHandler() {
	return objj_initialize(CPException).$uncaughtExceptionHandler;
}

//! @typed void : void (^)(Event e)
export function CPSetUncaughtExceptionHandler(handler) {
	if (objj_initialize(CPException).$uncaughtExceptionHandler !== null) {
		window.removeEventListener('error', CPException.$uncaughtExceptionHandler, true);
	}
	CPException.$uncaughtExceptionHandler = handler;
	window.addEventListener('error', handler, true);
}
