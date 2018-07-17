/*
 * Module that contains NSMutableDictionary class emulation and related symbols.
 **/

const CRDictionarySym = require('./CRDictionary'), CRDictionary = CRDictionarySym.CRDictionary;
const OBJJ = require('../Objective-J'), objj_initialize = OBJJ.objj_initialize;
const CRStringSym = require('./CRString'), CRString = CRStringSym.CRString;
const CRExceptionSym = require("./CRException"), CRException = CRExceptionSym.CRException, CRInvalidArgumentException = CRExceptionSym.CRInvalidArgumentException;

class CRMutableDictionary extends CRDictionary {

	//! @name Creating and Initializing a Mutable Dictionary
	//! @{

	//! initialization with capacity hint has no useful JS corollary, so we just include for completeness
	//! @typed instancetype : CRUInteger
	static dictionaryWithCapacity_(numItems) {
		return this.alloc().initWithCapacity_(numItems);
	}

	//! initialization with capacity hint has no useful JS corollary, so we just include for completeness
	//! @typed instancetype : CRUInteger
	initWithCapacity_(numItems) {
		return this.init();
	}

	//! @typed id : null
	copyWithZone_(zone) {
		// we have to override as we need to return an (immutable) actual copy
		return CRDictionary.alloc().initWithDictionary_(this);
	}

	//! @}

	//! @name Adding Entries to a Mutable Dictionary
	//! @{

	//! @typed void : id, id<CRCopying>
	setObject_forKey_(anObject, aKey) {
		this.$setObjectForKey(anObject, aKey);
	}

	//! @typed void : id, CRString
	setValue_forKey_(value, key) {
		if (value !== null)
			this.setObject_forKey_(value, key);
		else
			this.removeObjectForKey_(key);
	}

	//! @typed void : CRDictionary<KeyType, id>
	addEntriesFromDictionary_(otherDictionary) {
		// Cocoa ignores nil
		if (otherDictionary === null)
			return;

		for (let key of otherDictionary) {
			this.setObject_forKey_(otherDictionary.objectForKey_(key), key);
		}
	}

	//! @typed void : CRDictionary<KeyType, id>
	setDictionary_(otherDictionary) {
		this.removeAllObjects();
		this.addEntriesFromDictionary_(otherDictionary);
	}

	//! @}

	//! @name Removing Entries From a Mutable Dictionary
	//! @{

	//! @typed void : KeyType
	removeObjectForKey_(aKey) {
		if (aKey === null)
			objj_initialize(CRException).raise_format_(CRInvalidArgumentException, CRString.new("-[%@ removeObjectForKey:]: key cannot be nil"), this.className);

		// we compare using -isEqual
		for (let pair of this.$jsMap) {
			if (pair[0].isEqual_(aKey)) {
				this.$jsMap.delete(pair[0]);
				break;
			}
		}
	}

	//! @typed void
	removeAllObjects() {
		// calling clear() on the Map would be more performant, but we do it this way since Cocoa expects it (-removeObjectForKey: is the primitive operative method)
		for (let pair of this.$jsMap) {
			this.removeObjectForKey_(pair[0]);
		}
	}

	//! @typed void : CRArray<KeyType>
	removeObjectsForKeys_(keyArray) {
		for (let key of keyArray) {
			this.removeObjectForKey_(key);
		}
	}

	//! @}

}
exports.CRMutableDictionary = CRMutableDictionary;

