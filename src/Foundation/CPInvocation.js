/**
 * Implementation of NSInvocation.
 **/

import {objj_throw_arg} from '../Objective-J';
import CPObject from './CPObject';

export default class CPInvocation extends CPObject {

	$$selector = null;
	$$target = null;
	$$methodSignature = null;
	$$argList = [];
	$$retValue;
	
	get selector() {return this.$$selector;}
	set selector(aSelector) {this.$$selector = aSelector;}

	get target () {return this.$$target;}
	set target(aTarget) {this.$$target = aTarget;}

	get methodSignature() {return this.$$methodSignature;}
	set methodSignature(anything) {objj_throw_arg("Assignment to readonly property");}

	// will always return true. See retainArguments() for more information
	get argumentsRetained() {return true;}
	set argumentsRetained(anything) {objj_throw_arg("Assignment to readonly property");}

	static invocationWithMethodSignature_(sig) {
		// exception if signature null
		if (sig === null)
			objj_throw_arg("+[%s _invocationWithMethodSignature:frame:]: method signature argument cannot be null", this.name);

		const invocation = this.new();
		if (invocation)
			invocation.$$methodSignature = sig;

		return invocation;
	}

	setArgument_atIndex_(argumentLocation, idx) {
		// silently ignore if we are not initialized properly
		if (this.$$methodSignature === null)
			return;

		if (idx >= this.$$methodSignature.numberOfArguments) {
			objj_throw_arg("-[%@ setArgument:atIndex:]: index (%i) out of bounds [-1, %i]", this.className, idx, this.$$methodSignature.numberOfArguments - 1);
		}

		// first two args are actually target & sel
		if (idx === 0)
			this.$$target = argumentLocation;
		else if (idx === 1)
			this.$$selector = argumentLocation;
		else if (this.$$argList !== null) // safety check since we can't guarantee we were initialized properly
			this.$$argList[idx] = argumentLocation;
	}

	// JS doesn't support pass-by-reference, so we can't implement getArgument:atIndex:
	getArgumentAtIndex_(idx) {
		// silently ignore if we are not initialized properly
		if (this.$$methodSignature === null)
			return;

		if (idx >= this.$$methodSignature.numberOfArguments) {
			objj_throw_arg("-[%@ getArgumentAtIndex:]: index (%i) out of bounds [-1, %i]", this.className, idx, this.$$methodSignature.numberOfArguments - 1);
		}

		if (idx === 0)
			return this.target;
		else if (idx === 1)
			return this.selector;
		else if (this.$$argList !== null) // safety check since we can't guarantee we were initialized properly
			return this.$$argList[idx];
	}

	retainArguments() {
		// this is basically a no-op since we don't have a reasonable JS replacement. Weakmap is close, but no iterable
		// so we can't convert from one to the other
	}

	invoke() {
		// silently ignore if we weren't set up properly
		if (this.$$methodSignature === null || this.$$target === null || this.$$selector === null)
			return;

		// invoke and store any result, if applicable. Return value should be undefined if method has no return value
		this.$$retValue = this.$$target[this.$$selector](...this.$$argList);
	}

	invokeWithTarget_(aTarget) {
		this.$$target = aTarget;
		this.invoke();
	}

	// JS cannot pass by reference so this should be the value
	setReturnValue_(buffer) {
		this.$$retValue = buffer;
	}
	
	// JS cannot pass by reference so tso we can't implement getReturnValue:
	returnValue() {
		return this.$$retValue;
	}
}
