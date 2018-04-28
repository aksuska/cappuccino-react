/*
 * Module that contains NSArray class emulation and related symbols. We maintain a has-a relationship with a native Array object
 **/

import objj_msgSend, {objj_throw_arg} from '../Objective-J';
import CPObject from './CPObject';

//! NSArray Cocoa Foundation class emulation
export default class CPArray extends CPObject {

	$$jsArray;

	// we use this a convenience constructor for shorthand conversion of literal syntax @[value1, value2, ...]
	constructor(anArray) {
		super();
		this.$$jsArray = anArray.slice();
	}

	//! @property(readonly, copy) string jsArray
	//! Returns a copy of the native JS array that backs the NSArray
	get jsArray() {return this.$$jsArray.slice();}

	//! @typed id : null
	copyWithZone_(zone) {
		// cocoa just returns the same object, so we'll do the same
		return this;
	}
}

CPArray.$$conformsTo.push('CPCopying', 'CPMutableCopying');
