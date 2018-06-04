/*
 * Module that contains NSArray class emulation and related symbols. We maintain a has-a relationship with a native Array object
 */

const CRObjectSym = require('./CRObject'), CRObject = CRObjectSym.CRObject;

//! NSArray Cocoa Foundation class emulation
class CRArray extends CRObject {

	$jsArray;

	// we use this a convenience constructor for shorthand conversion of literal syntax @[value1, value2, ...]
	constructor(anArray) {
		super();
		this.$jsArray = anArray.slice();
	}

	//! @property(readonly, copy) string jsArray
	//! Returns a copy of the native JS array that backs the NSArray
	get jsArray() {return this.$jsArray.slice();}

	//! @name Querying an Array
	//! @{
	//! @property(readonly) CRUInteger count
	get count() { return this.$jsArray.length}
	//! @}

	//! @typed id : null
	copyWithZone_(zone) {
		// cocoa just returns the same object, so we'll do the same
		return this;
	}
}
exports.CRArray = CRArray;

CRArray.$conformsTo.push('CRCopying', 'CRMutableCopying');
