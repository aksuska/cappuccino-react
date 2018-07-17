/*
 * Module that contains NSDictionary class emulation and related symbols. We maintain a has-a relationship with a native Map object
 **/

const OBJJ = require('../Objective-J'), objj_msgSend = OBJJ.objj_msgSend, objj_initialize = OBJJ.objj_initialize;
const CRObjectSym = require('./CRObject'), CRObject = CRObjectSym.CRObject;
const CRStringSym = require('./CRString'), CRString = CRStringSym.CRString;
const CRExceptionSym = require("./CRException"), CRException = CRExceptionSym.CRException, CRInvalidArgumentException = CRExceptionSym.CRInvalidArgumentException;

//! NSDictionary Cocoa Foundation class emulation
class CRDictionary extends CRObject {

	$jsMap;
	
	// we use this a convenience constructor for object literal syntax @{key: value, ...}
	static new(...args) {
		const objects = [], keys = [];
		for (let i=0; i<args.length; i+=2) {
			keys.push(args[i]);
			objects.push(args[i+1]);
		}
		return super.alloc().initWithObjects_forKeys_count_(objects, keys, keys.length);
	}

	// pass through private method so we can raise exceptions when we need to
	$setObjectForKey(object, key) {
		// null key is exception
		if (key === null)
			objj_initialize(CRException).raise_format_(CRInvalidArgumentException, CRString.new("-[%@ setObject:forKey:]: key cannot be nil"), this.className);
		else if (object == null)
			objj_initialize(CRException).raise_format_(CRInvalidArgumentException, CRString.new("-[%@ setObject:forKey:]: object cannot be nil (key: %@)"), this.className, key);

		// we need to copy key, but there is a chance we'll get null
		const ourKey = objj_msgSend(key, 'copyWithZone:', null);
		if (ourKey === null)
			objj_initialize(CRException).raise_format_(CRInvalidArgumentException, CRString.new("-[%@ setObject:forKey:]: key cannot be nil"), this.className);
		else {
			// keys must be unique by -isEqual:, so let's see if we have one
			for (let pair of this.$jsMap) {
				if (pair[0].isEqual_(key)) {
					this.$jsMap.set(pair[0], object);
					return;
				}
			}
			// otherwise add
			this.$jsMap.set(ourKey, object);
		}
	}

	//! @name Creating a Dictionary
	//! @{

	//! @typed id : null
	copyWithZone_(zone) {
		// cocoa just returns the same object, so we'll do the same
		return this;
	}

	//! @typed id : null
	mutableCopyWithZone_(zone) {
		const dict = CRMutableDictionary.alloc().init();
		for (let key of this) {
			dict.setObject_forKey_(this.objectForKey_(key), key);
		}
		return dict;
	}

	//! @}

	//! @name Initializing an NSDictionary Instance
	//! @{

	//! @typed instancetype : void
	init() {
		return this.initWithObjects_forKeys_count_(null, null, 0);
	}

	//! @typed instancetype : CRDictionary<KeyType, id>
	initWithDictionary_(otherDictionary) {
		const objects = [], keys = [];
		for (let key of otherDictionary) {
			keys.push(key);
			objects.push(otherDictionary.objectForKey_(key));
		}
		return this.initWithObjects_forKeys_count_(objects, keys, keys.length);
	}

	//! @typed instancetype : Array<id>, Array<KeyType>, CRUInteger
	initWithObjects_forKeys_count_(objects, keys, cnt) {
		const self = super.init();
		if (self) {
			this.$jsMap = new Map();
			// call method to get iterator
			self[Symbol.iterator] = self.keyEnumerator().$iterator;
			for (let i=0; i<cnt; i++) {
				self.$setObjectForKey(objects[i], keys[i]);
			}
		}
		return self;
	}

	//! @}

	//! @name Counting Entries
	//! @{

	//! @property(readonly) CRUInteger count
	get count() {
		return this.$jsMap.size;
	}

	//! @}

	//! @name Accessing Keys and Values
	//! @{

	//! @property(readonly, copy) CRArray<id> allKeys
	get allKeys() {
		// need to use -keyEnumerator so we are consistent with Cocoa subclassing guidelines
		return this.keyEnumerator().allObjects;
	}

	//! @typed id : id
	objectForKey_(aKey) {
		for (let pair of this.$jsMap) {
			if (pair[0].isEqual_(aKey))
				return pair[1];
		}
		return null;
	}

	//! @}

	//! @name Creating a Description
	//! @{

	//! @property(readonly, copy) CRString description
	get description() {
		let string = "{\n";
		for (let key of this) {
			string += `    ${key.description.$jsString} = ${this.objectForKey_(key).description.$jsString};\n`;
		}
		return CRString.new(string+'}');
	}

	//! @}

	//! @name Instance Methods
	//! @{

	//! @typed CREnumerator : void
	keyEnumerator() {
		return CREnumerator.alloc().init(this.$jsMap.keys()[Symbol.iterator]);
	}

	//! @}
}
exports.CRDictionary = CRDictionary;

CRDictionary.$conformsTo.push('CRCopying', 'CRMutableCopying');

const CRArraySym = require('./CRArray'), CRArray = CRArraySym.CRArray;
const CRMutableDictionary = require('./CRMutableDictionary').CRMutableDictionary;
const CREnumerator = require('./CREnumerator').CREnumerator;
