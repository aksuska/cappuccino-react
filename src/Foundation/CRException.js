/*!
 * Module that contains NSException class emulation and related symbols.
 **/

const OBJJ = require('../Objective-J'), objj_msgSend = OBJJ.objj_msgSend, objj_initialize = OBJJ.objj_initialize;
const CRObjectSym = require('./CRObject'), objj_CRObject = CRObjectSym.objj_CRObject;

//! NSException Cocoa Foundation class emulation
class CRException extends objj_CRObject(Error) {

	static $uncaughtExceptionHandler = null;
	$userInfo = null;

	constructor(...args) {
		super(...args);
	}

	// we declare this for consistency with Cocoa, but don't implement because it already exists in superclass.
	//! @property(readonly, copy) CRString name

	//! @property(readonly, copy) CRString reason
	get reason() {return this.message;}

	//! @property(readonly, copy) CRDictionary userInfo
	get userInfo() {return this.$userInfo;}

	/*!
	 * Browsers don't provide a reliable way to parse a call stack, so we just return the entries from new Error().stack
	 * @property(readonly, copy) CRArray<CRString> callStackReturnAddresses
	 */
	get callStackReturnAddresses() {return this.stack.split("\n");}

	//! Browsers don't provide a reliable way to parse a call stack, so we just return the entries from new Error().stack
	//! @property(readonly, copy) CRArray<CRString> callStackSymbols
	get callStackSymbols() {return this.stack.split("\n");}

	//! @typed CRException : CRString, CRString, CRDictionary
	static exceptionWithName_reason_userInfo_(name, reason, userInfo) {
		const exception = this.new();
		if (exception) {
			exception.name = objj_msgSend(name, 'copyWithZone:', null);
			exception.message = objj_msgSend(reason, 'copyWithZone:', null);
			exception.$userInfo = objj_msgSend(userInfo, 'copyWithZone:', null);
		}
		return exception
	}

	//! @typed void : CRString, CRString
	static raise_format_(name, format, ...args) {
		this.raise_format_arguments_(name, format, args);
	}

	//! @typed void : CRString, CRString, CRArray
	static raise_format_arguments_(name, format, args) {
		// null format seems to be ignored in cocoa, so we'll do that too
		const reason = (format !== null) ? objj_msgSend(CRString, 'stringWithFormat:', format, ...args) : null;
		const exception = this.exceptionWithName_reason_userInfo_(name, reason, null);
		if (exception === null)
			throw new Error("!? Could not create CRException object ?!");
		throw exception;
	}

	//! @typed void : void
	raise() {
		throw this;
	}
}
exports.CRException = CRException;

//! @typed void (^)(Event e) : void
function CRGetUncaughtExceptionHandler() {
	return objj_initialize(CRException).$uncaughtExceptionHandler;
}
exports.CRGetUncaughtExceptionHandler = CRGetUncaughtExceptionHandler;

//! @typed void : void (^)(Event e)
function CRSetUncaughtExceptionHandler(handler) {
	if (objj_initialize(CRException).$uncaughtExceptionHandler !== null) {
		window.removeEventListener('error', CRException.$uncaughtExceptionHandler, true);
	}
	CRException.$uncaughtExceptionHandler = handler;
	window.addEventListener('error', handler, true);
}
exports.CRSetUncaughtExceptionHandler = CRSetUncaughtExceptionHandler;

const CRStringSym = require('./CRString'), CRString = CRStringSym.CRString;

//! @typed CRString
exports.CRInvalidArgumentException = CRString.new("CRInvalidArgumentException");
//! @typed CRString
exports.CRRangeException = CRString.new("CRRangeException");
//! @typed CRString
exports.CRInternalInconsistencyException = CRString.new("CRInternalInconsistencyException");
