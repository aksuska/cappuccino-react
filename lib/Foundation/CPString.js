'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _ObjectiveJ = require('../Objective-J');

var _CPObject = require('./CPObject');

var _CPObject2 = _interopRequireDefault(_CPObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Implementation of NSString. We have a has-a relationship with the native JS string
 **/

const vsprintf = require("sprintf-js").vsprintf;

class CPString extends _CPObject2.default {

	// basically a convenience constructor so we can do shorthand conversions
	constructor(jsString) {
		super();
		Object.defineProperty(this, '$$jsString', {
			enumerable: true,
			writable: true,
			value: ''
		});
		if (jsString !== null && jsString !== undefined) this.$$jsString = jsString;
	}

	get jsString() {
		return this.$$jsString;
	}

	get description() {
		return this;
	}

	static string() {
		return this.alloc().initWithString_(new CPString(""));
	}

	static stringWithString_(aString) {
		return this.alloc().initWithString_(aString);
	}

	static stringWithFormat_(format, ...args) {
		return this.alloc().initWithFormat_locale_arguments_(format, null, args);
	}

	// TODO: CPLocale support: method should call [CPLocale currentLocale]
	static localizedStringWithFormat_(format, ...args) {
		return this.alloc().initWithFormat_locale_arguments_(format, null, args);
	}

	initWithString_(aString) {
		if (aString === null) {
			(0, _ObjectiveJ.objj_throw_arg)("-[%@ initWithString:]: null argument", this.className);
			return null;
		}

		let self = super.init();
		if (self) {
			self.$$jsString = aString.$$jsString;
		}
		return self;
	}

	initWithFormat_(format, ...args) {
		return this.initWithFormat_locale_arguments_(format, null, args);
	}

	initWithFormat_arguments_(format, args) {
		return this.initWithFormat_locale_arguments_(format, null, args);
	}

	// CPLocale support?
	initWithFormat_locale_(format, locale, ...args) {
		return this.initWithFormat_locale_arguments_(format, null, args);
	}

	// TODO: CPLocale support?
	initWithFormat_locale_arguments_(format, locale, args) {
		if (format === null) {
			(0, _ObjectiveJ.objj_throw_arg)("-[%@ initWithFormat:locale:arguments:]: null argument", this.className);
			return null;
		}

		let self = super.init();
		if (self) {
			// %@ will always be a string, so convert, but objects must change to description
			let formatString = format.jsString.replace(/%@/, '%s');
			let values = args.map(element => element instanceof _CPObject2.default ? (0, _ObjectiveJ.objj_propGuard)(element, 'description', 'jsString') : element);
			self.$$jsString = vsprintf(formatString, values);
		}
		return self;
	}
}
exports.default = CPString;
//# sourceMappingURL=CPString.js.map