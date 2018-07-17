/*
 * Module that contains NSArray class emulation and related symbols. We maintain a has-a relationship with a native Array object
 */

const CRObjectSym = require('./CRObject'), CRObject = CRObjectSym.CRObject;
const OBJJ = require('../Objective-J'), objj_initialize = OBJJ.objj_initialize;

//! NSArray Cocoa Foundation class emulation
class CRArray extends CRObject {

	$jsArray = null;

	// we use this a convenience constructor for shorthand conversion of literal syntax @[value1, value2, ...]
	static new(jsArray = []) {
		const object = this.alloc();
		return object.initWithObjects_count_(jsArray, jsArray.length);
	}

	//! @typed instancetype : void
	init() {
		const self = super.init();
		if (self) {
			self.$jsArray = [];
			// call method to get iterator
			self[Symbol.iterator] = self.objectEnumerator().$iterator;
		}
		return self;
	}

	//! Our implementation expects a native JavaScript array
	//! @typed instancetype : Array<id>, CRUInteger
	initWithObjects_count_(objects, cnt) {
		const self = this.init();
		if (self) {
			self.$jsArray.push(...objects.slice(0, cnt));
		}
		return self;
	}

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
			objj_initialize(CRException).raise_format_(CRRangeException, CRString.new("-[%@ objectAtIndex:]: index %d beyond bounds %s"), this.className, index, this.count > 0 ? `[0 .. ${this.count - 1}]` : "for empty CRArray");
		return this.$jsArray[index];
	}

	//! @typed CREnumerator : void
	objectEnumerator() {
		return CREnumerator.alloc().init(this.$jsArray[Symbol.iterator]);
	}

	//! @typed CREnumerator : void
	reverseObjectEnumerator() {
		const reversed = this.$jsArray.slice(0);
		reversed.reverse();
		return CREnumerator.alloc().init(reversed[Symbol.iterator]);
	}

	//! @}

	//! @typed id : null
	copyWithZone_(zone) {
		// cocoa just returns the same object, so we'll do the same
		return this;
	}
	//! @name Methods Not In Cocoa
	//! @{

	//! @property(readonly, copy) string jsArray
	//! Returns a copy of the native JS array that backs the CRArray. Subclasses must override if they use a different backing store.
	get jsArray() {return this.$jsArray.slice();}

	//! @}
}
exports.CRArray = CRArray;

CRArray.$conformsTo.push('CRCopying', 'CRMutableCopying');

const CRStringSym = require('./CRString'), CRString = CRStringSym.CRString;
const CRExceptionSym =  require('./CRException'), CRException = CRExceptionSym.CRException, CRInvalidArgumentException = CRExceptionSym.CRInvalidArgumentException, CRRangeException = CRExceptionSym.CRRangeException, CRInternalInconsistencyException = CRExceptionSym.CRInternalInconsistencyException;
const CRRangeSym = require('./CRRange'), CRMakeRange = CRRangeSym.CRMakeRange, CRMaxRange = CRRangeSym.CRMaxRange, CRNotFound = CRRangeSym.CRNotFound, CRStringFromRange = CRRangeSym.CRStringFromRange;
const CREnumerator = require('./CREnumerator').CREnumerator;
