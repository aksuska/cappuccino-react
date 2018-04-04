'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _ObjectiveJ = require('../Objective-J');

var _ObjectiveJ2 = _interopRequireDefault(_ObjectiveJ);

var _CPObject = require('./CPObject');

var _CPObject2 = _interopRequireDefault(_CPObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Implementation of NSDictionary. We have a has-a relationship with the native Map object
 **/

class CPDictionary extends _CPObject2.default {

	// allows for shorthand conversion of literal syntax @{key: value, ...}
	constructor(...args) {
		super();
		this.$$jsMap = new Map();
		for (let i = 0; i < args.length; i += 2) {
			this._setObjectForKey(args[i + 1], args[i]);
		}
	}

	// pass through private method so we can raise exceptions when we need to
	_setObjectForKey(object, key) {
		// null key is exception
		if (key === null) (0, _ObjectiveJ.objj_throw_arg)("-[%@ setObject:forKey:]: key cannot be null", this.className);else if (object == null) (0, _ObjectiveJ.objj_throw_arg)("-[%@ setObject:forKey:]: object cannot be null (key: %@)", this.className, key);

		// we need to copy key, but there is a chance we'll get null
		const ourKey = (0, _ObjectiveJ2.default)(key, 'copyWithZone:', null);
		if (ourKey === null) (0, _ObjectiveJ.objj_throw_arg)("-[%@ setObject:forKey:]: key cannot be null", this.className);else this.$$jsMap.set(ourKey, object);
	}
}
exports.default = CPDictionary;
//# sourceMappingURL=CPDictionary.js.map