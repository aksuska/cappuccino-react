/*!
 * Module that contains NSMethodSignature class emulation and related symbols. Not generally useful since there is a lot of functionality
 * we can't easily replicate. If it became necessary it might be possible to have the compiler annotate inside the function declaration
 * so as to preserve the type annotations, which would be accessible via the toString() method of Function.
 **/

const OBJJ = require('../Objective-J'), objj_initialize = OBJJ.objj_initialize;
const CRObjectSym = require('./CPObject'), CRObject = CRObjectSym.CRObject;
const CRExceptionSym = require("./CPException"), CRException = CRExceptionSym.CRException, CRInvalidArgumentException = CRExceptionSym.CRInvalidArgumentException;

//! NSMethodSignature Cocoa Foundation class emulation
class CRMethodSignature extends CRObject {
	
	$typeList = [];
	
	//! Property will always be '@' since we currently don't have a means of determining a method's return type
	//! @property(readonly) string methodReturnType
	get methodReturnType() {return this.$typeList[0];}

	//! Property will always be 1 since there is no real JS equivalent
	//! @property(readonly) CRUInteger methodReturnLength
	get methodReturnLength() {return 1;}

	//! @property(readonly) CRUInteger numberOfArguments
	get numberOfArguments() {return this.$typeList.length - 1;}

	//! Property will always be 1 since there is no real JS equivalent
	//! @property(readonly) CRUInteger frameLength
	get frameLength() {return 1;}

	//! @typed CRMethodSignature : string
	static signatureWithObjCTypes_(typeString) {
		let sig = this.new();
		if (sig) {
			sig.$typeList = typeString.split('');
		}
		return sig;
	}

	//! @typed string : CRUInteger
	getArgumentTypeAtIndex_(idx) {
		if (idx >= this.$typeList.length)
			objj_initialize(CRException).raise_format_(CRInvalidArgumentException, new CRString("-[%@ getArgumentTypeAtIndex:]: index (%i) out of bounds [0, %i]"), this.className, idx, this.$typeList.length - 1);
		
		return this.$typeList[idx];
	}
	
	//! Currently N/A since we don't have an emulation of Distributed Objects, but always returns YES since that is usually the right answer
	//! @typed BOOL : void
	isOneway() {
		return true;
	}
}
exports.CRMethodSignature = CRMethodSignature;

const CRStringSym = require("./CPString"), CRString = CRStringSym.CRString;
