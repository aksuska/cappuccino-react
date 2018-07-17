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
		const object = super.new();
		for (let i=0; i<args.length; i+=2) {
			object.$setObjectForKey(args[i+1], args[i]);
		}
		return object;
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

	//! @}

	//! @name Initializing an NSDictionary Instance
	//! @{

	//! @typed instancetype : void
	init() {
		const self = super.init();
		if (self) {
			this.$jsMap = new Map();
		}
		return self;
	}

	//! @}

	//! @name Accessing Keys and Values
	//! @{

	//! @property(readonly, copy) CRArray<id> allKeys
	get allKeys() {
		const allKeys = this.$jsMap.keys();
		return CRArray.new(allKeys);
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
		for (let pair of this.$jsMap) {
			string += `    ${pair[0].description.$jsString} = ${pair[1].description.$jsString};\n`;
		}
		return CRString.new(string+'}');
	}

	//! @}
}
exports.CRDictionary = CRDictionary;

CRDictionary.$conformsTo.push('CRCopying', 'CRMutableCopying');

const CRArraySym = require('./CRArray'), CRArray = CRArraySym.CRArray;
