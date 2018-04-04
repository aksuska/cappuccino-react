/**
 * Implementation of NSDictionary. We have a has-a relationship with the native Map object
 **/

import objj_msgSend, {objj_throw_arg} from '../Objective-J';
import CPObject from './CPObject';

export default class CPDictionary extends CPObject {

	$$jsMap;
	
	// allows for shorthand conversion of literal syntax @{key: value, ...}
	constructor(...args) {
		super();
		this.$$jsMap = new Map();
		for (let i=0; i<args.length; i+=2) {
			this._setObjectForKey(args[i+1], args[i]);
		}
	}

	// pass through private method so we can raise exceptions when we need to
	_setObjectForKey(object, key) {
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
			this.$$jsMap.set(ourKey, object);
	}
}