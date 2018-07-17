/*
 * Module that contains NSEnumerator class emulation and related symbols. We basically just wrap an iterator.
 */

const CRObject = require('./CRObject').CRObject;

class CREnumerator extends CRObject {

	$iterator = null;

	init(iterator) {
		const self = super.init();
		if (self) {
			self.$iterator = iterator;
		}
		return self;
	}

	//! @name Getting the Enumerated Objects
	//! @{

	//! @property(readonly, copy) CRArray<id> allObjects
	get allObjects() {
		const remainder = [];
		for (let object = this.nextObject(); object !== null; ) {
			remainder.push(object);

		}
		return CRArray.new(remainder);
	}

	//! @typed id : void
	nextObject() {
		const result = this.$iterator.next();
		if (result.done === false) {
			return result.value;
		}
		return null;
	}

	//! @}

}
exports.CREnumerator = CREnumerator;

const CRArray = require('./CRArray').CRArray;
