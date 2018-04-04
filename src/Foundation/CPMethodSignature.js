/**
 * Implementation of NSMethodSignature. Not generally useful since there is a lot if functionality
 * we can't easily replicate. If it became necessary it might be possible to have the compiler annotate
 * inside the function declaration so as to preserve the type annotations, which would be accessible
 * via the toString() method of Function.
 **/

import {objj_throw_arg} from '../Objective-J';
import CPObject from './CPObject';

export default class CPMethodSignature extends CPObject {
	
	$$typeList = [];
	
	get methodReturnType() {return this.$$typeList[0];}
	set methodReturnType(anything) {objj_throw_arg("Assignment to readonly property");}

	get methodReturnLength() {return 1;}
	set methodReturnLength(anything) {objj_throw_arg("Assignment to readonly property");}

	get numberOfArguments() {return this.$$typeList.length - 1;}
	set numberOfArguments(anything) {objj_throw_arg("Assignment to readonly property");}

	get frameLength() {return 1;}
	set frameLength(anything) {objj_throw_arg("Assignment to readonly property");}

	static signatureWithObjCTypes_(typeString) {
		let sig = this.new();
		if (sig) {
			sig.$$typeList = typeString.split('');
		}
		return sig;
	}
	
	getArgumentTypeAtIndex_(idx) {
		if (idx >= this.$$typeList.length)
			objj_throw_arg( "-[%@ getArgumentTypeAtIndex:]: index (%i) out of bounds [0, %i]", this.className, idx, this.$$typeList.length - 1);
		
		return this.$$typeList[idx];
	}
	
	// N/A but true is usually the right answer
	isOneway() {
		return true;
	}
}
