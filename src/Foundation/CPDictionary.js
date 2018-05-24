/*
 * Module that contains NSDictionary class emulation and related symbols. We maintain a has-a relationship with a native Map object
 **/

const OBJJ = require('../Objective-J'), objj_msgSend = OBJJ.objj_msgSend, objj_initialize = OBJJ.objj_initialize;
const CPObjectSym = require('./CPObject'), CPObject = CPObjectSym.CPObject;
const CPStringSym = require('./CPString'), CPString = CPStringSym.CPString;
const CPExceptionSym = require("./CPException"), CPException = CPExceptionSym.CPException, CPInvalidArgumentException = CPExceptionSym.CPInvalidArgumentException;

//! NSDictionary Cocoa Foundation class emulation
class CPDictionary extends CPObject {

	$jsMap;
	
	// we use this a convenience constructor for shorthand conversion of literal syntax @{key: value, ...}
	constructor(...args) {
		super();
		this.$jsMap = new Map();
		for (let i=0; i<args.length; i+=2) {
			this.$setObjectForKey(args[i+1], args[i]);
		}
	}

	// pass through private method so we can raise exceptions when we need to
	$setObjectForKey(object, key) {
		// null key is exception
		if (key === null)
			objj_throw_arg("-[%@ setObject:forKey:]: key cannot be null", this.className);
		else if (object == null)
			objj_throw_arg("-[%@ setObject:forKey:]: object cannot be null (key: %@)", this.className, key);

		// we need to copy key, but there is a chance we'll get null
		const ourKey = objj_msgSend(key, 'copyWithZone:', null);
		if (ourKey === null)
			objj_throw_arg("-[%@ setObject:forKey:]: key cannot be null", this.className);
		else
			this.$jsMap.set(ourKey, object);
	}

	//! @typed id : null
	copyWithZone_(zone) {
		// cocoa just returns the same object, so we'll do the same
		return this;
	}
}
exports.CPDictionary = CPDictionary;

CPDictionary.$conformsTo.push('CPCopying', 'CPMutableCopying');
