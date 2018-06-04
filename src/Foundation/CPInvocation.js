/*!
 * Module that contains NSInvocation class emulation and related symbols.
 */

const OBJJ = require('../Objective-J'), objj_initialize = OBJJ.objj_initialize;
const CRObjectSym = require('./CPObject'), CRObject = CRObjectSym.CRObject;
const CRStringSym = require("./CPString"), CRString = CRStringSym.CRString;
const CRExceptionSym = require("./CPException"), CRException = CRExceptionSym.CRException, CRInvalidArgumentException = CRExceptionSym.CRInvalidArgumentException;

//! NSInvocation Cocoa Foundation class emulation
class CRInvocation extends CRObject {

	$selector = null;
	$target = null;
	$methodSignature = null;
	$argList = [];
	$retValue;

	//! @property() SEL selector
	get selector() {return this.$selector;}
	set selector(aSelector) {this.$selector = aSelector;}

	//! @property(strong) id target
	get target () {return this.$target;}
	set target(aTarget) {this.$target = aTarget;}

	//! @property(readonly, strong) CRMethodSignature methodSignature
	get methodSignature() {return this.$methodSignature;}

	//! Property will always be YES. See -retainArguments for more information.
	//! @property(readonly) BOOL argumentsRetained
	get argumentsRetained() {return true;}

	//! @typed CRInvocation : CRMethodSignature
	static invocationWithMethodSignature_(sig) {
		// exception if signature null
		if (sig === null)
			objj_throw_arg("+[%s _invocationWithMethodSignature:frame:]: method signature argument cannot be null", this.name);

		const invocation = this.new();
		if (invocation)
			invocation.$methodSignature = sig;

		return invocation;
	}

	//! The argumentLocation argument must be a value created by the @ref() directive or a runtime error will occur.
	//! @typed void : @ref, CRInteger
	setArgument_atIndex_(argumentLocation, idx) {
		// silently ignore if we are not initialized properly
		if (this.$methodSignature === null)
			return;

		if (idx >= this.$methodSignature.numberOfArguments) {
			objj_throw_arg("-[%@ setArgument:atIndex:]: index (%i) out of bounds [-1, %i]", this.className, idx, this.$methodSignature.numberOfArguments - 1);
		}

		// first two args are actually target & sel
		if (idx === 0)
			this.$target = argumentLocation[argumentLocation.name];
		else if (idx === 1)
			this.$selector = argumentLocation[argumentLocation.name];
		else if (this.$argList !== null) // safety check since we can't guarantee we were initialized properly
			this.$argList[idx] = argumentLocation[argumentLocation.name];
	}

	//! The argumentLocation argument must be a value created by the @ref() directive or a runtime error will occur.
	//! @typed void : @ref, CRInteger
	getArgument_atIndex_(argumentLocation, idx) {
		// silently ignore if we are not initialized properly
		if (this.$methodSignature === null)
			return;

		if (idx >= this.$methodSignature.numberOfArguments) {
			objj_throw_arg("-[%@ getArgumentAtIndex:]: index (%i) out of bounds [-1, %i]", this.className, idx, this.$methodSignature.numberOfArguments - 1);
		}

		if (idx === 0)
			argumentLocation[argumentLocation.name] = this.target;
		else if (idx === 1)
			argumentLocation[argumentLocation.name] = this.selector;
		else if (this.$argList !== null) // safety check since we can't guarantee we were initialized properly
			argumentLocation[argumentLocation.name] = this.$argList[idx];
	}

	//! Method is a no-op since we don't have a reasonable JS replacement. Weakmap is close, but not iterable so we can't convert from one to the other.
	//! For this reason -argumentsRetained always returns YES.
	//! @typed void : void
	retainArguments() {
	}

	//! @typed void : void
	invoke() {
		// silently ignore if we weren't set up properly
		if (this.$methodSignature === null || this.$target === null || this.$selector === null)
			return;

		// invoke and store any result, if applicable. Return value should be undefined if method has no return value
		this.$retValue = this.$target[this.$selector](...this.$argList);
	}

	//! @typed void : id
	invokeWithTarget_(aTarget) {
		this.$target = aTarget;
		this.invoke();
	}

	//! The retLoc argument must be a value created by the @ref() directive or a runtime error will occur.
	//! @typed void : @ref
	setReturnValue_(retLoc) {
		this.$retValue = retLoc[retLoc.name];
	}

	//! The retLoc argument must be a value created by the @ref() directive or a runtime error will occur.
	//! @typed void : @ref
	returnValue(retLoc) {
		retLoc[retLoc.name] = this.$retValue;
	}
}
exports.CRInvocation = CRInvocation;