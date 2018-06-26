/*
 * Module that contains NSArray class emulation and related symbols. We maintain a has-a relationship with a native Array object
 */

const CRObjectSym = require('./CRObject'), CRObject = CRObjectSym.CRObject;
const CRRangeSym = require('./CRRange'), CRMakeRange = CRRangeSym.CRMakeRange, CRMaxRange = CRRangeSym.CRMaxRange, CRNotFound = CRRangeSym.CRNotFound, CRStringFromRange = CRRangeSym.CRStringFromRange;
const OBJJ = require('../Objective-J'), objj_initialize = OBJJ.objj_initialize;

//! NSArray Cocoa Foundation class emulation
class CRArray extends CRObject {

	$jsArray;

	// we use this a convenience constructor for shorthand conversion of literal syntax @[value1, value2, ...]
	constructor(anArray) {
		super();
		this.$jsArray = anArray.slice();
		const array = this.$jsArray.slice();
		this[Symbol.iterator] = function* () {
			yield* array;
		}
	}

	//! @property(readonly, copy) string jsArray
	//! Returns a copy of the native JS array that backs the NSArray
	get jsArray() {return this.$jsArray.slice();}

	//! @name Querying an Array
	//! @{

	//! @typed BOOL : id
	containsObject_(anObject) {
		for (let object of this) {
			if (object.isEqual(anObject)) {
				return true;
			}
		}
		return false;
	}

	//! @property(readonly) CRUInteger count
	get count() { return this.$jsArray.length}

	//! @typed id : CRUInteger
	objectAtIndex_(index) {
		if (index >= this.count || index < 0)
			objj_initialize(CRException).raise_format_(CRRangeException, new CRString("-[%@ objectAtIndex:]: index %d beyond bounds %s"), this.className, index, this.count > 0 ? `[0 .. ${this.count - 1}]` : "for empty CRArray");
		return this.$jsArray[index];
	}

	//! @}

	//! @typed id : null
	copyWithZone_(zone) {
		// cocoa just returns the same object, so we'll do the same
		return this;
	}
}
exports.CRArray = CRArray;

CRArray.$conformsTo.push('CRCopying', 'CRMutableCopying');

const CRStringSym = require('./CRString'), CRString = CRStringSym.CRString;
const CRExceptionSym =  require('./CRException'), CRException = CRExceptionSym.CRException, CRInvalidArgumentException = CRExceptionSym.CRInvalidArgumentException, CRRangeException = CRExceptionSym.CRRangeException, CRInternalInconsistencyException = CRExceptionSym.CRInternalInconsistencyException;
