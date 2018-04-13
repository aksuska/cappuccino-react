/*!
 * Module that contains NSMethodSignature class emulation and related symbols. Not generally useful since there is a lot of functionality
 * we can't easily replicate. If it became necessary it might be possible to have the compiler annotate inside the function declaration
 * so as to preserve the type annotations, which would be accessible via the toString() method of Function.
 **/

import {objj_throw_arg} from '../Objective-J';
import CPObject from './CPObject';

//! NSMethodSignature Cocoa Foundation class emulation
export default class CPMethodSignature extends CPObject {
	
	$$typeList = [];
	
	//! Property will always be '@' since we currently don't have a means of determining a method's return type
	//! @property(readonly) string methodReturnType
	get methodReturnType() {return this.$$typeList[0];}
	set methodReturnType(anything) {objj_throw_arg("Assignment to readonly property");}

	//! Property will always be 1 since there is no real JS equivalent
	//! @property(readonly) CPUInteger methodReturnLength
	get methodReturnLength() {return 1;}
	set methodReturnLength(anything) {objj_throw_arg("Assignment to readonly property");}

	//! @property(readonly) CPUInteger numberOfArguments
	get numberOfArguments() {return this.$$typeList.length - 1;}
	set numberOfArguments(anything) {objj_throw_arg("Assignment to readonly property");}

	//! Property will always be 1 since there is no real JS equivalent
	//! @property(readonly) CPUInteger frameLength
	get frameLength() {return 1;}
	set frameLength(anything) {objj_throw_arg("Assignment to readonly property");}

	//! @typed CPMethodSignature : string
	static signatureWithObjCTypes_(typeString) {
		let sig = this.new();
		if (sig) {
			sig.$$typeList = typeString.split('');
		}
		return sig;
	}

	//! @typed string : CPUInteger
	getArgumentTypeAtIndex_(idx) {
		if (idx >= this.$$typeList.length)
			objj_throw_arg( "-[%@ getArgumentTypeAtIndex:]: index (%i) out of bounds [0, %i]", this.className, idx, this.$$typeList.length - 1);
		
		return this.$$typeList[idx];
	}
	
	//! Currently N/A since we don't have an emulation of Distributed Objects, but always returns YES since that is usually the right answer
	//! @typed BOOL : void
	isOneway() {
		return true;
	}
}
